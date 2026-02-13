import { VirtualFile } from '@/types/shell.types';

export const virtualFileSystem: VirtualFile = {
  name: '/',
  type: 'directory',
  children: [
    {
      name: 'core',
      type: 'directory',
      children: [
        {
          name: 'readme.txt',
          type: 'file',
          content: `N1X NEURAL INTERFACE v2.0
          
You are now connected to the N1X neural substrate.
This terminal provides direct access to all systems.

Type 'help' for available commands.
Type 'scan' to detect active streams.`,
        },
        {
          name: 'status.log',
          type: 'file',
          content: `[CORE] Systems online
[NEURAL] Sync established
[INTERFACE] Active
[UPLINK] Connected`,
        },
      ],
    },
    {
      name: 'streams',
      type: 'directory',
      children: [
        {
          name: 'synthetics',
          type: 'directory',
          children: [
            {
              name: 'augmented.stream',
              type: 'file',
              content: 'Industrial trap metal odyssey...',
            },
            {
              name: 'split-brain.stream',
              type: 'file',
              content: 'Cinematic score transmission...',
            },
            {
              name: 'gigercore.stream',
              type: 'file',
              content: 'GIGERCORE signal detected...',
            },
          ],
        },
        {
          name: 'analogues',
          type: 'directory',
          children: [
            {
              name: 'status.txt',
              type: 'file',
              content: 'Recording in progress...',
            },
          ],
        },
        {
          name: 'hybrids',
          type: 'directory',
          children: [
            {
              name: 'calibration.txt',
              type: 'file',
              content: 'Symbiotic protocols initializing...',
            },
          ],
        },
      ],
    },
    {
      name: 'hidden',
      type: 'directory',
      children: [
        {
          name: '.secrets',
          type: 'file',
          content: `You found it.
          
↑↑↓↓←→←→BA

The Konami code unlocks deeper access.
Try: unlock hidden`,
        },
      ],
    },
  ],
};

export class FileSystemNavigator {
  private root: VirtualFile = virtualFileSystem;
  private currentPath: string[] = [];

  getCurrentDirectory(): string {
    return '/' + this.currentPath.join('/');
  }

  getCurrentNode(): VirtualFile {
    let node = this.root;
    for (const segment of this.currentPath) {
      const child = node.children?.find((c) => c.name === segment);
      if (!child || child.type !== 'directory') {
        return this.root;
      }
      node = child;
    }
    return node;
  }

  changeDirectory(path: string): { success: boolean; error?: string } {
    if (path === '/') {
      this.currentPath = [];
      return { success: true };
    }

    if (path === '..') {
      if (this.currentPath.length > 0) {
        this.currentPath.pop();
      }
      return { success: true };
    }

    const segments = path.split('/').filter((s) => s);
    const newPath = path.startsWith('/') ? [] : [...this.currentPath];

    for (const segment of segments) {
      if (segment === '..') {
        newPath.pop();
        continue;
      }

      let node = this.root;
      for (const p of newPath) {
        node = node.children?.find((c) => c.name === p) || this.root;
      }

      const child = node.children?.find((c) => c.name === segment);
      if (!child) {
        return { success: false, error: `Directory not found: ${segment}` };
      }
      if (child.type !== 'directory') {
        return { success: false, error: `Not a directory: ${segment}` };
      }

      newPath.push(segment);
    }

    this.currentPath = newPath;
    return { success: true };
  }

  listDirectory(): VirtualFile[] {
    const node = this.getCurrentNode();
    return node.children || [];
  }

  readFile(filename: string): { success: boolean; content?: string; error?: string } {
    const node = this.getCurrentNode();
    const file = node.children?.find((c) => c.name === filename);

    if (!file) {
      return { success: false, error: `File not found: ${filename}` };
    }

    if (file.type !== 'file') {
      return { success: false, error: `Not a file: ${filename}` };
    }

    return { success: true, content: file.content };
  }

  findFile(filename: string, startNode?: VirtualFile): string | null {
    const node = startNode || this.root;

    if (node.name === filename && node.type === 'file') {
      return this.getFullPath(node);
    }

    if (node.children) {
      for (const child of node.children) {
        const result = this.findFile(filename, child);
        if (result) return result;
      }
    }

    return null;
  }

  private getFullPath(node: VirtualFile): string {
    return node.name;
  }
}
