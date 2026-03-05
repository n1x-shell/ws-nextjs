# ZONE 6: FIGHT PITS

> Depth: Surface (border zone)
> Location: Between the Industrial District and the Fringe — the lawless strip
> Faction: Chrome Wolves (through Rade — entertainment and revenue arm)
> Rooms: 8
> Level Range: 6–12 (Acts 1–2)
> Origin Point: None

-----

## OVERVIEW

The Fight Pits are a repurposed water treatment plant in the waste ground between the Industrial District and the Fringe. The concrete settling basins — four meters deep, twenty meters across — make perfect arenas. Someone realized this years ago. Rade formalized it. The Chrome Wolves funded it. Now it's the only place in the city where people from every faction sit in the same crowd, watch the same violence, and pretend they have nothing in common.

The pits are Chrome Wolf territory, but they function as neutral ground by necessity. Helixion security comes off-duty. Iron Bloom scouts watch from the back rows. Freemarket vendors work the crowd. Parish runners place bets for people who can't leave the tunnels. D9 plainclothes attend because intelligence happens when people drink and gamble and forget to be careful. Everyone has a reason to be here. Everyone agrees that what happens outside the pits stays outside. Inside, the only law is Rade's.

The fights are real — PvE arena matches against tiered opponents, PvP challenge matches between consenting players. But the fights are the spectacle, not the game. The game is everything around the fights: the betting floor where fortunes change hands, the back rooms where Wolf business gets conducted, the chop shop where fighters buy their edge, and the social economy of reputation that determines who matters and who doesn't. Everyone watches the pits. Being seen at the pits matters. Winning at the pits makes you someone.

The complex is tight. Eight rooms. The smallest zone in the game but the most mechanically dense. Arena system, betting system, shop, chop shop, faction interactions, and a champion at the top of the ladder who hasn't lost in fourteen months.

-----

## ATMOSPHERE

```
Sound:    The crowd. Always the crowd. From outside: a rhythmic
          roar, impact sounds, cheering, the bass thump of a
          sound system someone wired to the announcer's mic.
          Inside: louder. The concrete basin amplifies everything.
          The announcer's voice bouncing off the walls. The wet
          sound of bodies hitting concrete. Between fights:
          conversation, laughter, glass clinking, the murmur
          of bets being placed.
Light:    Industrial floodlights angled into the pit basin.
          Everything inside the ring is overlit — white-bright,
          no shadows, nowhere to hide. Everything outside the
          ring is dim — warm neon from bar signs, the orange
          glow of cigarettes, faces lit from below by the pit's
          reflected glare. The contrast is deliberate. The
          fighters are the show. The audience is the dark.
Smell:    Sweat. Blood. Beer. Hot metal from the chop shop.
          Antiseptic from the fight doctor. Smoke from the
          crowd. Grilled food from a vendor in the stands.
          The underlying chemical tang of the waste ground
          seeping through the concrete.
```

-----

## ROOM MAP

```
    TO INDUSTRIAL DISTRICT
    (zone 3) District Border
              │
              │ east
       ┌──────┴──────┐
       │ THE         │
       │ APPROACH    │
       │ (1)         │
       └──────┬──────┘
              │
       ┌──────┴──────┐   ┌───────────┐
       │ THE BETTING │   │ THE CHOP  │
       │ FLOOR       ├───┤ SHOP      │
       │ (2)         │   │ (6)       │
       └──────┬──────┘   └───────────┘
              │
       ┌──────┴──────┐   ┌───────────┐
       │ THE PIT     │   │ FIGHTER   │
       │ (3)         ├───┤ PREP      │
       │  arena      │   │ (4)       │
       └──────┬──────┘   └─────┬─────┘
              │                │
              │           ┌────┴──────┐
              │           │ THE FIGHT │
              │           │ DOCTOR    │
              │           │ (5)       │
              │           └───────────┘
              │
       ┌──────┴──────┐
       │ BACK ROOMS  │
       │ (7)         │
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │ RADE'S      │
       │ OFFICE      │
       │ (8)         │
       └─────────────┘
```

-----

## ROOMS

### 1. THE APPROACH
**Waste ground. The sound gets louder with every step.**

```
> FIGHT PITS — THE APPROACH

The beaten dirt path from the Industrial District leads
through a gap in rusted fencing into the waste ground.
The water treatment plant is ahead — squat concrete
buildings, settling basins, the infrastructure of a city
that used to clean its water. Now the basins hold something
else and the sound coming from inside tells you exactly
what.

The crowd noise is rhythmic. A fight is happening. You
can hear the announcer's voice — amplified, distorted by
the concrete acoustics — calling the action. A roar from
the crowd. Someone just went down.

People stream in through gaps in the perimeter — no formal
entrance, no tickets. Payment is inside. The path is
worn by hundreds of feet. Neon strips have been wired
to the fencing, powered by a generator you can hear but
not see. Pink and orange. The Wolves' colors.

A sign, spray-painted on a concrete slab propped against
the fence: "WHAT HAPPENS IN THE PIT STAYS IN THE PIT.
EVERYTHING ELSE IS YOUR PROBLEM."
```

- **Exits:** east (Industrial District — District Border, zone 3), south (The Betting Floor)
- **NPCs:**
  - `crowd_arrivals` — Mixed faction. 4-6 present. People heading in. Chrome Wolves in leather and chrome. Off-duty dock workers. A woman in expensive clothes who doesn't belong here and knows it. Two men arguing about odds. The crowd is the most faction-diverse ambient population in the game — everyone comes to the pits.
