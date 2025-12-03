import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";

type Direction = "up" | "down" | "left" | "right";

export class Player extends Entity {
  private sprite: Sprite;
  private speed = 180; // pixels/second
  private hitbox: Collider;
  private input = InputManager.get();
  private currentDir: Direction = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;

  constructor(frames: Record<string, Texture[]>) {
    super();
    this.frames = frames;

    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(3); // y positivo pra garantir
    this.anim = new AnimationController(this.sprite);
    this.setupAnimations();

    this.hitbox = new Collider({ width: 16, height: 15 });

    this.container.addChild(this.sprite);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    // movement
    this.container.x += move.x * this.speed * deltaSec;
    this.container.y += move.y * this.speed * deltaSec;

    this.updateDirection(move);

    // update player hitbox position
    this.hitbox.updateFromEntity(this.container);

    if (move.x !== 0 || move.y !== 0) {
      this.anim.play(`walk_${this.currentDir}`);
    } else {
      this.anim.play(`idle_${this.currentDir}`);
    }

    this.anim.update(deltaTime);
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  private updateDirection(m: { x: number; y: number }) {
    if (Math.abs(m.x) > Math.abs(m.y)) {
      this.currentDir = m.x > 0 ? "right" : "left";
    } else if (m.y !== 0) {
      this.currentDir = m.y > 0 ? "down" : "up";
    }
    // horizontal flip
    // s.sprite.scale.x = this.currentDir === "right" ? -3 : 3;
  }
}
