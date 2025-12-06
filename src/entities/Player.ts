import { Graphics, Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";
import type { WorldCollider } from "../core/WordlCollider";

type Direction = "up" | "down" | "left" | "right";

export class Player extends Entity {
  private sprite: Sprite;
  private hitbox: Collider;
  private hitboxDebug: Graphics;
  private input = InputManager.get();
  private currentDir: Direction = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;
  private speed = 180; // pixels/second
  private worldColliders: WorldCollider[] = [];

  // Dash variables
  private isDashing: boolean = false;
  private dashTime: number = 0;
  // how many frames is the dash in millisecons (60 = 1 frame)
  private dashDuration: number = 180;
  private dashCooldown: number = 1000; // in milliseconds (1000 = 1 second)
  private dashCooldownTimer: number = 0;
  private dashSpeed: number;
  private dashDirection = { x: 0, y: 0 };

  constructor(frames: Record<string, Texture[]>) {
    super();
    this.frames = frames;

    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(3); // y positivo pra garantir
    this.anim = new AnimationController(this.sprite);
    this.setupAnimations();

    this.hitbox = new Collider({ width: 15, height: 17, scale: this.sprite.scale.x });
    this.hitboxDebug = new Graphics(); // For visual debug

    this.dashSpeed = this.speed * 3;

    this.container.addChild(this.sprite);
    this.container.addChild(this.hitboxDebug);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    if (this.input.wasJustPressed("Space")) {
      this.tryStartDash();
    }

    if (this.isDashing) {
      this.updateDash(deltaTime);
      return; // doesn't let the player move during dash
    }

    // movement
    const futureX = this.container.x + move.x * this.speed * deltaSec;
    const futureY = this.container.y + move.y * this.speed * deltaSec;

    if (!this.checkCollisions(futureX, this.container.y)) {
      this.container.x = futureX;
    }
    if (!this.checkCollisions(this.container.x, futureY)) {
      this.container.y = futureY;
    }

    this.updateDirection(move);

    // update player hitbox position
    this.hitbox.updateFromEntity(this.container);

    if (move.x !== 0 || move.y !== 0) {
      this.anim.play(`walk_${this.currentDir}`);
    } else {
      this.anim.play(`idle_${this.currentDir}`);
    }

    this.anim.update(deltaTime);

    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= deltaTime;
    }

    this.drawDebug();
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  tryStartDash() {
    if (this.isDashing || this.dashCooldownTimer > 0) return;

    this.dashDirection = this.input.getMovementVector();
    this.isDashing = true;
    this.dashTime = 0;

    this.anim.play(`walk_${this.currentDir}`);
  }

  updateDash(deltaTime: number) {
    const deltaSec = deltaTime / 1000;

    const futureX = this.container.x + this.dashDirection.x * this.dashSpeed * deltaSec;
    const futureY = this.container.y + this.dashDirection.y * this.dashSpeed * deltaSec;

    const hit = this.checkCollisions(futureX, futureY);

    if (!hit) {
      this.container.x = futureX;
      this.container.y = futureY;
    } else {
      this.isDashing = false;
      this.dashCooldownTimer = this.dashCooldown;
    }

    this.dashTime += deltaTime;

    if (this.dashTime >= this.dashDuration) {
      this.isDashing = false;
      this.dashCooldownTimer = this.dashCooldown;
    }
  }

  setWorldColliders(list: WorldCollider[]) {
    this.worldColliders = list;
  }

  private checkCollisions(newX: number, newY: number): WorldCollider | null {
    const { width: hitboxWidth, height: hitboxHeight } = this.hitbox.getBounds();
    const offsetX = hitboxWidth / 2;
    const offsetY = hitboxHeight / 2;

    for (const wall of this.worldColliders) {
      const bounds = wall.getBounds();

      if (
        newX + offsetX > bounds.x &&
        newY + offsetY > bounds.y &&
        newX - offsetX < bounds.x + bounds.width &&
        newY - offsetY < bounds.y + bounds.height
      ) {
        return wall;
      }
    }

    return null;
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

  private drawDebug() {
    const { x, y, width, height } = this.hitbox.getBounds();
    const localPos = this.container.toLocal({ x, y });
    this.hitboxDebug.clear();
    this.hitboxDebug
      .rect(localPos.x, localPos.y, width, height)
      .fill({ color: 0xff0000, alpha: 0.2 })
      .stroke({ width: 1, color: 0xff0000 });
  }
}
