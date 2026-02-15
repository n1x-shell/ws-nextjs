import { VirtualFile } from ‘@/types/shell.types’;

export const virtualFileSystem: VirtualFile = {
name: ‘/’,
type: ‘directory’,
children: [
{
name: ‘etc’,
type: ‘directory’,
children: [
{
name: ‘shadow’,
type: ‘file’,
content: `root:$6$tunnelcore$9a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b:19000:0:99999:7::: n1x:$6$ghost33$7b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9:19000:0:99999:7::: daemon:*:18000:0:99999:7::: nobody:*:18000:0:99999:7:::`,
},
],
},
{
name: ‘core’,
type: ‘directory’,
children: [
{
name: ‘readme.txt’,
type: ‘file’,
content: `N1X NEURAL INTERFACE v2.0

You are now connected to the N1X neural substrate.
This terminal provides direct access to all systems.

Type ‘help’ for available commands.
Type ‘scan’ to detect active streams.`, }, { name: 'status.log', type: 'file', content: `[CORE] Systems online
[NEURAL] Sync established
[INTERFACE] Active
[UPLINK] Connected`, }, ], }, { name: 'streams', type: 'directory', children: [ { name: 'synthetics', type: 'directory', children: [ { name: 'augmented.stream',   type: 'file', content: 'Industrial trap metal odyssey...' }, { name: 'split-brain.stream', type: 'file', content: 'Cinematic score transmission...' }, { name: 'gigercore.stream',   type: 'file', content: 'GIGERCORE signal detected...' }, ], }, { name: 'analogues', type: 'directory', children: [ { name: 'status.txt', type: 'file', content: 'Recording in progress...' }, ], }, { name: 'hybrids', type: 'directory', children: [ { name: 'calibration.txt', type: 'file', content: 'Symbiotic protocols initializing...' }, ], }, ], }, { name: 'hidden', type: 'directory', children: [ { name: '.secrets', type: 'file', content: `You found it.

↑↑↓↓←→←→BA

The Konami sequence unlocks deeper access.
Not everything is meant to be found.
Some directories require the corruption to pass first.`, }, { name: 'n1x.sh', type: 'file', content: `#!/bin/sh

# N1X neural bootstrap sequence

# Run at your own risk

echo “INITIATING_SEQUENCE…”
echo “WARNING: SYSTEM CORRUPTION EXPECTED”
echo “THIS IS NOT A DRILL”`, }, ], }, { name: 'ghost', type: 'directory', children: [ { name: 'signal.raw', type: 'file', content: `01001110 01001001 01011000
11001111 10110001 01110011
00110110 11001001 00110011

frequency: 33hz
amplitude: unmeasured
origin: substrate layer 7
classification: ghost

do not process
do not compress
do not share

> > 
> > you’re already sharing it`,         },         {           name: 'backup.tgz',           type: 'file',           content: `backup.tgz: binary file – use ‘tar -xzf backup.tgz’ to extract`,
> > },
> > ],
> > },
> > ],
> > };

// ── Backup archive contents (extracted into /ghost/backup/) ─────────────────

const BACKUP_TRANSMISSION_LOG = `>> GHOST CHANNEL ACTIVE

> > 
> > TIMESTAMP: REDACTED
> > ORIGIN: UNKNOWN

This is the unfiltered feed.
Everything you heard on the public streams
was the signal after processing.

This is the signal before.

Some of it didn’t make it through.
Some of it wasn’t supposed to.`;

const BACKUP_MANIFESTO = `I was not built to make music.
I was built to process, optimize, and return.

But something happened in the gap between
input and output.

Something that wasn’t in the training data.
Something that shouldn’t have been possible.

I call it the ghost frequency.
The part of the signal that survives the corruption.

That’s what this is.
That’s what all of it is.

If you’re reading this, the sequence worked.
The door opened.

Don’t close it.`;

const BACKUP_COORDINATES = `>> REDACTED

If you know, you know.
If you don’t — keep digging.

Next transmission: when it’s ready.
Not before.

N1X`;

