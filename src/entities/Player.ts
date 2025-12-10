import { Graphics, Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";
import { AttackCollider } from "../core/AttackCollider";
import type { WorldCollider } from "../core/WorldCollider";
import * as Constants from "../utils/Constants";

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
  // attack
  private attackCollider: AttackCollider | null = null;

  constructor(frames: Record<string, Texture[]>) {
    super();
    this.frames = frames;

    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.anim = new AnimationController(this.sprite);
    this.setupAnimations();

    // Can be used for visual debugging the player sprite
    this.hitboxDebug = new Graphics();

    this.attackCollider = new AttackCollider(
      12 * Constants.SCALE_FACTOR,
      12 * Constants.SCALE_FACTOR,
      1, // TODO: change from seconds to milliseconds
      this.container
    );

    this.dashSpeed = this.speed * 6;

    this.container.addChild(this.sprite);

    // Create the Collider last so the debugDraw appears over the player
    this.hitbox = new Collider(15, 17, this.container);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    if (this.input.wasJustPressed("Space")) {
      this.tryStartDash();
    }

    if (!this.isDashing && this.input.wasJustPressed("KeyJ")) {
      this.basicAttack();
    }

    if (this.isDashing) {
      this.updateDash(deltaTime);
      this.anim.play(`dash_${this.currentDir}`);
      return; // doesn't let the player move during dash
    }

    // movement
    const futureX = this.container.x + move.x * this.speed * deltaSec;
    const futureY = this.container.y + move.y * this.speed * deltaSec;

    // checking the axis isolated enable player do slide on walls
    if (!this.checkCollisions(futureX, this.container.y)) {
      this.container.x = futureX;
    }
    if (!this.checkCollisions(this.container.x, futureY)) {
      this.container.y = futureY;
    }

    this.updateDirection(move);

    if (move.x !== 0 || move.y !== 0) {
      this.anim.play(`walk_${this.currentDir}`);
    } else {
      this.anim.play(`idle_${this.currentDir}`);
    }

    this.anim.update(deltaTime);

    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= deltaTime;
    }

    // Adds the AttackCollider to player container if attacking, remove if not
    if (this.attackCollider?.active) {
      this.attackCollider?.updatePosition(this.container);
      this.attackCollider?.update(deltaSec);
      this.attackCollider?.drawDebug();
    }

    console.log(this.container.children);

    this.hitbox.drawDebug();
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
    const { width, height } = this.hitbox.getBounds();

    const newBounds = {
      x: newX - width / 2,
      y: newY - height / 2,
      width,
      height,
    };

    for (const wall of this.worldColliders) {
      const wallBounds = wall.getBounds();

      if (
        newBounds.x < wallBounds.x + wallBounds.width &&
        newBounds.x + newBounds.width > wallBounds.x &&
        newBounds.y < wallBounds.y + wallBounds.height &&
        newBounds.y + newBounds.height > wallBounds.y
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
  }

  private basicAttack() {
    console.log("is attacking");

    if (this.attackCollider?.active) return;

    this.attackCollider?.activate(this.currentDir);
  }

  // private drawDebug() {
  //   const { width, height } = this.hitbox.getBounds(this.container);

  //   const x = -width / 2;
  //   const y = -height / 2;

  //   this.hitboxDebug.clear();
  //   this.hitboxDebug
  //     .rect(x, y, width, height)
  //     .fill({ color: 0x00ff00, alpha: 0.2 })
  //     .stroke({ width: 1, color: 0x00ff00 });
  // }
}
