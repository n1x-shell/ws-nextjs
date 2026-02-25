'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { HYBRIDS_TRACKS, getHybridsTrack as getTrack } from '@/lib/tracks';
import { audioEngine } from '@/lib/audioEngine';
import { eventBus } from '@/lib/eventBus';
import { isAudioUnlocked, setAudioUnlocked } from '@/lib/audioUnlock';

// ── PlayOverlay ───────────────────────────────────────────────────────────────

function PlayOverlay({ onPlay }: { onPlay: () => void }) {
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);

  const handle = useCallback(() => {
    if (fading || gone) return;
    setFading(true);
    onPlay();
    setTimeout(() => setGone(true), 400);
  }, [fading, gone, onPlay]);

  if (gone) return null;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handle(); }}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handle(); }}
      style={{
        position:        'absolute',
        inset:           0,
        zIndex:          100,
        background:      'rgba(0,0,0,0.45)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          'pointer',
        opacity:         fading ? 0 : 1,
        transition:      'opacity 0.4s ease',
        userSelect:      'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div
        style={{
          width:        '5rem',
          height:       '5rem',
          borderRadius: '50%',
          border:       '2px solid var(--phosphor-green)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          boxShadow:    '0 0 24px rgba(0,255,65,0.3)',
        }}
      >
        <div
          style={{
            width:       0,
            height:      0,
            borderTop:   '1rem solid transparent',
            borderBottom:'1rem solid transparent',
            borderLeft:  '1.6rem solid var(--phosphor-green)',
            marginLeft:  '0.3rem',
          }}
        />
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TouchOrigin {
  x: number;
  y: number;
  time: number;
  zone: 'video' | 'panel';
}

// ── Module-level unlock state — persists across remounts this session ─────────
// audio unlock state is shared via lib/audioUnlock

// ── HybridsPlayer ─────────────────────────────────────────────────────────────

export default function HybridsPlayer() {
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [lyricsOpen, setLyricsOpen]         = useState(false);
  const [muted, setMuted]                   = useState(true);
  const [transitioning, setTransitioning]   = useState(false);
  const [audioUnlocked, setAudioUnlockedState]   = useState(isAudioUnlocked);

  const playerRef   = useRef<any>(null);
  const touchOrigin = useRef<TouchOrigin | null>(null);
  const lastMuteToggle = useRef(0);

  const track = getTrack(currentIndex);

  // ── Poll until mux-player has loaded the new stream, then play ───────────────
  const playWhenReady = useCallback(() => {
    const attempt = (tries = 0) => {
      const muxEl = document.querySelector('mux-player') as any;
      if (!muxEl) {
        if (tries < 20) setTimeout(() => attempt(tries + 1), 100);
        return;
      }
      muxEl.muted = false;
      if (muxEl.readyState >= 3) {
        muxEl.play?.().catch(() => {});
      } else if (tries < 30) {
        setTimeout(() => attempt(tries + 1), 100);
      } else {
        muxEl.play?.().catch(() => {});
      }
    };
    attempt();
  }, []);

  // ── Navigate tracks ────────────────────────────────────────────────────────

  const goToTrack = useCallback((newIndex: number) => {
    const normalised = ((newIndex % HYBRIDS_TRACKS.length) + HYBRIDS_TRACKS.length) % HYBRIDS_TRACKS.length;
    if (normalised === currentIndex) return;
    setTransitioning(true);
    setLyricsOpen(false);
    setTimeout(() => {
      setCurrentIndex(normalised);
      audioEngine.notifyTrackChange(normalised + 1, HYBRIDS_TRACKS[normalised].displayTitle);
      setTransitioning(false);
      if (isAudioUnlocked()) {
        playWhenReady();
      }
    }, 200);
  }, [currentIndex]);

  const nextTrack = useCallback(() => goToTrack(currentIndex + 1), [goToTrack, currentIndex]);
  const prevTrack = useCallback(() => goToTrack(currentIndex - 1), [goToTrack, currentIndex]);

  const handleGateUnlock = useCallback(() => {
    setAudioUnlocked();
    lastMuteToggle.current = Date.now();
    setAudioUnlockedState(true);
    setMuted(false);
    audioEngine.setMuted(false);
    eventBus.emit('audio:user-gesture');

    const tryUnmute = () => {
      const muxEl = document.querySelector('mux-player') as any;
      if (muxEl) {
        muxEl.muted = false;
        muxEl.play?.().catch(() => {});
      } else {
        setTimeout(tryUnmute, 100);
      }
    };
    tryUnmute();
  }, []);

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

  // ── Auto-play on mount if audio was already unlocked this session ──────────
  useEffect(() => {
    if (!isAudioUnlocked()) return;
    setMuted(false);
    audioEngine.setMuted(false);
    setTimeout(() => playWhenReady(), 150);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── EventBus: shell commands ───────────────────────────────────────────────

  useEffect(() => {
    const unsub = eventBus.on('audio:command', (event: any) => {
      const { action, value } = event.payload ?? {};
      switch (action) {
        case 'next':    nextTrack();                       break;
        case 'prev':    prevTrack();                       break;
        case 'goto':
          if (typeof value === 'number') goToTrack(value); break;
        case 'pause':   audioEngine.pause();               break;
        case 'resume':  audioEngine.resume();              break;
        case 'mute':    audioEngine.setMuted(true);  setMuted(true);  break;
        case 'unmute':  audioEngine.setMuted(false); setMuted(false); break;
        case 'volume':
          if (typeof value === 'number') audioEngine.setVolume(value / 100);
          break;
      }
    });
    return unsub;
  }, [nextTrack, prevTrack]);

  // ── Connect AudioEngine when player mounts / track changes ────────────────

  useEffect(() => {
    const tryConnect = () => {
      const muxEl = document.querySelector('mux-player') as any;
      let videoEl: HTMLVideoElement | null = null;

      if (muxEl?.shadowRoot) {
        videoEl = muxEl.shadowRoot.querySelector('video');
      }
      if (!videoEl) {
        const inner = muxEl?.shadowRoot?.querySelector('mux-player-theme, media-theme');
        videoEl = inner?.shadowRoot?.querySelector('video') ?? null;
      }
      if (!videoEl && muxEl) {
        videoEl = muxEl.media?.nativeEl ?? muxEl.nativeEl ?? null;
      }

      if (videoEl) {
        audioEngine.connect(videoEl, track.index, track.displayTitle);
      }
    };
    tryConnect();
    const t = setTimeout(tryConnect, 300);
    return () => clearTimeout(t);
  }, [currentIndex, track.index, track.displayTitle]);

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

  // ── Touch handlers ────────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent, zone: 'video' | 'panel') => {
    touchOrigin.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
      zone,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchOrigin.current) return;
    const origin = touchOrigin.current;
    touchOrigin.current = null;

    const dy = e.changedTouches[0].clientY - origin.y;
    const dx = e.changedTouches[0].clientX - origin.x;
    const dt = Date.now() - origin.time;
    const absDy = Math.abs(dy);
    const absDx = Math.abs(dx);

    if (absDy < 50 || absDx > absDy || dt > 500) return;

    if (origin.zone === 'panel') {
      if (dy < 0) setLyricsOpen(true);
      else        setLyricsOpen(false);
    } else {
      if (dy < 0) nextTrack();
      else        prevTrack();
    }
  }, [nextTrack, prevTrack]);

  // ── Toggle mute on video tap ──────────────────────────────────────────────

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
    <div
      style={{
        flex: '1 1 0%',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!audioUnlocked && <PlayOverlay onPlay={handleGateUnlock} />}

      <div
        style={{
          position: 'relative',
          height: '100%',
          aspectRatio: '9/16',
          maxWidth: '100%',
          overflow: 'hidden',
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
        onTouchStart={(e) => handleTouchStart(e, 'video')}
        onTouchEnd={handleTouchEnd}
        onClick={handleVideoTap}
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={track.playbackId}
          loop={false}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            '--controls':               'none',
            '--media-primary-color':    'var(--phosphor-green)',
            '--media-background-color': '#000',
          } as any}
        />

        {muted && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '0.75rem',
              fontSize: '0.65rem',
              color: 'var(--phosphor-green)',
              opacity: 0.5,
              pointerEvents: 'none',
              fontFamily: 'inherit',
              letterSpacing: '0.05em',
            }}
          >
            MUTED · TAP
          </div>
        )}

        {/* Track counter */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '0.75rem',
            fontSize: '0.65rem',
            color: 'var(--phosphor-green)',
            opacity: 0.5,
            pointerEvents: 'none',
            fontFamily: 'inherit',
            letterSpacing: '0.08em',
          }}
        >
          {String(track.index).padStart(2, '0')} / {String(HYBRIDS_TRACKS.length).padStart(2, '0')}
        </div>

        {/* Stream label */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.55rem',
            color: 'var(--phosphor-green)',
            opacity: 0.35,
            pointerEvents: 'none',
            fontFamily: 'inherit',
            letterSpacing: '0.12em',
          }}
        >
          HYBRIDS
        </div>

        {/* ── Lyrics panel ─────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '82%',
            transform: `translateY(${panelTranslate})`,
            transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(51,255,51,0.35)',
          }}
          onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'panel'); }}
          onTouchEnd={(e)   => { e.stopPropagation(); handleTouchEnd(e); }}
        >
          {/* Panel header */}
          <div
            style={{
              flexShrink: 0,
              height: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.75rem',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); setLyricsOpen(o => !o); }}
          >
            <span
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--phosphor-green)',
                fontFamily: 'inherit',
                letterSpacing: '0.06em',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100% - 5rem)',
              }}
            >
              {track.displayTitle}
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                color: 'var(--phosphor-green)',
                opacity: 0.4,
                flexShrink: 0,
                fontFamily: 'inherit',
                letterSpacing: '0.08em',
                marginRight: '0.5rem',
              }}
            >
              {String(track.index).padStart(2, '0')}/{String(HYBRIDS_TRACKS.length).padStart(2, '0')}
            </span>
            <span
              style={{
                fontSize: '1rem',
                color: 'var(--phosphor-green)',
                opacity: 0.7,
                flexShrink: 0,
                userSelect: 'none',
                transform: lyricsOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease',
                display: 'inline-block',
              }}
            >
              ↑
            </span>
          </div>

          {/* Scrollable lyrics */}
          <div
            style={{
              flex: '1 1 0%',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0.5rem 1rem 2rem',
              WebkitOverflowScrolling: 'touch',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {track.lyrics ? (
              <pre
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'var(--text-base)',
                  color: 'var(--phosphor-green)',
                  opacity: 0.85,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {track.lyrics}
              </pre>
            ) : (
              <div
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'var(--text-base)',
                  color: 'var(--phosphor-green)',
                  opacity: 0.3,
                  lineHeight: 1.8,
                  fontStyle: 'italic',
                  marginTop: '0.5rem',
                }}
              >
                [lyrics pending calibration]
              </div>
            )}
          </div>
        </div>

        {/* Swipe hints */}
        {!lyricsOpen && (
          <div
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              opacity: 0.25,
              pointerEvents: 'none',
              fontSize: '0.7rem',
              color: 'var(--phosphor-green)',
              fontFamily: 'inherit',
            }}
          >
            <span>▲</span>
            <span>▼</span>
          </div>
        )}
      </div>
    </div>
  );
}
