import { Container, Graphics } from "pixi.js";
import { CollisionManager } from "./CollisionManager";

export class AttackCollider {
  private width: number;
  private height: number;
  private offsetX!: number;
  private offsetY!: number;
  public active: boolean;
  private duration: number;
  private timer: number;
  private container: Container;
  debugGraphics: Graphics;

  constructor(width: number, height: number, duration: number, container: Container) {
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.active = false;
    this.timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.container = container;

    this.debugGraphics = new Graphics();
  }

  update(delta: number) {
    if (!this.active) return;

    this.timer -= delta;

    if (this.timer <= 0) this.deactivate();
  }

  attachTo(container: Container) {
    if (this.debugGraphics.parent === container) return;
    container.addChild(this.debugGraphics);
  }

  activate(direction: string) {
    if (!this.debugGraphics.parent) this.attachTo(this.container);

    this.active = true;
    this.timer = this.duration;

    CollisionManager.addEntityCollider(this as any);

    const dist = 30;

    switch (direction) {
      case "up":
        this.offsetX = -this.width / 2;
        this.offsetY = -dist - 25;
        break;
      case "down":
        this.offsetX = -this.width / 2;
        this.offsetY = dist;
        break;
      case "left":
        this.offsetX = -dist - 25;
        this.offsetY = -this.height / 2;
        break;
      case "right":
        this.offsetX = dist;
        this.offsetY = -this.height / 2;
        break;
    }
  }

  deactivate() {
    this.active = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.debugGraphics.clear();

    if (this.debugGraphics.parent) this.debugGraphics.parent.removeChild(this.debugGraphics);

    CollisionManager.removeEntityCollider(this as any);
  }

  updatePosition() {
    if (!this.active) return;

    this.debugGraphics.x = this.offsetX;
    this.debugGraphics.y = this.offsetY;
  }

  getBounds() {
    return {
      x: this.container.x + this.offsetX,
      y: this.container.y + this.offsetY,
      width: this.width,
      height: this.height,
    };
  }

  drawDebug() {
    if (!this.active) return;

    this.debugGraphics.clear();
    this.debugGraphics
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0xffa500, alpha: 0.2 })
      .stroke({ width: 1, color: 0xffa500 });
  }
}
