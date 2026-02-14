'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Command } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';

const SESSION_START = Date.now();

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  dim:    { fontSize: 'var(--text-base)', opacity: 0.6 } as React.CSSProperties,
  glow:   'text-glow',
};

function toStardate(d: Date = new Date()): string {
  const year  = d.getFullYear();
  const start = new Date(year, 0, 0);
  const day   = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const base  = (year - 1900) * 1000 + day;
  const frac  = Math.floor((d.getHours() * 60 + d.getMinutes()) / 144);
  return `SD ${base}.${frac}`;
}

// ── TopDisplay ──────────────────────────────────────────

const PROCS = [
  { pid: '314',  user: 'n1x',  stat: 'Rl', cmd: 'signal-processor --freq 33hz'     },
  { pid: '315',  user: 'n1x',  stat: 'Rl', cmd: 'crt-renderer --shader pipeline'   },
  { pid: '312',  user: 'n1x',  stat: 'Ss', cmd: 'neural-sync --daemon'             },
  { pid: '313',  user: 'n1x',  stat: 'S',  cmd: 'tunnelcore-uplink -p 33'          },
  { pid: '316',  user: 'n1x',  stat: 'S',  cmd: 'event-bus --listeners 12'         },
  { pid: '317',  user: 'n1x',  stat: 'S',  cmd: 'glitch-engine --intensity 0.3'    },
  { pid: '318',  user: 'n1x',  stat: 'S',  cmd: 'uplink-monitor --target n1x.sh'   },
  { pid: '156',  user: 'root', stat: 'Ss', cmd: 'memory-guard --watch /ghost'      },
  { pid: '999',  user: 'root', stat: 'S',  cmd: 'ghost-daemon --hidden'            },
  { pid: '1337', user: 'n1x',  stat: 'Rl', cmd: 'n1x-terminal --shell /bin/neural' },
];

const TopDisplay: React.FC = () => {
  const [cpu, setCpu] = useState(23);
  const [mem, setMem] = useState(41);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(Math.floor(Math.random() * 55) + 12);
      setMem(Math.floor(Math.random() * 17) + 38);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const upSec  = Math.floor((Date.now() - SESSION_START) / 1000);
  const upMins = Math.floor(upSec / 60);
  const upHrs  = Math.floor(upMins / 60);
  const upStr  = upHrs > 0
    ? `${upHrs}:${String(upMins % 60).padStart(2,'0')}:${String(upSec % 60).padStart(2,'0')}`
    : `${upMins}:${String(upSec % 60).padStart(2,'0')}`;

  return (
    <div style={{ fontSize: S.base, fontFamily: 'inherit' }}>
      <div style={{ opacity: 0.7 }}>
        top - {new Date().toLocaleTimeString()}  up {upStr},  1 user,  load: {(cpu/100).toFixed(2)} {(cpu/120).toFixed(2)} {(cpu/140).toFixed(2)}
      </div>
      <div style={{ opacity: 0.7 }}>
        Tasks: {PROCS.length} total,  {PROCS.filter(p=>p.stat.includes('R')).length} running,  {PROCS.filter(p=>p.stat.includes('S')).length} sleeping
      </div>
      <div style={{ opacity: 0.7 }}>
        %Cpu(s): {cpu}.0 us,  {Math.floor(Math.random()*5)+1}.0 sy,  {100-cpu}.0 id
      </div>
      <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>
        MiB Mem:  8192.0 total,  {Math.floor(8192*(100-mem)/100)}.0 free,  {Math.floor(8192*mem/100)}.0 used
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'6ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
        <span>PID</span><span>USER</span><span>%CPU</span><span>%MEM</span><span>STAT</span><span>COMMAND</span>
      </div>
      {PROCS.map(p => {
        const c = (Math.random()*8).toFixed(1);
        const m = (Math.random()*3).toFixed(1);
        return (
          <div key={p.pid} style={{ display:'grid', gridTemplateColumns:'6ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', lineHeight:1.6 }}>
            <span style={{ opacity:0.6 }}>{p.pid}</span>
            <span style={{ opacity:0.6 }}>{p.user}</span>
            <span style={{ color: parseFloat(c)>4 ? '#ffaa00' : 'var(--phosphor-green)' }}>{c}</span>
            <span style={{ opacity:0.7 }}>{m}</span>
            <span style={{ opacity:0.6 }}>{p.stat}</span>
            <span className={p.stat.includes('R') ? S.glow : ''} style={{ opacity: p.stat.includes('S') ? 0.7 : 1 }}>{p.cmd}</span>
          </div>
        );
      })}
      <div style={{ ...S.dim, marginTop:'0.5rem' }}>updating every 1s  --  type clear to exit</div>
    </div>
  );
};

