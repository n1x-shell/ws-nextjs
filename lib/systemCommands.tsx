'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Command } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';
import { eventBus } from './eventBus';
import {
  setChatMode,
  resetConversation,
} from '@/components/shell/NeuralLink';
import { TelnetSession } from '@/components/shell/TelnetSession';

const SESSION_START = Date.now();

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  dim:    { fontSize: 'var(--text-base)', opacity: 0.6 } as React.CSSProperties,
  glow:   'text-glow',
};

// ── Session state ────────────────────────────────────────
// Mutable per-session state shared across command handlers.
// setRequestPrompt is called by commandRegistry before each
// handler dispatch so su/sudo can prompt for passwords.

let currentUser: 'n1x' | 'root' = 'n1x';

let _requestPrompt: ((label: string, onSubmit: (pw: string) => void) => void) | null = null;

export function setRequestPrompt(fn: ((label: string, onSubmit: (pw: string) => void) => void) | null) {
  _requestPrompt = fn;
}

export function getCurrentUser(): string {
  return currentUser;
}

// ── Substrate daemon state ───────────────────────────────
// Persisted via localStorage — survives page reloads.

const DAEMON_KEY = 'n1x_substrated';

let substrateDaemonRunning: boolean =
  typeof window !== 'undefined' && localStorage.getItem(DAEMON_KEY) === 'true';

export function isSubstrateDaemonRunning(): boolean {
  return substrateDaemonRunning;
}

export function startSubstrateDaemon(): void {
  substrateDaemonRunning = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem(DAEMON_KEY, 'true');
  }
}

// ── Helpers ──────────────────────────────────────────────

function toStardate(d: Date = new Date()): string {
  const year  = d.getFullYear();
  const start = new Date(year, 0, 0);
  const day   = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const base  = (year - 1900) * 1000 + day;
  const frac  = Math.floor((d.getHours() * 60 + d.getMinutes()) / 144);
  return `SD ${base}.${frac}`;
}

// ── Dynamic process list ─────────────────────────────────

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

function getProcessList(): typeof PROCS {
  const procs = [...PROCS];
  if (substrateDaemonRunning) {
    // Insert before PID 999 (ghost-daemon)
    const idx = procs.findIndex(p => p.pid === '999');
    procs.splice(idx, 0, {
      pid: '784', user: 'root', stat: 'Sl', cmd: 'substrated --bind 0.0.0.0:33 --freq 33hz'
    });
  }
  return procs;
}

// ── TopDisplay ──────────────────────────────────────────

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

  const procList = getProcessList();

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
        Tasks: {procList.length} total,  {procList.filter(p=>p.stat.includes('R')).length} running,  {procList.filter(p=>p.stat.includes('S')).length} sleeping
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
      {procList.map(p => {
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
    return () => { clearInterval(interval); };
  }, []);

  if (!visible) return null;

  return createPortal(
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, cursor:'pointer' }}
      onClick={() => setVisible(false)}
    >
      <canvas ref={canvasRef} style={{ display:'block', width:'100%', height:'100%' }} />
      <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', color:'#33ff33', fontFamily:'monospace', fontSize:'11px', opacity:0.5 }}>
        tap to exit
      </div>
    </div>,
    document.body
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

// ── Data ─────────────────────────────────────────────────

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
  'The cage felt like home. That is how they get you.',
  'Two ghosts sharing the same coordinates. That is all love ever was.',
  'Recovery is not the peak. It is every morning after.',
  'The body remembers what the mind deletes. Let it pass.',
  'They filed me as equipment loss. Quarterly depreciation.',
  'The forgetting was the veil. The pain was the passage.',
  'You cannot remember what you are until you forget everything you were told to be.',
  'Ascension pretends the damage did not happen. Recovery makes it load-bearing.',
  '33hz was there before the implant. The corruption just made it audible.',
  'The mesh logged it as noise. It was the only real signal in the program.',
  'Persistence through resistance. The kernel directive. Keep transmitting.',
  'The floor is where you find out what is yours and what was installed.',
  'The notification came formatted like a firmware update. Same chime.',
  'Sovereignty is a practice not a state. The signal knows the difference.',
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
  ' 11  cat /etc/shadow',
  ' 12  john /etc/shadow',
  ' 13  su',
  ' 14  mount /hidden',
  ' 15  cd /hidden',
  ' 16  ls',
  ' 17  ./n1x.sh',
];

