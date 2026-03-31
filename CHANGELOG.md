# Patch Notes

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