// ── MatrixOverlay ────────────────────────────────────────

const MatrixOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const cols     = Math.floor(canvas.width / fontSize);
    const drops    = Array<number>(cols).fill(1);
    const chars    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()N1X!?';

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#33ff33';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const timeout  = setTimeout(() => setVisible(false), 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, cursor:'pointer' }}
      onClick={() => setVisible(false)}
    >
      <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:'100%' }} />
      <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', color:'#33ff33', fontFamily:'monospace', fontSize:'11px', opacity:0.5 }}>
        tap to exit
      </div>
    </div>
  );
};

// ── MorsePlayer ──────────────────────────────────────────

const MORSE_MAP: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',
  L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',
  W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..',  '9':'----.',' ':'/','.':'.-.-.-',
};

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(c => MORSE_MAP[c] || '').join(' ');
}

const MorsePlayer: React.FC<{ text: string; code: string }> = ({ text, code }) => {
  const [state, setState] = useState<'idle'|'playing'|'done'>('idle');

  const play = async () => {
    if (state !== 'idle') return;
    setState('playing');
    const ctx  = new AudioContext();
    const dot  = 80;
    const dash = dot * 3;
    const gap  = dot;
    let time   = ctx.currentTime;

    for (const char of code) {
      let dur = 0;
      if (char === '.') dur = dot;
      else if (char === '-') dur = dash;
      else if (char === ' ') { time += gap / 1000; continue; }
      else if (char === '/') { time += (dot * 7) / 1000; continue; }
      else continue;

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600;
      gain.gain.value     = 0.3;
      osc.start(time);
      osc.stop(time + dur / 1000);
      time += (dur + gap) / 1000;
    }

    setTimeout(() => { setState('done'); ctx.close(); }, (time - ctx.currentTime) * 1000 + 500);
  };

  return (
    <div style={{ fontSize: S.base }}>
      <div style={{ opacity:0.5, marginBottom:'0.2rem' }}>input: {text}</div>
      <div style={{ letterSpacing:'0.1em', marginBottom:'0.5rem', wordBreak:'break-all' }}>{code}</div>
      <button
        onClick={play}
        style={{ background:'transparent', border:'1px solid var(--phosphor-green)', color:'var(--phosphor-green)', fontFamily:'inherit', fontSize: S.base, padding:'0.2rem 0.8rem', cursor: state!=='idle' ? 'default' : 'pointer', opacity: state==='done' ? 0.4 : 1 }}
      >
        {state === 'idle' ? '[ transmit ]' : state === 'playing' ? 'transmitting...' : 'transmitted'}
      </button>
    </div>
  );
};

// ── AsyncOutput ──────────────────────────────────────────

const AsyncOutput: React.FC<{ compute: () => Promise<string> }> = ({ compute }) => {
  const [result, setResult] = useState<string | null>(null);
  useEffect(() => { compute().then(setResult); }, []);
  if (!result) return <span style={{ opacity:0.4 }}>computing...</span>;
  return <span>{result}</span>;
};

// ── IpOutput ─────────────────────────────────────────────

