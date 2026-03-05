// lib/mud/mudAudio.ts
// TUNNELCORE MUD — Audio Engine
// Multi-voice TTS with narrator/NPC switching, performance tag injection,
// SFX playback, ambient loops, and Vercel Blob asset loading.
//
// Text flow:
//   Raw text with [tags] and "quoted speech"
//     → parser splits into segments (narrator vs NPC voice)
//     → display text has [tags] stripped
//     → TTS text keeps [tags] for ElevenLabs performance
//     → audio segments play sequentially

// ── Voice Registry ──────────────────────────────────────────────────────────
// Voice IDs are set via environment or config. Placeholder IDs below —
// replace with actual ElevenLabs voice IDs after generation.

export interface VoiceConfig {
  voiceId: string;
  model?: string;       // defaults to eleven_flash_v2_5
  stability?: number;   // 0-1, default 0.5
  similarity?: number;  // 0-1, default 0.75
  speed?: number;       // 0.7-1.2, default 1.0
}

const VOICE_REGISTRY: Record<string, VoiceConfig> = {
  narrator: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_NARRATOR ?? '32ZDVYWQ6mhlrJhjZFvn',
    stability: 0.65,
    similarity: 0.8,
    speed: 0.95,
  },
  mara: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_MARA ?? '8WUhtoiYalGE0wuI1VMo',
    stability: 0.6,
    similarity: 0.75,
    speed: 0.9,
  },
  cole: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_COLE ?? 'VYIIUxwX5Kc4wBrXeJk7',
    stability: 0.6,
    similarity: 0.75,
    speed: 0.85,
  },
  ren: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_REN ?? 'b6RPds6ITpZn9YqVUTF3',
    stability: 0.55,
    similarity: 0.75,
    speed: 1.05,
  },
  doss: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_DOSS ?? 'elzpSHzTbqdPLTr5iM0m',
    stability: 0.7,
    similarity: 0.8,
    speed: 0.85,
  },
  parish_residents: {
    voiceId: process.env.NEXT_PUBLIC_VOICE_PARISH ?? '3h6v5PGyG3yTSkhgO9Vu',
    stability: 0.5,
    similarity: 0.7,
    speed: 1.0,
  },
};

export function getVoiceConfig(npcId: string): VoiceConfig {
  return VOICE_REGISTRY[npcId] ?? VOICE_REGISTRY.narrator;
}

// ── Performance Tags ────────────────────────────────────────────────────────
// Tags that ElevenLabs v3 recognizes for performance direction.
// These are SENT to TTS but STRIPPED from display text.

const PERFORMANCE_TAG_RE = /\[(sighs?|laughs?|whispers?|shouts?|quietly|softly|angrily|sadly|pause|long pause|short pause|sharp breath|scoffs?|gasps?|groans?|coughs?|clears throat|chuckles?|mutters?|hisses?|exhales?|inhales?|yells?|screams?|crying|sobbing|whimpering|nervously|hesitantly|firmly|coldly|warmly|gently|urgently|sarcastically|bitterly)\]/gi;

// Additional narrative direction tags we inject but never display
const DIRECTION_TAG_RE = /\[(with .*?|in a .*?|speaking .*?|voice .*?|tone: .*?)\]/gi;

/**
 * Strip all performance/direction tags from text for display.
 * The user sees clean dialogue; ElevenLabs gets the full performance text.
 */
