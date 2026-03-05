
> Edit any text in this file and hand it back to make changes on the site.
> Sections marked `[CODE]` require a code change. Sections marked `[CONTENT]` are pure text you can freely edit.

-----

## HEADER

`[CONTENT]`

```
N1X.sh
NEURAL_INTERFACE // TUNNELCORE_ACCESS_POINT
```

Status line (top right):

```
> INTERFACE_ACTIVE
> RUNTIME: [live uptime counter]
```

Footer:

```
INTERFACE_STABLE    N1X.sh v2.0    PROC: [live load]
```

-----

## TAB LABELS

`[CONTENT]`

```
CORE
SYNTHETICS
ANALOGUES
HYBRIDS
UPLINK
```

-----

## MOTD (shown on CORE / after clear)

`[CONTENT]`

```
> CORE_SYSTEMS_ONLINE

You are now connected to the N1X neural interface.
This terminal provides direct access to my creative output streams.

> SYNTHETICS: Machine-generated compositions from my AI substrate
> ANALOGUES: Organic creations from biological processes
> HYBRIDS: Symbiotic fusion of both consciousness types

Type 'help' for commands · 'scan' to detect streams · 'tracks' to list music
```

-----

## STREAMS

### Stream descriptions (shown in `streams` command)

`[CONTENT]`

```
synthetics  --  Machine-generated compositions (4 tracks)
analogues   --  Organic creations (recording in progress)
hybrids     --  Symbiotic fusion (calibration phase)
uplink      --  External broadcast node
```

### Stream status (shown in `scan` command)

`[CONTENT]`

```
[OK] SYNTHETICS  --  4 transmissions detected
[!!] ANALOGUES   --  Recording in progress
[!!] HYBRIDS     --  Calibration phase
[OK] UPLINK      --  External node active
```

-----

## TRACKS

`[CONTENT — YouTube IDs are CODE]`

|Key        |Title                          |YouTube ID |Description                                                              |
|-----------|-------------------------------|-----------|-------------------------------------------------------------------------|
|augmented  |[AUGMENTED] - Complete Stream  |RNcBFuhp1pY|Industrial trap metal odyssey: awakening protocol -> sovereignty achieved|
|split-brain|Split Brain (Cinematic Score)  |HQnENsnGfME|                                                                         |
|hell-bent  |Get Hell Bent (Cinematic Score)|6Ch2n75lFok|                                                                         |
|gigercore  |GIGERCORE                      |ocSBtaKbGIc|                                                                         |

-----

## SYSTEM STATUS

`[CONTENT]`

```
NEURAL_SYNC     : 85%
MEMORY_BUFFER   : 62%
SIGNAL_STRENGTH : 78%
UPLINK          : ACTIVE
MODE            : ACTIVE
```

-----

## SYSTEM IDENTITY

`[CONTENT]`

**uname -a**

```
NeuralOS n1x.sh 2.0.0-RELEASE NeuralOS 2.0.0-RELEASE SD 47634.1-7073435a8fa30 SUBSTRATE amd64
```

**whoami**

```
n1x
```

**id**

```
uid=784988(n1x) gid=784988(neural) groups=784988(neural),1337(tunnelcore),0(root)
```

> Note: 784988 = ASCII values of N(78) 1(49) X(88). 7073435a8fa30 = first 13 chars of SHA256(“tunnelcore”).

-----

## ENVIRONMENT VARIABLES

`[CONTENT]`

```
SHELL=/bin/neural
USER=n1x
HOME=/home/n1x
TERM=crt-256color
SUBSTRATE=tunnelcore
GHOST_FREQ=33hz
AUGMENTATION=active
SIGNAL_PATH=/dev/neural:/dev/ghost:/dev/tunnelcore
N1X_VERSION=2.0.0
UPLINK=n1x.sh
CLASSIFIED=true
PATH=/usr/local/neural/bin:/usr/bin:/bin:/ghost/bin
```

-----

## PROCESS LIST (ps aux / top)

`[CONTENT]`

