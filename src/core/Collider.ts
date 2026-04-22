import { Graphics, type Container } from "pixi.js";
import type { Enemy } from "@entities/Enemy";
import type { Player } from "@entities/Player";
import { debugState } from "./systems/DebugState";

export class Collider {
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  private debugGraphics: Graphics | null;
  private unsubscribeDebug?: () => void;
  public container: Container;
  public owner: Player | Enemy;

  constructor(
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
    container: Container,
    owner: Player | Enemy,
  ) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.debugGraphics = new Graphics();
    this.container = container;
    this.owner = owner;

    this.container.x += this.offsetX;
    this.container.y += this.offsetY;

    this.attachTo(this.container);

    this.unsubscribeDebug = debugState.subscribe((enabled) => {
      if (!this.debugGraphics || this.debugGraphics.destroyed) return;

      this.debugGraphics.visible = enabled;

      if (enabled) this.drawDebug();
      else this.debugGraphics.clear();
    });
  }

  attachTo(container: Container) {
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;
    if (this.debugGraphics.parent === container) return;
    container.addChild(this.debugGraphics);
  }

  getBounds() {
    if (this.container.destroyed) return null;

    return {
      x: Number((this.container.x + this.offsetX - this.width / 2).toFixed()),
      y: Number((this.container.y + this.offsetY - this.height / 2).toFixed()),
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
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;

    this.debugGraphics.clear();

    const x = -this.width / 2;
    const y = -this.height / 2;

    this.debugGraphics
      .rect(x + this.offsetX, y + this.offsetY, this.width, this.height)
      .fill({ color: 0x00ff00, alpha: 0.2 })
      .stroke({ width: 1, color: 0x00ff00 });
  }

  destroy() {
    this.unsubscribeDebug?.();
    this.unsubscribeDebug = undefined;
    this.debugGraphics?.destroy();
    this.debugGraphics = null;
  }
}
