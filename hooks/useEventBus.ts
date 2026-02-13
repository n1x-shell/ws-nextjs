import { useEffect, useRef } from 'react';
import { eventBus } from '@/lib/eventBus';
import { EventCallback } from '@/types/neural.types';

export function useEventBus(eventType: string, callback: EventCallback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const wrappedCallback: EventCallback = (event) => {
      callbackRef.current(event);
    };

    const unsubscribe = eventBus.on(eventType, wrappedCallback);
    return unsubscribe;
  }, [eventType]);
}

export function useEventEmitter() {
  return {
    emit: eventBus.emit.bind(eventBus),
  };
}