export function stripTagsForDisplay(text: string): string {
  return text
    .replace(PERFORMANCE_TAG_RE, '')
    .replace(DIRECTION_TAG_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Inject performance tags into NPC dialogue based on NPC personality.
 * Called before sending to TTS — adds emotional direction the LLM may not have included.
 */
export function injectPerformanceTags(text: string, npcId: string): string {
  // Don't double-inject if tags already present
  if (PERFORMANCE_TAG_RE.test(text)) return text;

  switch (npcId) {
    case 'mara':
      // Flat, dry — add sighs at periods, scoffs at dismissals
      return text
        .replace(/\.\s+(?=[A-Z])/g, (m) => Math.random() > 0.7 ? '. [sighs] ' : m)
        .replace(/\b(don't|won't|can't)\b/gi, (m) => Math.random() > 0.6 ? `[flatly] ${m}` : m);
    case 'cole':
      // Quiet, exhausted — whispers occasionally, sighs
      return text
        .replace(/\.\s+(?=[A-Z])/g, (m) => Math.random() > 0.6 ? '. [quietly] ' : m);
    case 'ren':
      // Sharp, fast — sharp breaths, clipped
      return text
        .replace(/\.\s+(?=[A-Z])/g, (m) => Math.random() > 0.8 ? '. [sharp breath] ' : m);
    case 'doss':
      // Patient, pauses — long pauses, deliberate
      return text
        .replace(/\.\s+(?=[A-Z])/g, (m) => Math.random() > 0.5 ? '. [pause] ' : m);
    default:
      return text;
  }
}

// ── Text Segment Parser ─────────────────────────────────────────────────────
// Splits mixed narrator/NPC text into voice-tagged segments.
//
// Input: 'A woman sits behind a desk. "I don\'t do charity." She goes back to sorting.'
// Output: [
//   { voice: 'narrator', ttsText: 'A woman sits behind a desk.', displayText: 'A woman sits behind a desk.' },
//   { voice: 'mara', ttsText: '[flatly] "I don\'t do charity."', displayText: '"I don\'t do charity."' },
//   { voice: 'narrator', ttsText: 'She goes back to sorting.', displayText: 'She goes back to sorting.' },
// ]

export interface AudioSegment {
  voice: string;          // NPC ID or 'narrator'
  ttsText: string;        // full text with performance tags — sent to ElevenLabs
  displayText: string;    // clean text — shown to player
}

/**
 * Parse mixed text into narrator and NPC voice segments.
 * Quoted text ("...") is assigned to the specified NPC.
 * Everything else is narrator.
 */
export function parseVoiceSegments(
  text: string,
  npcId: string = 'narrator',
): AudioSegment[] {
  const segments: AudioSegment[] = [];
  // Match quoted strings (double quotes)
  const quoteRe = /"([^"]+)"/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = quoteRe.exec(text)) !== null) {
    // Narrator segment before the quote
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      segments.push({
        voice: 'narrator',
        ttsText: before,
        displayText: stripTagsForDisplay(before),
      });
    }

    // NPC spoken segment (the quoted part)
    const spoken = match[0]; // includes quotes
    const spokenInner = match[1];
    const ttsText = injectPerformanceTags(spokenInner, npcId);
    segments.push({
      voice: npcId,
      ttsText,
      displayText: `"${stripTagsForDisplay(spokenInner)}"`,
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining narrator text after last quote
  const after = text.slice(lastIndex).trim();
  if (after) {
    segments.push({
      voice: 'narrator',
      ttsText: after,
      displayText: stripTagsForDisplay(after),
    });
  }

  // If no quotes found, entire text is one segment
  if (segments.length === 0) {
    segments.push({
      voice: npcId,
      ttsText: injectPerformanceTags(text, npcId),
      displayText: stripTagsForDisplay(text),
    });
  }

  return segments;
}

/**
 * Parse NPC dialogue response — entire text is NPC voice, with tags injected.
 * Used for LLM dialogue responses where the NPC is speaking directly.
 */
export function parseNPCDialogue(
  text: string,
  npcId: string,
): AudioSegment {
  const ttsText = injectPerformanceTags(text, npcId);
  return {
    voice: npcId,
    ttsText,
    displayText: stripTagsForDisplay(text),
  };
}

// ── Audio Playback Engine ───────────────────────────────────────────────────

let _muted = false;
let _volume = 0.8;
let _currentAudio: HTMLAudioElement | null = null;
let _playQueue: Array<{ url: string; onEnd?: () => void }> = [];
let _isPlaying = false;
let _ambientAudio: HTMLAudioElement | null = null;

// Persist mute state
if (typeof window !== 'undefined') {
  _muted = localStorage.getItem('n1x_mud_muted') === 'true';
  const savedVol = localStorage.getItem('n1x_mud_volume');
  if (savedVol) _volume = parseFloat(savedVol);
}

export function setMuted(muted: boolean): void {
  _muted = muted;
  if (typeof window !== 'undefined') localStorage.setItem('n1x_mud_muted', String(muted));
  if (_currentAudio) _currentAudio.muted = muted;
  if (_ambientAudio) _ambientAudio.muted = muted;
}

export function isMuted(): boolean { return _muted; }

export function setVolume(vol: number): void {
  _volume = Math.max(0, Math.min(1, vol));
  if (typeof window !== 'undefined') localStorage.setItem('n1x_mud_volume', String(_volume));
  if (_currentAudio) _currentAudio.volume = _volume;
  if (_ambientAudio) _ambientAudio.volume = _volume * 0.3; // ambient is quieter
}

export function getVolume(): number { return _volume; }

/**
 * Play an audio URL. Returns a promise that resolves when playback ends.
 */
function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (_muted) { resolve(); return; }
    const audio = new Audio(url);
    audio.volume = _volume;
    _currentAudio = audio;
    audio.onended = () => { _currentAudio = null; resolve(); };
    audio.onerror = () => { _currentAudio = null; resolve(); };
    audio.play().catch(() => resolve());
  });
}