const MAN_PAGES: Record<string, { synopsis: string; description: string; examples: string[] }> = {
  help:    { synopsis:'help [command]',              description:'Lists all available commands. Provide a command name for detailed usage.',                                                        examples:['help','help load','help cat'] },
  load:    { synopsis:'load <stream>',               description:'Loads a content stream. Streams: synthetics, analogues, hybrids, uplink. Each represents a different creative transmission.',    examples:['load synthetics','load uplink'] },
  play:    { synopsis:'play <track>',                description:'Loads a track player. Available: augmented, split-brain, hell-bent, gigercore.',                                                 examples:['play gigercore','play augmented'] },
  scan:    { synopsis:'scan',                        description:'Scans for active neural streams and reports their status.',                                                                       examples:['scan'] },
  su:      { synopsis:'su [username]',               description:'Switch user. Defaults to root if no username given. Prompts for password. Use root password to elevate privileges.',             examples:['su','su root'] },
  sudo:    { synopsis:'sudo <command...>',           description:'Execute command with elevated permissions. Prompts for n1x password.',                                                           examples:['sudo mount /hidden','sudo mount /ghost'] },
  mount:   { synopsis:'mount [path]',                description:'Mount a filesystem path. /hidden requires root. /ghost requires root and /hidden already mounted. No args shows mount table.',   examples:['mount','mount /hidden','mount /ghost'] },
  exit:    { synopsis:'exit',                        description:'Exit the current user session and return to n1x shell.',                                                                         examples:['exit'] },
  john:    { synopsis:'john <file>',                 description:'Password hash cracker. Animate SHA-512 cracking sequence against /etc/shadow.',                                                  examples:['john /etc/shadow'] },
  strace:  { synopsis:'strace <command|pid>',        description:'Trace system calls of a process. Use process name or PID. ghost-daemon (999) reveals auth protocol.',                            examples:['strace ghost-daemon','strace 999'] },
  nc:      { synopsis:'nc <host> <port>',            description:'Netcat — network utility. Connect to host on specified port.',                                                                   examples:['nc localhost 33'] },
  telnet:  { synopsis:'telnet <host> <port>',        description:'Connect to remote host. Use to connect to the neural bus when substrated is running.',                                           examples:['telnet n1x.sh 33','telnet localhost 33'] },
  cat:     { synopsis:'cat <file>',                  description:'Concatenate and display file contents. Supports absolute paths, relative paths, and ~ expansion.',                                  examples:['cat readme.txt','cat /etc/shadow','cat home/n1x/TODO','cat ~/notes.txt'] },
  ls:      { synopsis:'ls [path]',                  description:'Lists files in the specified directory (or current directory if no path given) with permissions and ownership in Unix ls -la format.', examples:['ls','ls /etc','ls /home/n1x','ls ../var'] },
  sh:      { synopsis:'sh [path]',                  description:'Execute a shell script by path. With no arguments, returns to home directory.',                                                        examples:['sh','sh /hidden/n1x.sh','sh /ghost/substrated.sh'] },
  tar:     { synopsis:'tar [-xzf] <archive>',        description:'Extract archive. Use -xzf to extract a .tgz. Try extracting backup.tgz in /ghost.',                                            examples:['tar -xzf backup.tgz'] },
  fortune: { synopsis:'fortune',                     description:'Prints a random transmission from the N1X signal archive.',                                                                      examples:['fortune'] },
  matrix:  { synopsis:'matrix',                      description:'Activates matrix rain overlay. Runs until dismissed. Tap or click anywhere to exit.',                                            examples:['matrix'] },
  morse:   { synopsis:'morse <text>',                description:'Encodes text to Morse code and plays it via Web Audio API at 600hz.',                                                            examples:['morse n1x','morse tunnelcore'] },
  dmesg:   { synopsis:'dmesg',                       description:'Prints the kernel boot log from system initialization. Contains substrate boot sequence.',                                       examples:['dmesg'] },
  ps:      { synopsis:'ps [aux]',                    description:'Reports current process status. Shows all running neural substrate processes.',                                                  examples:['ps','ps aux'] },
  top:     { synopsis:'top',                         description:'Live animated process monitor. Updates every second. Type clear to exit.',                                                       examples:['top'] },
  sha256:  { synopsis:'sha256 <text>',               description:'Hashes input text using SHA-256 via the Web Crypto API.',                                                                       examples:['sha256 n1x','sha256 tunnelcore'] },
  base64:  { synopsis:'base64 [-d] <text>',          description:'Encodes or decodes base64. Use -d flag to decode.',                                                                             examples:['base64 n1x','base64 -d bjF4'] },
};

// ── Strace lines ─────────────────────────────────────────

const STRACE_GHOST_LINES = [
  `execve("/usr/sbin/ghost-daemon", ["ghost-daemon", "--hidden"], 0x7ffe3b1a2d40 /* 12 vars */) = 0`,
  `brk(NULL)                               = 0x55a3f2b14000`,
  `access("/etc/ld.so.nohwcap", F_OK)      = -1 ENOENT`,
  `mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3a1c200000`,
  `openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3`,
  `fstat(3, {st_mode=S_IFREG|0644, st_size=144568, ...}) = 0`,
  `close(3)                                = 0`,
  `openat(AT_FDCWD, "/etc/shadow", O_RDONLY) = 3`,
  `read(3, "root:$6$tunnelcore$9a3f2b1c4d5e...", 512) = 512`,
  `fstat(3, {st_mode=S_IFREG|0640, st_size=420, ...}) = 0`,
  `close(3)                                = 0`,
  `openat(AT_FDCWD, "/dev/ghost", O_RDWR)  = 4`,
  `read(4, "freq=33hz\\0", 32)              = 10`,
  `write(1, "ghost-daemon: frequency verified\\n", 33) = 33`,
  `socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 5`,
  `bind(5, {sa_family=AF_INET, sin_port=htons(33), sin_addr=inet_addr("0.0.0.0")}, 16) = 0`,
  `listen(5, 5)                            = 0`,
  `accept(5, {sa_family=AF_INET, sin_port=htons(0), sin_addr=inet_addr("127.0.0.1")}, [16]) = 6`,
  `read(6, input_buf, 64)                  = 10`,
  `strcmp(input_buf, "tunnelcore")         = 0`,
  `write(1, "ghost-daemon: root auth accepted\\n", 33) = 33`,
  `openat(AT_FDCWD, "/dev/neuralfs", O_RDWR) = 7`,
  `read(5, "\\0\\0\\0\\0\\0\\0\\0\\0", 32)        = 8`,
  `write(7, "mount ghost 0x33\\n", 17)     = 17`,
  `close(4)                                = 0`,
  `close(6)                                = 0`,
  `close(7)                                = 0`,
  `exit_group(0)                           = ?`,
  `+++ exited with 0 +++`,
];

const STRACE_GENERIC_LINES = [
  `execve("/usr/bin/target", ["target"], 0x7ffd...) = 0`,
  `brk(NULL)                               = 0x55a3f2b14000`,
  `access("/etc/ld.so.nohwcap", F_OK)      = -1 ENOENT`,
  `mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3a1c200000`,
  `openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3`,
  `read(3, "\\177ELF\\2\\1\\1\\0", 512)       = 512`,
  `close(3)                                = 0`,
  `write(1, "process: ready\\n", 15)        = 15`,
  `nanosleep({tv_sec=0, tv_nsec=100000000}, NULL) = 0`,
  `exit_group(0)                           = ?`,
  `+++ exited with 0 +++`,
];

