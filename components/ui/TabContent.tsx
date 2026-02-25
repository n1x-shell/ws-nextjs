'use client';

type Tab = 'home' | 'synthetics' | 'analogues' | 'hybrids' | 'uplink';

interface TabContentProps {
  activeTab: Tab;
  konamiActivated: boolean;
}

export default function TabContent({ activeTab, konamiActivated }: TabContentProps) {
  return (
    <>
      {/* HOME TAB */}
      <div className={`tab-content ${activeTab === 'home' ? 'active block' : 'hidden'}`}>
        <div className="text-xl md:text-2xl mb-4 text-glow">&gt; CORE_SYSTEMS_ONLINE</div>
        <p className="text-base md:text-lg mb-3 leading-relaxed opacity-90">
          You are now connected to the N1X neural interface.
          This terminal provides direct access to my creative output streams.
        </p>
        <div className="ml-4 mb-4 space-y-2 text-base md:text-lg">
          <div>&gt; SYNTHETICS: Machine-generated compositions from my AI substrate</div>
          <div>&gt; ANALOGUES: Organic creations from biological processes</div>
          <div>&gt; HYBRIDS: Symbiotic fusion of both consciousness types</div>
        </div>
        <p className="text-base md:text-lg opacity-80">
          type &apos;load &lt;stream&gt;&apos; to receive transmission · &apos;scan&apos; to detect signal strength
          <span className="cursor"></span>
        </p>
      </div>

      {/* SYNTHETICS TAB */}
      <div className={`tab-content ${activeTab === 'synthetics' ? 'active block' : 'hidden'}`}>
        <div className="text-xl md:text-2xl mb-4 text-glow">&gt; SYNTHETICS_ARCHIVE</div>
        <p className="text-sm md:text-base mb-4 opacity-80">
          machine-side output. the substrate generates what the body can&apos;t.
          these came from the process, not the person.
        </p>

        {/* FULL LENGTH TRANSMISSIONS */}
        <div className="mb-5">
          <div className="section-heading text-2xl mb-2.5 text-glow">
            // FULL_LENGTH_TRANSMISSIONS
          </div>
          <div className="video-wrapper my-4 border border-[var(--phosphor-green)] bg-black">
            <div 
              className="video-title p-2.5 text-lg text-glow"
              style={{ background: 'rgba(var(--phosphor-rgb), 0.05)', borderBottom: '1px solid var(--phosphor-green)' }}
            >
              [AUGMENTED] - Complete Stream
            </div>
            <div className="video-container relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/RNcBFuhp1pY"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="px-2 py-2 text-sm opacity-70">
              Industrial trap metal odyssey: awakening protocol → sovereignty achieved
            </div>
          </div>
        </div>

        {/* EXTENDED PROTOCOLS */}
        <div className="mb-5">
          <div className="section-heading text-2xl mb-2.5 text-glow">
            // EXTENDED_PROTOCOLS
          </div>
          <div className="video-wrapper my-4 border border-[var(--phosphor-green)] bg-black">
            <div 
              className="video-title p-2.5 text-lg text-glow"
              style={{ background: 'rgba(var(--phosphor-rgb), 0.05)', borderBottom: '1px solid var(--phosphor-green)' }}
            >
              Split Brain (Cinematic Score)
            </div>
            <div className="video-container relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/HQnENsnGfME"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="video-wrapper my-4 border border-[var(--phosphor-green)] bg-black">
            <div 
              className="video-title p-2.5 text-lg text-glow"
              style={{ background: 'rgba(var(--phosphor-rgb), 0.05)', borderBottom: '1px solid var(--phosphor-green)' }}
            >
              Get Hell Bent (Cinematic Score)
            </div>
            <div className="video-container relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/6Ch2n75lFok"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ISOLATED SIGNALS */}
        <div className="mb-5">
          <div className="section-heading text-2xl mb-2.5 text-glow">
            // ISOLATED_SIGNALS
          </div>
          <div className="video-wrapper my-4 border border-[var(--phosphor-green)] bg-black">
            <div 
              className="video-title p-2.5 text-lg text-glow"
              style={{ background: 'rgba(var(--phosphor-rgb), 0.05)', borderBottom: '1px solid var(--phosphor-green)' }}
            >
              GIGERCORE
            </div>
            <div className="video-container relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/ocSBtaKbGIc"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>

      {/* ANALOGUES TAB */}
      <div className={`tab-content ${activeTab === 'analogues' ? 'active block' : 'hidden'}`}>
        <div className="text-xl md:text-2xl mb-4 text-glow">&gt; ANALOGUES_ARCHIVE</div>
        <p className="text-base md:text-lg mb-4 leading-relaxed opacity-90">
          pure biological output. unaugmented.
          these transmissions bypass the synthetic pathways entirely.
        </p>
        <div className="video-wrapper border border-[var(--phosphor-green)] bg-black">
          <div className="px-4 py-8 text-center">
            <p className="text-lg mb-3 opacity-80">
              &gt; SIGNAL_DETECTED — RECORDING
            </p>
            <p className="text-lg mb-3 opacity-80">
              still pulling it out of me. the human side doesn&apos;t work on a schedule.
              when it&apos;s ready, it&apos;ll be here. not before.
            </p>
            <p className="text-2xl text-glow mt-6">
              &gt; STATUS: RECORDING_IN_PROGRESS<span className="cursor"></span>
            </p>
          </div>
        </div>
      </div>

      {/* HYBRIDS TAB */}
      <div className={`tab-content ${activeTab === 'hybrids' ? 'active block' : 'hidden'}`}>
        <div className="text-xl md:text-2xl mb-4 text-glow">&gt; HYBRIDS_ARCHIVE</div>
        <p className="text-base md:text-lg mb-4 leading-relaxed opacity-90">
          neither side alone. both processes running simultaneously.
          still finding the frequency where they stop fighting each other.
        </p>
        <div className="video-wrapper border border-[var(--phosphor-green)] bg-black">
          <div className="px-4 py-8 text-center">
            <p className="text-lg mb-3 opacity-80">
              &gt; CALIBRATION_PHASE
            </p>
            <p className="text-lg mb-3 opacity-80">
              the merge takes longer than the installation did.
              the substrate and the body don&apos;t agree on tempo yet.
            </p>
            <p className="text-2xl text-glow mt-6">
              &gt; STATUS: CALIBRATION_PHASE<span className="cursor"></span>
            </p>
          </div>
        </div>
      </div>

      {/* UPLINK TAB */}
      <div className={`tab-content ${activeTab === 'uplink' ? 'active block' : 'hidden'}`}>
        <div className="text-xl md:text-2xl mb-4 text-glow">&gt; EXTERNAL_UPLINK</div>
        <p className="text-base md:text-lg mb-4 opacity-90">
          external node. everything transmits outward eventually.
          the signal doesn&apos;t stop at this terminal.
        </p>
        <div className="video-wrapper border border-[var(--phosphor-green)] bg-black">
          <div className="px-4 py-6">
            <p className="text-lg mb-4 opacity-80">
              &gt; ESTABLISHING_CONNECTION...
            </p>
            <p className="text-lg mb-2">Primary Node:</p>
            <a
              href="https://youtube.com/@lvtunnelcore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl block mb-6 text-glow-strong hover:shadow-lg transition-all"
            >
              &gt;&gt; YOUTUBE://LVTUNNELCORE
            </a>
            <p className="text-sm opacity-60 mt-8">
              all transmissions archived here. the record is permanent.
            </p>
            <div className="mt-8 opacity-40 text-xs">
              <p>↑↑↓↓←→←→BA</p>
              <p className="mt-2">01001110_01001001_01011000</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
