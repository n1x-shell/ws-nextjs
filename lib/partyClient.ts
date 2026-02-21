'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import PartySocket from 'partysocket';
import { exportForRoom, mergeFromRoom, type TrustLevel } from '@/lib/argState';
import { eventBus } from '@/lib/eventBus';

export type DaemonState = 'dormant' | 'aware' | 'active' | 'exposed';

export interface RoomMsg {
  id: string;
  handle: string;
  text: string;
  ts: number;
  isN1X: boolean;
  isSystem: boolean;
  isUnprompted: boolean;
}

interface UsePartySocketResult {
  messages: RoomMsg[];
  occupantCount: number;
  daemonState: DaemonState;
  roomTrust: TrustLevel;
  activityScore: number;
  collectiveFragments: string[];
  isConnected: boolean;
  send: (text: string) => void;
  f010Events: Array<{ key: string; witnesses: string[]; ts: number }>;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function usePartySocket(handle: string): UsePartySocketResult {
  const [messages, setMessages] = useState<RoomMsg[]>([]);
  const [occupantCount, setOccupantCount] = useState(0);
  const [daemonState, setDaemonState] = useState<DaemonState>('dormant');
  const [roomTrust, setRoomTrust] = useState<TrustLevel>(0);
  const [activityScore, setActivityScore] = useState(0);
  const [collectiveFragments, setCollectiveFragments] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [f010Events, setF010Events] = useState<Array<{ key: string; witnesses: string[]; ts: number }>>([]);

  const socketRef = useRef<PartySocket | null>(null);
  const latestSyncRef = useRef<Parameters<typeof mergeFromRoom>[0] | null>(null);

  const addMessage = useCallback((msg: Omit<RoomMsg, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const send = useCallback((text: string) => {
    socketRef.current?.send(JSON.stringify({ type: 'chat', text }));
  }, []);

  useEffect(() => {
    if (!handle) return;

    const partykitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!partykitHost) {
      console.warn('[partyClient] NEXT_PUBLIC_PARTYKIT_HOST not set');
      return;
    }

    const argState = exportForRoom();

    const socket = new PartySocket({
      host: partykitHost,
      room: 'port-33',
    });

    socketRef.current = socket;

    socket.addEventListener('open', () => {
      setIsConnected(true);
      // Send join message
      socket.send(JSON.stringify({
        type: 'join',
        handle,
        argState,
      }));
    });

    socket.addEventListener('close', () => {
      setIsConnected(false);
      // Apply any pending sync
      if (latestSyncRef.current) {
        mergeFromRoom(latestSyncRef.current);
        latestSyncRef.current = null;
      }
    });

    socket.addEventListener('message', (event: MessageEvent) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(event.data as string);
      } catch {
        return;
      }

      const msgType = data.type as string;

      switch (msgType) {
        case 'room_state':
        case 'state_update': {
          if (data.daemonState) setDaemonState(data.daemonState as DaemonState);
          if (typeof data.occupantCount === 'number') setOccupantCount(data.occupantCount);
          if (typeof data.activityScore === 'number') setActivityScore(data.activityScore);
          if (typeof data.roomTrust === 'number') setRoomTrust(data.roomTrust as TrustLevel);
          if (Array.isArray(data.collectiveFragments)) setCollectiveFragments(data.collectiveFragments as string[]);
          break;
        }

        case 'init': {
          if (data.daemonState) setDaemonState(data.daemonState as DaemonState);
          if (typeof data.occupantCount === 'number') setOccupantCount(data.occupantCount);
          if (typeof data.activityScore === 'number') setActivityScore(data.activityScore);
          if (typeof data.roomTrust === 'number') setRoomTrust(data.roomTrust as TrustLevel);
          if (Array.isArray(data.collectiveFragments)) setCollectiveFragments(data.collectiveFragments as string[]);
          if (Array.isArray(data.f010Events)) setF010Events(data.f010Events as typeof f010Events);

          // Replay recent messages
          if (Array.isArray(data.recentMessages)) {
            const recent = (data.recentMessages as Array<RoomMsg>).map(m => ({
              ...m,
              id: makeId(),
            }));
            setMessages(recent);
          }

          // Apply merged trust/fragments from room to local state
          if (typeof data.trust === 'number' && Array.isArray(data.fragments)) {
            mergeFromRoom({
              trust: data.trust as TrustLevel,
              fragments: data.fragments as string[],
              ghostUnlocked: (data.ghostUnlocked as boolean) ?? false,
            });
          }
          break;
        }

        case 'message': {
          addMessage({
            handle: data.handle as string,
            text: data.text as string,
            ts: data.ts as number,
            isN1X: false,
            isSystem: false,
            isUnprompted: false,
          });
          break;
        }

        case 'n1x_response': {
          addMessage({
            handle: 'N1X',
            text: data.text as string,
            ts: data.ts as number,
            isN1X: true,
            isSystem: false,
            isUnprompted: false,
          });
          break;
        }

        case 'unprompted': {
          addMessage({
            handle: 'N1X',
            text: data.text as string,
            ts: data.ts as number,
            isN1X: true,
            isSystem: false,
            isUnprompted: true,
          });
          break;
        }

        case 'system': {
          addMessage({
            handle: 'SYSTEM',
            text: data.text as string,
            ts: data.ts as number,
            isN1X: false,
            isSystem: true,
            isUnprompted: false,
          });
          break;
        }

        case 'sync': {
          // Store sync data to apply on disconnect
          latestSyncRef.current = {
            trust: data.trust as TrustLevel,
            fragments: data.fragments as string[],
            ghostUnlocked: data.ghostUnlocked as boolean,
          };
          // Apply immediately too (best-effort on page navigation)
          mergeFromRoom(latestSyncRef.current);

          // Update f010 keys in local storage if any
          if (Array.isArray(data.f010Keys) && (data.f010Keys as string[]).length > 0) {
            eventBus.emit('arg:f010-keys-received', { keys: data.f010Keys });
          }
          break;
        }

        default:
          break;
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      if (latestSyncRef.current) {
        mergeFromRoom(latestSyncRef.current);
        latestSyncRef.current = null;
      }
    };
  }, [handle, addMessage]);

  return {
    messages,
    occupantCount,
    daemonState,
    roomTrust,
    activityScore,
    collectiveFragments,
    isConnected,
    send,
    f010Events,
  };
}
