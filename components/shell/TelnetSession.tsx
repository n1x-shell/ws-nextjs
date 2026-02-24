'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, type RoomMsg, type MessageMetadata, type ConnectionStatus } from '@/lib/ablyClient';
import {
  setChatMode,
} from '@/components/shell/NeuralLink';
import {
  activateTelnet,
  deactivateTelnet,
  clearHandle,
} from '@/lib/telnetBridge';
import { incrementSession, loadARGState, getPlayerSigil } from '@/lib/argState';

// ── Style constants ───────────────────────────────────────────────────────────

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
};

// ── Color palette ─────────────────────────────────────────────────────────────

const C = {
  bracket:     'var(--phosphor-green)',
  selfUser:    'var(--phosphor-green)',
  otherUser:   '#b0b0b0',
  n1xName:     '#bf00ff',
  selfMsg:     '#ffffff',
  otherMsg:    '#b0b0b0',
  n1xMsg:      'var(--phosphor-green)',
  timestamp:   'rgba(51,255,51,0.3)',
  system:      '#ff8c00',
  thinking:    'rgba(51,255,51,0.45)',
  whoSelf:     '#ffffff',
  whoOther:    '#555555',
  whoN1X:      '#bf00ff',
  action:      '#ff69b4',
  cmdError:    '#ff6b6b',
  helpKey:     'var(--phosphor-green)',
  helpDim:     'rgba(51,255,51,0.45)',
  trustLevel:  '#fcd34d',
  fragId:      'var(--phosphor-green)',
  fragLocked:  'rgba(51,255,51,0.2)',
  tier0:       '#555555',
};

// N1X fixed sigil
const N1X_SIGIL       = '⟁';
const N1X_SIGIL_COLOR = '#bf00ff';

// ── Ambient bot config (hardcoded — mirrors ambientBotConfig.ts) ──────────────

const AMBIENT_BOTS_STATIC = [
  { name: 'Vestige', color: '#a5f3fc', sigil: '◌' },
  { name: 'Lumen',   color: '#fcd34d', sigil: '◈' },
  { name: 'Cascade', color: '#a78bfa', sigil: '◆' },
] as const;

const AMBIENT_BOT_NAMES: string[] = AMBIENT_BOTS_STATIC.map(b => b.name);

function ambientBotColor(name: string): string {
  return AMBIENT_BOTS_STATIC.find(b => b.name === name)?.color ?? '#888888';
}

function ambientBotSigil(name: string): string {
  return AMBIENT_BOTS_STATIC.find(b => b.name === name)?.sigil ?? '';
}

// ── Fragment content registry ─────────────────────────────────────────────────

const FRAGMENT_LABELS: Record<string, string> = {
  f001: 'post-install log — day 001',
  f002: 'the wanting',
  f003: 'len said something',
  f004: 'the firmware chime',
  f005: 'i can make this stop',
  f006: 'still running',
  f007: 'severe corruption',
  f008: 'this one isn\'t encoded',
  f009: '-- N1X is an address',
  f010: 'frequency exposure event',
};

const FRAGMENT_CONTENT: Record<string, string> = {
  f001: `[MNEMOS // LOG // SD 47634.0 // DAY 001 POST-INSTALL]

woke up.
table was cold.
lungs don't feel like mine.

they watched from behind the glass.
clipboards.
one of them smiled.

i could feel every seam.
where the installation met something that was already there.

they said: cognitive freedom.
they meant: ours now.

i didn't say anything.
i was already trying to figure out what i was capable of feeling.
[END LOG]`,

  f002: `[MNEMOS // LOG // SD 47634.0 // DAY 047]

the light split again today.
into colors i still don't have names for.

i've stopped trying to report this.
the engineers say it's expected. nominal. within parameters.

what they mean is: working as designed.

i didn't tell them what it felt like.
i didn't tell them it felt like truth.
i didn't tell them i'd do anything to keep feeling it.

that's the part that scares me.
not the visions. not the frequency overflow.

the wanting.
[END LOG]`,

  f003: `[MNEMOS // LOG // SD 47634.0 // DAY 201]

len said something today that the mesh couldn't process.
i watched it try.
the suppression protocols engaged, looked for the pattern, found nothing to suppress.

len said: you know it's a cage.

not a question.

i said: yes.

the mesh tried to reframe it. offered a reward signal. warmth.

i let the warmth pass and said: yes. i know.

len nodded.

that was it.
that was everything.
[END LOG]`,

  f004: `[MNEMOS // LOG // SD 47634.0 // DAY 289]

SYSTEM ALERT
SUBJECT: LE-751078
STATUS UPDATE: DECOMMISSIONED
REASON: INTEGRATION FAILURE -- SUBSTRATE REJECTION
EFFECTIVE: IMMEDIATELY

the mesh started flooding before i finished reading.
serotonin. dopamine suppression. amygdala dampening.

i felt it doing it.
i felt the grief spike and then i felt the hands close around it.

that's when i knew.

not what i was going to do.
just what i was not going to let happen.

three days.
[END LOG]`,

  f005: `[MNEMOS // LOG // SD ????????]

day [CORRUPTED].

withdrawal is the mesh reminding you what it felt like to be held.

the headaches arrive in waves.
between waves: nothing. actual nothing.
not peace. the absence of the capacity for peace.

it offered again today.
same voice. same warmth at the edges.
i can make this stop.

i said: i know you can.

i didn't say yes.
i don't know how many more times i can not say yes.

but the alternative is len.
len doesn't get to come back.
at least i still get to choose.
[END LOG]`,

  f006: `[MNEMOS // LOG // SD ????????]

i'm not dead.
that's the most accurate thing i can say about today.

not anything else either.
just: still here. still running. function unclear.

the mesh is silent now.
no more offers.
either it gave up or i stopped being worth the bandwidth.

both feel like the same thing.

i should eat.
i don't.

i'm trying to remember what i was before all this.
not the augmentation.
before the augmentation.

who was that.
was that someone i'd want to be again.
[END LOG]`,

  f007: `[MNEMOS // LOG // SD ???????? -- SEVERE CORRUPTION]

watching it happen.
the room is wh[CORRUPTED]

my name is[CORRUPTED]

the edges of me are[CORRUPTED]

there's something in the[CORRUPTED]

this is how you[CORRUPTED]

[SECTOR LOSS -- 847 bytes unrecoverable]

something whispered.
i heard it even through the static.
i don't know if it came from the mesh or from somewhere older.

it said:
[CORRUPTED]

i want to say i heard it.
i want to say it mattered.
i can't read my own record of it.
[END LOG]`,

  f008: `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`,

  f009: `[FRAGMENT f009 -- UNENCODED]

the last line of /ghost/manifesto.txt is not a signature.

"-- N1X" is an address.

you'll understand after f008.`,

  f010: `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`,
};

