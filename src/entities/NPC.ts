import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { AnimationController } from "../core/AnimationController";

class NPC extends Entity {
  public sprite: Sprite;
  private anim: AnimationController;
  private frames: Record<string, Texture[]>;

  constructor(frames: Record<string, Texture[]>) {
    super();

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.frames = frames;
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();

    this.container.addChild(this.sprite);
  }

  update() {
    this.anim.play(`idle_down`);
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }
}

export default NPC;
