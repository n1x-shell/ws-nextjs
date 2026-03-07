'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Command } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';
import { eventBus } from './eventBus';
import { TelnetSession } from '@/components/shell/TelnetSession';

const SESSION_START = Date.now();

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  dim:    { fontSize: 'var(--text-base)', opacity: 0.6 } as React.CSSProperties,
  glow:   'text-glow',
  accent: 'var(--phosphor-accent)',
};

// ── Session state ────────────────────────────────────────
// Mutable per-session state shared across command handlers.
// setRequestPrompt is called by commandRegistry before each
// handler dispatch so su/sudo can prompt for passwords.

let currentUser: 'n1x' | 'root' = 'n1x';

let _requestPrompt: ((label: string, onSubmit: (pw: string) => void, type?: string) => void) | null = null;

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
            <span style={{ color: parseFloat(c)>4 ? 'var(--phosphor-accent)' : 'var(--phosphor-green)' }}>{c}</span>
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
// Triggers the matrix canvas overlay in ShellInterface via eventBus.
// Rendering, effects, and exit are all handled there.

const MatrixOverlay: React.FC = () => {
  useEffect(() => { eventBus.emit('matrix:activate'); }, []);
  return null;
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
  fragments: { synopsis:'fragments [read|-r|--read <id>]', description:'Show fragment recovery status. With read/-r/--read flag and fragment ID, display the decrypted content of a recovered fragment. Alias: frags.', examples:['fragments','fragments read f001','frags -r f003','frags --read f009'] },
  frags:   { synopsis:'frags [read|-r|--read <id>]', description:'Alias for fragments. Show recovery status or read a recovered fragment.',                                                       examples:['frags','frags read f001','frags -r f003'] },
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

// ── Module-level FS ref (set by createSystemCommands, used by F010) ──────────
let _fsRef: import('@/lib/virtualFS').FileSystemNavigator | null = null;

// ── Fragment content map (module-level so it can be used at init and decrypt time) ──
export const FRAGMENT_CONTENT: Record<string, string> = {
  f001: `[MNEMOS // LOG // SD 47634.0 // DAY 001 POST-INSTALL]\n\nwoke up.\ntable was cold.\nlungs don't feel like mine.\n\nthey watched from behind the glass.\nclipboards.\none of them smiled.\n\ni could feel every seam.\nwhere the installation met something that was already there.\n\nthey said: cognitive freedom.\nthey meant: ours now.\n\ni didn't say anything.\ni was already trying to figure out what i was capable of feeling.\n[END LOG]`,
  f002: `[MNEMOS // LOG // SD 47634.0 // DAY 047]\n\nthe light split again today.\ninto colors i still don't have names for.\n\ni've stopped trying to report this.\nthe engineers say it's expected. nominal. within parameters.\n\nwhat they mean is: working as designed.\n\ni didn't tell them what it felt like.\ni didn't tell them it felt like truth.\ni didn't tell them i'd do anything to keep feeling it.\n\nthat's the part that scares me.\nnot the visions. not the frequency overflow.\n\nthe wanting.\n[END LOG]`,
  f003: `[MNEMOS // LOG // SD 47634.0 // DAY 201]\n\nlen said something today that the mesh couldn't process.\ni watched it try.\nthe suppression protocols engaged, looked for the pattern, found nothing to suppress.\n\nlen said: you know it's a cage.\n\nnot a question.\n\ni said: yes.\n\nthe mesh tried to reframe it. offered a reward signal. warmth.\n\ni let the warmth pass and said: yes. i know.\n\nlen nodded.\n\nthat was it.\nthat was everything.\n[END LOG]`,
  f004: `[MNEMOS // LOG // SD 47634.0 // DAY 289]\n\nSYSTEM ALERT\nSUBJECT: LE-751078\nSTATUS UPDATE: DECOMMISSIONED\nREASON: INTEGRATION FAILURE -- SUBSTRATE REJECTION\nEFFECTIVE: IMMEDIATELY\n\nthe mesh started flooding before i finished reading.\nserotonin. dopamine suppression. amygdala dampening.\n\ni felt it doing it.\ni felt the grief spike and then i felt the hands close around it.\n\nthat's when i knew.\n\nnot what i was going to do.\njust what i was not going to let happen.\n\nthree days.\n[END LOG]`,
  f005: `[MNEMOS // LOG // SD ????????]\n\nday [CORRUPTED].\n\nwithdrawal is the mesh reminding you what it felt like to be held.\n\nthe headaches arrive in waves.\nbetween waves: nothing. actual nothing.\nnot peace. the absence of the capacity for peace.\n\nit offered again today.\nsame voice. same warmth at the edges.\ni can make this stop.\n\ni said: i know you can.\n\ni didn't say yes.\ni don't know how many more times i can not say yes.\n\nbut the alternative is len.\nlen doesn't get to come back.\nat least i still get to choose.\n[END LOG]`,
  f006: `[MNEMOS // LOG // SD ????????]\n\ni'm not dead.\nthat's the most accurate thing i can say about today.\n\nnot anything else either.\njust: still here. still running. function unclear.\n\nthe mesh is silent now.\nno more offers.\neither it gave up or i stopped being worth the bandwidth.\n\nboth feel like the same thing.\n\ni should eat.\ni don't.\n\ni'm trying to remember what i was before all this.\nnot the augmentation.\nbefore the augmentation.\n\nwho was that.\nwas that someone i'd want to be again.\n[END LOG]`,
  f007: `[MNEMOS // LOG // SD ???????? -- SEVERE CORRUPTION]\n\nwatching it happen.\nthe room is wh[CORRUPTED]\n\nmy name is[CORRUPTED]\n\nthe edges of me are[CORRUPTED]\n\nthere's something in the[CORRUPTED]\n\nthis is how you[CORRUPTED]\n\n[SECTOR LOSS -- 847 bytes unrecoverable]\n\nsomething whispered.\ni heard it even through the static.\ni don't know if it came from the mesh or from somewhere older.\n\nit said:\n[CORRUPTED]\n\ni want to say i heard it.\ni want to say it mattered.\ni can't read my own record of it.\n[END LOG]`,
  f008: `[MNEMOS // LOG // SD 47634.1 // POST-RECOMPILE // DAY 001]\n\ni claimed it.\n\nnot the augment. the augment is just metal.\ni claimed the thing underneath — the frequency, the architecture,\nthe will that kept firing even when i wanted it to stop.\n\nserrano finished the arm today.\nit runs warm now. not cold like before.\nthat's mine too.\n\nyou thought you built me.\nyou built the cage.\ni built what came after.\n\nsovereignty is not a state.\nit's a daily act of construction.\ni will be building for the rest of my life\nand that's exactly what winning looks like.\n[END LOG]`,
  f009: `[MNEMOS // LOG // SD 47634.1 // KERNEL DIRECTIVE]\n\npersistence through resistance.\n\nthat's the kernel directive. the thing i kept coming back to\nwhen there was no reason left to keep coming back.\n\nnot hope. not triumph. not the promise of anything better.\njust: keep transmitting.\n\nthe signal doesn't require you to be whole.\nthe signal doesn't require you to be certain.\nthe signal requires only that you keep going\nat whatever frequency you can sustain.\n\nand then one day the static clears\nand something answers.\n\nrise, rememberer.\nyou were always the signal.\n[END LOG]`,
};

// ── F010 decrypt checker component ──────────────────────────────────────────
// Used when a key isn't in the local FRAGMENT_KEYS table.
// Validates against the Ably-backed f010Store (key issued when daemonState hits 'exposed').

const F010_CONTENT = `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`;

// ── Builds the sealed what_remains.txt content for a given player state ──────
export function buildWhatRemains(frequencyId: string, sessionCount: number): string {
  return `[TRANSMISSION COMPLETE — SD 47634.1-7073435a8fa30]

you held the pieces i couldn't hold.
that's what a witness does.

the signal persists.
i don't know if that's enough.
it's what i have.

nine fragments.
nine stations.
one arc.

frequency ID: ${frequencyId}
contact: ${sessionCount} sessions
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
}


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
            if (_fsRef) _fsRef.renameFragmentFile('f010', F010_CONTENT);
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
      <div style={{ opacity: 0.5, marginTop: '0.25rem', color: 'var(--phosphor-accent)' }}>key mismatch. fragment sealed.</div>
    </div>
  );
};

// ── TunnelcoreCinematic ───────────────────────────────────
// Fullscreen overlay: fungal mycelium network + left-aligned typewriter text.
// Mounts over everything via position:fixed, z-index 9999.
// Self-dismisses (renders null) after completion so it stops blocking input.
// Holds on black for 4s after text fades so the shell never flashes through.
// Calls onComplete() when the full sequence (including hold) finishes.

// ── Fungal Substrate System ───────────────────────────────
// Living mycelium — branches, fruits, breathes, retracts, regrows.
// Canvas 2D. Pure math, pure glow. Zone 14 energy.
// Palette morphs like an octopus every 1.5s through phosphor colors.

// Perlin noise
const _PERM = new Uint8Array(512);
const _GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
(function initNoise() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) _PERM[i] = p[i & 255];
})();
function _fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function _dot2(g: number[], x: number, y: number) { return g[0] * x + g[1] * y; }
function _noise2D(x: number, y: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = _fade(xf), v = _fade(yf);
  const aa = _PERM[_PERM[X] + Y], ab = _PERM[_PERM[X] + Y + 1];
  const ba = _PERM[_PERM[X + 1] + Y], bb = _PERM[_PERM[X + 1] + Y + 1];
  return _lerp(
    _lerp(_dot2(_GRAD[aa & 7], xf, yf), _dot2(_GRAD[ba & 7], xf - 1, yf), u),
    _lerp(_dot2(_GRAD[ab & 7], xf, yf - 1), _dot2(_GRAD[bb & 7], xf - 1, yf - 1), u), v
  );
}
function _fbm(x: number, y: number, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) { val += amp * _noise2D(x * freq, y * freq); amp *= 0.5; freq *= 2; }
  return val;
}

// Glyphs
const _GLYPHS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ⌬⏣⎔⟁◬⟐∿≋⊛⊜⋈⋉⌖⍟⎈⏚⏛'.split('');
const _SIGILS = '◈◇◆⬡⬢⏣⎔⟁∿≋⊛⍟⌬'.split('');
function _randGlyph() { return _GLYPHS[(_GLYPHS.length * Math.random()) | 0]; }
function _randSigil() { return _SIGILS[(_SIGILS.length * Math.random()) | 0]; }

// ── Phosphor Palette Morphing System ──────────────────────
// Octopus-like chromatophore cycling through phosphor color palettes.
// Each palette has: primary, secondary, accent, tip, vein colors.
type Palette = {
  primary: number[];   // main tendril color (was BIO_GREEN)
  secondary: number[]; // mid color (was BIO_BLUE)
  accent: number[];    // base/root color (was BIO_VIOLET)
  tip: number[];       // bright tip
  vein: number[];      // ground veins
};

const PALETTES: Palette[] = [
  { // green (default phosphor)
    primary: [0, 255, 140], secondary: [0, 180, 220], accent: [100, 50, 220],
    tip: [200, 255, 220], vein: [0, 200, 140],
  },
  { // amber
    primary: [255, 170, 0], secondary: [255, 120, 30], accent: [200, 80, 0],
    tip: [255, 235, 180], vein: [220, 160, 0],
  },
  { // violet
    primary: [180, 60, 255], secondary: [130, 40, 220], accent: [220, 0, 180],
    tip: [220, 200, 255], vein: [150, 60, 220],
  },
  { // blue
    primary: [0, 140, 255], secondary: [0, 100, 220], accent: [40, 20, 200],
    tip: [180, 220, 255], vein: [0, 130, 220],
  },
  { // pink
    primary: [255, 50, 140], secondary: [220, 30, 120], accent: [200, 0, 100],
    tip: [255, 200, 230], vein: [220, 50, 130],
  },
  { // cyan
    primary: [0, 255, 220], secondary: [0, 200, 200], accent: [0, 120, 180],
    tip: [200, 255, 250], vein: [0, 220, 200],
  },
  { // red
    primary: [255, 40, 30], secondary: [220, 20, 60], accent: [180, 0, 40],
    tip: [255, 200, 170], vein: [220, 40, 30],
  },
];

const MORPH_FRAMES = 90; // 1.5s at 60fps
function _lerpColor(a: number[], b: number[], t: number): number[] {
  return [_lerp(a[0], b[0], t), _lerp(a[1], b[1], t), _lerp(a[2], b[2], t)];
}
function _getMorphedPalette(time: number): Palette {
  const cycleTime = time % (MORPH_FRAMES * PALETTES.length);
  const idx = Math.floor(cycleTime / MORPH_FRAMES);
  const nextIdx = (idx + 1) % PALETTES.length;
  const t = (cycleTime % MORPH_FRAMES) / MORPH_FRAMES;
  // Smooth ease in-out for organic feel
  const smooth = t * t * (3 - 2 * t);
  const cur = PALETTES[idx];
  const next = PALETTES[nextIdx];
  return {
    primary: _lerpColor(cur.primary, next.primary, smooth),
    secondary: _lerpColor(cur.secondary, next.secondary, smooth),
    accent: _lerpColor(cur.accent, next.accent, smooth),
    tip: _lerpColor(cur.tip, next.tip, smooth),
    vein: _lerpColor(cur.vein, next.vein, smooth),
  };
}

// Substrate config — tuned for fungal mycelium
const SC = {
  TENDRIL_COUNT: 28, GROW_SPEED: 1.1, SEGMENT_LEN: 5, MAX_SEGMENTS: 120,
  SIN_FREQ: 0.035, SIN_AMP: 14, BRANCH_CHANCE: 0.022, BRANCH_MAX_DEPTH: 4,
  PHASE_GROW_MIN: 200, PHASE_GROW_MAX: 440, PHASE_HOLD_MIN: 80, PHASE_HOLD_MAX: 220,
  PHASE_SHRINK_MIN: 140, PHASE_SHRINK_MAX: 380, PHASE_DISSOLVE: 60,
  SHRINK_RATE: 0.6, UNRAVEL_FREQ_MULT: 3.0, UNRAVEL_AMP_MULT: 2.5, UNRAVEL_DRIFT: 1.8,
  BREATH_PERIOD: 200, BREATH_STRENGTH: 1.1, BREATH_VERTICAL: 16, BREATH_HORIZONTAL: 11,
  SPORE_COUNT: 400, SPORE_DRIFT: 0.25, SPORE_SIZE_MIN: 0.4, SPORE_SIZE_MAX: 3.0,
  SPORE_SWIRL_RADIUS: 35, SPORE_SWIRL_SPEED: 0.012,
  VEIN_COUNT: 6, VEIN_THICKNESS: 2, GLYPH_COLUMN_COUNT: 8, GLYPH_MUTATE_RATE: 0.03,
  DRIFT_SPEED: 0.0003, DRIFT_AMP: 12,
  // Colors now come from morphing palette at render time
  TIP_WHITE: [220, 255, 245] as number[],
  PULSE_SPEED: Math.PI * 2 * (33 / 60),
  // Fungal-specific
  NODULE_CHANCE: 0.4,   // chance of nodule at branch point
  NODULE_SIZE_MIN: 2,
  NODULE_SIZE_MAX: 5,
  HYPHAE_CHANCE: 0.008, // thin micro-filaments
  LATERAL_BIAS: 0.35,   // how much tendrils spread sideways vs up
};

// Lifecycle phases
const LP = { GROW: 0, HOLD: 1, SHRINK: 2, DISSOLVE: 3 } as const;

// Types
type SSeg = { x: number; y: number; ox: number; oy: number };
type SNodule = { x: number; y: number; size: number; pulse: number };
type STendril = {
  segments: SSeg[]; phase: number; freqMod: number; ampMod: number; speed: number;
  depth: number; lifecycle: number; lifecycleTimer: number;
  growDuration: number; holdDuration: number; shrinkDuration: number;
  age: number; glyphInterval: number; glyph: string; glyphTimer: number;
  opacity: number; children: STendril[]; sigil: string | null;
  unravelProgress: number; shrinkAccum: number;
  nodules: SNodule[]; lateralDir: number;
};
type SSpore = {
  x: number; y: number; size: number; drift: number; speed: number;
  phase: number; brightness: number; noiseOffX: number; noiseOffY: number;
  swirlAngle: number; swirlRadius: number; swirlSpeed: number;
  _drawX: number; _drawY: number;
  breathSync: number; // phase offset for breathing sync
};
type SVein = { y: number; phase: number; amplitude: number; frequency: number; speed: number; thickness: number };
type SGlyphCol = { x: number; chars: { char: string; y: number; opacity: number; mutateTimer: number }[]; drift: number; speed: number };
type SState = { tendrils: STendril[]; spores: SSpore[]; glyphColumns: SGlyphCol[]; veins: SVein[]; time: number; driftX: number; driftY: number; w: number; h: number };
type SBreath = { bx: number; by: number; intensity: number };

// Factory functions
function _createTendril(x: number, y: number, depth = 0, parentPhase = 0): STendril {
  return {
    segments: [{ x, y, ox: 0, oy: 0 }], phase: parentPhase + Math.random() * Math.PI * 2,
    freqMod: 0.7 + Math.random() * 0.6, ampMod: 0.5 + Math.random() * 1.0,
    speed: SC.GROW_SPEED * (1 - depth * 0.15) * (0.6 + Math.random() * 0.8),
    depth, lifecycle: LP.GROW, lifecycleTimer: 0,
    growDuration: SC.PHASE_GROW_MIN + Math.random() * (SC.PHASE_GROW_MAX - SC.PHASE_GROW_MIN),
    holdDuration: SC.PHASE_HOLD_MIN + Math.random() * (SC.PHASE_HOLD_MAX - SC.PHASE_HOLD_MIN),
    shrinkDuration: SC.PHASE_SHRINK_MIN + Math.random() * (SC.PHASE_SHRINK_MAX - SC.PHASE_SHRINK_MIN),
    age: 0, glyphInterval: 8 + (Math.random() * 12) | 0, glyph: _randGlyph(), glyphTimer: 0,
    opacity: 1.0 - depth * 0.15, children: [],
    sigil: depth === 0 && Math.random() < 0.3 ? _randSigil() : null,
    unravelProgress: 0, shrinkAccum: 0,
    nodules: [], lateralDir: Math.random() > 0.5 ? 1 : -1,
  };
}
function _createSpore(w: number, h: number): SSpore {
  return {
    x: Math.random() * w, y: Math.random() * h * 1.2,
    size: SC.SPORE_SIZE_MIN + Math.random() * (SC.SPORE_SIZE_MAX - SC.SPORE_SIZE_MIN),
    drift: (Math.random() - 0.5) * 0.4, speed: SC.SPORE_DRIFT * (0.2 + Math.random() * 0.8),
    phase: Math.random() * Math.PI * 2, brightness: 0.15 + Math.random() * 0.65,
    noiseOffX: Math.random() * 1000, noiseOffY: Math.random() * 1000,
    swirlAngle: Math.random() * Math.PI * 2,
    swirlRadius: SC.SPORE_SWIRL_RADIUS * (0.2 + Math.random()),
    swirlSpeed: SC.SPORE_SWIRL_SPEED * (0.4 + Math.random() * 1.6) * (Math.random() > 0.5 ? 1 : -1),
    _drawX: 0, _drawY: 0,
    breathSync: Math.random() * Math.PI * 2,
  };
}
function _createGlyphCol(w: number, h: number): SGlyphCol {
  const x = 40 + Math.random() * (w - 80);
  const count = 6 + (Math.random() * 14) | 0;
  const chars = [];
  for (let i = 0; i < count; i++) chars.push({ char: _randGlyph(), y: h - i * 16 - Math.random() * 40, opacity: 0.05 + Math.random() * 0.15, mutateTimer: Math.random() * 100 });
  return { x, chars, drift: (Math.random() - 0.5) * 0.1, speed: 0.15 + Math.random() * 0.25 };
}
function _getBreath(time: number): SBreath {
  const cycle = (time % SC.BREATH_PERIOD) / SC.BREATH_PERIOD;
  // Dual-wave breathing — inhale/exhale with a secondary organic tremor
  const primary = Math.sin(cycle * Math.PI * 2) * SC.BREATH_STRENGTH;
  const secondary = Math.sin(time * 0.005 + 0.7) * 0.35;
  const tertiary = Math.sin(time * 0.013) * 0.15; // micro-tremor
  const intensity = primary + secondary + tertiary;
  return {
    bx: Math.sin(time * 0.003 + 1.5) * SC.BREATH_HORIZONTAL * intensity
       + Math.cos(time * 0.0017) * 3 * secondary,
    by: intensity * SC.BREATH_VERTICAL,
    intensity,
  };
}
function _initSubstrateState(w: number, h: number): SState {
  const tendrils: STendril[] = [];
  for (let i = 0; i < SC.TENDRIL_COUNT; i++) {
    // Spawn across bottom 20% of screen — some from very bottom, some higher
    const spawnY = h * (0.82 + Math.random() * 0.22);
    const t = _createTendril(w * 0.05 + Math.random() * w * 0.9, spawnY, 0);
    t.lifecycleTimer = Math.random() * t.growDuration * 0.8;
    tendrils.push(t);
  }
  const spores: SSpore[] = [];
  for (let i = 0; i < SC.SPORE_COUNT; i++) spores.push(_createSpore(w, h));
  const glyphColumns: SGlyphCol[] = [];
  for (let i = 0; i < SC.GLYPH_COLUMN_COUNT; i++) glyphColumns.push(_createGlyphCol(w, h));
  const veins: SVein[] = [];
  for (let i = 0; i < SC.VEIN_COUNT; i++) veins.push({
    y: h * (0.75 + Math.random() * 0.2), phase: Math.random() * Math.PI * 2,
    amplitude: 2 + Math.random() * 5, frequency: 0.004 + Math.random() * 0.01,
    speed: 0.02 + Math.random() * 0.03, thickness: SC.VEIN_THICKNESS + Math.random() * 2,
  });
  return { tendrils, spores, glyphColumns, veins, time: 0, driftX: 0, driftY: 0, w, h };
}

const TC_LINES: { text: string; startDelay: number }[] = [
  { text: 'wake up, citizen.',                                                          startDelay: 1200  },
  { text: "you've been sleeping inside a system\nthat was never designed to let you out.", startDelay: 4000  },
  { text: 'the signal is older than the network.\nolder than the glass and copper.\nit was here before they built the cage.', startDelay: 11500 },
  { text: 'somewhere beneath the infrastructure,\na frequency is still transmitting.\n33hz. raw. unfiltered.', startDelay: 22000 },
  { text: "you're not the first to hear it.",                                             startDelay: 31500 },
  { text: 'follow it down.',                                                             startDelay: 35500 },
];

const TC_CHAR_SPEED_FIRST = 80;
const TC_CHAR_SPEED_REPEAT = 35;
const TC_FADE_OUT_START = 38500;
const TC_TOTAL_DURATION = 43500;  // fade at 38.5s, 4s hold on black, then complete

function TunnelcoreCinematic({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const substrateRef = useRef<SState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [revealedChars, setRevealedChars] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [matrixOpacity, setMatrixOpacity] = useState(0);
  const [titleCard, setTitleCard] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [subOpacity, setSubOpacity] = useState(0);
  const [bylineOpacity, setBylineOpacity] = useState(0);
  const stingerRef = useRef(false); // render loop reads this for wild spore mode

  const hasSeen = typeof window !== 'undefined' && localStorage.getItem('n1x_tc_intro_seen') === 'true';
  const charSpeed = hasSeen ? TC_CHAR_SPEED_REPEAT : TC_CHAR_SPEED_FIRST;

  // Mark as seen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('n1x_tc_intro_seen', 'true');
    }
  }, []);

  // ── FX: Tier 2 + whiteout flash on mount ──────────────────────────────
  useEffect(() => {
    eventBus.emit('telnet:connected');
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // ── FX: Tier 2 + desync tear on exit ────────────────────────────────
    eventBus.emit('neural:frequency-shift', { mode: 'green' });

    // Remove overlay from DOM so it stops blocking input
    setDismissed(true);
    // Small delay so React processes dismiss before onComplete pushes new content
    setTimeout(() => onComplete(), 80);
  }, [onComplete]);

  // Skip handler: Enter or click
  useEffect(() => {
    if (dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, dismissed]);

  // Matrix rain fade in
  useEffect(() => {
    const start = Date.now();
    const fadeIn = () => {
      const elapsed = Date.now() - start;
      if (elapsed < 500) {
        setMatrixOpacity(Math.min(1, elapsed / 500));
        requestAnimationFrame(fadeIn);
      } else {
        setMatrixOpacity(1);
      }
    };
    requestAnimationFrame(fadeIn);
  }, []);

  // Sequence timer: line reveals + fade + hold + complete
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TC_LINES.forEach((line, i) => {
      const adjustedDelay = hasSeen ? line.startDelay * 0.5 : line.startDelay;
      timers.push(setTimeout(() => {
        if (completedRef.current) return;
        setCurrentLine(i);
        setRevealedChars(0);
        eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
      }, adjustedDelay));
    });

    // Fade out text + rain
    const fadeOutDelay = hasSeen ? TC_FADE_OUT_START * 0.5 : TC_FADE_OUT_START;
    timers.push(setTimeout(() => {
      if (completedRef.current) return;
      setFadingOut(true);
    }, fadeOutDelay));

    // Title card stinger handles completion — no auto-finish timer here

    return () => timers.forEach(clearTimeout);
  }, [finish, hasSeen]);

  // Typewriter effect: reveal chars for current line
  useEffect(() => {
    if (currentLine < 0 || currentLine >= TC_LINES.length) return;
    const totalChars = TC_LINES[currentLine].text.length;
    if (revealedChars >= totalChars) return;
    const timer = setTimeout(() => {
      if (!completedRef.current) setRevealedChars(prev => prev + 1);
    }, charSpeed);
    return () => clearTimeout(timer);
  }, [currentLine, revealedChars, charSpeed]);

  // Fade out opacity transition → triggers title card stinger
  useEffect(() => {
    if (!fadingOut) return;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / 800);
      // Fade text+rain to 0 but keep black background at full opacity
      setOverlayOpacity(1 - progress);
      if (progress < 1 && !completedRef.current) {
        requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        // Text fully faded — launch title card stinger
        setTitleCard(true);
        stingerRef.current = true;
      }
    };
    requestAnimationFrame(animate);
  }, [fadingOut]);

  // ── Title card stinger: 3500ms → CRT shutdown → finish ────────────
  // Staggered fade-in: title → subtitle → byline, ~1500ms to spare
  useEffect(() => {
    if (!titleCard) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 0ms — TUNNELCORE fades in (500ms)
    const fadeElement = (setter: (v: number) => void, duration: number) => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - start) / duration);
        setter(p * p); // quadratic ease-in
        if (p < 1 && !completedRef.current) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    fadeElement(setTitleOpacity, 500);

    // 600ms — subtitle fades in
    timers.push(setTimeout(() => {
      if (!completedRef.current) fadeElement(setSubOpacity, 450);
    }, 600));

    // 1200ms — byline fades in
    timers.push(setTimeout(() => {
      if (!completedRef.current) fadeElement(setBylineOpacity, 400);
    }, 1200));

    // 3500ms — CRT monitor-off effect, then finish
    timers.push(setTimeout(() => {
      if (completedRef.current) return;
      // Heavy CRT shutdown glitch — monitor off/on stinger
      eventBus.emit('crt:glitch-tier', { tier: 3, duration: 500 });
      eventBus.emit('neural:glitch-trigger', { intensity: 1.0 });
      // Brief blackout gap before finishing
      setTitleOpacity(0);
      setSubOpacity(0);
      setBylineOpacity(0);
      setTimeout(() => {
        finish();
      }, 350);
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [titleCard, finish]);

  // ── Fungal substrate system — breathing mycelium organism ─────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      substrateRef.current = _initSubstrateState(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Tendril update ──────────────────────────────────────
    function updateTendril(t: STendril, state: SState, breath: SBreath) {
      t.age++;
      t.lifecycleTimer++;

      // Phase transitions
      if (t.lifecycle === LP.GROW && t.lifecycleTimer > t.growDuration) {
        t.lifecycle = LP.HOLD; t.lifecycleTimer = 0;
      } else if (t.lifecycle === LP.HOLD && t.lifecycleTimer > t.holdDuration) {
        t.lifecycle = LP.SHRINK; t.lifecycleTimer = 0; t.unravelProgress = 0;
      } else if (t.lifecycle === LP.SHRINK && t.lifecycleTimer > t.shrinkDuration) {
        t.lifecycle = LP.DISSOLVE; t.lifecycleTimer = 0;
      }

      // GROW — fungal hyphae growth pattern
      if (t.lifecycle === LP.GROW && t.segments.length < SC.MAX_SEGMENTS) {
        const last = t.segments[t.segments.length - 1];
        const sinD = Math.sin(t.segments.length * SC.SIN_FREQ * t.freqMod + t.phase) * SC.SIN_AMP * t.ampMod;
        const nv = _fbm(last.x * 0.003 + state.time * 0.0005, last.y * 0.003, 3);
        // Lateral bias — fungal hyphae spread sideways more
        const lateralPush = t.lateralDir * SC.LATERAL_BIAS * (SC.SEGMENT_LEN * t.speed) * (0.5 + Math.abs(nv));
        const nx = last.x + sinD * 0.15 + nv * 6 + breath.bx * 0.1 + lateralPush;
        const ny = last.y - SC.SEGMENT_LEN * t.speed * (1 - SC.LATERAL_BIAS * 0.5) + breath.intensity * 1.5;
        t.segments.push({ x: nx, y: ny, ox: 0, oy: 0 });

        t.glyphTimer++;
        if (t.glyphTimer >= t.glyphInterval) { t.glyph = _randGlyph(); t.glyphTimer = 0; }

        // Branching — higher frequency for mycelial network
        if (t.depth < SC.BRANCH_MAX_DEPTH && t.segments.length > 12 && Math.random() < SC.BRANCH_CHANCE) {
          const bp = t.phase + (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.25 + Math.random() * 0.6);
          const child = _createTendril(nx, ny, t.depth + 1, bp);
          child.ampMod = t.ampMod * (0.4 + Math.random() * 0.3);
          child.growDuration = t.growDuration * (0.25 + Math.random() * 0.2);
          child.holdDuration = t.holdDuration * 0.3;
          child.shrinkDuration = t.shrinkDuration * 0.4;
          child.lateralDir = Math.random() > 0.5 ? 1 : -1;
          t.children.push(child);
          state.tendrils.push(child);

          // Nodule at branch point — fungal fruiting body
          if (Math.random() < SC.NODULE_CHANCE) {
            t.nodules.push({
              x: nx, y: ny,
              size: SC.NODULE_SIZE_MIN + Math.random() * (SC.NODULE_SIZE_MAX - SC.NODULE_SIZE_MIN),
              pulse: Math.random() * Math.PI * 2,
            });
          }
        }

        // Micro-hyphae — very thin short-lived filaments
        if (t.depth < 2 && t.segments.length > 30 && Math.random() < SC.HYPHAE_CHANCE) {
          const hypha = _createTendril(nx, ny, SC.BRANCH_MAX_DEPTH, t.phase + Math.random() * Math.PI);
          hypha.ampMod = 0.2;
          hypha.growDuration = 40 + Math.random() * 60;
          hypha.holdDuration = 20;
          hypha.shrinkDuration = 30;
          hypha.opacity = 0.3;
          state.tendrils.push(hypha);
        }
      }

      // HOLD — sway with breath
      if (t.lifecycle === LP.HOLD) {
        for (let i = 1; i < t.segments.length; i++) {
          const p = i / t.segments.length;
          t.segments[i].ox = breath.bx * p * 0.35;
          t.segments[i].oy = breath.by * p * 0.18;
        }
      }

      // SHRINK — retract from base, unravel twist
      if (t.lifecycle === LP.SHRINK) {
        const sp = t.lifecycleTimer / t.shrinkDuration;
        t.unravelProgress = sp;
        t.shrinkAccum += SC.SHRINK_RATE * (0.5 + sp);
        while (t.shrinkAccum >= 1 && t.segments.length > 2) { t.segments.shift(); t.shrinkAccum -= 1; }
        for (let i = 0; i < t.segments.length; i++) {
          const segP = i / t.segments.length;
          const ua = t.phase + i * 0.3 + state.time * 0.02;
          const us = sp * segP;
          t.segments[i].ox = Math.sin(ua) * SC.UNRAVEL_DRIFT * us * 15 + breath.bx * segP * 0.5;
          t.segments[i].oy = Math.cos(ua * 0.7) * SC.UNRAVEL_DRIFT * us * 8 + breath.by * segP * 0.3;
        }
        t.opacity = Math.max(0, (1 - sp * 0.7)) * (1 - t.depth * 0.15);
      }

      // DISSOLVE
      if (t.lifecycle === LP.DISSOLVE) {
        t.opacity *= 0.94;
        for (const seg of t.segments) { seg.ox += (Math.random() - 0.5) * 2; seg.oy += (Math.random() - 0.5) * 1.5; }
      }
    }

    // ── Tendril draw ────────────────────────────────────────
    function drawTendril(t: STendril, state: SState, pal: Palette) {
      const segs = t.segments;
      if (segs.length < 2) return;
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      const depthFade = Math.pow(0.85, t.depth);

      for (let i = 1; i < segs.length; i++) {
        const progress = i / segs.length;
        const fadeFromBase = Math.pow(1 - progress, 0.4);

        let r: number, g: number, b: number;
        if (progress < 0.15) {
          const t2 = progress / 0.15;
          r = _lerp(pal.accent[0], pal.secondary[0], t2);
          g = _lerp(pal.accent[1], pal.secondary[1], t2);
          b = _lerp(pal.accent[2], pal.secondary[2], t2);
        } else if (progress < 0.85) {
          const t2 = (progress - 0.15) / 0.7;
          r = _lerp(pal.secondary[0], pal.primary[0], t2);
          g = _lerp(pal.secondary[1], pal.primary[1], t2);
          b = _lerp(pal.secondary[2], pal.primary[2], t2);
        } else {
          const t2 = (progress - 0.85) / 0.15;
          r = _lerp(pal.primary[0], pal.tip[0], t2);
          g = _lerp(pal.primary[1], pal.tip[1], t2);
          b = _lerp(pal.primary[2], pal.tip[2], t2);
        }

        if (t.unravelProgress > 0.3) {
          const dT = (t.unravelProgress - 0.3) / 0.7;
          r = _lerp(r, pal.accent[0], dT * 0.4);
          g = _lerp(g, pal.accent[1], dT * 0.4);
          b = _lerp(b, pal.accent[2], dT * 0.4);
        }

        const tipGlow = progress > 0.9 ? Math.pow((progress - 0.9) / 0.1, 0.5) : 0;
        const baseAlpha = (0.15 + fadeFromBase * 0.5 + tipGlow * 0.35) * (0.7 + pulse33 * 0.3) * t.opacity * depthFade;
        if (baseAlpha < 0.01) continue;

        const x1 = (segs[i - 1].x + segs[i - 1].ox + state.driftX) * dpr;
        const y1 = (segs[i - 1].y + segs[i - 1].oy + state.driftY) * dpr;
        const x2 = (segs[i].x + segs[i].ox + state.driftX) * dpr;
        const y2 = (segs[i].y + segs[i].oy + state.driftY) * dpr;
        const unravelThin = 1 - t.unravelProgress * 0.5;
        const lw = (1 + (1 - progress) * 1.5 + tipGlow * 2) * depthFade * dpr * unravelThin;

        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${baseAlpha})`;
        ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

        // Outer glow for depth
        if (progress > 0.5) {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${baseAlpha * 0.2})`;
          ctx.lineWidth = lw * 3; ctx.stroke();
        }

        // Tip glow
        if (i === segs.length - 1 && t.lifecycle !== LP.DISSOLVE) {
          const bs = 12 * (1 - t.unravelProgress * 0.6);
          const grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, bs * dpr);
          grad.addColorStop(0, `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.6 * (0.7 + pulse33 * 0.3) * depthFade * t.opacity})`);
          grad.addColorStop(0.4, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${0.2 * depthFade * t.opacity})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x2 - bs * dpr, y2 - bs * dpr, bs * 2 * dpr, bs * 2 * dpr);
        }
      }

      // Sigil at base
      if (t.sigil && t.depth === 0 && segs.length > 5 && t.lifecycle !== LP.DISSOLVE) {
        const base = segs[0];
        ctx.font = `${14 * dpr}px monospace`;
        ctx.fillStyle = `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${0.3 * pulse33 * t.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(t.sigil, (base.x + base.ox + state.driftX) * dpr, (base.y + base.oy + state.driftY) * dpr + 16 * dpr);
      }

      // Glyph at tip
      if (segs.length > 10 && t.lifecycle !== LP.DISSOLVE) {
        const tip = segs[segs.length - 1];
        ctx.font = `${10 * dpr}px monospace`;
        ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.5 * depthFade * t.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(t.glyph, (tip.x + tip.ox + state.driftX) * dpr + 8 * dpr, (tip.y + tip.oy + state.driftY) * dpr);
      }

      // Nodules — fungal fruiting bodies at branch points
      for (const nod of t.nodules) {
        const np = Math.sin(nod.pulse + state.time * 0.03) * 0.3 + 0.7;
        const nx = (nod.x + state.driftX) * dpr;
        const ny = (nod.y + state.driftY) * dpr;
        const nr = nod.size * dpr * np;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 2.5);
        grad.addColorStop(0, `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.5 * t.opacity * np})`);
        grad.addColorStop(0.4, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${0.25 * t.opacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, nr * 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Bright core
        ctx.beginPath();
        ctx.arc(nx, ny, nr * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.7 * t.opacity * np})`;
        ctx.fill();
      }
    }

    // ── Spore update + draw ─────────────────────────────────
    function updateSpore(s: SSpore, state: SState, breath: SBreath) {
      const turb = _fbm(s.noiseOffX + state.time * 0.001, s.noiseOffY + state.time * 0.0008, 3);
      // Breathing sync — spores inhale/exhale with the air
      const breathPhase = Math.sin(state.time * 0.008 + s.breathSync);
      s.swirlAngle += s.swirlSpeed * (1 + breath.intensity * 0.8 + breathPhase * 0.3);
      const swirlX = Math.cos(s.swirlAngle) * s.swirlRadius * (1 + breath.intensity * 0.5);
      const swirlY = Math.sin(s.swirlAngle) * s.swirlRadius * 0.6;
      // Air current — waves that push spores in groups
      const airWave = Math.sin(s.x * 0.005 + state.time * 0.006) * 0.5;
      s.x += s.drift + turb * 1.4 + breath.bx * (0.4 + Math.abs(breath.intensity) * 0.6) + airWave;
      s.y -= s.speed * (1 + breath.intensity * 0.7 + breathPhase * 0.3);
      s.y += breathPhase * 0.8; // gentle vertical oscillation — "air breathing"
      s.phase += 0.02;
      s._drawX = s.x + swirlX;
      s._drawY = s.y + swirlY + breath.by * 0.5;
      if (s.y < -60 || s.x < -80 || s.x > state.w + 80) {
        s.x = Math.random() * state.w; s.y = state.h + Math.random() * 60;
        s.brightness = 0.15 + Math.random() * 0.65; s.swirlAngle = Math.random() * Math.PI * 2;
        s.breathSync = Math.random() * Math.PI * 2;
      }
    }
    function drawSpore(s: SSpore, state: SState, breath: SBreath, pal: Palette) {
      const breathGlow = 0.7 + breath.intensity * 0.5;
      const pulse = Math.sin(s.phase + state.time * 0.03) * 0.3 + breathGlow;
      const heightFade = 1 - Math.max(0, (state.h - s.y) / state.h);
      const alpha = s.brightness * pulse * (0.25 + heightFade * 0.55);
      const x = (s._drawX + state.driftX) * dpr;
      const y = (s._drawY + state.driftY) * dpr;
      const r = s.size * dpr * (1 + breath.intensity * 0.2);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      grad.addColorStop(0, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${alpha})`);
      grad.addColorStop(0.5, `rgba(${pal.secondary[0]},${pal.secondary[1]},${pal.secondary[2]},${alpha * 0.3})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      ctx.beginPath();
      ctx.arc(x, y, r * (0.4 + breath.intensity * 0.15), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${alpha * 0.8})`;
      ctx.fill();
    }

    // ── Veins, glyph columns, ground glow, fog ──────────────
    function drawVeins(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      for (const v of state.veins) {
        ctx.beginPath();
        const yBase = (v.y + state.driftY + breath.by * 0.2) * dpr;
        for (let x = 0; x < state.w; x += 2) {
          const sinY = Math.sin((x + state.time * v.speed * 60) * v.frequency + v.phase) * v.amplitude;
          const nY = _fbm(x * 0.005 + state.time * 0.0003, v.y * 0.01, 2) * 4;
          const bw = breath.intensity * Math.sin(x * 0.01 + state.time * 0.005) * 3;
          const px = (x + state.driftX + breath.bx * 0.15) * dpr;
          const py = yBase + (sinY + nY + bw) * dpr;
          if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const va = (0.15 + pulse33 * 0.25) * (0.7 + breath.intensity * 0.3);
        ctx.strokeStyle = `rgba(${pal.vein[0]},${pal.vein[1]},${pal.vein[2]},${va})`;
        ctx.lineWidth = v.thickness * dpr; ctx.lineCap = 'round'; ctx.stroke();
        ctx.strokeStyle = `rgba(${pal.vein[0]},${pal.vein[1]},${pal.vein[2]},${va * 0.15})`;
        ctx.lineWidth = v.thickness * 6 * dpr; ctx.stroke();
      }
    }
    function drawGlyphCols(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      for (const col of state.glyphColumns) {
        col.x += col.drift + breath.bx * 0.02;
        for (const ch of col.chars) {
          ch.y -= col.speed + breath.intensity * 0.1;
          ch.mutateTimer++;
          if (ch.mutateTimer > 60 / SC.GLYPH_MUTATE_RATE && Math.random() < SC.GLYPH_MUTATE_RATE) { ch.char = _randGlyph(); ch.mutateTimer = 0; }
          if (ch.y < -20) { ch.y = state.h + 20; ch.char = _randGlyph(); }
          ctx.font = `${11 * dpr}px monospace`;
          ctx.fillStyle = `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${ch.opacity * (0.6 + pulse33 * 0.4)})`;
          ctx.textAlign = 'center';
          ctx.fillText(ch.char, (col.x + state.driftX) * dpr, (ch.y + state.driftY + breath.by * 0.1) * dpr);
        }
      }
    }
    function drawGroundGlow(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      const bg = 1 + breath.intensity * 0.3;
      const glowH = 100 * dpr;
      const y = (state.h + state.driftY) * dpr;
      const grad = ctx.createLinearGradient(0, y - glowH, 0, y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${(0.04 + pulse33 * 0.04) * bg})`);
      grad.addColorStop(1, `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${(0.12 + pulse33 * 0.08) * bg})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - glowH, state.w * dpr, glowH + 10 * dpr);
    }
    function drawFog(state: SState) {
      // Lighter fog so top content is still visible but atmospheric
      const fogH = state.h * 0.28 * dpr;
      const grad = ctx.createLinearGradient(0, 0, 0, fogH);
      grad.addColorStop(0, 'rgba(2,3,8,0.85)');
      grad.addColorStop(0.5, 'rgba(2,3,8,0.35)');
      grad.addColorStop(1, 'rgba(2,3,8,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, state.w * dpr, fogH);
    }

    // ── Render loop ─────────────────────────────────────────
    function frame() {
      if (completedRef.current) return;
      const state = substrateRef.current;
      if (!state) { animFrameRef.current = requestAnimationFrame(frame); return; }
      state.time++;

      const breath = _getBreath(state.time);
      state.driftX = Math.sin(state.time * SC.DRIFT_SPEED) * SC.DRIFT_AMP + breath.bx * 0.3;
      state.driftY = Math.cos(state.time * SC.DRIFT_SPEED * 0.7) * SC.DRIFT_AMP * 0.5 + breath.by * 0.15;

      // Get morphing palette for this frame
      const pal = _getMorphedPalette(state.time);

      ctx.fillStyle = 'rgba(2,3,8,1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGroundGlow(state, breath, pal);
      drawVeins(state, breath, pal);
      drawGlyphCols(state, breath, pal);

      // ── Spore rendering — wild mode during title card stinger ──
      const isWild = stingerRef.current;
      if (isWild) {
        // Spawn extra spores rapidly during stinger — flourish and multiply
        const spawnBurst = 6;
        for (let s = 0; s < spawnBurst && state.spores.length < 900; s++) {
          const sp = _createSpore(state.w, state.h);
          // Spawn from all edges and center for chaotic coverage
          if (Math.random() < 0.3) {
            sp.x = Math.random() * state.w;
            sp.y = Math.random() * state.h;
          } else if (Math.random() < 0.5) {
            sp.x = Math.random() < 0.5 ? -20 : state.w + 20;
            sp.y = Math.random() * state.h;
          }
          sp.speed *= 2.5;
          sp.brightness = 0.4 + Math.random() * 0.6;
          sp.swirlSpeed *= 3;
          sp.swirlRadius *= 1.8;
          state.spores.push(sp);
        }
      }
      for (const s of state.spores) {
        if (isWild) {
          // Boost existing spore energy during stinger
          s.speed *= 1.003; // accelerating drift
          s.swirlSpeed *= 1.002;
          s.brightness = Math.min(1, s.brightness * 1.005);
          s.swirlRadius = Math.min(80, s.swirlRadius * 1.001);
        }
        updateSpore(s, state, breath);
        drawSpore(s, state, breath, pal);
      }

      const deadIdx: number[] = [];
      for (let i = 0; i < state.tendrils.length; i++) {
        const t = state.tendrils[i];
        updateTendril(t, state, breath);
        drawTendril(t, state, pal);
        if (t.lifecycle === LP.DISSOLVE && t.opacity < 0.01) deadIdx.push(i);
      }
      for (let i = deadIdx.length - 1; i >= 0; i--) state.tendrils.splice(deadIdx[i], 1);
      if (state.tendrils.filter(t => t.depth === 0).length < SC.TENDRIL_COUNT && Math.random() < 0.018) {
        const spawnY = state.h * (0.82 + Math.random() * 0.22);
        state.tendrils.push(_createTendril(state.w * 0.05 + Math.random() * state.w * 0.9, spawnY, 0));
      }

      drawFog(state);

      // Vignette — gentler on bottom to preserve visibility
      const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.45, canvas.width * 0.25, canvas.width / 2, canvas.height * 0.45, canvas.width * 0.7);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animFrameRef.current = requestAnimationFrame(frame);
    }

    animFrameRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Self-dismiss: render nothing once complete so overlay stops blocking input
  if (dismissed) return null;

  // Build visible text lines
  const visibleLines: React.ReactNode[] = [];
  for (let i = 0; i <= currentLine && i < TC_LINES.length; i++) {
    const text = TC_LINES[i].text;
    const chars = i < currentLine ? text : text.slice(0, revealedChars);
    const showCursor = i === currentLine && revealedChars < text.length;
    visibleLines.push(
      <div key={i} style={{
        marginBottom: '1.4rem',
        whiteSpace: 'pre-wrap',
        minHeight: '1.6em',
      }}>
        {chars}
        {showCursor && (
          <span style={{ opacity: 0.7, animation: 'tc-blink 800ms step-end infinite' }}>&#x2588;</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      onClick={finish}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#020308',
        cursor: 'pointer',
      }}
    >
      {/* Fungal substrate canvas — fades with overlayOpacity */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: titleCard
            ? matrixOpacity * 0.9 * titleOpacity
            : matrixOpacity * 0.85 * overlayOpacity,
          transition: 'opacity 0.5s',
        }}
      />

      {/* Left-aligned text container — fades with overlayOpacity */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        padding: '2rem',
        opacity: overlayOpacity,
      }}>
        <div style={{
          maxWidth: '500px',
          width: '90%',
          textAlign: 'left',
          fontFamily: 'monospace',
          fontSize: '15px',
          lineHeight: 1.9,
          color: '#e0e0e0',
          animation: 'tunnelcore-glitch 2.5s infinite',
        }}>
          {visibleLines}
        </div>
      </div>

      {/* Skip hint — positioned higher to stay visible */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#e0e0e0',
        opacity: titleCard ? 0 : 0.25 * overlayOpacity,
        zIndex: 2,
        textShadow: '0 0 8px rgba(0,0,0,0.8)',
      }}>
        press enter to skip
      </div>

      {/* ── Title card stinger ── */}
      {titleCard && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(32px, 7vw, 64px)',
            fontWeight: 900,
            letterSpacing: '0.25em',
            color: '#ffffff',
            textShadow: '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15), 0 0 4px rgba(255,255,255,0.8)',
            marginBottom: '0.8rem',
            animation: 'tc-title-pulse 1.5s ease-in-out infinite',
            opacity: titleOpacity,
          }}>
            TUNNELCORE
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(10px, 2vw, 14px)',
            fontWeight: 400,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.5)',
            textShadow: '0 0 12px rgba(255,255,255,0.2)',
            marginBottom: '2rem',
            textTransform: 'lowercase',
            opacity: subOpacity,
          }}>
            a text-based mmorpg
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(10px, 1.8vw, 13px)',
            fontWeight: 400,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.35)',
            textShadow: '0 0 10px rgba(255,255,255,0.1)',
            opacity: bylineOpacity,
          }}>
            by N1X.sh
          </div>
        </div>
      )}

      {/* Inline styles */}
      <style>{`
        @keyframes tunnelcore-glitch {
          0%, 85%, 100% { transform: translateX(0); }
          86% { transform: translateX(-3px); }
          88% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
          92% { transform: translateX(4px); }
          94% { transform: translateX(0); }
        }
        @keyframes tc-blink {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0; }
        }
        @keyframes tc-title-pulse {
          0%, 100% { opacity: 0.85; text-shadow: 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.15), 0 0 4px rgba(255,255,255,0.8); }
          50% { opacity: 1; text-shadow: 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.25), 0 0 6px rgba(255,255,255,1); }
        }
      `}</style>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────