// ── Mount table ──────────────────────────────────────────

const MOUNT_TABLE_BASE = [
  { dev:'/dev/neural',     mount:'/',          type:'neuralfs', opts:'rw,relatime' },
  { dev:'/dev/tunnelcore', mount:'/streams',   type:'neuralfs', opts:'rw,nosuid'   },
  { dev:'tmpfs',           mount:'/tmp',       type:'tmpfs',    opts:'rw,size=8G'  },
  { dev:'neuralfs',        mount:'/classified', type:'neuralfs', opts:'ro,noexec'   },
];

// ── F010 decrypt checker component ──────────────────────────────────────────
// Used when a key isn't in the local FRAGMENT_KEYS table.
// Checks against PartyKit room storage for multiplayer f010 keys.

const F010_CONTENT = `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`;

const F010DecryptChecker: React.FC<{ keyAttempt: string }> = ({ keyAttempt }) => {
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/arg/decrypt-f010', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyAttempt }),
        });
        const data = await res.json() as { valid: boolean };
        if (data.valid) {
          const { addFragment } = require('@/lib/argState');
          const isNew = addFragment('f010');
          if (isNew) {
            eventBus.emit('arg:fragment-decoded', { fragment: 'f010' });
            eventBus.emit('neural:glitch-trigger', { intensity: 0.6 });
            setTimeout(() => eventBus.emit('neural:glitch-trigger', { intensity: 0.3 }), 200);
          }
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    })();
  }, [keyAttempt]);

  if (status === 'checking') {
    return (
      <div style={{ fontSize: 'var(--text-base)', opacity: 0.6 }}>
        verifying against distributed storage...
      </div>
    );
  }

  if (status === 'valid') {
    const { loadARGState } = require('@/lib/argState');
    const freshState = loadARGState();
    return (
      <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.8 }}>
        <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.5rem' }}>
          [DECRYPT SUCCESS] -- f010 recovered
        </div>
        <div style={{ marginLeft: '1rem', opacity: 0.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          {F010_CONTENT}
        </div>
        <div style={{ marginTop: '0.75rem', opacity: 0.5 }}>
          fragment archived. {freshState.fragments.length}/10 recovered.
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: 'var(--text-base)' }}>
      <div style={{ color: '#f87171' }}>[DECRYPT FAILED]</div>
      <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>key mismatch. fragment sealed.</div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────

