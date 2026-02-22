'use client';

// ── Telnet Multiplayer Bridge ────────────────────────────────────────────────
// When an Ably multiplayer session is active, commandRegistry checks this
// module before routing input. Active session captures all normal input
// and forwards it to the Ably channel instead of the command system.

type SendFn = (text: string) => void;
type DisconnectFn = () => void;

let _send: SendFn | null = null;
let _disconnect: DisconnectFn | null = null;

export const telnetBridge = {
  activate: (send: SendFn, disconnect: DisconnectFn) => {
    _send = send;
    _disconnect = disconnect;
  },
  deactivate: () => {
    _send = null;
    _disconnect = null;
  },
  isActive: () => _send !== null,
  send: (text: string) => {
    _send?.(text);
  },
  disconnect: () => {
    _disconnect?.();
  },
};