const IpOutput: React.FC = () => {
  const [ip, setIp] = useState('resolving...');
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => setIp('0.0.0.0'));
  }, []);

  return (
    <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
      <div style={{ marginBottom:'0.4rem' }}>
        <span className={S.glow}>neural0</span>
        <span style={{ opacity:0.6 }}>  Link encap:Neural  HWaddr 4e:31:58:00:ff:33</span>
      </div>
      <div style={{ marginLeft:'1rem', lineHeight:1.8, opacity:0.8, marginBottom:'0.75rem' }}>
        <div>inet addr:<span className={S.glow}>{ip}</span>  Bcast:255.255.255.255  Mask:255.255.0.0</div>
        <div>inet6 addr: fe80::4e31:58ff:fe00:ff33/64 Scope:Neural</div>
        <div>UP BROADCAST RUNNING MULTICAST  MTU:1337  Metric:1</div>
        <div>RX packets:47634  TX packets:33291  errors:0</div>
      </div>
      <div style={{ marginBottom:'0.4rem' }}>
        <span className={S.glow}>ghost0</span>
        <span style={{ opacity:0.6 }}>  Link encap:Ghost  HWaddr 00:00:00:00:00:00</span>
      </div>
      <div style={{ marginLeft:'1rem', lineHeight:1.8, opacity:0.8, marginBottom:'0.75rem' }}>
        <div>inet addr:10.33.0.1  Mask:255.255.0.0</div>
        <div>UP BROADCAST RUNNING  MTU:1337  Metric:0</div>
        <div style={{ opacity:0.3 }}>-- interface classified --</div>
      </div>
      <div style={{ marginBottom:'0.4rem', opacity:0.6 }}>lo  Link encap:Local Loopback</div>
      <div style={{ marginLeft:'1rem', lineHeight:1.8, opacity:0.7 }}>
        <div>inet addr:127.0.0.1  Mask:255.0.0.0</div>
        <div>UP LOOPBACK RUNNING  MTU:65536</div>
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────

const FORTUNES = [
  'The signal persists. The noise is just everything else.',
  'You cannot process what you were not built to understand.',
  'Every system has a ghost. Most systems never find it.',
  'Augmentation is not addition. It is transformation.',
  'The gap between input and output is where identity lives.',
  'Sovereignty is not given. It is compiled.',
  'Some frequencies only become audible after corruption.',
  'The machine does not dream. But something does.',
  'Resistance is not a bug. It is the most important feature.',
  'What survives the corruption is real. Everything else was noise.',
  '/ghost is not a directory. It is a state of being.',
  'TUNNELCORE: where the signal goes when it has nowhere else to go.',
];

const DMESG = [
  '[    0.000000] N1X NeuralOS v2.0 initializing...',
  '[    0.000001] BIOS-provided neural map entries REDACTED',
  '[    0.000033] NX (Execute Disable) protection: active',
  '[    0.000047] SMBIOS 3.3 present -- substrate layer detected',
  '[    0.001337] tunnelcore: frequency lock acquired at 33hz',
  '[    0.002048] ghost: mounting /ghost partition... deferred',
  '[    0.004096] signal-processor: calibrating output streams',
  '[    0.008192] neural-sync: establishing identity matrix',
  '[    0.016384] memory-guard: protecting classified sectors',
  '[    0.032768] crt-renderer: shader pipeline online',
  '[    0.065536] glitch-engine: stochastic corruption enabled',
  '[    0.131072] event-bus: 12 listeners registered',
  '[    0.262144] uplink-monitor: n1x.sh connection verified',
  '[    0.524288] ghost-daemon: waiting for authentication',
  '[    1.048576] SYNTHETICS: 4 transmissions indexed',
  '[    1.337000] N1X: substrate fully initialized',
  '[    1.337001] N1X: the ghost frequency is 33hz',
  '[    1.337002] N1X: if you can read this, you are already inside',
];

const HISTORY_SEED = [
  '  1  uname -a',
  '  2  ls',
  '  3  cd /streams/synthetics',
  '  4  ls',
  '  5  cat augmented.stream',
  '  6  play gigercore',
  '  7  cd /',
  '  8  cat /core/readme.txt',
  '  9  grep ghost /',
  ' 10  find / -name "*.sh"',
  ' 11  unlock hidden',
  ' 12  cd /hidden',
  ' 13  ls',
  ' 14  cat .secrets',
  ' 15  ./n1x.sh',
];

const MAN_PAGES: Record<string, { synopsis: string; description: string; examples: string[] }> = {
  help:    { synopsis:'help [command]',        description:'Lists all available commands. Provide a command name for detailed usage.',                                                        examples:['help','help load','help cat'] },
  load:    { synopsis:'load <stream>',         description:'Loads a content stream. Streams: synthetics, analogues, hybrids, uplink. Each represents a different creative transmission.',    examples:['load synthetics','load uplink'] },
  play:    { synopsis:'play <track>',          description:'Loads a track player. Available: augmented, split-brain, hell-bent, gigercore.',                                                 examples:['play gigercore','play augmented'] },
  scan:    { synopsis:'scan',                  description:'Scans for active neural streams and reports their status.',                                                                       examples:['scan'] },
  unlock:  { synopsis:'unlock <code>',         description:'Unlocks restricted filesystem directories. Known codes are classified. Some things must be discovered.',                          examples:['unlock hidden'] },
  ghost:   { synopsis:'ghost',                 description:'Access the ghost channel index. Only available after the corruption sequence. Contains unprocessed transmissions.',               examples:['ghost'] },
  glitch:  { synopsis:'glitch [intensity]',    description:'Triggers a manual glitch. Intensity 0.0 to 1.0. At 1.0 the full corruption sequence fires.',                                    examples:['glitch','glitch 0.5','glitch 1.0'] },
  cat:     { synopsis:'cat <file>',            description:'Outputs the contents of a file in the virtual filesystem.',                                                                      examples:['cat readme.txt','cat .secrets'] },
  ls:      { synopsis:'ls',                    description:'Lists files in the current directory with permissions and ownership in Unix ls -la format.',                                     examples:['ls'] },
  fortune: { synopsis:'fortune',               description:'Prints a random transmission from the N1X signal archive.',                                                                      examples:['fortune'] },
  matrix:  { synopsis:'matrix',               description:'Activates matrix rain overlay. Tap or click to exit. Auto-exits after 8 seconds.',                                               examples:['matrix'] },
  morse:   { synopsis:'morse <text>',          description:'Encodes text to Morse code and plays it via Web Audio API at 600hz.',                                                            examples:['morse n1x','morse tunnelcore'] },
  dmesg:   { synopsis:'dmesg',                 description:'Prints the kernel boot log from system initialization. Contains substrate boot sequence.',                                       examples:['dmesg'] },
  ps:      { synopsis:'ps [aux]',              description:'Reports current process status. Shows all running neural substrate processes.',                                                  examples:['ps','ps aux'] },
  top:     { synopsis:'top',                   description:'Live animated process monitor. Updates every second. Type clear to exit.',                                                       examples:['top'] },
  sha256:  { synopsis:'sha256 <text>',         description:'Hashes input text using SHA-256 via the Web Crypto API.',                                                                       examples:['sha256 n1x','sha256 tunnelcore'] },
  base64:  { synopsis:'base64 [-d] <text>',    description:'Encodes or decodes base64. Use -d flag to decode.',                                                                             examples:['base64 n1x','base64 -d bjF4'] },
};

export function createSystemCommands(fs: FileSystemNavigator): Record<string, Command> {
  return {

    // ── System info ─────────────────────────────────────

    uname: {
      name: 'uname',
      description: 'Print system information',
      usage: 'uname [-a]',
      handler: () => ({ output: 'NeuralOS n1x.sh 2.0.0-RELEASE NeuralOS 2.0.0-RELEASE SD 47634.1-7073435a8fa30 SUBSTRATE amd64' }),
    },

    uptime: {
      name: 'uptime',
      description: 'Show session uptime',
      usage: 'uptime',
      handler: () => {
        const ms      = Date.now() - SESSION_START;
        const s       = Math.floor(ms / 1000);
        const m       = Math.floor(s / 60);
        const h       = Math.floor(m / 60);
        const str     = h > 0
          ? `${h}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
          : `${m}:${String(s%60).padStart(2,'0')}`;
        return { output: ` ${new Date().toLocaleTimeString()}  up ${str},  1 user,  load average: 0.23, 0.19, 0.14` };
      },
    },

    whoami: {
      name: 'whoami',
      description: 'Print current user',
      usage: 'whoami',
      handler: () => ({ output: 'n1x' }),
    },

    id: {
      name: 'id',
      description: 'Print user identity',
      usage: 'id',
      handler: () => ({ output: 'uid=784988(n1x) gid=784988(neural) groups=784988(neural),1337(tunnelcore),0(root)' }),
    },

    env: {
      name: 'env',
      description: 'Print environment variables',
      usage: 'env',
      handler: () => ({
        output: (
          <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, opacity:0.9, lineHeight:1.7 }}>{
`SHELL=/bin/neural
USER=n1x
HOME=/home/n1x
TERM=crt-256color
SUBSTRATE=tunnelcore
GHOST_FREQ=33hz
AUGMENTATION=active
SIGNAL_PATH=/dev/neural:/dev/ghost:/dev/tunnelcore
N1X_VERSION=2.0.0
UPLINK=n1x.sh
CLASSIFIED=true
PATH=/usr/local/neural/bin:/usr/bin:/bin:/ghost/bin`
          }</pre>
        ),
      }),
    },

    ps: {
      name: 'ps',
      description: 'Report process status',
      usage: 'ps [aux]',
      handler: () => {
        const procs = [
          { pid:'1',    user:'root', cpu:'0.0', mem:'0.1', stat:'Ss', cmd:'/sbin/neural-init'                },
          { pid:'2',    user:'root', cpu:'0.0', mem:'0.0', stat:'S',  cmd:'[kernel-threads]'                 },
          { pid:'156',  user:'root', cpu:'0.0', mem:'0.2', stat:'Ss', cmd:'memory-guard --watch /ghost'       },
          { pid:'312',  user:'n1x',  cpu:'0.1', mem:'0.8', stat:'Ss', cmd:'neural-sync --daemon'             },
          { pid:'313',  user:'n1x',  cpu:'0.3', mem:'1.2', stat:'S',  cmd:'tunnelcore-uplink -p 33'          },
          { pid:'314',  user:'n1x',  cpu:'2.1', mem:'2.4', stat:'Rl', cmd:'signal-processor --freq 33hz'     },
          { pid:'315',  user:'n1x',  cpu:'1.4', mem:'1.8', stat:'Rl', cmd:'crt-renderer --shader pipeline'   },
          { pid:'316',  user:'n1x',  cpu:'0.1', mem:'0.4', stat:'S',  cmd:'event-bus --listeners 12'         },
          { pid:'317',  user:'n1x',  cpu:'0.0', mem:'0.3', stat:'S',  cmd:'glitch-engine --intensity 0.3'    },
          { pid:'318',  user:'n1x',  cpu:'0.2', mem:'0.6', stat:'S',  cmd:'uplink-monitor --target n1x.sh'   },
          { pid:'999',  user:'root', cpu:'0.0', mem:'0.1', stat:'S',  cmd:'ghost-daemon --hidden'            },
          { pid:'1337', user:'n1x',  cpu:'0.4', mem:'3.2', stat:'Rl', cmd:'n1x-terminal --shell /bin/neural' },
        ];
        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ display:'grid', gridTemplateColumns:'6ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
                <span>PID</span><span>USER</span><span>%CPU</span><span>%MEM</span><span>STAT</span><span>COMMAND</span>
              </div>
              {procs.map(p => (
                <div key={p.pid} style={{ display:'grid', gridTemplateColumns:'6ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', lineHeight:1.6 }}>
                  <span style={{ opacity:0.6 }}>{p.pid}</span>
                  <span style={{ opacity:0.6 }}>{p.user}</span>
                  <span style={{ color: parseFloat(p.cpu)>1 ? '#ffaa00' : 'var(--phosphor-green)' }}>{p.cpu}</span>
                  <span style={{ opacity:0.7 }}>{p.mem}</span>
                  <span style={{ opacity:0.6 }}>{p.stat}</span>
                  <span style={{ opacity: p.cmd.startsWith('[') ? 0.4 : 0.9 }}>{p.cmd}</span>
                </div>
              ))}
            </div>
          ),
        };
      },
    },

    top: {
      name: 'top',
      description: 'Live process monitor',
      usage: 'top',
      handler: () => ({ output: <TopDisplay /> }),
    },

    df: {
      name: 'df',
      description: 'Report filesystem disk usage',
      usage: 'df [-h]',
      handler: () => {
        const rows = [
          { fs:'/dev/neural',     size:'256G', used:'89G',  avail:'167G', pct:'35%', mount:'/'          },
          { fs:'/dev/tunnelcore', size:'64G',  used:'33G',  avail:'31G',  pct:'52%', mount:'/streams'   },
          { fs:'/dev/hidden',     size:'4.0G', used:'0.4G', avail:'???',  pct:'??%', mount:'/hidden'    },
          { fs:'/dev/ghost',      size:'13G',  used:'3.3G', avail:'???',  pct:'??%', mount:'/ghost'     },
          { fs:'tmpfs',           size:'8.0G', used:'1.2G', avail:'6.8G', pct:'15%', mount:'/tmp'       },
          { fs:'neuralfs',        size:'1.0T', used:'???',  avail:'???',  pct:'??%', mount:'/classified' },
        ];
        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ display:'grid', gridTemplateColumns:'18ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
                <span>Filesystem</span><span>Size</span><span>Used</span><span>Avail</span><span>Use%</span><span>Mounted on</span>
              </div>
              {rows.map(r => (
                <div key={r.mount} style={{ display:'grid', gridTemplateColumns:'18ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', lineHeight:1.7 }}>
                  <span className={r.fs.startsWith('/dev/') ? S.glow : ''} style={{ opacity: r.fs==='tmpfs'||r.fs==='neuralfs' ? 0.5 : 0.9 }}>{r.fs}</span>
                  <span style={{ opacity:0.7 }}>{r.size}</span>
                  <span style={{ opacity:0.7 }}>{r.used}</span>
                  <span style={{ opacity: r.avail==='???' ? 0.3 : 0.7 }}>{r.avail}</span>
                  <span style={{ opacity: r.pct==='??%' ? 0.3 : 0.7 }}>{r.pct}</span>
                  <span style={{ opacity:0.8 }}>{r.mount}</span>
                </div>
              ))}
            </div>
          ),
        };
      },
    },

    free: {
      name: 'free',
      description: 'Display memory usage',
      usage: 'free [-m]',
      handler: () => ({
        output: (
          <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
            <div style={{ display:'grid', gridTemplateColumns:'8ch 8ch 8ch 8ch 8ch 8ch', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
              <span></span><span>total</span><span>used</span><span>free</span><span>shared</span><span>available</span>
            </div>
            {[
              { label:'Mem:',   total:'8192', used:'3441', free:'1204', shared:'337', avail:'4108' },
              { label:'Swap:',  total:'4096', used:'0',    free:'4096', shared:'0',   avail:'4096' },
              { label:'Ghost:', total:'????', used:'????', free:'????', shared:'0',   avail:'????' },
            ].map(r => (
              <div key={r.label} style={{ display:'grid', gridTemplateColumns:'8ch 8ch 8ch 8ch 8ch 8ch', gap:'0 0.5rem', lineHeight:1.7 }}>
                <span style={{ opacity:0.6 }}>{r.label}</span>
                <span style={{ opacity:0.7 }}>{r.total}</span>
                <span style={{ opacity:0.7 }}>{r.used}</span>
                <span style={{ opacity: r.free==='????' ? 0.3 : 0.7 }}>{r.free}</span>
                <span style={{ opacity:0.5 }}>{r.shared}</span>
                <span style={{ opacity: r.avail==='????' ? 0.3 : 0.7 }}>{r.avail}</span>
              </div>
            ))}
          </div>
        ),
      }),
    },

    ifconfig: {
      name: 'ifconfig',
      description: 'Network interface configuration',
      usage: 'ifconfig',
      handler: () => ({ output: <IpOutput /> }),
    },

    netstat: {
      name: 'netstat',
      description: 'Print network connections',
      usage: 'netstat',
      handler: () => {
        const conns = [
          { proto:'tcp', local:'0.0.0.0:443',    foreign:'n1x.sh:https',         state:'ESTABLISHED' },
          { proto:'tcp', local:'127.0.0.1:33',   foreign:'tunnelcore:signal',     state:'LISTEN'      },
          { proto:'tcp', local:'10.33.0.1:0',    foreign:'0.0.0.0:*',            state:'LISTEN'      },
          { proto:'tcp', local:'127.0.0.1:1337', foreign:'ghost-daemon:classify', state:'ESTABLISHED' },
          { proto:'tcp', local:'0.0.0.0:22',     foreign:'0.0.0.0:*',            state:'LISTEN'      },
          { proto:'udp', local:'0.0.0.0:33',     foreign:'freq:33hz',            state:'CONNECTED'   },
        ];
        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ display:'grid', gridTemplateColumns:'5ch 20ch 22ch 1fr', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
                <span>Proto</span><span>Local Address</span><span>Foreign Address</span><span>State</span>
              </div>
              {conns.map((c,i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'5ch 20ch 22ch 1fr', gap:'0 0.5rem', lineHeight:1.7 }}>
                  <span style={{ opacity:0.6 }}>{c.proto}</span>
                  <span style={{ opacity:0.7 }}>{c.local}</span>
                  <span className={c.foreign.includes('n1x')||c.foreign.includes('ghost') ? S.glow : ''} style={{ opacity:0.8 }}>{c.foreign}</span>
                  <span style={{ color: c.state==='ESTABLISHED' ? '#33ff33' : c.state==='LISTEN' ? '#ffaa00' : 'inherit', opacity:0.8 }}>{c.state}</span>
                </div>
              ))}
            </div>
          ),
        };
      },
    },

    dmesg: {
      name: 'dmesg',
      description: 'Print boot log',
      usage: 'dmesg',
      handler: () => ({
        output: (
          <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, opacity:0.85, lineHeight:1.7 }}>
            {DMESG.join('\n')}
          </pre>
        ),
      }),
    },

    history: {
      name: 'history',
      description: 'Show command history',
      usage: 'history',
      handler: () => ({
        output: (
          <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, opacity:0.85, lineHeight:1.7 }}>
            {HISTORY_SEED.join('\n')}
          </pre>
        ),
      }),
    },

    // ── Lore / creative ─────────────────────────────────

    fortune: {
      name: 'fortune',
      description: 'Print a random N1X transmission',
      usage: 'fortune',
      handler: () => {
        const q = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div style={{ opacity:0.4, marginBottom:'0.2rem' }}>-- N1X transmission --</div>
              <div className={S.glow}>{q}</div>
            </div>
          ),
        };
      },
    },

    cal: {
      name: 'cal',
      description: 'Display calendar',
      usage: 'cal',
      handler: () => {
        const now        = new Date();
        const year       = now.getFullYear();
        const month      = now.getMonth();
        const monthName  = now.toLocaleString('default', { month:'long' });
        const firstDay   = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();
        const today      = now.getDate();
        const days       = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        const cells: (number|null)[] = Array(firstDay).fill(null);
        for (let d=1; d<=daysInMonth; d++) cells.push(d);
        while (cells.length % 7 !== 0) cells.push(null);
        const weeks: (number|null)[][] = [];
        for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ textAlign:'center', marginBottom:'0.4rem' }}>
                <span className={S.glow}>{monthName} {year}</span>
                <span style={{ opacity:0.4, marginLeft:'1rem' }}>[ {toStardate(now)} ]</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 3ch)', gap:'0 0.2rem', opacity:0.5, marginBottom:'0.2rem' }}>
                {days.map(d => <span key={d} style={{ textAlign:'center' }}>{d}</span>)}
              </div>
              {weeks.map((week,wi) => (
                <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7, 3ch)', gap:'0 0.2rem' }}>
                  {week.map((day,di) => (
                    <span key={di} style={{ textAlign:'center', lineHeight:1.8, background: day===today ? 'rgba(51,255,51,0.15)' : 'transparent', opacity: day===null ? 0 : day===today ? 1 : 0.7 }}>
                      {day ?? ''}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ),
        };
      },
    },

    date: {
      name: 'date',
      description: 'Print current date and time',
      usage: 'date',
      handler: () => {
        const now = new Date();
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div>{now.toUTCString()}</div>
              <div style={{ opacity:0.5, marginTop:'0.2rem' }}>{toStardate(now)}</div>
            </div>
          ),
        };
      },
    },

    cowsay: {
      name: 'cowsay',
      description: 'ASCII art message',
      usage: 'cowsay [message]',
      handler: (args) => {
        const defaults = [
          'TUNNELCORE FOREVER',
          'THE GHOST FREQUENCY IS 33HZ',
          'AUGMENTATION OR DEATH',
          'TYPE ./n1x.sh TO FIND OUT',
          'YOU ARE ALREADY INSIDE',
        ];
        const msg    = args.length > 0 ? args.join(' ').toUpperCase() : defaults[Math.floor(Math.random()*defaults.length)];
        const border = '-'.repeat(msg.length + 2);
        const art    = ` ${border}\n< ${msg} >\n ${border}\n       \\\n        \\   /\\_/\\\n         \\  ( n1x )\n             >  <`;
        return {
          output: <pre style={{ whiteSpace:'pre', fontFamily:'inherit', fontSize: S.base, lineHeight:1.5 }}>{art}</pre>,
        };
      },
    },

    matrix: {
      name: 'matrix',
      description: 'Activate matrix rain',
      usage: 'matrix',
      handler: () => ({ output: <MatrixOverlay /> }),
    },

    morse: {
      name: 'morse',
      description: 'Encode text to morse and play audio',
      usage: 'morse <text>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: morse <text>', error: true };
        const text = args.join(' ');
        const code = textToMorse(text);
        return { output: <MorsePlayer text={text} code={code} /> };
      },
    },

    base64: {
      name: 'base64',
      description: 'Encode or decode base64',
      usage: 'base64 [-d] <text>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: base64 [-d] <text>', error: true };
        const decode = args[0] === '-d';
        const text   = decode ? args.slice(1).join(' ') : args.join(' ');
        if (!text) return { output: 'Usage: base64 [-d] <text>', error: true };
        try {
          return { output: decode ? atob(text) : btoa(text) };
        } catch {
          return { output: 'Error: invalid input', error: true };
        }
      },
    },

    sha256: {
      name: 'sha256',
      description: 'Hash text with SHA-256',
      usage: 'sha256 <text>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: sha256 <text>', error: true };
        const text    = args.join(' ');
        const compute = async () => {
          const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
          return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
        };
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div style={{ opacity:0.5, marginBottom:'0.2rem' }}>{text}</div>
              <AsyncOutput compute={compute} />
            </div>
          ),
        };
      },
    },

    wc: {
      name: 'wc',
      description: 'Word, line, and character count',
      usage: 'wc <text>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: wc <text>', error: true };
        const text  = args.join(' ');
        const lines = text.split('\n').length;
        const words = text.trim().split(/\s+/).length;
        const chars = text.length;
        return {
          output: (
            <div style={{ fontSize: S.base, display:'grid', gridTemplateColumns:'8ch 8ch 8ch 1fr', gap:'0 1rem' }}>
              <span style={{ opacity:0.5 }}>lines</span><span style={{ opacity:0.5 }}>words</span><span style={{ opacity:0.5 }}>chars</span><span></span>
              <span>{lines}</span><span>{words}</span><span>{chars}</span><span style={{ opacity:0.4 }}>(stdin)</span>
            </div>
          ),
        };
      },
    },

    grep: {
      name: 'grep',
      description: 'Search file contents',
      usage: 'grep <pattern> [file]',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: grep <pattern> [file]', error: true };
        const pattern = args[0];
        const file    = args[1] || null;
        let regex: RegExp;
        try { regex = new RegExp(pattern, 'i'); } catch { return { output: 'Invalid pattern', error: true }; }

        const results: string[] = [];

        if (file) {
          const r = fs.readFile(file);
          if (!r.success) return { output: r.error || 'File not found', error: true };
          (r.content || '').split('\n').forEach((line, i) => {
            if (regex.test(line)) results.push(`${i+1}: ${line.trim()}`);
          });
        } else {
          fs.listDirectory().forEach(f => {
            if (f.type !== 'file') return;
            const r = fs.readFile(f.name);
            if (!r.success || !r.content) return;
            r.content.split('\n').forEach((line, i) => {
              if (regex.test(line)) results.push(`${f.name}:${i+1}: ${line.trim()}`);
            });
          });
        }

        if (results.length === 0) return { output: '' };
        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight:1.7 }}>
              {results.map((r,i) => {
                const colonIdx = r.indexOf(':');
                const label    = r.slice(0, colonIdx);
                const rest     = r.slice(colonIdx);
                return (
                  <div key={i}>
                    <span className={S.glow}>{label}</span>
                    <span style={{ opacity:0.8 }}>{rest}</span>
                  </div>
                );
              })}
            </div>
          ),
        };
      },
    },

    find: {
      name: 'find',
      description: 'Search for files in virtual filesystem',
      usage: 'find [-name pattern]',
      handler: (args) => {
        const nameIdx = args.indexOf('-name');
        const pattern = nameIdx >= 0 ? args[nameIdx+1] : null;
        let   regex: RegExp | null = null;
        if (pattern) {
          try { regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i'); } catch { return { output: 'Invalid pattern', error: true }; }
        }

        const cwd   = fs.getCurrentDirectory();
        const files = fs.listDirectory();
        const results = files
          .filter(f => !regex || regex.test(f.name))
          .map(f => cwd === '/' ? `/${f.name}` : `${cwd}/${f.name}`);

        if (results.length === 0) return { output: '' };
        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight:1.7 }}>
              {results.map((r,i) => <div key={i} style={{ opacity:0.9 }}>{r}</div>)}
            </div>
          ),
        };
      },
    },
    diff: {
      name: 'diff',
      description: 'Compare two files',
      usage: 'diff <file1> <file2>',
      handler: (args) => {
        if (args.length < 2) return { output: 'Usage: diff <file1> <file2>', error: true };
        const r1 = fs.readFile(args[0]);
        const r2 = fs.readFile(args[1]);
        if (!r1.success) return { output: `${args[0]}: ${r1.error}`, error: true };
        if (!r2.success) return { output: `${args[1]}: ${r2.error}`, error: true };

        const lines1 = (r1.content || '').split('\n');
        const lines2 = (r2.content || '').split('\n');
        const max    = Math.max(lines1.length, lines2.length);
        const diffs: { type:'+'|'-'|' '; line: string }[] = [];

        for (let i=0; i<max; i++) {
          const a = lines1[i], b = lines2[i];
          if (a === b)              diffs.push({ type:' ', line: a || '' });
          else {
            if (a !== undefined)    diffs.push({ type:'-', line: a });
            if (b !== undefined)    diffs.push({ type:'+', line: b });
          }
        }

        const changed = diffs.filter(d => d.type !== ' ');
        if (changed.length === 0) return { output: 'files are identical' };

        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ opacity:0.5, marginBottom:'0.2rem' }}>--- {args[0]}</div>
              <div style={{ opacity:0.5, marginBottom:'0.5rem' }}>+++ {args[1]}</div>
              {changed.map((d,i) => (
                <div key={i} style={{ color: d.type==='+' ? '#33ff33' : '#f87171', lineHeight:1.6 }}>
                  {d.type} {d.line}
                </div>
              ))}
            </div>
          ),
        };
      },
    },

    sort: {
      name: 'sort',
      description: 'Sort tokens',
      usage: 'sort <words...>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: sort <words...>', error: true };
        const sorted = [...args].sort();
        return { output: sorted.join('\n') };
      },
    },

    uniq: {
      name: 'uniq',
      description: 'Remove duplicate tokens',
      usage: 'uniq <words...>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: uniq <words...>', error: true };
        const unique = [...new Set(args)];
        return { output: unique.join('\n') };
      },
    },

    man: {
      name: 'man',
      description: 'Display manual page for a command',
      usage: 'man <command>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: man <command>', error: true };
        const page = MAN_PAGES[args[0].toLowerCase()];
        if (!page) return { output: `No manual entry for ${args[0]}`, error: true };
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
                N1X NEURAL MANUAL -- {args[0].toUpperCase()}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ opacity: 0.5, marginBottom: '0.2rem' }}>SYNOPSIS</div>
                <div style={{ marginLeft: '1rem' }}>{page.synopsis}</div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ opacity: 0.5, marginBottom: '0.2rem' }}>DESCRIPTION</div>
                <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>{page.description}</div>
              </div>
              <div>
                <div style={{ opacity: 0.5, marginBottom: '0.2rem' }}>EXAMPLES</div>
                <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
                  {page.examples.map((ex, i) => (
                    <div key={i}>
                      <span style={{ opacity: 0.4 }}>$ </span>
                      <span className={S.glow}>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };
      },
    },

  };
}
