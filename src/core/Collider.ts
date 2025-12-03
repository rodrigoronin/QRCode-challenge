import { type Container } from "pixi.js";

interface ColliderParams {
  width: number;
  height: number;
  position?: { x: number; y: number };
  scale?: number;
}

export class Collider {
  private width: number;
  private height: number;
  private position: { x: number; y: number };
  private scale: number;

  constructor({ width, height, position, scale = 1 }: ColliderParams) {
    this.position = position ?? { x: 0, y: 0 };
    this.scale = scale;
    this.width = width * this.scale;
    this.height = height * this.scale;
  }

  updateFromEntity(container: Container) {
    if (!container) return;

    const globalPos = container.getGlobalPosition();

    this.position.x = globalPos.x;
    this.position.y = globalPos.y;
  }

  getBounds() {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
