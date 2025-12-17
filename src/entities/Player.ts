import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";
import { AttackCollider } from "../core/AttackCollider";
import * as Constants from "../utils/Constants";
import { CollisionManager } from "../core/CollisionManager";

type Direction = "up" | "down" | "left" | "right";

export class Player extends Entity {
  private sprite: Sprite;
  private collider: Collider;
  private input = InputManager.get();
  private currentDir: Direction = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;
  private speed = 150; // pixels/second
  public tag: string = "player";

  // Dash variables
  private isDashing: boolean = false;
  private dashDistance: number = 150;
  private dashTime: number = 0;
  // how many frames is the dash in millisecons (60 = 1 frame)
  private dashDuration: number = 180;
  private dashCooldown: number = 500; // in milliseconds (1000 = 1 second)
  private dashCooldownTimer: number = 0;
  private dashSpeed: number;
  private dashDirection = { x: 0, y: 0 };
  // attack
  private attackCollider: AttackCollider;

  constructor(frames: Record<string, Texture[]>) {
    super();
    this.frames = frames;

    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.anim = new AnimationController(this.sprite);
    this.setupAnimations();

    this.attackCollider = new AttackCollider(
      12 * Constants.SCALE_FACTOR,
      12 * Constants.SCALE_FACTOR,
      500,
      this.container,
      this
    );

    this.dashSpeed = this.dashDistance / (this.dashDuration / 1000);

    this.container.addChild(this.sprite);

    // Create the Collider last so the debugDraw appears over the player
    this.collider = new Collider(15, 17, this.container, this);
    CollisionManager.addEntityCollider(this.collider);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    if (this.input.wasJustPressed("Space")) {
      this.tryStartDash();
    }

    if (!this.isDashing && this.input.wasJustPressed("KeyJ")) {
      this.basicAttack();

      const hits: Collider[] = CollisionManager.getOverlaps(this.attackCollider);

      for (const hit of hits) {
        if (hit.owner?.tag === "enemy" && !this.attackCollider.damagedList.includes(hit)) {
          hit.owner?.takeDamage(1);
          this.attackCollider.damagedList.push(hit);
        }
      }
    }

    if (this.isDashing) {
      this.updateDash(deltaTime);
      return; // doesn't let the player move during dash
    }

    // movement
    const futureX = this.container.x + move.x * this.speed * deltaSec;
    const futureY = this.container.y + move.y * this.speed * deltaSec;

    // checking the axis isolated enable player do slide on walls
    if (CollisionManager.canMove(this.collider, futureX, this.container.y)) {
      this.container.x = futureX;
    }
    if (CollisionManager.canMove(this.collider, this.container.x, futureY)) {
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
      this.attackCollider?.updatePosition();
      this.attackCollider?.update(deltaTime);
      this.attackCollider?.drawDebug();
    }

    this.collider.drawDebug();
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  tryStartDash() {
    if (this.isDashing || this.dashCooldownTimer > 0) return;

    this.dashDirection = this.input.getMovementVector();

    // Dashing while idle
    if (this.dashDirection.x === 0 && this.dashDirection.y === 0) {
      switch (this.currentDir) {
        case "up":
          this.dashDirection = { x: 0, y: -1 };
          break;
        case "down":
          this.dashDirection = { x: 0, y: 1 };
          break;
        case "left":
          this.dashDirection = { x: -1, y: 0 };
          break;
        case "right":
          this.dashDirection = { x: 1, y: 0 };
          break;
      }
    }

    // Dash direction normalized
    const mag = Math.hypot(this.dashDirection.x, this.dashDirection.y);
    if (mag > 0) {
      this.dashDirection.x /= mag;
      this.dashDirection.y /= mag;
    }

    this.isDashing = true;
    this.dashTime = 0;

    this.anim.play(`dash_${this.currentDir}`);
  }

  updateDash(deltaTime: number) {
    const deltaSec = deltaTime / 1000;

    const futureX = this.container.x + this.dashDirection.x * this.dashSpeed * deltaSec;
    const futureY = this.container.y + this.dashDirection.y * this.dashSpeed * deltaSec;

    const hit = CollisionManager.canMove(this.collider, futureX, futureY);

    if (hit) {
      this.container.x = futureX;
      this.container.y = futureY;
    } else {
      this.endDash();
    }

    this.dashTime += deltaTime;

    if (this.dashTime >= this.dashDuration) {
      this.endDash();
    }
  }

  private endDash() {
    this.isDashing = false;
    this.dashCooldownTimer = this.dashCooldown;
  }

  private updateDirection(m: { x: number; y: number }) {
    if (Math.abs(m.x) > Math.abs(m.y)) {
      this.currentDir = m.x > 0 ? "right" : "left";
    } else if (m.y !== 0) {
      this.currentDir = m.y > 0 ? "down" : "up";
    }
  }

  private basicAttack() {
    if (this.attackCollider?.active) return;

    this.attackCollider?.activate(this.currentDir);

    console.log("basic attack!");
  }
}
