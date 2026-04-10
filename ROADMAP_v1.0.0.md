# ROADMAP v1.0.0 - Vertical Slice

## Goal

Deliver a publisher-ready vertical slice for a single-player action RPG.

The slice must prove:

- satisfying action combat
- exploration across interconnected areas
- one short story arc
- light RPG progression
- one handcrafted dungeon
- one memorable boss fight
- a clean start-to-finish playable loop

This roadmap replaces the older wave-based combat demo plan. The project direction is now:

`Title Screen -> Village -> Field -> Dungeon -> Boss -> Reward / Return`

## Product Scope For v1.0.0

The v1.0.0 slice should be playable in roughly 15 to 25 minutes and include:

- title screen
- one village hub
- one outdoor field / connector area
- one handcrafted dungeon with 4 to 6 rooms
- 2 to 3 enemy archetypes
- one boss encounter
- player basic attack + dash + 1 offensive skill + 1 utility or defensive skill
- NPC dialogue with a clear objective
- thin progression: XP, one upgrade moment, one reward after completion
- basic UI for HP, MP, objective, interaction, and completion flow

## Scope Excluded From v1.0.0

The following are explicitly out of scope for this version:

- multiplayer
- post-game systems
- procedural generation
- multiple player archetypes
- full discipline tree
- crafting depth
- full economy simulation
- large equipment database
- broad content expansion beyond the first slice
- major architecture refactors that do not directly unblock the slice

## Milestone 1 - Slice Skeleton

### Objective

Create the game structure needed to stop building everything inside a single test bootstrap.

### Deliverables

- minimal scene or area manager
- support for `village`, `field`, and `dungeon` areas
- spawn points and exits
- transition flow between areas
- area-specific entity spawning
- area-specific collision and props

### Exit Criteria

- player can travel village -> field -> dungeon -> village without manual code changes
- camera, collision, NPCs, and enemies still work after transitions

## Milestone 2 - Core Content Slice

### Objective

Build the first complete playable route through the game.

### Deliverables

- one village layout
- one field layout
- one handcrafted dungeon layout
- one simple dungeon objective such as key, lever, or gate unlock
- core NPC dialogue for intro, goal, and completion

### Exit Criteria

- a new player can understand where to go and what to do
- the slice can be completed from start to finish

## Milestone 3 - Combat Depth

### Objective

Raise combat quality enough to carry the demo and pitch footage.

### Deliverables

- locked player demo kit
- 1 offensive skill
- 1 utility or defensive skill
- 2 to 3 enemy archetypes
- 1 boss with readable telegraphs and at least 2 behavior sets

### Exit Criteria

- combat is fun even before progression
- enemy variety creates meaningful decisions
- boss fight is readable and memorable

## Milestone 4 - Thin RPG Progression

### Objective

Add enough progression to sell the RPG promise without overbuilding systems.

### Deliverables

- XP and level-up
- one upgrade point in the village or after boss completion
- simple reward flow
- one visible increase in player power

### Exit Criteria

- player feels stronger by the end of the slice
- progression is understandable without external explanation

## Milestone 5 - Presentation And Pitch Quality

### Objective

Convert the playable prototype into a clean demo suitable for capture and external presentation.

### Deliverables

- title screen
- dialogue UI
- objective UI
- improved HUD
- interaction prompts
- audio pass
- completion screen or return-to-hub payoff

### Exit Criteria

- game can be recorded into a clear 60 to 90 second trailer-like video
- a first-time player can finish the slice without developer guidance

## Milestone 6 - Stabilization

### Objective

Lock down the slice, remove blockers, and package the build.

### Deliverables

- bug fixing
- balance pass
- difficulty smoothing
- removal of confusing unfinished features
- build verification

### Exit Criteria

- no progression blockers
- no softlocks
- no major control or UI confusion
- demo can be handed to an external player

## Development Priorities

Work in this order:

1. structure and area flow
2. content path
3. combat depth
4. progression
5. presentation
6. stabilization

If a task does not improve the first 20 minutes of the game or the quality of pitch footage, it is not a priority for v1.0.0.

## Definition Of Done For v1.0.0

The version is done when:

1. the player starts from a title screen
2. enters the village
3. gets a clear objective from an NPC
4. travels through the field
5. enters the dungeon
6. clears encounters and completes the dungeon objective
7. defeats the boss
8. receives a reward or unlock
9. returns to the hub or reaches a short completion beat

At that point the demo is ready for external playtesting and pitch preparation.
