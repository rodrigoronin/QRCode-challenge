import { Container, Graphics, Texture, Sprite, Point } from "pixi.js";
import { type Player } from "@entities/Player";
import { type Enemy } from "@entities/Enemy";
import { AnimationController } from "./AnimationController";
import { debugState } from "./systems/DebugState";

export class AttackCollider {
  private container: Container;
  private attackContainer: Container;
  private debugGraphics: Graphics | null;
  private unsubscribeDebug?: () => void;
  private debugEnabled = true;
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
    this.owner = owner;

    this.attackContainer = new Container();
    this.container = container;
    this.container.addChild(this.attackContainer);

    this.debugGraphics = new Graphics();
    this.unsubscribeDebug = debugState.subscribe((enabled) => {
      this.debugEnabled = enabled;

      if (!this.debugGraphics || this.debugGraphics.destroyed) return;

      this.syncDebug();
    });
  }

  update(delta: number) {
    if (!this.active) return;

    this.timer -= delta;

    this.updatePosition();

    if (this.VFXAnim) this.VFXAnim.update(delta);

    if (this.timer <= 0) this.deactivate();
  }

  attachTo(container: Container) {
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;
    if (this.debugGraphics.parent === container) return;
    container.addChild(this.debugGraphics);
  }

  activate(direction: Point, dist: number) {
    if (this.debugGraphics && !this.debugGraphics.parent) this.attachTo(this.container);

    this.active = true;
    this.timer = this.duration;

    const newX = Math.round(direction.x);
    const newY = Math.round(direction.y);

    this.attackContainer.position.x = newX * dist - this.offsetX;
    this.attackContainer.position.y = newY * dist - this.offsetY;

    if (this.VFXFrames) {
      const visualDir = this.owner?.currentDir;
      const animName = `attack_${visualDir}`;
      const frames = this.VFXFrames[animName];
      if (frames && frames.length > 0) {
        this.VFXSprite = new Sprite(frames[0]);
        this.VFXSprite.anchor.set(0.5);
        if (visualDir === "left") this.VFXSprite.scale.x = -1;
        if (visualDir === "up") this.VFXSprite.scale.y = -1;
        if (visualDir === "down") this.VFXSprite.scale.x = -1;
        // TODO: use offset of the current equipped weapon
        this.VFXSprite?.position.set(
          this.VFXSprite.position.x + this.offsetX, // offset by half the AttackCollider width
          this.VFXSprite.position.y + this.offsetY, // offset by half the AttackCollider height
        );
        this.attackContainer.addChild(this.VFXSprite);

        this.VFXAnim = new AnimationController(this.VFXSprite, false);
        this.VFXAnim.addAnimation(animName, frames);
        this.VFXAnim.play(animName);
        this.VFXAnim.setSpeed(60);
      }
    }

    this.syncDebug();
  }

  deactivate() {
    this.active = false;
    this.attackContainer.position.x = 0;
    this.attackContainer.position.y = 0;
    this.debugGraphics?.clear();

    if (this.debugGraphics?.parent) this.debugGraphics.parent.removeChild(this.debugGraphics);

    if (this.VFXSprite) {
      this.attackContainer.removeChild(this.VFXSprite);
      this.VFXSprite.destroy({ children: true });
      this.VFXSprite = null;
    }
    this.VFXAnim = null;
  }

  updatePosition() {
    if (!this.active) return;
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;

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

  private syncDebug() {
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;

    const shouldShow = this.debugEnabled && this.active;
    this.debugGraphics.visible = shouldShow;

    if (!shouldShow) {
      this.debugGraphics.clear();
      return;
    }

    this.drawDebug();
    this.updatePosition();
  }

  drawDebug() {
    if (!this.active) return;
    if (!this.debugGraphics || this.debugGraphics.destroyed) return;

    this.debugGraphics.clear();
    this.debugGraphics
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0xffa500, alpha: 0.2 })
      .stroke({ width: 1, color: 0xffa500 });
  }

  destroy() {
    this.unsubscribeDebug?.();
    this.unsubscribeDebug = undefined;
    this.debugGraphics?.destroy();
    this.debugGraphics = null;
  }
}
