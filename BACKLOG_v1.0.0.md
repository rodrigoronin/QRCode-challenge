# BACKLOG v1.0.0 - Trello Cards

## How To Use This Backlog

- Cards are ordered by execution priority.
- Do not start a later card if an earlier dependency card is not done.
- Each card is implementation-ready and scoped for solo development.
- If a card grows too large while implementing, split it into sub-cards before coding.

## List 1 - Foundation

### Card 01 - Refactor Main Bootstrap Into Game Flow Entry Point

**Goal**
Remove the current one-file world bootstrap from `src/main.ts` and turn it into a clean game entry point.

**Instructions**
- keep `src/main.ts` responsible only for app boot, shared system initialization, and starting the first scene
- move world assembly, entity spawn wiring, and temporary area setup out of `src/main.ts`
- define clear ownership for app init, game loop, and scene start
- preserve the current fixed update loop, input polling, camera update, and HUD update behavior while refactoring

**Deliverables**
- slimmed `src/main.ts`
- clear module boundaries for app bootstrap and world or scene setup

**Done When**
- `src/main.ts` no longer manually constructs the whole playable area
- the game still boots and plays exactly as before

### Card 02 - Create Minimal Scene Or Area Manager

**Goal**
Add a minimal structure to load and unload playable areas.

**Instructions**
- implement a lightweight scene or area manager with support for area enter, update, and exit
- support loading one active area at a time
- make the manager compatible with the current Pixi container hierarchy and camera setup
- avoid adding save/load or advanced persistence in this card

**Deliverables**
- scene or area manager module
- area lifecycle API

**Done When**
- the game can switch active areas through one centralized flow

### Card 03 - Define Area Content Contract

**Goal**
Create a repeatable way to describe what belongs in an area.

**Instructions**
- define what an area needs: map container, world colliders, props, NPCs, enemies, transitions, and player spawn point
- make this contract simple enough to support hand-authored areas
- do not build a full editor or data-driven map tool yet
- prefer plain objects or small factory modules over overengineered content schemas

**Deliverables**
- area definition pattern
- one example area module using the pattern

**Done When**
- new areas can be added without editing unrelated bootstrap code

### Card 04 - Add Area Transition Triggers

**Goal**
Let the player move between areas through doors, exits, or trigger volumes.

**Instructions**
- implement trigger entities or interactables that request area changes
- support setting the player spawn point in the destination area
- ensure camera, collision, and interaction state are reset correctly on area load
- block transition spam during loading or activation

**Deliverables**
- reusable transition trigger logic
- destination spawn support

**Done When**
- player can move cleanly between connected areas at runtime

## List 2 - Vertical Slice Content

### Card 05 - Build Village Area

**Goal**
Create the main hub area for the slice.

**Instructions**
- assemble a small village layout using current placeholder assets
- place the player spawn, at least 2 NPCs, and enough props to communicate space purpose
- include one NPC for quest or story guidance and one NPC for utility such as healing, vendor, or upgrade
- set navigation and collision so the space is readable and easy to traverse

**Deliverables**
- playable `village` area
- spawn point and transitions out of the hub

**Done When**
- the village feels like a real place, not a test room

### Card 06 - Build Field Area

**Goal**
Create the connector area between the village and dungeon.

**Instructions**
- build one semi-open route that supports exploration, enemy placement, and travel pacing
- use the field to teach movement, combat rhythm, and the approach to the dungeon
- include at least one optional side nook or reward space if it can be done cheaply
- keep the layout small enough to finish quickly

**Deliverables**
- playable `field` area
- transition from village to field and field to dungeon

**Done When**
- the field sells traversal and makes the dungeon feel discovered, not teleported into

### Card 07 - Build Dungeon Area Shell

**Goal**
Create the dungeon layout and progression path.

**Instructions**
- build a handcrafted dungeon with 4 to 6 rooms
- define a main path and one simple gating mechanic such as lever, key, locked door, or boss seal
- reserve one room for the boss
- reserve one room for the dungeon objective or pre-boss setup

**Deliverables**
- playable `dungeon` area shell
- room sequence and transition points

**Done When**
- the player can enter the dungeon and progress through a clear room path

### Card 08 - Add Dungeon Objective Flow

**Goal**
Make the dungeon more than a combat hallway.

**Instructions**
- implement one simple objective flow such as find key, activate lever, clear room, or unlock seal
- communicate the current objective through interaction, level layout, or UI
- ensure the player cannot skip directly to boss completion without satisfying the objective
- keep the objective logic intentionally simple for the first slice

