import { Container, Graphics } from "pixi.js";

interface AttackColliderProps {
  width: number;
  height: number;
  duration: number;
}

export class AttackCollider {
  private width: number;
  private height: number;
  private offsetX!: number;
  private offsetY!: number;
  public active: boolean;
  private duration: number;
  private timer: number;
  debugGraphics: Graphics;

  constructor({ width, height, duration }: AttackColliderProps) {
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.active = false;
    this.timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.debugGraphics = new Graphics();
  }

  update(delta: number) {
    if (!this.active) return;

    this.timer -= delta;

    console.log(this.timer);

    if (this.timer <= 0) this.deactivate();
  }

  activate(direction: string) {
    this.active = true;
    this.timer = this.duration;

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
  }

  updatePosition(playerContainer: Container) {
    if (!this.active) return;

    this.debugGraphics.x = this.offsetX;
    this.debugGraphics.y = this.offsetY;
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
