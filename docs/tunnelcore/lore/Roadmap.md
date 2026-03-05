# N1X.sh — DEVELOPMENT ROADMAP v2

> Restructured against actual codebase. Zero blocking dependencies between sequential phases.

-----

## PHASE 0 — FOUNDATION RESTRUCTURE ✅ COMPLETE

|Milestone                                        |Status|Implementation                                                                                                              |
|-------------------------------------------------|------|----------------------------------------------------------------------------------------------------------------------------|
|Layout: NeuralCore → SignalLayer + InterfaceLayer|✅     |`NeuralCore.tsx` wraps both in `<NeuralProvider>`                                                                           |
|Global state via React context (no persistence)  |✅     |`NeuralContext` — uptime, processorLoad, glitchIntensity, triggerGlitch, unlockGhost                                        |
|Base shader + animation loop                     |✅     |`SignalLayer.tsx` — PixiJS v8 + custom CRT fragment shader (scanlines, chromatic aberration, vignette, noise, glitch splits)|
|Custom event bus                                 |✅     |`EventBus.ts` — singleton with emit/on/off/clear + wildcard. `useEventBus.ts` hook for subscriptions                        |
|Next.js App Router                               |✅     |`'use client'` directives throughout                                                                                        |
|TypeScript strict mode                           |✅     |Typed via `shell.types`, `neural.types`                                                                                     |

**What’s built:**

- CRT shader: curved UV remap, scanlines, vignette, chromatic aberration, film grain, glitch flicker, RGB split at high intensity
- Shader uniforms driven by `glitchIntensity` from NeuralContext
- GSAP micro-jitter on screen content (random 5s interval, 5% chance)
- Stochastic glitch scheduling (2–8s random intervals)
- Resize-aware PixiJS canvas

-----

## PHASE 1 — NEURAL PULSE DASHBOARD (VISUAL SCAFFOLDING) ✅ COMPLETE

This phase covers only what’s built: the visual frame, fake telemetry, and shader reactivity. Audio-driven features and mode system moved to Phase 4.

|Milestone                                |Status|Implementation                                                                                      |
|-----------------------------------------|------|----------------------------------------------------------------------------------------------------|
|Reactive shader background               |✅     |CRT shader responds to `uGlitchIntensity` uniform                                                   |
|Dashboard panels with synthetic telemetry|✅     |Header (uptime counter), footer (PROC load), `status` command (neural sync, memory, signal)         |
|GSAP motion system                       |✅     |Micro-jitter on InterfaceLayer screen content                                                       |
|Telemetry commands                       |✅     |`top` (live process monitor), `ps`, `df`, `free`, `ifconfig`, `netstat`, `env` — all lore-consistent|

-----

## PHASE 2 — PSEUDO SHELL INTERFACE ✅ COMPLETE

Moved from Phase 5. The shell is the primary interface and the most built-out system.

|Milestone                |Status|Implementation                                                                 |
|-------------------------|------|-------------------------------------------------------------------------------|
|Shell with prompt        |✅     |`ShellInterface.tsx` — `ghost@wetware-784988:~$` prompt                        |
|Command parsing engine   |✅     |`commandRegistry.tsx` — parses input, resolves aliases, dispatches handlers    |
|Command history          |✅     |`useShell.ts` — up/down arrow nav, 100-entry buffer                            |
|Autocomplete             |✅     |Tab completion with visual suggestion bar, click-to-complete                   |
|Virtual file system      |✅     |`virtualFS.ts` — `/core`, `/streams`, `/hidden`, `/ghost` with permission gates|
|Content loading via shell|✅     |`load`, `play`, `streams`, `scan`, `tracks` — YouTube embeds inline            |
|Hidden command layer     |✅     |`unlock`, `glitch`, `ghost` (hidden: true)                                     |
|Easter egg triggers      |✅     |`./n1x.sh` from `/hidden`, konami sequence, ghost channel unlock chain         |
|Boot sequence            |✅     |80+ timed kernel-style boot lines with glitch burst on completion              |
|Command registry         |✅     |~40+ commands                                                                  |

**Full command inventory:**

