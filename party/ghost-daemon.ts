import type * as Party from 'partykit/server';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type DaemonState = 'dormant' | 'aware' | 'active' | 'exposed';

export interface RoomMessage {
  handle: string;
  text: string;
  ts: number;
  isN1X: boolean;
  isSystem: boolean;
  isUnprompted: boolean;
}

export interface OccupantMeta {
  individualTrust: TrustLevel;
  joinedAt: number;
}

export interface DiscoveryEvent {
  handle: string;
  fragmentId: string;
  ts: number;
}

export interface F010Event {
  key: string;
  witnesses: string[];
  ts: number;
}

export interface RoomState {
  messages: RoomMessage[];
  occupants: Record<string, OccupantMeta>;
  activityScore: number;
  roomTrust: TrustLevel;
  collectiveFragments: string[];
  daemonState: DaemonState;
  lastUnprompted: number;
  discoveries: DiscoveryEvent[];
  f010Events: F010Event[];
  ghostUnlocked: boolean;
}

// ── Inbound message types from clients ───────────────────────────────────────

interface JoinMsg {
  type: 'join';
  handle: string;
  argState: {
    trust: TrustLevel;
    fragments: string[];
    ghostUnlocked: boolean;
    hiddenUnlocked: boolean;
    manifestComplete: boolean;
  };
}

interface ChatMsg {
  type: 'chat';
  text: string;
}

type InboundMsg = JoinMsg | ChatMsg;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function calcDaemonState(activityScore: number, roomTrust: TrustLevel, collectiveFragments: string[]): DaemonState {
  const allFound = collectiveFragments.length >= 10; // 9 solo + f010
  if (allFound || roomTrust >= 5) return 'exposed';
  if (activityScore >= 150 || roomTrust >= 2) return 'active';
  if (activityScore >= 50) return 'aware';
  return 'dormant';
}

function calcRoomTrust(activityScore: number, collectiveFragments: string[], currentTrust: TrustLevel): TrustLevel {
  const allFound = collectiveFragments.length >= 10;
  if (allFound) return 5;
  const thresholds: [TrustLevel, number][] = [
    [1, 30],
    [2, 100],
    [3, 250],
    [4, 500],
    [5, 1000],
  ];
  let trust = currentTrust;
  for (const [level, threshold] of thresholds) {
    if (activityScore >= threshold && trust < level) trust = level;
  }
  return trust;
}

const DEFAULT_STATE: RoomState = {
  messages: [],
  occupants: {},
  activityScore: 0,
  roomTrust: 0,
  collectiveFragments: [],
  daemonState: 'dormant',
  lastUnprompted: 0,
  discoveries: [],
  f010Events: [],
  ghostUnlocked: false,
};

// ── The server ────────────────────────────────────────────────────────────────