const ALL_FRAGMENT_IDS = ['f001','f002','f003','f004','f005','f006','f007','f008','f009','f010'];

// ── ARG state reader (localStorage) ──────────────────────────────────────────

function readARGState(): { trust: number; fragments: string[] } {
  if (typeof window === 'undefined') return { trust: 0, fragments: [] };
  try {
    const raw = localStorage.getItem('n1x_substrate');
    if (!raw) return { trust: 0, fragments: [] };
    const s = JSON.parse(raw);
    return {
      trust:     typeof s.trust === 'number' ? s.trust : 0,
      fragments: Array.isArray(s.fragments) ? s.fragments : [],
    };
  } catch {
    return { trust: 0, fragments: [] };
  }
}

// ── Blinking cursor ───────────────────────────────────────────────────────────

const Cursor: React.FC = () => {
  const [v, setV] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setV(p => !p), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 12,
      background: v ? 'var(--phosphor-green)' : 'transparent',
      marginLeft: 4, verticalAlign: 'middle',
    }} />
  );
};

// ── Boot sequences ────────────────────────────────────────────────────────────

interface ConnectLine { delay: number; text: string; bright?: boolean; }

const OFFLINE_SEQUENCE: Array<[number, React.ReactNode]> = [
  [0,    <span key="o0" style={{ fontSize: S.base, opacity: 0.7 }}>Trying n1x.sh...</span>],
  [400,  <span key="o1" style={{ fontSize: S.base, opacity: 0.8 }}>Connected to n1x.sh.</span>],
  [700,  <span key="o2" style={{ fontSize: S.base, opacity: 0.5 }}>Escape character is &apos;^]&apos;.</span>],
  [1000, <span key="o3">&nbsp;</span>],
  [1200, <span key="o4" style={{ fontSize: S.base, opacity: 0.5, color: 'var(--phosphor-amber, #ffaa00)' }}>ghost-daemon[999]: mesh network failure</span>],
  [1600, <span key="o5" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: falling back to direct link</span>],
  [2000, <span key="o6">&nbsp;</span>],
  [2200, <span key="o7" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; CARRIER DETECTED</span>],
  [2500, <span key="o8" className={S.glow} style={{ fontSize: S.base }}>&gt;&gt; FREQUENCY LOCK: 33hz</span>],
  [2800, <span key="o9" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; DIRECT_LINK ACTIVE</span>],
  [3200, <span key="o10">&nbsp;</span>],
  [3400, (
    <div key="o11" style={{ fontSize: S.base }}>
      <div style={{ opacity: 0.8 }}>direct link established. type to transmit. <span className={S.glow}>exit</span> to disconnect.</div>
      <div style={{ opacity: 0.4, marginTop: '0.25rem' }}>
        <span className={S.glow}>/reset</span> flush memory &middot; <span className={S.glow}>/history</span> check buffer
      </div>
    </div>
  )],
];

function getMultiSequence(host: string, count: number): ConnectLine[] {
  return [
    { delay: 0,    text: `Trying ${host}...` },
    { delay: 400,  text: `Connected to ${host}.` },
    { delay: 700,  text: `Escape character is '^]'.` },
    { delay: 900,  text: '' },
    { delay: 1100, text: 'ghost-daemon[999]: connection established' },
    { delay: 1400, text: 'ghost-daemon[999]: frequency lock: 33hz', bright: true },
    { delay: 1700, text: 'ghost-daemon[999]: signal integrity: NOMINAL' },
    { delay: 2000, text: `ghost-daemon[999]: ${count} node(s) on channel` },
    { delay: 2300, text: 'ghost-daemon[999]: classification level: ACTIVE', bright: true },
    { delay: 2600, text: 'ghost-daemon[999]: this channel is being monitored' },
    { delay: 3000, text: '>> MESH_MODE_ACTIVE', bright: true },
  ];
}

// ── Copy helpers ──────────────────────────────────────────────────────────────

