import { Container } from "pixi.js";

export type DepthSortContainer = Container & {
  depthSortOffsetY?: number;
  depthSortPriority?: number;
};

export type DepthSortOptions = {
  depthSortOffsetY?: number;
  depthSortPriority?: number;
};

export function configureDepthSort<T extends DepthSortContainer>(
  target: T,
  options: DepthSortOptions = {},
): T {
  if (options.depthSortOffsetY !== undefined) {
    target.depthSortOffsetY = options.depthSortOffsetY;
  }

  if (options.depthSortPriority !== undefined) {
    target.depthSortPriority = options.depthSortPriority;
  }

  return target;
}

export class YSortSystem {
  private readonly layer: Container;
  private readonly entries: Map<DepthSortContainer, number> = new Map();
  private nextOrder: number = 0;

  private readonly PRIORITY_STEP = 1_000_000;
  private readonly ORDER_STEP = 0.001;

  constructor(layer: Container) {
    this.layer = layer;
    this.layer.sortableChildren = true;
  }

  register(target: DepthSortContainer, options: DepthSortOptions = {}): DepthSortContainer {
    configureDepthSort(target, options);

    if (!this.entries.has(target)) {
      this.entries.set(target, this.nextOrder++);
    }

    return target;
  }

  unregister(target: DepthSortContainer): void {
    this.entries.delete(target);
  }

  clear(): void {
    this.entries.clear();
  }

  sync(): void {
    const removed: DepthSortContainer[] = [];

    for (const [target, order] of this.entries.entries()) {
      if (target.destroyed || !target.parent) {
        removed.push(target);
        continue;
      }

      const offsetY = target.depthSortOffsetY ?? target.height;
      const priority = target.depthSortPriority ?? 0;
      target.zIndex = priority * this.PRIORITY_STEP + target.y + offsetY + order * this.ORDER_STEP;
    }

    for (const target of removed) {
      this.entries.delete(target);
    }

    this.layer.sortDirty = true;
  }
}
