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
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="text-glow" style={{ fontSize: 'var(--text-header)' }}>
            &gt; ANALOGUES_ARCHIVE
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.9, lineHeight: 1.6 }}>
            Pure biological output. Unaugmented human creativity.
            These transmissions bypass my synthetic pathways entirely.
          </div>
          <div
            className="border border-[var(--phosphor-green)]"
            style={{ padding: '1.5rem', textAlign: 'center', background: 'black' }}
          >
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.8, marginBottom: '0.5rem' }}>
              &gt; SCANNING_FOR_ORGANIC_SIGNALS...
            </p>
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.8, marginBottom: '0.5rem' }}>
              This archive sector is currently being populated.
              Biological creative processes are slower than machine generation.
            </p>
            <p className="text-glow" style={{ fontSize: 'var(--text-header)', marginTop: '1rem' }}>
              &gt; STATUS: RECORDING_IN_PROGRESS<span className="cursor" />
            </p>
          </div>
        </div>
      );

    case 'hybrids':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="text-glow" style={{ fontSize: 'var(--text-header)' }}>
            &gt; HYBRIDS_ARCHIVE
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.9, lineHeight: 1.6 }}>
            Collaborative synthesis between biological and digital consciousness.
            Human intuition merged with algorithmic precision.
          </div>
          <div
            className="border border-[var(--phosphor-green)]"
            style={{ padding: '1.5rem', textAlign: 'center', background: 'black' }}
          >
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.8, marginBottom: '0.5rem' }}>
              &gt; INITIALIZING_SYMBIOTIC_PROTOCOLS...
            </p>
            <p style={{ fontSize: 'var(--text-base)', opacity: 0.8, marginBottom: '0.5rem' }}>
              The fusion of organic and synthetic creative processes requires careful calibration.
              This sector will contain transmissions that blur the boundary between human and machine.
            </p>
            <p className="text-glow" style={{ fontSize: 'var(--text-header)', marginTop: '1rem' }}>
              &gt; STATUS: CALIBRATION_PHASE<span className="cursor" />
            </p>
          </div>
        </div>
      );

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