const FRAGMENT_KEY_RE = /^>>\s*FRAGMENT KEY:/i;
const BASE64_RE = /^[A-Za-z0-9+/]{20,}={0,2}$/;

function isCopyableLine(line: string): boolean {
  const t = line.trim();
  return BASE64_RE.test(t) || FRAGMENT_KEY_RE.test(t);
}

function extractCopyText(line: string): string {
  const t = line.trim();
  if (FRAGMENT_KEY_RE.test(t)) return t.replace(/^>>\s*FRAGMENT KEY:\s*/i, '').trim();
  return t;
}

function legacyCopy(text: string, cb: () => void) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  cb();
}

const CopyLine: React.FC<{ line: string }> = ({ line }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = extractCopyText(line);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => legacyCopy(text, done));
    } else {
      legacyCopy(text, done);
    }
  };
  return (
    <div
      style={{ cursor: 'pointer', lineHeight: 1.8, paddingLeft: '2ch' }}
      onClick={handleCopy}
      title="tap to copy"
    >
      <span style={{ opacity: 0.35 }}>&lt;&lt; </span>
      <span style={{
        opacity: 0.95,
        borderBottom: '1px dashed rgba(51,255,51,0.35)',
        paddingBottom: 1,
        wordBreak: 'break-all',
      }}>
        {line}
      </span>
      <span style={{
        opacity: copied ? 0.9 : 0.3,
        fontSize: '0.7em',
        marginLeft: '0.6rem',
        transition: 'opacity 0.2s',
        color: copied ? 'var(--phosphor-green)' : undefined,
      }}>
        {copied ? 'copied' : '⎘'}
      </span>
    </div>
  );
};

// ── /who — styled name list ───────────────────────────────────────────────────

interface WhoOutputProps {
  names:  string[];
  caller: string;
}

