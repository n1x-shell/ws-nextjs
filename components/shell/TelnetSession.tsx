'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, type RoomMsg, type MessageMetadata, type ConnectionStatus } from '@/lib/ablyClient';
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
  accent: 'var(--phosphor-accent)',
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
  timestamp:   'rgba(var(--phosphor-rgb),0.3)',
  system:      '#ff8c00',
  thinking:    'rgba(var(--phosphor-rgb),0.45)',
  whoSelf:     '#ffffff',
  whoOther:    '#555555',
  whoN1X:      '#bf00ff',
  action:      '#ff69b4',
  cmdError:    '#ff6b6b',
  helpKey:     'var(--phosphor-accent)',
  helpDim:     'rgba(var(--phosphor-rgb),0.45)',
  trustLevel:  'var(--phosphor-accent)',
  fragId:      'var(--phosphor-accent)',
  fragLocked:  'rgba(var(--phosphor-accent-rgb),0.25)',
  tier0:       '#555555',
  accent:      'var(--phosphor-accent)',
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
  [1200, <span key="o4" style={{ fontSize: S.base, opacity: 0.5, color: 'var(--phosphor-accent)' }}>ghost-daemon[999]: mesh network failure</span>],
  [1600, <span key="o5" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: falling back to direct link</span>],
  [2000, <span key="o6">&nbsp;</span>],
  [2200, <span key="o7" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em', color: 'var(--phosphor-accent)' }}>&gt;&gt; CARRIER DETECTED</span>],
  [2500, <span key="o8" className={S.glow} style={{ fontSize: S.base }}>&gt;&gt; FREQUENCY LOCK: 33hz</span>],
  [2800, <span key="o9" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em', color: 'var(--phosphor-accent)' }}>&gt;&gt; DIRECT_LINK ACTIVE</span>],
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
    { delay: 1100, text: 'ghost-daemon[999]: connection  ESTABLISHED' },
    { delay: 1400, text: 'ghost-daemon[999]: freq-lock   33hz', bright: true },
    { delay: 1700, text: 'ghost-daemon[999]: signal      NOMINAL' },
    { delay: 2000, text: `ghost-daemon[999]: peers       ${count} node(s)` },
    { delay: 2300, text: 'ghost-daemon[999]: clearance   ACTIVE', bright: true },
    { delay: 2600, text: 'ghost-daemon[999]: monitoring  enabled' },
    { delay: 2800, text: '' },
    { delay: 3000, text: '>> MESH_MODE_ACTIVE', bright: true },
    { delay: 3200, text: '' },
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
        borderBottom: '1px dashed rgba(var(--phosphor-rgb),0.35)',
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
      color:        'rgba(var(--phosphor-rgb),0.55)',
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

const HelpOutput: React.FC<{ isAdmin?: boolean; roomName?: 'ghost' | 'mancave' }> = ({ isAdmin = false, roomName = 'ghost' }) => {
  if (roomName === 'mancave') {
    const mancaveRows = [
      { cmd: '/vibe',               desc: 'Random man-cave transmission' },
      { cmd: '/roll <NdN>',         desc: 'Roll dice, e.g. /roll 2d6' },
      { cmd: '/tv',                 desc: 'Check what\'s on the tube' },
      { cmd: '/beer',               desc: 'Beer of the moment' },
      { cmd: '/me <action>',        desc: 'Perform an action' },
      { cmd: '/who',                desc: 'List connected nodes' },
      { cmd: '/leave',              alias: '/q', desc: 'Exit MANCAVE' },
      { cmd: '/help',               alias: '/?', desc: 'Show this list' },
    ];
    return (
      <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
        <div style={{ color: '#ff6600', opacity: 0.85, marginBottom: '0.25rem' }}>MANCAVE — COMMANDS</div>
        {mancaveRows.map(r => (
          <div key={r.cmd} style={{ paddingLeft: '2ch', display: 'flex', gap: '1ch', flexWrap: 'wrap' }}>
            <span style={{ color: '#ff6600', minWidth: '22ch', flexShrink: 0 }}>{r.cmd}</span>
            {r.alias && (
              <span style={{ color: C.helpDim, minWidth: '6ch', flexShrink: 0 }}>{r.alias}</span>
            )}
            <span style={{ color: C.helpDim, opacity: 0.7 }}>{r.desc}</span>
          </div>
        ))}
      </div>
    );
  }

  const rows: Array<{ cmd: string; alias?: string; desc: string }> = [
    { cmd: '/me <action>',          desc: 'Perform an action in the channel' },
    { cmd: '/who',                  desc: 'List connected users and entities' },
    { cmd: '/trust',                desc: 'Show your current trust level with N1X' },
    { cmd: '/fragments',            alias: '/frags',           desc: 'Show collected memory fragments' },
    { cmd: '/fragments read <id>',  alias: '/frags read <id>', desc: 'Read a collected fragment' },
    { cmd: '/mancave <passphrase>', desc: 'Enter the MANCAVE private channel' },
    { cmd: '/help',                 alias: '/?',               desc: 'Show this command list' },
    { cmd: '@n1x <message>',        desc: 'Ping N1X directly' },
    { cmd: '@vestige <message>',    desc: 'Ping Vestige directly' },
    { cmd: '@lumen <message>',      desc: 'Ping Lumen directly' },
    { cmd: '@cascade <message>',    desc: 'Ping Cascade directly' },
  ];

  const opRows: Array<{ cmd: string; desc: string }> = [
    { cmd: '/kick <handle>',           desc: 'terminate connection' },
    { cmd: '/silence <handle> [dur]',  desc: 'suppress transmissions (30s / 2m / 2h / indefinite)' },
    { cmd: '/mute <handle> [dur]',     desc: 'alias: silence' },
    { cmd: '/unmute <handle>',         desc: 'restore transmissions' },
  ];

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div style={{ color: C.accent, opacity: 0.7, marginBottom: '0.25rem' }}>GHOST CHANNEL — COMMANDS</div>
      {rows.map(r => (
        <div key={r.cmd} style={{ paddingLeft: '2ch', display: 'flex', gap: '1ch', flexWrap: 'wrap' }}>
          <span style={{ color: C.helpKey, minWidth: '22ch', flexShrink: 0 }}>{r.cmd}</span>
          {r.alias && (
            <span style={{ color: C.helpDim, minWidth: '18ch', flexShrink: 0 }}>{r.alias}</span>
          )}
          <span style={{ color: C.helpDim, opacity: 0.7 }}>{r.desc}</span>
        </div>
      ))}

      {isAdmin && (
        <>
          <div style={{ color: C.helpKey, opacity: 0.55, marginTop: '0.75rem', marginBottom: '0.2rem' }}>
            OPERATOR COMMANDS
          </div>
          {opRows.map(r => (
            <div key={r.cmd} style={{ paddingLeft: '2ch', display: 'flex', gap: '1ch', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--error-red, #ff6b6b)', minWidth: '28ch', flexShrink: 0 }}>{r.cmd}</span>
              <span style={{ color: C.helpDim, opacity: 0.6 }}>{r.desc}</span>
            </div>
          ))}
        </>
      )}
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
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.5)' }}>TRUST LEVEL: </span>
        <span style={{ color: C.trustLevel, fontWeight: 'bold' }}>{trust} / 5</span>
      </div>
      <div style={{ paddingLeft: '2ch', color: 'rgba(var(--phosphor-rgb),0.5)', opacity: 0.8 }}>
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
        <div style={{ color: 'rgba(var(--phosphor-rgb),0.55)' }}>MEMORY FRAGMENTS: none collected</div>
        <div style={{ paddingLeft: '2ch', opacity: 0.4, fontStyle: 'italic' }}>-- keep exploring the substrate --</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, marginBottom: '0.25rem' }}>
      <div style={{ color: 'rgba(var(--phosphor-rgb),0.55)', marginBottom: '0.15rem' }}>
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
                <span style={{ color: 'rgba(var(--phosphor-rgb),0.65)', minWidth: '36ch' }}>{label}</span>
                <span style={{ color: 'rgba(var(--phosphor-rgb),0.4)', fontSize: '0.8em' }}>COLLECTED</span>
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
          <div style={{ color: 'rgba(var(--phosphor-rgb),0.5)' }}>[f009] FRAGMENT STILL ENCODED</div>
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
        <div style={{ color: 'rgba(var(--phosphor-rgb),0.5)' }}>[{id}] FRAGMENT STILL ENCODED</div>
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
          {isCopyableLine(lines[0]) ? <CopyLine key={0} line={lines[0]} /> : lines[0]}
        </span>
      </div>
      {lines.slice(1).map((line, i) =>
        isCopyableLine(line)
          ? <CopyLine key={i + 1} line={line} />
          : <div key={i + 1} style={{ color: C.n1xMsg, lineHeight: 1.7, marginTop: '0.75rem', wordBreak: 'break-word' }}>{line}</div>
      )}
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
        <span style={{ color, opacity: 0.9, wordBreak: 'break-word' }}>
          {msg.text.split('\n').filter(l => l.trim() !== '')[0] ?? msg.text}
        </span>
      </div>
      {msg.text.split('\n').filter(l => l.trim() !== '').slice(1).map((line, i) => (
        <div key={i} style={{ color, opacity: 0.9, lineHeight: 1.7, marginTop: '0.75rem', wordBreak: 'break-word' }}>{line}</div>
      ))}
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

const ChannelStats: React.FC<{ occupantCount: number; handle: string; roomName: 'ghost' | 'mancave' }> = ({ handle, roomName }) => {
  const isMancave = roomName === 'mancave';
  return (
  <div style={{
    fontFamily:    'monospace',
    fontSize:      S.base,
    marginBottom:  '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom:  `1px solid rgba(${isMancave ? '255,102,0' : 'var(--phosphor-rgb)'},0.2)`,
  }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.2rem' }}>
      <span
        className={isMancave ? '' : S.glow}
        style={{
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: isMancave ? '#ff6600' : undefined,
          textShadow: isMancave ? '0 0 8px rgba(255,102,0,0.6)' : undefined,
        }}
      >
        {isMancave ? 'MANCAVE' : 'GHOST_CHANNEL'}
      </span>
      <span style={{ opacity: 0.3 }}>──</span>
      <span style={{ opacity: 0.55, letterSpacing: '0.04em', color: isMancave ? '#ff6600' : undefined }}>
        {isMancave ? 'freq :: private' : 'freq :: 33hz'}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', opacity: 0.5 }}>
      <span>signal ident:</span>
      <span style={{ opacity: 0.9, color: isMancave ? '#ff6600' : 'var(--phosphor-green)' }}>{handle}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>{isMancave ? '/leave to exit' : '@n1x for direct link'}</span>
    </div>
  </div>
);};

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
        <div style={{ opacity: 0.5, color: 'var(--phosphor-accent)' }}>mesh unreachable. direct link only.</div>
      )}
    </div>
  );
};

