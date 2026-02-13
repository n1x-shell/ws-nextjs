<button
  key={tab.id}
  className={`tab-btn px-3.5 py-1.5 border border-[var(--phosphor-green)] cursor-pointer transition-all uppercase tracking-wide ${
    activeTab === tab.id
      ? 'bg-[var(--phosphor-green)] text-[var(--terminal-bg)]'
      : 'bg-transparent text-[var(--phosphor-green)]'
  }`}
  style={{
    fontSize: '18px',
    fontFamily: 'inherit',
    boxShadow: activeTab === tab.id ? '0 0 8px rgba(51, 255, 51, 0.5)' : 'none',
  }}
  onClick={() => handleTabChange(tab.id)}
  onMouseEnter={handleHover}
>
  {tab.label}
</button>
