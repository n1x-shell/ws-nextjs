// ── Telnet Bridge ─────────────────────────────────────────────────────────────
// Module-level store connecting:
//   TelnetSession  → sets handle + send/disconnect when entering multi mode
//   commandRegistry → intercepts bottom-bar input → Ably instead of NeuralLink
//   NeuralBusPrompt → reads handle for [handle]>> prompt label (reactive via event)

type SendFn       = (text: string) => void;
type DisconnectFn = () => void;

let _handle:       string | null = null;
let _sendFn:       SendFn | null = null;
let _disconnectFn: DisconnectFn | null = null;
let _active = false;

// ── Handle label (prompt display only) ───────────────────────────────────────
// Sets handle without activating routing. Used in single mode so the prompt
// shows [handle]>> while input still goes to NeuralLink.

const _listeners: Array<(handle: string) => void> = [];

export function setHandleLabel(handle: string): void {
  _handle = handle;
  _listeners.forEach(fn => fn(handle));
}

export function onHandleChange(fn: (handle: string) => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

// ── Full activation (mesh mode) ───────────────────────────────────────────────
// Sets handle + routes bottom-bar input to Ably.

export function activateTelnet(handle: string, sendFn: SendFn, disconnectFn: DisconnectFn): void {
  _handle       = handle;
  _sendFn       = sendFn;
  _disconnectFn = disconnectFn;
  _active       = true;
  _listeners.forEach(fn => fn(handle));
}

export function deactivateTelnet(): void {
  _sendFn       = null;
  _disconnectFn = null;
  _active       = false;
  // Keep _handle so prompt stays showing the player's name after downgrade to single
}

export function clearHandle(): void {
  _handle = null;
  _listeners.forEach(fn => fn(''));
}

export function isTelnetActive(): boolean {
  return _active;
}

export function getTelnetHandle(): string {
  return _handle ?? 'node';
}

export function telnetSend(text: string): void {
  _sendFn?.(text);
}

export function telnetDisconnect(): void {
  _disconnectFn?.();
}
