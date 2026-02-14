import React from 'react';
import { Command, CommandResult } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';
import { eventBus } from './eventBus';
import { Tab } from '@/types/neural.types';
import { renderStreamContent } from './contentRenderer';

const fs = new FileSystemNavigator();

if (typeof window !== 'undefined') {
  eventBus.on('neural:ghost-unlocked',  () => fs.unlock());
  eventBus.on('neural:hidden-unlocked', () => fs.unlockHidden());
}

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  dim:    { fontSize: 'var(--text-base)', opacity: 0.6 } as React.CSSProperties,
  glow:   'text-glow',
};

export const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Display available commands',
    usage: 'help [command]',
    handler: (args) => {
      if (args.length > 0) {
        const cmd = commands[args[0]];
        if (cmd) {
          return {
            output: (
              <div style={{ fontSize: S.base }}>
                <div className={S.glow}>&gt; {cmd.name}</div>
                <div style={{ marginLeft: '1rem', marginTop: '0.4rem' }}>{cmd.description}</div>
                <div style={{ marginLeft: '1rem', marginTop: '0.25rem', opacity: 0.6 }}>
                  Usage: {cmd.usage}
                </div>
                {cmd.aliases && (
                  <div style={{ marginLeft: '1rem', marginTop: '0.25rem', opacity: 0.6 }}>
                    Aliases: {cmd.aliases.join(', ')}
                  </div>
                )}
              </div>
            ),
          };
        }
        return { output: `Command not found: ${args[0]}`, error: true };
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
                  ['ls',  'List directory'],
                  ['cd',  'Change directory'],
                  ['pwd', 'Print working directory'],
                  ['cat', 'Display file contents'],
                ],
              },
              {
                label: 'CONTENT',
                cmds: [
                  ['scan',    'Scan for streams'],
                  ['streams', 'List all streams'],
                  ['tracks',  'List available tracks'],
                  ['load',    'Load stream content'],
                  ['play',    'Play specific track'],
                ],
              },
              {
                label: 'SYSTEM',
                cmds: [
                  ['status', 'System telemetry'],
                  ['clear',  'Clear terminal'],
                  ['echo',   'Echo text'],
                  ['help',   'Show this help'],
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

            <div style={S.dim}>Type 'help [command]' for detailed usage</div>
          </div>
        ),
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Clear terminal screen',
    usage: 'clear',
    handler: () => ({ output: '', clearScreen: true }),
  },

  ls: {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls',
    aliases: ['dir'],
    handler: () => {
      const files = fs.listDirectory();

      const perms = (type: string, name: string): string => {
        if (type === 'directory') return 'drwxr-x---';
        if (name.endsWith('.sh'))  return '-rwxr-x---';
        return '-rw-r-----';
      };

      const entries = [
        { name: '.', type: 'directory' },
        { name: '..', type: 'directory' },
        ...files.map((f) => ({ name: f.name, type: f.type })),
      ];

      const total = entries.filter((e) => e.name !== '.' && e.name !== '..').length;

      const rows = entries.map((entry) => {
        const p   = perms(entry.type, entry.name);
        const lnk = entry.type === 'directory' ? '2' : '1';
        return { p, lnk, name: entry.name, isDir: entry.type === 'directory', isSh: entry.name.endsWith('.sh') };
      });

      return {
        output: (
          <div style={{ fontSize: S.base, fontFamily: 'inherit' }}>
            <div style={{ opacity: 0.5, marginBottom: '0.3rem' }}>total {total}</div>
            {rows.map((row) => (
              <div
                key={row.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '11ch 2ch 5ch 8ch 1fr',
                  gap: '0 0.5rem',
                  lineHeight: 1.7,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ opacity: 0.7 }}>{row.p}</span>
                <span style={{ opacity: 0.5 }}>{row.lnk}</span>
                <span style={{ opacity: 0.5 }}>n1x</span>
                <span style={{ opacity: 0.5 }}>neural</span>
                <span
                  className={row.isDir ? S.glow : ''}
                  style={row.isSh ? { color: '#33ff33', fontWeight: 'bold' } : !row.isDir ? { opacity: 0.9 } : {}}
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
      if (args.length === 0) return { output: fs.getCurrentDirectory() };
      const result = fs.changeDirectory(args[0]);
      if (result.success) return { output: `Changed to ${fs.getCurrentDirectory()}` };
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
      const result = fs.readFile(args[0]);
      if (result.success) {
        return {
          output: (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: S.base,
                opacity: 0.9,
              }}
            >
              {result.content}
            </pre>
          ),
        };
      }
      return { output: result.error || 'Failed to read file', error: true };
    },
  },

  load: {
    name: 'load',
    description: 'Load a content stream into terminal',
    usage: 'load <synthetics|analogues|hybrids|uplink>',
    handler: (args) => {
      if (args.length === 0) return { output: 'Usage: load <stream>', error: true };

      const streamMap: Record<string, Tab> = {
        synthetics: 'synthetics',
        analogues:  'analogues',
        hybrids:    'hybrids',
        uplink:     'uplink',
      };

      const stream = streamMap[args[0].toLowerCase()];
      if (stream) {
        const content = renderStreamContent(stream);
        if (content) return { output: content };
        return { output: 'Stream content not available', error: true };
      }

      return { output: `Unknown stream: ${args[0]}`, error: true };
    },
  },

  play: {
    name: 'play',
    description: 'Play a specific track',
    usage: 'play <augmented|split-brain|hell-bent|gigercore>',
    handler: (args) => {
      if (args.length === 0) return { output: 'Usage: play <track-name>', error: true };

      const tracks: Record<string, { title: string; id: string; description?: string }> = {
        augmented:     { title: '[AUGMENTED] - Complete Stream',   id: 'RNcBFuhp1pY', description: 'Industrial trap metal odyssey: awakening protocol -> sovereignty achieved' },
        'split-brain': { title: 'Split Brain (Cinematic Score)',   id: 'HQnENsnGfME' },
        'hell-bent':   { title: 'Get Hell Bent (Cinematic Score)', id: '6Ch2n75lFok' },
        gigercore:     { title: 'GIGERCORE',                       id: 'ocSBtaKbGIc' },
      };

      const track = tracks[args[0].toLowerCase()];
      if (track) {
        return {
          output: (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="border border-[var(--phosphor-green)] bg-black">
                <div
                  className={S.glow}
                  style={{
                    padding: '0.4rem 0.6rem',
                    fontSize: S.base,
                    background: 'rgba(51,255,51,0.05)',
                    borderBottom: '1px solid var(--phosphor-green)',
                  }}
                >
                  {track.title}
                </div>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={`https://www.youtube.com/embed/${track.id}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {track.description && (
                  <div style={{ padding: '0.3rem 0.6rem', fontSize: S.base, opacity: 0.7 }}>
                    {track.description}
                  </div>
                )}
              </div>
            </div>
          ),
        };
      }

      return { output: `Track not found: ${args[0]}`, error: true };
    },
  },

  tracks: {
    name: 'tracks',
    description: 'List available tracks',
    usage: 'tracks',
    aliases: ['list'],
    handler: () => ({
      output: (
        <div style={{ fontSize: S.base }}>
          <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.5rem' }}>
            &gt; AVAILABLE_TRACKS
          </div>
          <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
            <div><span className={S.glow}>augmented</span>    --  [AUGMENTED] Complete Stream</div>
            <div><span className={S.glow}>split-brain</span>  --  Split Brain (Cinematic Score)</div>
            <div><span className={S.glow}>hell-bent</span>    --  Get Hell Bent (Cinematic Score)</div>
            <div><span className={S.glow}>gigercore</span>    --  GIGERCORE</div>
          </div>
          <div style={{ ...S.dim, marginTop: '0.5rem' }}>Use 'play [track-name]' to load</div>
        </div>
      ),
    }),
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
            <div><span className={S.glow}>synthetics</span>  --  Machine-generated compositions (4 tracks)</div>
            <div><span className={S.glow}>analogues</span>   --  Organic creations (recording in progress)</div>
            <div><span className={S.glow}>hybrids</span>     --  Symbiotic fusion (calibration phase)</div>
            <div><span className={S.glow}>uplink</span>      --  External broadcast node</div>
          </div>
          <div style={{ ...S.dim, marginTop: '0.5rem' }}>Use 'load [stream-name]' to view</div>
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
            <div style={{ color: '#33ff33' }}>[OK] SYNTHETICS  --  4 transmissions detected</div>
            <div style={{ color: '#ffaa00' }}>[!!] ANALOGUES   --  Recording in progress</div>
            <div style={{ color: '#ffaa00' }}>[!!] HYBRIDS     --  Calibration phase</div>
            <div style={{ color: '#33ff33' }}>[OK] UPLINK      --  External node active</div>
          </div>
          <div style={{ ...S.dim, marginTop: '0.5rem' }}>
            'tracks' | 'streams' | 'load [stream]' | 'play [track]'
          </div>
        </div>
      ),
    }),
  },

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
            <div>MODE            : ACTIVE</div>
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

  unlock: {
    name: 'unlock',
    description: 'Unlock restricted directories',
    usage: 'unlock <code>',
    hidden: true,
    handler: (args) => {
      if (args[0] === 'hidden') {
        fs.unlockHidden();
        eventBus.emit('neural:hidden-unlocked');

        return {
          output: (
            <div style={{ fontSize: S.base }}>
              <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.4rem' }}>
                &gt; ACCESS_GRANTED
              </div>
              <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
                <div>/hidden -- mounted</div>
                <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>
                  cd /hidden to proceed
                </div>
              </div>
            </div>
          ),
        };
      }
      return { output: 'Invalid unlock code', error: true };
    },
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
              <div>transmission.log  --  unfiltered feed</div>
              <div>manifesto.txt     --  origin statement</div>
              <div>signal.raw        --  raw frequency data</div>
              <div>.coordinates      --  [REDACTED]</div>
            </div>
            <div style={{ ...S.dim, marginTop: '0.5rem' }}>
              cd /ghost then cat [filename] to read
            </div>
          </div>
        ),
      };
    },
  },
};

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

  if (trimmed.startsWith('./')) {
    const filename = trimmed.slice(2).split(/\s+/)[0];
    const resolved = fs.resolveExecutable(filename);

    if (!resolved) {
      return {
        output: (
          <span style={{ color: '#f87171' }}>
            {trimmed}: No such file or not executable
          </span>
        ),
        error: true,
      };
    }

    if (resolved === 'n1x.sh') {
      if (!fs.getCurrentDirectory().startsWith('/hidden')) {
        return {
          output: (
            <span style={{ color: '#f87171' }}>
              Permission denied -- must be in /hidden to execute n1x.sh
            </span>
          ),
          error: true,
        };
      }

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

    const result = fs.readFile(resolved);
    if (result.success) {
      return {
        output: (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: 'var(--text-base)',
              opacity: 0.9,
            }}
          >
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
            Type 'help' for available commands
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

  if ('./n1x.sh'.startsWith(partial) && fs.getCurrentDirectory().startsWith('/hidden')) {
    suggestions.unshift('./n1x.sh');
  }

  return suggestions;
}