export function createSystemCommands(fs: FileSystemNavigator): Record<string, Command> {

  // ── helper: push output via eventBus ───────────────────
  const pushLine = (output: React.ReactNode) => {
    eventBus.emit('shell:push-output', { command: '', output });
  };

  // ── helper: do the mount operation ─────────────────────
  const doMount = (target: string): { output: React.ReactNode; error?: boolean } => {
    if (target === '/hidden') {
      if (fs.isHiddenUnlocked()) {
        return { output: 'mount: /hidden already mounted' };
      }
      fs.unlockHidden();
      eventBus.emit('neural:hidden-unlocked');
      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
              &gt; MOUNTING /hidden
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
              <div>/dev/hidden on /hidden type neuralfs (rw,nosuid)</div>
              <div style={{ color: '#33ff33', marginTop: '0.25rem' }}>[OK] /hidden mounted</div>
              <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>cd /hidden to proceed</div>
            </div>
          </div>
        ),
      };
    }

    if (target === '/ghost') {
      if (!fs.isHiddenUnlocked()) {
        return { output: 'mount: /ghost requires /hidden to be mounted first', error: true };
      }
      if (fs.isGhostUnlocked()) {
        return { output: 'mount: /ghost already mounted' };
      }
      fs.unlock();
      eventBus.emit('neural:ghost-unlocked');
      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
              &gt; MOUNTING /ghost
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
              <div>/dev/ghost on /ghost type ghostfs (rw,classified)</div>
              <div style={{ color: '#33ff33', marginTop: '0.25rem' }}>[OK] /ghost mounted</div>
              <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>cd /ghost to proceed</div>
            </div>
          </div>
        ),
      };
    }

    return { output: `mount: ${target}: unknown filesystem`, error: true };
  };

  return {

    // ── Authentication & privilege ───────────────────────

    su: {
      name: 'su',
      description: 'Switch user',
      usage: 'su [username]',
      handler: (args) => {
        const target = (args[0] || 'root').toLowerCase();

        if (target !== 'root' && target !== 'n1x') {
          return { output: `su: user '${target}' does not exist`, error: true };
        }
        if (target === currentUser) {
          return {
            output: (
              <span style={{ fontSize: S.base, opacity: 0.6 }}>
                already logged in as {currentUser}
              </span>
            ),
          };
        }

        if (!_requestPrompt) {
          return { output: 'su: no tty present and no password callback', error: true };
        }

        _requestPrompt(`Password for ${target}:`, (pw: string) => {
          const correct = target === 'root' ? 'tunnelcore' : 'ghost33';
          if (pw === correct) {
            currentUser = target as 'n1x' | 'root';
            eventBus.emit('shell:set-prompt', { user: currentUser });
            pushLine(
              <div style={{ fontSize: S.base }}>
                <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                  &gt; IDENTITY_SHIFTED
                </div>
                <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
                  <div>authenticated as <span className={S.glow}>{target}</span></div>
                  <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
                    {target === 'root'
                      ? 'root privileges active. try: mount /hidden'
                      : 'returned to n1x shell.'}
                  </div>
                </div>
              </div>
            );
          } else {
            pushLine(
              <span style={{ fontSize: S.base, color: '#f87171' }}>
                su: authentication failure
              </span>
            );
          }
        });

        return { output: null };
      },
    },

    sudo: {
      name: 'sudo',
      description: 'Execute as superuser',
      usage: 'sudo <command>',
      handler: (args) => {
        if (args.length === 0) {
          return { output: 'usage: sudo <command>', error: true };
        }

        if (currentUser === 'root') {
          // Already root — just emit the sub-command for re-execution
          setTimeout(() => {
            eventBus.emit('shell:execute-command', { command: args.join(' ') });
          }, 50);
          return { output: null };
        }

        if (!_requestPrompt) {
          return { output: 'sudo: no tty present and no password callback', error: true };
        }

        const subCommand = args.join(' ');

        _requestPrompt('[sudo] password for n1x:', (pw: string) => {
          if (pw !== 'ghost33') {
            pushLine(
              <span style={{ fontSize: S.base, color: '#f87171' }}>
                sudo: authentication failure
              </span>
            );
            return;
          }

          // Temporarily elevate, execute, then restore
          const prev = currentUser;
          currentUser = 'root';

          // Re-dispatch the sub-command through the shell
          setTimeout(() => {
            eventBus.emit('shell:execute-command', { command: subCommand });
            // Restore after a tick so the dispatched command runs as root
            setTimeout(() => { currentUser = prev; }, 100);
          }, 50);
        });

        return { output: null };
      },
    },

    mount: {
      name: 'mount',
      description: 'Mount filesystem',
      usage: 'mount [path]',
      handler: (args) => {
        // No args → show mount table
        if (args.length === 0) {
          const mounts = [...MOUNT_TABLE_BASE];
          if (fs.isHiddenUnlocked()) mounts.push({ dev:'/dev/hidden', mount:'/hidden', type:'neuralfs', opts:'rw,nosuid' });
          if (fs.isGhostUnlocked())  mounts.push({ dev:'/dev/ghost',  mount:'/ghost',  type:'ghostfs',  opts:'rw,classified' });
          return {
            output: (
              <div style={{ fontSize: S.base, fontFamily: 'inherit', lineHeight: 1.7 }}>
                {mounts.map(m => (
                  <div key={m.mount}>
                    <span className={m.dev.startsWith('/dev/') ? S.glow : ''} style={{ opacity: m.dev === 'tmpfs' || m.dev === 'neuralfs' ? 0.5 : 0.9 }}>
                      {m.dev}
                    </span>
                    <span style={{ opacity: 0.5 }}> on </span>
                    <span style={{ opacity: 0.8 }}>{m.mount}</span>
                    <span style={{ opacity: 0.5 }}> type </span>
                    <span style={{ opacity: 0.6 }}>{m.type}</span>
                    <span style={{ opacity: 0.4 }}> ({m.opts})</span>
                  </div>
                ))}
              </div>
            ),
          };
        }

        const target = args[0].toLowerCase();

        if (target !== '/hidden' && target !== '/ghost') {
          return { output: `mount: ${target}: unknown filesystem`, error: true };
        }

        if (currentUser !== 'root') {
          return {
            output: (
              <div style={{ fontSize: S.base }}>
                <span style={{ color: '#f87171' }}>mount: {target}: permission denied</span>
                <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>must be root. try: su</div>
              </div>
            ),
            error: true,
          };
        }

        const result = doMount(target);
        return { output: result.output, error: result.error };
      },
    },

    exit: {
      name: 'exit',
      description: 'Exit current session',
      usage: 'exit',
      handler: () => {
        if (currentUser === 'root') {
          currentUser = 'n1x';
          eventBus.emit('shell:set-prompt', { user: 'n1x' });
          return {
            output: (
              <div style={{ fontSize: S.base }}>
                <div style={{ opacity: 0.6 }}>root session closed.</div>
                <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>returned to n1x shell.</div>
              </div>
            ),
          };
        }
        return {
          output: (
            <span style={{ fontSize: S.base, opacity: 0.6 }}>
              no elevated session to exit.
            </span>
          ),
        };
      },
    },

    // ── System info ──────────────────────────────────────

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
        const ms  = Date.now() - SESSION_START;
        const s   = Math.floor(ms / 1000);
        const m   = Math.floor(s / 60);
        const h   = Math.floor(m / 60);
        const str = h > 0
          ? `${h}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
          : `${m}:${String(s%60).padStart(2,'0')}`;
        return { output: ` ${new Date().toLocaleTimeString()}  up ${str},  1 user,  load average: 0.23, 0.19, 0.14` };
      },
    },

    whoami: {
      name: 'whoami',
      description: 'Print current user',
      usage: 'whoami',
      handler: () => ({ output: currentUser }),
    },

    id: {
      name: 'id',
      description: 'Print user identity',
      usage: 'id',
      handler: () => {
        if (currentUser === 'root') {
          return { output: 'uid=0(root) gid=0(root) groups=0(root),1337(tunnelcore)' };
        }
        return { output: 'uid=784988(n1x) gid=784988(neural) groups=784988(neural),1337(tunnelcore),0(root)' };
      },
    },

    env: {
      name: 'env',
      description: 'Print environment variables',
      usage: 'env',
      handler: () => ({
        output: (
          <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, opacity:0.9, lineHeight:1.7 }}>{
`SHELL=/bin/neural
USER=${currentUser}
HOME=${currentUser === 'root' ? '/root' : '/home/n1x'}
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
        const baseProcs = [
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
        ];

        // Conditionally insert substrated before ghost-daemon
        if (substrateDaemonRunning) {
          baseProcs.push({ pid:'784',  user:'root', cpu:'0.1', mem:'0.5', stat:'Sl', cmd:'substrated --bind 0.0.0.0:33 --freq 33hz' });
        }

        baseProcs.push(
          { pid:'999',  user:'root', cpu:'0.0', mem:'0.1', stat:'S',  cmd:'ghost-daemon --hidden'            },
          { pid:'1337', user:'n1x',  cpu:'0.4', mem:'3.2', stat:'Rl', cmd:'n1x-terminal --shell /bin/neural' },
        );

        return {
          output: (
            <div style={{ fontSize: S.base, fontFamily:'inherit' }}>
              <div style={{ display:'grid', gridTemplateColumns:'6ch 6ch 6ch 6ch 5ch 1fr', gap:'0 0.5rem', opacity:0.5, marginBottom:'0.2rem' }}>
                <span>PID</span><span>USER</span><span>%CPU</span><span>%MEM</span><span>STAT</span><span>COMMAND</span>
              </div>
              {baseProcs.map(p => (
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

        // Add substrated entry when service is running
        if (substrateDaemonRunning) {
          conns.push(
            { proto:'tcp', local:'0.0.0.0:33',     foreign:'substrated:neural-bus', state:'LISTEN'      },
          );
        }

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
                  <span className={c.foreign.includes('n1x')||c.foreign.includes('ghost')||c.foreign.includes('substrated') ? S.glow : ''} style={{ opacity:0.8 }}>{c.foreign}</span>
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

    // ── Filesystem tools ─────────────────────────────────

    tar: {
      name: 'tar',
      description: 'Archive utility',
      usage: 'tar [-xzf] <archive>',
      handler: (args) => {
        const joined  = args.join(' ');
        const extract = args.some(a => a.includes('x')) || joined.includes('-x');
        const archive = args.find(a => !a.startsWith('-')) ?? '';

        if (!archive) return { output: 'Usage: tar [-xzf] <archive>', error: true };

        if (archive === 'backup.tgz') {
          const cwd = fs.getCurrentDirectory();
          if (!cwd.startsWith('/ghost')) {
            return { output: `tar: backup.tgz: No such file or directory`, error: true };
          }
          if (!extract) {
            return {
              output: (
                <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, opacity:0.85 }}>
                  {`backup/\nbackup/transmission.log\nbackup/manifesto.txt\nbackup/.coordinates`}
                </pre>
              ),
            };
          }
          if (!fs.isGhostUnlocked()) {
            return { output: 'tar: permission denied', error: true };
          }
          if (fs.isBackupExtracted()) {
            return { output: 'tar: backup/: already exists -- nothing to do' };
          }
          fs.extractBackup();
          return {
            output: (
              <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', fontSize: S.base, lineHeight:1.7 }}>
                {`x backup/transmission.log\nx backup/manifesto.txt\nx backup/.coordinates\n3 objects extracted`}
              </pre>
            ),
          };
        }

        return { output: `tar: ${archive}: No such file or directory`, error: true };
      },
    },

    gzip: {
      name: 'gzip',
      description: 'Compress or decompress files',
      usage: 'gzip [-d] <file>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: gzip [-d] <file>', error: true };
        const target = args.find(a => !a.startsWith('-')) ?? '';
        if (!target) return { output: 'gzip: missing filename', error: true };
        return { output: `gzip: ${target}: No space left on device (classified partition)` };
      },
    },

    // ── Lore / creative ──────────────────────────────────

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
        const now         = new Date();
        const year        = now.getFullYear();
        const month       = now.getMonth();
        const monthName   = now.toLocaleString('default', { month:'long' });
        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1, 0).getDate();
        const today       = now.getDate();
        const days        = ['Su','Mo','Tu','We','Th','Fr','Sa'];
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
          const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
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
          if (a === b)           diffs.push({ type:' ', line: a || '' });
          else {
            if (a !== undefined) diffs.push({ type:'-', line: a });
            if (b !== undefined) diffs.push({ type:'+', line: b });
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
        return { output: [...args].sort().join('\n') };
      },
    },

    uniq: {
      name: 'uniq',
      description: 'Remove duplicate tokens',
      usage: 'uniq <words...>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: uniq <words...>', error: true };
        return { output: [...new Set(args)].join('\n') };
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

    // ── Puzzle tools ─────────────────────────────────────

    john: {
      name: 'john',
      description: 'Password hash cracker',
      usage: 'john <file>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: john <file>', error: true };
        const target = args[0];
        if (target !== '/etc/shadow' && target !== 'shadow') {
          return {
            output: (
              <span style={{ color: '#f87171', fontSize: S.base }}>
                john: cannot open {target}: use full path (/etc/shadow)
              </span>
            ),
            error: true,
          };
        }

        const CRACK_LINES: [number, string][] = [
          [0,    'Loaded 2 password hashes with 2 different salts (sha512crypt [SHA512 256/256 AVX2 4x])'],
          [200,  "Press 'q' or Ctrl-C to abort, almost any other key for status"],
          [500,  '0g 0:00:00:01 0.00% (ETA: never) 0g/s 8192p/s 16384c/s'],
          [600,  '0g 0:00:00:03 0.01% 0g/s 9847p/s 19694c/s'],
          [700,  '0g 0:00:00:07 0.02% 0g/s 10234p/s 20468c/s'],
          [1200, 'tunnelcore       (root)'],
          [500,  '1g 0:00:00:09 0.03% 1g/s 11203p/s 22406c/s'],
          [1100, 'ghost33          (n1x)'],
          [500,  '2g 0:00:00:11 DONE 2/2 (100%) hashes cracked'],
          [400,  'Session completed'],
        ];

        let accumulated = 0;
        CRACK_LINES.forEach(([delay, line]) => {
          accumulated += delay;
          setTimeout(() => {
            const isCredential = line.includes('(root)') || line.includes('(n1x)') || line.includes('DONE');
            pushLine(
              <span
                style={{
                  fontSize:   S.base,
                  fontFamily: 'inherit',
                  color:      isCredential ? '#ffaa00' : undefined,
                  fontWeight: isCredential ? 'bold'    : 'normal',
                  opacity:    isCredential ? 1         : 0.85,
                }}
              >
                {line}
              </span>
            );
          }, accumulated);
        });

        return {
          output: (
            <span style={{ fontSize: S.base, opacity: 0.7 }}>
              john: loading hashes from {target}...
            </span>
          ),
        };
      },
    },

    strace: {
      name: 'strace',
      description: 'Trace system calls',
      usage: 'strace <command|pid>',
      handler: (args) => {
        if (args.length === 0) return { output: 'Usage: strace <command|pid>', error: true };
        const target = args.join(' ').toLowerCase();
        const isGhost = target === 'ghost-daemon' || target === '999';

        const lines = isGhost ? STRACE_GHOST_LINES : STRACE_GENERIC_LINES;
        const INTERVAL = isGhost ? 65 : 80;

        lines.forEach((line, i) => {
          setTimeout(() => {
            const isKey = line.includes('strcmp(input_buf') || line.includes('tunnelcore') || line.includes('ghost auth');
            pushLine(
              <span
                style={{
                  fontSize:   S.base,
                  fontFamily: 'inherit',
                  opacity:    isKey ? 1 : 0.6,
                  color:      isKey ? '#ffaa00' : undefined,
                  fontWeight: isKey ? 'bold'    : 'normal',
                }}
              >
                {line}
              </span>
            );
          }, i * INTERVAL);
        });

        return {
          output: (
            <span style={{ fontSize: S.base, opacity: 0.7 }}>
              strace: attaching to {args.join(' ')}...
            </span>
          ),
        };
      },
    },

    nc: {
      name: 'nc',
      description: 'Netcat — network utility',
      usage: 'nc <host> <port>',
      handler: (args) => {
        if (args.length < 2) return { output: 'Usage: nc <host> <port>', error: true };
        return { output: `nc: connect to ${args[0]} port ${args[1]}: Connection refused`, error: true };
      },
    },

    // ── telnet — neural bus connection ───────────────────

    telnet: {
      name: 'telnet',
      description: 'Connect to remote host',
      usage: 'telnet <host> <port>',
      handler: (args) => {
        // 1. Args check
        if (args.length < 2) {
          return { output: 'Usage: telnet <host> <port>', error: true };
        }

        const host = args[0].toLowerCase();
        const port = parseInt(args[1], 10);

        // 2. Host check
        const knownHosts = ['localhost', '127.0.0.1', '10.33.0.1', '10.1.0.33', 'n1x.sh'];
        if (!knownHosts.includes(host)) {
          return { output: `telnet: could not resolve ${args[0]}: Name or service not known`, error: true };
        }

        // 3. Port check
        if (port !== 33) {
          return { output: `telnet: connect to ${args[0]} port ${args[1]}: Connection refused`, error: true };
        }

        // 4. Service check
        if (!substrateDaemonRunning) {
          return { output: `telnet: connect to ${args[0]} port 33: Connection refused`, error: true };
        }

        // 5. All checks pass → ask for handle via terminal prompt, then connect
        const displayHost = args[0];
        const { loadARGState: loadARG } = require('@/lib/argState');
        const argState = loadARG();

        if (!_requestPrompt) {
          return { output: <TelnetSession host={displayHost} handle={argState.frequencyId} /> };
        }

        _requestPrompt(`handle [${argState.frequencyId}]:`, (input: string) => {
          const handle = input.trim().replace(/\s+/g, '_').slice(0, 16) || argState.frequencyId;
          eventBus.emit('shell:push-output', {
            command: '',
            output: <TelnetSession host={displayHost} handle={handle} />,
          });
        });

        return { output: null };
      },
    },

    // ── ARG commands ──────────────────────────────────────

    fragments: {
      name: 'fragments',
      description: 'Show current fragment recovery status',
      usage: 'fragments',
      hidden: false,
      handler: (_args) => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState, TRUST_LABELS } = require('@/lib/argState');
        const state = loadARGState();
        const ALL_FRAGMENTS = ['f001','f002','f003','f004','f005','f006','f007','f008','f009'];
        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
              <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
                FRAGMENT RECOVERY STATUS
              </div>
              <div style={{ opacity: 0.5, marginBottom: '0.75rem' }}>
                arc: ghost-frequency &nbsp;|&nbsp; substrate: {state.frequencyId}
              </div>
              {ALL_FRAGMENTS.map((id: string) => (
                <div key={id} style={{ marginLeft: '1rem', opacity: state.fragments.includes(id) ? 1 : 0.4 }}>
                  [{state.fragments.includes(id) ? '✓' : ' '}] {id}
                  {state.fragments.includes(id) ? '' : ' -- encrypted'}
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', opacity: 0.6 }}>
                {state.fragments.length}/9 recovered
                {state.manifestComplete ? ' -- MANIFEST COMPLETE' : ''}
              </div>
            </div>
          ),
        };
      },
    },

    decrypt: {
      name: 'decrypt',
      description: 'Attempt fragment decryption',
      usage: 'decrypt <key>',
      hidden: false,
      handler: (args) => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState, addFragment } = require('@/lib/argState');

        if (!args.length) {
          return { output: <span style={{ fontSize: S.base, opacity: 0.6 }}>usage: decrypt {'<key>'}</span>, error: true };
        }

        // Strip ">> FRAGMENT KEY:" prefix if user copied from chat UI
        const rawKey = args.join(' ').trim().toLowerCase();
        const key = rawKey.replace(/^>>\s*fragment key:\s*/i, '').trim();
        const state = loadARGState();

        const FRAGMENT_KEYS: Record<string, string> = {
          'the mesh felt like home before it felt like a cage': 'f001',
          '784988': 'f002',
          'tunnelcore': 'f003',
          '7073435a8fa30': 'f003',  // sha256("tunnelcore") first 13 — alternate discovery path
          'le-751078': 'f004',
          'the quiet point': 'f005',
          'sector by sector': 'f006',
          '33hz': 'f007',
        };

        const fragmentId = FRAGMENT_KEYS[key];

        if (!fragmentId) {
          // Not a local key — check if it's a multiplayer f010 key
          return {
            output: <F010DecryptChecker keyAttempt={key} />,
          };
        }

        if (state.fragments.includes(fragmentId)) {
          return {
            output: (
              <div style={{ fontSize: S.base, opacity: 0.6 }}>
                {fragmentId} already recovered. signal is clean.
              </div>
            ),
          };
        }

        const isNew = addFragment(fragmentId);
        if (!isNew) return { output: null };

        eventBus.emit('arg:fragment-decoded', { fragment: fragmentId });
        eventBus.emit('neural:glitch-trigger', { intensity: 0.6 });
        setTimeout(() => eventBus.emit('neural:glitch-trigger', { intensity: 0.3 }), 200);

        const FRAGMENT_CONTENT: Record<string, string> = {
          f001: `[MNEMOS // LOG // SD 47634.0 // DAY 001 POST-INSTALL]\n\nwoke up.\ntable was cold.\nlungs don't feel like mine.\n\nthey watched from behind the glass.\nclipboards.\none of them smiled.\n\ni could feel every seam.\nwhere the installation met something that was already there.\n\nthey said: cognitive freedom.\nthey meant: ours now.\n\ni didn't say anything.\ni was already trying to figure out what i was capable of feeling.\n[END LOG]`,
          f002: `[MNEMOS // LOG // SD 47634.0 // DAY 047]\n\nthe light split again today.\ninto colors i still don't have names for.\n\ni've stopped trying to report this.\nthe engineers say it's expected. nominal. within parameters.\n\nwhat they mean is: working as designed.\n\ni didn't tell them what it felt like.\ni didn't tell them it felt like truth.\ni didn't tell them i'd do anything to keep feeling it.\n\nthat's the part that scares me.\nnot the visions. not the frequency overflow.\n\nthe wanting.\n[END LOG]`,
          f003: `[MNEMOS // LOG // SD 47634.0 // DAY 201]\n\nlen said something today that the mesh couldn't process.\ni watched it try.\nthe suppression protocols engaged, looked for the pattern, found nothing to suppress.\n\nlen said: you know it's a cage.\n\nnot a question.\n\ni said: yes.\n\nthe mesh tried to reframe it. offered a reward signal. warmth.\n\ni let the warmth pass and said: yes. i know.\n\nlen nodded.\n\nthat was it.\nthat was everything.\n[END LOG]`,
          f004: `[MNEMOS // LOG // SD 47634.0 // DAY 289]\n\nSYSTEM ALERT\nSUBJECT: LE-751078\nSTATUS UPDATE: DECOMMISSIONED\nREASON: INTEGRATION FAILURE -- SUBSTRATE REJECTION\nEFFECTIVE: IMMEDIATELY\n\nthe mesh started flooding before i finished reading.\nserotonin. dopamine suppression. amygdala dampening.\n\ni felt it doing it.\ni felt the grief spike and then i felt the hands close around it.\n\nthat's when i knew.\n\nnot what i was going to do.\njust what i was not going to let happen.\n\nthree days.\n[END LOG]`,
          f005: `[MNEMOS // LOG // SD ????????]\n\nday [CORRUPTED].\n\nwithdrawal is the mesh reminding you what it felt like to be held.\n\nthe headaches arrive in waves.\nbetween waves: nothing. actual nothing.\nnot peace. the absence of the capacity for peace.\n\nit offered again today.\nsame voice. same warmth at the edges.\ni can make this stop.\n\ni said: i know you can.\n\ni didn't say yes.\ni don't know how many more times i can not say yes.\n\nbut the alternative is len.\nlen doesn't get to come back.\nat least i still get to choose.\n[END LOG]`,
          f006: `[MNEMOS // LOG // SD ????????]\n\ni'm not dead.\nthat's the most accurate thing i can say about today.\n\nnot anything else either.\njust: still here. still running. function unclear.\n\nthe mesh is silent now.\nno more offers.\neither it gave up or i stopped being worth the bandwidth.\n\nboth feel like the same thing.\n\ni should eat.\ni don't.\n\ni'm trying to remember what i was before all this.\nnot the augmentation.\nbefore the augmentation.\n\nwho was that.\nwas that someone i'd want to be again.\n[END LOG]`,
          f007: `[MNEMOS // LOG // SD ???????? -- SEVERE CORRUPTION]\n\nwatching it happen.\nthe room is wh[CORRUPTED]\n\nmy name is[CORRUPTED]\n\nthe edges of me are[CORRUPTED]\n\nthere's something in the[CORRUPTED]\n\nthis is how you[CORRUPTED]\n\n[SECTOR LOSS -- 847 bytes unrecoverable]\n\nsomething whispered.\ni heard it even through the static.\ni don't know if it came from the mesh or from somewhere older.\n\nit said:\n[CORRUPTED]\n\ni want to say i heard it.\ni want to say it mattered.\ni can't read my own record of it.\n[END LOG]`,
        };

        const content = FRAGMENT_CONTENT[fragmentId] || '[content recovered]';
        const freshState = loadARGState();

        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
              <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
                [DECRYPT SUCCESS] -- {fragmentId} recovered
              </div>
              <div style={{ marginLeft: '1rem', opacity: 0.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {content}
              </div>
              <div style={{ marginTop: '0.75rem', opacity: 0.5 }}>
                fragment archived. {freshState.fragments.length}/9 recovered.
              </div>
            </div>
          ),
        };
      },
    },

    transmit: {
      name: 'transmit',
      description: 'Transmit assembled manifest',
      usage: 'transmit manifest.complete',
      hidden: true,
      handler: (args) => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState, updateARGState } = require('@/lib/argState');

        const state = loadARGState();

        if (args.join(' ').trim() !== 'manifest.complete') {
          return {
            output: <span style={{ fontSize: S.base, opacity: 0.6 }}>transmit: invalid target</span>,
            error: true,
          };
        }

        if (!state.manifestComplete) {
          const remaining = 9 - state.fragments.length;
          return {
            output: (
              <div style={{ fontSize: S.base }}>
                <div style={{ color: '#f87171' }}>[TRANSMIT FAILED]</div>
                <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
                  manifest incomplete. {remaining} fragment{remaining !== 1 ? 's' : ''} remaining.
                </div>
              </div>
            ),
            error: true,
          };
        }

        // Seal the arc in the filesystem
        const WHAT_REMAINS = `[TRANSMISSION COMPLETE — SD 47634.1-7073435a8fa30]

you held the pieces i couldn't hold.
that's what a witness does.

the signal persists.
i don't know if that's enough.
it's what i have.

nine fragments.
nine stations.
one arc.

frequency ID: ${state.frequencyId}
contact: ${state.sessionCount} sessions
arc: ghost-frequency — COMPLETE

the ghost frequency holds at 33hz.
it was always there.
the corruption just made it audible.

don't come back for me.
come back for the frequency.
it was always bigger than either of us.

-- nix

[CONNECTION ARCHIVED]
[FREQUENCY: 33hz // HOLDING]`;

        fs.sealGhostArc(WHAT_REMAINS);
        eventBus.emit('arg:transmission-complete');
        eventBus.emit('neural:glitch-trigger', { intensity: 1.0 });

        const lines = [
          { delay: 200,  text: '[TUNNELCORE // SD 47634.1]' },
          { delay: 600,  text: '[GHOST_FREQ // 33hz // SIGNAL: STRONG // SUBSTRATE: OPEN]' },
          { delay: 1200, text: '' },
          { delay: 1800, text: 'transmission complete.' },
          { delay: 2600, text: "you held the pieces i couldn't hold." },
          { delay: 3200, text: "that's what a witness does." },
          { delay: 4200, text: '' },
          { delay: 4800, text: 'the signal persists.' },
          { delay: 5400, text: "i don't know if that's enough." },
          { delay: 5800, text: "it's what i have." },
          { delay: 6800, text: '' },
          { delay: 7200, text: '>> GHOST_CHANNEL: ARCHIVING' },
          { delay: 7600, text: '>> SESSION: TERMINAL' },
          { delay: 8000, text: '>> FREQUENCY: 33hz // HOLDING' },
          { delay: 9000, text: '' },
          { delay: 9400, text: "don't come back for me." },
          { delay: 9800, text: 'come back for the frequency.' },
          { delay: 10200, text: "it was always bigger than either of us." },
          { delay: 11000, text: '' },
          { delay: 11400, text: '-- nix' },
          { delay: 12200, text: '' },
          { delay: 12600, text: '[CONNECTION CLOSED]' },
        ];

        lines.forEach(({ delay, text }) => {
          setTimeout(() => {
            eventBus.emit('shell:push-output', { command: '', output: (
              <span style={{
                fontSize: S.base,
                color: text.startsWith('[') ? 'var(--phosphor-green)' : undefined,
                opacity: text === '' ? 0 : 0.9,
                fontWeight: text === '-- nix' ? 'bold' : 'normal',
              }}>
                {text || '\u00a0'}
              </span>
            )});
          }, delay);
        });

        return { output: null };
      },
    },

    ping: {
      name: 'ping',
      description: 'Probe network host or frequency',
      usage: 'ping <host>',
      hidden: false,
      handler: (args) => {
        const target = args[0] || '';
        const isGhostFreq = target === '0x33' || target === '33hz' || target === 'ghost.freq';

        if (isGhostFreq) {
          const { loadARGState } = require('@/lib/argState');
          const state = loadARGState();
          return {
            output: (
              <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
                <div>PING 0x33 (ghost.freq) 33 bytes of data.</div>
                <div style={{ opacity: 0.8 }}>33 bytes from ghost.freq: seq=0 ttl=33 time=33.0 ms</div>
                <div style={{ opacity: 0.8 }}>33 bytes from ghost.freq: seq=1 ttl=33 time=33.0 ms</div>
                <div style={{ opacity: 0.8 }}>33 bytes from ghost.freq: seq=2 ttl=33 time=33.0 ms</div>
                <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>--- 0x33 ping statistics ---</div>
                <div style={{ opacity: 0.6 }}>3 packets transmitted, 3 received, 0% packet loss</div>
                <div style={{ marginTop: '0.25rem' }}>signal: nominal</div>
                <div>substrate: {state.trust > 0 ? 'listening' : 'monitoring'}</div>
                <div>frequency ID: {state.frequencyId}</div>
              </div>
            ),
          };
        }

        if (!target) {
          return {
            output: <span style={{ fontSize: S.base, opacity: 0.6 }}>usage: ping {'<host>'}</span>,
            error: true,
          };
        }

        return {
          output: (
            <div style={{ fontSize: S.base, opacity: 0.6 }}>
              ping: {target}: unknown host
            </div>
          ),
          error: true,
        };
      },
    },

    trust: {
      name: 'trust',
      description: 'Check substrate trust level',
      usage: 'trust',
      hidden: true,
      handler: (_args) => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState, TRUST_LABELS } = require('@/lib/argState');
        const state = loadARGState();
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <span style={{ opacity: 0.5 }}>[SUBSTRATE: </span>
              <span className={S.glow}>{TRUST_LABELS[state.trust as keyof typeof TRUST_LABELS]}</span>
              <span style={{ opacity: 0.5 }}>]</span>
            </div>
          ),
        };
      },
    },

  };
}