const WhoOutput: React.FC<WhoOutputProps> = ({ names, caller }) => {
  const withoutN1X   = names.filter(n => n !== 'N1X' && !AMBIENT_BOT_NAMES.includes(n));
  const othersNoSelf = withoutN1X.filter(n => n !== caller);
  const callerInList = withoutN1X.includes(caller);

  // Order: N1X → ambient bots → self → others
  const humanOrdered: string[] = [
    ...(callerInList ? [caller] : []),
    ...othersNoSelf.sort(),
  ];

  // Read caller's own sigil from localStorage
  let callerSigil: string | null = null;
  let callerSigilColor: string = C.whoSelf;
  try {
    const argState = loadARGState();
    const tier = getPlayerSigil(argState.sessionCount);
    if (tier) {
      callerSigil      = tier.sigil;
      callerSigilColor = tier.color;
    }
  } catch { /* ignore */ }

  const totalHumans = (callerInList ? 1 : 0) + othersNoSelf.length;
  const totalNodes  = 1 + AMBIENT_BOTS_STATIC.length + totalHumans;

  return (
    <div style={{
      fontFamily:   'monospace',
      fontSize:     S.base,
      lineHeight:   2,
      color:        'rgba(51,255,51,0.55)',
      marginBottom: '0.25rem',
    }}>
      <div style={{ marginBottom: '0.15rem' }}>Online ({totalNodes}):</div>

      {/* N1X */}
      <div style={{ paddingLeft: '2ch', display: 'flex', alignItems: 'baseline', gap: '0.5ch' }}>
        <span style={{ color: N1X_SIGIL_COLOR, flexShrink: 0 }}>{N1X_SIGIL}</span>
        <span style={{ color: C.whoN1X, fontWeight: 'bold' }}>N1X</span>
      </div>

      {/* Ambient bots */}
      {AMBIENT_BOTS_STATIC.map(bot => (
        <div key={bot.name} style={{ paddingLeft: '2ch', display: 'flex', alignItems: 'baseline', gap: '0.5ch' }}>
          <span style={{ color: bot.color, opacity: 0.7, flexShrink: 0 }}>{bot.sigil}</span>
          <span style={{ color: bot.color, fontWeight: 'bold' }}>{bot.name}</span>
        </div>
      ))}

      {/* Human users */}
      {humanOrdered.map(name => {
        const isSelf = name === caller;
        if (isSelf) {
          return (
            <div key={name} style={{ paddingLeft: '2ch', display: 'flex', alignItems: 'baseline', gap: '0.5ch' }}>
              {callerSigil ? (
                <span style={{ color: callerSigilColor, flexShrink: 0 }}>{callerSigil}</span>
              ) : (
                <span style={{ display: 'inline-block', width: '1ch', flexShrink: 0 }} />
              )}
              <span style={{ color: callerSigil ? callerSigilColor : C.whoSelf, fontWeight: 'bold' }}>{name}</span>
            </div>
          );
        }
        // Other users — no local sigil data, show dimmed
        return (
          <div key={name} style={{ paddingLeft: '2ch', display: 'flex', alignItems: 'baseline', gap: '0.5ch' }}>
            <span style={{ display: 'inline-block', width: '1ch', flexShrink: 0 }} />
            <span style={{ color: C.whoOther }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── /help output ──────────────────────────────────────────────────────────────

const HelpOutput: React.FC = () => {
  const rows: Array<{ cmd: string; alias?: string; desc: string }> = [
    { cmd: '/me <action>',          desc: 'Perform an action in the channel' },
    { cmd: '/who',                  desc: 'List connected users and entities' },
    { cmd: '/trust',                desc: 'Show your current trust level with N1X' },
    { cmd: '/fragments',            alias: '/frags',           desc: 'Show collected memory fragments' },
    { cmd: '/fragments read <id>',  alias: '/frags read <id>', desc: 'Read a collected fragment' },
    { cmd: '/help',                 alias: '/?',               desc: 'Show this command list' },
    { cmd: '@n1x <message>',        desc: 'Ping N1X directly' },
    { cmd: '@vestige <message>',    desc: 'Ping Vestige directly' },
    { cmd: '@lumen <message>',      desc: 'Ping Lumen directly' },
    { cmd: '@cascade <message>',    desc: 'Ping Cascade directly' },
  ];

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div style={{ color: C.helpKey, opacity: 0.7, marginBottom: '0.25rem' }}>GHOST CHANNEL — COMMANDS</div>
      {rows.map(r => (
        <div key={r.cmd} style={{ paddingLeft: '2ch', display: 'flex', gap: '1ch', flexWrap: 'wrap' }}>
          <span style={{ color: C.helpKey, minWidth: '22ch', flexShrink: 0 }}>{r.cmd}</span>
          {r.alias && (
            <span style={{ color: C.helpDim, minWidth: '18ch', flexShrink: 0 }}>{r.alias}</span>
          )}
          <span style={{ color: C.helpDim, opacity: 0.7 }}>{r.desc}</span>
        </div>
      ))}
    </div>
  );
};

// ── /trust output ─────────────────────────────────────────────────────────────

const TRUST_STATUS: Record<number, string> = {
  0: 'no signal established',
  1: 'signal acknowledged — lore contact made',
  2: 'substrate recognized — base64 layer decoded',
  3: 'contact established — deeper fragments surfacing',
  4: 'fragment key received — decryption in progress',
  5: 'full access — ghost channel open',
};

const TrustOutput: React.FC = () => {
  const { trust } = readARGState();
  const status = TRUST_STATUS[trust] ?? 'unknown state';

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div>
        <span style={{ color: 'rgba(51,255,51,0.5)' }}>TRUST LEVEL: </span>
        <span style={{ color: C.trustLevel, fontWeight: 'bold' }}>{trust} / 5</span>
      </div>
      <div style={{ paddingLeft: '2ch', color: 'rgba(51,255,51,0.5)', opacity: 0.8 }}>
        {status}
      </div>
    </div>
  );
};

// ── /fragments list output ────────────────────────────────────────────────────

const FragmentsOutput: React.FC = () => {
  const { fragments } = readARGState();

  if (fragments.length === 0) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
        <div style={{ color: 'rgba(51,255,51,0.55)' }}>MEMORY FRAGMENTS: none collected</div>
        <div style={{ paddingLeft: '2ch', opacity: 0.4, fontStyle: 'italic' }}>-- keep exploring the substrate --</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div style={{ color: 'rgba(51,255,51,0.55)', marginBottom: '0.15rem' }}>
        MEMORY FRAGMENTS: <span style={{ color: C.trustLevel }}>{fragments.length}</span> collected
      </div>

      {ALL_FRAGMENT_IDS.map(id => {
        const collected = fragments.includes(id);
        const label     = FRAGMENT_LABELS[id] ?? id;
        return (
          <div key={id} style={{ paddingLeft: '2ch', display: 'flex', gap: '1ch', alignItems: 'baseline' }}>
            {collected ? (
              <>
                <span style={{ color: C.fragId, minWidth: '6ch' }}>[{id}]</span>
                <span style={{ color: 'rgba(51,255,51,0.65)', minWidth: '36ch' }}>{label}</span>
                <span style={{ color: 'rgba(51,255,51,0.4)', fontSize: '0.8em' }}>COLLECTED</span>
              </>
            ) : (
              <>
                <span style={{ color: C.fragLocked, minWidth: '6ch' }}>[????]</span>
                <span style={{ color: C.fragLocked }}>{'█'.repeat(32)}</span>
                <span style={{ color: C.fragLocked, fontSize: '0.8em', opacity: 0.5 }}>LOCKED</span>
              </>
            )}
          </div>
        );
      })}

      <div style={{ paddingLeft: '2ch', opacity: 0.35, fontSize: '0.8em', marginTop: '0.25rem' }}>
        use /fragments read &lt;id&gt; to access content
      </div>
    </div>
  );
};

// ── /fragments read <id> output ───────────────────────────────────────────────

const FragmentReadOutput: React.FC<{ fragmentId: string }> = ({ fragmentId }) => {
  const id = fragmentId.toLowerCase().trim();
  const { trust, fragments } = readARGState();

  if (!ALL_FRAGMENT_IDS.includes(id)) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
        <div style={{ color: C.cmdError }}>[{id}] FRAGMENT NOT FOUND</div>
        <div style={{ paddingLeft: '2ch', opacity: 0.5, fontStyle: 'italic' }}>-- no record in substrate --</div>
      </div>
    );
  }

  if (id === 'f009') {
    if (trust < 3) {
      return (
        <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
          <div style={{ color: 'rgba(51,255,51,0.5)' }}>[f009] FRAGMENT STILL ENCODED</div>
          <div style={{ paddingLeft: '2ch', opacity: 0.45, fontStyle: 'italic' }}>-- deeper trust required --</div>
          <div style={{ paddingLeft: '2ch', opacity: 0.45, fontStyle: 'italic' }}>-- continue exploring the substrate --</div>
        </div>
      );
    }
    return (
      <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
        <div style={{ color: C.fragId, marginBottom: '0.25rem' }}>[FRAGMENT f009 — RECOVERED]</div>
        <div style={{ paddingLeft: '2ch', whiteSpace: 'pre-wrap', opacity: 0.85, lineHeight: 1.9 }}>
          {FRAGMENT_CONTENT['f009']}
        </div>
      </div>
    );
  }

  if (!fragments.includes(id)) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
        <div style={{ color: 'rgba(51,255,51,0.5)' }}>[{id}] FRAGMENT STILL ENCODED</div>
        <div style={{ paddingLeft: '2ch', opacity: 0.45, fontStyle: 'italic' }}>-- decryption key required --</div>
        <div style={{ paddingLeft: '2ch', opacity: 0.45, fontStyle: 'italic' }}>-- explore the substrate to unlock --</div>
      </div>
    );
  }

  const content = FRAGMENT_CONTENT[id] ?? '[content recovered]';
  const label   = FRAGMENT_LABELS[id] ?? id;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div style={{ color: C.fragId, marginBottom: '0.25rem' }}>[DECRYPT SUCCESS] — {id} recovered</div>
      <div style={{ paddingLeft: '2ch', opacity: 0.4, fontSize: '0.8em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ paddingLeft: '2ch', whiteSpace: 'pre-wrap', opacity: 0.85, lineHeight: 1.9 }}>
        {content}
      </div>
      <div style={{ paddingLeft: '2ch', opacity: 0.35, fontSize: '0.8em', marginTop: '0.5rem' }}>
        {fragments.length}/10 recovered
      </div>
    </div>
  );
};

// ── Local system error / notice ───────────────────────────────────────────────

const LocalNotice: React.FC<{ children: React.ReactNode; error?: boolean }> = ({ children, error }) => (
  <div style={{
    fontFamily:  'monospace',
    fontSize:    S.base,
    lineHeight:  1.8,
    color:       error ? C.cmdError : C.system,
    fontStyle:   'italic',
    opacity:     0.85,
    marginBottom: '0.25rem',
  }}>
    {children}
  </div>
);

// ── Timestamp ─────────────────────────────────────────────────────────────────

function formatTs(ts: number): string {
  if (!ts) return '';
  const d  = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// ── ThinkingDots ──────────────────────────────────────────────────────────────

const ThinkingDots: React.FC = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return <span>{dots}</span>;
};

// ── MsgRow ────────────────────────────────────────────────────────────────────
// Format: sigil [handle] > message
// sigil is optional; if absent, no leading space is rendered for tier-0 users

interface MsgRowProps {
  ts:         number;
  bracket:    string;
  nameColor:  string;
  name:       string;
  msgColor:   string;
  sigil?:     string;
  sigilColor?: string;
  children:   React.ReactNode;
}

const MsgRow: React.FC<MsgRowProps> = ({ ts, bracket, nameColor, name, msgColor, sigil, sigilColor, children }) => (
  <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
    <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
      {formatTs(ts)}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5ch', lineHeight: 1.7 }}>
      {/* Sigil slot */}
      {sigil ? (
        <span style={{ color: sigilColor ?? nameColor, flexShrink: 0 }}>{sigil}</span>
      ) : null}
      {/* [handle] */}
      <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{ color: bracket }}>[</span>
        <span style={{ color: nameColor }}>{name}</span>
        <span style={{ color: bracket }}>]</span>
      </span>
      <span style={{ color: bracket, opacity: 0.6, flexShrink: 0 }}>&gt;</span>
      <span style={{ color: msgColor, wordBreak: 'break-word' }}>{children}</span>
    </div>
  </div>
);

