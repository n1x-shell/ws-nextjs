'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { TRACKS, getTrack } from '@/lib/tracks';
import { audioEngine } from '@/lib/audioEngine';
import { eventBus } from '@/lib/eventBus';
import { isAudioUnlocked, setAudioUnlocked } from '@/lib/audioUnlock';
import { PlayOverlay } from './PlayOverlay';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TouchOrigin {
  x: number; y: number; time: number; zone: 'video' | 'panel';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMuxEl(wrapper: HTMLDivElement | null): any {
  return wrapper?.querySelector('mux-player') ?? null;
}

function getVideoEl(muxEl: any): HTMLVideoElement | null {
  if (!muxEl) return null;
  if (muxEl.shadowRoot) {
    const v = muxEl.shadowRoot.querySelector('video');
    if (v) return v;
    const inner = muxEl.shadowRoot.querySelector('mux-player-theme, media-theme');
    const v2 = inner?.shadowRoot?.querySelector('video');
    if (v2) return v2;
  }
  return muxEl.media?.nativeEl ?? muxEl.nativeEl ?? null;
}

// Off-screen but NOT display:none — hls.js keeps buffering regardless of visibility.
// 1×1 pixel, opacity 0, pointer-events none. Costs ~zero layout, ~zero paint.
const PRELOAD_STYLE: React.CSSProperties = {
  position: 'fixed', left: '-2px', top: '-2px',
  width: '1px', height: '1px',
  opacity: 0, pointerEvents: 'none', overflow: 'hidden',
};

// ── SyntheticsPlayer ──────────────────────────────────────────────────────────

export default function SyntheticsPlayer() {
  const [currentIndex,   setCurrentIndex]      = useState(0);
  const [lyricsOpen,     setLyricsOpen]        = useState(false);
  const [muted,          setMuted]             = useState(true);
  const [transitioning,  setTransitioning]     = useState(false);
  const [audioUnlocked,  setAudioUnlockedState] = useState(false);

  const touchOrigin     = useRef<TouchOrigin | null>(null);
  const lastMuteToggle  = useRef(0);
  const currentIndexRef = useRef(currentIndex);
  // One ref per track — lets us scope querySelector to the right player element.
  const wrapperRefs     = useRef<(HTMLDivElement | null)[]>(TRACKS.map(() => null));
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const track = getTrack(currentIndex);

  // ── Play active player, polling until hls.js has buffered enough ───────────

  const playWhenReady = useCallback((idx: number) => {
    const attempt = (tries = 0) => {
      const muxEl = getMuxEl(wrapperRefs.current[idx]);
      if (!muxEl) {
        if (tries < 20) setTimeout(() => attempt(tries + 1), 100);
        return;
      }
      muxEl.muted = false;
      if (muxEl.readyState >= 3) {
        muxEl.play?.().catch(() => {});
      } else if (tries < 40) {
        setTimeout(() => attempt(tries + 1), 75);
      } else {
        muxEl.play?.().catch(() => {});
      }
    };
    attempt();
  }, []);

  // ── Navigate ──────────────────────────────────────────────────────────────

  const goToTrack = useCallback((newIndex: number, keepLyrics = false) => {
    const n = ((newIndex % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (n === currentIndexRef.current) return;

    // Pause outgoing so it doesn't keep playing off-screen.
    getMuxEl(wrapperRefs.current[currentIndexRef.current])?.pause?.();

    setTransitioning(true);
    if (!keepLyrics) setLyricsOpen(false);

    setTimeout(() => {
      setCurrentIndex(n);
      if (lyricsScrollRef.current) lyricsScrollRef.current.scrollTop = 0;
      audioEngine.notifyTrackChange(n + 1, TRACKS[n].displayTitle);
      setTransitioning(false);

      // Mute all non-active players imperatively so React prop changes don't interfere
      wrapperRefs.current.forEach((wrapper, idx) => {
        const el = getMuxEl(wrapper);
        if (el) el.muted = idx !== n;
      });
      if (isAudioUnlocked()) {
        playWhenReady(n);
        const videoEl = getVideoEl(getMuxEl(wrapperRefs.current[n]));
        if (videoEl) audioEngine.connect(videoEl, TRACKS[n].index, TRACKS[n].displayTitle);
      }
    }, 200);
  }, [playWhenReady]);

  const nextTrack = useCallback(() => goToTrack(currentIndexRef.current + 1), [goToTrack]);
  const prevTrack = useCallback(() => goToTrack(currentIndexRef.current - 1), [goToTrack]);

  // ── Gate unlock ───────────────────────────────────────────────────────────

  const handleGateUnlock = useCallback(() => {
    setAudioUnlocked();
    lastMuteToggle.current = Date.now();
    setAudioUnlockedState(true);
    setMuted(false);
    audioEngine.setMuted(false);
    eventBus.emit('audio:user-gesture');
    playWhenReady(currentIndexRef.current);
  }, [playWhenReady]);

  useEffect(() => {
    const unsub = eventBus.on('audio:user-gesture', () => {
      setAudioUnlocked();
      setAudioUnlockedState(true);
      setMuted(false);
      audioEngine.setMuted(false);
      audioEngine.resume();
    });
    return unsub;
  }, []);

  // Auto-play on mount if already unlocked (returning to this stream).
  useEffect(() => {
    if (!isAudioUnlocked()) return;
    setMuted(false);
    audioEngine.setMuted(false);
    setTimeout(() => playWhenReady(0), 200);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Connect AudioEngine to active <video> ─────────────────────────────────

  useEffect(() => {
    const tryConnect = () => {
      const videoEl = getVideoEl(getMuxEl(wrapperRefs.current[currentIndex]));
      if (videoEl) audioEngine.connect(videoEl, track.index, track.displayTitle);
    };
    tryConnect();
    const t = setTimeout(tryConnect, 400);
    return () => clearTimeout(t);
  }, [currentIndex, track.index, track.displayTitle]);

  // ── Shell commands ────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = eventBus.on('audio:command', (event: any) => {
      const { action, value } = event.payload ?? {};
      switch (action) {
        case 'next':   nextTrack(); break;
        case 'prev':   prevTrack(); break;
        case 'goto':   if (typeof value === 'number') goToTrack(value); break;
        case 'pause':  audioEngine.pause(); break;
        case 'resume': audioEngine.resume(); break;
        case 'mute':   audioEngine.setMuted(true);  setMuted(true);  break;
        case 'unmute': audioEngine.setMuted(false); setMuted(false); break;
        case 'volume': if (typeof value === 'number') audioEngine.setVolume(value / 100); break;
      }
    });
    return unsub;
  }, [nextTrack, prevTrack, goToTrack]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      if (e.key === 'ArrowUp')   { e.preventDefault(); nextTrack(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); prevTrack(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextTrack, prevTrack]);

  // ── Touch ─────────────────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent, zone: 'video' | 'panel') => {
    touchOrigin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now(), zone };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchOrigin.current) return;
    const o = touchOrigin.current;
    touchOrigin.current = null;
    const dy = e.changedTouches[0].clientY - o.y;
    const dx = e.changedTouches[0].clientX - o.x;
    const dt = Date.now() - o.time;
    if (Math.abs(dy) < 50 || Math.abs(dx) > Math.abs(dy) || dt > 500) return;
    if (o.zone === 'panel') {
      if (dy < 0) setLyricsOpen(true); else setLyricsOpen(false);
    } else {
      if (dy < 0) nextTrack(); else prevTrack();
    }
  }, [nextTrack, prevTrack]);

  const handleVideoTap = useCallback(() => {
    const now = Date.now();
    if (now - lastMuteToggle.current < 1000) return;
    lastMuteToggle.current = now;
    const newMuted = !muted;
    setMuted(newMuted);
    audioEngine.setMuted(newMuted);
    audioEngine.resume();
  }, [muted]);

  // ── Render ────────────────────────────────────────────────────────────────

  const panelTranslate = lyricsOpen ? '0%' : 'calc(100% - 3rem)';

  return (
    <div style={{
      flex: '1 1 0%', minHeight: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', position: 'relative', overflow: 'hidden',
    }}>
      {!audioUnlocked && (
        <PlayOverlay
          onPlay={handleGateUnlock}
          line1="⚠ SYNTHETIC TRANSMISSION"
          line2="AUGMENTED CONSCIOUSNESS EXPORT"
          line3="FREQ: 33hz // SUBSTRATE: ACTIVE"
        />
      )}

      {/* ── Persistent player pool — ALL tracks rendered, only active is visible ── */}
      {TRACKS.map((t, i) => (
        <div
          key={t.playbackId}
          ref={el => { wrapperRefs.current[i] = el; }}
          style={i === currentIndex ? {
            position: 'relative', height: '100%',
            aspectRatio: '9/16', maxWidth: '100%', overflow: 'hidden',
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.2s ease',
          } : PRELOAD_STYLE}
        >
          <MuxPlayer
            playbackId={t.playbackId}
            loop={false}
            playsInline
            onEnded={() => { if (i === currentIndexRef.current) goToTrack(currentIndexRef.current + 1, true); }}
            style={{
              width: '100%', height: '100%',
              '--controls': 'none',
              '--media-primary-color': 'var(--phosphor-green)',
              '--media-background-color': '#000',
            } as any}
          />
        </div>
      ))}

      {/* ── Controls overlay — pointer-events threaded carefully ─────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

        {/* Touch + tap capture for video area */}
        <div
          style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
          onTouchStart={(e) => handleTouchStart(e, 'video')}
          onTouchEnd={handleTouchEnd}
          onClick={handleVideoTap}
        />

        {/* Mute indicator */}
        {muted && (
          <div style={{
            position: 'absolute', top: '1rem', right: '0.75rem',
            fontSize: '0.65rem', color: 'var(--phosphor-green)',
            opacity: 0.5, pointerEvents: 'none',
            fontFamily: 'inherit', letterSpacing: '0.05em',
          }}>
            MUTED · TAP
          </div>
        )}

        {/* Track counter */}
        <div style={{
          position: 'absolute', top: '1rem', left: '0.75rem',
          fontSize: '0.65rem', color: 'var(--phosphor-green)',
          opacity: 0.5, pointerEvents: 'none',
          fontFamily: 'inherit', letterSpacing: '0.08em',
        }}>
          {String(track.index).padStart(2, '0')} / {String(TRACKS.length).padStart(2, '0')}
        </div>

        {/* Swipe hints */}
        {!lyricsOpen && (
          <div style={{
            position: 'absolute', right: '0.6rem', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '0.35rem',
            opacity: 0.25, pointerEvents: 'none',
            fontSize: '0.7rem', color: 'var(--phosphor-green)', fontFamily: 'inherit',
          }}>
            <span>▲</span>
            <span>▼</span>
          </div>
        )}

        {/* Lyrics panel */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '82%',
            transform: `translateY(${panelTranslate})`,
            transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            display: 'flex', flexDirection: 'column',
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(var(--phosphor-rgb),0.35)',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'panel'); }}
          onTouchEnd={(e)   => { e.stopPropagation(); handleTouchEnd(e); }}
        >
          <div
            style={{
              flexShrink: 0, height: '3rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.75rem', cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); setLyricsOpen(o => !o); }}
          >
            <span style={{
              fontSize: 'var(--text-base)', color: 'var(--phosphor-green)',
              fontFamily: 'inherit', letterSpacing: '0.06em', fontWeight: 'bold',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 2rem)',
            }}>
              {track.displayTitle}
            </span>
            <span style={{
              fontSize: '1rem', color: 'var(--phosphor-green)', opacity: 0.7,
              flexShrink: 0, userSelect: 'none',
              transform: lyricsOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease', display: 'inline-block',
            }}>
              ↑
            </span>
          </div>
          <div
            style={{
              flex: '1 1 0%', overflowY: 'auto', overflowX: 'hidden',
              padding: '0.5rem 1rem 2rem',
              WebkitOverflowScrolling: 'touch',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <pre style={{
              fontFamily: 'inherit', fontSize: 'var(--text-base)',
              color: 'var(--phosphor-green)', opacity: 0.85,
              lineHeight: 1.8, whiteSpace: 'pre-wrap',
              wordBreak: 'break-word', margin: 0,
            }}>
              {track.lyrics}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
