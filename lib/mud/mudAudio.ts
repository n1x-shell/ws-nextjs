// lib/mud/mudAudio.ts
// TUNNELCORE MUD — Audio Engine
// Single persistent Audio element for iOS compatibility.
// Centralized queue — all TTS goes through one pipeline.
// Performance tags injected for ElevenLabs, stripped from display.

// ── Voice Registry ──────────────────────────────────────────────────────────

export interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarity: number;
  speed: number;
}

const VOICE_REGISTRY: Record<string, VoiceConfig> = {
  narrator:         { voiceId: '32ZDVYWQ6mhlrJhjZFvn', stability: 0.65, similarity: 0.8,  speed: 0.95 },
  mara:             { voiceId: '8WUhtoiYalGE0wuI1VMo', stability: 0.6,  similarity: 0.75, speed: 0.9  },
  cole:             { voiceId: 'VYIIUxwX5Kc4wBrXeJk7', stability: 0.6,  similarity: 0.75, speed: 0.85 },
  ren:              { voiceId: 'b6RPds6ITpZn9YqVUTF3', stability: 0.55, similarity: 0.75, speed: 1.05 },
  doss:             { voiceId: 'elzpSHzTbqdPLTr5iM0m', stability: 0.7,  similarity: 0.8,  speed: 0.85 },
  parish_residents: { voiceId: '3h6v5PGyG3yTSkhgO9Vu', stability: 0.5,  similarity: 0.7,  speed: 1.0  },
};

export function getVoiceConfig(key: string): VoiceConfig {
  return VOICE_REGISTRY[key] ?? VOICE_REGISTRY.narrator;
}

// ── Performance Tags ────────────────────────────────────────────────────────

const PERF_TAG = /\[(sighs?|laughs?|whispers?|shouts?|quietly|softly|angrily|sadly|pause|long pause|short pause|sharp breath|scoffs?|gasps?|groans?|coughs?|clears throat|chuckles?|mutters?|hisses?|exhales?|inhales?|yells?|screams?|crying|sobbing|whimpering|nervously|hesitantly|firmly|coldly|warmly|gently|urgently|sarcastically|bitterly|flatly)\]/gi;
const DIR_TAG = /\[(with .*?|in a .*?|speaking .*?|voice .*?|tone: .*?)\]/gi;

export function stripTagsForDisplay(text: string): string {
  return text.replace(PERF_TAG, '').replace(DIR_TAG, '').replace(/\s{2,}/g, ' ').trim();
}

function injectTags(text: string, npcId: string): string {
  if (PERF_TAG.test(text)) return text;
  PERF_TAG.lastIndex = 0; // reset after test
  const add = (t: string, tag: string, chance: number) =>
    t.replace(/\.\s+(?=[A-Z])/g, m => Math.random() < chance ? `. ${tag} ` : m);
  switch (npcId) {
    case 'mara': return add(text, '[sighs]', 0.3);
    case 'cole': return add(text, '[quietly]', 0.4);
    case 'ren': return add(text, '[sharp breath]', 0.2);
    case 'doss': return add(text, '[pause]', 0.5);
    default: return text;
  }
}

// ── Segment Parser ──────────────────────────────────────────────────────────

export interface AudioSegment {
  voice: string;
  ttsText: string;
  displayText: string;
  segType?: 'narration' | 'speech'; // for dual-color rendering
}

// ── NPC Dialogue Formatter ──────────────────────────────────────────────────
// Transforms raw LLM output into proper third-person prose with name prepend,
// pronoun awareness, and narration/speech segmentation.

// Future: import getNPCGender from './npcEngine' for mid-sentence pronoun repair

const POSSESSIVE_STARTERS = new Set([
  'eyes', 'hands', 'voice', 'jaw', 'gaze', 'shoulders', 'posture',
  'fingers', 'head', 'face', 'mouth', 'lips', 'brow', 'expression',
  'tone', 'arm', 'arms', 'leg', 'legs', 'body', 'back', 'throat',
  'chest', 'breath', 'breathing', 'sigh', 'smile', 'frown', 'smirk',
  'grin', 'scowl', 'nod', 'shrug', 'hand', 'finger', 'foot', 'feet',
  'stance', 'weight', 'chin', 'nose', 'ear', 'ears', 'neck',
]);

