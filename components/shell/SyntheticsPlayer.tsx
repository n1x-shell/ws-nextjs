'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { TRACKS, getTrack } from '@/lib/tracks';
import { audioEngine } from '@/lib/audioEngine';
import { eventBus } from '@/lib/eventBus';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TouchOrigin {
  x: number;
  y: number;
  time: number;
  zone: 'video' | 'panel';
}

// ── SyntheticsPlayer ──────────────────────────────────────────────────────────

export default function SyntheticsPlayer() {
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [lyricsOpen, setLyricsOpen]         = useState(false);
  const [muted, setMuted]                   = useState(true);
  const [transitioning, setTransitioning]   = useState(false);

  const playerRef   = useRef<any>(null);
  const touchOrigin = useRef<TouchOrigin | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const track = getTrack(currentIndex);

  // ── Navigate tracks ────────────────────────────────────────────────────────

  const goToTrack = useCallback((newIndex: number) => {
    const normalised = ((newIndex % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (normalised === currentIndex) return;
    setTransitioning(true);
    setLyricsOpen(false);
    setTimeout(() => {
      setCurrentIndex(normalised);
      audioEngine.notifyTrackChange(normalised + 1, TRACKS[normalised].displayTitle);
      setTransitioning(false);
    }, 200);
  }, [currentIndex]);

  const nextTrack = useCallback(() => goToTrack(currentIndex + 1), [goToTrack, currentIndex]);
  const prevTrack = useCallback(() => goToTrack(currentIndex - 1), [goToTrack, currentIndex]);

  // ── EventBus: shell commands ───────────────────────────────────────────────

  useEffect(() => {
    const unsub = eventBus.on('audio:command', (event: any) => {
      const { action, value } = event.payload ?? {};
      switch (action) {
        case 'next':    nextTrack();                       break;
        case 'prev':    prevTrack();                       break;
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
    if (!playerRef.current) return;
    // MuxPlayer exposes the underlying media element via .media or querySelector
    const tryConnect = () => {
      const el = playerRef.current as any;
      let videoEl: HTMLVideoElement | null = null;
      if (el?.media?.nativeEl) {
        videoEl = el.media.nativeEl;
      } else if (el?.nativeEl) {
        videoEl = el.nativeEl;
      } else {
        // Fallback: query DOM
        const wrapper = el as HTMLElement;
        videoEl = wrapper?.querySelector?.('video') ?? null;
      }
      if (videoEl) {
        audioEngine.connect(videoEl, track.index, track.displayTitle);
      }
    };
    // MuxPlayer hydrates async — try immediately and again after tick
    tryConnect();
    const t = setTimeout(tryConnect, 300);
    return () => clearTimeout(t);
  }, [currentIndex, track.index, track.displayTitle]);

  // ── Keyboard nav (when player is focused, not input) ──────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only intercept when nothing with meaningful input is focused
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

    // Must be predominantly vertical, fast enough, and exceed threshold
    if (absDy < 50 || absDx > absDy || dt > 500) return;

    if (origin.zone === 'panel') {
      // Swipe up on panel → open, swipe down → close
      if (dy < 0) setLyricsOpen(true);
      else        setLyricsOpen(false);
    } else {
      // Swipe up on video → next track, swipe down → prev track
      if (dy < 0) nextTrack();
      else        prevTrack();
    }
  }, [nextTrack, prevTrack]);

  // ── Toggle mute on video tap (not panel) ─────────────────────────────────

  const handleVideoTap = useCallback(() => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioEngine.setMuted(newMuted);
    // Resume AudioContext on first user gesture
    audioEngine.resume();
  }, [muted]);

  // ── Render ────────────────────────────────────────────────────────────────

  const panelTranslate = lyricsOpen ? '0%' : 'calc(100% - 3rem)';

  return (
    <div
      ref={containerRef}
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
      {/* ── Video area ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          // Keep 9:16 aspect ratio, max out on available height
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
          autoPlay="muted"
          muted={muted}
          loop={false}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            '--controls':           'none',
            '--media-primary-color': 'var(--phosphor-green)',
            '--media-background-color': '#000',
          } as React.CSSProperties}
        />

        {/* Mute indicator flash */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '0.75rem',
            fontSize: '0.65rem',
            color: 'var(--phosphor-green)',
            opacity: 0.6,
            pointerEvents: 'none',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
          }}
        >
          {muted ? 'MUTED · TAP' : ''}
        </div>

        {/* Track counter top-left */}
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
          {String(track.index).padStart(2, '0')} / {String(TRACKS.length).padStart(2, '0')}
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
          {/* Panel header — always visible */}
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
                maxWidth: 'calc(100% - 2rem)',
              }}
            >
              {track.displayTitle}
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
          </div>
        </div>

        {/* Swipe hint arrows — shown briefly, fade out */}
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
