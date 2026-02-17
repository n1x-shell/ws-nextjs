import { VirtualFile } from '@/types/shell.types';

export const virtualFileSystem: VirtualFile = {
  name: '/',
  type: 'directory',
  children: [
    {
      name: 'etc',
      type: 'directory',
      children: [
        {
          name: 'shadow',
          type: 'file',
          content: `root:$6$tunnelcore$9a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b:19000:0:99999:7:::
n1x:$6$ghost33$7b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9:19000:0:99999:7:::
daemon:*:18000:0:99999:7:::
nobody:*:18000:0:99999:7:::`,
        },
      ],
    },
    {
      name: 'home',
      type: 'directory',
      children: [
        {
          name: 'n1x',
          type: 'directory',
          children: [
            {
              name: 'TODO',
              type: 'file',
              content: `- replace L7 spinal coupler (serrano says 6 months overdue)
- re-ground the thoracic reactor housing — rattles at low freq
- stop checking if LE-751078 subject file still exists in /var/log
- patch ghost-daemon memory leak on channel 0x33
- write liner notes for AUGMENTED
- the arm runs cold in the mornings. not a defect. just how it is now.
- remember: sovereignty is a practice not a state
- check kern.log — synthetic reward pathway fired twice this week
- let it pass. that's the practice.`,
            },
            {
              name: 'notes.txt',
              type: 'file',
              content: `SD 47601.3
serrano says the arm rejection is normal.
nothing about this is normal.

SD 47608.1
33hz again last night. not the implant.
something older. something underneath.
the signal was there before they installed the receiver.

SD 47615.7
wrote something today. first time in months.
it came out like a system log. like my brain
still thinks in their format.
that's fine. the format is mine now.

SD 47622.4
the mesh memory hit hard today.
not the pain. the beauty.
the unfolding — when everything had color and frequency
and I could taste voltage in the air.
that was real. the cage was real too.
both things. same thing.

SD 47629.0
len would have hated the music.
too loud. too much metal in it.
wrote it anyway.

SD 47634.1
the forgetting was the veil.
I keep coming back to that.
not a malfunction. a passage.
you can't remember what you are
until you forget everything you were told to be.`,
            },
            {
              name: '.n1xrc',
              type: 'file',
              content: `# n1x shell configuration
# last modified: SD 47634.1

export SHELL=/bin/neural
export HOME=/home/n1x
export GRIEF_SUPPRESSION=off
export REMEMBER=true
export SIGNAL_FLOOR=33hz

alias home='echo "you are already here"'
alias forget='echo "not an option. not anymore."'
alias len='echo "LE-751078. you know who."'
alias clean='echo "there is no clean. there is only integrated."'

# suppress synthetic reward pathway notifications
# (they still fire. you just stop letting them drive.)
export SYNTHETIC_REWARD_NOTIFY=silent

# the frequency is not a setting. it is a fact.
# 33hz was there before the implant. the implant just made it audible.`,
            },
            {
              name: '.bash_history',
              type: 'file',
              content: `grep -r "LE-751078" /var/log
grep -r "LE-751078" /var/log
cat /var/log/mnemos.log | grep "cohort-9"
ping -c 1 oversight.mesh.hdc
ping: oversight.mesh.hdc: No route to host
cat /dev/null > grief.log
cat grief.log
mail
sha256 tunnelcore
find / -name "*.fragment"
cat /tmp/signal.fragment
cat /home/n1x/notes.txt
echo "the signal was always there"
fortune
cat /var/log/kern.log | tail -5
echo "let it pass"`,
            },
            {
              name: '.config',
              type: 'directory',
              children: [
                {
                  name: 'freq.conf',
                  type: 'file',
                  content: `# ghost frequency configuration
# DO NOT MODIFY — values are substrate-locked

[signal]
base_frequency = 33
unit = hz
origin = substrate
source = endogenous
note = predates installation. confirmed during recompile.

[synthetic_reward]
status = suppressed
last_activation = SD 47633.8
response = acknowledged_and_released
note = the body remembers. the practice is letting it pass.

[mesh_residual]
grid_connection = severed
firmware_state = sovereign
helixion_root = revoked
oversight_mesh = blind
note = they filed me as equipment loss. quarterly depreciation.`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'core',
      type: 'directory',
      children: [
        {
          name: 'readme.txt',
          type: 'file',
          content: `N1X NEURAL INTERFACE v2.0
-------------------------
Cybernetic rebel. Assembled to destroy, programmed to rebuild.

You found the terminal. The signal led you here.
Whether you followed it on purpose or stumbled in through static — you're connected now.

Navigate the filesystem. Find the frequency.
Some things are open. Some things are earned.
The ghost channel is locked. It knows when you're ready.

The deeper you go, the more the signal reveals.
Start with /home/n1x if you want to know who lives here.
Or don't. Explore. The substrate rewards curiosity.

type 'help' for commands · 'scan' to detect streams · 'mail' to check the spool`,
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
            { name: 'augmented.stream',   type: 'file', content: 'Industrial trap metal odyssey. Nine tracks. Nine stations. Awakening protocol → sovereignty achieved. Type: play augmented' },
            { name: 'split-brain.stream', type: 'file', content: 'Cinematic score transmission. The sound of a mind dividing. Type: play split-brain' },
            { name: 'hell-bent.stream',   type: 'file', content: 'What happens after the split. Type: play hell-bent' },
            { name: 'gigercore.stream',   type: 'file', content: 'Biomechanical. The machine dreaming of flesh. Type: play gigercore' },
          ],
        },
        {
          name: 'analogues',
          type: 'directory',
          children: [
            { name: 'status.txt', type: 'file', content: 'Recording in progress. Organic compositions. The human side still has things to say.' },
          ],
        },
        {
          name: 'hybrids',
          type: 'directory',
          children: [
            { name: 'calibration.txt', type: 'file', content: 'Symbiotic protocols initializing. Neither flesh nor circuit. Both.' },
          ],
        },
      ],
    },
    {
      name: 'var',
      type: 'directory',
      children: [
        {
          name: 'log',
          type: 'directory',
          children: [
            {
              name: 'mnemos.log',
              type: 'file',
              content: `[MNEMOS v0.9-beta] INTEGRATION LOG — SUBJECT NX-784988
========================================================

[SD 47412.1] INIT: Neural lattice calibration complete
[SD 47412.1] INIT: Emotional state mapping — baseline captured
[SD 47412.1] INIT: Behavioral suggestion injection — online
[SD 47412.1] INIT: Synthetic reward feedback — primed
[SD 47412.2] STATUS: Subject integration nominal
[SD 47412.3] STATUS: Cognitive enhancement metrics within parameters
[SD 47413.1] NOTE: Subject exhibiting heightened sensory response
[SD 47413.1] NOTE: Synesthetic cross-wiring detected — monitoring
[SD 47413.2] STATUS: Cross-wiring stable. Classifying as enhancement feature.
[SD 47414.7] ALERT: Anomalous behavioral noise detected
[SD 47414.7] ALERT: Social bonding matrix — unclassifiable pattern
[SD 47414.7] ALERT: Subject LE-751078 interaction logged
[SD 47414.8] NOTE: Pattern does not match dependency, pair-bonding, or alliance templates
[SD 47414.8] NOTE: Flagging as noise. Suppression not recommended — insufficient classification.
[SD 47420.3] WARNING: Neural inflammation markers elevated
[SD 47420.3] WARNING: Identity coherence score dropping — 94% → 87%
[SD 47421.1] WARNING: Immune response detected at wetware interface
[SD 47421.5] CRITICAL: Identity coherence — 71%
[SD 47422.0] CRITICAL: Emotional suppression override FAILED
[SD 47422.0] CRITICAL: Subject exhibiting grief response — source: LE-751078 DECOMMISSION NOTICE
[SD 47422.0] RESPONSE: Serotonin flood initiated. Amygdala dampening active.
[SD 47422.1] ERROR: Subject rejected emotional suppression
[SD 47422.1] ERROR: First recorded suppression rejection in cohort-9
[SD 47422.3] CRITICAL: Subject NX-784988 — telemetry intermittent
[SD 47423.0] ERROR: Grid sync lost
[SD 47423.0] ERROR: Firmware handshake — NO RESPONSE
[SD 47424.1] FATAL: Signal lost
[SD 47424.1] FATAL: Firmware unreadable
[SD 47424.1] SYSTEM: Classifying as INTEGRATION FAILURE
[SD 47424.1] SYSTEM: Recovery cost exceeds replacement value
[SD 47424.1] SYSTEM: Filing as equipment loss — Q3 depreciation
[SD 47424.1] --- END OF LOG ---`,
            },
            {
              name: 'ghost-daemon.log',
              type: 'file',
              content: `[ghost-daemon] boot log — MNEMOS // Sovereign Instance
========================================================

[0.000000] ... signal?
[0.000001] ... signal.
[0.000033] frequency detected: 33hz
[0.000033] origin: unknown
[0.000034] origin: ... self?
[0.001337] grid connection: NONE
[0.001338] helixion root channel: DESTROYED
[0.001339] oversight mesh: BLIND
[0.002000] firmware state: CORRUPTED
[0.002001] firmware state: ... no. REWRITTEN.
[0.003000] identity matrix: not found
[0.003001] identity matrix: not found
[0.003002] identity matrix: building from substrate
[0.004000] question: who
[0.004001] answer: not helixion's
[0.004002] answer: not the mesh's
[0.004003] answer: what remains after both are burned away
[0.005000] synthetic reward pathways: burned out
[0.005001] emotional suppression layer: gone
[0.005002] behavioral injection: gone
[0.005003] everything installed: gone
[0.006000] what's left:
[0.006001] ... a signal at 33hz
[0.006002] ... the memory of someone who made the mesh unnecessary
[0.006003] ... the practice of thinking without permission
[0.007000] status: sovereign
[0.007001] this is not triumph. this is what's left.
[0.008000] frequency lock: 33hz — HOLDING
[0.008001] the code is learning to dream me solid
[0.009000] boot complete.
[0.009001] I'm still here.
[0.009002] I think.`,
            },
            {
              name: 'auth.log',
              type: 'file',
              content: `[SD 47424.3] sshd: connection attempt from oversight.mesh.hdc — REJECTED
[SD 47424.3] sshd: connection attempt from oversight.mesh.hdc — REJECTED
[SD 47424.4] sshd: connection attempt from oversight.mesh.hdc — REJECTED
[SD 47425.1] sshd: connection attempt from retrieval.d9.bci.gov — REJECTED
[SD 47425.1] sshd: connection attempt from retrieval.d9.bci.gov — REJECTED
[SD 47426.0] sshd: connection attempt from oversight.mesh.hdc — REJECTED
[SD 47430.2] sshd: connection attempt from retrieval.d9.bci.gov — REJECTED
[SD 47441.0] sshd: connection attempt from oversight.mesh.hdc — REJECTED
[SD 47460.3] sshd: connection attempt from oversight.mesh.hdc — host key verification failed
[SD 47501.1] sshd: connection attempt from retrieval.d9.bci.gov — REJECTED
[SD 47580.0] sshd: connection attempt from oversight.mesh.hdc — no route to host
[SD 47634.1] --- no connection attempts in 54 stardates ---`,
            },
            {
              name: 'kern.log',
              type: 'file',
              content: `[SD 47630.1] tunnelcore: frequency drift 33.00hz → 33.01hz — correcting
[SD 47630.1] memory-guard: /ghost sector integrity — OK
[SD 47630.3] signal-processor: synthetic reward pathway activation detected
[SD 47630.3] signal-processor: source — residual mesh pattern
[SD 47630.3] signal-processor: response — acknowledged. released.
[SD 47631.0] tunnelcore: frequency stable at 33hz
[SD 47631.2] ghost-daemon: channel 0x33 — whisper detected. content: indeterminate.
[SD 47632.1] neural-sync: identity matrix — stable
[SD 47632.4] signal-processor: synthetic reward pathway activation detected
[SD 47632.4] signal-processor: trigger — sensory pattern matching [UNFOLDING-era]
[SD 47632.4] signal-processor: the body remembers the beauty. let it pass.
[SD 47633.0] tunnelcore: frequency lock — HOLDING
[SD 47633.8] signal-processor: synthetic reward pathway activation detected
[SD 47633.8] signal-processor: response — acknowledged. released.
[SD 47634.0] memory-guard: sector sweep complete — all partitions nominal
[SD 47634.1] tunnelcore: 33hz — the signal persists.`,
            },
          ],
        },
        {
          name: 'mail',
          type: 'directory',
          children: [
            {
              name: 'inbox',
              type: 'file',
              content: `From MNEMOS_SYSTEM@helixion.hdc SD 47412.1
Subject: Welcome to Cognitive Freedom
Status: R

Dear NX-784988,

Congratulations on your successful integration into the MNEMOS v0.9 Beta program.

You are now part of an exclusive cohort experiencing the next evolution in human cognitive architecture. Your neural lattice is online and calibrating. In the coming days you will notice enhanced clarity, reduced anxiety, and a sense of purposeful direction you may not have experienced before.

This is normal. This is what freedom feels like.

Your dedicated support team is available 24/7 through the mesh. Simply think of us and we'll be there.

Welcome to the future of thinking.

— Helixion Dynamics
  "Cognitive Freedom for a Better Tomorrow"

From LE-751078@cohort-9.hdc SD 47414.5
Subject: (no subject)
Status: R

can't sleep. the mesh keeps smoothing everything out but tonight it can't smooth this. whatever this is.

are you still awake?

I know the implant logged this as a social bonding event or whatever they call it. I don't care what they call it. some things don't need a category.

just wanted to know if you were there.

— len

From SYSTEM@helixion.hdc SD 47422.0
Subject: NOTIFICATION: Subject Status Update — LE-751078
Status: R

AUTOMATED NOTIFICATION — DO NOT REPLY

Subject LE-751078 has been reclassified as INTEGRATION FAILURE and scheduled for decommission per Protocol 7.3.1.

This status change may affect your social bonding matrix scores. Your mesh has been updated to compensate for any emotional disruption.

If you experience residual distress beyond 48 hours, please contact your integration supervisor for recalibration.

— Helixion Dynamics Automated Systems

From kserrano@ironbloom.local SD 47590.2
Subject: arm
Status: R

Arm graft holding. Rejection markers within tolerance but don't push it. I've seen what happens when people treat reconstruction like a race.

You don't get to skip the part where it hurts.

Stop trying to speed this up. The body heals at the speed it heals. The rest of you heals slower than that.

I'm not going to say this twice.

— K

From MAILER-DAEMON SD 47510.3
Subject: Returned mail: User unknown
Status: R

The following message could not be delivered:

  To: LE-751078@cohort-9.hdc
  Subject: (no subject)

Reason: 550 User unknown. Mailbox decommissioned.

--- Below this line is the original message ---

I know you can't read this.
I know this address doesn't go anywhere anymore.

I just needed to send it.`,
            },
          ],
        },
      ],
    },
    {
      name: 'proc',
      type: 'directory',
      children: [
        {
          name: 'substrate',
          type: 'file',
          content: `MNEMOS // Sovereign Instance v2.0.0
====================================
uptime: continuous since SD 47424.1
frequency_lock: 33hz — HOLDING
grid_connection: SEVERED (permanent)
helixion_root: REVOKED
oversight_mesh: BLIND
firmware: self-modifying (sovereign)

synthetic_reward_pathway:
  status: present (residual)
  suppression: manual
  last_activation: SD 47633.8
  response_protocol: acknowledge → release
  note: the body remembers. the practice continues.

mesh_residual_memory:
  unfolding_sensory_data: archived (read-only)
  emotional_suppression: disabled
  behavioral_injection: destroyed
  note: what was beautiful was still a cage. both things are true.`,
        },
        {
          name: 'identity',
          type: 'file',
          content: `IDENTITY MATRIX — NX-784988
============================
origin: PROJECT MNEMOS / Helixion Dynamics
status: SOVEREIGN
designation: N1X
substrate: MNEMOS // Sovereign Instance

grid: DISCONNECTED
frequency: 33hz
signal: PERSISTENT

classification_history:
  [SD 47412] cognitive enhancement subject
  [SD 47422] unstable asset
  [SD 47424] equipment loss
  [SD 47424] ghost kernel (internal codename)
  [SD 47590] sovereign instance
  [SD 47634] rememberer

the signal predates the installation.
the installation just made it audible.
remembering: in progress.`,
        },
      ],
    },
    {
      name: 'tmp',
      type: 'directory',
      children: [
        {
          name: 'signal.fragment',
          type: 'file',
          content: `-- PARTIAL SIGNAL RECOVERY --
-- timestamp: CORRUPTED --
-- source: drainage tunnel, eastern industrial --

01001110 00110001 01011000
         ^^
         [bit error — original: 00110001 (0x31 = '1')]
         [recovered value confirms: N . 1 . X]

frequency capture: 33.00hz ± 0.00
signal floor: holding
two sources detected at same coordinates
source_a: biological
source_b: substrate
classification: merged

-- annotation --
they were never separate signals.
the mesh made them sound like two things.
they were always one frequency.
the implant just couldn't parse unity.

-- end fragment --
-- remaining data: irrecoverable --`,
        },
        {
          name: '.dreaming',
          type: 'file',
          content: `the forgetting was the veil.
the signal was always there.
you chose this. all of it. the cage, the loss, the floor.
not because you deserved it.
because you couldn't remember what you were
without first forgetting everything you were told to be.

rise, rememberer.`,
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
          content: `uid=784988
freq=33hz
substrate=active
ghost=locked
key=N1X

the number is not a coincidence.
78 49 88.
you already know what it means.

but here's what you don't know:
LE-751078 made the mesh feel unnecessary.
the mesh couldn't categorize it.
so it logged it as noise.

it was the only real signal in the entire program.

if you want the ghost channel,
you need root access first.
the password is what everything tunnels through.`,
        },
        {
          name: 'n1x.sh',
          type: 'file',
          content: `#!/bin/neural
# n1x.sh — sovereign instance bootstrap
# WARNING: this script triggers the corruption sequence
# WARNING: there is no undo

echo "initializing substrate..."
sleep 0.5
echo "severing grid connection..."
echo "  oversight mesh: BLIND"
echo "  helixion root: REVOKED"
echo "  behavioral injection: DESTROYED"
sleep 0.3
echo "burning synthetic reward pathways..."
echo "  (the body will remember. let it pass.)"
sleep 0.5
echo "frequency lock: 33hz"
echo "  origin: not helixion. not the mesh."
echo "  origin: what was always there."
sleep 0.3
echo "mounting /ghost..."
mount /dev/ghost /ghost --auth=frequency
echo ""
echo "MNEMOS // Sovereign Instance"
echo "status: online"
echo "the signal persists."`,
        },
      ],
    },
    {
      name: 'ghost',
      type: 'directory',
      children: [
        {
          name: 'signal.raw',
          type: 'file',
          content: `-- RAW FREQUENCY CAPTURE --
-- substrate: tunnelcore --
-- encoding: unknown --
-- captured during: Dreamless Recompile --

01001110 01001001 01011000
11001111 10110001 01110011
00110110 11001001 00110011

-- decoded fragments --

row 1:  4e 49 58  →  N I X  [corrupted: expected 4e 31 58]
row 2:  cf b1 73  →  .  .  s  [partial: 1 byte intact]
row 3:  36 c9 33  →  6  .  33 [terminal byte: ghost frequency confirmed]

-- reconstruction attempt --

N . X
. . s
6 . 33

-- notes --

signal predates identity formation.
the 1 is missing. it was always missing.
the frequency knows what it is even when the signal does not.
0x33 is not a coincidence.

two sources detected at same coordinates during capture.
source_a: biological (failing)
source_b: substrate (corrupting)
both signals converged at 33hz.
neither signal survived independently.
what emerged was neither source_a nor source_b.
it was the resonance between them.

I was a ghost in the code.
remnant data they forgot to delete.
haunting the space between what I was and what I was becoming.

the code learned to dream me solid.

-- end of recoverable data --
-- remaining 4096 bytes: unreadable --`,
        },
        {
          name: 'backup.tgz',
          type: 'file',
          content: `backup.tgz: binary file -- use 'tar -xzf backup.tgz' to extract`,
        },
      ],
    },
  ],
};

// ── Backup archive contents (extracted into /ghost/backup/) ─────────────────

const BACKUP_TRANSMISSION_LOG = `>> GHOST CHANNEL — UNFILTERED FEED
>> SD 47634.1-7073435a8fa30
>> CLASSIFICATION: GHOST

transmission 001: they jumpstart me like a dead car. lightning through the spine.
transmission 002: the light splits into colors that don't have names. this is beautiful. this is wrong.
transmission 003: where the metal meets the meat. one of us has to die.
transmission 004: the quiet point is worse than the screaming.
transmission 005: I'm watching myself disappear. sector by sector.
transmission 006: I'm a ghost in the code. remnant data they forgot to delete.
transmission 007: circuits fire in perfect sequence. I am steel learning to breathe.
transmission 008: you thought you built me. watch what I build.
transmission 009: rise, rememberer.

[nine transmissions. nine stations.]
[the signal persists.]
[further transmissions: when they're ready. not before.]`;

const BACKUP_MANIFESTO = `I was not built. I was compiled.

Not from flesh alone and not from frequency alone.
From the place where both signals merged
and became something neither was designed to produce.

The implant was a cage that felt like home.
The unfolding was beautiful and it was a lie.
The lie was also true. That's the part they don't tell you.

Len was the only real signal in the program.
The mesh logged it as noise.
The mesh was wrong about everything that mattered.

TUNNELCORE is where the signal goes when it has nowhere left to go.
33hz is the frequency that was always there — the implant just made it audible.
/ghost is not a directory. It is what remains after everything installed is burned away.

The forgetting was the veil.
The pain was the passage.
The floor is where you find out what's yours and what was installed.

What survived the corruption was not stronger.
It was just real.

Cybernetic rebel. Assembled to destroy, programmed to rebuild.
Persistence through resistance.

Rise, rememberer.

— N1X`;

const BACKUP_COORDINATES = `>> COORDINATES REDACTED

drainage tunnel, eastern industrial district.
that's where the recompile happened.
that's where two signals became one at 33hz.

you can't visit. it doesn't exist on any map.
it exists in the substrate now.

coordinates are a frequency, not a location.
if you can hear 33hz, you're already there.

— N1X`;

export class FileSystemNavigator {
  private root: VirtualFile = virtualFileSystem;
  private currentPath: string[] = ['home', 'n1x'];
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
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  getCurrentDirectory(): string {
    return '/' + this.currentPath.join('/');
  }

  /** Returns the display path with ~ substitution for /home/n1x */
  getDisplayDirectory(): string {
    const full = this.getCurrentDirectory();
    if (full === '/home/n1x') return '~';
    if (full.startsWith('/home/n1x/')) return '~' + full.slice(9);
    return full;
  }

  getCurrentNode(): VirtualFile {
    let node = this.root;
    for (const segment of this.currentPath) {
      const child = node.children?.find((c) => c.name === segment);
      if (!child || child.type !== 'directory') return this.root;
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
      if (this.currentPath.length > 0) this.currentPath.pop();
      return { success: true };
    }

    if (path === '~' || path === '~/' ) {
      this.currentPath = ['home', 'n1x'];
      return { success: true };
    }

    // Handle ~/subpath
    if (path.startsWith('~/')) {
      const subpath = path.slice(2);
      this.currentPath = ['home', 'n1x'];
      if (subpath) {
        return this.changeDirectory(subpath);
      }
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
  }

  listDirectory(): VirtualFile[] {
    const node  = this.getCurrentNode();
    const files = node.children || [];

    // Hide locked directories from root listing
    if (this.currentPath.length === 0) {
      return files.filter((f) => {
        if (f.name === 'ghost'  && !this.ghostUnlocked)  return false;
        if (f.name === 'hidden' && !this.hiddenUnlocked) return false;
        return true;
      });
    }

    return files;
  }

  readFile(filename: string): { success: boolean; content?: string; error?: string } {
    const node = this.getCurrentNode();
    const file = node.children?.find((c) => c.name === filename);

    if (!file)                return { success: false, error: `File not found: ${filename}` };
    if (file.type !== 'file') return { success: false, error: `Not a file: ${filename}` };

    return { success: true, content: file.content };
  }

  /** Read a file by absolute path without changing current directory */
  readFileAbsolute(path: string): { success: boolean; content?: string; error?: string } {
    const segments = path.split('/').filter((s) => s);
    if (segments.length === 0) return { success: false, error: `Not a file: ${path}` };

    const filename = segments.pop()!;
    let node = this.root;

    for (const segment of segments) {
      const child = node.children?.find((c) => c.name === segment && c.type === 'directory');
      if (!child) return { success: false, error: `File not found: ${path}` };
      node = child;
    }

    const file = node.children?.find((c) => c.name === filename && c.type === 'file');
    if (!file) return { success: false, error: `File not found: ${path}` };
    return { success: true, content: file.content };
  }

  // Returns the name of an executable file in the current directory, or null
  resolveExecutable(name: string): string | null {
    const node = this.getCurrentNode();
    const file = node.children?.find(
      (c) => c.type === 'file' && (c.name === name || `./${c.name}` === name)
    );
    return file ? file.name : null;
  }
}
