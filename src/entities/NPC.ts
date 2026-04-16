import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { AnimationController } from "../core/AnimationController";
import { InteractableComponent } from "@core/components/InteractableComponent";
import type { DepthSortOptions } from "@core/systems/YSortSystem";

class NPC extends Entity {
  public sprite: Sprite;
  private anim: AnimationController;
  private frames: Record<string, Texture[]>;
  public interactable: InteractableComponent;

  constructor(frames: Record<string, Texture[]>, depthSortOptions: DepthSortOptions = {}) {
    super(depthSortOptions);

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.frames = frames;
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();
    if (depthSortOptions.depthSortOffsetY === undefined) {
      this.setDepthSortOffsetY(this.sprite.height / 2);
    }
    this.interactable = new InteractableComponent(this, 1, "Talk", this.onInteract.bind(this));

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

  onInteract() {
    console.log(`Interacted with ${this.tag}`);
  }
}

export default NPC;