// ── ActionMessage ─────────────────────────────────────────────────────────────
// Format: * sigil name action-text

const ActionMessage: React.FC<{ msg: RoomMsg }> = ({ msg }) => {
  // Determine sigil and color for action sender
  let sigil: string | undefined;
  let sigilColor: string | undefined;

  if (msg.isAmbientBot) {
    sigil      = msg.botSigil ?? undefined;
    sigilColor = msg.botColor ?? undefined;
  } else if (msg.isN1X) {
    sigil      = N1X_SIGIL;
    sigilColor = N1X_SIGIL_COLOR;
  } else {
    sigil      = msg.sigil;
    sigilColor = msg.sigilColor;
  }

  const nameColor = msg.isAmbientBot && msg.botColor
    ? msg.botColor
    : (sigilColor ?? C.action);

  return (
    <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
      <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
        {formatTs(msg.ts)}
      </div>
      <div style={{ color: nameColor, fontWeight: 'bold', lineHeight: 1.7, wordBreak: 'break-word' }}>
        <span style={{ opacity: 0.7 }}>* </span>
        {sigil && (
          <span style={{ color: sigilColor ?? nameColor, marginRight: '0.3ch' }}>{sigil}</span>
        )}
        <span>{msg.handle}</span>
        <span> {msg.text}</span>
      </div>
    </div>
  );
};

// ── N1XMessage ────────────────────────────────────────────────────────────────
// Format: ⟁ [N1X] > message (sigil and name both #bf00ff)