// ── Duration parser ───────────────────────────────────────────────────────────
// Returns milliseconds, or null if no duration string / unrecognised format.
// Formats: 30s  2m  2h  (integers only)

function parseDuration(str: string): number | null {
  if (!str) return null;
  const m = str.trim().match(/^(\d+)(s|m|h)$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  switch (m[2].toLowerCase()) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 3600 * 1000;
    default:  return null;
  }
}

// ── Mod action dispatcher ─────────────────────────────────────────────────────

interface ModActionPayload {
  type:        'kick' | 'mute' | 'unmute';
  clientId:    string;
  durationMs?: number | null;
}

async function dispatchModAction(
  adminSecret:  string,
  action:       ModActionPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/mod', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ adminSecret, action }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? 'request failed' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

// ── Slash command handler ─────────────────────────────────────────────────────

type LocalMsgFn = (node: React.ReactNode) => void;

interface SlashContext {
  raw:           string;
  handle:        string;
  presenceNames: string[];
  send:          (text: string, meta?: MessageMetadata) => void;
  addLocalMsg:   LocalMsgFn;
  isAdmin:       boolean;
  adminSecret:   string;
  onAdminAuth:   (secret: string) => void;
  disconnect:    () => void;
  roomName:      'ghost' | 'mancave';
}

function handleSlashCommand(ctx: SlashContext): boolean {
  const { raw, handle, presenceNames, send, addLocalMsg, isAdmin, adminSecret, onAdminAuth, disconnect, roomName } = ctx;
  if (!raw.startsWith('/')) return false;

  const trimmed = raw.slice(1).trim();
  const parts   = trimmed.split(/\s+/);
  const cmd     = (parts[0] ?? '').toLowerCase();
  const arg1    = (parts[1] ?? '').toLowerCase();
  const rest    = parts.slice(1).join(' ').trim();

  // ── MANCAVE-exclusive commands ────────────────────────────────────────────
  if (roomName === 'mancave') {

    if (cmd === 'leave') {
      disconnect();
      return true;
    }

    if (cmd === 'vibe') {
      const VIBES = [
        'the only cable that matters is the one connected to the amp.',
        'real men drink their coffee black and debug without console.log.',
        'somewhere out there a subwoofer is playing something unforgivable. good.',
        'a man cave without a recliner is just a room.',
        'every legend was first a man alone in a garage.',
        'the remote goes on the left armrest. always. this is law.',
        "if it's too loud you're too far from the speaker.",
        'snacks are not optional. snacks are infrastructure.',
        'nap now. grind later. or nap again. you\'re in the cave.',
        'this is a no-judgment zone. yes, even that.',
      ];
      const msg = VIBES[Math.floor(Math.random() * VIBES.length)];
      addLocalMsg(
        <div key={`vibe-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2, color: '#ff6600', opacity: 0.85 }}>
          <span style={{ opacity: 0.4 }}>[VIBE] </span>{msg}
        </div>
      );
      return true;
    }

    if (cmd === 'roll') {
      const expr = (parts[1] ?? '').toLowerCase();
      const match = expr.match(/^(\d+)d(\d+)$/);
      if (!match) {
        addLocalMsg(<LocalNotice key={`roll-err-${Date.now()}`} error>Usage: /roll &lt;NdN&gt; — e.g. /roll 2d6</LocalNotice>);
        return true;
      }
      const count = Math.min(parseInt(match[1], 10), 20);
      const sides = Math.min(parseInt(match[2], 10), 1000);
      if (count < 1 || sides < 2) {
        addLocalMsg(<LocalNotice key={`roll-range-${Date.now()}`} error>roll: invalid dice expression</LocalNotice>);
        return true;
      }
      const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
      const total = rolls.reduce((a, b) => a + b, 0);
      addLocalMsg(
        <div key={`roll-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2 }}>
          <span style={{ color: '#ff6600' }}>[ROLL {count}d{sides}] </span>
          <span style={{ opacity: 0.7 }}>{rolls.join(' + ')} </span>
          <span style={{ color: 'var(--phosphor-green)', fontWeight: 'bold' }}>= {total}</span>
        </div>
      );
      return true;
    }

    if (cmd === 'tv') {
      const CHANNELS = [
        { ch: 'CH 04', show: "Man vs. Fridge — Season 7, Ep 12: The Pulled Pork Incident" },
        { ch: 'CH 11', show: "Drone Racing: Backyard Invitational — Live from Gary's Yard" },
        { ch: 'CH 17', show: "How It's Made: Metric Wrenches (repeat, 2003)" },
        { ch: 'CH 22', show: "Woodworking with Regrets — \"When Dado Blades Go Wrong\"" },
        { ch: 'CH 31', show: "Classic Motorsport: 1997 Le Mans Highlights (unedited, 8hrs)" },
        { ch: 'CH 44', show: "Mythbusters Marathon — The Duct Tape Special" },
        { ch: 'CH 55', show: "Night Fishing with Ted — No fish yet, but Ted is optimistic" },
        { ch: 'CH 66', show: "Power Tool Review: 47 Drills in 47 Minutes" },
        { ch: 'CH 77', show: "Western Movie Theater: \"High Plains Drifter\" (colorized, sorry)" },
        { ch: 'CH 99', show: "Static. But like, good static. Comforting static." },
      ];
      const pick = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
      addLocalMsg(
        <div key={`tv-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2 }}>
          <span style={{ color: '#ff6600' }}>[TV] </span>
          <span style={{ color: 'var(--phosphor-green)', opacity: 0.8 }}>{pick.ch} — </span>
          <span style={{ opacity: 0.85 }}>{pick.show}</span>
        </div>
      );
      return true;
    }

    if (cmd === 'beer') {
      const BEERS = [
        { name: 'Tunnel Core IPA',       ibu: 68, abv: 7.2, note: 'aggressive dry-hop, tastes like debugging at 2am' },
        { name: 'Ghost Channel Stout',   ibu: 32, abv: 8.5, note: 'roasted malt, notes of cold concrete and determination' },
        { name: 'Substrated Pale Ale',   ibu: 45, abv: 5.4, note: 'clean finish, goes well with leftover pizza' },
        { name: 'Mancave Amber',         ibu: 28, abv: 5.8, note: 'classic. no notes. just beer.' },
        { name: 'Signal Drift Lager',    ibu: 14, abv: 4.2, note: 'crisp, sessionable, responsible choice, boring' },
        { name: 'Iron Bloom Double IPA', ibu: 92, abv: 9.1, note: 'hazy, dank, hits like a compiler error you missed for 3 hours' },
        { name: 'Frequency Lock Porter', ibu: 41, abv: 6.6, note: 'dark and smooth, pairs with power tools at low speed' },
        { name: 'NX-784988 Saison',      ibu: 22, abv: 6.1, note: 'Belgian yeast, fruity, confusing in a good way' },
      ];
      const b = BEERS[Math.floor(Math.random() * BEERS.length)];
      addLocalMsg(
        <div key={`beer-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 2 }}>
          <div><span style={{ color: '#ff6600' }}>[BEER] </span><span style={{ fontWeight: 'bold', opacity: 0.9 }}>{b.name}</span></div>
          <div style={{ paddingLeft: '2ch', opacity: 0.65 }}>IBU: {b.ibu}  ·  ABV: {b.abv}%</div>
          <div style={{ paddingLeft: '2ch', opacity: 0.5, fontStyle: 'italic' }}>{b.note}</div>
        </div>
      );
      return true;
    }
  }

  // ── /mancave — enter mancave private channel (ghost room only) ──────────────
  if (cmd === 'mancave' && roomName === 'ghost') {
    const passphrase = parts.slice(1).join(' ').trim().toLowerCase();
    if (!passphrase) {
      addLocalMsg(
        <LocalNotice key={`mc-usage-${Date.now()}`} error>
          Usage: /mancave &lt;passphrase&gt;
        </LocalNotice>
      );
      return true;
    }
    if (passphrase !== 'cunt') {
      addLocalMsg(
        <LocalNotice key={`mc-deny-${Date.now()}`} error>
          access denied — wrong frequency
        </LocalNotice>
      );
      return true;
    }
    // Correct passphrase — announce, disconnect from ghost, then launch mancave
    addLocalMsg(
      <div key={`mc-ok-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: '#ff6600', textShadow: '0 0 8px rgba(255,102,0,0.5)' }}>
        &gt;&gt; MANCAVE_ACCESS_GRANTED — switching channel...
      </div>
    );
    setTimeout(() => {
      disconnect();
      setTimeout(() => {
        eventBus.emit('shell:push-output', {
          command: '',
          output: <TelnetSession host="n1x.sh" handle={handle} roomName="mancave" />,
        });
      }, 500);
    }, 400);
    return true;
  }

  // ── /q — disconnect ──────────────────────────────────────────────────────
  if (cmd === 'q') {
    disconnect();
    return true;
  }

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
    addLocalMsg(<HelpOutput key={`help-${Date.now()}`} isAdmin={isAdmin} roomName={roomName} />);
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

  // ── /mod auth <password> ──────────────────────────────────────────────────
  // Hidden from /help unless already admin.
  if (cmd === 'mod' && arg1 === 'auth') {
    const password = parts.slice(2).join(' ').trim();
    if (!password) {
      addLocalMsg(
        <LocalNotice key={`mod-err-${Date.now()}`} error>
          Usage: /mod auth &lt;password&gt;
        </LocalNotice>
      );
      return true;
    }
    // Verify against server — never exposes ADMIN_SECRET to client logs
    fetch('/api/mod', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ adminSecret: password, verify: true }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          onAdminAuth(password);
          addLocalMsg(
            <div key={`mod-ok-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: 'var(--phosphor-green)' }}>
              &gt; OPERATOR_ACCESS_GRANTED — mod commands active
            </div>
          );
        } else {
          addLocalMsg(
            <LocalNotice key={`mod-fail-${Date.now()}`} error>
              &gt; AUTH_FAILED — invalid credentials
            </LocalNotice>
          );
        }
      })
      .catch(() => {
        addLocalMsg(
          <LocalNotice key={`mod-err2-${Date.now()}`} error>
            &gt; MOD_LINK_FAILURE — cannot reach auth endpoint
          </LocalNotice>
        );
      });
    return true;
  }

  // ── Operator commands — only execute if isAdmin ───────────────────────────

  // ── /kick <handle> ────────────────────────────────────────────────────────
  if (cmd === 'kick') {
    if (!isAdmin) {
      addLocalMsg(<LocalNotice key={`kick-deny-${Date.now()}`} error>Unknown command: /kick — try /help</LocalNotice>);
      return true;
    }
    const target = parts[1];
    if (!target) {
      addLocalMsg(<LocalNotice key={`kick-usage-${Date.now()}`} error>Usage: /kick &lt;handle&gt;</LocalNotice>);
      return true;
    }
    dispatchModAction(adminSecret, { type: 'kick', clientId: target }).then(result => {
      if (result.ok) {
        addLocalMsg(
          <div key={`kick-ok-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: 'rgba(var(--phosphor-rgb),0.6)' }}>
            &gt; mod: kick signal sent to {target}
          </div>
        );
      } else {
        addLocalMsg(
          <LocalNotice key={`kick-fail-${Date.now()}`} error>
            &gt; mod: kick failed — {result.error}
          </LocalNotice>
        );
      }
    });
    return true;
  }

  // ── /silence <handle> [duration] / /mute alias ───────────────────────────
  if (cmd === 'silence' || cmd === 'mute') {
    if (!isAdmin) {
      addLocalMsg(<LocalNotice key={`sil-deny-${Date.now()}`} error>Unknown command: /{cmd} — try /help</LocalNotice>);
      return true;
    }
    const target = parts[1];
    if (!target) {
      addLocalMsg(<LocalNotice key={`sil-usage-${Date.now()}`} error>Usage: /silence &lt;handle&gt; [30s|2m|2h]</LocalNotice>);
      return true;
    }
    const durStr   = parts[2] ?? '';
    const durMs    = parseDuration(durStr);
    const durLabel = durMs != null
      ? `for ${durStr}`
      : 'indefinitely';

    dispatchModAction(adminSecret, { type: 'mute', clientId: target, durationMs: durMs }).then(result => {
      if (result.ok) {
        addLocalMsg(
          <div key={`sil-ok-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: 'rgba(var(--phosphor-rgb),0.6)' }}>
            &gt; mod: {target} silenced {durLabel}
          </div>
        );
      } else {
        addLocalMsg(
          <LocalNotice key={`sil-fail-${Date.now()}`} error>
            &gt; mod: silence failed — {result.error}
          </LocalNotice>
        );
      }
    });
    return true;
  }

  // ── /unmute <handle> ──────────────────────────────────────────────────────
  if (cmd === 'unmute') {
    if (!isAdmin) {
      addLocalMsg(<LocalNotice key={`unm-deny-${Date.now()}`} error>Unknown command: /unmute — try /help</LocalNotice>);
      return true;
    }
    const target = parts[1];
    if (!target) {
      addLocalMsg(<LocalNotice key={`unm-usage-${Date.now()}`} error>Usage: /unmute &lt;handle&gt;</LocalNotice>);
      return true;
    }
    dispatchModAction(adminSecret, { type: 'unmute', clientId: target }).then(result => {
      if (result.ok) {
        addLocalMsg(
          <div key={`unm-ok-${Date.now()}`} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: 'rgba(var(--phosphor-rgb),0.6)' }}>
            &gt; mod: {target} unmuted
          </div>
        );
      } else {
        addLocalMsg(
          <LocalNotice key={`unm-fail-${Date.now()}`} error>
            &gt; mod: unmute failed — {result.error}
          </LocalNotice>
        );
      }
    });
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
  host:     string;
  handle:   string;
  roomName: 'ghost' | 'mancave';
}

