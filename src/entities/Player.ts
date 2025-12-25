import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";
import { AttackCollider } from "../core/AttackCollider";
import * as Constants from "../utils/Constants";
import { CollisionManager } from "../core/CollisionManager";
import { AttackComponent } from "../core/AttackComponent";

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
  private dashDistance: number = 100;
  private dashTime: number = 0;
  // how many frames is the dash in millisecons (60 = 1 frame)
  private dashDuration: number = 180;
  private dashCooldown: number = 500; // in milliseconds (1000 = 1 second)
  private dashCooldownTimer: number = 0;
  private dashSpeed: number;
  private dashDirection = { x: 0, y: 0 };
  // attack
  private isAttacking: boolean = false;
  private attackCollider: AttackCollider;
  private attackTimer: number = 0;
  private ATTACK_LOCK_DURATION: number = 250;
  private attackManager: AttackComponent;
  // stats
  private maxHealthPoints: number = 10;
  private healthPoints: number = 10;

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
      this.ATTACK_LOCK_DURATION,
      this.container,
      this
    );

    this.attackManager = new AttackComponent(this, {
      attackCollider: this.attackCollider,
      maxTargets: 1,
      target: "enemy",
    });

    this.dashSpeed = this.dashDistance / (this.dashDuration / 1000);

    this.container.addChild(this.sprite);

    // Create the Collider last so the debugDraw appears over the player
    this.collider = new Collider(15, 32, 0, 8, this.container, this);
    CollisionManager.addEntityCollider(this.collider);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    // DASH
    if (!this.isAttacking && this.input.wasJustPressed("Space")) {
      this.tryStartDash();
    }
    if (this.isDashing) {
      this.updateDash(deltaTime);
      return; // doesn't let the player move during dash
    }

    // BASIC ATTACK
    // TODO: in the future the enemies hit will be handled by the weapon script like:
    // CombatManager.basicAttack(weapon, attacker, enemyList);

    if (this.attackCollider.active) {
      this.attackManager.update();
    }

    if (this.isAttacking) {
      this.updateAttackLock(deltaTime);

      if (this.attackCollider?.active) {
        this.attackCollider.drawDebug();
        this.attackCollider.updatePosition();
        this.attackCollider.update(deltaTime);
      }
    }

    // movement
    if (!this.isAttacking) {
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

  tryAttack() {
    if (this.isAttacking || this.isDashing) return;
    this.basicAttack();
  }

  private basicAttack() {
    if (this.attackCollider?.active) return;

    this.attackCollider?.activate(this.currentDir);
    this.isAttacking = true;
    this.attackManager.activate();
    this.attackTimer = this.ATTACK_LOCK_DURATION;

    console.log("basic attack!");
  }

  private updateAttackLock(deltaMS: number) {
    this.attackTimer -= deltaMS;

    if (this.attackTimer <= 0) {
      this.isAttacking = false;
      this.attackManager.deactivate();
    }
  }

  takeDamage(damage: number): void {
    this.healthPoints -= damage;

    console.log(`Player Health: ${this.healthPoints} / ${this.maxHealthPoints}`);

    if (this.healthPoints <= 0) console.log("Player is incapacitated!");
  }
}