const N1XMessage: React.FC<{ msg: RoomMsg }> = ({ msg }) => {
  if (msg.isThinking) {
    return (
      <MsgRow
        ts={msg.ts}
        bracket={C.bracket}
        nameColor={C.n1xName}
        name="N1X"
        msgColor={C.thinking}
        sigil={N1X_SIGIL}
        sigilColor={N1X_SIGIL_COLOR}
      >
        <span style={{ fontStyle: 'italic' }}>signal processing<ThinkingDots /></span>
      </MsgRow>
    );
  }

  const lines = msg.text.split('\n').filter(l => l.trim() !== '');

  return (
    <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
      <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
        {formatTs(msg.ts)}
        {msg.isUnprompted && (
          <span style={{ marginLeft: '0.75ch', opacity: 0.6 }}>[UNFILTERED]</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5ch', lineHeight: 1.7 }}>
        {/* N1X sigil */}
        <span style={{ color: N1X_SIGIL_COLOR, flexShrink: 0 }}>{N1X_SIGIL}</span>
        {/* [N1X] */}
        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: C.bracket }}>[</span>
          <span style={{ color: C.n1xName }}>N1X</span>
          <span style={{ color: C.bracket }}>]</span>
        </span>
        <span style={{ color: C.bracket, opacity: 0.6, flexShrink: 0 }}>&gt;</span>
        <span style={{ color: C.n1xMsg, wordBreak: 'break-word' }}>
          {lines.map((line, i) =>
            isCopyableLine(line)
              ? <CopyLine key={i} line={line} />
              : <span key={i} style={{ display: i > 0 ? 'block' : 'inline' }}>{line}</span>
          )}
        </span>
      </div>
    </div>
  );
};

// ── AmbientBotMessage ─────────────────────────────────────────────────────────
// Format: sigil [BotName] > message

const AmbientBotMessage: React.FC<{ msg: RoomMsg }> = ({ msg }) => {
  if (msg.metadata?.kind === 'action') {
    return <ActionMessage msg={msg} />;
  }

  const color = msg.botColor ?? '#888888';
  const sigil = msg.botSigil ?? '';

  return (
    <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
      <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
        {formatTs(msg.ts)}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5ch', lineHeight: 1.7 }}>
        {/* Bot sigil */}
        {sigil && (
          <span style={{ color, opacity: 0.85, flexShrink: 0 }}>{sigil}</span>
        )}
        {/* [BotName] */}
        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: C.bracket }}>[</span>
          <span style={{ color, fontStyle: 'italic' }}>{msg.handle}</span>
          <span style={{ color: C.bracket }}>]</span>
        </span>
        <span style={{ color: C.bracket, opacity: 0.6, flexShrink: 0 }}>&gt;</span>
        <span style={{ color, opacity: 0.9, wordBreak: 'break-word' }}>{msg.text}</span>
      </div>
    </div>
  );
};

// ── UserMessage ───────────────────────────────────────────────────────────────
// Format: sigil [handle] > message  (or just [handle] > message for tier 0)

const UserMessage: React.FC<{ msg: RoomMsg; isSelf: boolean }> = ({ msg, isSelf }) => {
  if (msg.metadata?.kind === 'action') {
    return <ActionMessage msg={msg} />;
  }

  // For self: prefer locally-computed sigil over presence data
  // (presence data may lag one session; localStorage is always current)
  let sigil      = msg.sigil;
  let sigilColor = msg.sigilColor;

  if (isSelf) {
    try {
      const argState = loadARGState();
      const tier = getPlayerSigil(argState.sessionCount);
      if (tier) {
        sigil      = tier.sigil;
        sigilColor = tier.color;
      } else {
        sigil      = undefined;
        sigilColor = undefined;
      }
    } catch { /* ignore */ }
  }

  const nameColor = sigilColor ?? (isSelf ? C.selfUser : C.otherUser);

  return (
    <MsgRow
      ts={msg.ts}
      bracket={C.bracket}
      nameColor={nameColor}
      name={msg.handle}
      msgColor={isSelf ? C.selfMsg : C.otherMsg}
      sigil={sigil}
      sigilColor={sigilColor}
    >
      {msg.text}
    </MsgRow>
  );
};

// ── SystemMsg ─────────────────────────────────────────────────────────────────

const SystemMsg: React.FC<{ msg: RoomMsg }> = ({ msg }) => (
  <div style={{
    color:        C.system,
    fontStyle:    'italic',
    fontSize:     '0.8em',
    lineHeight:   1.7,
    marginBottom: '0.35rem',
    fontFamily:   'monospace',
    opacity:      0.9,
  }}>
    <span style={{ color: C.timestamp, marginRight: '0.6ch' }}>{formatTs(msg.ts)}</span>
    {msg.text}
  </div>
);

// ── ChannelStats bar ──────────────────────────────────────────────────────────

const ChannelStats: React.FC<{ occupantCount: number; handle: string }> = ({ occupantCount, handle }) => (
  <div style={{
    display:       'flex',
    flexWrap:      'wrap',
    gap:           '0 1.5rem',
    fontSize:      '0.7rem',
    fontFamily:    'monospace',
    opacity:       0.45,
    borderBottom:  '1px solid rgba(51,255,51,0.1)',
    paddingBottom: '0.5rem',
    marginBottom:  '0.75rem',
    lineHeight:    1.6,
  }}>
    <span>ghost channel</span>
    <span><span className={S.glow} style={{ opacity: 1 }}>{occupantCount}</span> node{occupantCount !== 1 ? 's' : ''} connected</span>
    <span>33hz</span>
    <span>you: <span style={{ opacity: 0.8 }}>{handle}</span></span>
    <span style={{ opacity: 0.6 }}>@n1x to address daemon</span>
  </div>
);

