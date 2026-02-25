import { eventBus } from './eventBus';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private rafId: number | null = null;
  private _volume = 1;
  private _muted = true;
  private _trackIndex = 0;
  private _trackTitle = '';
  private _state: 'playing' | 'paused' | 'ended' = 'paused';

  // Connect to a video element (called when SyntheticsPlayer mounts / track changes)
  connect(videoEl: HTMLVideoElement, trackIndex: number, trackTitle: string): void {
    // If same element, just update metadata
    if (this.videoEl === videoEl) {
      this._trackIndex = trackIndex;
      this._trackTitle = trackTitle;
      return;
    }

    this.disconnectSource();
    this.videoEl = videoEl;
    this._trackIndex = trackIndex;
    this._trackTitle = trackTitle;

    // Wire up Web Audio API
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.connect(this.audioCtx.destination);
      }
      this.source = this.audioCtx.createMediaElementSource(videoEl);
      this.source.connect(this.analyser);
    } catch (e) {
      // Web Audio may fail in some environments — degrade gracefully
      console.warn('[AudioEngine] Web Audio API unavailable:', e);
    }

    // Attach playback event listeners
    videoEl.addEventListener('play',  this.handlePlay);
    videoEl.addEventListener('pause', this.handlePause);
    videoEl.addEventListener('ended', this.handleEnded);

    // Apply stored volume
    videoEl.volume = this._volume;
    videoEl.muted  = this._muted;

    this.startRAF();
  }

  disconnect(): void {
    this.disconnectSource();
    this.stopRAF();
    this._state = 'paused';
  }

  private disconnectSource(): void {
    if (this.videoEl) {
      this.videoEl.removeEventListener('play',  this.handlePlay);
      this.videoEl.removeEventListener('pause', this.handlePause);
      this.videoEl.removeEventListener('ended', this.handleEnded);
      this.videoEl = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch {}
      this.source = null;
    }
  }

  private handlePlay = () => {
    this._state = 'playing';
    eventBus.emit('audio:playback-change', { state: 'playing', index: this._trackIndex, title: this._trackTitle });
  };

  private handlePause = () => {
    this._state = 'paused';
    eventBus.emit('audio:playback-change', { state: 'paused', index: this._trackIndex, title: this._trackTitle });
  };

  private handleEnded = () => {
    this._state = 'ended';
    eventBus.emit('audio:playback-change', { state: 'ended', index: this._trackIndex, title: this._trackTitle });
  };

  private startRAF(): void {
    if (this.rafId !== null) return;
    const loop = () => {
      if (!this.analyser) {
        this.rafId = requestAnimationFrame(loop);
        return;
      }
      const bufLen = this.analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufLen);
      const timeData = new Uint8Array(bufLen);
      this.analyser.getByteFrequencyData(freqData);
      this.analyser.getByteTimeDomainData(timeData);

      // Amplitude: RMS of time-domain data normalised to 0–1
      let sum = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      const amplitude = Math.sqrt(sum / bufLen);

      eventBus.emit('audio:amplitude', { level: amplitude });
      eventBus.emit('audio:frequency', { bands: freqData });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stopRAF(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ── Public controls ──────────────────────────────────────────────────────

  pause(): void {
    this.videoEl?.pause();
  }

  resume(): void {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.videoEl?.play().catch(() => {});
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.videoEl) this.videoEl.volume = this._volume;
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.videoEl) this.videoEl.muted = muted;
  }

  get muted(): boolean { return this._muted; }
  get volume(): number { return this._volume; }
  get state(): 'playing' | 'paused' | 'ended' { return this._state; }
  get trackIndex(): number { return this._trackIndex; }
  get trackTitle(): string { return this._trackTitle; }

  notifyTrackChange(index: number, title: string): void {
    this._trackIndex = index;
    this._trackTitle = title;
    this._state = 'paused';
    eventBus.emit('audio:track-change', { index, title });
  }
}

export const audioEngine = new AudioEngine();
