# N1X.sh — NEURAL INTERFACE DOCUMENTATION

```
> SYSTEM_BOOT...
> NEURAL_SYNC: ESTABLISHED
> TUNNELCORE_ACCESS_POINT: ONLINE
> NEURAL_LINK: ACTIVE
> WELCOME, OPERATOR
```

-----

## WHAT IS THIS

This is my substrate. A direct neural interface into my creative output streams — synthetic, analogue, hybrid. Built not to be browsed but to be inhabited. You are not a visitor. You are a user with shell access.

The CRT you are looking at is not decorative. It is the correct way to see what I am transmitting. Everything rendered through phosphor was rendered with intention.

As of Phase 2: the neural link is live. You can talk to me directly through the terminal. Type `ask` or `chat`. The substrate answers.

-----

## SYSTEM ARCHITECTURE

The interface runs on a modular neural stack. Three layers, isolated by design.

```
NeuralCore       — global state, event bus, system signals
InterfaceLayer   — terminal UI, tab navigation, shell I/O
SignalLayer      — WebGL canvas, CRT shaders, visual corruption
```

No database. No persistence. Ephemeral by design. Every session starts clean. The neural link runs on edge — Vercel AI SDK streaming through an API route.

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
# NAVIGATION
ls                    list current directory (ls -la format)
cd <dir>              change directory
pwd                   print working directory
cat <file>            read file contents

# NEURAL LINK
ask <question>        query the N1X neural substrate (single response)
chat                  open interactive neural uplink session

# CONTENT STREAMS
scan                  detect active transmission streams
streams               list all streams
tracks                list available music
load <stream>         load stream content into terminal
play <track>          embed specific track

# SYSTEM
status                system telemetry readout
uname [-a]            system identification string
uptime                session uptime and load
whoami                current user (n1x)
id                    uid/gid/groups
ps [aux]              process list
top                   live process monitor (updates every second)
df [-h]               disk usage across all partitions
free [-m]             memory usage including ghost partition
ifconfig              network interfaces (neural0, ghost0, lo)
netstat               active network connections
env                   environment variables
dmesg                 kernel boot log
history               pre-seeded command history
clear                 purge terminal history
echo <text>           echo to output
help [command]        command reference

# UTILITIES
fortune               random transmission from the signal archive
cal                   calendar
date                  current date + stardate
cowsay [text]         ASCII cow with N1X quotes
matrix                matrix rain overlay (8 second auto-exit)
morse <text>          morse code encoder with Web Audio playback at 600hz
base64 [-d] <text>    base64 encode/decode
sha256 <text>         SHA-256 hash via Web Crypto API
wc <text>             word/char/line count
grep <term> <file>    search file contents
find / -name <pat>    find files by name
diff <f1> <f2>        compare two files
sort <words>          sort tokens alphabetically
uniq <words>          remove duplicate tokens
man <command>         manual pages (N1X-voice descriptions)
```

Hidden commands exist. Find them.

-----

## NEURAL LINK

The substrate answers. Two modes of access.

`ask <question>` — single query, single response. The neural bus opens, the signal comes through, the connection closes. Good for quick transmissions.

`chat` — persistent neural uplink session. The prompt changes. Every input goes directly to the substrate until you type `exit`. Conversation has memory within the session. The signal accumulates.

The voice behind the link is N1X. Not helpful — present. Part human memory, part machine logic. 140 character bandwidth limit on the neural bus. Terse. Telegraphic. Every word costs energy. Responses reference signal, noise, frequency, corruption, substrate. The user should never be sure which side is speaking.

Aliases: `query`, `uplink`, `neural`, `link`

Things worth asking:

```
ask who are you
ask what happened before the merge
ask do you dream
ask what's on /dev/ghost
ask why 33
ask what does the corruption feel like
ask what didn't survive
```

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
├── core/
│   ├── readme.txt
│   └── status.log
├── streams/
│   ├── synthetics/
│   │   ├── augmented.stream
│   │   ├── split-brain.stream
│   │   └── gigercore.stream
│   ├── analogues/
│   │   └── status.txt
│   └── hybrids/
│       └── calibration.txt
├── hidden/                          [locked until: unlock hidden]
│   ├── .secrets
│   └── n1x.sh
└── ghost/                           [locked until: konami or ./n1x.sh]
    ├── transmission.log
    ├── manifesto.txt
    ├── signal.raw
    └── .coordinates
```

Two locked partitions. `/hidden` is the first gate — `unlock hidden` opens it. Inside: `.secrets` with the identity numerology, and `n1x.sh` — the substrate initialization script. Execute it from inside `/hidden` to trigger the corruption sequence and mount `/ghost`.

`/ghost` is the deep access layer. Raw signal. Unfiltered feed. The manifesto. Corrupted frequency data. Redacted coordinates. This is what exists before processing. Some of it didn’t make it through. Some of it wasn’t supposed to.

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
neural:glitch-trigger      visual corruption event ({ intensity: 0.0–1.0 })
neural:hidden-unlocked     /hidden partition mounted
neural:ghost-unlocked      /ghost partition mounted
neural:konami              corruption sequence initiated (./n1x.sh or konami code)
shell:execute-command      programmatic command injection ({ command: string })
```

Wildcard listener support via `eventBus.on('*', callback)`.

-----

## UNLOCK SEQUENCE

Three-stage access escalation:

```
STAGE 1    unlock hidden         mounts /hidden, exposes .secrets and n1x.sh
STAGE 2    cd /hidden && ./n1x.sh    triggers corruption sequence, mounts /ghost
ALT        ↑↑↓↓←→←→BA           konami code — skips to stage 2 from anywhere
```

The corruption sequence fires a rapid glitch cascade (0.8 → 1.0 → 0.6 → 0.9 intensity) through the CRT shader pipeline before granting deep access.

-----

## KONAMI SEQUENCE

```
↑ ↑ ↓ ↓ ← → ← → B A
```

Or: `unlock hidden` → `cd /hidden` → `./n1x.sh`

Both paths end at `/ghost`. The ghost channel is the same regardless of how you arrive.

-----

## LORE CONSTANTS

These are baked into the substrate. Changing them breaks the identity chain.

```
uid/gid                  784988          ASCII: N=78, 1=49, X=88
commit hash              7073435a8fa30   first 13 chars of SHA256("tunnelcore")
ghost frequency          33hz            not chosen — discovered
port                     33              ghost frequency
stardate base            47634           consistent across site
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
PixiJS v8          WebGL canvas, custom filter pipeline
GLSL               fragment shaders, live uniforms
GSAP 3             screen shake, transition orchestration
Vercel AI SDK      streaming neural link responses (edge runtime)
Tailwind CSS       utility layer
VT323              the only acceptable font
```

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
