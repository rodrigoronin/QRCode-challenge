import { Graphics, type Container } from "pixi.js";
import * as Constants from "../utils/Constants";

interface ColliderParams {
  width: number;
  height: number;
  position?: { x: number; y: number };
}

export class Collider {
  private width: number;
  private height: number;
  private scale: number;
  private debug: Graphics;

  constructor({ width, height }: ColliderParams) {
    this.scale = Constants.SCALE_FACTOR;
    this.width = width * this.scale;
    this.height = height * this.scale;

    this.debug = new Graphics();
  }

  attachTo(container: Container) {
    container.addChild(this.debug);
  }

  getBounds(container: Container) {
    return {
      x: container.x - this.width / 2,
      y: container.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  drawDebug() {
    this.debug.clear();

    const x = -this.width / 2;
    const y = -this.height / 2;

    this.debug
      .rect(x, y, this.width, this.height)
      .fill({ color: 0x00ff00, alpha: 0.2 })
      .stroke({ width: 1, color: 0x00ff00 });
  }
}
