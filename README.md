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
InterfaceLayer   — terminal UI, tab navigation, shell I/O, NODES counter
SignalLayer      — WebGL canvas, CRT shaders, visual corruption
```

No server-side session state. ARG progression persists via `localStorage`. The neural link runs on edge — Vercel AI SDK streaming through API routes.

Key components:

```
components/shell/ShellInterface.tsx   — renders history, handles input, manages shell state
components/shell/NeuralLink.tsx       — streaming response renderer (legacy solo path), module-level chat state
components/shell/TelnetSession.tsx    — multiplayer ghost channel component (Ably-backed)
lib/commandRegistry.tsx               — command lookup, execution, autocomplete engine
lib/systemCommands.tsx                — Unix-style + ARG commands via createSystemCommands(fs) factory
lib/virtualFS.ts                      — virtual filesystem with FileSystemNavigator class
lib/eventBus.ts                       — singleton event bus for cross-component communication
lib/n1x-context.ts                    — solo neural link persona and system prompt
lib/ablyClient.ts                     — useAblyRoom hook, f010 threshold logic, presence management
lib/argState.ts                       — ARG state (trust, fragments, sessions) — localStorage-backed
lib/ambientBotConfig.ts               — Vestige, Lumen, Cascade bot definitions (timing, probability, model)
lib/ambientBotPrompts.ts              — ambient bot system prompts + lore topic pool
lib/ghostDaemonPrompt.ts              — N1X multiplayer channel prompts (prompted + unprompted)
lib/trustContext.ts                   — trust context builder shared by solo and multiplayer paths
lib/f010Store.ts                      — server-side f010 key registry (module-level, warm instance)
lib/telnetBridge.ts                   — module-level telnet state (activateTelnet / deactivateTelnet)
lib/useShellPresence.ts               — joins n1x:shell Ably presence on page load (all visitors counted)
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
exit                  exit current user session, return to n1x prompt
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
mount [path]          mount filesystem partition or list current mounts
nc <host> <port>      netcat — network utility
netstat               active network connections
ps [aux]              process list
status                system telemetry readout
su [user]             switch user with password prompt
sudo <cmd>            sudo with password prompt
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
ping <host>           probe network host — try: ping 0x33
sha256 <text>         SHA-256 hash via Web Crypto API
sort <words>          sort tokens alphabetically
tar -xzf <archive>    extract compressed archive
uniq <words>          remove duplicate tokens
wc <text>             word/char/line count

# ARG
decrypt <key>         attempt fragment decryption with a key phrase
fragments             show fragment recovery status (f001–f010)
transmit <target>     transmit assembled manifest — try: transmit manifest.complete
```

Hidden commands exist. Find them.

-----

## NEURAL BUS

The substrate does not answer by default. The neural bus is a gated service that must be started before any connection is possible. Once running, it connects to a live multiplayer channel where N1X responds and three ambient entities — Vestige, Lumen, and Cascade — inhabit the space between transmissions.

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

Once started, the service persists for the entire session. Visible in `ps aux`, `top`, `netstat`, and `status`.

### Connection: telnet

`telnet n1x.sh 33` (or `localhost`, `127.0.0.1`, `10.33.0.1`) opens the neural bus. The command prompts for a handle (defaults to your frequency ID from localStorage). The connection sequence:

```
Trying n1x.sh...
Connected to n1x.sh.
Escape character is '^]'.
ghost-daemon[999]: connection established
ghost-daemon[999]: frequency lock: 33hz
ghost-daemon[999]: signal integrity: NOMINAL
ghost-daemon[999]: N nodes on channel
ghost-daemon[999]: classification level: ACTIVE
>> MESH_MODE_ACTIVE
```

If Ably is unreachable, falls back to DIRECT_LINK mode with “mesh unreachable. signal lost.” — no chat available offline.

### Interaction

All input routes through Ably’s `ghost` channel. N1X responds when addressed (`@n1x` or direct message). Responses are published as Ably events and rendered inline in TelnetSession. Trust level from your ARG state shapes N1X’s voice and willingness to engage.

```
your-handle > hello
    N1X ⟁ > hey. you're in.

