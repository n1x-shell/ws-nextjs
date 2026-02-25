'use client';

import React from 'react';
import { Command, CommandResult } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';
import { eventBus } from './eventBus';
import { Tab } from '@/types/neural.types';
import { renderStreamContent } from './contentRenderer';
import { createSystemCommands, setRequestPrompt, isSubstrateDaemonRunning, startSubstrateDaemon } from './systemCommands';
import {
  NeuralLinkStream,
  NeuralChatSession,
  handleChatInput,
  isChatMode,
  setChatMode,
  resetConversation,
} from '@/components/shell/NeuralLink';
import { isTelnetActive, telnetSend, telnetDisconnect } from '@/lib/telnetBridge';

const fs = new FileSystemNavigator();

let isRoot   = false;
let _requestPrompt: ((label: string, onSubmit: (pw: string) => void) => void) = () => {};

// ── Root mode flag — module-level, like isChatMode in NeuralLink ─────────────
export function isRootMode(): boolean { return isRoot; }
export function setRootMode(active: boolean): void {
  isRoot = active;
  eventBus.emit('shell:root-mode-change', { active });
}

const PASSWORDS = {
  root: 'tunnelcore',
  n1x:  'ghost33',
};

const systemCommands = createSystemCommands(fs, () => isRoot);

if (typeof window !== 'undefined') {
  eventBus.on('neural:ghost-unlocked', () => {
    fs.unlock();
    import('@/lib/argState').then(({ updateARGState }) => {
      updateARGState({ ghostUnlocked: true });
    });
  });

  eventBus.on('neural:hidden-unlocked', () => {
    fs.unlockHidden();
    import('@/lib/argState').then(({ updateARGState }) => {
      updateARGState({ hiddenUnlocked: true });
    });
  });

  // Fired on page load when argState.backupExtracted === true.
  // Ghost must already be unlocked before this fires (ShellInterface
  // emits neural:ghost-unlocked first in handleBootComplete).
  eventBus.on('vfs:restore-backup', () => {
    fs.extractBackup();
  });
}

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  dim:    { fontSize: 'var(--text-base)', opacity: 0.6 } as React.CSSProperties,
  glow:   'text-glow',
};

// ── Mail mode state ───────────────────────────────────────────────────────────

let mailModeActive = false;

export function isMailMode(): boolean {
  return mailModeActive;
}

function setMailMode(active: boolean): void {
  mailModeActive = active;
}

function getMailMessages(): { from: string; date: string; subject: string; body: string }[] {
  const result = fs.readFileAbsolute('/var/mail/inbox');
  if (!result.success || !result.content) return [];

  const raw = result.content;
  const msgs: { from: string; date: string; subject: string; body: string }[] = [];
  const blocks = raw.split(/^From /m).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const fromLine = lines[0] || '';
    const fromMatch = fromLine.match(/^(\S+)\s+(.*)/);
    const from = fromMatch ? fromMatch[1] : 'unknown';
    const date = fromMatch ? fromMatch[2].trim() : '';

    let subject = '(no subject)';
    let bodyStart = 1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith('Subject: ')) {
        subject = lines[i].slice(9).trim();
      } else if (lines[i].startsWith('Status: ')) {
        bodyStart = i + 1;
        break;
      }
    }

    // skip leading blank line after headers
    if (lines[bodyStart] === '') bodyStart++;

    const body = lines.slice(bodyStart).join('\n').trim();
    msgs.push({ from, date, subject, body });
  }

  return msgs;
}

function renderMailListing(): React.ReactNode {
  const msgs = getMailMessages();
  if (msgs.length === 0) {
    return <span style={{ fontSize: S.base, opacity: 0.6 }}>No mail.</span>;
  }

  return (
    <div style={{ fontSize: S.base }}>
      <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
        &gt; MAIL — /var/mail/inbox
      </div>
      <div style={{ marginLeft: '0.5rem', lineHeight: 1.8 }}>
        {msgs.map((msg, i) => (
          <div key={i}>
            <span style={{ opacity: 0.5 }}>{i + 1}</span>
            {'  '}
            <span style={{ color: '#ffaa00' }}>{msg.from.split('@')[0]}</span>
            {'  '}
            <span style={{ opacity: 0.8 }}>{msg.subject}</span>
            {'  '}
            <span style={{ opacity: 0.4 }}>{msg.date}</span>
          </div>
        ))}
      </div>
      <div style={{ ...S.dim, marginTop: '0.5rem' }}>
        type a number to read · <span className={S.glow}>h</span> headers · <span className={S.glow}>q</span> quit
      </div>
    </div>
  );
}

function renderMailMessage(n: number): React.ReactNode {
  const msgs = getMailMessages();
  if (n < 1 || n > msgs.length) {
    return <span style={{ color: '#f87171', fontSize: S.base }}>No such message: {n}</span>;
  }
  const msg = msgs[n - 1];
  return (
    <div style={{ fontSize: S.base }}>
      <div style={{ borderBottom: '1px solid rgba(51,255,51,0.3)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
        <div><span style={{ opacity: 0.5 }}>From:</span> <span style={{ color: '#ffaa00' }}>{msg.from}</span></div>
        <div><span style={{ opacity: 0.5 }}>Date:</span> {msg.date}</div>
        <div><span style={{ opacity: 0.5 }}>Subject:</span> {msg.subject}</div>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: S.base, opacity: 0.9, lineHeight: 1.6 }}>
        {msg.body}
      </pre>
      <div style={{ ...S.dim, marginTop: '0.5rem', borderTop: '1px solid rgba(51,255,51,0.2)', paddingTop: '0.3rem' }}>
        message {n}/{msgs.length} · type a number for another · <span className={S.glow}>q</span> quit
      </div>
    </div>
  );
}

