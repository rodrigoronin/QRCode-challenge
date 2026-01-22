import { Container, Graphics } from "pixi.js";
import { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";
import { type Player } from "../entities/Player";
import { type Enemy } from "../entities/Enemy";

export class AttackCollider {
  private container: Container;
  public collider: Collider;
  private debugGraphics: Graphics;
  private width: number;
  private height: number;
  private position: { x: number; y: number } = { x: 0, y: 0 };
  private offsetX!: number;
  private offsetY!: number;
  public active: boolean;
  private duration: number;
  private timer: number;
  public owner?: Enemy | Player;

  constructor(
    width: number,
    height: number,
    duration: number,
    container: Container,
    owner: Enemy | Player,
  ) {
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.active = false;
    this.timer = 0;
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;

    this.container = container;
    this.collider = new Collider(12, 12, 0, 0, this.container, owner);

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

    CollisionManager.addEntityCollider(this.collider);

    const dist = 60;

    switch (direction) {
      case "up":
        this.position.x = -this.offsetX;
        this.position.y = -this.offsetY - dist;
        break;
      case "down":
        this.position.x = -this.offsetX;
        this.position.y = -this.offsetY + dist;
        break;
      case "left":
        this.position.x = -this.offsetX - dist;
        this.position.y = -this.offsetY;
        break;
      case "right":
        this.position.x = -this.offsetX + dist;
        this.position.y = -this.offsetY;
        break;
    }
  }

  deactivate() {
    this.active = false;
    this.position.x = 0;
    this.position.y = 0;

    this.debugGraphics.clear();

    if (this.debugGraphics.parent) this.debugGraphics.parent.removeChild(this.debugGraphics);

    CollisionManager.removeEntityCollider(this.collider);
  }

  updatePosition() {
    if (!this.active) return;

    this.debugGraphics.x = this.position.x;
    this.debugGraphics.y = this.position.y;
  }

  getBounds() {
    return {
      x: this.container.x + this.position.x,
      y: this.container.y + this.position.y,
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
