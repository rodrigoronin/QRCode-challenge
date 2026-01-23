import { Container, Graphics, Texture, Sprite } from "pixi.js";
import { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";
import { type Player } from "../entities/Player";
import { type Enemy } from "../entities/Enemy";
import { AnimationController } from "./AnimationController";
import * as Constants from "../utils/Constants";

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
  private VFXFrames?: Record<string, Texture[]>;
  private VFXSprite: Sprite | null = null;
  private VFXAnim: AnimationController | null = null;

  constructor(
    width: number,
    height: number,
    duration: number,
    container: Container,
    owner: Enemy | Player,
    VFXFrames?: Record<string, Texture[]>,
  ) {
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.active = false;
    this.timer = 0;
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;
    this.VFXFrames = VFXFrames;

    this.container = container;
    this.collider = new Collider(12, 12, 0, 0, this.container, owner);

    this.debugGraphics = new Graphics();
  }

  update(delta: number) {
    if (!this.active) return;

    this.timer -= delta;

    if (this.VFXAnim) this.VFXAnim.update(delta);

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

    if (this.VFXFrames) {
      const animName = `attack_${direction}`;
      const frames = this.VFXFrames[animName];
      if (frames && frames.length > 0) {
        this.VFXSprite = new Sprite(frames[0]);
        this.VFXSprite.anchor.set(0.5);
        this.VFXSprite.scale.set(Constants.SCALE_FACTOR);
        this.VFXSprite.x = this.position.x;
        this.VFXSprite.y = this.position.y;
        if (direction === "left") this.VFXSprite.scale.x = -Constants.SCALE_FACTOR;
        if (direction === "down") this.VFXSprite.scale.y = -Constants.SCALE_FACTOR;
        this.container.addChild(this.VFXSprite);

        this.VFXAnim = new AnimationController(this.VFXSprite, false);
        this.VFXAnim.addAnimation(animName, frames);
        this.VFXAnim.play(animName);
        this.VFXAnim.setSpeed(80);
      }
    }
  }

  deactivate() {
    this.active = false;
    this.position.x = 0;
    this.position.y = 0;

    this.debugGraphics.clear();

    if (this.debugGraphics.parent) this.debugGraphics.parent.removeChild(this.debugGraphics);

    CollisionManager.removeEntityCollider(this.collider);

    if (this.VFXSprite) {
      this.container.removeChild(this.VFXSprite);
      this.VFXSprite.destroy({ children: true });
      this.VFXSprite = null;
    }
    this.VFXAnim = null;
  }

  updatePosition() {
    if (!this.active) return;

    this.debugGraphics.x = this.position.x;
    this.debugGraphics.y = this.position.y;

    if (this.VFXSprite) {
      this.VFXSprite.x = this.position.x + 30;
      this.VFXSprite.y = this.position.y + 20;
    }
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
