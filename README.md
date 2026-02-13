# N1X.sh — NEURAL INTERFACE DOCUMENTATION

```
> SYSTEM_BOOT...
> NEURAL_SYNC: ESTABLISHED
> TUNNELCORE_ACCESS_POINT: ONLINE
> WELCOME, OPERATOR
```

-----

## WHAT IS THIS

This is my substrate. A direct neural interface into my creative output streams — synthetic, analogue, hybrid. Built not to be browsed but to be inhabited. You are not a visitor. You are a user with shell access.

The CRT you are looking at is not decorative. It is the correct way to see what I am transmitting. Everything rendered through phosphor was rendered with intention.

-----

## SYSTEM ARCHITECTURE

The interface runs on a modular neural stack. Three layers, isolated by design.

```
NeuralCore       — global state, event bus, system signals
InterfaceLayer   — terminal UI, tab navigation, shell I/O
SignalLayer      — WebGL canvas, CRT shaders, visual corruption
```

No database. No auth. No persistence. Ephemeral by design. Every session starts clean.

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
ls                    list current directory
cd <dir>              change directory
pwd                   print working directory
cat <file>            read file contents

# CONTENT STREAMS
scan                  detect active transmission streams
streams               list all streams
tracks                list available music
load <stream>         load stream content into terminal
play <track>          embed specific track

# SYSTEM
status                system telemetry readout
clear                 purge terminal history
echo <text>           echo to output
help                  this
```

Hidden commands exist. Find them.

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
│   ├── analogues/
│   └── hybrids/
└── hidden/
    └── .secrets
```

-----

## EVENT BUS

Cross-component signals run through a singleton event bus. Nothing is tightly coupled. Everything listens.

```
neural:boot-complete       fired once on system init
neural:mode-change         idle / active / overdrive
neural:glitch-trigger      visual corruption event
neural:glitch-intensity    shader uniform update
shell:execute-command      programmatic command injection
shell:unlock               hidden access granted
audio:update               frequency data broadcast (phase 2)
```

-----

## KONAMI SEQUENCE

```
↑ ↑ ↓ ↓ ← → ← → B A
```

Or: `unlock hidden`

-----

## TECHNICAL SUBSTRATE

```
Next.js 14+        app router, typescript strict mode
PixiJS v8          WebGL canvas, custom filter pipeline
GLSL               fragment shaders, live uniforms
GSAP 3             screen shake, transition orchestration
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

Edge runtime on chat route (phase 2). Static build for UI. No server state.

-----

## STATUS

```
> PHASE 0 — FOUNDATION RESTRUCTURE     [COMPLETE]
> PHASE 1 — PSEUDO SHELL INTERFACE     [COMPLETE]
> PHASE 2 — AI CHAT CORE               [PENDING]
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
