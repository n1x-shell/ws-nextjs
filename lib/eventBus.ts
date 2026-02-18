import { NeuralEvent, EventCallback } from '@/types/neural.types';

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  emit(type: string, payload?: any): void {
    const event: NeuralEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardCallbacks = this.listeners.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in wildcard event listener:', error);
        }
      });
    }
  }

  on(type: string, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => this.off(type, callback);
  }

  off(type: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

// ARG events:
// 'arg:fragment-decoded'      payload: { fragment: string }
// 'arg:manifest-complete'     payload: none
// 'arg:transmission-complete' payload: none
// 'arg:trust-level-change'    payload: { level: TrustLevel }