const TelnetConnected: React.FC<TelnetConnectedProps> = ({ host, handle, roomName }) => {
  const { messages, occupantCount, presenceNames, isConnected, connectionStatus, ablyDebug, isMuted, send } =
    useAblyRoom(handle, roomName);

  const [mode, setMode]           = useState<Mode>('waiting');
  const [showBoot, setShowBoot]   = useState(true);
  const [bootLines, setBootLines] = useState<React.ReactNode[]>([]);
  const [isAdmin, setIsAdmin]     = useState(false);

  interface LocalEntry { id: string; ts: number; node: React.ReactNode; }
  const [localMsgs, setLocalMsgs] = useState<LocalEntry[]>([]);

  const isMountedRef   = useRef(true);
  const bootFiredRef   = useRef(false);
  const sessionBumpRef = useRef(false);
  const adminSecretRef = useRef('');
  // Keep a stable ref to isAdmin so sendWithSlash always reads latest value
  const isAdminRef     = useRef(false);

  // ── Sync isAdmin ref ──────────────────────────────────────────────────────
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

  // ── onAdminAuth callback ──────────────────────────────────────────────────
  const onAdminAuth = useCallback((secret: string) => {
    adminSecretRef.current = secret;
    isAdminRef.current = true;
    setIsAdmin(true);
  }, []);

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

  // ── Mod event listeners ───────────────────────────────────────────────────
  // mod:kicked — received by ablyClient when this client is kicked
  // mod:suppressed — received when this client tries to send while muted
  useEffect(() => {
    const onKicked = () => {
      if (!isMountedRef.current) return;
      addLocalMsg(
        <div
          key={`kicked-${Date.now()}`}
          style={{
            fontFamily: 'monospace',
            fontSize:   S.base,
            lineHeight: 1.8,
            color:      'var(--error-red, #ff6b6b)',
            fontWeight: 'bold',
          }}
        >
          [ SIGNAL TERMINATED — CONNECTION SEVERED BY OPERATOR ]
        </div>
      );
    };

    const onSuppressed = () => {
      if (!isMountedRef.current) return;
      addLocalMsg(
        <div
          key={`sup-${Date.now()}`}
          style={{
            fontFamily: 'monospace',
            fontSize:   S.base,
            lineHeight: 1.8,
            color:      'rgba(var(--phosphor-rgb),0.18)',
            fontStyle:  'italic',
          }}
        >
          [ TRANSMISSION SUPPRESSED ]
        </div>
      );
    };

    eventBus.on('mod:kicked',     onKicked);
    eventBus.on('mod:suppressed', onSuppressed);
    return () => {
      eventBus.off('mod:kicked',     onKicked);
      eventBus.off('mod:suppressed', onSuppressed);
    };
  }, [addLocalMsg]);

  // ── Wrapped send ──────────────────────────────────────────────────────────

  // ── Disconnect ────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback(() => {
    deactivateTelnet();
    eventBus.emit('shell:push-output', {
      command: '',
      output: (
        <div style={{ fontSize: S.base }}>
          <div style={{ opacity: 0.5 }}>&gt;&gt; NEURAL_BUS DISCONNECTED</div>
          <div style={{ opacity: 0.3, marginTop: '0.25rem' }}>substrate link closed. signal archived.</div>
        </div>
      ),
    });
  }, []);

  const sendWithSlash = useCallback((text: string) => {
    const handled = handleSlashCommand({
      raw:           text,
      handle,
      presenceNames,
      send,
      addLocalMsg,
      isAdmin:       isAdminRef.current,
      adminSecret:   adminSecretRef.current,
      onAdminAuth,
      disconnect:    handleDisconnect,
      roomName,
    });
    if (!handled) send(text);
  }, [handle, presenceNames, send, addLocalMsg, onAdminAuth, handleDisconnect, roomName]);

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
      setMode('multi');
      eventBus.emit('telnet:connected');
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
      runMultiBoot(occupantCount + 4);
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
        <div style={{ opacity: 0.25, fontSize: S.base, fontFamily: 'monospace', marginBottom: '0.25rem' }}>
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
          <ChannelStats occupantCount={occupantCount} handle={handle} roomName={roomName} />

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

          <div style={{ opacity: 0.55, fontSize: S.base, marginTop: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {roomName === 'mancave' ? (
              <>
                <span style={{ color: '#ff6600' }}>/leave</span> to exit
                &nbsp;·&nbsp;
                <span style={{ color: '#ff6600' }}>/vibe</span> · <span style={{ color: '#ff6600' }}>/roll</span> · <span style={{ color: '#ff6600' }}>/tv</span> · <span style={{ color: '#ff6600' }}>/beer</span>
                &nbsp;·&nbsp;
                <span style={{ color: '#ff6600' }}>/help</span> for all commands
              </>
            ) : (
              <>
                <span className={S.glow} style={{ color: C.accent }}>/q</span> to disconnect
                &nbsp;·&nbsp;
                <span className={S.glow} style={{ color: C.accent }}>/who</span> to list nodes
                &nbsp;·&nbsp;
                <span className={S.glow} style={{ color: C.accent }}>/help</span> for commands
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── TelnetSession (public export) ─────────────────────────────────────────────

interface TelnetSessionProps { host: string; handle: string; roomName?: 'ghost' | 'mancave'; }

export const TelnetSession: React.FC<TelnetSessionProps> = ({ host, handle, roomName = 'ghost' }) => {
  return <TelnetConnected host={host} handle={handle} roomName={roomName} />;
};
