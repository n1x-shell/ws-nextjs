'use client';

const ARC = 'ghost-frequency';
const STORAGE_KEY = 'n1x_substrate';

export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const TRUST_LABELS: Record<TrustLevel, string> = {
  0: 'MONITORING',
  1: 'SIGNAL ACQUIRED',
  2: 'PROVISIONAL',
  3: 'CONTACT ESTABLISHED',
  4: 'ACCESS GRANTED',
  5: 'SUBSTRATE OPEN',
};

export interface ARGState {
  arc: string;
  trust: TrustLevel;
  fragments: string[];
  sessionCount: number;
  lastContact: number;
  trust3SetAt: number;
  frequencyId: string;
  ghostUnlocked: boolean;
  hiddenUnlocked: boolean;
  manifestComplete: boolean;
}

function generateFrequencyId(): string {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_STATE: ARGState = {
  arc: ARC,
  trust: 0,
  fragments: [],
  sessionCount: 0,
  lastContact: 0,
  trust3SetAt: 0,
  frequencyId: generateFrequencyId(),
  ghostUnlocked: false,
  hiddenUnlocked: false,
  manifestComplete: false,
};

export function loadARGState(): ARGState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveARGState(state: ARGState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateARGState(patch: Partial<ARGState>): ARGState {
  const current = loadARGState();
  const next = { ...current, ...patch };
  saveARGState(next);
  return next;
}

export function startSession(): ARGState {
  const state = loadARGState();

  const patch: Partial<ARGState> = {
    sessionCount: state.sessionCount + 1,
    lastContact: Date.now(),
  };

  if (state.trust === 3) {
    const returningVisit = state.sessionCount > 0;
    const elapsed24h     = state.trust3SetAt > 0 && (Date.now() - state.trust3SetAt) >= 86400000;
    if (returningVisit || elapsed24h) {
      patch.trust = 4;
    }
  }

  return updateARGState(patch);
}

/**
 * Increment session count on ghost channel connect.
 * Call once per TelnetConnected mount.
 */
export function incrementSession(): ARGState {
  const state = loadARGState();
  return updateARGState({ sessionCount: state.sessionCount + 1 });
}

export function setTrust(level: TrustLevel): void {
  const patch: Partial<ARGState> = { trust: level };
  if (level === 3) {
    const state = loadARGState();
    if (!state.trust3SetAt) patch.trust3SetAt = Date.now();
  }
  updateARGState(patch);
  if (typeof window !== 'undefined') {
    import('@/lib/eventBus').then(({ eventBus }) => {
      eventBus.emit('arg:trust-level-change', { level });
    });
  }
}

export function addFragment(id: string): boolean {
  const state = loadARGState();
  if (state.fragments.includes(id)) return false;
  const fragments = [...state.fragments, id];
  const manifestComplete = fragments.length >= 9;
  updateARGState({ fragments, manifestComplete });
  return true;
}

export function isFirstVisit(): boolean {
  return loadARGState().sessionCount === 0;
}

export function isComplete(): boolean {
  return loadARGState().manifestComplete;
}

// ── Sigil progression ─────────────────────────────────────────────────────────

export interface SigilTier {
  sigil: string;
  color: string;
  name:  string;
}

interface SigilThreshold extends SigilTier {
  threshold: number;
}

export const SIGIL_TIERS: SigilThreshold[] = [
  { threshold: 1000, sigil: '⌬', color: '#ff4444', name: 'architect' },
  { threshold: 500,  sigil: '☉', color: '#ffd700', name: 'solar'     },
  { threshold: 100,  sigil: '⊛', color: '#ff00ff', name: 'deep'      },
  { threshold: 90,   sigil: '⬢', color: '#00ffff', name: 'core'      },
  { threshold: 80,   sigil: '✦', color: '#ffe600', name: 'star'      },
  { threshold: 70,   sigil: '⊕', color: '#ff3366', name: 'cross'     },
  { threshold: 60,   sigil: '◉', color: '#ff9500', name: 'pulse'     },
  { threshold: 50,   sigil: '⬡', color: '#ff61ef', name: 'hex'       },
  { threshold: 40,   sigil: '◈', color: '#7b61ff', name: 'lattice'   },
  { threshold: 30,   sigil: '○', color: '#33ff33', name: 'ring'      },
  { threshold: 20,   sigil: '◦', color: '#00e5ff', name: 'trace'     },
  { threshold: 10,   sigil: '·', color: '#00ff99', name: 'node'      },
];

/**
 * Returns the SigilTier for a given session count, or null for tier 0 (0–9 sessions).
 */
export function getPlayerSigil(sessions: number): SigilTier | null {
  return SIGIL_TIERS.find(t => sessions >= t.threshold) ?? null;
}

// ── Room sync ─────────────────────────────────────────────────────────────────

export interface RoomArgExport {
  trust: TrustLevel;
  fragments: string[];
  ghostUnlocked: boolean;
  hiddenUnlocked: boolean;
  manifestComplete: boolean;
}

export function exportForRoom(): RoomArgExport {
  const state = loadARGState();
  return {
    trust: state.trust,
    fragments: state.fragments,
    ghostUnlocked: state.ghostUnlocked,
    hiddenUnlocked: state.hiddenUnlocked,
    manifestComplete: state.manifestComplete,
  };
}

export interface RoomSync {
  trust: TrustLevel;
  fragments: string[];
  ghostUnlocked?: boolean;
}

export function mergeFromRoom(sync: RoomSync): void {
  const state = loadARGState();
  const mergedTrust = Math.max(state.trust, sync.trust) as TrustLevel;
  const mergedFragments = [...new Set([...state.fragments, ...sync.fragments])];
  const manifestComplete = mergedFragments.length >= 10;
  updateARGState({
    trust: mergedTrust,
    fragments: mergedFragments,
    ghostUnlocked: sync.ghostUnlocked || state.ghostUnlocked,
    manifestComplete,
  });
}

export function getTimeAway(lastContact: number): string {
  if (lastContact === 0) return 'first contact';
  const ms = Date.now() - lastContact;
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (minutes < 2) return 'moments ago';
  if (hours < 1) return `${minutes} minutes ago`;
  if (days < 1) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