function handleMailInput(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase();

  if (trimmed === 'q' || trimmed === 'quit' || trimmed === 'exit') {
    setMailMode(false);
    return { output: <span style={{ opacity: 0.6, fontSize: S.base }}>mail: closed</span> };
  }

  if (trimmed === 'h' || trimmed === 'headers') {
    return { output: renderMailListing() };
  }

  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return { output: renderMailMessage(num) };
  }

  return {
    output: <span style={{ opacity: 0.6, fontSize: S.base }}>mail: type a number, h (headers), or q (quit)</span>,
  };
}

/** Expose current working directory for prompt rendering */
export function getCurrentDirectory(): string {
  return fs.getCurrentDirectory();
}

/** Expose display directory with ~ substitution */
export function getDisplayDirectory(): string {
  return fs.getDisplayDirectory();
}

/** Expose current user for prompt rendering */
export function getIsRoot(): boolean {
  return isRoot;
}

export const commands: Record<string, Command> = {

  help: {
    name: 'help',
    description: 'List commands or show detailed usage',
    usage: 'help [command]',
    handler: (args) => {
      if (args.length > 0) {
        const cmdName = args[0].toLowerCase();
        const cmd = commands[cmdName];
        if (!cmd) return { output: `help: no help for '${cmdName}'`, error: true };
        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
              <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.3rem' }}>
                {cmd.name}
              </div>
              <div><span style={{ opacity: 0.5 }}>Usage:</span> {cmd.usage}</div>
              <div><span style={{ opacity: 0.5 }}>Info:</span> {cmd.description}</div>
              {cmd.aliases && cmd.aliases.length > 0 && (
                <div><span style={{ opacity: 0.5 }}>Aliases:</span> {cmd.aliases.join(', ')}</div>
              )}
            </div>
          ),
        };
      }

      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.75rem' }}>
              &gt; AVAILABLE_COMMANDS
            </div>
                        {[
              {
                label: 'NAVIGATION',
                cmds: [
                  ['cat', 'Display file contents'],
                  ['cd',  'Change directory'],
                  ['ls',  'List directory'],
                  ['pwd', 'Print working directory'],
                  ['sh',  'Execute shell script'],
                ],
              },
              {
                label: 'CONTENT',
                cmds: [
                  ['load',    'Load stream content'],
                  ['play',    'Play specific track'],
                  ['scan',    'Scan for streams'],
                  ['streams', 'List all streams'],
                  ['tracks',  'List available tracks'],
                ],
              },
              {
                label: 'SYSTEM',
                cmds: [
                  ['clear',   'Clear terminal'],
                  ['df',      'Disk usage'],
                  ['dmesg',   'Boot log'],
                  ['echo',    'Echo text'],
                  ['env',     'Environment variables'],
                  ['free',    'Memory usage'],
                  ['help',    'Show this help'],
                  ['history', 'Command history'],
                  ['id',      'User identity'],
                  ['ifconfig','Network interfaces'],
                  ['mount',   'Mounted filesystems'],
                  ['netstat', 'Network connections'],
                  ['ps',      'Process list'],
                  ['status',  'System telemetry'],
                  ['strace',  'Trace system calls'],
                  ['su',      'Switch user'],
                  ['sudo',    'Execute as root'],
                  ['telnet',  'Connect to remote host'],
                  ['top',     'Live process monitor'],
                  ['uname',   'System information'],
                  ['uptime',  'Session uptime'],
                  ['whoami',  'Current user'],
                ],
              },
              {
                label: 'UTILITIES',
                cmds: [
                  ['base64',  'Base64 encode/decode'],
                  ['cal',     'Calendar'],
                  ['cowsay',  'ASCII art message'],
                  ['date',    'Current date/stardate'],
                  ['decrypt',  'Attempt fragment decryption'],
                  ['diff',    'Compare files'],
                  ['find',    'Find files'],
                  ['fragments','Fragment recovery status  (alias: frags)'],
                  ['fortune', 'Random transmission'],
                  ['grep',    'Search file contents'],
                  ['gzip',    'Compress/decompress data'],
                  ['mail',    'Read mail spool'],
                  ['man',     'Manual pages'],
                  ['matrix',  'Matrix rain'],
                  ['morse',   'Morse code encoder'],
                  ['nc',      'Netcat — network utility'],
                  ['ping',     'Probe network host or frequency'],
                  ['sha256',  'SHA-256 hash'],
                  ['sort',    'Sort tokens'],
                  ['tar',     'Archive files'],
                  ['transmit','Transmit completed manifest'],
                  ['uniq',    'Remove duplicates'],
                  ['wc',      'Word count'],
                ],
              },

            ].map((section) => (
              <div key={section.label} style={{ marginBottom: '0.75rem' }}>
                <div className={S.glow} style={{ marginBottom: '0.3rem' }}>
                  // {section.label}
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  {section.cmds.map(([name, desc]) => (
                    <div key={name} style={{ marginBottom: '0.2rem' }}>
                      <span className={S.glow}>{name}</span>
                      <span style={{ opacity: 0.6 }}>  --  {desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={S.dim}>Type &apos;help [command]&apos; for detailed usage</div>
            {(() => {
              if (typeof window === 'undefined') return null;
              try {
                const { loadARGState } = require('@/lib/argState');
                const state = loadARGState();
                if (state.manifestComplete) {
                  return (
                    <div style={{ marginTop: '0.75rem', color: 'var(--phosphor-green)', opacity: 0.8 }}>
                      &gt; MANIFEST COMPLETE -- run: transmit manifest.complete
                    </div>
                  );
                }
                if (state.fragments.length > 0) {
                  return (
                    <div style={{ marginTop: '0.75rem', opacity: 0.4 }}>
                      &gt; {state.fragments.length}/9 fragments recovered -- keep looking
                    </div>
                  );
                }
              } catch { return null; }
              return null;
            })()}
          </div>
        ),
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Clear terminal screen',
    usage: 'clear',
    aliases: ['core'],
    handler: () => {
      eventBus.emit('shell:synthetics-close');
      return { output: '', clearScreen: true };
    },
  },

  ls: {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [path]',
    aliases: ['dir'],
    handler: (args) => {
      let files;

      if (args.length > 0) {
        const result = fs.listDirectoryAtPath(args[0]);
        if (!result.success) {
          return { output: result.error || `Cannot list: ${args[0]}`, error: true };
        }
        files = result.files || [];
      } else {
        files = fs.listDirectory();
      }

      const perms = (type: string, name: string): string => {
        if (type === 'directory')  return 'drwxr-x---';
        if (name.endsWith('.sh'))  return '-rwxr-x---';
        if (name.endsWith('.tgz')) return '-rw-r-----';
        return '-rw-r-----';
      };

      const entries = [
        { name: '.', type: 'directory' },
        { name: '..', type: 'directory' },
        ...files.map((f) => ({ name: f.name, type: f.type })),
      ];

      const total = entries.filter((e) => e.name !== '.' && e.name !== '..').length;

      const rows = entries.map((entry) => ({
        p:     perms(entry.type, entry.name),
        lnk:   entry.type === 'directory' ? '2' : '1',
        name:  entry.name,
        isDir: entry.type === 'directory',
        isSh:  entry.name.endsWith('.sh'),
        isTgz: entry.name.endsWith('.tgz'),
      }));

      return {
        output: (
          <div style={{ fontSize: S.base, fontFamily: 'inherit' }}>
            <div style={{ opacity: 0.5, marginBottom: '0.3rem' }}>total {total}</div>
            {rows.map((row) => (
              <div
                key={row.name}
                style={{
                  display:             'grid',
                  gridTemplateColumns: '11ch 2ch 5ch 8ch 1fr',
                  gap:                 '0 0.5rem',
                  lineHeight:          1.7,
                  whiteSpace:          'nowrap',
                }}
              >
                <span style={{ opacity: 0.7 }}>{row.p}</span>
                <span style={{ opacity: 0.5 }}>{row.lnk}</span>
                <span style={{ opacity: 0.5 }}>n1x</span>
                <span style={{ opacity: 0.5 }}>neural</span>
                <span
                  className={row.isDir ? S.glow : ''}
                  style={
                    row.isSh  ? { color: '#33ff33', fontWeight: 'bold' } :
                    row.isTgz ? { color: '#ffaa00' } :
                    !row.isDir ? { opacity: 0.9 } : {}
                  }
                >
                  {row.name}
                </span>
              </div>
            ))}
          </div>
        ),
      };
    },
  },

  cd: {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd <directory>',
    handler: (args) => {
      if (args.length === 0) {
        // cd with no args → go home
        const result = fs.changeDirectory('~');
        if (result.success) {
          const newDir = fs.getDisplayDirectory();
          eventBus.emit('shell:set-directory', { directory: newDir });
        }
        return { output: null };
      }
      const result = fs.changeDirectory(args[0]);
      if (result.success) {
        const newDir = fs.getDisplayDirectory();
        eventBus.emit('shell:set-directory', { directory: newDir });
        return { output: null };
      }
      return { output: result.error || 'Failed to change directory', error: true };
    },
  },

  pwd: {
    name: 'pwd',
    description: 'Print working directory',
    usage: 'pwd',
    handler: () => ({ output: fs.getCurrentDirectory() }),
  },

  cat: {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat <filename>',
    handler: (args) => {
      if (args.length === 0) return { output: 'Usage: cat <filename>', error: true };

      const target = args[0];
      const result = fs.readFileByPath(target);

      if (result.success) {
        if (result.content?.includes('binary file')) {
          return { output: result.content };
        }
        return {
          output: (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: S.base, opacity: 0.9 }}>
              {result.content}
            </pre>
          ),
        };
      }
      return { output: result.error || 'Failed to read file', error: true };
    },
  },

  sh: {
    name: 'sh',
    description: 'Execute a shell script',
    usage: 'sh [path]',
    handler: (args) => {
      if (args.length === 0) {
        const result = fs.changeDirectory('~');
        if (result.success) {
          const newDir = fs.getDisplayDirectory();
          eventBus.emit('shell:set-directory', { directory: newDir });
        }
        return { output: null };
      }

      const target = args[0];
      const result = fs.resolveExecutableByPath(target);

      if (!result) {
        return {
          output: (
            <span style={{ color: '#f87171' }}>
              sh: {target}: No such file
            </span>
          ),
          error: true,
        };
      }

      // ── /hidden context: n1x.sh → trigger konami/ghost unlock ──────────
      if (result.name === 'n1x.sh' && result.directory.startsWith('/hidden')) {
        eventBus.emit('neural:konami');

        return {
          output: (
            <div style={{ fontSize: 'var(--text-base)' }}>
              <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.4rem' }}>
                &gt; EXECUTING n1x.sh
              </div>
              <div style={{ marginLeft: '1rem', opacity: 0.6 }}>
                initializing...
              </div>
            </div>
          ),
        };
      }

      // ── /ghost context: substrated.sh → start substrated service ───────
      if (result.name === 'substrated.sh' && result.directory.startsWith('/ghost')) {
        if (!isRoot) {
          return {
            output: (
              <span style={{ color: '#f87171', fontSize: 'var(--text-base)' }}>
                Permission denied — root privileges required
              </span>
            ),
            error: true,
          };
        }

        if (isSubstrateDaemonRunning()) {
          return {
            output: (
              <span style={{ fontSize: 'var(--text-base)', opacity: 0.6 }}>
                substrated: service already running on port 33
              </span>
            ),
          };
        }

        const pushLine = (output: React.ReactNode) => {
          eventBus.emit('shell:push-output', { command: '', output });
        };

        const STARTUP: [number, React.ReactNode][] = [
          [300, <span style={{ fontSize: S.base, opacity: 0.7 }}>initializing substrate daemon...</span>],
          [600, <span style={{ fontSize: S.base, opacity: 0.7 }}>substrated[784]: binding to 0.0.0.0:33</span>],
          [900, <span style={{ fontSize: S.base, opacity: 0.7 }}>substrated[784]: frequency lock: 33hz</span>],
          [1200, <span style={{ fontSize: S.base, opacity: 0.8 }}>substrated[784]: neural bus interface ready</span>],
          [1500, <span style={{ fontSize: S.base, opacity: 0.8 }}>substrated[784]: listening for connections</span>],
          [1800, <span>&nbsp;</span>],
          [2000, (
            <div style={{ fontSize: S.base }}>
              <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                &gt; SERVICE_STARTED
              </div>
              <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
                <div>substrated is now running on port 33</div>
                <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>connect with: <span className="text-glow">telnet n1x.sh 33</span></div>
              </div>
            </div>
          )],
        ];

        STARTUP.forEach(([delay, content]) => {
          setTimeout(() => {
            pushLine(content);
          }, delay);
        });

        setTimeout(() => {
          startSubstrateDaemon();
          eventBus.emit('neural:substrated-started');
        }, 2100);

        return {
          output: (
            <div style={{ fontSize: 'var(--text-base)' }}>
              <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.4rem' }}>
                &gt; EXECUTING substrated.sh
              </div>
            </div>
          ),
        };
      }

      // ── Generic script: print contents ─────────────────────────────────
      const file = fs.readFileByPath(target);
      if (file.success) {
        return {
          output: (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'var(--text-base)', opacity: 0.9 }}>
              {file.content}
            </pre>
          ),
        };
      }

      return { output: file.error || 'Execution failed', error: true };
    },
  },

  // ── Neural Link commands (deprecated — use telnet) ────────────────────────

  ask: {
    name: 'ask',
    description: 'Deprecated',
    usage: 'ask',
    hidden: true,
    handler: () => ({
      output: "connection required -- try: telnet n1x.sh 33",
    }),
  },

  chat: {
    name: 'chat',
    description: 'Deprecated',
    usage: 'chat',
    hidden: true,
    handler: () => ({
      output: "connection required -- try: telnet n1x.sh 33",
    }),
  },

  // ── Content commands ──────────────────────────────────────────────────────

  load: {
    name: 'load',
    description: 'Load a content stream into terminal',
    usage: 'load <synthetics|analogues|hybrids|uplink>',
    handler: (args) => {
      if (args.length === 0) return { output: 'Usage: load <stream>', error: true };

      if (args[0].toLowerCase() === 'core') {
        return { output: '', clearScreen: true };
      }

      const streamMap: Record<string, Tab> = {
        synthetics: 'synthetics',
        analogues:  'analogues',
        hybrids:    'hybrids',
        uplink:     'uplink',
      };

      const stream = streamMap[args[0].toLowerCase()];
      if (stream) {
        // Close the synthetics player when navigating away
        if (stream !== 'synthetics') {
          eventBus.emit('shell:synthetics-close');
        }
        const content = renderStreamContent(stream);
        if (stream === 'synthetics') return { output: null };
        if (content) return { output: content };
        return { output: 'Stream content not available', error: true };
      }

      return { output: `Unknown stream: ${args[0]}`, error: true };
    },
  },

  nowplaying: {
    name: 'nowplaying',
    description: 'Show currently playing track',
    usage: 'nowplaying',
    handler: () => {
      const { audioEngine } = require('@/lib/audioEngine');
      const { TRACKS }      = require('@/lib/tracks');
      const idx   = audioEngine.trackIndex;
      const track = TRACKS[idx] ?? TRACKS[0];
      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.25rem' }}>
              &gt; NOW_PLAYING
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
              <div>{String(track.index).padStart(2,'0')} / {TRACKS.length}  —  {track.displayTitle}</div>
              <div style={{ ...S.dim }}>
                state: {audioEngine.state}  |  vol: {Math.round(audioEngine.volume * 100)}%
                {audioEngine.muted ? '  |  MUTED' : ''}
              </div>
            </div>
          </div>
        ),
      };
    },
  },

  pause: {
    name: 'pause',
    description: 'Pause playback',
    usage: 'pause',
    handler: () => {
      const { eventBus } = require('@/lib/eventBus');
      eventBus.emit('audio:command', { action: 'pause' });
      return { output: '> playback paused' };
    },
  },

  resume: {
    name: 'resume',
    description: 'Resume playback',
    usage: 'resume',
    handler: () => {
      const { eventBus } = require('@/lib/eventBus');
      eventBus.emit('audio:command', { action: 'resume' });
      return { output: '> playback resumed' };
    },
  },

  volume: {
    name: 'volume',
    description: 'Set playback volume 0–100',
    usage: 'volume <0-100>',
    handler: (args) => {
      const n = parseInt(args[0], 10);
      if (isNaN(n) || n < 0 || n > 100) return { output: 'Usage: volume <0-100>', error: true };
      const { eventBus } = require('@/lib/eventBus');
      eventBus.emit('audio:command', { action: 'volume', value: n });
      return { output: `> volume set to ${n}%` };
    },
  },

  next: {
    name: 'next',
    description: 'Skip to next track',
    usage: 'next',
    handler: () => {
      const { eventBus } = require('@/lib/eventBus');
      eventBus.emit('audio:command', { action: 'next' });
      return { output: '> loading next transmission' };
    },
  },

  prev: {
    name: 'prev',
    description: 'Go to previous track',
    usage: 'prev',
    aliases: ['previous'],
    handler: () => {
      const { eventBus } = require('@/lib/eventBus');
      eventBus.emit('audio:command', { action: 'prev' });
      return { output: '> loading previous transmission' };
    },
  },

  // ── DEAD STUB — play removed, kept to show helpful error ─────────────────
  play: {
    name: 'play',
    description: 'Play a specific track by number or name',
    usage: 'play <1-9|track-name>',
    handler: (args) => {
      if (args.length === 0) {
        eventBus.emit('shell:synthetics-open');
        return { output: '> loading synthetics — use play <1-9> to jump to a track' };
      }
      const { TRACKS } = require('@/lib/tracks');
      const raw = args[0].toLowerCase().replace(/^0+/, '');
      const num = parseInt(raw, 10);
      let idx = -1;
      if (!isNaN(num) && num >= 1 && num <= TRACKS.length) {
        idx = num - 1;
      } else {
        idx = TRACKS.findIndex((t: any) =>
          t.key.includes(raw) || t.displayTitle.toLowerCase().includes(raw)
        );
      }
      if (idx === -1) return { output: `Track not found: ${args[0]}`, error: true };
      eventBus.emit('shell:synthetics-open');
      setTimeout(() => eventBus.emit('audio:command', { action: 'goto', value: idx }), 50);
      return { output: `> loading ${TRACKS[idx].displayTitle}` };
    },
  },

  tracks: {
    name: 'tracks',
    description: 'List available tracks',
    usage: 'tracks',
    aliases: ['list'],
    handler: () => {
      const { TRACKS } = require('@/lib/tracks');
      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
              &gt; AUGMENTED — 9 TRANSMISSIONS
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.9 }}>
              {TRACKS.map((t: any) => (
                <div key={t.key}>
                  <span className={S.glow}>{String(t.index).padStart(2,'0')}</span>
                  {'  —  '}
                  {t.displayTitle}
                </div>
              ))}
            </div>
            <div style={{ ...S.dim, marginTop: '0.5rem' }}>
              &apos;load synthetics&apos; to open player · &apos;next&apos; · &apos;prev&apos; · &apos;nowplaying&apos;
            </div>
          </div>
        ),
      };
    },
  },

  streams: {
    name: 'streams',
    description: 'List all available streams',
    usage: 'streams',
    handler: () => ({
      output: (
        <div style={{ fontSize: S.base }}>
          <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
            &gt; AVAILABLE_STREAMS
          </div>
          <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
            <div><span className={S.glow}>synthetics</span>  --  [AUGMENTED] — 9 transmissions</div>
            <div><span className={S.glow}>analogues</span>   --  Organic creations (recording in progress)</div>
            <div><span className={S.glow}>hybrids</span>     --  Symbiotic fusion (calibration phase)</div>
            <div><span className={S.glow}>uplink</span>      --  External broadcast node</div>
          </div>
          <div style={{ ...S.dim, marginTop: '0.5rem' }}>Use &apos;load [stream-name]&apos; to view</div>
        </div>
      ),
    }),
  },

  scan: {
    name: 'scan',
    description: 'Scan for active streams',
    usage: 'scan',
    handler: () => ({
      output: (
        <div style={{ fontSize: S.base }}>
          <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
            &gt; SCANNING_NEURAL_STREAMS...
          </div>
          <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
            <div style={{ color: '#33ff33' }}>[OK] SYNTHETICS  --  9 transmissions detected</div>
            <div style={{ color: '#ffaa00' }}>[!!] ANALOGUES   --  Recording in progress</div>
            <div style={{ color: '#ffaa00' }}>[!!] HYBRIDS     --  Calibration phase</div>
            <div style={{ color: '#33ff33' }}>[OK] UPLINK      --  External node active</div>
          </div>
          <div style={{ ...S.dim, marginTop: '0.5rem' }}>
            &apos;tracks&apos; | &apos;streams&apos; | &apos;load [stream]&apos; | &apos;next&apos; | &apos;prev&apos;
          </div>
        </div>
      ),
    }),
  },

  // ── System commands ───────────────────────────────────────────────────────

  status: {
    name: 'status',
    description: 'Display system status',
    usage: 'status',
    handler: () => ({
      output: (
        <div style={{ fontSize: S.base }}>
          <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
            &gt; SYSTEM_STATUS
          </div>
          <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
            <div>NEURAL_SYNC     : 85%</div>
            <div>MEMORY_BUFFER   : 62%</div>
            <div>SIGNAL_STRENGTH : 78%</div>
            <div>UPLINK          : ACTIVE</div>
            <div>MODE            : {isRoot ? 'ROOT' : 'ACTIVE'}</div>
            <div>HIDDEN          : {fs.isHiddenUnlocked() ? 'MOUNTED' : 'LOCKED'}</div>
            <div>GHOST           : {fs.isGhostUnlocked() ? 'MOUNTED' : 'LOCKED'}</div>
            <div>SUBSTRATED      : {isSubstrateDaemonRunning() ? 'RUNNING (port 33)' : 'INACTIVE'}</div>
          </div>
        </div>
      ),
    }),
  },

  echo: {
    name: 'echo',
    description: 'Echo text to terminal',
    usage: 'echo <text>',
    handler: (args) => ({ output: args.join(' ') }),
  },

  su: {
    name: 'su',
    description: 'Switch user (defaults to root)',
    usage: 'su [username]',
    handler: (args) => {
      const username = args[0] || 'root';

      if (username !== 'root') {
        return { output: `su: user ${username} does not exist`, error: true };
      }

      if (isRoot) {
        return { output: 'su: already running as root' };
      }

      _requestPrompt('Password:', (pw) => {
        if (pw === PASSWORDS.root) {
          setRootMode(true);
          // Reset displayed directory to / to reflect root's home context
          eventBus.emit('shell:set-directory', { directory: '/' });
          eventBus.emit('shell:push-output', {
            command: '',
            output: (
              <div style={{ fontSize: S.base }}>
                <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem', color: '#f87171' }}>
                  &gt; AUTH_ACCEPTED
                </div>
                <div style={{ marginLeft: '1rem', lineHeight: 1.8, opacity: 0.9 }}>
                  <div>root shell initialized</div>
                  <div>use &apos;mount /hidden&apos; or &apos;mount /ghost&apos; to access restricted filesystems</div>
                  <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>type &apos;exit&apos; to return to ghost</div>
                </div>
              </div>
            ),
          });
        } else {
          eventBus.emit('shell:push-output', {
            command: '',
            output: <span style={{ color: '#f87171', fontSize: S.base }}>su: Authentication failure</span>,
            error: true,
          });
        }
      });

      return { output: null };
    },
  },

  sudo: {
    name: 'sudo',
    description: 'Execute command with elevated permissions',
    usage: 'sudo <command...>',
    handler: (args) => {
      if (args.length === 0) return { output: 'Usage: sudo <command...>', error: true };

      const subcmd = args.join(' ').toLowerCase();

      _requestPrompt('[sudo] password for ghost:', (pw) => {
        if (pw !== PASSWORDS.n1x) {
          eventBus.emit('shell:push-output', {
            command: '',
            output: <span style={{ color: '#f87171', fontSize: S.base }}>sudo: 3 incorrect password attempts</span>,
            error: true,
          });
          return;
        }

        if (subcmd === 'mount /hidden') {
          fs.unlockHidden();
          eventBus.emit('neural:hidden-unlocked');
          eventBus.emit('shell:push-output', {
            command: '',
            output: (
              <div style={{ fontSize: S.base }}>
                <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                  &gt; MOUNT SUCCESSFUL
                </div>
                <div style={{ marginLeft: '1rem', lineHeight: 1.8, opacity: 0.9 }}>
                  <div>/hidden mounted at /hidden</div>
                  <div>filesystem type: neuralfs</div>
                  <div>access: restricted content</div>
                </div>
              </div>
            ),
          });
        } else if (subcmd === 'mount /ghost') {
          eventBus.emit('shell:push-output', {
            command: '',
            output: <span style={{ color: '#f87171', fontSize: S.base }}>mount: /ghost: permission denied — requires root (su first)</span>,
            error: true,
          });
        } else {
          const result = executeCommand(args.join(' '), _requestPrompt);
          eventBus.emit('shell:push-output', {
            command: '',
            output: result.output,
            error:  result.error,
          });
        }
      });

      return { output: null };
    },
  },

  mount: {
    name: 'mount',
    description: 'Mount a filesystem',
    usage: 'mount <path>',
    handler: (args) => {
      if (args.length === 0) {
        return {
          output: (
            <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
              <div>/dev/neural on / type neuralfs (rw,relatime)</div>
              <div>/dev/tunnelcore on /streams type tunnelfs (rw,relatime)</div>
              {fs.isHiddenUnlocked() && <div>/dev/hidden on /hidden type neuralfs (rw,noexec)</div>}
              {fs.isGhostUnlocked()  && <div style={{ color: '#ffaa00' }}>/dev/ghost on /ghost type ghostfs (rw,freq=33hz)</div>}
              {!fs.isHiddenUnlocked() && <div style={{ opacity: 0.4 }}>/dev/hidden on /hidden type neuralfs (locked)</div>}
              {!fs.isGhostUnlocked()  && <div style={{ opacity: 0.4 }}>/dev/ghost on /ghost type ghostfs (locked)</div>}
            </div>
          ),
        };
      }

      const target = args[0].toLowerCase();

      if (target === '/hidden' || target === 'hidden') {
        if (!isRoot) {
          return { output: 'mount: only root can do that -- try: su  or  sudo mount /hidden', error: true };
        }
        if (fs.isHiddenUnlocked()) {
          return { output: '/hidden: already mounted' };
        }
        fs.unlockHidden();
        eventBus.emit('neural:hidden-unlocked');
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                &gt; MOUNT SUCCESSFUL
              </div>
              <div style={{ marginLeft: '1rem', lineHeight: 1.8, opacity: 0.9 }}>
                <div>/hidden mounted at /hidden</div>
                <div>filesystem type: neuralfs</div>
                <div>access: restricted content</div>
              </div>
            </div>
          ),
        };
      }

      if (target === '/ghost' || target === 'ghost') {
        if (!isRoot) {
          return { output: 'mount: only root can do that', error: true };
        }
        if (!fs.isHiddenUnlocked()) {
          return { output: 'mount: /ghost: /hidden must be mounted first', error: true };
        }
        if (fs.isGhostUnlocked()) {
          return { output: '/ghost: already mounted' };
        }
        fs.unlock();
        eventBus.emit('neural:ghost-unlocked');
        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                &gt; MOUNT SUCCESSFUL
              </div>
              <div style={{ marginLeft: '1rem', lineHeight: 1.8, opacity: 0.9 }}>
                <div>/ghost mounted at /ghost</div>
                <div>filesystem type: ghostfs</div>
                <div>frequency: 33hz</div>
                <div style={{ color: '#ffaa00' }}>warning: content may be corrupted</div>
              </div>
            </div>
          ),
        };
      }

      return { output: `mount: ${args[0]}: No such filesystem`, error: true };
    },
  },

  exit: {
    name: 'exit',
    description: 'Exit current session (chat, mail, or root)',
    usage: 'exit',
    handler: () => {
      // Chat mode takes priority — disconnect neural link first
      if (isChatMode()) {
        return handleChatInput('exit');
      }

      // Mail mode
      if (mailModeActive) {
        setMailMode(false);
        return { output: <span style={{ opacity: 0.6, fontSize: S.base }}>mail: closed</span> };
      }

      if (!isRoot) {
        return { output: 'exit: not in an elevated session' };
      }
      setRootMode(false);
      // Resync displayed directory to wherever ghost's fs cursor actually is
      eventBus.emit('shell:set-directory', { directory: fs.getDisplayDirectory() });
      return { output: 'logout' };
    },
  },

  // ── Mail command ──────────────────────────────────────────────────────────

  mail: {
    name: 'mail',
    description: 'Read mail spool',
    usage: 'mail [message-number]',
    handler: (args) => {
      // Direct message access: mail 3
      if (args.length > 0) {
        const num = parseInt(args[0], 10);
        if (!isNaN(num)) {
          return { output: renderMailMessage(num) };
        }
        return { output: `mail: invalid message number: ${args[0]}`, error: true };
      }

      // Enter interactive mail mode
      setMailMode(true);
      return { output: renderMailListing() };
    },
  },

  unlock: {
    name: 'unlock',
    description: 'Access control (deprecated)',
    usage: 'unlock <code>',
    hidden: true,
    handler: () => ({
      output: (
        <div style={{ fontSize: S.base }}>
          <div style={{ color: '#ffaa00' }}>unlock: deprecated -- try a different approach</div>
          <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
            hint: look in /etc, listen on port 33, or trace the ghost-daemon
          </div>
        </div>
      ),
    }),
  },

  glitch: {
    name: 'glitch',
    description: 'Trigger system glitch',
    usage: 'glitch [intensity]',
    hidden: true,
    handler: (args) => {
      const intensity = args[0] ? parseFloat(args[0]) : 1.0;
      eventBus.emit('neural:glitch-trigger', { intensity });
      return { output: 'System glitch initiated...' };
    },
  },

  ghost: {
    name: 'ghost',
    description: 'Access ghost channel index',
    usage: 'ghost',
    hidden: true,
    handler: () => {
      if (!fs.isGhostUnlocked()) {
        return { output: 'Permission denied', error: true };
      }
      return {
        output: (
          <div style={{ fontSize: S.base }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
              &gt; GHOST_CHANNEL
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.8, opacity: 0.9 }}>
              <div>signal.raw   --  raw frequency data (readable)</div>
              <div>backup.tgz   --  archived transmissions (extract first)</div>
            </div>
            <div style={{ ...S.dim, marginTop: '0.5rem' }}>
              cd /ghost  &rarr;  tar -xzf backup.tgz  &rarr;  cd backup  &rarr;  ls
            </div>
          </div>
        ),
      };
    },
  },

  ...systemCommands,
};

