import { Tab } from '@/types/neural.types';
import { eventBus } from './eventBus';

export function renderStreamContent(stream: Tab) {
  switch (stream) {
    case 'synthetics':
      // Emit event — ShellInterface renders SyntheticsPlayer as overlay
      if (typeof window !== 'undefined') {
        setTimeout(() => eventBus.emit('shell:synthetics-open'), 0);
      }
      return null;

    case 'analogues':
      if (typeof window !== 'undefined') {
        setTimeout(() => eventBus.emit('shell:analogues-open'), 0);
      }
      return null;

    case 'hybrids':
      if (typeof window !== 'undefined') {
        setTimeout(() => eventBus.emit('shell:hybrids-open'), 0);
      }
      return null;

    case 'uplink':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="text-glow" style={{ fontSize: 'var(--text-header)' }}>
            &gt; EXTERNAL_UPLINK
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.9, lineHeight: 1.6 }}>
            Primary broadcast node for all transmissions.
            All streams are mirrored to this external platform.
          </div>
          <div
            className="border border-[var(--phosphor-green)]"
            style={{ padding: '1.5rem', background: 'black' }}
          >
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.8, marginBottom: '1rem' }}>
              &gt; ESTABLISHING_CONNECTION...
            </p>
            <p style={{ fontSize: 'var(--text-base)', marginBottom: '0.4rem' }}>Primary Node:</p>
            <a
              href="https://youtube.com/@lvtunnelcore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-glow-strong"
              style={{ fontSize: 'var(--text-header)', display: 'block', marginBottom: '1.5rem' }}
            >
              &gt;&gt; YOUTUBE://LVTUNNELCORE
            </a>
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.6, marginTop: '1.5rem' }}>
              All audio-visual data streams are archived at this location.
            </p>
            <div style={{ marginTop: '1.5rem', opacity: 0.4, fontSize: 'var(--text-base)' }}>
              <p>↑↑↓↓←→←→BA</p>
              <p style={{ marginTop: '0.4rem' }}>01001110_01001001_01011000</p>
            </div>
          </div>
        </div>
      );

    case 'home':
    default:
      return null;
  }
}
