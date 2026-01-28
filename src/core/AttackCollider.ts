import { Container, Graphics, Texture, Sprite } from "pixi.js";
import { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";
import { type Player } from "../entities/Player";
import { type Enemy } from "../entities/Enemy";
import { AnimationController } from "./AnimationController";
import * as Constants from "../utils/Constants";

export class AttackCollider {
  private container: Container;
  private attackContainer: Container;
  public collider: Collider;
  private debugGraphics: Graphics;
  private width: number;
  private height: number;
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

    this.attackContainer = new Container();
    this.container = container;
    this.container.addChild(this.attackContainer);
    this.collider = new Collider(12, 12, 0, 0, this.container, owner);

    this.debugGraphics = new Graphics();
  }

  update(delta: number) {
    if (!this.active) return;

    this.timer -= delta;

    this.updatePosition();

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

    const dist = 60;

    switch (direction) {
      case "up":
        this.attackContainer.position.x = -this.offsetX;
        this.attackContainer.position.y = -this.offsetY - dist;
        break;
      case "down":
        this.attackContainer.position.x = -this.offsetX;
        this.attackContainer.position.y = -this.offsetY + dist;
        break;
      case "left":
        this.attackContainer.position.x = -this.offsetX - dist;
        this.attackContainer.position.y = -this.offsetY;
        break;
      case "right":
        this.attackContainer.position.x = -this.offsetX + dist;
        this.attackContainer.position.y = -this.offsetY;
        break;
    }

    if (this.VFXFrames) {
      const animName = `attack_${direction}`;
      const frames = this.VFXFrames[animName];
      if (frames && frames.length > 0) {
        this.VFXSprite = new Sprite(frames[0]);
        this.VFXSprite.anchor.set(0.5);
        this.VFXSprite.scale.set(Constants.SCALE_FACTOR);
        if (direction === "left") this.VFXSprite.scale.x = -Constants.SCALE_FACTOR;
        if (direction === "up") this.VFXSprite.scale.y = -Constants.SCALE_FACTOR;
        if (direction === "down") this.VFXSprite.scale.x = -Constants.SCALE_FACTOR;
        // TODO: use offset of the current equipped weapon
        this.VFXSprite?.position.set(
          this.VFXSprite.position.x + this.width / 2, // the vfx is offset 75 pixels right
          this.VFXSprite.position.y + this.height / 2, // the vfx is offset 60 pixels down
        );
        this.attackContainer.addChild(this.VFXSprite);

        this.VFXAnim = new AnimationController(this.VFXSprite, false);
        this.VFXAnim.addAnimation(animName, frames);
        this.VFXAnim.play(animName);
        this.VFXAnim.setSpeed(60);
      }
    }
  }

  deactivate() {
    this.active = false;
    this.attackContainer.position.x = 0;
    this.attackContainer.position.y = 0;

    this.debugGraphics.clear();

    if (this.debugGraphics.parent) this.debugGraphics.parent.removeChild(this.debugGraphics);

    if (this.VFXSprite) {
      this.container.removeChild(this.VFXSprite);
      this.VFXSprite.destroy({ children: true });
      this.VFXSprite = null;
    }
    this.VFXAnim = null;
  }

  updatePosition() {
    if (!this.active) return;

    this.debugGraphics.x = this.attackContainer.position.x;
    this.debugGraphics.y = this.attackContainer.position.y;
  }

  getBounds() {
    return {
      x: this.container.x + this.attackContainer.position.x,
      y: this.container.y + this.attackContainer.position.y,
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