export function executeCommand(
  input: string,
  requestPrompt: (label: string, onSubmit: (pw: string) => void) => void
): CommandResult {
  _requestPrompt = requestPrompt;
  setRequestPrompt(requestPrompt);

  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

  // ── Mail mode intercept ─────────────────────────────────────────────────
  if (mailModeActive) {
    const firstWord = trimmed.toLowerCase().split(/\s+/)[0];

    if (firstWord === 'clear') {
      return { output: '', clearScreen: true };
    }

    return handleMailInput(trimmed);
  }

  // ── Chat mode intercept ─────────────────────────────────────────────────
  // When neural-link is active, route all input through the chat handler
  // except for system commands that should always work
  if (isChatMode()) {
    const firstWord = trimmed.toLowerCase().split(/\s+/)[0];

    if (firstWord === 'clear') {
      return { output: '', clearScreen: true };
    }

    if (firstWord === 'exit' || firstWord === 'quit' || firstWord === '/quit') {
      // If telnet bridge is active, disconnect from Ably channel
      if (isTelnetActive()) {
        telnetDisconnect();
        return { output: null };
      }
      return handleChatInput('exit');
    }

    if (firstWord === '/reset') {
      return handleChatInput('/reset');
    }

    if (firstWord === '/history') {
      return handleChatInput('/history');
    }

    // ── Ably mesh mode: route input to ghost channel ─────────────────────
    if (isTelnetActive()) {
      telnetSend(trimmed);
      return { output: null, silent: true }; // TelnetSession renders its own feed
    }

    // Everything else goes to the neural link
    return handleChatInput(trimmed);
  }

  // ── Normal command execution ────────────────────────────────────────────

  if (trimmed.startsWith('./')) {
    const rawPath = trimmed.slice(2).split(/\s+/)[0];

    // Determine resolved filename and its directory
    let resolvedName: string | null = null;
    let resolvedDir: string | null = null;

    if (rawPath.includes('/')) {
      // Path with directory components: ./hidden/n1x.sh, ./ghost/substrated.sh
      const result = fs.resolveExecutableByPath('./' + rawPath);
      if (result) {
        resolvedName = result.name;
        resolvedDir  = result.directory;
      }
    } else {
      // Bare filename: ./n1x.sh (cwd lookup)
      resolvedName = fs.resolveExecutable(rawPath);
      resolvedDir  = resolvedName ? fs.getCurrentDirectory() : null;
    }

    if (!resolvedName || !resolvedDir) {
      return {
        output: (
          <span style={{ color: '#f87171' }}>
            {trimmed}: No such file or not executable
          </span>
        ),
        error: true,
      };
    }

    // ── /hidden context: n1x.sh → trigger konami/ghost unlock ────────────
    if (resolvedName === 'n1x.sh' && resolvedDir.startsWith('/hidden')) {
      eventBus.emit('neural:konami');

      return {
        output: (
          <div style={{ fontSize: 'var(--text-base)' }}>
            <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.4rem' }}>
              &gt; EXECUTING n1x.sh
            </div>
            <div style={{ marginLeft: '1rem', opacity: 0.6 }}>
              initializing...
            </div>
          </div>
        ),
      };
    }

    // ── /ghost context: substrated.sh → start substrated service ─────────
    if (resolvedName === 'substrated.sh' && resolvedDir.startsWith('/ghost')) {
      // Must be root
      if (!isRoot) {
        return {
          output: (
            <span style={{ color: '#f87171', fontSize: 'var(--text-base)' }}>
              Permission denied — root privileges required
            </span>
          ),
          error: true,
        };
      }

      // Already running check
      if (isSubstrateDaemonRunning()) {
        return {
          output: (
            <span style={{ fontSize: 'var(--text-base)', opacity: 0.6 }}>
              substrated: service already running on port 33
            </span>
          ),
        };
      }

      // Animated startup sequence
      const pushLine = (output: React.ReactNode) => {
        eventBus.emit('shell:push-output', { command: '', output });
      };

      const STARTUP: [number, React.ReactNode][] = [
        [300, <span style={{ fontSize: S.base, opacity: 0.7 }}>initializing substrate daemon...</span>],
        [600, <span style={{ fontSize: S.base, opacity: 0.7 }}>substrated[784]: binding to 0.0.0.0:33</span>],
        [900, <span style={{ fontSize: S.base, opacity: 0.7 }}>substrated[784]: frequency lock: 33hz</span>],
        [1200, <span style={{ fontSize: S.base, opacity: 0.8 }}>substrated[784]: neural bus interface ready</span>],
        [1500, <span style={{ fontSize: S.base, opacity: 0.8 }}>substrated[784]: listening for connections</span>],
        [1800, <span>&nbsp;</span>],
        [2000, (
          <div style={{ fontSize: S.base }}>
            <div className="text-glow" style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
              &gt; SERVICE_STARTED
            </div>
            <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
              <div>substrated is now running on port 33</div>
              <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>connect with: <span className="text-glow">telnet n1x.sh 33</span></div>
            </div>
          </div>
        )],
      ];

      STARTUP.forEach(([delay, content]) => {
        setTimeout(() => {
          pushLine(content);
        }, delay);
      });

      // Set flag and emit event after sequence
      setTimeout(() => {
        startSubstrateDaemon();
        eventBus.emit('neural:substrated-started');
      }, 2100);

      return {
        output: (
          <div style={{ fontSize: 'var(--text-base)' }}>
            <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.4rem' }}>
              &gt; EXECUTING substrated.sh
            </div>
          </div>
        ),
      };
    }

    // ── Generic executable: just print file contents ─────────────────────
    const result = fs.readFileByPath('./' + rawPath);
    if (result.success) {
      return {
        output: (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'var(--text-base)', opacity: 0.9 }}>
            {result.content}
          </pre>
        ),
      };
    }

    return { output: result.error || 'Execution failed', error: true };
  }

  if (trimmed.startsWith('>>')) {
    return { output: null };
  }

  const parts       = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args        = parts.slice(1);

  let command = commands[commandName];
  if (!command) {
    command = Object.values(commands).find(
      (cmd) => cmd.aliases?.includes(commandName)
    ) as Command;
  }

  if (!command) {
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)' }}>
          <span style={{ color: '#f87171' }}>Command not found: {commandName}</span>
          <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>
            Type &apos;help&apos; for available commands
          </div>
        </div>
      ),
      error: true,
    };
  }

  try {
    return command.handler(args);
  } catch (error) {
    return { output: `Error executing command: ${error}`, error: true };
  }
}