**Deliverables**
- objective state logic
- objective feedback to the player

**Done When**
- the dungeon has a recognizable progression rule and the player can complete it

### Card 09 - Add Intro, Goal, And Completion Dialogue

**Goal**
Give narrative framing to the slice.

**Instructions**
- create a minimal dialogue system or dialogue presentation layer for NPC interactions
- implement introductory dialogue in the village
- implement one dialogue beat that sets the dungeon objective
- implement one completion or reward dialogue beat after the boss
- keep dialogue support narrow: no branching dialogue editor required

**Deliverables**
- dialogue UI or presentation flow
- dialogue content for intro, goal, and completion

**Done When**
- a player can understand the premise and current goal without external explanation

## List 3 - Combat And Encounters

### Card 10 - Lock Player Demo Kit

**Goal**
Freeze the player feature set for the vertical slice.

**Instructions**
- define the exact player moveset for v1.0.0
- keep basic attack and dash
- choose one offensive skill and one utility or defensive skill
- document what is included and explicitly mark what is postponed
- do not add extra combat mechanics after this card unless they replace an existing move

**Deliverables**
- locked feature list for player kit
- implementation notes for remaining combat cards

**Done When**
- the slice has a stable player combat scope

### Card 11 - Implement Offensive Skill

**Goal**
Add one combat skill that expands the player's choices.

**Instructions**
- implement one offensive skill with clear purpose, feedback, and cooldown or resource cost
- integrate it into input, combat resolution, and animation or VFX flow
- ensure the skill is strong enough to matter but not so strong that it replaces all other actions
- reuse current combat architecture where possible

**Deliverables**
- offensive skill
- UI or feedback for cooldown or availability

**Done When**
- the player has a meaningful offensive option beyond basic attack

### Card 12 - Implement Utility Or Defensive Skill

**Goal**
Add one non-damage skill that changes combat decision making.

**Instructions**
- implement one utility or defensive skill such as guard burst, mobility burst, self-buff, or temporary defense
- ensure it creates a different kind of player decision than the offensive skill
- keep implementation scope tight and readable

**Deliverables**
- utility or defensive skill

**Done When**
- the player can make at least one tactical decision besides attack timing

### Card 13 - Create Fast Enemy Archetype

**Goal**
Add a lightweight pressure enemy.

**Instructions**
- create a fast low-HP enemy variant
- tune movement and attack timing to pressure the player without becoming unreadable
- reuse existing enemy architecture where possible
- ensure the enemy looks and behaves differently enough from the base melee enemy

**Deliverables**
- fast enemy archetype
- spawn configuration for field or dungeon encounters

**Done When**
- encounters can use speed pressure as a design tool

### Card 14 - Create Ranged Or Special Enemy Archetype

**Goal**
Add an enemy that changes positioning and spacing decisions.

**Instructions**
- implement a true ranged or special-behavior enemy, replacing the placeholder use of `Enemy` for ranged content
- add projectile or ranged attack logic if needed
- ensure the player must reposition or prioritize targets differently when this enemy is present

**Deliverables**
- ranged or special enemy archetype

**Done When**
- mixed encounters create different combat priorities

### Card 15 - Build Boss Fight

**Goal**
Create one memorable boss encounter for the slice.

**Instructions**
- define one boss concept, moveset, and arena behavior
- implement readable telegraphs
- implement at least 2 behavior sets, phases, or threshold-driven changes
- add boss-specific intro and defeat handling
- focus on clarity and pacing over mechanical complexity

**Deliverables**
- playable boss fight
- boss completion trigger

**Done When**
- the boss can carry the climax of the demo

### Card 16 - Author Encounter Pass

**Goal**
Place and tune combat encounters across the field and dungeon.

**Instructions**
- place enemy groups intentionally instead of scattering them randomly
- teach one enemy type at a time before combining them
- create escalation from field to dungeon to boss
- tune enemy placement to support pacing, not just difficulty

**Deliverables**
- encounter placements for field and dungeon
- basic difficulty curve

**Done When**
- combat pacing feels authored from start to finish

## List 4 - Progression

### Card 17 - Add XP And Level-Up

**Goal**
Introduce the lightest possible progression loop.

**Instructions**
- award XP from enemy kills
- implement level-up thresholds
- grant a visible power increase on level-up
- keep data model simple and avoid full RPG stat complexity for this version

**Deliverables**
- XP tracking
- level-up logic
- visible level-up feedback

**Done When**
- the player can level up during the slice

### Card 18 - Add One Upgrade Moment

**Goal**
Give the player one clear power choice or reward moment.

