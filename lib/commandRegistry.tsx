import { Command, CommandResult } from '@/types/shell.types';
import { FileSystemNavigator } from './virtualFS';
import { eventBus } from './eventBus';
import { Tab } from '@/types/neural.types';
import { renderStreamContent } from './contentRenderer';

const fs = new FileSystemNavigator();

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
              <div>
                <div className="text-glow">&gt; {cmd.name}</div>
                <div className="ml-4 mt-2">{cmd.description}</div>
                <div className="ml-4 mt-1 opacity-60">Usage: {cmd.usage}</div>
                {cmd.aliases && (
                  <div className="ml-4 mt-1 opacity-60">
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
          <div>
            <div className="text-glow mb-3">&gt; AVAILABLE_COMMANDS</div>
            
            <div className="mb-3">
              <div className="text-glow text-sm mb-1">// NAVIGATION</div>
              <div className="ml-4 text-sm space-y-1">
                <div><span className="text-glow">ls</span> <span className="opacity-60">- List directory</span></div>
                <div><span className="text-glow">cd</span> <span className="opacity-60">- Change directory</span></div>
                <div><span className="text-glow">pwd</span> <span className="opacity-60">- Print working directory</span></div>
                <div><span className="text-glow">cat</span> <span className="opacity-60">- Display file contents</span></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-glow text-sm mb-1">// CONTENT</div>
              <div className="ml-4 text-sm space-y-1">
                <div><span className="text-glow">scan</span> <span className="opacity-60">- Scan for streams</span></div>
                <div><span className="text-glow">streams</span> <span className="opacity-60">- List all streams</span></div>
                <div><span className="text-glow">tracks</span> <span className="opacity-60">- List available tracks</span></div>
                <div><span className="text-glow">load</span> <span className="opacity-60">- Load stream content</span></div>
                <div><span className="text-glow">play</span> <span className="opacity-60">- Play specific track</span></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-glow text-sm mb-1">// SYSTEM</div>
              <div className="ml-4 text-sm space-y-1">
                <div><span className="text-glow">status</span> <span className="opacity-60">- System status</span></div>
                <div><span className="text-glow">clear</span> <span className="opacity-60">- Clear terminal</span></div>
                <div><span className="text-glow">echo</span> <span className="opacity-60">- Echo text</span></div>
                <div><span className="text-glow">help</span> <span className="opacity-60">- Show this help</span></div>
              </div>
            </div>

            <div className="mt-4 opacity-60 text-sm">
              Type 'help [command]' for detailed usage
            </div>
          </div>
        ),
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Clear terminal screen',
    usage: 'clear',
    handler: () => {
      return { output: '', clearScreen: true };
    },
  },

  ls: {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls',
    aliases: ['dir'],
    handler: () => {
      const files = fs.listDirectory();
      return {
        output: (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {files.map((file) => (
              <div key={file.name} className={file.type === 'directory' ? 'text-glow' : 'opacity-80'}>
                {file.type === 'directory' ? '📁' : '📄'} {file.name}
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
        return { output: fs.getCurrentDirectory() };
      }

      const result = fs.changeDirectory(args[0]);
      if (result.success) {
        return { output: `Changed to ${fs.getCurrentDirectory()}` };
      }
      return { output: result.error || 'Failed to change directory', error: true };
    },
  },

  pwd: {
    name: 'pwd',
    description: 'Print working directory',
    usage: 'pwd',
    handler: () => {
      return { output: fs.getCurrentDirectory() };
    },
  },

  cat: {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat <filename>',
    handler: (args) => {
      if (args.length === 0) {
        return { output: 'Usage: cat <filename>', error: true };
      }

      const result = fs.readFile(args[0]);
      if (result.success) {
        return {
          output: (
            <pre className="whitespace-pre-wrap font-mono text-sm opacity-90">
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
      if (args.length === 0) {
        return { output: 'Usage: load <stream>', error: true };
      }

      const streamMap: Record<string, Tab> = {
        synthetics: 'synthetics',
        analogues: 'analogues',
        hybrids: 'hybrids',
        uplink: 'uplink',
      };

      const stream = streamMap[args[0].toLowerCase()];
      if (stream) {
        const content = renderStreamContent(stream);
        if (content) {
          return { output: content };
        }
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
      if (args.length === 0) {
        return { output: 'Usage: play <track-name>', error: true };
      }

      const tracks: Record<string, { title: string; id: string; description?: string }> = {
        augmented: {
          title: '[AUGMENTED] - Complete Stream',
          id: 'RNcBFuhp1pY',
          description: 'Industrial trap metal odyssey: awakening protocol → sovereignty achieved',
        },
        'split-brain': {
          title: 'Split Brain (Cinematic Score)',
          id: 'HQnENsnGfME',
        },
        'hell-bent': {
          title: 'Get Hell Bent (Cinematic Score)',
          id: '6Ch2n75lFok',
        },
        gigercore: {
          title: 'GIGERCORE',
          id: 'ocSBtaKbGIc',
        },
      };

      const track = tracks[args[0].toLowerCase()];
      if (track) {
        return {
          output: (
            <div className="my-3">
              <div className="border border-[var(--phosphor-green)] bg-black">
                <div 
                  className="px-2 py-2 text-base text-glow"
                  style={{ background: 'rgba(51, 255, 51, 0.05)', borderBottom: '1px solid var(--phosphor-green)' }}
                >
                  {track.title}
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${track.id}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {track.description && (
                  <div className="px-2 py-2 text-xs opacity-70">
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
    handler: () => {
      return {
        output: (
          <div>
            <div className="text-glow mb-2">&gt; AVAILABLE_TRACKS</div>
            <div className="ml-4 space-y-1">
              <div>augmented - [AUGMENTED] Complete Stream</div>
              <div>split-brain - Split Brain (Cinematic Score)</div>
              <div>hell-bent - Get Hell Bent (Cinematic Score)</div>
              <div>gigercore - GIGERCORE</div>
            </div>
            <div className="mt-3 opacity-60 text-sm">
              Use 'play [track-name]' to load a track
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
    handler: () => {
      return {
        output: (
          <div>
            <div className="text-glow mb-2">&gt; AVAILABLE_STREAMS</div>
            <div className="ml-4 space-y-1">
              <div className="text-glow">synthetics</div>
              <div className="ml-4 opacity-80">Machine-generated compositions (4 tracks)</div>
              <div className="text-glow mt-2">analogues</div>
              <div className="ml-4 opacity-80">Organic creations (recording in progress)</div>
              <div className="text-glow mt-2">hybrids</div>
              <div className="ml-4 opacity-80">Symbiotic fusion (calibration phase)</div>
              <div className="text-glow mt-2">uplink</div>
              <div className="ml-4 opacity-80">External broadcast node</div>
            </div>
            <div className="mt-3 opacity-60 text-sm">
              Use 'load [stream-name]' to view stream content
            </div>
          </div>
        ),
      };
    },
  },

  scan: {
    name: 'scan',
    description: 'Scan for active streams',
    usage: 'scan',
    handler: () => {
      return {
        output: (
          <div>
            <div className="text-glow mb-2">&gt; SCANNING_NEURAL_STREAMS...</div>
            <div className="ml-4 space-y-1">
              <div className="text-[#33ff33]">✓ SYNTHETICS - 4 transmissions detected</div>
              <div className="text-[#ffaa00]">⚠ ANALOGUES - Recording in progress</div>
              <div className="text-[#ffaa00]">⚠ HYBRIDS - Calibration phase</div>
              <div className="text-[#33ff33]">✓ UPLINK - External node active</div>
            </div>
            <div className="mt-3 opacity-60 text-sm">
              Commands: 'tracks' | 'streams' | 'load [stream]' | 'play [track]'
            </div>
          </div>
        ),
      };
    },
  },

  status: {
    name: 'status',
    description: 'Display system status',
    usage: 'status',
    handler: () => {
      return {
        output: (
          <div>
            <div className="text-glow mb-2">&gt; SYSTEM_STATUS</div>
            <div className="ml-4 space-y-1 font-mono text-sm">
              <div>NEURAL_SYNC: 85%</div>
              <div>MEMORY_BUFFER: 62%</div>
              <div>SIGNAL_STRENGTH: 78%</div>
              <div>UPLINK: ACTIVE</div>
              <div>MODE: ACTIVE</div>
            </div>
          </div>
        ),
      };
    },
  },

  echo: {
    name: 'echo',
    description: 'Echo text to terminal',
    usage: 'echo <text>',
    handler: (args) => {
      return { output: args.join(' ') };
    },
  },

  unlock: {
    name: 'unlock',
    description: 'Unlock hidden features',
    usage: 'unlock <code>',
    hidden: true,
    handler: (args) => {
      if (args[0] === 'hidden') {
        eventBus.emit('shell:unlock', { code: 'hidden' });
        return {
          output: (
            <div>
              <div className="text-glow mb-2">&gt; ACCESS_GRANTED</div>
              <div className="ml-4">Hidden systems now accessible.</div>
              <div className="ml-4 mt-2 opacity-60">Try 'cd /hidden'</div>
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
};

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: '' };
  }

  const parts = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  let command = commands[commandName];
  if (!command) {
    command = Object.values(commands).find(
      (cmd) => cmd.aliases?.includes(commandName)
    ) as Command;
  }

  if (!command) {
    return {
      output: (
        <div>
          <span className="text-red-400">Command not found: {commandName}</span>
          <div className="mt-1 opacity-60 text-sm">Type 'help' for available commands</div>
        </div>
      ),
      error: true,
    };
  }

  try {
    return command.handler(args);
  } catch (error) {
    return {
      output: `Error executing command: ${error}`,
      error: true,
    };
  }
}

export function getCommandSuggestions(partial: string): string[] {
  const lower = partial.toLowerCase();
  return Object.keys(commands)
    .filter((cmd) => !commands[cmd].hidden && cmd.startsWith(lower))
    .sort();
}
