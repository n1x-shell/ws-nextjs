# CLAUDE.md

## Project Overview

**N1X.sh** (`n1x-terminal` v2.0) is an interactive cyberpunk terminal web experience built with Next.js. It presents a CRT-styled shell interface where visitors explore a virtual filesystem, listen to music streams, participate in a multiplayer chat channel (the "ghost channel"), and progress through an ARG (Alternate Reality Game) puzzle arc. The project is both an art piece and a narrative platform — the lore, filesystem, and AI bots are all part of the experience.

## Tech Stack

- **Framework**: Next.js 14 (App Router, `app/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3 + CSS custom properties (`globals.css`) + inline styles
- **3D/Shader**: Three.js (WebGL CRT overlay via GLSL fragment shader in `SignalLayer`)
- **Animation**: GSAP (screen glitch/shake effects)
- **Realtime**: Ably (WebSocket pub/sub for multiplayer chat + presence)
- **AI**: Vercel AI SDK (`ai` package) with `alibaba/qwen3-max` model
- **Media**: Mux (`@mux/mux-player-react`, `@mux/mux-audio-react`) for music streaming
- **Key-value Store**: Upstash Redis (`@upstash/redis`) for rate limiting + dedup
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel

## Commands

```bash
npm run dev       # Start dev server (next dev)
npm run build     # Production build (next build)
npm run start     # Start production server (next start)
npm run lint      # ESLint check (next lint)
```

No test framework is configured. There are no unit/integration tests.

## Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Space Mono font, meta, analytics)
│   ├── page.tsx                # Single-page app — renders NeuralCore
│   ├── globals.css             # CSS variables, CRT animations, phosphor themes
│   └── api/                    # Server-side API routes
│       ├── ably-token/route.ts # Issues Ably auth tokens (GET)
│       ├── ambient-bots/route.ts # Ambient bot AI responses (POST)
│       ├── bot/route.ts        # N1X AI bot responses (POST)
│       ├── messages/route.ts   # Server-side message publishing (POST)
│       ├── mod/route.ts        # Moderation actions (POST)
│       ├── nodes/route.ts      # Presence count (GET)
│       └── arg/
│           └── decrypt-f010/route.ts # ARG fragment decryption
├── components/
│   ├── neural/                 # Core UI layer
│   │   ├── NeuralCore.tsx      # Root component (wraps NeuralProvider)
│   │   ├── InterfaceLayer.tsx  # CRT frame, header, tabs, footer, shell mount
│   │   └── SignalLayer.tsx     # Three.js WebGL CRT shader overlay
│   └── shell/                  # Terminal/player components
│       ├── ShellInterface.tsx  # Shell input/output, prompt, command execution
│       ├── TelnetSession.tsx   # Multiplayer ghost channel (Ably chat UI)
│       ├── SyntheticsPlayer.tsx # Mux audio player for SYNTHETICS stream
│       ├── AnaloguesPlayer.tsx # Mux audio player for ANALOGUES stream
│       ├── HybridsPlayer.tsx   # Mux audio player for HYBRIDS stream
│       └── PlayOverlay.tsx     # Audio unlock overlay
├── contexts/
│   └── NeuralContext.tsx       # React context for neural state (mode, tab, glitch, uptime)
├── hooks/
│   ├── useShell.ts             # Shell state management (history, command execution)
│   └── useEventBus.ts          # Hook wrapper for EventBus subscribe/emit
├── lib/                        # Core logic (no React components)
│   ├── eventBus.ts             # Singleton pub/sub event bus (wildcard support)
│   ├── commandRegistry.tsx     # Command parser + all shell commands (40+ commands)
│   ├── systemCommands.tsx      # System command implementations (top, ps, whoami, etc.)
│   ├── virtualFS.ts            # In-memory virtual filesystem with access control
│   ├── tracks.ts               # Music track data (SYNTHETICS, ANALOGUES, HYBRIDS)
│   ├── audioEngine.ts          # Web Audio API engine (connects to Mux player)
│   ├── audioUnlock.ts          # iOS/browser audio context unlock utility
│   ├── ablyClient.ts           # Ably hook for multiplayer chat (useAblyRoom)
│   ├── telnetBridge.ts         # Module-level bridge connecting shell ↔ Ably chat
│   ├── ghostDaemonPrompt.ts    # System prompts for N1X AI bot
│   ├── ambientBotConfig.ts     # Ambient bot definitions (Vestige, Lumen, Cascade)
│   ├── ambientBotPrompts.ts    # System prompts for ambient bots
│   ├── trustContext.ts         # Trust-level prompt builder for ARG progression
│   ├── argState.ts             # ARG state persistence (localStorage)
│   ├── f010Store.ts            # Server-side f010 fragment key storage
│   ├── rateLimit.ts            # Per-IP rate limiting (Redis sliding window)
│   ├── contentRenderer.tsx     # Rich content rendering for shell output
│   ├── phosphorCommand.tsx     # `phosphor` command — CRT color theme switching
│   ├── useFrequencyShift.ts    # Auto phosphor color cycling hook
│   ├── useShellPresence.ts     # Ably presence for visitor counting
│   └── virtualFS.ts            # Virtual filesystem tree + navigator class
├── types/
│   ├── shell.types.ts          # Shell types (Command, CommandResult, CommandOutput, etc.)
│   └── neural.types.ts         # Neural types (NeuralMode, Tab, EventBus interfaces)
├── docs/
│   └── BOT_Prompt_Architecture.md
└── config files
    ├── package.json
    ├── tsconfig.json            # Strict, ES2017 target, bundler resolution, @/* paths
    ├── next.config.js           # reactStrictMode: true
    ├── tailwind.config.js       # Content: app/, components/, pages/
    ├── postcss.config.js        # Tailwind + autoprefixer
    └── eslint.config.mjs        # next/core-web-vitals + next/typescript
```

## Architecture

### Single-Page Application

The entire app is a single page (`app/page.tsx`) that renders `NeuralCore`, which composes:
1. **NeuralProvider** — React context for global state (mode, active tab, glitch, uptime)
2. **ShellPresenceMount** — invisible component that runs `useShellPresence` (Ably visitor counting) and `useFrequencyShift` (auto CRT color cycling)
3. **InterfaceLayer** — the visible CRT terminal frame (header, tab nav, shell, footer)
4. **SignalLayer** — fullscreen transparent Three.js WebGL overlay for CRT effects (scanlines, vignette, film grain, glitch tiers)

### Event Bus

Communication between decoupled components uses a singleton `EventBus` (`lib/eventBus.ts`). Key event namespaces:

| Namespace | Examples | Purpose |
|-----------|----------|---------|
| `neural:*` | `neural:boot-complete`, `neural:tab-change`, `neural:glitch-trigger`, `neural:frequency-shift`, `neural:hack-complete` | UI state transitions |
| `shell:*` | `shell:execute-command`, `shell:push-output`, `shell:clear`, `shell:root-mode-change` | Shell command routing |
| `audio:*` | `audio:amplitude`, `audio:playback-change`, `audio:track-change` | Audio engine ↔ shader |
| `crt:*` | `crt:glitch-tier`, `crt:preset`, `crt:param` | Direct shader uniform control |
| `arg:*` | `arg:fragment-decoded`, `arg:trust-level-change`, `arg:manifest-complete` | ARG puzzle progression |
| `mesh:*` | `mesh:node-count` | Presence count updates |
| `telnet:*` | `telnet:connected` | Chat connection events |
| `mod:*` | `mod:kicked`, `mod:suppressed` | Moderation events |

### Shell System

The terminal shell (`ShellInterface` + `useShell` + `commandRegistry`) implements a simulated Unix environment:

- **Virtual filesystem** (`lib/virtualFS.ts`): In-memory tree with directories like `/home/n1x`, `/var/log`, `/ghost`, `/hidden`. Access-controlled — `/ghost` requires authentication, `/hidden` requires running a script.
- **40+ commands**: `ls`, `cd`, `cat`, `help`, `scan`, `play`, `su`, `sudo`, `telnet`, `decrypt`, `phosphor`, `john`, `strace`, `nc`, `mail`, `ps`, `top`, `fortune`, and more.
- **Root mode**: `su root` with password `tunnelcore` unlocks `/ghost` directory.
- **Command history**: Arrow key navigation, tab completion for commands and paths.

### Multiplayer Chat (Ghost Channel)

`telnet n1x.sh 33` in the shell activates the ghost channel — a real-time chat room:

- **Ably realtime** for WebSocket pub/sub (presence, messages)
- **Server-side publishing** (`/api/messages`) prevents client spoofing
- **N1X AI bot** responds when pinged with `@n1x` — uses trust-aware prompting
- **Ambient bots** (Vestige, Lumen, Cascade) participate probabilistically
- **Rate limiting** via Upstash Redis on all API endpoints
- **Moderation** via `/api/mod` (kick, mute, unmute)

### ARG (Alternate Reality Game) System

A multi-session puzzle arc tracked in `localStorage` (`n1x_substrate`):

- **Trust levels** (0-5): Progress through interactions with N1X bot
- **Fragments** (f001-f010): Encrypted files in `/ghost/fragments/` decrypted with keys earned through trust progression
- **State persistence**: `lib/argState.ts` manages trust, fragments, session count, unlock flags
- **Trust context**: `lib/trustContext.ts` builds trust-level-aware system prompts that control N1X's behavior at each level
- **f010**: Special server-generated fragment requiring multiple players, time, and engagement thresholds

### CRT Shader System

`SignalLayer.tsx` renders a fullscreen WebGL overlay with GLSL shaders:

- **Presets**: `default`, `raw`, `overdrive`, `ghost` — control baseline vignette, noise, scanlines
- **Glitch tiers** (0-3): Escalating visual disruption (line flicker → block artifacts → screen tears)
- **Phosphor tints**: 8 color themes (green, amber, violet, white, blue, pink, cyan, red) switchable via `phosphor` command
- **Audio reactivity**: `uAmplitude` uniform responds to music playback RMS

### Audio System

- `AudioEngine` (`lib/audioEngine.ts`): Singleton connecting Mux `<video>` elements to Web Audio API
- Frequency/amplitude data emitted via EventBus to drive CRT shader reactivity
- Three music categories: SYNTHETICS (original), ANALOGUES (covers), HYBRIDS
- Tracks defined in `lib/tracks.ts` with Mux playback IDs and full lyrics

## Key Conventions

### Code Style

- TypeScript strict mode — no `any` except for event bus payloads
- `'use client'` directive on all components and client-side modules
- Path aliases via `@/*` mapping to project root (e.g., `@/lib/eventBus`)
- Inline styles preferred for dynamic/layout styles; Tailwind for borders/utilities; CSS custom properties (`--phosphor-green`, `--phosphor-rgb`, etc.) for theming
- No CSS modules — global styles in `globals.css`, scoped `<style>` tags in components
- Module-level singletons for shared state (`eventBus`, `audioEngine`, `FileSystemNavigator`)

### Component Patterns

- Functional components only (no class components)
- `useCallback` + `useMemo` for expensive computations
- `useRef` for mutable state that shouldn't trigger re-renders (timers, WebGL refs, event counts)
- EventBus subscriptions via `useEventBus` hook (auto-cleanup on unmount)
- `useEffect` cleanup for all intervals, timeouts, and subscriptions

### API Routes

- All API routes are in `app/api/` using Next.js Route Handlers
- Rate limited via `lib/rateLimit.ts` (Upstash Redis fixed-window counter)
- Ably API key stays server-side — clients get scoped tokens via `/api/ably-token`
- Server-side message publishing prevents client capability abuse
- `export const dynamic = 'force-dynamic'` on routes that must not be cached
- `export const maxDuration = 30` (or 60) for AI generation routes

### Environment Variables

Required for full functionality (none are committed — all in `.env`):

| Variable | Purpose |
|----------|---------|
| `ABLY_API_KEY` | Ably realtime messaging |
| `UPSTASH_REDIS_REST_URL` | Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token |

The app degrades gracefully when env vars are missing — presence shows fallback count of 4, chat features are disabled.

### Theming

CSS custom properties drive all colors. The phosphor theme system uses class-based shifts:

```css
:root                { --phosphor-green: #33ff33; --phosphor-accent: #FFB000; }
.amber-shift         { --phosphor-green: #FFB000; --phosphor-accent: #00F5D4; }
.violet-shift        { --phosphor-green: #B44FFF; --phosphor-accent: #00F5D4; }
/* ... 6 more shifts */
```

Applied to `<html>` element via `useFrequencyShift` or `phosphor <color>` command.

### Performance Considerations

- Shell history capped at 150 entries (`MAX_HISTORY` in `useShell.ts`) to prevent iOS Safari DOM bloat
- WebGL renderer pixel ratio capped at 2x
- `will-change: transform` and `translateZ(0)` for GPU-accelerated layers
- `ResizeObserver` for responsive WebGL canvas sizing
- Audio amplitude polling via `requestAnimationFrame` loop

## Important Warnings

- **Lore is sacred**: The virtual filesystem content, track lyrics, bot prompts, and trust progression are carefully crafted narrative. Do not modify lore text without explicit instruction.
- **No tests exist**: There is no test framework. Validate changes by running `npm run build` and manual testing.
- **ARG state is client-side**: All puzzle progress lives in `localStorage` under key `n1x_substrate`. Server-side state is limited to Ably presence and Redis rate-limit counters.
- **Shader code is in TypeScript**: The GLSL vertex/fragment shaders are template literals inside `SignalLayer.tsx`, not separate `.glsl` files.
- **Module-level singletons**: `eventBus`, `audioEngine`, the `FileSystemNavigator` instance in `commandRegistry`, and telnet bridge state are all module-scoped singletons. Be careful with SSR — most are guarded with `typeof window !== 'undefined'`.
- **Default branch is `main`** (remote). Local `master` may exist from initial setup.
