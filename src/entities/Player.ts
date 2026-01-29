import { Sprite, Texture, ColorMatrixFilter } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager } from "../input/InputManager";
import { AnimationController } from "../core/AnimationController";
import { Collider } from "../core/Collider";
import { AttackCollider } from "../core/AttackCollider";
import * as Constants from "../utils/Constants";
import { CollisionManager } from "../core/CollisionManager";
import { AttackComponent } from "../core/AttackComponent";
import { DamageNumberManager } from "../VFX/DamageNumberManager";

type Direction = "up" | "down" | "left" | "right";

export class Player extends Entity {
  private sprite: Sprite;
  private collider: Collider;
  private input = InputManager.get();
  private currentDir: Direction = "down";
  private frames: Record<string, Texture[]>;
  private VFXFrames: Record<string, Texture[]>;
  private anim: AnimationController;
  private speed = 200; // pixels/second
  public tag: string = "player";
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();

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
  // ATTACK DATA
  private isAttacking: boolean = false;
  private attackCollider: AttackCollider;
  private attackTimer: number = 0;
  private ATTACK_LOCK_DURATION: number = 420;
  private attackComponent: AttackComponent;
  private isHitFlashing: boolean = false;
  private hitFlashingTimer: number = 0;
  private HIT_FLASH_DURATION: number = 150;
  // stats
  private maxHealthPoints: number = 10;
  private healthPoints: number = 10;

  constructor(frames: Record<string, Texture[]>, VFXFrames: Record<string, Texture[]>) {
    super();
    this.frames = frames;
    this.VFXFrames = VFXFrames;

    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();

    this.dashSpeed = this.dashDistance / (this.dashDuration / 1000);

    this.container.addChild(this.sprite);

    // Create the Colliders last so the debugDraw appears over the player
    this.attackCollider = new AttackCollider(
      61 * Constants.SCALE_FACTOR,
      61 * Constants.SCALE_FACTOR,
      this.ATTACK_LOCK_DURATION,
      this.container,
      this,
      this.VFXFrames,
    );

    this.attackComponent = new AttackComponent(this, {
      attackCollider: this.attackCollider,
      maxTargets: 2,
      target: "enemy",
    });

    this.collider = new Collider(
      12 * Constants.SCALE_FACTOR,
      26 * Constants.SCALE_FACTOR,
      0,
      4,
      this.container,
      this,
    );
    CollisionManager.registerEntityCollider(this.collider);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    this.updateHitFlashFilter(deltaTime);

    // DASH
    if (this.isDashing) {
      this.updateDash(deltaTime);
      return; // doesn't let the player move during dash
    }

    if (this.attackCollider.active) {
      this.attackComponent.update();
    }

    if (this.isAttacking) {
      this.updateAttackLock(deltaTime);

      if (this.attackCollider?.active) {
        // this.attackCollider.drawDebug();
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
        if (this.currentDir === "left") this.sprite.scale.x = -Constants.SCALE_FACTOR;
        else if (this.currentDir === "right") this.sprite.scale.x = Constants.SCALE_FACTOR;
        if (this.currentDir === "up") this.sprite.scale.x = -Constants.SCALE_FACTOR;
        else if (this.currentDir === "down") this.sprite.scale.x = Constants.SCALE_FACTOR;
        this.anim.play(`walk_${this.currentDir}`);
      } else {
        this.anim.play(`idle_${this.currentDir}`);
      }

      this.anim.update(deltaTime);

      if (this.dashCooldownTimer > 0) {
        this.dashCooldownTimer -= deltaTime;
      }
    }

    // this.collider.drawDebug();
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  startDash() {
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

  startAttack() {
    if (this.isAttacking || this.isDashing) return;
    this.basicAttack();
  }

  private basicAttack() {
    if (this.attackCollider?.active) return;

    this.attackComponent.direction = this.currentDir;

    this.attackCollider?.activate(this.currentDir, 60);
    this.isAttacking = true;
    this.attackComponent.activate();
    this.attackTimer = this.ATTACK_LOCK_DURATION;
  }

  private updateAttackLock(deltaMS: number) {
    this.attackTimer -= deltaMS;

    if (this.attackTimer <= 0) {
      this.isAttacking = false;
      this.attackComponent.deactivate();
    }
  }

  takeDamage(damage: number): void {
    this.healthPoints -= damage;
    DamageNumberManager.spawn(this.container.parent!, damage, this.container.x, this.container.y);

    this.isHitFlashing = true;

    this.hitFlashFilter.greyscale(1, false);
    this.container.filters = [this.hitFlashFilter];

    console.log(`Player Health: ${this.healthPoints} / ${this.maxHealthPoints}`);

    if (this.healthPoints <= 0) console.log("Player is incapacitated!");
  }

  private updateHitFlashFilter(deltaTime: number) {
    if (this.isHitFlashing) {
      this.hitFlashingTimer += deltaTime;

      if (this.hitFlashingTimer >= this.HIT_FLASH_DURATION) {
        this.isHitFlashing = false;
        this.container.filters = this.container.filters.filter(
          (filter) => filter !== this.hitFlashFilter,
        );
        this.hitFlashingTimer = 0;
        // this.sprite.x = prevX;
        // this.sprite.y = prevY;
      }
    }
  }
}
