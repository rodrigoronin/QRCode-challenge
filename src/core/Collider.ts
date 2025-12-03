import type { Container } from "pixi.js";

interface ColliderParams {
  width: number;
  height: number;
  position?: { x: number; y: number };
}

export class Collider {
  private width: number;
  private height: number;
  private position: { x: number; y: number };

  constructor({ width, height, position }: ColliderParams) {
    this.position = position ?? { x: 0, y: 0 };
    this.width = width;
    this.height = height;
  }

  updateFromEntity(container: Container) {
    if (!container) return;
    this.position.x = container.position.x;
    this.position.y = container.position.y;
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}