const ACTION_VERBS = new Set([
  'looks', 'turns', 'leans', 'stands', 'sits', 'pauses', 'waits',
  'nods', 'shakes', 'sighs', 'laughs', 'scoffs', 'shrugs', 'crosses',
  'steps', 'glances', 'stares', 'watches', 'moves', 'reaches', 'pulls',
  'pushes', 'drops', 'picks', 'grabs', 'points', 'gestures', 'motions',
  'stops', 'starts', 'continues', 'speaks', 'says', 'mutters', 'whispers',
  'growls', 'hisses', 'snaps', 'tilts', 'raises', 'lowers', 'taps',
  'drums', 'folds', 'unfolds', 'adjusts', 'shifts', 'settles', 'exhales',
  'inhales', 'coughs', 'clears', 'straightens', 'slumps', 'flexes',
  'clenches', 'unclenches', 'narrows', 'widens', 'squints', 'blinks',
]);

/**
 * Format raw NPC dialogue into proper third-person prose.
 * Prepends NPC name with possessive or subject form as needed.
 * Returns formatted text + split segments for dual-color rendering and TTS.
 */
export interface FormattedDialogue {
  segments: AudioSegment[];
  fullText: string;       // complete formatted text for display
  fullTTS: string;        // complete text with performance tags for TTS
  npcName: string;
}