**Instructions**
- implement one village or post-boss upgrade flow
- examples: increase attack, increase max HP, improve a skill, unlock a passive bonus
- keep the choice count low and presentation clear
- connect the upgrade to story progression or dungeon completion if possible

**Deliverables**
- one upgrade interaction flow

**Done When**
- the player can feel a concrete before-and-after improvement

### Card 19 - Add Reward And Completion Loop

**Goal**
Close the dungeon loop with a proper payoff.

**Instructions**
- define what the player receives after boss completion
- add completion state, reward delivery, and return-to-hub or victory flow
- ensure the player cannot finish the slice without seeing the payoff
- tie the reward to progression, narrative, or both

**Deliverables**
- dungeon clear payoff flow

**Done When**
- the slice ends with a reward, not an abrupt stop

## List 5 - UI And Presentation

### Card 20 - Replace Temporary HUD With Slice HUD

**Goal**
Upgrade the current placeholder HUD into a presentable demo UI.

**Instructions**
- replace or clean up the temporary DOM HUD created in `src/main.ts`
- display HP, MP, current objective, and interaction prompt clearly
- ensure the HUD remains readable during combat and exploration
- keep implementation simple and stable

**Deliverables**
- presentable HUD for the slice

**Done When**
- core gameplay info is readable without debug context

### Card 21 - Add Title Screen And Start Flow

**Goal**
Give the demo a proper entry point.

**Instructions**
- add a title screen with start action
- transition cleanly into the first playable area
- keep menu scope small: start game, maybe quit or credits if trivial
- avoid adding large settings work in this card

**Deliverables**
- title screen
- playable start flow

**Done When**
- the demo starts like a game, not a dev sandbox

### Card 22 - Add Objective Presentation

**Goal**
Make current goals visible at all times.

**Instructions**
- implement a lightweight objective tracker or status UI
- support objective set, update, and complete states
- wire it into intro dialogue, dungeon objective, and completion flow
- keep the text brief and readable

**Deliverables**
- objective UI
- objective state flow

**Done When**
- a new player rarely wonders what to do next

### Card 23 - Audio And Feedback Pass

**Goal**
Improve impact and readability for the whole slice.

**Instructions**
- connect combat, UI, and boss events to sound feedback
- add or clean up hit SFX, skill SFX, boss cues, and menu audio where possible
- improve visual feedback where needed: hit flash, VFX timing, screen shake, impact clarity
- focus on the most noticeable moments first

**Deliverables**
- stronger feedback pass across combat and flow

**Done When**
- the game feels more alive and reads better in motion

### Card 24 - Add Completion Screen Or Return-To-Hub Payoff

**Goal**
Finish the slice cleanly after victory.

**Instructions**
- define whether the slice ends with a return-to-hub sequence, completion card, or short epilogue
- implement the chosen flow
- include reward confirmation and a short emotional resolution beat

**Deliverables**
- clear end-of-slice flow

**Done When**
- the player reaches an intentional ending state

## List 6 - Stabilization

### Card 25 - Bug Fixing And Softlock Pass

**Goal**
Remove blockers before external testing.

**Instructions**
- test all transitions, combat flows, dialogue triggers, boss completion, and reward loops
- fix softlocks, broken triggers, invalid spawns, and progression blockers first
- document known low-priority issues separately instead of mixing them with release blockers

**Deliverables**
- bug list triaged by severity
- blocker fixes

**Done When**
- the slice can be completed reliably without developer intervention

### Card 26 - Difficulty And Pacing Pass

**Goal**
Smooth the player experience from start to finish.

**Instructions**
- review onboarding, encounter difficulty, upgrade timing, boss tuning, and downtime between beats
- reduce spikes that punish first-time players unfairly
- preserve challenge while improving readability and learning

**Deliverables**
- tuned pacing and difficulty values

**Done When**
- the slice feels fair, paced, and understandable

### Card 27 - Capture-Ready Demo Pass

**Goal**
Prepare the build for pitch footage and external sharing.

**Instructions**
- remove distracting debug behavior and unfinished dead ends
- ensure the first 5 minutes are especially polished
- verify that the game can produce clean gameplay footage from title screen to boss or reward
- prepare a stable demo branch or build target

**Deliverables**
- capture-ready demo build

**Done When**
- you can hand the build to someone else or record it confidently

## Shortlist - Cut If The Schedule Tightens

If time gets tight, cut in this order:

1. optional side nook in the field
2. extra utility NPC
3. extra upgrade choice depth
4. advanced HUD presentation
5. non-essential audio polish
6. any feature not visible in the first 20 minutes