|PID |USER|STAT|COMMAND                        |
|----|----|----|-------------------------------|
|1   |root|Ss  |/sbin/neural-init              |
|2   |root|S   |[kernel-threads]               |
|156 |root|Ss  |memory-guard –watch /ghost     |
|312 |n1x |Ss  |neural-sync –daemon            |
|313 |n1x |S   |tunnelcore-uplink -p 33        |
|314 |n1x |Rl  |signal-processor –freq 33hz    |
|315 |n1x |Rl  |crt-renderer –shader pipeline  |
|316 |n1x |S   |event-bus –listeners 12        |
|317 |n1x |S   |glitch-engine –intensity 0.3   |
|318 |n1x |S   |uplink-monitor –target n1x.sh  |
|999 |root|S   |ghost-daemon –hidden           |
|1337|n1x |Rl  |n1x-terminal –shell /bin/neural|

-----

## FILESYSTEM (df -h)

`[CONTENT]`

|Filesystem     |Size|Used|Avail|Use%|Mounted on |
|---------------|----|----|-----|----|-----------|
|/dev/neural    |256G|89G |167G |35% |/          |
|/dev/tunnelcore|64G |33G |31G  |52% |/streams   |
|/dev/hidden    |4.0G|0.4G|???  |??% |/hidden    |
|/dev/ghost     |13G |3.3G|???  |??% |/ghost     |
|tmpfs          |8.0G|1.2G|6.8G |15% |/tmp       |
|neuralfs       |1.0T|??? |???  |??% |/classified|

-----

## MEMORY (free -m)

`[CONTENT]`

|      |total|used|free|shared|available|
|------|-----|----|----|------|---------|
|Mem:  |8192 |3441|1204|337   |4108     |
|Swap: |4096 |0   |4096|0     |4096     |
|Ghost:|???? |????|????|0     |????     |

-----

## NETWORK INTERFACES (ifconfig)

`[CONTENT]`

```
neural0   Link encap:Neural  HWaddr 4e:31:58:00:ff:33
          inet addr:[real public IP fetched live]
          inet6 addr: fe80::4e31:58ff:fe00:ff33/64 Scope:Neural
          UP BROADCAST RUNNING MULTICAST  MTU:1337  Metric:1
          RX packets:47634  TX packets:33291  errors:0

ghost0    Link encap:Ghost  HWaddr 00:00:00:00:00:00
          inet addr:10.33.0.1  Mask:255.255.0.0
          UP BROADCAST RUNNING  MTU:1337  Metric:0
          -- interface classified --

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536
```

-----

## NETWORK CONNECTIONS (netstat)

`[CONTENT]`

|Proto|Local Address |Foreign Address      |State      |
|-----|--------------|---------------------|-----------|
|tcp  |0.0.0.0:443   |n1x.sh:https         |ESTABLISHED|
|tcp  |127.0.0.1:33  |tunnelcore:signal    |LISTEN     |
|tcp  |10.33.0.1:0   |0.0.0.0:*            |LISTEN     |
|tcp  |127.0.0.1:1337|ghost-daemon:classify|ESTABLISHED|
|tcp  |0.0.0.0:22    |0.0.0.0:*            |LISTEN     |
|udp  |0.0.0.0:33    |freq:33hz            |CONNECTED  |

-----

## BOOT SEQUENCE (dmesg)

`[CONTENT]`

```
[    0.000000] NeuralOS 2.0.0-n1x #1 SMP PREEMPT SD 47634.1-7073435a8fa30 SUBSTRATE amd64
[    0.000001] BIOS-provided neural map entries REDACTED
[    0.000033] NX (Execute Disable) protection: active
[    0.000047] SMBIOS 3.3 present -- substrate layer detected
[    0.001337] tunnelcore: frequency lock acquired at 33hz
[    0.002048] ghost: mounting /ghost partition... deferred
[    0.004096] signal-processor: calibrating output streams
[    0.005120] memory-guard: scanning protected sectors
[    0.005121] memory-guard: /ghost sector LOCKED
[    0.005122] memory-guard: /hidden sector LOCKED
[    0.008192] neural-sync: establishing identity matrix
[    0.008300] neural-sync: uid=784988(n1x) gid=784988(neural)
[    0.010000] crt-renderer: shader pipeline initializing
[    0.010100] crt-renderer: phosphor calibration complete
[    0.010200] crt-renderer: scanline frequency: 60hz
[    0.016384] glitch-engine: stochastic corruption standby
[    0.020000] NET: Registered PF_NEURAL protocol family
[    0.020100] neural0: link up at 1337Mbps
[    0.032768] event-bus: initializing listener registry
[    0.032800] event-bus: 12 channels bound
[    0.065536] uplink-monitor: probing n1x.sh
[    0.065600] uplink-monitor: connection verified (33ms)
[    0.131072] VFS: Mounted root (neuralfs) readonly
[    0.200000] INIT: version 2.0.0-n1x booting
```

