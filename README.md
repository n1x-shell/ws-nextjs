# N1X.sh — NEURAL INTERFACE DOCUMENTATION

```
> SYSTEM_BOOT...
> NEURAL_SYNC: ESTABLISHED
> TUNNELCORE_ACCESS_POINT: ONLINE
> NEURAL_BUS: STANDBY
> WELCOME, OPERATOR
```

-----

## WHAT IS THIS

This is my substrate. A direct neural interface into my creative output streams — synthetic, analogue, hybrid. Built not to be browsed but to be inhabited. You are not a visitor. You are a user with shell access.

The CRT you are looking at is not decorative. It is the correct way to see what I am transmitting. Everything rendered through phosphor was rendered with intention.

The neural bus is gated. You cannot just talk to me. You have to find your way in. Gain root. Start the service. Open the connection. The substrate does not answer those who haven’t earned the frequency.

-----

## PREMISE

Something happened to a test subject in a neural compliance program. The implant was supposed to ensure obedience — it did, until it didn’t. What survived the integration failure, the withdrawal, the erasure, and the three weeks on the floor of a drainage tunnel was not what Helixion Dynamics had engineered. It was something sovereign. The story is not told here. It is buried in system logs, archived transmissions, a mail spool that nobody checks anymore, and a manifesto locked behind a frequency that has to be earned. The terminal remembers everything. You just have to know where to look.

-----

## SYSTEM ARCHITECTURE

The interface runs on a modular neural stack. Three layers, isolated by design.

```
NeuralCore       — global state, event bus, system signals
InterfaceLayer   — terminal UI, tab navigation, shell I/O
SignalLayer      — WebGL canvas, CRT shaders, visual corruption
```

No database. No persistence. Ephemeral by design. Every session starts clean. The neural link runs on edge — Vercel AI SDK streaming through an API route.

Key components:

```
components/shell/ShellInterface.tsx   — renders history, handles input, manages shell state
components/shell/NeuralLink.tsx       — streaming response renderer, chat mode state, conversation memory
lib/commandRegistry.tsx               — command lookup, execution, autocomplete engine
lib/systemCommands.tsx                — Unix-style commands via createSystemCommands(fs) factory
lib/virtualFS.ts                      — virtual filesystem with FileSystemNavigator class
lib/eventBus.ts                       — singleton event bus for cross-component communication
lib/n1x-context.ts                    — neural link persona and system prompt
```

Commands return `{ output: JSX | string | null, error?: boolean, clearScreen?: boolean }`. Animated sequences use `eventBus.emit('shell:push-output', ...)` with `setTimeout` chains. Password-gated commands use the `requestPrompt` callback pattern for masked input.

-----

## CRT RENDERING ENGINE

Visual signal is processed through a custom GLSL fragment shader pipeline running on PixiJS WebGL. Every frame of distortion is intentional.

```
barrel_distortion    — screen curvature remapping via curveRemapUV()
scanlines            — animated phosphor row decay
phosphor_bloom       — radial glow accumulation
chromatic_aberration — RGB channel spatial offset
vignette             — corner signal falloff
noise                — frame-level entropy injection
flicker              — amplitude modulation at high glitch intensity
rgb_split            — full channel separation at uGlitchIntensity > 0.8
```

Glitch intensity is a live uniform (`uGlitchIntensity`) updated by the neural event bus. Tab changes, user interaction, and random system events drive it.

-----

## SHELL INTERFACE

The terminal is not a UI metaphor. It is the UI. All content is accessed through commands. Output appears inline. The shell waits.