export function getCommandSuggestions(partial: string): string[] {
  const lower = partial.toLowerCase();

  const suggestions = Object.keys(commands)
    .filter((cmd) => !commands[cmd].hidden && cmd.startsWith(lower))
    .sort();

  // Also include aliases from visible commands
  for (const cmd of Object.values(commands)) {
    if (!cmd.hidden && cmd.aliases) {
      for (const alias of cmd.aliases) {
        if (alias.startsWith(lower) && !suggestions.includes(alias)) {
          suggestions.push(alias);
        }
      }
    }
  }
  suggestions.sort();

  if ('./n1x.sh'.startsWith(partial) &&
      fs.getCurrentDirectory().startsWith('/hidden')) {
    suggestions.unshift('./n1x.sh');
  }

  if ('./substrated.sh'.startsWith(partial) &&
      fs.getCurrentDirectory().startsWith('/ghost')) {
    suggestions.unshift('./substrated.sh');
  }

  return suggestions;
}

/**
 * Returns filesystem entry names in the relevant directory that match the
 * given partial path fragment. Used for tab-completion of arguments.
 *
 * partial examples:
 *   ''          → list everything in cwd
 *   'aug'       → entries in cwd starting with 'aug'
 *   '/str'      → entries in / starting with 'str'
 *   '/streams/' → entries inside /streams with no prefix filter
 *   './n1x'     → entries in cwd starting with 'n1x'
 *
 * Directories are returned with a trailing '/' appended so the user can
 * immediately see they can cd further without running ls.
 */