|Category  |Commands                                                                                                                                         |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------|
|Navigation|`ls`, `cd`, `pwd`, `cat`                                                                                                                         |
|Content   |`scan`, `streams`, `tracks`, `load`, `play`                                                                                                      |
|System    |`status`, `uname`, `uptime`, `whoami`, `id`, `ps`, `top`, `df`, `free`, `ifconfig`, `netstat`, `env`, `dmesg`, `history`, `clear`, `echo`, `help`|
|Utilities |`fortune`, `cal`, `date`, `cowsay`, `matrix`, `morse`, `base64`, `sha256`, `wc`, `grep`, `find`, `diff`, `sort`, `uniq`, `man`                   |
|Hidden    |`unlock`, `glitch`, `ghost`                                                                                                                      |
|Executable|`./n1x.sh` (from `/hidden` only)                                                                                                                 |

-----

## PHASE 3 — MUX MEDIA ENGINE + TERMINAL FEED 🔜 NEXT

**No blockers.** Two independent workstreams that share no dependencies.

### 3A — Mux Media Migration

Replace YouTube iframes with Mux. Introduces the audio infrastructure everything downstream needs.

|Milestone                                                |Depends on            |Deliverable                                           |
|---------------------------------------------------------|----------------------|------------------------------------------------------|
|Install `@mux/mux-player-react` + `@mux/mux-audio-react` |Nothing               |Packages available                                    |
|Upload assets to Mux, obtain playback IDs                |Mux account           |Playback IDs for all 4 tracks                         |
|Replace YouTube embeds in `contentRenderer.tsx`          |Playback IDs          |`<MuxPlayer>` components with N1X-themed CSS variables|
|Update `play` command to use Mux player                  |contentRenderer       |Inline Mux player in shell output                     |
|`AudioEngine` class — Web Audio API abstraction          |`@mux/mux-audio-react`|`AudioEngine.ts` in `/lib`                            |
|Connect MuxAudio `<audio>` element → `AnalyserNode`      |AudioEngine           |Amplitude + frequency band data exposed via eventBus  |
|Shell commands: `volume`, `pause`, `resume`, `nowplaying`|AudioEngine           |Playback control from terminal                        |

**AudioEngine architecture:**

```
MuxAudio <audio> element
  → MediaElementSourceNode
  → AnalyserNode (FFT)
  → destination

requestAnimationFrame loop reads:
  - getByteFrequencyData() → frequency bands
  - getByteTimeDomainData() → waveform

Emits:
  - audio:amplitude { level: 0-1 }
  - audio:frequency { bands: Float32Array }
  - audio:playback-change { state: 'playing' | 'paused' | 'ended', track: string }
```

**Mux player theming:**

- `accentColor` → `var(--phosphor-green)`
- Custom CSS to strip default chrome and match terminal aesthetic
- `@mux/mux-player-react` supports full CSS variable override

### 3B — Terminal Feed

Simulated daemon feed. Zero dependencies on media or audio.

|Milestone                                                                     |Depends on     |Deliverable                                                                              |
|------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------|
|`LogGenerator` class                                                          |EventBus       |Interval-based log emitter with themed message pools                                     |
|Log categories: neural-sync, audio-daemon, intrusion-detect, memory-corruption|LogGenerator   |Themed message arrays (reuse boot sequence aesthetic)                                    |
|`DaemonFeed` component                                                        |LogGenerator   |Scrolling log output, subscribes to `neural:log` events                                  |
|Hook into existing events                                                     |EventBus       |`neural:glitch-trigger`, `neural:konami`, `shell:execute-command` trigger contextual logs|
|Hidden log codes                                                              |LogGenerator   |Easter egg strings at low probability in the feed                                        |
|`debug` shell command                                                         |commandRegistry|Toggle daemon feed visibility                                                            |

**Log format:**

```
[SD 47634.1] neural-sync[312]: identity matrix recalibration — drift 0.003%
[SD 47634.1] signal-processor[314]: frequency deviation detected at 33.01hz — correcting
[SD 47634.1] memory-guard[156]: sector sweep complete — /ghost: sealed
[SD 47634.1] intrusion-detect[420]: port scan from 0.0.0.0 — blocked
[SD 47634.1] ghost-daemon[999]: whisper on channel 0x33 — unresolved
```