export function formatNPCDialogue(rawText: string, npcName: string, npcId: string): FormattedDialogue {
  let text = rawText.trim();

  // Strip any [Name]> prefix the LLM may have added
  const prefixRe = new RegExp(`^\\[?${npcName}\\]?\\s*[>:]+\\s*`, 'i');
  text = text.replace(prefixRe, '');

  // Strip name at start if LLM echoed it (e.g., "Cole leans back...")
  const nameStartRe = new RegExp(`^${npcName}\\s+`, 'i');
  text = text.replace(nameStartRe, '');

  // If starts with a quote, leave it — NPC is speaking directly
  if (!text.startsWith('"')) {
    const firstWord = text.split(/[\s.,!?]/)[0].toLowerCase();

    if (POSSESSIVE_STARTERS.has(firstWord)) {
      // "eyes flick up" → "Cole's eyes flick up"
      text = `${npcName}'s ${text}`;
    } else if (ACTION_VERBS.has(firstWord)) {
      // "leans back" → "Cole leans back"
      text = `${npcName} ${text}`;
    } else {
      // Unknown start — prepend name with action form
      text = `${npcName} ${text}`;
    }
  }

  // Capitalize first letter after name prepend
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Capitalize first letter of quoted speech
  text = text.replace(/"([a-z])/g, (_, c) => `"${c.toUpperCase()}`);

  // Now split into narration/speech segments
  const segments: AudioSegment[] = [];
  const quoteRe = /"([^"]+)"/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = quoteRe.exec(text)) !== null) {
    const before = text.slice(lastIdx, match.index).trim();
    if (before) {
      segments.push({
        voice: 'narrator',
        ttsText: before,
        displayText: stripTagsForDisplay(before),
        segType: 'narration',
      });
    }
    const inner = match[1];
    segments.push({
      voice: npcId,
      ttsText: injectTags(inner, npcId),
      displayText: `"${stripTagsForDisplay(inner)}"`,
      segType: 'speech',
    });
    lastIdx = match.index + match[0].length;
  }

  const after = text.slice(lastIdx).trim();
  if (after) {
    segments.push({
      voice: 'narrator',
      ttsText: after,
      displayText: stripTagsForDisplay(after),
      segType: 'narration',
    });
  }

  // If no segments (edge case), treat entire text as speech
  if (segments.length === 0) {
    segments.push({
      voice: npcId,
      ttsText: injectTags(text, npcId),
      displayText: stripTagsForDisplay(text),
      segType: 'speech',
    });
  }

  const fullText = segments.map(s => s.displayText).join(' ');
  const fullTTS = segments.map(s => s.ttsText).join(' ');

  return { segments, fullText, fullTTS, npcName };
}

// ── Original parsers (kept for room descriptions) ───────────────────────────

export function parseVoiceSegments(text: string, npcId: string = 'narrator'): AudioSegment[] {
  const segments: AudioSegment[] = [];
  const re = /"([^"]+)"/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const before = text.slice(last, m.index).trim();
    if (before) {
      segments.push({ voice: 'narrator', ttsText: before, displayText: stripTagsForDisplay(before), segType: 'narration' });
    }
    const inner = m[1];
    segments.push({ voice: npcId, ttsText: injectTags(inner, npcId), displayText: `"${stripTagsForDisplay(inner)}"`, segType: 'speech' });
    last = m.index + m[0].length;
  }

  const after = text.slice(last).trim();
  if (after) {
    segments.push({ voice: 'narrator', ttsText: after, displayText: stripTagsForDisplay(after), segType: 'narration' });
  }

  if (segments.length === 0) {
    segments.push({ voice: npcId, ttsText: injectTags(text, npcId), displayText: stripTagsForDisplay(text), segType: 'speech' });
  }

  return segments;
}

export function parseNPCDialogue(text: string, npcId: string): AudioSegment {
  return { voice: npcId, ttsText: injectTags(text, npcId), displayText: stripTagsForDisplay(text), segType: 'speech' };
}

// ── Persistent Audio Element (iOS Safari) ───────────────────────────────────
// iOS requires audio.play() from a user gesture to "unlock" the element.
// After that, changing src and calling play() works without gesture context.

let _audio: HTMLAudioElement | null = null;
let _unlocked = false;
let _muted = false;
let _volume = 0.8;

if (typeof window !== 'undefined') {
  _muted = localStorage.getItem('n1x_mud_muted') === 'true';
  const v = localStorage.getItem('n1x_mud_volume');
  if (v) _volume = parseFloat(v);
}

function getAudio(): HTMLAudioElement {
  if (!_audio && typeof window !== 'undefined') {
    _audio = new Audio();
    _audio.volume = _volume;
  }
  return _audio!;
}

/** Call from any user gesture handler to unlock audio on iOS. */
export function unlockAudio(): void {
  if (_unlocked || typeof window === 'undefined') return;
  const a = getAudio();
  if (!a) return;
  // Silent MP3 — shortest valid frame
  a.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQxBQAAADSAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  a.play().then(() => { _unlocked = true; a.pause(); a.src = ''; }).catch(() => {});
}

// Auto-register unlock on interactions
if (typeof window !== 'undefined') {
  const handlers = ['click', 'keydown', 'touchstart'] as const;
  const tryUnlock = () => {
    unlockAudio();
    if (_unlocked) handlers.forEach(e => window.removeEventListener(e, tryUnlock));
  };
  handlers.forEach(e => window.addEventListener(e, tryUnlock, { passive: true }));
}

// ── Volume / Mute ───────────────────────────────────────────────────────────

export function setMuted(m: boolean): void {
  _muted = m;
  if (typeof window !== 'undefined') localStorage.setItem('n1x_mud_muted', String(m));
  if (_audio) _audio.muted = m;
}
export function isMuted(): boolean { return _muted; }

export function setVolume(v: number): void {
  _volume = Math.max(0, Math.min(1, v));
  if (typeof window !== 'undefined') localStorage.setItem('n1x_mud_volume', String(_volume));
  if (_audio) _audio.volume = _volume;
}
export function getVolume(): number { return _volume; }

// ── Centralized Playback Queue ──────────────────────────────────────────────
// ALL TTS goes through this queue. One audio plays at a time.
// Prevents race conditions between narrator and NPC voice.

interface QueueItem {
  url: string;
  label: string; // for debug logging
  resolve: () => void;
}

const _queue: QueueItem[] = [];
let _playing = false;

function enqueue(url: string, label: string): Promise<void> {
  return new Promise(resolve => {
    _queue.push({ url, label, resolve });
    if (!_playing) drain();
  });
}

function drain(): void {
  if (_queue.length === 0) { _playing = false; return; }
  _playing = true;
  const item = _queue.shift()!;
  playOne(item.url, item.label).then(() => { item.resolve(); drain(); });
}

function playOne(url: string, label: string): Promise<void> {
  return new Promise(resolve => {
    if (_muted || !url) { resolve(); return; }
    const a = getAudio();
    if (!a) { resolve(); return; }

    const done = () => {
      a.onended = null;
      a.onerror = null;
      resolve();
    };

    a.onended = done;
    a.onerror = (e) => {
      console.warn(`[MUD_AUDIO] playback error for ${label}:`, e);
      done();
    };
    a.volume = _volume;
    a.src = url;
    a.play().catch(err => {
      console.warn(`[MUD_AUDIO] play() rejected for ${label}:`, err.message ?? err);
      done();
    });
  });
}

/** Cancel all queued audio and stop current playback. */
export function stopAll(): void {
  _queue.length = 0;
  _playing = false;
  if (_audio) { _audio.pause(); _audio.src = ''; }
}

// ── TTS Fetch ───────────────────────────────────────────────────────────────

const _cache = new Map<string, string>();

async function fetchTTS(text: string, voiceKey: string): Promise<string | null> {
  if (!text.trim()) return null;

  const key = `${voiceKey}:${text}`;
  const cached = _cache.get(key);
  if (cached) { console.log(`[MUD_AUDIO] cache hit: ${voiceKey}`); return cached; }

  console.log(`[MUD_AUDIO] fetching TTS: voice=${voiceKey}, text="${text.slice(0, 60)}..."`);

  try {
    const res = await fetch('/api/mud/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceKey }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[MUD_AUDIO] TTS API ${res.status}: ${errBody}`);
      return null;
    }

    const blob = await res.blob();
    if (blob.size < 100) {
      console.warn(`[MUD_AUDIO] TTS response suspiciously small (${blob.size} bytes) for ${voiceKey}`);
      return null;
    }

    const url = URL.createObjectURL(blob);
    console.log(`[MUD_AUDIO] TTS OK: ${voiceKey}, ${blob.size} bytes`);

    // Cache with LRU eviction
    if (_cache.size > 100) {
      const first = _cache.keys().next().value;
      if (first) { URL.revokeObjectURL(_cache.get(first)!); _cache.delete(first); }
    }
    _cache.set(key, url);
    return url;
  } catch (err) {
    console.error(`[MUD_AUDIO] fetch error for ${voiceKey}:`, err);
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

// Active playback tracking — React components subscribe via eventBus
let _activeAudioId: string | null = null;

/** Get the currently playing audio ID (null if silent). */
export function getActiveAudioId(): string | null { return _activeAudioId; }

function emitPlayState(audioId: string | null): void {
  _activeAudioId = audioId;
  if (typeof window !== 'undefined') {
    // Use a custom event — avoids importing eventBus (circular dep risk)
    window.dispatchEvent(new CustomEvent('mud:audio-state', { detail: { audioId } }));
  }
}

/**
 * Play multiple voice segments sequentially (narrator + NPC mixed).
 * Stops any currently playing audio first.
 * Returns the audioId for glyph binding.
 */
export async function playSegments(segments: AudioSegment[], audioId?: string): Promise<string> {
  const id = audioId ?? `segments:${Date.now()}`;
  if (_muted || segments.length === 0) return id;

  // Stop current playback before starting new
  stopAll();
  emitPlayState(id);

  for (const seg of segments) {
    if (_muted || _activeAudioId !== id) break; // stopped by another play call
    const url = await fetchTTS(seg.ttsText, seg.voice);
    if (url) await enqueue(url, `segment:${seg.voice}`);
  }

  if (_activeAudioId === id) emitPlayState(null);
  return id;
}

/**
 * Play a single NPC dialogue line. Stops current audio first.
 * Returns the audioId for glyph binding.
 */
export async function playNPCVoice(text: string, npcId: string, audioId?: string): Promise<string> {
  const id = audioId ?? `npc:${npcId}:${Date.now()}`;
  if (_muted) return id;

  // Stop current playback
  stopAll();
  emitPlayState(id);

  const seg = parseNPCDialogue(text, npcId);
  const url = await fetchTTS(seg.ttsText, seg.voice);
  if (url && _activeAudioId === id) {
    await enqueue(url, `npc:${npcId}`);
  }

  if (_activeAudioId === id) emitPlayState(null);
  return id;
}

/**
 * Replay audio for a given audioId using cached TTS data.
 * Called by PlayGlyph when user clicks to re-hear a line.
 */
export async function replayAudio(audioId: string, ttsText: string, voiceKey: string): Promise<void> {
  if (_muted) return;
  stopAll();
  emitPlayState(audioId);

  const url = await fetchTTS(ttsText, voiceKey);
  if (url && _activeAudioId === audioId) {
    await enqueue(url, `replay:${voiceKey}`);
  }

  if (_activeAudioId === audioId) emitPlayState(null);
}

/** Stop everything and clear state. */
export function stopAllAndReset(): void {
  stopAll();
  emitPlayState(null);
}

// ── SFX (future — Vercel Blob) ──────────────────────────────────────────────

export async function playSFX(sfxId: string): Promise<void> {
  if (_muted) return;
  const base = process.env.NEXT_PUBLIC_BLOB_AUDIO_URL ?? '';
  if (!base) return;
  const url = `${base}/mud/sfx/${sfxId}.mp3`;
  await enqueue(url, `sfx:${sfxId}`);
}

// ── Ambient (future — Vercel Blob) ──────────────────────────────────────────

let _ambient: HTMLAudioElement | null = null;

export function startAmbient(id: string): void {
  if (_muted) return;
  stopAmbient();
  const base = process.env.NEXT_PUBLIC_BLOB_AUDIO_URL ?? '';
  if (!base) return;
  _ambient = new Audio(`${base}/mud/ambient/${id}.mp3`);
  _ambient.loop = true;
  _ambient.volume = _volume * 0.3;
  _ambient.play().catch(() => {});
}

export function stopAmbient(): void {
  if (_ambient) { _ambient.pause(); _ambient.src = ''; _ambient = null; }
}

// ── Cleanup ─────────────────────────────────────────────────────────────────

export function destroyAudio(): void {
  stopAll();
  stopAmbient();
  _cache.forEach(u => URL.revokeObjectURL(u));
  _cache.clear();
}