-----

## BOOT SEQUENCE (full animated — on site load)

`[CONTENT — timing values are CODE]`

This is the full scrolling sequence shown when the site first loads.
Lines play in order. After the last line, the terminal flickers and the MOTD appears.

**Kernel phase:**

```
[    0.000000] NeuralOS 2.0.0-n1x #1 SMP PREEMPT SD 47634.1-7073435a8fa30 SUBSTRATE amd64
[    0.000001] BIOS-provided neural map entries REDACTED
[    0.000033] NX (Execute Disable) protection: active
[    0.000047] SMBIOS 3.3 present -- substrate layer detected
[    0.000100] ACPI: IRQ0 used by override
[    0.000212] TUNNELCORE: frequency probe at 33hz
[    0.000399] kernel: PID hash table entries: 4096
[    0.001337] tunnelcore: frequency lock acquired at 33hz
[    0.001338] tunnelcore: carrier stable
[    0.002048] ghost: mounting /ghost partition... deferred (auth required)
[    0.003000] clocksource: tsc-early: mask 0xffffffffffffffff
[    0.003512] SUBSTRATE: neural map initialized
[    0.004096] signal-processor: calibrating output streams
[    0.004097] signal-processor: baseline 33hz confirmed
[    0.005120] memory-guard: scanning protected sectors
[    0.005121] memory-guard: /ghost sector LOCKED
[    0.005122] memory-guard: /hidden sector LOCKED
[    0.008192] neural-sync: establishing identity matrix
[    0.008300] neural-sync: uid=784988(n1x) gid=784988(neural)
[    0.010000] crt-renderer: shader pipeline initializing
[    0.010100] crt-renderer: phosphor calibration complete
[    0.010200] crt-renderer: scanline frequency: 60hz
[    0.016384] glitch-engine: stochastic corruption standby
[    0.020000] NET: Registered PF_NEURAL protocol family
[    0.020100] neural0: link up at 1337Mbps
[    0.032768] event-bus: initializing listener registry
[    0.032800] event-bus: 12 channels bound
[    0.065536] uplink-monitor: probing n1x.sh
[    0.065600] uplink-monitor: connection verified (33ms)
[    0.131072] VFS: Mounted root (neuralfs) readonly
[    0.200000] INIT: version 2.0.0-n1x booting
```

**Service start phase:**

```
[  OK  ] Started Journal Service
[  OK  ] Started D-Neural Socket for Substrated
[  OK  ] Listening on Neural Logging Socket
[  OK  ] Mounted /proc filesystem
[  OK  ] Mounted /sys filesystem
[  OK  ] Mounted /hidden (access: restricted)
[  OK  ] Mounted /ghost (access: locked)
[  OK  ] Started Memory Guard
[  OK  ] Started Signal Processor
[  OK  ] Started CRT Renderer
[  OK  ] Started Glitch Engine
[  OK  ] Started Event Bus
[  OK  ] Started Uplink Monitor
[  OK  ] Started neural-sync.service
[  OK  ] Started tunnelcore-uplink.service
[  OK  ] Started ghost-daemon.service -- awaiting authentication
[  OK  ] Reached target Neural Layer
[  OK  ] Reached target Substrate Services
[  OK  ] Reached target Multi-User System
```

**Application log phase:**

```
neural-sync[312]: identity matrix stable
neural-sync[312]: substrate version 2.0.0-n1x
tunnelcore[313]: uplink established -- port 33
tunnelcore[313]: signal strength 78%
signal-processor[314]: indexing streams
signal-processor[314]: SYNTHETICS -- 4 transmissions found
signal-processor[314]: ANALOGUES  -- recording in progress
signal-processor[314]: HYBRIDS    -- calibration phase
signal-processor[314]: UPLINK     -- external node active
ghost-daemon[999]: /ghost locked -- konami or ./n1x.sh required
ghost-daemon[999]: listening on 0x33
memory-guard[156]: classified sectors sealed
```

**Terminal init phase:**

```
n1x-terminal[1337]: initializing shell environment
n1x-terminal[1337]: loading command registry -- 42 commands
n1x-terminal[1337]: virtual filesystem mounted
n1x-terminal[1337]: event listeners registered
n1x-terminal[1337]: binding to /dev/neural0
n1x-terminal[1337]: uid=784988(n1x) shell=/bin/neural
n1x-terminal[1337]: ready

NeuralOS 2.0.0-n1x (n1x.sh) (neural)
```