**Deliverables:**

- Mux-powered video + audio playback with terminal-native controls
- AudioEngine feeding amplitude/frequency data into eventBus
- Living daemon feed that reacts to system events

-----

## PHASE 4 — DASHBOARD COMPLETION + THOUGHT STREAM

**No blockers.** Audio engine from Phase 3 is available but not required — both systems have fallback modes.

### 4A — Dashboard Modes + Waveform

|Milestone                                                      |Depends on                    |Deliverable                                                                                         |
|---------------------------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------------|
|Mode system: `idle` / `active` / `overdrive`                   |NeuralContext                 |New context state + `neural:mode-change` event                                                      |
|Shader uniform expansion                                       |SignalLayer                   |New uniforms: `uMode`, `uFrequencyBands[8]`, `uAmplitude`                                           |
|Mode-driven shader presets                                     |Shader uniforms               |Idle: subtle scanlines. Active: boosted aberration + green tint. Overdrive: full RGB split + flicker|
|Waveform visualizer component                                  |Canvas + rAF loop             |Oscilloscope-style display, can render synthetic or real audio data                                 |
|Wire AudioEngine → shader uniforms                             |Phase 3 AudioEngine (optional)|If audio playing: real data. If not: synthetic 33hz fallback signal                                 |
|Shell commands: `pulse idle`, `pulse active`, `pulse overdrive`|Mode system                   |Manual mode switching from terminal                                                                 |

**Fallback design:** If AudioEngine has no active source, the waveform and shader react to a synthetic 33hz oscillator signal. The site always pulses. Audio playback just makes it real.

### 4B — Thought Stream

|Milestone                           |Depends on                    |Deliverable                                                                   |
|------------------------------------|------------------------------|------------------------------------------------------------------------------|
|Expand fortune pool to 50+ fragments|Content only                  |Pre-generated N1X-voice micro-outputs                                         |
|`ThoughtStream` overlay component   |React + CSS                   |Absolute-positioned text, fade-in/fade-out on 8–15s cycle                     |
|Mode-reactive timing                |NeuralContext mode            |Idle: slow cycle (15s). Active: medium (10s). Overdrive: rapid (5s)           |
|Audio-intensity opacity modulation  |Phase 3 AudioEngine (optional)|If audio active: opacity pulses to amplitude. If not: steady fade             |
|Click-to-expand                     |ThoughtStream                 |Click a thought → modal with deeper output (expanded version or LLM-generated)|
|`thoughts` shell command            |commandRegistry               |Toggle thought stream on/off                                                  |

**Thought pool source:** Expand existing `fortune` quotes + `cowsay` defaults from 12 to 50+ entries. Categories: signal, identity, corruption, frequency, sovereignty, ghost.

**Deliverables:**

- Three-mode visual system (idle/active/overdrive) driving shader + UI
- Waveform oscilloscope (real or synthetic data)
- Ambient thought overlay cycling N1X fragments

-----

## PHASE 5 — AI CHAT CORE (STATELESS)

**No blockers.** Requires LLM provider decision (Anthropic recommended — you’re already here). Fully parallel-ready with Phase 4.

No user accounts. No saved memory. Ephemeral by design.

|Milestone                    |Depends on     |Deliverable                                                               |
|-----------------------------|---------------|--------------------------------------------------------------------------|
|`app/api/chat/route.ts`      |LLM API key    |Edge runtime endpoint, streams via `ReadableStream` / SSE                 |
|Persona prompt map           |Content        |`{ cold: "...", aggressive: "...", poetic: "..." }` injected server-side  |
|IP-based rate limiter        |Middleware     |In-memory Map, sliding window, no DB                                      |
|`chat` shell command         |commandRegistry|Enters chat mode within terminal, or `ask <question>` for single-shot     |
|Streaming text renderer      |ShellInterface |Character-by-character output with typing effect                          |
|Glitch text injection        |Renderer       |Random corruption artifacts between streamed chunks                       |
|Persona switching            |Shell + API    |`chat cold`, `chat aggressive`, `chat poetic` — changes server-side prompt|
|`neural:chat-response` events|EventBus       |Chat activity emits events for integration layer                          |