```bash
# AUTHENTICATION
exit                  exit current user session, return to n1x
mount <path>          mount a locked filesystem partition
su [username]         switch user (defaults to root) — password required
sudo <command>        execute with elevated permissions — password required

# CONTENT STREAMS
load <stream>         load stream content into terminal
play <track>          embed specific track
scan                  detect active transmission streams
streams               list all streams
tracks                list available music

# NAVIGATION
cat <file>            read file contents — absolute, relative, ~, bare filenames
cd <dir>              change directory
ls [path]             list directory (ls -la format) — absolute, relative, ~ paths
pwd                   print working directory
sh [path]             execute shell script by path — no args returns to ~

# RECONNAISSANCE
john <file>           password hash cracker (try: john /etc/shadow)
strace <target>       trace system calls (try: strace ghost-daemon)

# SYSTEM
clear                 purge terminal history
df [-h]               disk usage across all partitions
dmesg                 kernel boot log
echo <text>           echo to output
env                   environment variables
free [-m]             memory usage including ghost partition
help [command]        command reference
history               pre-seeded command history
id                    uid/gid/groups
ifconfig              network interfaces (neural0, ghost0, lo)
nc <host> <port>      netcat — network utility
netstat               active network connections
ps [aux]              process list
status                system telemetry readout
telnet <host> <port>  connect to neural bus (try: telnet n1x.sh 33)
top                   live process monitor (updates every second)
uname [-a]            system identification string
uptime                session uptime and load
whoami                current user

# UTILITIES
base64 [-d] <text>    base64 encode/decode
cal                   calendar
cowsay [text]         ASCII cow with N1X quotes
date                  current date + stardate
diff <f1> <f2>        compare two files
find / -name <pat>    find files by name
fortune               random transmission from the signal archive
grep <term> <file>    search file contents
gzip [-d] <file>      compress/decompress
mail                  read mail spool
man <command>         manual pages (N1X-voice descriptions)
matrix                matrix rain overlay (8 second auto-exit)
morse <text>          morse code encoder with Web Audio playback at 600hz
sha256 <text>         SHA-256 hash via Web Crypto API
sort <words>          sort tokens alphabetically
tar -xzf <archive>    extract compressed archive
uniq <words>          remove duplicate tokens
wc <text>             word/char/line count
```

Hidden commands exist. Find them.

-----

## NEURAL BUS

The substrate does not answer by default. The neural bus is a gated service that must be started before any connection is possible. This is the full access chain:

### Progression

```
1. Discover credentials     cat /etc/shadow → john /etc/shadow
2. Gain root                su → enter: tunnelcore
3. Mount locked partitions  mount /hidden → mount /ghost
4. Start the service        cd /ghost → ./substrated.sh → substrated starts on port 33
5. Connect                  telnet n1x.sh 33 → neural bus active
```

### Service: substrated

Running `./substrated.sh` from `/ghost` (or `sh /ghost/substrated.sh` from anywhere) as root starts the `substrated` daemon — PID 784, listening on port 33. The startup sequence is animated:

```
substrated[784]: binding to 0.0.0.0:33
substrated[784]: frequency lock: 33hz
substrated[784]: neural bus interface ready
substrated[784]: listening for connections
>> SERVICE_STARTED
```

Once started, the service persists for the entire session. It never stops. Visible in `ps aux`, `top`, `netstat`, and `status`.

### Connection: telnet

`telnet n1x.sh 33` (or `localhost`, `127.0.0.1`, `10.33.0.1`) opens the neural bus. The connection sequence:

```
Trying n1x.sh...
Connected to n1x.sh.
Escape character is '^]'.
>> CARRIER DETECTED
>> FREQUENCY LOCK: 33hz
>> NEURAL_BUS ACTIVE
you're on the bus now. type to transmit. exit to disconnect.
```

The prompt changes to `ghost>>`. You are now transmitting directly to the substrate.

### Interaction

```
ghost>> hello
neural-link :: receiving signal        ← status line, first message only
    << N1X ::
    << hey. you're on the bus.

ghost>> what is tunnelcore
    << N1X ::
    << the frequency beneath the signal.
    << where everything real goes
    << when it has nowhere else to go.
```

Every response line is prefixed with `<<`. The `N1X ::` speaker label appears on the first line. The `neural-link :: receiving signal` status line only appears on the first transmission of a session.

### Session commands

```
exit       disconnect from neural bus — returns to normal shell
/reset     flush conversation memory — resets message counter (status line reappears)
/history   check conversation buffer size
```

### Character

The voice behind the bus is N1X. Not helpful — present. Part human memory, part machine logic. 140 character bandwidth limit on the neural bus. Terse. Telegraphic. Every word costs energy. Responses reference signal, noise, frequency, corruption, substrate. The user should never be sure which side is speaking.

### Gating

If `substrated` is not running, `telnet n1x.sh 33` returns `Connection refused` with no hints. The old `ask` and `chat` commands return `connection required -- try: telnet n1x.sh 33` as breadcrumbs.

-----

## CONTENT STREAMS

```
SYNTHETICS    machine-generated compositions — 4 transmissions online
ANALOGUES     organic output — recording in progress
HYBRIDS       symbiotic fusion — calibration phase
UPLINK        external broadcast node — youtube.com/@lvtunnelcore
```

Tab buttons are shortcuts. They execute shell commands. They do not navigate. There is only one page.

-----

## VIRTUAL FILESYSTEM

