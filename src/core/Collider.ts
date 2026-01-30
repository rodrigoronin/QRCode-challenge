import { Graphics, type Container } from "pixi.js";
import * as Constants from "../utils/Constants";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";

export class Collider {
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  private debug: Graphics;
  public container: Container;
  public owner: Enemy | Player;

  constructor(
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    container: Container,
    owner: Enemy | Player,
  ) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.debug = new Graphics();
    this.container = container;
    this.owner = owner;

    this.container.x += this.offsetX;
    this.container.y += this.offsetY;

    this.attachTo(this.container);
  }

  attachTo(container: Container) {
    if (this.debug.parent === container) return;
    container.addChild(this.debug);
  }

  getBounds() {
    if (this.container.destroyed) return null;

    return {
      x: this.container.x + this.offsetX - this.width / 2,
      y: this.container.y + this.offsetY - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  getBoundsAt(x: number, y: number) {
    if (this.container.destroyed) return null;

    return {
      x: x + this.offsetX - this.width / 2,
      y: y + this.offsetY - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  drawDebug() {
    this.debug.clear();

    const x = -this.width / 2;
    const y = -this.height / 2;

    this.debug
      .rect(x + this.offsetX, y + this.offsetY, this.width, this.height)
      .fill({ color: 0x00ff00, alpha: 0.2 })
      .stroke({ width: 2, color: 0xff0000, alpha: 0.2 });
  }
}
