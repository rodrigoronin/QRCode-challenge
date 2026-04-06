# Patch Notes

## [0.7.0] - Interaction System (Initial)

### ✨ Added

* Basic InteractionSystem
* InteractableComponent
* Player interaction input
* Priority-based selection
* Basic tag system for Entity

🔧 Changes

None

⚡ Improvements

None

🐛 Fixed

* Blacksmith NPC was using Player class, changed to use NPC class
* Preserve just-pressed input state across keyboard and gamepad sources

📝 Notes

* Initial implementation (no collider integration yet)
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