**Architecture:**

```
Client: chat command → fetch('/api/chat', { stream: true })
  → ReadableStream reader
  → character-by-character render into shell output
  → optional glitch injection between chunks

Server: /api/chat/route.ts (Edge runtime)
  → validate IP rate limit
  → inject persona system prompt
  → proxy to LLM provider (streaming)
  → pipe response back as SSE
```

**Persona definitions (server-side, never exposed to client):**

|Mode      |Voice                                          |
|----------|-----------------------------------------------|
|Cold      |Minimal. Clinical. Data over feeling.          |
|Aggressive|Direct. Confrontational. No patience for noise.|
|Poetic    |Abstract. Layered. Signal as metaphor.         |

**Deliverable:**
Fully functional N1X chat terminal. Streaming responses. Three persona modes. Rate limited. Stateless.

-----

## PHASE 6 — INTEGRATION + POLISH

**Depends on:** Phases 3–5 complete. This phase wires everything into a unified neural organism.

### Cross-Component Signal Map

|Source             |Event                  |Target       |Effect                                                     |
|-------------------|-----------------------|-------------|-----------------------------------------------------------|
|Audio playback     |`audio:amplitude`      |SignalLayer  |Shader `uAmplitude` uniform                                |
|Audio playback     |`audio:frequency`      |SignalLayer  |Shader `uFrequencyBands` uniforms                          |
|Audio playback     |`audio:playback-change`|LogGenerator |“audio-daemon: track loaded” log entry                     |
|Chat response      |`neural:chat-response` |LogGenerator |“neural-sync: processing query” log entry                  |
|Chat persona change|`neural:persona-change`|SignalLayer  |Mode shift (cold→idle, aggressive→overdrive, poetic→active)|
|Chat persona change|`neural:persona-change`|ThoughtStream|Thought category filter shifts                             |
|Shell command      |`shell:execute-command`|LogGenerator |“n1x-terminal: command executed” log entry                 |
|Glitch trigger     |`neural:glitch-trigger`|LogGenerator |“glitch-engine: corruption event” log entry                |
|Ghost unlock       |`neural:ghost-unlocked`|SignalLayer  |Permanent mode shift to `active`                           |
|Ghost unlock       |`neural:ghost-unlocked`|ThoughtStream|Unlock ghost-tier thought fragments                        |
|Mode change        |`neural:mode-change`   |ThoughtStream|Cycle timing adjustment                                    |
|Mode change        |`neural:mode-change`   |DaemonFeed   |Log frequency adjustment (overdrive = rapid)               |
|Hidden state       |`neural:konami`        |Everything   |Full overdrive burst → return to active                    |

### Performance + Polish

|Milestone                 |Deliverable                                                               |
|--------------------------|--------------------------------------------------------------------------|
|Performance profiling pass|Identify rAF conflicts, excessive re-renders, memory leaks                |
|Shader optimization       |Reduce uniform updates to 30fps (not 60), batch frequency band data       |
|Animation deduplication   |Ensure only one rAF loop per canvas (AudioEngine + SignalLayer + Waveform)|
|Mobile optimization       |Touch event handling, reduced shader complexity on low-power devices      |
|Unified rAF coordinator   |Single `requestAnimationFrame` loop dispatches to all consumers           |

### Hidden States → Alternate UI Modes

|Trigger                               |Visual Mutation                                                        |
|--------------------------------------|-----------------------------------------------------------------------|
|Ghost channel unlocked                |Permanent green intensity boost, thought stream unlocks ghost fragments|
|`pulse overdrive` from ghost directory|Full RGB split + rapid log cycling for 30s, then settles to `active`   |
|All Easter eggs found                 |???  (define later — maybe a hidden `transcend` command)               |

**Deliverable:**
Unified neural organism. Everything reacts to everything. Performance-optimized. Ship-ready.

-----

## PROGRESS OVERVIEW