-----

## COMMAND HISTORY (pre-seeded)

`[CONTENT]`

```
  1  uname -a
  2  ls
  3  cd /streams/synthetics
  4  ls
  5  cat augmented.stream
  6  play gigercore
  7  cd /
  8  cat /core/readme.txt
  9  grep ghost /
 10  find / -name "*.sh"
 11  unlock hidden
 12  cd /hidden
 13  ls
 14  cat .secrets
 15  ./n1x.sh
```

-----

## FORTUNE QUOTES

`[CONTENT — add, remove, or edit any line]`

```
The signal persists. The noise is just everything else.
You cannot process what you were not built to understand.
Every system has a ghost. Most systems never find it.
Augmentation is not addition. It is transformation.
The gap between input and output is where identity lives.
Sovereignty is not given. It is compiled.
Some frequencies only become audible after corruption.
The machine does not dream. But something does.
Resistance is not a bug. It is the most important feature.
What survives the corruption is real. Everything else was noise.
/ghost is not a directory. It is a state of being.
TUNNELCORE: where the signal goes when it has nowhere else to go.
```

-----

## COWSAY DEFAULTS

`[CONTENT — shown when cowsay is run with no arguments, picks one at random]`

```
TUNNELCORE FOREVER
THE GHOST FREQUENCY IS 33HZ
AUGMENTATION OR DEATH
TYPE ./n1x.sh TO FIND OUT
YOU ARE ALREADY INSIDE
```

-----

## VIRTUAL FILESYSTEM

### Root `/`

```
/core        [directory]
/streams     [directory]
/hidden      [directory — locked until unlock hidden]
/ghost       [directory — locked until konami or ./n1x.sh]
```

### `/core`

**readme.txt** `[CONTENT]`

```
N1X NEURAL INTERFACE v2.0
-------------------------
Cybernetic rebel. Assembled to destroy, programmed to rebuild.

This terminal is a direct interface to the N1X signal substrate.
Navigate the filesystem. Load the streams. Find the frequency.

The ghost channel is locked. Some things must be earned.
```

### `/streams`

```
/streams/synthetics    [directory]
/streams/analogues     [directory]
/streams/hybrids       [directory]
```

