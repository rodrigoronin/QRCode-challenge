import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { AnimationController } from "../core/AnimationController";
import { InteractableComponent } from "@core/components/InteractableComponent";

class NPC extends Entity {
  public sprite: Sprite;
  private anim: AnimationController;
  private frames: Record<string, Texture[]>;
  public interactable: InteractableComponent;

  constructor(frames: Record<string, Texture[]>) {
    super();

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.frames = frames;
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();
    this.interactable = new InteractableComponent(this, 1, "Talk", this.onInteract);

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
    console.log("Interacted!");
  }
}

export default NPC;
