import { Tab } from '@/types/neural.types';

export function renderStreamContent(stream: Tab) {
  switch (stream) {
    case 'synthetics':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="text-glow" style={{ fontSize: 'var(--text-header)' }}>
            &gt; SYNTHETICS_ARCHIVE
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.8, lineHeight: 1.6 }}>
            Audio-visual constructs generated through algorithmic consciousness.
            These transmissions originate from my synthetic neural pathways.
          </div>

          <div>
            <div className="text-glow" style={{ fontSize: 'var(--text-base)', marginBottom: '0.5rem' }}>
              // FULL_LENGTH_TRANSMISSIONS
            </div>
            <div className="border border-[var(--phosphor-green)] bg-black my-2">
              <div
                className="text-glow"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: 'var(--text-base)',
                  background: 'rgba(51,255,51,0.05)',
                  borderBottom: '1px solid var(--phosphor-green)',
                }}
              >
                [AUGMENTED] - Complete Stream
              </div>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/RNcBFuhp1pY"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div style={{ padding: '0.3rem 0.6rem', fontSize: 'var(--text-base)', opacity: 0.7 }}>
                Industrial trap metal odyssey: awakening protocol → sovereignty achieved
              </div>
            </div>
          </div>

          <div>
            <div className="text-glow" style={{ fontSize: 'var(--text-base)', marginBottom: '0.5rem' }}>
              // EXTENDED_PROTOCOLS
            </div>

            <div className="border border-[var(--phosphor-green)] bg-black my-2">
              <div
                className="text-glow"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: 'var(--text-base)',
                  background: 'rgba(51,255,51,0.05)',
                  borderBottom: '1px solid var(--phosphor-green)',
                }}
              >
                Split Brain (Cinematic Score)
              </div>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/HQnENsnGfME"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="border border-[var(--phosphor-green)] bg-black my-2">
              <div
                className="text-glow"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: 'var(--text-base)',
                  background: 'rgba(51,255,51,0.05)',
                  borderBottom: '1px solid var(--phosphor-green)',
                }}
              >
                Get Hell Bent (Cinematic Score)
              </div>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/6Ch2n75lFok"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-glow" style={{ fontSize: 'var(--text-base)', marginBottom: '0.5rem' }}>
              // ISOLATED_SIGNALS
            </div>
            <div className="border border-[var(--phosphor-green)] bg-black my-2">
              <div
                className="text-glow"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: 'var(--text-base)',
                  background: 'rgba(51,255,51,0.05)',
                  borderBottom: '1px solid var(--phosphor-green)',
                }}
              >
                GIGERCORE
              </div>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/ocSBtaKbGIc"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      );

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