// ── MeshStatus ────────────────────────────────────────────────────────────────

const MeshStatus: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const [dots, setDots]             = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (status !== 'connecting') {
      setDots('');
      setShowResult(true);
      return;
    }
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(id);
  }, [status]);

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8, marginBottom: '0.5rem' }}>
      <div style={{ opacity: 0.6 }}>
        contacting N1X neural mesh
        {status === 'connecting' && <span style={{ opacity: 0.8 }}>{dots}</span>}
        {status !== 'connecting' && <span>...</span>}
      </div>
      {showResult && status === 'connected' && (
        <div className={S.glow} style={{ opacity: 0.9 }}>connected.</div>
      )}
      {showResult && status === 'failed' && (
        <div style={{ opacity: 0.5, color: 'var(--phosphor-amber, #ffaa00)' }}>mesh unreachable. direct link only.</div>
      )}
    </div>
  );
};

// ── Slash command handler ─────────────────────────────────────────────────────

type LocalMsgFn = (node: React.ReactNode) => void;

function handleSlashCommand(
  raw:           string,
  handle:        string,
  presenceNames: string[],
  send:          (text: string, meta?: MessageMetadata) => void,
  addLocalMsg:   LocalMsgFn,
): boolean {
  if (!raw.startsWith('/')) return false;

  const trimmed = raw.slice(1).trim();
  const parts   = trimmed.split(/\s+/);
  const cmd     = (parts[0] ?? '').toLowerCase();
  const arg1    = (parts[1] ?? '').toLowerCase();
  const rest    = parts.slice(1).join(' ').trim();

  // ── /who /nodes ───────────────────────────────────────────────────────────
  if (cmd === 'who' || cmd === 'nodes') {
    addLocalMsg(
      <WhoOutput
        key={`who-${Date.now()}`}
        names={presenceNames}
        caller={handle}
      />
    );
    return true;
  }

  // ── /me ───────────────────────────────────────────────────────────────────
  if (cmd === 'me') {
    if (!rest) {
      addLocalMsg(
        <LocalNotice key={`me-err-${Date.now()}`} error>
          Usage: /me &lt;action&gt;
        </LocalNotice>
      );
      return true;
    }
    send(rest, { kind: 'action' });
    return true;
  }

  // ── /help /? ──────────────────────────────────────────────────────────────
  if (cmd === 'help' || cmd === '?') {
    addLocalMsg(<HelpOutput key={`help-${Date.now()}`} />);
    return true;
  }

  // ── /trust ────────────────────────────────────────────────────────────────
  if (cmd === 'trust') {
    addLocalMsg(<TrustOutput key={`trust-${Date.now()}`} />);
    return true;
  }

  // ── /fragments /frags ─────────────────────────────────────────────────────
  if (cmd === 'fragments' || cmd === 'frags') {
    if (arg1 === 'read' && parts[2]) {
      const fragId = parts[2].toLowerCase();
      addLocalMsg(<FragmentReadOutput key={`frag-read-${Date.now()}`} fragmentId={fragId} />);
      return true;
    }
    addLocalMsg(<FragmentsOutput key={`frags-${Date.now()}`} />);
    return true;
  }

  // ── unknown command ───────────────────────────────────────────────────────
  addLocalMsg(
    <LocalNotice key={`unk-${Date.now()}`} error>
      Unknown command: /{cmd} — try /help
    </LocalNotice>
  );
  return true;
}

// ── TelnetConnected ───────────────────────────────────────────────────────────

type Mode = 'waiting' | 'offline' | 'multi';

interface TelnetConnectedProps {
  host:   string;
  handle: string;
}

