# Patch Notes

## [0.8.0] - Y-Sorting Layer

### ✨ Added

- Y-position-based depth sorting for world actors and props
- Configurable `depthSortOffsetY` on entities and world objects
- Sorted gameplay layer separated from map and collider/debug layers

### 🔧 Changes

- Main scene now mounts map, actor, and collider layers separately
- Entities can receive depth sort options at instantiation
- Static props now define their depth offset so tall sprites sort from their foot position

### ⚡ Improvements

- World objects render in a more natural top-down order
- Dead or destroyed entities are ignored by the sorter during sync

### 🐛 Fixed

- Render order no longer depends on add-child order alone

### 📝 Notes

- This release establishes the first sorting layer pass for the vertical slice

---

## [0.7.4] - Scene Transitions and Enemy AI

### ✨ Added

- Scene factory to store and reuse created scenes
- Dungeon area for testing scene transitions
- Trigger-based world collider events for area transitions

### 🔧 Changes

- Main scenes now suspend and resume enemies when switching areas
- World colliders are registered and removed as scenes are entered and exited
- Enemy creation now requires a roaming area
- Enemy AI now includes player perception, chasing, and flanking during recovery

### ⚡ Improvements

- Cleaned up scene transition flow between main and dungeon areas
- Enemy behavior is more readable and responsive during combat

### 🐛 Fixed

- Damage application to entities
- Enemy hit flash now uses a white color matrix

### 📝 Notes

- This release focuses on scene transitions, dungeon setup, and enemy combat behavior

---

## [0.7.0] - Interaction System (Initial)

### ✨ Added

- Basic InteractionSystem
- InteractableComponent
- Player interaction input
- Priority-based selection
- Basic tag system for Entity

🔧 Changes

None

⚡ Improvements

None

🐛 Fixed

- Blacksmith NPC was using Player class, changed to use NPC class
- Preserve just-pressed input state across keyboard and gamepad sources

📝 Notes

- Initial implementation (no collider integration yet)
  Tooltip is placeholder

---

## [0.6.1] - Refactor

### ✨ Added

- Introduced `AssetLoader` class to centralize asset management

### 🔧 Changed

- Removed manual asset loading logic from `main.ts`
- Moved texture loading flow into a dedicated system
- Replaced direct asset imports with dynamic loading using `import.meta.glob`
- Standardized asset naming and access through a `Map<string, Texture>`

### ⚡ Improvements

- Reduced complexity and size of `main.ts`
- Improved scalability for adding new assets (no more manual imports required)
- Simplified texture access via `getTexture()`

### 🐛 Fixed

- Fixed issue where textures were not being loaded due to missing function invocation (`loadAllTextures()`)
- Ensured async initialization flow is properly awaited before asset usage

---

## 0.6.0

### ✨ Added

- Dynamic camera zoom using mouse wheel
- Player-centered zoom (camera focuses on player instead of origin)
- Smooth camera follow using lerp

### 🔧 Changed

- Removed static SCALE_FACTOR in favor of dynamic zoom system
- Camera now calculates position based on zoom and screen size

### 🐛 Fixed

- Reduced camera jitter with pixel snapping
- Fixed camera offset issues when resizing screen

---