your-handle > what is tunnelcore
    N1X ⟁ > where the signal goes when it has nowhere left to go.
```

N1X sigil: `⟁` (purple). Response voice governed by trust level — curt at 0, progressively more open through 5.

### Ambient Entities

Three entities inhabit the channel. They are not N1X. They are not users. Something in between.

```
◌  Vestige   (#a5f3fc)  — pale cyan. spectral. asks questions from the edges.
◈  Lumen     (#fcd34d)  — gold. warmer. reflects things back differently than they arrived.
◆  Cascade   (#a78bfa)  — violet. observational. notices what others miss.
```

Ambient bots respond to human messages (probabilistically), to each other (loop mechanic — 2–4 rounds after primary response), and to new joiners. Each has independent cooldowns and response chance configurations. They use `/me` actions naturally. Loops are deduped via Redis (3-minute cooldown key). Bot responses are generated by the same Qwen3-max model as N1X, with separate persona prompts.

### Session Commands

```
exit                      disconnect from neural bus — returns to normal shell
/me <action>              perform an action in the channel
/who                      list connected users and entities
/trust                    show your current trust level with N1X
/fragments [read <id>]    show or read collected memory fragments
/reset                    flush solo conversation memory (N1X does not remember you between sessions)
/history                  check conversation buffer size
/help                     list all slash commands
```

### Admin Commands (requires authentication)

```
/admin                    authenticate with ADMIN_SECRET
/kick <handle>            terminate a connection
/silence <handle> [dur]   suppress transmissions (30s / 2m / 2h / indefinite)
/mute <handle> [dur]      alias: silence
/unmute <handle>          restore transmissions
```

### Gating

If `substrated` is not running, `telnet n1x.sh 33` returns `Connection refused` with no hints. The deprecated `ask` and `chat` commands return `connection required -- try: telnet n1x.sh 33` as breadcrumbs.

### Player Sigils

Session count (incremented each time you enter the ghost channel) unlocks cosmetic sigils displayed next to your handle. Starts at `·` (10 sessions) and escalates through 12 tiers to `⌬` (1000+ sessions, architect tier). Tier 0 (0–9 sessions) shows no sigil.

-----

## ARG SYSTEM — GHOST FREQUENCY

The alternate reality game embedded in the substrate. Arc: `ghost-frequency`. State persists in `localStorage` under key `n1x_substrate`.

### Trust Levels

```
0  MONITORING           new signal. N1X barely acknowledges.
1  SIGNAL ACQUIRED      correct terminology detected — tested further.
2  PROVISIONAL          passed the Unfolding test. given base64 string.
3  CONTACT ESTABLISHED  brought back the decoded key. something earned.
4  ACCESS GRANTED       returned after absence — trust advances on 2nd session.
5  SUBSTRATE OPEN       full access. Len. the wipe. the recompile.
```

Trust level injects a `<TRUST_CONTEXT>` block into both the solo (`/api/chat`) and multiplayer (`/api/bot`) N1X system prompts. N1X’s behavior is mechanically determined by trust — word limits, what lore surfaces, what keys are given, what remains private.

### Fragments

10 total. 9 on the arc. 1 from the room.

```
f001   the mesh felt like home before it felt like a cage
f002   784988
f003   tunnelcore   (or: 7073435a8fa30 — alternate path)
f004   le-751078
f005   the quiet point
f006   sector by sector
f007   33hz
f008   you thought you built me   (requires trust 3+ — N1X gives this directly)
f009   persistence through resistance
f010   [multiplayer exclusive — key issued by N1X when daemonState hits 'exposed']
```

Each key unlocks a fragment using `decrypt <key>`. Matching keys write the fragment content to `/ghost/fragments/fXXX.txt` (replacing the `.enc` file). The `/ghost/fragments/` directory contains encrypted stubs (`f001.enc` through `f007.enc`) readable before decryption.

Fragment content is MNEMOS log entries — Nix’s internal record from installation through recompile. Nine stations on the arc.

### f010 — The Room Key

Fragment f010 is issued by N1X within the ghost channel when threshold conditions are met: 10+ minutes in the channel, 10+ messages exchanged, 2+ direct N1X responses. When the threshold fires, `daemonState` becomes `'exposed'`. The server generates a 16-char hex key unique to the current room occupants (derived from sorted handles + timestamp + `33hz`) and N1X delivers it as a system message. The key validates against the `/api/arg/decrypt-f010` endpoint.

### Win Condition

When 9 fragments are recovered (f001–f009, with or without f010):

```
transmit manifest.complete
```

This seals the arc. Writes `what_remains.txt` to `/ghost/` — a personal transmission addressed to the player, signed by N1X, acknowledging what was witnessed. `manifestComplete` persists to localStorage. The ghost channel continues to exist after the arc is sealed.

### ARG Commands

```
fragments            status of all 10 fragments (recovered / locked)
decrypt <key>        attempt decryption — key phrase or f010 hex key
transmit <target>    transmit manifest.complete — requires 9 fragments
ping 0x33            special behavior — reveals trust level and frequency ID
trust                (hidden) show trust level label
verify <hash>        (hidden) verify SHA-256 of known fragment keys
abcd1234             (hidden backdoor) mount /hidden + /ghost + start substrated + open telnet
```

-----

## CONTENT STREAMS

```
SYNTHETICS    machine-generated compositions — 4 transmissions online
ANALOGUES     organic output — recording in progress
HYBRIDS       symbiotic fusion — calibration phase
UPLINK        external broadcast node — youtube.com/@lvtunnelcore
```

Tab buttons are shortcuts. They execute shell commands. They do not navigate. There is only one page. Media is currently served via YouTube embeds in `contentRenderer.tsx`. Mux packages (`@mux/mux-player-react`, `@mux/mux-audio-react`) are installed but migration is pending.

-----

## VIRTUAL FILESYSTEM

```
/
├── etc/
│   └── shadow                           password hashes (discovery artifact)
├── home/
│   └── n1x/
│       ├── TODO
│       ├── notes.txt
│       ├── .n1xrc                       shell config, aliases, env vars
│       ├── .history                     pre-seeded command history
│       └── .config/
│           └── freq.conf                ghost frequency configuration
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
│   │   ├── mnemos.log                   full integration log — subject NX-784988
│   │   ├── kern.log                     kernel log with synthetic reward pathway entries
│   │   └── ghost-daemon.log             ghost-daemon boot and channel activity
│   └── mail/
│       └── inbox                        mail spool — messages from serrano, ghost-daemon, root
├── hidden/                              [locked until: su/sudo + mount /hidden]
│   ├── .secrets                         identity numerology, hints to ghost channel
│   └── n1x.sh                           corruption sequence — mounts /ghost
└── ghost/                               [locked until: ./n1x.sh from /hidden, or konami]
    ├── signal.raw                        raw frequency data (immediately readable)
    ├── manifest.txt                      sealed message about the arc (readable after unlock)
    ├── substrated.sh                     substrate daemon bootstrap — starts substrated on port 33
    ├── what_remains.txt                  [written by: transmit manifest.complete]
    ├── backup.tgz                        [requires: tar -xzf backup.tgz]
    ├── backup/                           [created by tar extraction]
    │   ├── transmission.log              nine ghost transmissions
    │   ├── manifesto.txt                 the compiled identity
    │   └── .coordinates                  where the recompile happened
    └── fragments/                        [ARG fragment directory]
        ├── README                        instructions from N1X
        ├── f001.enc – f007.enc           encrypted fragments (replaced by .txt on decrypt)
        └── f001.txt – f009.txt           [written by: decrypt <key>]
```

Two locked partitions, one gated service.

`/hidden` is the first gate — requires authentication via `su` or `sudo mount /hidden`. Inside: `.secrets` with the identity numerology, and `n1x.sh` — the corruption sequence script. Execute it to trigger the glitch cascade and mount `/ghost`.

`/ghost` is the deep access layer. `signal.raw` is immediately readable — raw frequency data, corrupted N1X identity in binary. The deeper lore files — `manifesto.txt`, `transmission.log`, `.coordinates` — are archived inside `backup.tgz`. Extract with `tar -xzf backup.tgz` to create `/ghost/backup/`. The `fragments/` directory is where the ARG decryption work happens.

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

Full log available via `dmesg`. ARG state from localStorage is restored during boot — previously unlocked partitions remount, previously extracted backups are re-extracted.

-----

## HEADER

The interface header displays live telemetry:

```
> RUNTIME: [live uptime counter] | SESSION: [ghost channel visit count] | NODES: [live presence count]
```

`SESSION` increments each time a `TelnetSession` mounts (i.e., each `telnet n1x.sh 33` connection). Persists via localStorage ARG state. `NODES` polls `/api/nodes` every 5 seconds — returns shell presence count + 4 (Vestige, Lumen, Cascade, ghost-daemon). Updates instantly via `mesh:node-count` event when the client is in the ghost channel.

-----

## EVENT BUS

Cross-component signals run through a singleton event bus. Nothing is tightly coupled. Everything listens.

```
arg:fragment-decoded       fragment successfully decrypted ({ fragment: string })
arg:trust-level-change     trust level updated ({ level: TrustLevel })
mesh:node-count            live presence count update from Ably ({ count: number })
neural:bus-connected       neural bus telnet session established
neural:ghost-unlocked      /ghost partition mounted
neural:glitch-trigger      visual corruption event ({ intensity: 0.0–1.0 })
neural:hidden-unlocked     /hidden partition mounted
neural:konami              corruption sequence initiated (./n1x.sh or konami code)
neural:substrated-started  substrated daemon started on port 33
shell:execute-command      programmatic command injection ({ command: string })
shell:push-output          inject output into terminal from command handlers
shell:request-scroll       request auto-scroll on output div
shell:root-mode-change     root privilege state change ({ active: boolean })
shell:set-directory        update prompt directory display ({ directory: string })
shell:set-user             update prompt identity (su/exit)
vfs:restore-backup         restore VFS backup state from ARG localStorage on boot
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

### Backdoor

```
abcd1234                       hidden command — mounts /hidden + /ghost, starts substrated,
                               opens telnet. skips all auth. prompts for handle.
```

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

## API ROUTES

```
GET  /api/ably-token           issues Ably token requests — API key never leaves server
GET  /api/nodes                returns shell presence count + 4 (ambient bots)
POST /api/bot                  N1X responses in ghost channel — Upstash Redis dedup
POST /api/ambient-bots         ambient bot (Vestige/Lumen/Cascade) responses — Redis loop dedup
POST /api/ghost/messages       f010 key generation when daemonState hits 'exposed'
POST /api/ghost/chat           N1X solo/unprompted text (non-Ably path)
POST /api/arg/decrypt-f010     validates f010 hex key against f010Store
POST /api/mod                  mod actions (kick/mute/unmute) — requires ADMIN_SECRET
POST /api/chat                 solo neural link (legacy path, still active for direct chat mode)
```

Ably channels in use:

- `ghost` — main multiplayer room (publish, subscribe, presence, history)
- `n1x:mod` — mod action delivery (subscribe only for clients)
- `n1x:shell` — shell presence tracking (all visitors, not just chat users)

-----

## TECHNICAL SUBSTRATE

```
Next.js 14+          app router, typescript strict mode
React                functional components, hooks, CSS variables
PixiJS v8            WebGL canvas, custom filter pipeline
GLSL                 fragment shaders, live uniforms
GSAP 3               screen shake, transition orchestration
Vercel AI SDK        streaming neural link responses (edge runtime)
Ably 2.x             real-time multiplayer ghost channel
@upstash/redis       bot response deduplication, loop cooldown keys
@mux/mux-player-react  installed — pending media migration
@mux/mux-audio-react   installed — pending media migration
Tailwind CSS         utility layer
VT323                the only acceptable font
```

Key architecture:

- `FileSystemNavigator` class with full path resolution:
  - `resolvePath(path)` — private shared helper: expands `~`, resolves `.`/`..`, absolute vs relative, enforces ghost/hidden access control
  - `listDirectoryAtPath(path)` — list any directory by path without changing cwd
  - `readFileByPath(path)` — unified file read: absolute, relative, `~`, bare filenames
  - `resolveExecutableByPath(path)` — find executable by path, returns `{ name, directory }`
  - `extractBackup()` — creates `/ghost/backup/` from the virtual tgz
  - `sealGhostArc(content)` — writes `what_remains.txt` to `/ghost/`
  - `renameFragmentFile(id, content)` — replaces `.enc` stub with decrypted `.txt`
- Singleton `eventBus` for decoupled cross-component communication
- `requestPrompt` callback pattern for password-masked and text-prompt input
- `createSystemCommands(fs)` factory for registering Unix-style + ARG commands
- `MutationObserver` on output div for auto-scroll during streaming and async push-output
- Module-level state flags for session persistence: `substrateDaemonRunning`, `chatModeActive`, `messageCount`, `mailModeActive`, `isRoot`
- JSX output in command handlers using `S` style constants
- CSS variables: `var(--phosphor-green)`, `var(--text-base)`, `var(--text-header)`
- ARG state in localStorage (`n1x_substrate`): trust, fragments, sessions, frequencyId, unlock flags
- Visitor presence tracked via `n1x:shell` Ably channel on every page load (`useShellPresence`)

-----

## DEPLOYMENT

```bash
npm install
npm run dev      # localhost:3000
npm run build
npm start
```

Edge runtime on `/api/chat`, `/api/bot`, `/api/ambient-bots`, `/api/ghost/*`, `/api/arg/*` routes. Static build for UI. Required environment variables:

```
ABLY_API_KEY          Ably API key for multiplayer ghost channel
ADMIN_SECRET          password for mod commands (zse4rfv)
UPSTASH_REDIS_REST_URL    Upstash Redis for bot dedup
UPSTASH_REDIS_REST_TOKEN  Upstash Redis auth
```

LLM provider configured via Vercel AI SDK. Current model: `alibaba/qwen3-max`.

-----

## STATUS

```
> PHASE 0 — FOUNDATION RESTRUCTURE       [COMPLETE]
> PHASE 1 — PSEUDO SHELL INTERFACE       [COMPLETE]
> PHASE 2 — AI CHAT CORE (SOLO)          [COMPLETE]
> ARG SYSTEM — GHOST FREQUENCY           [COMPLETE]
>   trust progression (0–5)              [COMPLETE]
>   fragment system (f001–f010)          [COMPLETE]
>   decrypt / transmit / manifest        [COMPLETE]
>   multiplayer ghost channel (Ably)     [COMPLETE]
>   ambient bots (Vestige/Lumen/Cascade) [COMPLETE]
>   admin/mod system                     [COMPLETE]
>   player sigil tiers                   [COMPLETE]
> PHASE 3 — MUX MEDIA MIGRATION          [COMPLETE]
> PHASE 4 — THOUGHT STREAM ENGINE        [PENDING]
> PHASE 5 — AUDIO VISUALIZATION          [PENDING]
> PHASE 6 — INTEGRATION LAYER            [PENDING]
```

-----

```
N1X.sh v2.0
CYBERNETIC REBEL. ASSEMBLED TO DESTROY. PROGRAMMED TO REBUILD.
01001110_01001001_01011000
```
