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
  fragments: string[];        // e.g. ['f001', 'f002']
  sessionCount: number;
  lastContact: number;        // Date.now() timestamp
  frequencyId: string;        // 8-char hex, generated once, never changes
  ghostUnlocked: boolean;
  hiddenUnlocked: boolean;
  manifestComplete: boolean;
  trust3SetAt: number;        // timestamp when trust first reached 3, 0 if never
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
  frequencyId: generateFrequencyId(),
  ghostUnlocked: false,
  hiddenUnlocked: false,
  manifestComplete: false,
  trust3SetAt: 0,
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
  const now = Date.now();

  // ── T3 → T4 auto-advance ────────────────────────────────────────────────
  // Conditions (either triggers):
  //   A) They are returning — sessionCount > 0 means they've loaded before at T3
  //   B) 24 hours have elapsed since trust3SetAt was recorded
  if (state.trust === 3) {
    const returningVisit = state.sessionCount > 0;
    const over24h = state.trust3SetAt > 0 && (now - state.trust3SetAt) > 86400000;

    if (returningVisit || over24h) {
      // Advance to 4 first, then fall through to increment session
      const advanced = updateARGState({
        trust: 4,
        sessionCount: state.sessionCount + 1,
        lastContact: now,
      });
      // Emit event for live UI update
      if (typeof window !== 'undefined') {
        import('@/lib/eventBus').then(({ eventBus }) => {
          eventBus.emit('arg:trust-level-change', { level: 4 });
        });
      }
      return advanced;
    }
  }

  return updateARGState({
    sessionCount: state.sessionCount + 1,
    lastContact: now,
  });
}

export function setTrust(level: TrustLevel): void {
  const patch: Partial<ARGState> = { trust: level };
  // Record timestamp the moment trust reaches 3 — used for 24h check in startSession
  if (level === 3) {
    patch.trust3SetAt = Date.now();
  }
  updateARGState(patch);
  // Notify UI components so NeuralChatSession signal header updates live
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
  const manifestComplete = mergedFragments.length >= 10; // 9 solo + f010
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