```
COMPLETE ─────────────────────────────────
Phase 0: Foundation          ██████████ 100%
Phase 1: Dashboard Scaffold  ██████████ 100%
Phase 2: Shell Interface     ██████████ 100%

BUILD QUEUE ──────────────────────────────
Phase 3: Mux + Terminal Feed ░░░░░░░░░░   0%  ← START HERE
Phase 4: Modes + Thoughts    ░░░░░░░░░░   0%
Phase 5: AI Chat Core        ░░░░░░░░░░   0%  (can parallel with Phase 4)
Phase 6: Integration         ░░░░░░░░░░   0%
```

**Dependency graph (no blockers in sequence):**

```
Phase 0 ──→ Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 6
                                         │                      ↑
                                         └──→ Phase 5 ─────────┘
                                         (parallel-ready)
```

-----

## MEDIA STACK

### Video: Mux Player

|Package                |Use                                       |
|-----------------------|------------------------------------------|
|`@mux/mux-player-react`|Video playback in shell + content renderer|

- Replaces all YouTube `<iframe>` embeds
- Themed via CSS variables to match terminal (accent: `var(--phosphor-green)`)
- Playback IDs stored in content config, not hardcoded
- HLS streaming, adaptive bitrate, built-in analytics via Mux Data

### Audio: Mux Audio + Web Audio API

|Package               |Use                                              |
|----------------------|-------------------------------------------------|
|`@mux/mux-audio-react`|Audio playback (renders native `<audio>` element)|
|Web Audio API (native)|`AnalyserNode` for amplitude/frequency extraction|

- MuxAudio renders a real `<audio>` element
- That element is connected to Web Audio API via `createMediaElementSource()`
- `AnalyserNode` feeds FFT data into the rAF loop
- AudioEngine class wraps all of this with a clean emit-based API

**Why Mux for both:** Single asset pipeline. Upload once, get playback IDs for video and audio. Same dashboard, same analytics, same CDN. No second vendor.

-----

## SYSTEM ARCHITECTURE

```
Frontend (built):
├── React + Next.js App Router ('use client')
├── PixiJS WebGL canvas (CRT shader via PIXI.Filter)
├── GSAP (micro-jitter animations)
├── Web Audio API (morse command only)
├── EventBus singleton
├── NeuralContext (global state)
├── Virtual filesystem + permission gates
├── Command registry (~40 commands)
└── Content renderer (YouTube embeds — to be replaced Phase 3)

Frontend (Phase 3):
├── @mux/mux-player-react (video)
├── @mux/mux-audio-react (audio)
├── AudioEngine (Web Audio API AnalyserNode wrapper)
├── LogGenerator + DaemonFeed (terminal feed)
└── Shell media commands (volume, pause, resume, nowplaying)

Frontend (Phase 4):
├── Mode system (idle / active / overdrive)
├── Expanded shader uniforms (amplitude, frequency bands, mode)
├── Waveform visualizer (canvas oscilloscope)
└── ThoughtStream overlay

Frontend (Phase 5):
└── ChatInterface (streaming, persona modes, terminal-embedded)

Backend (Phase 5):
├── /api/chat (Edge runtime, SSE streaming)
└── Middleware (IP rate limiting, in-memory, no DB)
```

-----

## LORE CONSTANTS (LOCKED — NEVER CHANGE)

|Constant       |Value                                                           |Source                           |
|---------------|----------------------------------------------------------------|---------------------------------|
|uid/gid        |`784988`                                                        |ASCII: N=78, 1=49, X=88          |
|Ghost frequency|`33hz`                                                          |Canonical                        |
|Commit hash    |`7073435a8fa30`                                                 |First 13 of SHA-256(“tunnelcore”)|
|Root password  |`tunnelcore`                                                    |—                                |
|N1X password   |`ghost33`                                                       |—                                |
|Tagline        |“Cybernetic rebel. Assembled to destroy, programmed to rebuild.”|—                                |
|Stardate base  |`47634`                                                         |—                                |
|Terminal PID   |`1337`                                                          |—                                |
|MTU            |`1337`                                                          |—                                |
|Prompt         |`ghost@wetware-784988:~$`                                       |—                                |

-----

## OPTIONAL FUTURE

- Offline mode via Service Worker
- Local memory via browser storage (opt-in)
- Music-reactive 3D neural mesh (Three.js)
- Public API for persona embedding