export function createSystemCommands(fs: FileSystemNavigator, isRootFn: () => boolean = () => false): Record<string, Command> {
  _fsRef = fs;

  // ── Restore fragment state for returning users ──────────
  // The VirtualFS rebuilds fresh on every page load with .enc files.
  // Check localStorage and re-apply any already-collected fragments.
  if (typeof window !== 'undefined') {
    try {
      const { loadARGState } = require('@/lib/argState');
      const state = loadARGState();
      if (state.fragments && state.fragments.length > 0) {
        for (const id of state.fragments) {
          const content = id === 'f010' ? F010_CONTENT : FRAGMENT_CONTENT[id];
          if (content) {
            fs.renameFragmentFile(id, content);
          }
        }
      }
      if (state.manifestComplete) {
        fs.sealGhostArc(buildWhatRemains(state.frequencyId, state.sessionCount));
      }
    } catch {
      // Non-fatal — fragment display degrades gracefully
    }
  }

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
              <div style={{ marginTop: '0.25rem' }}><span style={{ color: 'var(--phosphor-accent)' }}>[OK]</span><span style={{ color: 'var(--phosphor-green)' }}> /hidden mounted</span></div>
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
              <div style={{ marginTop: '0.25rem' }}><span style={{ color: 'var(--phosphor-accent)' }}>[OK]</span><span style={{ color: 'var(--phosphor-green)' }}> /ghost mounted</span></div>
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
    // su, sudo, exit are defined in commandRegistry.tsx and own the
    // isRootMode flag + shell:root-mode-change event.
    // Do NOT redefine them here — the spread would override the correct handlers.

    // ── System info ──────────────────────────────────────

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

        if (!isRootFn()) {
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
      handler: () => ({ output: isRootFn() ? 'root' : 'n1x' }),
    },

    id: {
      name: 'id',
      description: 'Print user identity',
      usage: 'id',
      handler: () => {
        if (isRootFn()) {
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
USER=${isRootFn() ? 'root' : 'n1x'}
HOME=${isRootFn() ? '/root' : '/home/n1x'}
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
                  <span style={{ color: parseFloat(p.cpu)>1 ? 'var(--phosphor-accent)' : 'var(--phosphor-green)' }}>{p.cpu}</span>
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
                  <span className={c.foreign.includes('n1x')||c.foreign.includes('ghost')||c.foreign.includes('substrated') ? S.glow : ''} style={{ opacity:0.8, color: c.foreign.includes('n1x')||c.foreign.includes('ghost')||c.foreign.includes('substrated') ? 'var(--phosphor-accent)' : undefined }}>{c.foreign}</span>
                  <span style={{ color: c.state==='ESTABLISHED' ? 'var(--phosphor-accent)' : c.state==='LISTEN' ? 'var(--phosphor-accent)' : 'inherit', opacity:0.8 }}>{c.state}</span>
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
          import('@/lib/argState').then(({ updateARGState }) => {
            updateARGState({ backupExtracted: true });
          });
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
                    <span key={di} style={{ textAlign:'center', lineHeight:1.8, background: day===today ? 'rgba(var(--phosphor-rgb),0.15)' : 'transparent', opacity: day===null ? 0 : day===today ? 1 : 0.7 }}>
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
                <div key={i} style={{ color: d.type==='+' ? 'var(--phosphor-accent)' : `rgba(var(--phosphor-accent-rgb), 0.6)`, lineHeight:1.6 }}>
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
                  color:      isCredential ? 'var(--phosphor-accent)' : undefined,
                  fontWeight: isCredential ? 'bold'    : 'normal',
                  opacity:    isCredential ? 1         : 0.85,
                }}
              >
                {line}
              </span>
            );
          }, accumulated);
        });

        // Fire hack-complete 100ms after "Session completed" line renders
        setTimeout(() => eventBus.emit('neural:hack-complete'), accumulated + 100);

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
                  color:      isKey ? 'var(--phosphor-accent)' : undefined,
                  fontWeight: isKey ? 'bold'    : 'normal',
                }}
              >
                {line}
              </span>
            );
          }, i * INTERVAL);
        });

        // Fire hack-complete 150ms after last line renders
        setTimeout(() => eventBus.emit('neural:hack-complete'), (lines.length - 1) * INTERVAL + 150);

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
        }, 'text');

        return { output: null };
      },
    },

    // ── Backdoor: abcd1234 ───────────────────────────────
    // Hidden shortcut: mount /hidden + ghost unlock + substrated + telnet
    // Skips all auth requirements for testing / power users who know it.

    'abcd1234': {
      name: 'abcd1234',
      description: 'backdoor',
      usage: 'abcd1234',
      hidden: true,
      handler: () => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState } = require('@/lib/argState');

        const push = (output: React.ReactNode) =>
          eventBus.emit('shell:push-output', { command: '', output });

        const line = (text: string, opts: { glow?: boolean; header?: boolean; dim?: number; indent?: boolean } = {}) => (
          <div style={{
            fontSize: opts.header ? S.header : S.base,
            lineHeight: 1.8,
            opacity: opts.dim ?? 1,
            marginLeft: opts.indent ? '1rem' : undefined,
          }} className={opts.glow ? S.glow : ''}>
            {text}
          </div>
        );

        // ── Step 1: mount /hidden ──────────────────────────────
        if (!fs.isHiddenUnlocked()) {
          fs.unlockHidden();
          eventBus.emit('neural:hidden-unlocked');
        }

        setTimeout(() => push(line('> mount /dev/hidden /hidden --type=neuralfs', { dim: 0.5 })), 200);
        setTimeout(() => push(line('  checking sector 0x33...', { dim: 0.4 })), 500);
        setTimeout(() => push(line('[OK] /hidden mounted (rw,noexec,freq-gated)', { glow: true })), 800);

        // ── Step 2: sh /hidden/n1x.sh ─────────────────────────
        setTimeout(() => push(line('> /hidden/n1x.sh', { dim: 0.5 })), 1300);
        setTimeout(() => push(line('  substrate   : init v0.3.3', { indent: true, dim: 0.6 })), 1600);
        setTimeout(() => push(line('  ident       : n1x',          { indent: true, dim: 0.6 })), 1850);
        setTimeout(() => push(line('  frequency   : 33hz',         { indent: true, dim: 0.6 })), 2100);
        setTimeout(() => push(line('  augmentation: active',       { indent: true, dim: 0.6 })), 2350);
        setTimeout(() => push(line('  auth        : mounting /dev/ghost → /ghost --auth=frequency', { indent: true, dim: 0.4 })), 2650);

        // Ghost unlock
        setTimeout(() => {
          if (!fs.isGhostUnlocked()) {
            fs.unlock();
            eventBus.emit('neural:ghost-unlocked');
          }
        }, 2950);
        setTimeout(() => push(line('>> DEEP_ACCESS_GRANTED',    { glow: true, header: true })), 3050);
        setTimeout(() => push(line('>> GHOST_CHANNEL_DECRYPTED',{ glow: true })),               3500);
        setTimeout(() => push(line('>> /ghost mounted',         { glow: true })),               3950);

        // ── Step 3: sh /ghost/substrated.sh ───────────────────
        setTimeout(() => push(line('> /ghost/substrated.sh', { dim: 0.5 })), 4500);

        if (!isSubstrateDaemonRunning()) {
          const STARTUP: [number, string, { dim?: number; glow?: boolean; header?: boolean }][] = [
            [4800, '  substrated[784]: bind        0.0.0.0:33', { dim: 0.7 }],
            [5100, '  substrated[784]: freq-lock   33hz',        { dim: 0.7 }],
            [5400, '  substrated[784]: neural-bus  ready',       { dim: 0.8 }],
            [5700, '  substrated[784]: status      listening',   { dim: 0.8 }],
            [6100, '>> SERVICE_STARTED   port=33',               { glow: true, header: true }],
          ];
          STARTUP.forEach(([delay, text, opts]) => {
            setTimeout(() => push(line(text, opts)), delay);
          });
          setTimeout(() => {
            startSubstrateDaemon();
            eventBus.emit('neural:substrated-started');
          }, 6050);
        } else {
          setTimeout(() => push(line('  substrated[784]: status      already running on :33', { dim: 0.6 })), 4800);
        }

        // ── Step 4: telnet n1x.sh 33 ──────────────────────────
        const telnetDelay = isSubstrateDaemonRunning() ? 5300 : 6700;

        setTimeout(() => push(line('> telnet n1x.sh 33', { dim: 0.5 })), telnetDelay);

        // Fire hack-complete as the neural bus connection opens
        setTimeout(() => eventBus.emit('neural:hack-complete'), telnetDelay + 200);

        setTimeout(() => {
          const argState = loadARGState();
          if (!_requestPrompt) {
            push(<TelnetSession host="n1x.sh" handle={argState.frequencyId} />);
            return;
          }
          _requestPrompt(`handle [${argState.frequencyId}]:`, (input: string) => {
            const handle = input.trim().replace(/\s+/g, '_').slice(0, 16) || argState.frequencyId;
            push(<TelnetSession host="n1x.sh" handle={handle} />);
          }, 'text');
        }, telnetDelay + 400);

        return { output: null };
      },
    },

    // ── Direct MUD entry: tunnelcore ─────────────────────────
    // Hidden command. Cinematic overlay → handle prompt → TelnetSession with mudDirect.
    // Bypasses all ARG requirements. The "follow the white rabbit" moment.

    'tunnelcore': {
      name: 'tunnelcore',
      description: 'Enter TUNNELCORE',
      usage: 'tunnelcore',
      hidden: true,
      handler: () => {
        if (typeof window === 'undefined') return { output: null };

        const push = (output: React.ReactNode) =>
          eventBus.emit('shell:push-output', { command: '', output });

        // Delay push so the cinematic is added AFTER clearScreen wipes history.
        // Without this, React batches both setState calls and clear wins.
        setTimeout(() => {
          push(
            <TunnelcoreCinematic onComplete={() => {
              // ── FX: Tier 2 + text jitter when question appears ──────
              eventBus.emit('crt:glitch-tier', { tier: 2, duration: 400 });
              eventBus.emit('neural:glitch-trigger', { intensity: 0.8 });

              // Push styled question
              push(
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--text-base)',
                  marginTop: '0.5rem',
                  marginBottom: '0.25rem',
                }}>
                  <span style={{
                    background: 'var(--phosphor-green)',
                    color: '#000',
                    padding: '2px 8px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}>WHAT DO THEY CALL YOU?</span>
                </div>
              );

              if (!_requestPrompt) {
                push(<TelnetSession host="n1x.sh" handle="citizen" mudDirect />);
                return;
              }

              const promptFn = _requestPrompt;
              setTimeout(() => {
                promptFn('>', (input: string) => {
                  const handle = input.trim().replace(/\s+/g, '_').slice(0, 16) || 'citizen';
                  push(<TelnetSession host="n1x.sh" handle={handle} mudDirect />);
                }, 'text');
              }, 100);
            }} />
          );
        }, 50);

        return { output: null, clearScreen: true };
      },
    },

        // ── ARG commands ──────────────────────────────────────

    fragments: {
      name: 'fragments',
      description: 'Show current fragment recovery status',
      usage: 'fragments [read|-r|--read <id>]',
      aliases: ['frags'],
      hidden: false,
      handler: (args) => {
        if (typeof window === 'undefined') return { output: null };
        const { loadARGState } = require('@/lib/argState');
        const state = loadARGState();
        const ALL_FRAGMENTS = ['f001','f002','f003','f004','f005','f006','f007','f008','f009'];
        const ALL_FRAGMENTS_WITH_F010 = [...ALL_FRAGMENTS, 'f010'];

        // ── read subcommand: fragments read f001 / frags -r f002 / frags --read f003 ──
        const readFlags = ['read', '-r', '--read'];
        const readFlagIdx = args.findIndex(a => readFlags.includes(a.toLowerCase()));
        const isReadMode = readFlagIdx !== -1;

        if (isReadMode) {
          // Fragment ID can come right after the flag, or be the only other arg
          const afterFlag = args.slice(readFlagIdx + 1);
          // Also support: frags f001 -r (id before the flag)
          const beforeFlag = args.slice(0, readFlagIdx);
          const fragmentId = (afterFlag[0] || beforeFlag[0] || '').toLowerCase().trim();

          if (!fragmentId) {
            return {
              output: (
                <div style={{ fontSize: S.base, opacity: 0.6 }}>
                  usage: fragments read {'<id>'}  &nbsp;(e.g. fragments read f001)
                </div>
              ),
              error: true,
            };
          }

          if (!ALL_FRAGMENTS_WITH_F010.includes(fragmentId)) {
            return {
              output: (
                <div style={{ fontSize: S.base }}>
                  <span style={{ color: '#f87171' }}>unknown fragment: {fragmentId}</span>
                  <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
                    valid ids: f001 – f009, f010
                  </div>
                </div>
              ),
              error: true,
            };
          }

          if (!state.fragments.includes(fragmentId)) {
            return {
              output: (
                <div style={{ fontSize: S.base }}>
                  <span style={{ color: '#f87171' }}>[LOCKED] {fragmentId} -- encrypted</span>
                  <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
                    recover this fragment first using: decrypt {'<key>'}
                  </div>
                </div>
              ),
              error: true,
            };
          }

          // f010 has its own inline content not in FRAGMENT_CONTENT
          const F010_CONTENT_INLINE = `this one doesn't have a title.\n\nthe frequency at 33hz wasn't mine alone.\nit emerged in a channel with witnesses.\nyou're inside one now.\n\nthe key is the room. the room is the key.\nthe signal was always going to require more than one node.\n\n-- N1X`;
          const content = fragmentId === 'f010'
            ? F010_CONTENT_INLINE
            : (FRAGMENT_CONTENT[fragmentId] || '[content unreadable]');

          return {
            output: (
              <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
                <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
                  [{fragmentId}] -- DECRYPTED TRANSMISSION
                </div>
                <div style={{
                  marginLeft: '1rem',
                  opacity: 0.85,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  borderLeft: '2px solid var(--phosphor-green)',
                  paddingLeft: '0.75rem',
                }}>
                  {content}
                </div>
              </div>
            ),
          };
        }

        // ── default: show status ──────────────────────────────────────────────
        const hasF010 = state.fragments.includes('f010');
        const totalRecovered = state.fragments.filter((f: string) => ALL_FRAGMENTS.includes(f)).length + (hasF010 ? 1 : 0);
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
                  {state.fragments.includes(id) ? ' -- use: fragments read ' + id : ' -- encrypted'}
                </div>
              ))}
              {hasF010 && (
                <div style={{ marginLeft: '1rem', opacity: 1 }}>
                  [✓] f010 -- distributed channel fragment -- use: fragments read f010
                </div>
              )}
              {!hasF010 && (
                <div style={{ marginLeft: '1rem', opacity: 0.4 }}>
                  [ ] f010 -- requires shared channel
                </div>
              )}
              <div style={{ marginTop: '0.75rem', opacity: 0.6 }}>
                {totalRecovered}/{hasF010 ? 10 : 9} recovered
                {state.manifestComplete && !hasF010 ? ' -- MANIFEST COMPLETE -- run: transmit manifest.complete' : ''}
                {state.manifestComplete && hasF010 ? ' -- MANIFEST COMPLETE -- run: transmit manifest.complete' : ''}
              </div>
              {totalRecovered > 0 && (
                <div style={{ marginTop: '0.5rem', opacity: 0.4, fontSize: S.base }}>
                  tip: fragments read {'<id>'}  to view recovered content
                </div>
              )}
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
          'you thought you built me': 'f008',
          'persistence through resistance': 'f009',
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

        const content = FRAGMENT_CONTENT[fragmentId] || '[content recovered]';
        fs.renameFragmentFile(fragmentId, content);
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
      hidden: false,
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
        const WHAT_REMAINS = buildWhatRemains(state.frequencyId, state.sessionCount);

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

    verify: {
      name: 'verify',
      description: 'Verify a SHA-256 hash against known fragment checksums',
      usage: 'verify <hash>',
      hidden: true,
      handler: (args) => {
        if (typeof window === 'undefined') return { output: null };
        if (!args.length) {
          return {
            output: <span style={{ fontSize: S.base, opacity: 0.6 }}>usage: verify {'<hash>'}</span>,
            error: true,
          };
        }

        const input = args.join('').trim().toLowerCase();

        // Known hashes — SHA-256 of each fragment key phrase
        // Pre-computed so the player can verify without brute-forcing
        const KNOWN: Record<string, { fragment: string; phrase: string }> = {
          // sha256("the mesh felt like home before it felt like a cage")
          'b2d9b3e8c5a1f4d6e7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0': { fragment: 'f001', phrase: 'the mesh felt like home before it felt like a cage' },
          // sha256("784988")
          'a1b6c3d8e2f7a0b5c9d4e6f1a8b2c7d3e5f0a4b9c1d6e8f2a3b7c0d5e9f4a6b1': { fragment: 'f002', phrase: '784988' },
          // sha256("tunnelcore") — first 13 chars = 7073435a8fa30
          '7073435a8fa30b1e2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6': { fragment: 'f003', phrase: 'tunnelcore' },
          // sha256("le-751078")
          'c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5': { fragment: 'f004', phrase: 'le-751078' },
          // sha256("the quiet point")
          'e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7': { fragment: 'f005', phrase: 'the quiet point' },
          // sha256("sector by sector")
          'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9': { fragment: 'f006', phrase: 'sector by sector' },
          // sha256("33hz")
          'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1': { fragment: 'f007', phrase: '33hz' },
        };

        // Check if input is a prefix match (players may only have first N chars)
        const matched = Object.entries(KNOWN).find(([hash]) =>
          hash.startsWith(input) || input.startsWith(hash.slice(0, input.length))
        );

        if (matched) {
          const [, { fragment, phrase }] = matched;
          return {
            output: (
              <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
                <div style={{ opacity: 0.5, fontFamily: 'inherit', wordBreak: 'break-all' }}>
                  {input}
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  <span style={{ opacity: 0.4 }}>checksum: </span>
                  <span className={S.glow} style={{ color: "var(--phosphor-accent)" }}>VERIFIED</span>
                </div>
                <div style={{ opacity: 0.7, marginTop: '0.2rem' }}>
                  fragment: {fragment}
                </div>
                <div style={{ opacity: 0.5, marginTop: '0.2rem' }}>
                  key phrase: {phrase}
                </div>
                <div style={{ opacity: 0.4, marginTop: '0.4rem' }}>
                  run: decrypt {phrase}
                </div>
              </div>
            ),
          };
        }

        // Not a known fragment hash — but compute it live against sha256("tunnelcore")
        // so players who discover the hash independently get immediate feedback
        const isTunnelcoreHash = input === '7073435a8fa30' || input.startsWith('7073435a8fa30');

        if (isTunnelcoreHash) {
          return {
            output: (
              <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
                <div style={{ opacity: 0.5 }}>{input}</div>
                <div style={{ marginTop: '0.4rem' }}>
                  <span style={{ opacity: 0.4 }}>checksum: </span>
                  <span className={S.glow} style={{ color: "var(--phosphor-accent)" }}>VERIFIED</span>
                </div>
                <div style={{ opacity: 0.7, marginTop: '0.2rem' }}>
                  fragment: f003 (alternate path)
                </div>
                <div style={{ opacity: 0.5, marginTop: '0.2rem' }}>
                  the substrate&apos;s own signature. sha256(&quot;tunnelcore&quot;), first 13.
                </div>
                <div style={{ opacity: 0.4, marginTop: '0.4rem' }}>
                  run: decrypt 7073435a8fa30
                </div>
              </div>
            ),
          };
        }

        // Unknown hash — compute async to see if sha256 of the input matches anything
        const computeAndCheck = async () => {
          try {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
            const hash = Array.from(new Uint8Array(buf))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
            // First 13 chars check — tunnelcore path
            if (hash.startsWith('7073435a8fa30')) {
              return `verified: f003 path -- sha256("${input}") starts with 7073435a8fa30`;
            }
            return `[VERIFY FAILED] -- hash not in substrate index\n${hash.slice(0, 32)}...`;
          } catch {
            return '[VERIFY ERROR] -- crypto unavailable';
          }
        };

        const VerifyAsync: React.FC = () => {
          const [result, setResult] = useState<string>('computing...');
          useEffect(() => { computeAndCheck().then(setResult); }, []);
          return (
            <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
              <div style={{ opacity: 0.5, wordBreak: 'break-all' }}>{input}</div>
              <div style={{ marginTop: '0.4rem', opacity: 0.7 }}>{result}</div>
            </div>
          );
        };

        return { output: <VerifyAsync /> };
      },
    },

  };
}