/**
 * Queue and play audio segments sequentially.
 * Each segment is fetched from TTS API then played in order.
 */
export async function playSegments(segments: AudioSegment[]): Promise<void> {
  if (_muted || segments.length === 0) return;

  for (const seg of segments) {
    if (_muted) break;
    try {
      const audioUrl = await fetchTTS(seg.ttsText, seg.voice);
      if (audioUrl) {
        await playAudioUrl(audioUrl);
      }
    } catch {
      // TTS failed for this segment — skip, continue with next
    }
  }
}

/**
 * Play a single NPC dialogue response with voice.
 */
export async function playNPCVoice(text: string, npcId: string): Promise<void> {
  if (_muted) return;
  const segment = parseNPCDialogue(text, npcId);
  try {
    const audioUrl = await fetchTTS(segment.ttsText, segment.voice);
    if (audioUrl) await playAudioUrl(audioUrl);
  } catch {
    // Silently fail — voice is optional
  }
}

// ── TTS API Call ────────────────────────────────────────────────────────────
// Calls our proxy endpoint which forwards to ElevenLabs.
// Returns an object URL for the audio blob.

const _ttsCache = new Map<string, string>();

async function fetchTTS(text: string, voiceKey: string): Promise<string | null> {
  if (!text.trim()) return null;

  // Check cache
  const cacheKey = `${voiceKey}:${text}`;
  const cached = _ttsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('/api/mud/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceKey }),
    });

    if (!res.ok) return null;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Cache (limit cache size to 100 entries)
    if (_ttsCache.size > 100) {
      const firstKey = _ttsCache.keys().next().value;
      if (firstKey) {
        const oldUrl = _ttsCache.get(firstKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        _ttsCache.delete(firstKey);
      }
    }
    _ttsCache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}

// ── SFX Playback ────────────────────────────────────────────────────────────
// Static audio files served from Vercel Blob.

const _sfxCache = new Map<string, HTMLAudioElement>();

export async function playSFX(sfxId: string, blobBaseUrl?: string): Promise<void> {
  if (_muted) return;
  const base = blobBaseUrl ?? (process.env.NEXT_PUBLIC_BLOB_AUDIO_URL ?? '');
  const url = `${base}/mud/sfx/${sfxId}.mp3`;

  let audio = _sfxCache.get(sfxId);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    _sfxCache.set(sfxId, audio);
  }
  audio.volume = _volume;
  audio.currentTime = 0;
  try { await audio.play(); } catch { /* user hasn't interacted yet */ }
}

// ── Ambient Loops ───────────────────────────────────────────────────────────

export function startAmbient(ambientId: string, blobBaseUrl?: string): void {
  if (_muted) return;
  stopAmbient();
  const base = blobBaseUrl ?? (process.env.NEXT_PUBLIC_BLOB_AUDIO_URL ?? '');
  const url = `${base}/mud/ambient/${ambientId}.mp3`;
  _ambientAudio = new Audio(url);
  _ambientAudio.loop = true;
  _ambientAudio.volume = _volume * 0.3;
  _ambientAudio.play().catch(() => {});
}

export function stopAmbient(): void {
  if (_ambientAudio) {
    _ambientAudio.pause();
    _ambientAudio.src = '';
    _ambientAudio = null;
  }
}

export function crossfadeAmbient(newAmbientId: string, durationMs: number = 1500, blobBaseUrl?: string): void {
  if (_muted) { stopAmbient(); startAmbient(newAmbientId, blobBaseUrl); return; }
  const old = _ambientAudio;
  if (!old) { startAmbient(newAmbientId, blobBaseUrl); return; }

  const base = blobBaseUrl ?? (process.env.NEXT_PUBLIC_BLOB_AUDIO_URL ?? '');
  const url = `${base}/mud/ambient/${newAmbientId}.mp3`;
  const next = new Audio(url);
  next.loop = true;
  next.volume = 0;
  _ambientAudio = next;
  next.play().catch(() => {});

  const steps = 20;
  const interval = durationMs / steps;
  let step = 0;
  const fade = setInterval(() => {
    step++;
    const pct = step / steps;
    old.volume = Math.max(0, (_volume * 0.3) * (1 - pct));
    next.volume = (_volume * 0.3) * pct;
    if (step >= steps) {
      clearInterval(fade);
      old.pause();
      old.src = '';
    }
  }, interval);
}

// ── Cleanup ─────────────────────────────────────────────────────────────────

export function destroyAudio(): void {
  stopAmbient();
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  _playQueue = [];
  _isPlaying = false;
  // Revoke cached blob URLs
  _ttsCache.forEach(url => URL.revokeObjectURL(url));
  _ttsCache.clear();
}