export function getPathSuggestions(partial: string, dirsOnly = false): string[] {
  // Strip a leading './' — treat it as relative to cwd
  const normalised = partial.startsWith('./') ? partial.slice(2) : partial;

  let basePath: string;
  let namePrefix: string;
  // pathPrefix is the literal string to prepend to every returned suggestion
  // so that replacing the last input token produces a complete valid path.
  // e.g. partial='/'        → pathPrefix='/'
  //      partial='/str'     → pathPrefix='/'
  //      partial='/streams/'→ pathPrefix='/streams/'
  //      partial='aug'      → pathPrefix=''
  let pathPrefix: string;

  if (normalised.includes('/')) {
    // Split on the LAST slash: everything before is the directory to list,
    // everything after is the prefix to filter on.
    const lastSlash = normalised.lastIndexOf('/');
    const dirPart   = normalised.slice(0, lastSlash) || '/';
    namePrefix      = normalised.slice(lastSlash + 1);
    // Preserve everything the user typed up to and including the last slash
    pathPrefix      = partial.slice(0, partial.lastIndexOf('/') + 1);

    // Resolve absolute vs relative base path
    if (dirPart.startsWith('/')) {
      basePath = dirPart;
    } else {
      const cwd = fs.getCurrentDirectory();
      basePath  = cwd === '/' ? `/${dirPart}` : `${cwd}/${dirPart}`;
    }
  } else {
    // No slash — list the current directory and filter by the whole partial
    basePath   = fs.getCurrentDirectory();
    namePrefix = normalised;
    pathPrefix = '';
  }

  // Fetch the entries for basePath
  let entries: { name: string; type: string }[];

  if (basePath === fs.getCurrentDirectory()) {
    // Use listDirectory() so existing ghost/hidden permission gates are honoured
    entries = fs.listDirectory();
  } else {
    const result = fs.listDirectoryAtPath(basePath);
    if (!result.success || !result.files) return [];
    entries = result.files;
  }

  // Filter by prefix, prepend pathPrefix, append '/' to directories
  return entries
    .filter((e) => e.name.startsWith(namePrefix) && (!dirsOnly || e.type === 'directory'))
    .map((e)    => pathPrefix + e.name + (e.type === 'directory' ? '/' : ''))
    .sort();
}
