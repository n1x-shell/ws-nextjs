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

    const visibleCommands = Object.values(commands).filter((cmd) => !cmd.hidden);
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