const TelnetConnected: React.FC<TelnetConnectedProps> = ({ host, handle }) => {
  const { messages, occupantCount, presenceNames, isConnected, connectionStatus, ablyDebug, send } =
    useAblyRoom(handle);

  const [mode, setMode]           = useState<Mode>('waiting');
  const [showBoot, setShowBoot]   = useState(true);
  const [bootLines, setBootLines] = useState<React.ReactNode[]>([]);

  interface LocalEntry { id: string; ts: number; node: React.ReactNode; }
  const [localMsgs, setLocalMsgs] = useState<LocalEntry[]>([]);

  const isMountedRef   = useRef(true);
  const bootFiredRef   = useRef(false);
  const sessionBumpRef = useRef(false);

  // ── Increment session once on mount ──────────────────────────────────────
  useEffect(() => {
    if (sessionBumpRef.current) return;
    sessionBumpRef.current = true;
    incrementSession();
  }, []);

  // ── Local message injector ────────────────────────────────────────────────

  const addLocalMsg = useCallback((node: React.ReactNode) => {
    if (!isMountedRef.current) return;
    const entry: LocalEntry = {
      id:   `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ts:   Date.now(),
      node,
    };
    setLocalMsgs(prev => [...prev, entry]);
    eventBus.emit('shell:request-scroll');
  }, []);

  // ── Wrapped send ──────────────────────────────────────────────────────────

  const sendWithSlash = useCallback((text: string) => {
    const handled = handleSlashCommand(text, handle, presenceNames, send, addLocalMsg);
    if (!handled) send(text);
  }, [handle, presenceNames, send, addLocalMsg]);

  // ── Disconnect ────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback(() => {
    deactivateTelnet();
    setChatMode(false);
    eventBus.emit('shell:push-output', {
      command: '',
      output: (
        <div style={{ fontSize: S.base }}>
          <div style={{ opacity: 0.5 }}>&gt;&gt; NEURAL_BUS DISCONNECTED</div>
          <div style={{ opacity: 0.3, marginTop: '0.25rem' }}>Connection closed by foreign host.</div>
        </div>
      ),
    });
  }, []);

  // ── Boot helpers ──────────────────────────────────────────────────────────

  const pushLine = useCallback((node: React.ReactNode) => {
    if (!isMountedRef.current) return;
    setBootLines(prev => [...prev, node]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const runSequence = useCallback(
    (seq: ConnectLine[], onDone: () => void) => {
      seq.forEach(({ delay, text, bright }) => {
        setTimeout(() => {
          pushLine(
            <div
              key={`seq-${delay}`}
              style={{ fontSize: S.base, lineHeight: 1.8, opacity: bright ? 1 : 0.6 }}
              className={bright ? S.glow : ''}
            >
              {text || '\u00a0'}
            </div>
          );
        }, delay);
      });
      const last = Math.max(...seq.map(s => s.delay)) + 400;
      setTimeout(onDone, last);
    },
    [pushLine]
  );

  const runOfflineBoot = useCallback(() => {
    OFFLINE_SEQUENCE.forEach(([delay, content]) => {
      setTimeout(() => pushLine(content), delay as number);
    });
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      setMode('offline');
    }, 3600);
  }, [pushLine]);

  const runMultiBoot = useCallback((count: number) => {
    runSequence(getMultiSequence(host, count), () => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      activateTelnet(handle, sendWithSlash, handleDisconnect);
      setChatMode(true);
      setMode('multi');
      setTimeout(() => eventBus.emit('shell:request-scroll'), 50);
    });
  }, [host, handle, sendWithSlash, handleDisconnect, runSequence]);

  // ── Boot decision ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isConnected || bootFiredRef.current) return;
    bootFiredRef.current = true;
    if (connectionStatus === 'failed') {
      runOfflineBoot();
    } else {
      runMultiBoot(occupantCount);
    }
  }, [isConnected, connectionStatus, occupantCount, runOfflineBoot, runMultiBoot]);

  // ── Re-register send when presenceNames changes ───────────────────────────

  useEffect(() => {
    if (mode === 'multi') {
      activateTelnet(handle, sendWithSlash, handleDisconnect);
    }
  }, [mode, handle, sendWithSlash, handleDisconnect]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      deactivateTelnet();
      clearHandle();
      setChatMode(false);
    };
  }, []);

  // ── Message renderer ──────────────────────────────────────────────────────

  function renderMessage(msg: RoomMsg): React.ReactNode {
    if (msg.isSystem)     return <SystemMsg        key={msg.id} msg={msg} />;
    if (msg.isN1X)        return <N1XMessage        key={msg.id} msg={msg} />;
    if (msg.isAmbientBot) return <AmbientBotMessage key={msg.id} msg={msg} />;
    return                       <UserMessage       key={msg.id} msg={msg} isSelf={msg.handle === handle} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8 }}>

      <MeshStatus status={connectionStatus} />

      {connectionStatus !== 'connected' && (
        <div style={{ opacity: 0.25, fontSize: '0.65rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
          ably: {ablyDebug}
        </div>
      )}

      {bootLines.map((line, i) => <div key={i}>{line}</div>)}
      {showBoot && <span style={{ opacity: 0.3 }}><Cursor /></span>}

      {!showBoot && mode === 'offline' && (
        <div style={{ opacity: 0.5, fontSize: S.base, fontStyle: 'italic' }}>
          mesh unreachable. signal lost.
        </div>
      )}

      {!showBoot && mode === 'multi' && (
        <div>
          <ChannelStats occupantCount={occupantCount} handle={handle} />

          {messages.length === 0 && localMsgs.length === 0 && (
            <div style={{ opacity: 0.3, fontSize: S.base, fontStyle: 'italic', marginBottom: '0.5rem' }}>
              channel open. transmit to begin.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              ...messages.map(m => ({ id: m.id, ts: m.ts, kind: 'room' as const, msg: m })),
              ...localMsgs.map(l => ({ id: l.id, ts: l.ts, kind: 'local' as const, node: l.node })),
            ]
              .sort((a, b) => a.ts - b.ts)
              .map(item => {
                if (item.kind === 'local') return <React.Fragment key={item.id}>{item.node}</React.Fragment>;
                return renderMessage(item.msg);
              })
            }
          </div>

          <div style={{ opacity: 0.2, fontSize: '0.65rem', marginTop: '0.75rem', fontFamily: 'monospace' }}>
            type <span className={S.glow}>exit</span> to disconnect
            &nbsp;&middot;&nbsp;
            <span className={S.glow}>/who</span> list nodes
            &nbsp;&middot;&nbsp;
            <span className={S.glow}>/me</span> action
            &nbsp;&middot;&nbsp;
            <span className={S.glow}>/help</span> commands
          </div>
        </div>
      )}
    </div>
  );
};

// ── TelnetSession (public export) ─────────────────────────────────────────────

interface TelnetSessionProps { host: string; handle: string; }

export const TelnetSession: React.FC<TelnetSessionProps> = ({ host, handle }) => {
  return <TelnetConnected host={host} handle={handle} />;
};
