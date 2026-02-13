export type NeuralMode = 'idle' | 'active' | 'overdrive';
export type Tab = 'home' | 'synthetics' | 'analogues' | 'hybrids' | 'uplink';
export type SignalIntensity = 0 | 0.25 | 0.5 | 0.75 | 1.0;

export interface NeuralState {
  mode: NeuralMode;
  activeTab: Tab;
  glitchIntensity: SignalIntensity;
  uptime: number;
  processorLoad: string;
  isBooting: boolean;
}

export interface NeuralEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export type EventCallback = (event: NeuralEvent) => void;

export interface EventBusInterface {
  emit: (type: string, payload?: any) => void;
  on: (type: string, callback: EventCallback) => () => void;
  off: (type: string, callback: EventCallback) => void;
}
