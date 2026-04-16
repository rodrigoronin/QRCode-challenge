# Y-Sorting Implementation

## Overview

The engine now uses a dedicated y-sorting layer for top-down rendering.
World actors and props are sorted by their world Y position so objects with a lower foot position render behind objects with a higher foot position.

## Render Structure

- `stage`
- `camera.container`
- `world`
- `mapLayer`
- `actorLayer`
- `colliderLayer`
- `worldVFX`

Only `actorLayer` participates in y-sorting.
The map and collider/debug layers stay outside the sort so they remain stable and predictable.

## Sorting Rule

The sorter computes depth from:

1. `depthSortPriority`
2. `y + depthSortOffsetY`
3. registration order as a stable tie-breaker

`depthSortOffsetY` is optional and should be used for sprites that do not sort correctly from their container origin alone.
For tall props like trees or houses, the offset should usually point to the bottom of the visible sprite.

## How To Use

- Entities can receive depth options when they are created.
- Static sprites or props can be configured with `configureDepthSort(sprite, { depthSortOffsetY: ... })`.
- If no offset is provided, the sorter falls back to the object height.

Example:

```ts
const tree = new Sprite(texture);
configureDepthSort(tree, { depthSortOffsetY: tree.height });
```

## Behavior Notes

- Dead or destroyed objects are automatically removed from the sorter on sync.
- UI, damage numbers, and other VFX should stay in their own layer.
- The implementation is intentionally simple and uses Pixi `zIndex` as the final render ordering mechanism.

## Future Follow-Up

Later improvements can add:

- helper factories for depth-sorted props
- asset-specific anchor metadata
- optional manual priority overrides for special scenes

