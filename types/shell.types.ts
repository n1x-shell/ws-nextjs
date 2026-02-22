import { ReactNode } from 'react';

export interface VirtualFile {
  name: string;
  type: 'file' | 'directory';
  children?: VirtualFile[];
  content?: string;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  hidden?: boolean;
  handler: (args: string[]) => CommandResult;
}

export interface CommandResult {
  output: ReactNode | string | null;
  error?: boolean;
  clearScreen?: boolean;
  silent?: boolean; // if true, suppress history entry (used by telnet bridge routing)
}

export interface CommandOutput {
  id: string;
  command: string;
  output: ReactNode | string | null;
  timestamp: number;
  error?: boolean;
  cwd?: string;
  user?: string;
  chatMode?: boolean;
}

export interface ShellState {
  history: CommandOutput[];
  currentDirectory: string;
  commandHistory: string[];
  historyIndex: number;
}
