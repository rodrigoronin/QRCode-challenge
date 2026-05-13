# Exuvia Engine

An experimental top-down action RPG engine built with TypeScript, PixiJS, Vite, and Tauri.

> This project is a work in progress. Development is active, but updates may be irregular because I am also splitting time with another ongoing project.

## Current State

- Scene loading and area transitions are already in place.
- Player movement, dash, and attack flow are implemented in the current prototype.
- NPC interaction, world colliders, and trigger-based transitions are part of the core loop.
- Y-sorting is implemented for top-down depth handling.
- Gamepad input support is being mapped alongside keyboard-driven commands.
- The project currently serves as both a playable prototype and an engine playground for systems iteration.

## Getting Started

### Requirements

- Node.js
- npm

### Run locally

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Desktop shell

If you want to run the Tauri desktop shell:

```bash
npm run tauri
```

## Project Notes

- Y-sorting details: [docs/Y_SORTING.md](docs/Y_SORTING.md)
- Gamepad button notes: [GamepadKeys.md](docs/GamepadKeys.md)

## Expectations

This repository should be treated as an in-progress codebase rather than a stable framework.

There is no fixed update schedule. Work will likely land in bursts whenever I have time available between other commitments, so slower periods are expected.
