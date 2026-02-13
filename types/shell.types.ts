export type CommandOutput = {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: number;
  error?: boolean;
};

export type CommandHandler = (args: string[]) => CommandResult;

export type CommandResult = {
  output: React.ReactNode;
  error?: boolean;
  clearScreen?: boolean;
};

export interface Command {
  name: string;
  description: string;
  usage: string;
  handler: CommandHandler;
  hidden?: boolean;
  aliases?: string[];
}

export interface VirtualFile {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: VirtualFile[];
}

export interface ShellState {
  history: CommandOutput[];
  currentDirectory: string;
  commandHistory: string[];
  historyIndex: number;
}