- **Enemies:** None (the approach is public — violence here brings Rade's enforcers)
- **Objects:**
  - `the_sign` — Examine: "'WHAT HAPPENS IN THE PIT STAYS IN THE PIT. EVERYTHING ELSE IS YOUR PROBLEM.' The pits' only rule. Inside the complex, Rade's enforcers keep order. Outside, you're on your own. The sign is also a disclaimer — if you get hurt in the ring, that's the arrangement. You walked in. Nobody made you."
  - `neon_fencing` — Examine: "Pink and orange strips wired to the chain-link. Chrome Wolf colors. The power comes from a generator around the back. The neon turns the waste ground from abandoned infrastructure to venue. It's deliberate showmanship — the walk from the Industrial District to the pits is designed to build anticipation. The neon says: something is happening. Something you want to see."
  - `crowd_mix` — Examine: "Look at them. Chrome Wolves — obvious, loud, chrome glinting. Dock workers in high-vis. A man with Iron Bloom ink he thinks he's hiding under his sleeve. Two Freemarket vendors carrying cases of merchandise. A woman with Helixion mesh compliance indicators — she's off-duty, off-the-record, and her eyes are bright with something the mesh doesn't provide. The pits are the city's only neutral ground because everyone needs a place where the rules don't apply."

-----

### 2. THE BETTING FLOOR
**Where the money moves and the crowd watches.**

```
> FIGHT PITS — THE BETTING FLOOR

The settling basin's observation deck, repurposed as a
grandstand. Concrete tiers ring the pit below — four meters
down, floodlit, the arena visible from every angle. The
tiers are packed: people standing, sitting on the concrete
lips, leaning against the railing. The noise is enormous.

Between the spectators, the economy operates. A bar — planks
across chemical drums, bottles behind it, a bartender
pouring without looking. Food vendors with portable grills.
And the betting operation: a long table staffed by three
people, whiteboards covered in odds, names, and numbers
that update between every fight.

The announcer's booth is elevated above the tiers — a
scaffold platform with a microphone and a clear sightline
to the pit. The voice that echoes off every surface in
the complex comes from here.

You look down into the pit. Two fighters circle each other.
One has chrome arms. The other has nothing but speed and a
knife that's too small for the job. The crowd leans forward.
Everyone has money on this.
```

- **Exits:** north (The Approach), south (The Pit — via stairs into the basin), east (The Chop Shop)
- **NPCs:**
  - `spectators` — Mixed faction. 10-15 present (the largest ambient NPC count in the game). They bet, they drink, they shout. They'll talk about fighters, odds, past matches, grudges. The conversation is the zone's ambient lore — stories about legendary fights, fighters who disappeared, the night someone brought a feral augment into the ring and it killed both fighters and tried to climb the wall.
  - **SPIT** — The Bookie (SHOPKEEPER / INFORMANT)
    - Location: Behind the betting table. Three assistants handle traffic. Spit handles the numbers.
    - Faction: Chrome Wolves (financial arm — the pits' revenue flows through his table)
    - Disposition: Starts Neutral (0). Transactional. He likes money. He likes people who make him money. He dislikes people who cost him money. Simple.
    - Personality: Forties. Fast-talking, quick with numbers, faster with the mental math of odds than anyone with a calculator. He got the name because he talks so fast he spits. Missing two fingers on his left hand — payment for a debt he didn't settle fast enough, before he learned to always settle debts.
    - Services:
      - **Betting**: Place bets on upcoming fights. Odds are posted. Payouts are real CREDS. The house takes 15%. Spit's odds are good — not perfect. Players with COOL ≥ 6 or GHOST ≥ 5 can read the room for insider information that shifts the odds (detecting rigged fights, injured fighters, emotional states).
      - **Information**: Spit knows everyone who bets. He knows their habits, their debts, their connections. For CREDS, he'll tell you who's been betting heavy, who owes the Wolves, and who's been asking about you.
    - Quest:
      - **"The Fix"** (Tier 2): A fighter has been throwing matches — losing on purpose to pay off a debt. The losses are costing Spit's book. He wants the player to find out who's paying the fighter to lose. The trail leads to a D9 agent who's manipulating pit outcomes to create leverage over Chrome Wolf finances. Reward: CREDS + Spit's permanent intel service (he'll flag important betting patterns for you).
    - Dialogue hook: "Odds on Chrome Jaw are three-to-one against. Moth's the favorite but she's nursing a rib. You want action or you want information? Both cost. Information costs more."
  - **CALLOWAY** — The Announcer / Promoter (SERVICES / LORE)
    - Location: Scaffold booth above the tiers.
    - Faction: Chrome Wolves (entertainment management)
    - Disposition: Starts Friendly (+10). Calloway likes everyone. Calloway likes everything. Calloway is performing even when he's not performing. The enthusiasm is genuine. The man loves violence conducted as art.
    - Personality: Fifties. Big voice, bigger personality. He's the pits' master of ceremonies — he announces every fight, hypes the crowd, narrates the action in real-time. Between fights, he works the crowd, tells stories, sells the next match. He's been doing this for eight years and his voice is the sound of the pits.
    - Services:
      - **Fight registration**: Calloway manages the fight card. He registers players for PvE matches and facilitates PvP challenge matches. He assigns tiers based on player level and reputation.
      - **Fight commentary**: During player matches, Calloway narrates. This provides real-time feedback — "She's going for the legs!" "Watch the left!" — that serves as ambient flavor during combat.
      - **Reputation tracking**: Calloway remembers every fight. Win streaks, dramatic finishes, notable kills. He builds your reputation through his commentary. A player who wins consistently becomes a name. Calloway makes names.
    - Information: Calloway knows the history of the pits — every champion, every legendary fight, every death. He knows the current fighter roster, their strengths, their weaknesses. He'll share freely because stories are his currency.
    - Dialogue hook: "Ladies and gentlemen and whatever the hell the rest of you are — we have a NEW FACE in the pit tonight! Fresh from the streets! Untested! Unbroken! Let's see how long THAT lasts!"
- **Enemies:** None (the betting floor is neutral ground — Rade's enforcers are visible at every entrance)
- **Objects:**
  - `betting_board` — Examine: "Three whiteboards. Tonight's card listed in marker: fighter names, odds, match type. CHROME JAW vs. MOTH — 3:1. DEADSWITCH vs. THE SILENCER — even money. OPEN CHALLENGE — 5:1 against any taker. The odds shift between fights as Spit processes new bets. Names that don't come back get crossed out. Spit doesn't erase them."
  - `the_bar` — Examine: "Planks on chemical drums. Six different bottles, none labeled. The bartender pours by color. The drinks are strong and probably not safe and nobody cares. The bar runs on the honor system — you drink, you pay, or Rade's people have a conversation with you. Nobody stiffs the bar twice."
  - `the_view_down` — Examine: "Four meters below: the pit. Concrete basin, twenty meters across, floodlit from above. The floor is stained. The walls are scarred with impact marks. Two fighters circling. The one with chrome arms is bigger. The one with the knife is faster. The crowd knows who's going to win. The fighters don't. That's what makes it worth watching."

-----

### 3. THE PIT
**The arena. Twenty meters of concrete truth.**

```
> FIGHT PITS — THE PIT

The basin floor. You're in it now.

Twenty meters across. Four meters deep. Concrete walls on
every side — smooth, featureless, no handholds. The only
way out is the stairs you came down, and during a match,
those stairs have an enforcer standing at the top. The
floodlights above turn the pit into a stage — every
movement visible, every shadow eliminated. You can't hide
down here. You can only fight.

The floor is concrete, cracked in places, stained in others.
The stains are rust-colored. Some are fresh. The air smells
like sweat and iron and the chemical residue that still
seeps through the old treatment basin's joints.

The crowd above is a wall of faces and noise. From down
here, looking up, they're silhouettes against the
floodlights. Anonymous. Hungry. They paid to see someone
bleed. They don't care whose blood it is.
```

- **Exits:** up (The Betting Floor — via stairs), east (Fighter Prep — between matches only), down (Back Rooms — Rade's invitation only)
- **NPCs:** None during matches. Between matches:
  - `pit_crew` — 2-3. They clean the floor between fights. Mop, bucket, quick. They're efficient. They do this ten times a night.
- **Enemies (Arena System):**
  The pit operates on a tiered ladder system. Players register through Calloway and fight their way up:

  **Tier 1 — Fresh Meat (Level 6-7):**
  - `pit_fighter_t1` — Level 6-7. Three matches, escalating. Scrappers — improvised weapons, no augmentation. They fight because they need the money. They're not good. They're willing. Each has a fighting style: Brawler (high damage, low defense), Dodger (evasion-focused), Grappler (control, tries to pin).

  **Tier 2 — Regulars (Level 8-9):**
  - `pit_fighter_t2` — Level 8-9. Three matches. Experienced. Some augmentation — a chrome arm, enhanced reflexes, subdermal plating. They have reputations and fight styles the crowd knows. Named: CHROME JAW (heavy hitter, telegraphs), MOTH (speed, fragile), DEADSWITCH (dirty fighter, hidden weapons).

  **Tier 3 — The Circuit (Level 10-11):**
  - `pit_fighter_t3` — Level 10-11. Two matches. Professional. Heavily augmented. They fight for reputation, not money. Named: THE SILENCER (silent, precise, disassembles opponents technically), WRECKER (demolition — breaks augmentations specifically).
  - `pit_beast` — Level 9-10. 1 match. Non-human opponent. A feral augment, drugged and dropped into the ring. Erratic, dangerous, tragic. The crowd loves it. The fighters don't. It's the match nobody signs up for but everyone has to face.

  **Tier 4 — The Champion (Level 12):**
  - **THE CURRENT** — Pit Champion. Level 12. Boss fight. See NPCs below.

  **Rigged Matches:** At certain points in quest progression, opponents are rigged — paid to target specific weaknesses, or paid to lose (which creates its own problems when the player is supposed to win a fight the crowd expected them to lose). GHOST ≥ 5 detects a fix before the bell.

  **PvP Matches:** Players can challenge other players through Calloway. Both must consent. The match uses standard combat rules with pit-specific modifiers (no escape, crowd morale effects, Calloway's commentary). Winner takes a CREDS pot. Loser takes damage but isn't killed (the fight doctor intervenes at critical HP).

- **Objects:**
  - `pit_floor` — Examine: "Concrete. Cracked from impacts — not weathering, force. The stains are layered — old beneath new, dark beneath bright. The floor is a sedimentary record of violence. Every fight leaves something behind. The pit crew mops between matches but some things don't mop out."
  - `pit_walls` — Examine: "Smooth concrete, four meters high. Impact marks at waist height where fighters were thrown. Scratch marks higher up where someone tried to climb out. They didn't make it. The walls are the pit's defining feature — they make it final. Once you're in, you fight your way out or you're carried."
  - `the_floodlights` — Examine: "Industrial floods, angled from above. They eliminate shadow. In the pit, there's nowhere the light doesn't reach. Every movement is visible. Every cut, every bruise, every stumble. The audience sees everything. The fighter has no privacy. This is the arrangement: you fight in public. Your weakness is public. Your blood is public."
  - `the_crowd_from_below` — Examine: "Look up. Silhouettes leaning over the railing. Faces lit from below by the pit's reflected glare. They're shouting but from down here the individual words blur into a wave of sound — a single voice made of hundreds. When you're winning, the wave lifts you. When you're losing, it pushes you down. The crowd is the pit's real weapon."

-----

### 4. FIGHTER PREP
**Where you gear up. Where you face what's coming.**

```
> FIGHT PITS — FIGHTER PREP

A concrete room adjacent to the pit, accessible through a
heavy door. Benches along the walls. Hooks for gear. A
cracked mirror that shows you what you look like before
you go in. A bucket of water and a towel. A window —
barred — looking down into the pit, so you can watch the
match before yours and see what you're walking into.

Fighters sit here and wait. Some shadowbox. Some sit still.
Some vomit. The room smells like adrenaline and fear, which
are chemically similar and practically identical.

A man sits in the corner, away from the others. Older.
Heavy. His hands are wrapped but he's not fighting tonight.
He hasn't fought in years. But he's here. He's always here.
```

- **Exits:** west (The Pit — during match prep), south (The Fight Doctor)
- **NPCs:**
  - `waiting_fighters` — Mixed. 2-3 present between matches. They'll talk about their opponents, their odds, their strategy. Some are nervous. Some are calm in the way that people get calm when the decision is made and all that's left is the doing. They offer practical advice: "Chrome Jaw drops his right after a hook." "Moth can't take a body shot." "If you draw the beast, go for the implant junction at the neck."
  - **GRATH** — Retired Champion (TRAINER / LORE / QUESTGIVER)
    - Location: Corner. Always the corner. Same bench.
    - Faction: Chrome Wolves (former — he fought for the Wolves in the early days of the pits)
    - Disposition: Starts Neutral (0). He watches you before he talks to you. He's seen a thousand fighters. He knows which ones come back.
    - Personality: Fifties. Heavy. His body is a map of damage — scar tissue over scar tissue, a nose broken so many times it's flat, hands that can't fully close anymore. Both knees are augmented (replacement, not enhancement — the originals were destroyed). He was the first pit champion. Held the title for three years. Retired because his body couldn't do it anymore. He stays because he can't do anything else.
    - He doesn't coach — not formally. But he watches. And if he sees something in you — not talent, not strength, something else, something that looks like it matters — he talks. His advice is sparse and devastating. He sees fights the way a musician hears music: the rhythm, the space between movements, the moment before a blow lands when everything is decided.
    - Information: Grath knows the history of every champion. He knows The Current — the reigning champion — because he trained her. He knows what she can do. He also knows what might beat her, but he won't tell you unless he believes you deserve to know.
    - Quests:
      - **"The Old Way"** (Tier 2): Grath wants to see a clean fight. No augmentation advantages, no stims, no edge. He challenges the player to win a Tier 2 match using only base stats — no cyberware abilities, no combat drugs. Win and Grath respects you. He begins offering tactical advice before every match (permanent combat buff in the pit). He also tells you about The Current's weakness.
      - **"The Champion's Story"** (Tier 3): At Friendly disposition, Grath tells you about The Current — her name is Sera. He trained her. She was brilliant. Then she took a fight she shouldn't have and someone broke her in a way that didn't show on the outside. She fights angry now. She fights to hurt. Grath wants you to beat her — not to take the title, but to stop her before she kills someone in the ring. This is the gate quest for the Champion fight.
    - Dialogue hook: "...sit. No, there. Where I can see your hands. — You're fighting tonight? Let me watch you move. Just stand up. Walk to the door and back. — Hmm. You drop your left shoulder when you turn. Fix that or Chrome Jaw will find it."
- **Enemies:** None (the prep room is sacred space — no fighting outside the ring)
- **Objects:**
  - `cracked_mirror` — Examine: "The mirror shows you before you go in. It's cracked — a spiderweb of fracture lines from someone who didn't like what they saw. Or from someone who liked it too much. You look at yourself. Are you ready? The mirror doesn't know. The mirror shows. The decision is yours."
  - `pit_window` — Examine: "Barred window looking down into the basin. You can see the current match — fighters moving, the crowd above, the floodlights turning everything sharp and shadowless. Watching from here is different than watching from the stands. From here, you're next. The distance between spectator and participant is one door."
  - `grath_hands` — Examine: "His fingers don't close all the way. The knuckles are swollen — permanent calcification from thousands of impacts. The skin over them is a topography of scar tissue. These hands held the championship for three years. Now they can't hold a cup without trembling. He wraps them every night, out of habit. There's nothing to protect anymore. He wraps them anyway."
  - `fighter_gear` — Examine: "Hooks on the wall hold what fighters bring. Wraps, tape, mouth guards. A pair of augmented gauntlets — chrome, dented, someone's investment in surviving. A jar of something the label calls 'fighting balm' which is probably just menthol and hope. A towel with old bloodstains that laundering didn't remove."

-----

### 5. THE FIGHT DOCTOR
**Adjacent to prep. Keeps the meat running.**

```
> FIGHT PITS — THE FIGHT DOCTOR

A room that was probably a chemical testing lab when this
was a water treatment plant. Now it's a medical station
in the loosest possible sense. A table that serves as an
examination bed. A lamp. Drawers of supplies — bandages,
sutures, stims, painkillers, a bone-setting kit. A
cauterizing tool that smells like it's been used recently.

The fight doctor is not a doctor. She's a paramedic who
lost her license, or a nurse who left the system, or
something in between. What she is: fast, efficient, and
not interested in your feelings. She patches you up between
rounds. She patches you up after. She does not ask if
you want to keep fighting. That's not her department.
```

- **Exits:** north (Fighter Prep)
- **NPCs:**
  - **PATCH** — Fight Doctor (SERVICES / SHOPKEEPER)
    - Location: At the table. Always working — cleaning tools, sorting supplies, preparing for the next casualty.
    - Faction: Independent (contracted by the Wolves, loyal to her work)
    - Disposition: Starts Neutral (0). Professional indifference. She treats everyone the same — quickly, without sentiment, and with the expectation that you'll be back.
    - Personality: Thirties. No-nonsense. She speaks in instructions: "Hold still. Bite this. Don't move. Done." Her hands are steady in a way that suggests either extensive training or extensive practice or both. She doesn't make eye contact during treatment because she's looking at the wound, not the person. The wound is what matters.
    - She's not cold. She's focused. After treatment, if you talk to her — between the injuries, between the emergencies — she's thoughtful. She chose the pits because the injuries are honest. "In the city, the mesh hides what's wrong. People come to me broken on the inside and the mesh says they're fine. Here, if you're broken, you know it. Blood doesn't lie."
    - Services:
      - **Between-round healing**: Partial HP restore between pit match rounds. Quick, painful, effective. Keeps you fighting.
      - **Post-match healing**: Full HP restore after a match. Takes time. Costs CREDS.
      - **Combat stims**: Sells temporary combat buffs — painkillers (reduced damage taken, reduced perception), adrenaline shots (increased damage, reduced accuracy), neural sharps (increased perception, fragile). All have side effects. All are legal in the pit.
      - **Emergency save**: During matches, if a fighter hits critical HP, Patch intervenes. PvP matches are stopped. PvE matches against human opponents are stopped. Beast matches are... complicated. Patch has a tranq gun for the beasts. It doesn't always work fast enough.
    - Dialogue hook: "Sit. Shirt off. — That's a second-degree on the ribs. I can tape it or stitch it. Tape holds for one more fight. Stitches hold for good. Your call."
- **Enemies:** None
- **Objects:**
  - `medical_table` — Examine: "Metal. Cold. Stained despite cleaning. The surface is scored from bone-setting procedures — metal tools pressed hard against metal table. A thin pad that someone added for comfort. The comfort is marginal. The table works. Comfort is not the priority."
  - `supply_drawers` — Examine: "Organized by urgency. Top drawer: things that stop bleeding. Second drawer: things that reduce pain. Third drawer: things that set bones. Bottom drawer: locked. TECH ≥ 5: The locked drawer contains military-grade coagulant, a neural bypass kit, and three doses of something that doesn't have a label. Patch's reserves. For when the fight goes wrong in ways the normal supplies can't handle."
  - `cauterizing_tool` — Examine: "A heated iron for sealing wounds. Pre-Helixion medical technology. Brutal but effective — stops bleeding instantly, prevents infection, leaves scars that are badges in this environment. The tool has been used tonight. You can smell it. Someone went back into the ring after cauterization. That's either bravery or stupidity. In the pits, they're the same thing."
  - `tranq_gun` — Examine: "Mounted on the wall. Heavy-gauge tranquilizer pistol loaded with doses meant for industrial animals. Patch uses it when beast matches go wrong — when the feral augment stops fighting the opponent and starts trying to climb the wall toward the crowd. She's used it four times. One of those times, it didn't work fast enough."

-----

### 6. THE CHOP SHOP
**Quick augmentation. Fast, cheap, and risky.**

```
> FIGHT PITS — THE CHOP SHOP

A converted storage room off the betting floor. The door
has a neon sign: "UPGRADES." Inside: a reclined chair,
a wall of cyberware components in unlabeled bins, a
soldering station, and a man whose hands move faster than
his mouth.

This is not Dr. Rin Costa's clinic. There are no
sterilization protocols. No patient history. No recovery
time. The chop shop installs combat augmentations in
under an hour — fast, cheap, and with a failure rate
that the operator calls "acceptable" and anyone else
would call "alarming."

The fighters use it because the pits reward augmentation
and the chop shop is the only place that installs without
questions, without records, and without the Wolves' formal
vetting. You pay, you sit, you hope the solder holds.
```

- **Exits:** west (The Betting Floor)
- **NPCs:**
  - **NEEDLE** — Chop Shop Operator (SHOPKEEPER / SERVICES)
    - Location: At the soldering station. Working on something.
    - Faction: Chrome Wolves (unofficial — he operates under Wolf protection but isn't a member)
    - Disposition: Starts Neutral (0). Commercial. He sells what he sells.
    - Personality: Thirties. Fast hands, fast mouth. He oversells everything: "This reflex booster? Top line. Fell off a Helixion truck. Basically military grade. The scar? Character." His augmentation work is competent but not careful. He installs fast because the fighters need to be ready for their match. He installs cheap because the fighters can't afford Costa's rates. The tradeoff is risk — his installations have a failure chance that Costa's don't.
    - Services:
      - **Quick augmentation**: T1 combat cyberware installed in under an hour. Cheaper than Costa. Faster. But each installation has a failure chance (10-20% depending on complexity). Failure means the augmentation works initially but degrades over time, requiring repair or replacement. Costa can fix Needle's failures. Needle cannot fix Costa's work. The hierarchy is clear.
      - **Combat mods**: Temporary augmentation boosters for pit fights specifically — reflex overclockers (lasts one fight), subdermal hardeners (lasts one fight), targeting assists (lasts one fight). Cheaper than Patch's stims, different effects.
      - **Salvage trade**: Buys and sells used cyberware. Some of it was removed from fighters who didn't need it anymore. The bins are not labeled for a reason.
    - Quest: None (Needle is a service NPC — his value is mechanical, not narrative)
    - Dialogue hook: "What do you need? Speed, strength, or durability? I got all three. Installation takes forty minutes. Side effects are minimal. Mostly. Sit down, let me look at your interface ports."
- **Enemies:** None
- **Objects:**
  - `unlabeled_bins` — Examine: "Cyberware components in plastic bins. Fingers, wrist servos, optical lenses, subdermal panels. None labeled. Some are clearly new — factory-sealed Helixion packaging. Some are clearly used — scratched, worn, with mounting hardware still attached. The used ones were inside someone before they were in this bin. Needle doesn't talk about where the used ones come from."
  - `soldering_station` — Examine: "Magnifying lens, soldering iron, neural threading tools. The workspace is chaotic — components everywhere, half-finished modifications, a coffee cup balanced on a servo assembly. Needle works fast and messy. The results work. Not always for long. Not always correctly. But they work."
  - `the_chair` — Examine: "Reclined. Cracked vinyl. The armrests have grip marks where patients squeezed during installation. No anesthetic beyond a local injection. No bite guard like Costa's clinic — Needle says the pain is 'motivational.' The chair has a drain channel. For fluids. Don't ask."
  - `failure_rate_notice` — Examine: "A note taped to the wall in small print: 'ALL MODIFICATIONS CARRY INHERENT RISK. THE OPERATOR IS NOT LIABLE FOR DEGRADATION, REJECTION, OR UNEXPECTED BEHAVIOR. BY SITTING IN THE CHAIR YOU ACCEPT THESE TERMS.' Beneath it, in marker: 'Nobody reads this. — N.' He's right. Nobody does."

-----

### 7. BACK ROOMS
**Behind the pit. Where the real business happens.**

```
> FIGHT PITS — BACK ROOMS

Below the arena level, through a door that doesn't have
a sign. The corridor is concrete — original water treatment
infrastructure, tunnels that connected the settling basins
to the pumping system. The Wolves have repurposed them
into something between a lounge, a meeting room, and a
place where conversations happen that don't need witnesses.

The main space is furnished: couches salvaged from
somewhere nicer, a table, a bar better stocked than the
one upstairs. Low lighting. Music — not the crowd noise,
something deliberate, atmospheric. The people down here
are not spectators. They're the people the spectators work
for.

Chrome Wolf officers. Freemarket operators. A man in a
suit who is definitely D9 and everyone knows it and nobody
says it. This is where the pits' real economy operates:
fights get arranged, debts get settled, alliances get
negotiated over drinks that cost more than the fighters
make in a night.
```

- **Exits:** up (The Pit), south (Rade's Office)
- **NPCs:**
  - `back_room_regulars` — Mixed elite. 3-4 present. Chrome Wolf officers (senior, augmented, quiet authority). A Freemarket broker negotiating import routes. The D9 agent pretending to be a businessman. These NPCs provide high-level faction information through overheard conversation — if the player has GHOST ≥ 6, they can eavesdrop on discussions about Wolf operations, Freemarket supply chains, and D9 surveillance priorities.
- **Enemies:**
  - `back_room_enforcer` × 2 — Level 9-10. Rade's personal security. They stand at the entrances, armed, silent. They're not hostile unless the player causes trouble, tries to access Rade's office without invitation, or threatens a back-room guest. If engaged, they fight to subdue, not kill — dragging troublemakers back to the pit and throwing them to whatever's fighting next.
- **Objects:**
  - `the_better_bar` — Examine: "Better bottles. Better glasses. Real liquor — not the unlabeled acid sold upstairs. The bar down here is stocked with imports that came through Oyunn's docks. The prices aren't posted because the people who drink here don't ask what things cost."
  - `the_d9_agent` — Examine: (GHOST ≥ 6) "The man in the suit. He's pretending to drink. The glass hasn't gone down in twenty minutes. His eyes move in a pattern — sweep, register, categorize. He's working. Everyone in the room knows he's D9. He knows they know. The arrangement is mutual visibility — D9 tolerates the pits because the pits concentrate people who are interesting. The Wolves tolerate D9 watching because the alternative is D9 raiding."
  - `overheard_conversations` — Examine: (GHOST ≥ 6) "Fragments. A Wolf officer discussing a shipment timing with a Freemarket broker. The D9 agent asking the bartender about a specific fighter who's been winning too consistently — wondering if the fighter has connections worth investigating. Two people in the corner negotiating something that involves a map and a lot of CREDS. The back rooms are an intelligence buffet. If you can listen without being noticed."
  - `the_corridor` — Examine: "Original water treatment tunnels. The concrete is stained with chemical residue that predates the pits by decades. The infrastructure goes deeper — sealed doors lead to sections the Wolves haven't repurposed. What's behind them is anyone's guess. The treatment plant was built over something older. The pits sit on the same substrate as everything else."

-----

### 8. RADE'S OFFICE
**The man behind the pit. The Wolf behind the man.**

```
> FIGHT PITS — RADE'S OFFICE

Deeper than the back rooms. A door with a lock that's
better than anything else in the complex. Beyond it: a
room that's surprisingly clean. Concrete floor, swept.
A desk — real wood, salvaged, polished. A chair behind it
that doesn't match anything but looks comfortable. Filing
cabinets — physical, paper records. A wall of monitors
showing every angle of the pit, the betting floor, the
approach, the back rooms.

Rade sits behind the desk. He's different down here —
upstairs at the betting table he's the barker, the
evaluator, the public face. Down here he's the operator.
The monitors show him everything. The filing cabinets hold
records on every fighter, every bet, every back-room deal.
The pits are an operation and he runs it with the precision
of someone who understands that controlled violence is the
most profitable business model available to anyone who
isn't Helixion.

A photograph on the wall: Rade and Voss, younger, standing
in the pit before the first fight. The Wolves built this.
Rade built this. They're the same thing and they're not
and the distinction matters to nobody except Rade.
```

- **Exits:** north (Back Rooms)
- **NPCs:**
  - **RADE** — Pit Operator (expanded from z03 District Border appearance — FACTION LEADER / QUESTGIVER / INFORMANT)
    - Location: Behind the desk. Monitors glowing.
    - Faction: Chrome Wolves (operational management — the pits are the Wolves' biggest revenue source)
    - Disposition: Continues from z03. If the player completed "Fresh Meat" at the District Border, Rade starts at Neutral here. Otherwise Unfriendly (-10) — you haven't proven you're worth his time.
    - Personality (expanded): Indeterminate age. Lean. Missing his left ear, replaced with a low-grade audio implant he didn't bother making look natural. Down here, behind the desk, the carnival barker persona drops. Rade is sharp, quiet, and methodical. He sees the pits as an ecosystem — the fighters, the crowd, the betting, the back rooms, the deals. Every element feeds every other element. Disruption in one part cascades. His job is maintaining the balance.
    - He answers to Voss. He respects Voss. But the pits are his. He built the operation from a concrete hole and a bad idea into the most attended venue in the city. The Wolves profit. Rade profits. The arrangement works because Rade delivers results.
    - Information: Rade knows everyone who comes through the pits — their habits, their debts, their connections. He knows the D9 agent by name. He knows which Iron Bloom scouts attend which fights. He knows the Freemarket's supply pipeline through the pits' back channels. For the right price or the right favor, he shares.
    - Quests (expanded):
      - **"The Ladder"** (Tier 2-3): The full pit progression — fight through Tier 1-3 to earn the right to challenge The Current. Each tier has three fights (Tier 3 has two plus the beast match). Completing the ladder is the zone's main content arc. Reward per tier: CREDS, reputation, access to higher-tier services. Completing all tiers: right to challenge the champion.
      - **"House Business"** (Tier 3): Rade has a problem. Someone is skimming from the betting pool — the numbers don't balance. The theft is small but consistent, which means it's organized. He needs the player to investigate without alerting the betting floor staff. The trail leads to one of Spit's assistants, who's being pressured by a Freemarket broker who's using the stolen CREDS to fund something in the Black Market Warrens. Reward: Rade's permanent trust (unlocks back-room access at will + Rade becomes an ongoing quest source for Wolf-adjacent jobs).
      - **"The Beast Problem"** (Tier 2): The feral augments used for beast matches are getting harder to source — the Fringe population is thinning. Rade needs the player to find a new source or find an alternative. Options: capture feral augments from the Industrial District ruins (ethically uncomfortable), negotiate with the Drainage Nexus for tunnel creatures (the Parish will refuse), or convince Rade to replace beast matches with something else entirely (COOL ≥ 8 — Rade listens because the beasts are a liability). Each option has consequences for the pits' operation and the player's reputation.
    - Dialogue hook: "Come in. Close the door. — You've been making noise upstairs. Good noise. The kind that fills seats and moves money. Sit down. Let's talk about what you're worth to me."
- **Enemies:** None (Rade's office is the most protected room in the complex)
- **Objects:**
  - `monitor_wall` — Examine: "Eight screens. Every angle. The pit from above. The betting floor from three positions. The approach. The back rooms. Even the chop shop. Rade sees everything. The blind spots in his surveillance are intentional — the fighter prep room has no camera. The fight doctor's room has no camera. What happens in those spaces is private because Rade decided it should be."
  - `filing_cabinets` — Examine: "Paper records. Physical. No digital copies, no mesh storage. Every fighter who's entered the pit. Every match result. Every betting line. Every back-room agreement. Rade keeps records the way the Fringe scavengers keep their wall markings — analog, permanent, untouchable by system access. These cabinets are the pits' history and they're worth more than anything in the building."
  - `the_photograph` — Examine: "Rade and Voss. Younger. Standing in the pit — the basin was empty then, clean, unpurposed. Voss's augmentations are less extensive. Rade still has his ear. They're both grinning. The photograph is the only personal item in the room. Whatever Rade is now — operator, businessman, Wolf asset — this is where it started. Two people and a concrete hole and the belief that people would pay to watch other people fight."
  - `the_desk` — Examine: "Real wood. The only wood surface in the pits. Rade found it in the Fringe and carried it here himself. It's polished. He maintains it. In a complex built from concrete and chain-link and repurposed industrial waste, the desk is the only thing that someone chose because it was beautiful. Rade is not sentimental. But the desk is."

-----

### THE CURRENT — Pit Champion

**THE CURRENT** is the reigning pit champion. She's the zone's boss fight — the top of the ladder, the final challenge.

- **Name:** Sera (known only to Grath and Rade — to the crowd and the betting board, she is THE CURRENT)
- **Level:** 12
- **Location:** She does not have a room. She appears in the pit when challenged. Between matches, she's gone — she doesn't use the prep room, doesn't visit the doctor, doesn't drink at the bar. She arrives for her fight and leaves when it's done.
- **Faction:** Chrome Wolves (fighter — not a political member)
- **Visual:** Late twenties. Lean, explosive. Asymmetric augmentation — her left arm is chrome from the elbow down (precision-built, not Wolf standard — Costa's work). Her right is organic. Her eyes are her own. She moves like water and strikes like a piston. Her fighting style is technical aggression — she finds weaknesses and exploits them systematically, increasing pressure until the opponent breaks.
- **Personality:** Silent. She doesn't talk before fights. She doesn't talk after. Grath says she used to be different — warm, funny, the kind of person who made a room better by being in it. Then she took a fight she shouldn't have (Grath doesn't say which one) and something changed. Now she fights like she's trying to destroy something that isn't in the ring.
- **Mechanic:** Boss fight with three phases:
  - Phase 1 (100-70% HP): Technical. She probes, tests defenses, adapts. Predictable pattern once you read it.
  - Phase 2 (70-40% HP): Aggressive. She stops probing and starts pressing. Faster, harder, less predictable. The chrome arm does more work.
  - Phase 3 (40-0% HP): Angry. The technique breaks down into raw aggression. She's more dangerous but more vulnerable — openings appear that Phase 1 and 2 didn't have. This is what Grath meant: she fights angry and anger makes mistakes.
- **Grath's intel** (from "The Champion's Story" quest): The Current drops her guard on the organic side during Phase 3 transitions. The anger shifts her weight toward the chrome arm. The organic side is exposed for one beat — one counter-window per phase transition. Grath trained her. He knows the flaw. He wants you to use it to end this before she kills someone.
- **Reward for defeating The Current:** The Championship. Permanent reputation boost across ALL factions (everyone watches the pits). Mechanical reward: a unique combat ability — "Pit Instinct" (detect opponent weakness in the first round of any combat encounter, permanent passive). Narrative reward: Sera drops out of the pit circuit. What she does next depends on player interaction — if approached with compassion (COOL ≥ 7), she talks. For the first time in months. The conversation is short and devastating.

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| The Approach | east | Industrial District — District Border | 3 | None |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| Fresh Meat | Rade (z03) | 2 | COMBAT | Fight three Tier 1 matches. Earn a standing invitation. Gate to the pits. |
| The Ladder | Rade | 2-3 | COMBAT | Full pit progression. Tier 1 → 2 → 3 → Champion. The zone's main content arc. |
| The Fix | Spit | 2 | INVESTIGATE | Find who's paying a fighter to throw matches. Trail leads to D9 manipulation. |
| The Old Way | Grath | 2 | COMBAT | Win a Tier 2 match with no augmentation. Earn Grath's respect and tactical advice. |
| The Champion's Story | Grath | 3 | LORE/COMBAT | Learn Sera's story. Gain intel for the Champion fight. Beat her to save her. |
| House Business | Rade | 3 | INVESTIGATE | Find the betting pool skimmer. Trail leads to Freemarket → Black Market Warrens. |
| The Beast Problem | Rade | 2 | MULTI | Solve the feral augment sourcing problem. Three approaches, three consequences. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Pit Fighter T1 | 6-7 | The Pit (arena) | Structured match, three fights | CREDS (match purse) |
| Pit Fighter T2 | 8-9 | The Pit (arena) | Named opponents, fight styles | CREDS + reputation |
| Pit Fighter T3 | 10-11 | The Pit (arena) | Professional, augmented | CREDS + rare gear |
| Pit Beast | 9-10 | The Pit (arena) | Erratic, dangerous, tragic | CREDS + damaged cyberware |
| The Current (Sera) | 12 | The Pit (arena) | Boss — 3 phases, technical→aggressive→angry | Championship + Pit Instinct ability |
| Back-Room Enforcer | 9-10 | Back Rooms | Subdue, not kill. Drag to pit if provoked. | Nothing (they're not meant to be killed) |

-----

## DESIGN NOTES

**The Fight Pits are the game's social hub disguised as a combat zone.** The fights are the attraction. The game is everything around them — the betting economy, the faction mixing, the back-room intelligence, the reputation system. A player who never fights can still spend hours in the pits just listening, betting, and gathering information. The spectacle is the surface. The politics are the depth.

**The mixed PvE/PvP system creates the game's only consent-based conflict.** Players can fight each other here and only here. Both must agree. Calloway facilitates. Patch intervenes at critical HP. The system is designed to make PvP feel like an event — Calloway announces it, the crowd reacts, bets are placed. Player fights become stories that other players hear about.

**The beast match is the zone's moral test.** Feral augments in the ring — drugged, confused, forced to fight. The crowd loves it. The fighters hate it. Rade's "Beast Problem" quest forces the player to engage with the ethics: source more victims, find alternatives, or change the system. There's no clean answer. The pits run on violence. The question is what kind of violence you're willing to provide.

**The Current / Sera is the zone's emotional core.** A champion who fights because she's broken, not because she's strong. Grath trained her. Grath wants you to beat her. Not for the title — to stop her before the anger consumes what's left. The boss fight's three phases mirror her psychology: technique, aggression, rage. The opening in Phase 3 is the anger creating vulnerability. Beating her is a mercy. The post-fight conversation — if the player earns it — is the reward.

**Grath is the zone's Jonas.** The man who sees everything and says very little. His advice is sparse because precision matters more than volume. His quest — win without augmentation — is a philosophical challenge in a zone built on augmentation. Can you fight clean in a dirty world? Is the body enough? The Wolves' creed is "My Body, My Blueprint." Grath's test asks if you mean it.

**One zone exit.** Like the Nomads, the Fight Pits are a dead-end by design. You come here for a reason. You leave when that reason is done. The isolation makes the pits feel self-contained — a world within the world, with its own rules, its own economy, its own hierarchy. What happens in the pit stays in the pit.

**The D9 agent in the back rooms is the most dangerous person in the zone.** Not because he's armed. Because he's watching. The pits are the city's only place where every faction overlaps. D9 uses this — the agent is there to map connections, identify assets, and build leverage. Everyone knows. Nobody can do anything about it because removing D9 from the pits would remove the neutrality that makes the pits work. The mutual surveillance is the price of neutral ground.

> 8 rooms. 6 named NPCs + a champion. 6 enemy types. 1 zone exit.
> The pit is twenty meters of concrete truth. Everything around it is the lie that makes the truth profitable.
