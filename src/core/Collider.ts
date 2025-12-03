import { Point, type Container } from "pixi.js";

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

    const entityPosition = container.getGlobalPosition();
    const localPosition = container.toLocal(new Point(entityPosition.x, entityPosition.y));

    this.position.x = localPosition.x;
    this.position.y = localPosition.y;
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