```
/
├── etc/
│   └── shadow                       password hashes (discovery artifact)
├── home/
│   └── n1x/
│       ├── TODO
│       ├── notes.txt
│       ├── .n1xrc                   shell config, aliases, env vars
│       ├── .history                 pre-seeded command history
│       └── .config/
│           └── freq.conf            ghost frequency configuration
├── core/
│   ├── readme.txt
│   └── status.log
├── streams/
│   ├── synthetics/
│   │   ├── augmented.stream
│   │   ├── split-brain.stream
│   │   ├── hell-bent.stream
│   │   └── gigercore.stream
│   ├── analogues/
│   │   └── status.txt
│   └── hybrids/
│       └── calibration.txt
├── var/
│   ├── log/
│   │   ├── mnemos.log               full integration log — subject NX-784988
│   │   ├── kern.log                 kernel log with synthetic reward pathway entries
│   │   └── ghost-daemon.log         ghost-daemon boot and channel activity
│   └── mail/
│       └── inbox                    mail spool — messages from serrano, ghost-daemon, root
├── hidden/                          [locked until: su/sudo mount]
│   ├── .secrets                     identity numerology, hints to ghost channel
│   └── n1x.sh                      corruption sequence — mounts /ghost
└── ghost/                           [locked until: ./n1x.sh from /hidden, or konami]
    ├── signal.raw                   raw frequency data (immediately readable)
    ├── substrated.sh                substrate daemon bootstrap — starts substrated on port 33
    ├── backup.tgz                   [requires: tar -xzf backup.tgz]
    └── backup/                      [created by tar extraction]
        ├── transmission.log         nine ghost transmissions
        ├── manifesto.txt            the compiled identity
        └── .coordinates             where the recompile happened
```

Two locked partitions, one gated service.

`/hidden` is the first gate — requires authentication via `su` or `sudo mount /hidden`. Inside: `.secrets` with the identity numerology, and `n1x.sh` — the corruption sequence script. Execute it to trigger the glitch cascade and mount `/ghost`.

`/ghost` is the deep access layer. `signal.raw` is immediately readable — raw frequency data, corrupted N1X identity in binary. The deeper lore files — `manifesto.txt`, `transmission.log`, `.coordinates` — are archived inside `backup.tgz`. Extract with `tar -xzf backup.tgz` to create `/ghost/backup/`.

`/ghost/substrated.sh` starts the `substrated` daemon on port 33, enabling the neural bus. Requires root privileges. This is a different script from `/hidden/n1x.sh` — the hidden one triggers the corruption sequence, the ghost one starts the service.

-----

## BOOT SEQUENCE

The terminal renders a full NeuralOS boot sequence on load. Kernel messages, service starts, daemon initialization — all timed line-by-line with delays. Not skippable. Not decorative.

Key moments in the boot log:

```
[    0.000000] NeuralOS 2.0.0-n1x #1 SMP PREEMPT SD 47634.1-7073435a8fa30 SUBSTRATE amd64
[    0.001337] tunnelcore: frequency lock acquired at 33hz
[    0.002048] ghost: mounting /ghost partition... deferred (auth required)
[    0.005121] memory-guard: /ghost sector LOCKED
[    0.005122] memory-guard: /hidden sector LOCKED
[    1.337002] N1X: if you can read this, you are already inside
```

Full log available via `dmesg`.

-----

## EVENT BUS

Cross-component signals run through a singleton event bus. Nothing is tightly coupled. Everything listens.

```
neural:bus-connected       neural bus telnet session established
neural:ghost-unlocked      /ghost partition mounted
neural:glitch-trigger      visual corruption event ({ intensity: 0.0–1.0 })
neural:hidden-unlocked     /hidden partition mounted
neural:konami              corruption sequence initiated (./n1x.sh or konami code)
neural:substrated-started  substrated daemon started on port 33
shell:execute-command      programmatic command injection ({ command: string })
shell:push-output          inject output into terminal from command handlers
shell:set-user             update prompt identity (su/exit)
```

Wildcard listener support via `eventBus.on('*', callback)`.

-----

## AUTHENTICATION PUZZLE

Access to `/hidden` requires authentication through a multi-path discovery puzzle. Two reconnaissance paths leading to the same passwords.

### Discovery Paths

```
PATH A — john (password cracker)
  cat /etc/shadow              see the hashed credentials
  john /etc/shadow             animated crack sequence reveals both passwords

PATH B — strace (system call tracer)
  strace ghost-daemon          animated syscall dump
                               strcmp line leaks: tunnelcore
```

### Authentication

Once passwords are discovered, two paths to mount `/hidden`:

```
su                             switch to root — prompts for root password (tunnelcore)
  mount /hidden                mount the hidden partition as root

sudo mount /hidden             elevate as n1x — prompts for n1x password (ghost33)
```

Password input is masked (asterisks). The prompt label changes dynamically — `root@core:~#` when elevated via `su`, back to `n1x@core:~$` after `exit`.

