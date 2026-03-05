import { Sprite, Texture, TextureSource } from "pixi.js";
import { Entity } from "../core/Entity";
import { AnimationController } from "../core/AnimationController";

class NPC extends Entity {
  public sprite: Sprite;
  private anim: AnimationController;

  constructor(texture: Texture<TextureSource>) {
    super();

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.anim = new AnimationController(this.sprite, true);
    this.anim.addAnimation("idle_down", [texture]);

    this.container.addChild(this.sprite);
  }

  update() {
    this.anim.play(`idle_down`);
  }
}

export default NPC;