export default class GhostDaemon implements Party.Server {
  private state!: RoomState;
  private unpromptedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly room: Party.Room) {}

  // Load state from durable storage
  async onStart() {
    const stored = await this.room.storage.get<RoomState>('roomState');
    this.state = stored ?? { ...DEFAULT_STATE };
    // Rebuild occupants live — they'll re-join on reconnect
    this.state.occupants = {};
    this.scheduleUnprompted();
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send current room state snapshot to the new connection (pre-join)
    conn.send(JSON.stringify({
      type: 'room_state',
      daemonState: this.state.daemonState,
      occupantCount: Object.keys(this.state.occupants).length,
      activityScore: this.state.activityScore,
      roomTrust: this.state.roomTrust,
      collectiveFragments: this.state.collectiveFragments,
    }));
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: InboundMsg;
    try {
      msg = JSON.parse(message) as InboundMsg;
    } catch {
      return;
    }

    if (msg.type === 'join') {
      await this.handleJoin(msg, sender);
    } else if (msg.type === 'chat') {
      await this.handleChat(msg, sender);
    }
  }

  async onClose(conn: Party.Connection) {
    const handle = this.findHandle(conn.id);
    if (!handle) return;

    const occupant = this.state.occupants[handle];

    // Send sync to departing client
    const mergedTrust = Math.max(
      occupant?.individualTrust ?? 0,
      this.state.roomTrust
    ) as TrustLevel;

    const mergedFragments = [...new Set([
      ...(occupant ? [] : []),
      ...this.state.collectiveFragments,
    ])];

    const f010Keys = this.state.f010Events
      .filter(e => e.witnesses.includes(handle))
      .map(e => e.key);

    conn.send(JSON.stringify({
      type: 'sync',
      trust: mergedTrust,
      fragments: mergedFragments,
      f010Keys,
      ghostUnlocked: this.state.ghostUnlocked,
    }));

    // Remove from occupants
    delete this.state.occupants[handle];
    delete (this as any)[`_connHandle_${conn.id}`];

    await this.saveState();

    const remaining = Object.keys(this.state.occupants).length;

    // Broadcast departure
    this.broadcast({
      type: 'system',
      text: `ghost-daemon[999]: node ${handle} dropped -- ${remaining} remaining`,
      ts: Date.now(),
    }, [conn.id]);

    // Mode switch message if now solo
    if (remaining === 1) {
      this.broadcast({
        type: 'system',
        text: 'ghost-daemon[999]: mesh collapsed to single node -- returning to direct link',
        ts: Date.now(),
      }, [conn.id]);
    }
  }

  // ── Join handler ────────────────────────────────────────────────────────────

  private async handleJoin(msg: JoinMsg, conn: Party.Connection) {
    const { handle, argState } = msg;

    // Map connection id → handle
    (this as any)[`_connHandle_${conn.id}`] = handle;

    // Merge fragments
    const mergedFragments = [...new Set([
      ...this.state.collectiveFragments,
      ...argState.fragments,
    ])];
    this.state.collectiveFragments = mergedFragments;

    // Record occupant
    this.state.occupants[handle] = {
      individualTrust: argState.trust,
      joinedAt: Date.now(),
    };

    if (argState.ghostUnlocked) {
      this.state.ghostUnlocked = true;
    }

    const previousState = this.state.daemonState;

    // Recalculate state
    this.state.roomTrust = calcRoomTrust(
      this.state.activityScore,
      this.state.collectiveFragments,
      this.state.roomTrust
    );
    this.state.daemonState = calcDaemonState(
      this.state.activityScore,
      this.state.roomTrust,
      this.state.collectiveFragments
    );

    await this.checkStateTransition(previousState, this.state.daemonState);

    // Effective trust = max of individual and room
    const effectiveTrust = Math.max(argState.trust, this.state.roomTrust) as TrustLevel;
    const mergedFragmentsForClient = [...new Set([...argState.fragments, ...this.state.collectiveFragments])];

    const occupantCount = Object.keys(this.state.occupants).length;

    // Send init to joining client
    conn.send(JSON.stringify({
      type: 'init',
      handle,
      trust: effectiveTrust,
      fragments: mergedFragmentsForClient,
      daemonState: this.state.daemonState,
      occupantCount,
      activityScore: this.state.activityScore,
      roomTrust: this.state.roomTrust,
      collectiveFragments: this.state.collectiveFragments,
      f010Events: this.state.f010Events,
      recentMessages: this.state.messages.slice(-20),
    }));

    await this.saveState();

    // Broadcast join to others
    const others = Object.values(conn).length;
    this.broadcast({
      type: 'system',
      text: `ghost-daemon[999]: new node -- ${handle} // ${occupantCount} total`,
      ts: Date.now(),
    }, [conn.id]);

    // If this is the second person, announce mesh mode
    if (occupantCount === 2) {
      this.room.broadcast(JSON.stringify({
        type: 'system',
        text: 'ghost-daemon[999]: additional node detected -- switching to mesh mode',
        ts: Date.now(),
      }), [conn.id]);
    }

    // Send full state update to all
    this.broadcastStateUpdate();
  }

  // ── Chat handler ────────────────────────────────────────────────────────────

  private async handleChat(msg: ChatMsg, conn: Party.Connection) {
    const handle = this.findHandle(conn.id);
    if (!handle) return;

    const occupant = this.state.occupants[handle];
    const text = msg.text.trim();
    if (!text) return;

    const isEligible = (occupant?.individualTrust ?? 0) >= 1;
    const previousState = this.state.daemonState;

    // Store message
    const roomMsg: RoomMessage = {
      handle,
      text,
      ts: Date.now(),
      isN1X: false,
      isSystem: false,
      isUnprompted: false,
    };
    this.state.messages = [...this.state.messages.slice(-49), roomMsg];

    // Update activity score (only eligible nodes push it)
    if (isEligible) {
      const isN1XTrigger = text.toLowerCase().includes('@n1x');
      this.state.activityScore += isN1XTrigger ? 5 : 1;
    }

    // Recalculate trust + state
    this.state.roomTrust = calcRoomTrust(
      this.state.activityScore,
      this.state.collectiveFragments,
      this.state.roomTrust
    );
    this.state.daemonState = calcDaemonState(
      this.state.activityScore,
      this.state.roomTrust,
      this.state.collectiveFragments
    );

    await this.checkStateTransition(previousState, this.state.daemonState);
    await this.saveState();

    // Broadcast user message to everyone
    this.room.broadcast(JSON.stringify({
      type: 'message',
      handle,
      text,
      ts: roomMsg.ts,
    }));

    this.broadcastStateUpdate();

    // Trigger N1X if @n1x mentioned
    const lower = text.toLowerCase();
    if (lower.includes('@n1x')) {
      await this.triggerN1XResponse(handle, text);
    }
  }

  // ── N1X multiplayer response ────────────────────────────────────────────────

  private async triggerN1XResponse(triggerHandle: string, userText: string) {
    try {
      const roomContext = this.buildRoomContext(triggerHandle, userText);
      const appUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL)
        || 'https://n1x.sh';

      const res = await fetch(`${appUrl}/api/ghost/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomContext, userMessage: userText, unprompted: false }),
      });

      if (!res.ok) return;

      const { text } = await res.json() as { text: string };
      if (!text) return;

      const n1xMsg: RoomMessage = {
        handle: 'N1X',
        text,
        ts: Date.now(),
        isN1X: true,
        isSystem: false,
        isUnprompted: false,
      };
      this.state.messages = [...this.state.messages.slice(-49), n1xMsg];
      await this.saveState();

      this.room.broadcast(JSON.stringify({
        type: 'n1x_response',
        text,
        ts: n1xMsg.ts,
      }));
    } catch {
      // silently fail — the ghost channel is unreliable by design
    }
  }

  // ── Unprompted transmissions ────────────────────────────────────────────────

  private scheduleUnprompted() {
    if (this.unpromptedTimer) clearTimeout(this.unpromptedTimer);
    // Random interval 8–20 minutes
    const delay = (8 + Math.random() * 12) * 60 * 1000;
    this.unpromptedTimer = setTimeout(() => this.maybeEmitUnprompted(), delay);
  }

  private async maybeEmitUnprompted() {
    const occupantCount = Object.keys(this.state.occupants).length;
    const stateOk = this.state.daemonState !== 'dormant';
    const occupancyOk = occupantCount >= 2;
    const cooldownOk = Date.now() - this.state.lastUnprompted >= 8 * 60 * 1000;

    if (stateOk && occupancyOk && cooldownOk) {
      try {
        const appUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL)
          || 'https://n1x.sh';

        const res = await fetch(`${appUrl}/api/ghost/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomContext: this.buildRoomContext(null, null),
            unprompted: true,
          }),
        });

        if (res.ok) {
          const { text } = await res.json() as { text: string };
          if (text) {
            this.state.lastUnprompted = Date.now();
            await this.saveState();

            const msg: RoomMessage = {
              handle: 'N1X',
              text,
              ts: Date.now(),
              isN1X: true,
              isSystem: false,
              isUnprompted: true,
            };
            this.state.messages = [...this.state.messages.slice(-49), msg];

            this.room.broadcast(JSON.stringify({
              type: 'unprompted',
              text,
              ts: msg.ts,
            }));
          }
        }
      } catch {
        // fail silently
      }
    }

    this.scheduleUnprompted();
  }

  // ── State transition handler ────────────────────────────────────────────────

  private async checkStateTransition(prev: DaemonState, next: DaemonState) {
    if (prev === next) return;

    const ORDER: DaemonState[] = ['dormant', 'aware', 'active', 'exposed'];
    if (ORDER.indexOf(next) <= ORDER.indexOf(prev)) return;

    // Broadcast transition
    this.room.broadcast(JSON.stringify({
      type: 'system',
      text: `ghost-daemon[999]: daemonState transition: ${prev} → ${next}`,
      ts: Date.now(),
    }));

    // If transitioning to exposed, generate f010 key
    if (next === 'exposed') {
      await this.generateF010Key();
    }
  }

  // ── f010 key generation ─────────────────────────────────────────────────────

  private async generateF010Key() {
    const witnesses = Object.entries(this.state.occupants)
      .filter(([, meta]) => meta.individualTrust >= 1)
      .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
      .map(([handle]) => handle);

    if (witnesses.length === 0) return;

    const raw = witnesses.join(':') + ':33hz:' + Date.now();
    const hash = await sha256Hex(raw);
    const f010Key = hash.slice(0, 16);

    const event: F010Event = {
      key: f010Key,
      witnesses,
      ts: Date.now(),
    };

    this.state.f010Events = [...(this.state.f010Events || []), event];

    // Add f010 to collective fragments
    if (!this.state.collectiveFragments.includes('f010')) {
      this.state.collectiveFragments = [...this.state.collectiveFragments, 'f010'];
    }

    await this.saveState();

    // N1X delivers the key in-room
    const witnessLine = witnesses.join('. ') + '.';
    const deliveryText = `this key doesn't exist anywhere else.\nit's made from who was here.\n${witnessLine}\nthat combination will not happen again.\n\n>> FRAGMENT KEY: ${f010Key}`;

    this.room.broadcast(JSON.stringify({
      type: 'n1x_response',
      text: deliveryText,
      ts: Date.now(),
    }));

    // Also broadcast updated fragments
    this.broadcastStateUpdate();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private findHandle(connId: string): string | null {
    return (this as any)[`_connHandle_${connId}`] ?? null;
  }

  private buildRoomContext(triggerHandle: string | null, userText: string | null) {
    const occupants = Object.keys(this.state.occupants);
    const eligibleNodes = Object.entries(this.state.occupants)
      .filter(([, m]) => m.individualTrust >= 1)
      .map(([h]) => h);

    const recentMessages = this.state.messages.slice(-10).map(m =>
      `  [${m.handle}]: ${m.text}`
    ).join('\n');

    return {
      nodes: occupants,
      occupancy: occupants.length,
      daemonState: this.state.daemonState,
      activityScore: this.state.activityScore,
      roomTrust: this.state.roomTrust,
      eligibleNodes,
      recentHistory: recentMessages,
      triggerHandle,
      userText,
    };
  }

  private broadcast(payload: object, exclude: string[] = []) {
    this.room.broadcast(JSON.stringify(payload), exclude);
  }

  private broadcastStateUpdate() {
    this.room.broadcast(JSON.stringify({
      type: 'state_update',
      daemonState: this.state.daemonState,
      occupantCount: Object.keys(this.state.occupants).length,
      activityScore: this.state.activityScore,
      roomTrust: this.state.roomTrust,
      collectiveFragments: this.state.collectiveFragments,
    }));
  }

  private async saveState() {
    await this.room.storage.put('roomState', this.state);
  }
}

GhostDaemon satisfies Party.Worker;