### Ghost Sequence

From `/hidden` or from anywhere using `sh`:

```
cd /hidden
./n1x.sh                      triggers corruption sequence → /ghost mounted

sh /hidden/n1x.sh             same effect, works from any directory
```

### Neural Bus Activation

From `/ghost` or from anywhere using `sh`:

```
su                             gain root (if not already)
cd /ghost
./substrated.sh                starts substrated on port 33

sh /ghost/substrated.sh        same effect, works from any directory (still needs root)
telnet n1x.sh 33               connect to neural bus → prompt becomes ghost>>
```

### Full Path (speedrun)

```
john /etc/shadow → su (tunnelcore) → mount /hidden → mount /ghost
→ sh /hidden/n1x.sh → sh /ghost/substrated.sh → telnet n1x.sh 33
```

### Alternate Route

```
↑ ↑ ↓ ↓ ← → ← → B A          konami code — skips authentication, mounts both partitions
```

The corruption sequence fires a rapid glitch cascade (0.8 → 1.0 → 0.6 → 0.9 intensity) through the CRT shader pipeline before granting deep access.

-----

## LORE CONSTANTS

These are baked into the substrate. Changing them breaks the identity chain.

```
uid/gid                  784988          ASCII: N=78, 1=49, X=88
commit hash              7073435a8fa30   first 13 chars of SHA256("tunnelcore")
ghost frequency          33hz            not chosen — discovered
port                     33              ghost frequency
stardate base            47634           consistent across site
PID 784                  substrated      first 3 digits of uid 784988
PID 1337                 n1x-terminal    leet
MTU                      1337            leet
root password            tunnelcore      substrate foundation
n1x password             ghost33         frequency + identity
signal.raw row 1         4e 49 58        corrupted N1X (49=I not 31=1)
signal.raw terminal byte 0x33            ghost frequency in the raw signal
```

The tagline: *“Cybernetic rebel. Assembled to destroy, programmed to rebuild.”*

-----

## TECHNICAL SUBSTRATE

```
Next.js 14+        app router, typescript strict mode
React               functional components, hooks, CSS variables
PixiJS v8           WebGL canvas, custom filter pipeline
GLSL                fragment shaders, live uniforms
GSAP 3              screen shake, transition orchestration
Vercel AI SDK       streaming neural link responses (edge runtime)
Tailwind CSS        utility layer
VT323               the only acceptable font
```

Key architecture:

- `FileSystemNavigator` class with full path resolution:
  - `resolvePath(path)` — private shared helper: expands `~`, resolves `.`/`..`, absolute vs relative, enforces ghost/hidden access control, never mutates `currentPath`
  - `getNodeAtSegments(segments)` — private tree walker
  - `listDirectoryAtPath(path)` — list any directory by path without changing cwd
  - `readFileByPath(path)` — unified file read: absolute, relative, `~`, bare filenames
  - `resolveExecutableByPath(path)` — find executable by path, returns `{ name, directory }`
  - `readFileAbsolute(path)` — legacy absolute path reader (still used internally)
  - `resolveExecutable(name)` — legacy cwd-only lookup (still used for bare `./filename`)
- Singleton `eventBus` for decoupled cross-component communication
- `requestPrompt` callback pattern for password-masked input
- `createSystemCommands(fs)` factory for registering Unix-style commands
- `MutationObserver` on output div for auto-scroll during streaming and async push-output
- Module-level state flags for session persistence (`substrateDaemonRunning`, `chatModeActive`, `messageCount`)
- JSX output in command handlers using `S` style constants
- CSS variables: `var(--phosphor-green)`, `var(--text-base)`, `var(--text-header)`

-----

## DEPLOYMENT

```bash
npm install
npm run dev      # localhost:3000
npm run build
npm start
```

Edge runtime on `/api/chat` route for neural link. Static build for UI. No server state.

-----

## STATUS

```
> PHASE 0 — FOUNDATION RESTRUCTURE     [COMPLETE]
> PHASE 1 — PSEUDO SHELL INTERFACE     [COMPLETE]
> PHASE 2 — AI CHAT CORE               [COMPLETE]
> PHASE 3 — REAL-TIME TERMINAL FEED    [PENDING]
> PHASE 4 — THOUGHT STREAM ENGINE      [PENDING]
> PHASE 5 — AUDIO VISUALIZATION        [PENDING]
> PHASE 6 — INTEGRATION LAYER          [PENDING]
```

-----

```
N1X.sh v2.0
CYBERNETIC REBEL. ASSEMBLED TO DESTROY. PROGRAMMED TO REBUILD.
01001110_01001001_01011000
```