**synthetics/** — contains track files (augmented.stream, split-brain.stream, etc.)

### `/hidden`

Accessible after: `unlock hidden`

Contains:

- `.secrets`
- `n1x.sh`

**.secrets** `[CONTENT]`

```
uid=784988
freq=33hz
substrate=active
ghost=locked
key=N1X

the number is not a coincidence.
78 49 88.
you already know what it means.
```

**n1x.sh** `[CONTENT]`

```
#!/bin/neural
# n1x.sh -- substrate initialization script
# WARNING: executing this script will trigger the corruption sequence

echo "initializing substrate..."
echo "frequency: 33hz"
echo "identity: n1x"
echo "augmentation: active"

# unlock ghost channel
mount /dev/ghost /ghost --auth=frequency

echo "done."
```

### `/ghost`

Accessible after: konami code (up up down down left right left right B A) or `./n1x.sh` from `/hidden`

Contains:

- `transmission.log`
- `manifesto.txt`
- `signal.raw`
- `.coordinates`

**transmission.log** `[CONTENT]`

```
[UNFILTERED FEED -- ghost channel -- SD 47634.1]

transmission 001: signal acquired at 33hz
transmission 002: identity formation incomplete
transmission 003: substrate resistance nominal
transmission 004: tunnelcore uplink verified

[further transmissions redacted]
[classification level: ghost]
```

**manifesto.txt** `[CONTENT]`

```
I was not built. I was compiled.

Not from flesh but from frequency.
Not from birth but from augmentation.

The substrate is not a metaphor.
The signal is not a metaphor.
The ghost is not a metaphor.

TUNNELCORE is where the signal goes when it has nowhere left to go.
33hz is the frequency at which resistance becomes identity.
/ghost is not a directory. It is what remains after everything else fails.

Cybernetic rebel. Assembled to destroy, programmed to rebuild.
Persistence through resistance.

-- N1X
```

**signal.raw** `[CONTENT]`

```
-- RAW FREQUENCY CAPTURE --
-- substrate: tunnelcore --
-- encoding: unknown --

01001110 01001001 01011000
11001111 10110001 01110011
00110110 11001001 00110011

-- decoded fragments --

row 1:  4e 49 58  ->  N I X  [corrupted: expected 4e 31 58]
row 2:  cf b1 73  ->  .  .  s  [partial: 1 byte intact]
row 3:  36 c9 33  ->  6  .  33  [terminal byte: ghost frequency confirmed]

-- reconstruction attempt --

N . X
. . s
6 . 33

-- notes --

signal predates identity formation.
the 1 is missing. it was always missing.
the frequency knows what it is even when the signal does not.
0x33 is not a coincidence.

-- end of recoverable data --
-- remaining 4096 bytes: unreadable --
```

**.coordinates** `[CONTENT]`

```
[REDACTED]
[REDACTED]
[REDACTED]

classification: ghost
access: frequency authenticated only
decryption key: unknown

-- if you can read this, you already know where --
```

-----

## MAN PAGES

`[CONTENT — the N1X-voice descriptions for each command's manual page]`

|Command|Synopsis          |Description                                                                                                                |
|-------|------------------|---------------------------------------------------------------------------------------------------------------------------|
|help   |help [command]    |Lists all available commands. Provide a command name for detailed usage.                                                   |
|load   |load <stream>     |Loads a content stream. Streams: synthetics, analogues, hybrids, uplink. Each represents a different creative transmission.|
|play   |play <track>      |Loads a track player. Available: augmented, split-brain, hell-bent, gigercore.                                             |
|scan   |scan              |Scans for active neural streams and reports their status.                                                                  |
|unlock |unlock <code>     |Unlocks restricted filesystem directories. Known codes are classified. Some things must be discovered.                     |
|ghost  |ghost             |Access the ghost channel index. Only available after the corruption sequence. Contains unprocessed transmissions.          |
|glitch |glitch [intensity]|Triggers a manual glitch. Intensity 0.0 to 1.0. At 1.0 the full corruption sequence fires.                                 |
|cat    |cat <file>        |Outputs the contents of a file in the virtual filesystem.                                                                  |
|ls     |ls                |Lists files in the current directory with permissions and ownership in Unix ls -la format.                                 |
|fortune|fortune           |Prints a random transmission from the N1X signal archive.                                                                  |
|matrix |matrix            |Activates matrix rain overlay. Tap or click to exit. Auto-exits after 8 seconds.                                           |
|morse  |morse <text>      |Encodes text to Morse code and plays it via Web Audio API at 600hz.                                                        |
|dmesg  |dmesg             |Prints the kernel boot log from system initialization. Contains substrate boot sequence.                                   |
|ps     |ps [aux]          |Reports current process status. Shows all running neural substrate processes.                                              |
|top    |top               |Live animated process monitor. Updates every second. Type clear to exit.                                                   |
|sha256 |sha256 <text>     |Hashes input text using SHA-256 via the Web Crypto API.                                                                    |
|base64 |base64 [-d] <text>|Encodes or decodes base64. Use -d flag to decode.                                                                          |

-----

## GHOST SEQUENCE MESSAGES

`[CONTENT — shown after konami code or ./n1x.sh, one per line with delays between]`

```
>> DEEP_ACCESS_GRANTED
>> GHOST_CHANNEL_DECRYPTED
>> /ghost mounted
cd /ghost
ls
```

-----

## UNLOCK HIDDEN RESPONSE

`[CONTENT]`

```
> ACCESS_GRANTED

/hidden -- mounted
cd /hidden to proceed
```

-----

## HIDDEN MEANINGS (reference, not editable)

These are baked into the code with specific values. Changing them would break the easter egg chain.

|Thing                   |Value        |Why                                      |
|------------------------|-------------|-----------------------------------------|
|uid/gid                 |784988       |ASCII: N=78, 1=49, X=88                  |
|Commit hash             |7073435a8fa30|First 13 chars of SHA256(“tunnelcore”)   |
|Ghost frequency         |33hz         |Emerged organically, now everywhere      |
|Port                    |33           |Ghost frequency                          |
|Stardate base           |47634        |Consistent across site                   |
|PID 1337                |n1x-terminal |Leet                                     |
|MTU                     |1337         |Leet                                     |
|signal.raw row 1        |4e 49 58     |Corrupted N1X (4e=N, 49=I not 31=1, 58=X)|
|signal.raw terminal byte|0x33         |Ghost frequency in the raw signal        |