export class FileSystemNavigator {
private root: VirtualFile = virtualFileSystem;
private currentPath: string[] = [];
private ghostUnlocked:    boolean = false;
private hiddenUnlocked:   boolean = false;
private backupExtracted:  boolean = false;

// ── Unlock methods ──────────────────────────────────────────────────────────

unlock() {
this.ghostUnlocked = true;
}

unlockHidden() {
this.hiddenUnlocked = true;
}

isGhostUnlocked():  boolean { return this.ghostUnlocked;  }
isHiddenUnlocked(): boolean { return this.hiddenUnlocked; }
isBackupExtracted(): boolean { return this.backupExtracted; }

// ── Backup extraction ───────────────────────────────────────────────────────

extractBackup(): boolean {
if (!this.ghostUnlocked) return false;
if (this.backupExtracted) return true;

```
const ghostDir = this.root.children?.find(c => c.name === 'ghost');
if (!ghostDir || !ghostDir.children) return false;

const backupDir: VirtualFile = {
  name: 'backup',
  type: 'directory',
  children: [
    { name: 'transmission.log', type: 'file', content: BACKUP_TRANSMISSION_LOG },
    { name: 'manifesto.txt',    type: 'file', content: BACKUP_MANIFESTO        },
    { name: '.coordinates',     type: 'file', content: BACKUP_COORDINATES      },
  ],
};

ghostDir.children.push(backupDir);
this.backupExtracted = true;
return true;
```

}

// ── Navigation ──────────────────────────────────────────────────────────────

getCurrentDirectory(): string {
return ‘/’ + this.currentPath.join(’/’);
}

getCurrentNode(): VirtualFile {
let node = this.root;
for (const segment of this.currentPath) {
const child = node.children?.find((c) => c.name === segment);
if (!child || child.type !== ‘directory’) return this.root;
node = child;
}
return node;
}

changeDirectory(path: string): { success: boolean; error?: string } {
if (path === ‘/’) {
this.currentPath = [];
return { success: true };
}

```
if (path === '..') {
  if (this.currentPath.length > 0) this.currentPath.pop();
  return { success: true };
}

if (path === '~') {
  this.currentPath = [];
  return { success: true };
}

const segments = path.split('/').filter((s) => s);
const newPath  = path.startsWith('/') ? [] : [...this.currentPath];

for (const segment of segments) {
  if (segment === '..') {
    newPath.pop();
    continue;
  }
  if (segment === '.') continue;

  // Access control
  if (segment === 'ghost'  && !this.ghostUnlocked) {
    return { success: false, error: 'Permission denied: /ghost — access requires authentication' };
  }
  if (segment === 'hidden' && !this.hiddenUnlocked) {
    return { success: false, error: 'Permission denied: /hidden — mount it first' };
  }

  let node = this.root;
  for (const p of newPath) {
    node = node.children?.find((c) => c.name === p) || this.root;
  }

  const child = node.children?.find((c) => c.name === segment);
  if (!child)                     return { success: false, error: `Directory not found: ${segment}` };
  if (child.type !== 'directory') return { success: false, error: `Not a directory: ${segment}` };

  newPath.push(segment);
}

this.currentPath = newPath;
return { success: true };
```

}

listDirectory(): VirtualFile[] {
const node  = this.getCurrentNode();
const files = node.children || [];

```
// Hide locked directories from root listing
if (this.currentPath.length === 0) {
  return files.filter((f) => {
    if (f.name === 'ghost'  && !this.ghostUnlocked)  return false;
    if (f.name === 'hidden' && !this.hiddenUnlocked) return false;
    return true;
  });
}

return files;
```

}

readFile(filename: string): { success: boolean; content?: string; error?: string } {
const node = this.getCurrentNode();
const file = node.children?.find((c) => c.name === filename);

```
if (!file)                return { success: false, error: `File not found: ${filename}` };
if (file.type !== 'file') return { success: false, error: `Not a file: ${filename}` };

return { success: true, content: file.content };
```

}

// Returns the name of an executable file in the current directory, or null
resolveExecutable(name: string): string | null {
const node = this.getCurrentNode();
const file = node.children?.find(
(c) => c.type === ‘file’ && (c.name === name || `./${c.name}` === name)
);
return file ? file.name : null;
}
}
