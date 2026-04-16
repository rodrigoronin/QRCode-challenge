import { Sprite, Texture, ColorMatrixFilter, Point } from "pixi.js";
import { Entity } from "@core/Entity";
import { InputManager } from "@input/InputManager";
import { AnimationController } from "@core/AnimationController";
import { Collider } from "@core/Collider";
import { AttackCollider } from "@core/AttackCollider";
import { CollisionManager } from "@core/systems/CollisionManager";
import { AttackComponent } from "@core/AttackComponent";
import { StatsComponent } from "@core/components/StatsComponent";
import type { DepthSortOptions } from "@core/systems/YSortSystem";

type Direction = "up" | "down" | "left" | "right";
type PlayerState = "idle" | "moving" | "attacking" | "dashing" | "conjuring" | "dead";

export class Player extends Entity {
  private sprite: Sprite;
  private state: PlayerState = "idle";
  public collider: Collider;
  private input = InputManager.get();
  public currentDir: Direction = "down";
  public moveVector: Point = new Point(0, 0);
  private frames: Record<string, Texture[]>;
  private VFXFrames: Record<string, Texture[]>;
  private anim: AnimationController;
  private speed = 120; // pixels/second
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();

  // Dash variables
  private dashDistance: number = 150;
  private dashTime: number = 0;
  // how many frames is the dash in millisecons (60 = 1 frame)
  private dashDuration: number = 180;
  private dashCooldown: number = 2000; // in milliseconds (1000 = 1 second)
  private dashCooldownTimer: number = 0;
  private dashSpeed: number;
  private dashDirection = { x: 0, y: 0 };
  // ATTACK DATA
  private attackCollider: AttackCollider;
  private attackTimer: number = 0;
  private ATTACK_LOCK_DURATION: number = 420;
  private attackComponent: AttackComponent;
  private isHitFlashing: boolean = false;
  private hitFlashingTimer: number = 0;
  private HIT_FLASH_DURATION: number = 150;
  // stats
  public stats = new StatsComponent({
    maxHP: 30,
    attack: 6,
    defense: 0,
    critChance: 0.5,
    critMultiplier: 1.5,
  });
  public isInvincible: boolean = false;
  private isImmortalObject: boolean = false;

  constructor(
    frames: Record<string, Texture[]>,
    VFXFrames: Record<string, Texture[]>,
    depthSortOptions: DepthSortOptions = {},
  ) {
    super(depthSortOptions);
    this.frames = frames;
    this.VFXFrames = VFXFrames;

    this.setTag("Player");
    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();
    if (depthSortOptions.depthSortOffsetY === undefined) {
      this.setDepthSortOffsetY(this.sprite.height / 2);
    }

    this.dashSpeed = this.dashDistance / (this.dashDuration / 1000);

    this.container.addChild(this.sprite);

    // Create the Colliders last so the debugDraw appears over the player
    this.attackCollider = new AttackCollider(
      51,
      51,
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

    this.collider = new Collider(20, 48, 0, 4, this.container, this);
    CollisionManager.registerEntityCollider(this.collider);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    // saves the current direction the player is looking
    this.moveVector.set(move.x, move.y);

    this.updateHitFlashFilter(deltaTime);

    // DASH
    if (this.state === "dashing") {
      this.updateDash(deltaTime);
      return; // doesn't let the player move during dash
    }

    if (this.attackCollider.active) {
      this.attackComponent.update();
    }

    if (this.state === "attacking") {
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
        this.applyFacingToSprite();
        this.anim.play(`walk_${this.currentDir}`);
      } else {
        this.applyFacingToSprite();
        this.anim.play(`idle_${this.currentDir}`);
      }

      this.anim.update(deltaTime);

      if (this.dashCooldownTimer > 0) {
        this.dashCooldownTimer -= deltaTime;
      }
    }

    // this.collider.drawDebug();
  }

  get currentHP() {
    return this.stats.currentHP;
  }
  get maxHP() {
    return this.stats.maxHP;
  }
  get isAttacking() {
    return this.state === "attacking";
  }
  get isDashing() {
    return this.state === "dashing";
  }

  setupAnimations() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  startDash() {
    if (this.isDashing || this.dashCooldownTimer > 0) return;

    if (this.isAttacking) {
      this.cancelAttack();
    }

    const move = this.input.getMovementVector();
    if (move.x !== 0 || move.y !== 0) {
      this.updateDirection(move);
    }

    this.state = "dashing";
    this.dashDirection = this.getActionDirectionVector();

    this.dashTime = 0;
    this.isInvincible = true;

    this.applyFacingToSprite();
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
    this.state = "idle";
    this.isInvincible = false;
    this.dashCooldownTimer = this.dashCooldown;
  }

  private updateDirection(m: { x: number; y: number }) {
    if (Math.abs(m.x) > Math.abs(m.y)) {
      this.currentDir = m.x > 0 ? "right" : "left";
    } else if (m.y !== 0) {
      this.currentDir = m.y > 0 ? "down" : "up";
    }
  }

  private getDirectionVector() {
    switch (this.currentDir) {
      case "up":
        return new Point(0, -1);
      case "down":
        return new Point(0, 1);
      case "left":
        return new Point(-1, 0);
      case "right":
        return new Point(1, 0);
    }
  }

  private getActionDirectionVector() {
    const move = this.input.getMovementVector();

    if (move.x !== 0 || move.y !== 0) {
      return new Point(move.x, move.y);
    }

    return this.getDirectionVector();
  }

  private applyFacingToSprite() {
    this.sprite.scale.x = this.currentDir === "left" ? -1 : 1;
  }

  startAttack() {
    if (this.isDashing) return;
    if (this.isAttacking) return;

    const move = this.input.getMovementVector();
    if (move.x !== 0 || move.y !== 0) {
      this.updateDirection(move);
    }

    this.state = "attacking";

    this.basicAttack();
  }

  private basicAttack() {
    if (this.attackCollider?.active) return;

    this.attackComponent.direction = this.currentDir;
    this.attackComponent.activate();

    this.applyFacingToSprite();
    this.attackCollider?.activate(this.getActionDirectionVector(), 40);
    this.attackTimer = this.ATTACK_LOCK_DURATION;
  }

  private updateAttackLock(deltaMS: number) {
    this.attackTimer -= deltaMS;

    if (this.attackTimer <= 0) {
      this.attackComponent.deactivate();

      this.state = "idle";
    }
  }

  private cancelAttack() {
    this.attackComponent.deactivate();
    this.attackCollider.deactivate();
  }

  takeDamage(_direction?: string | undefined): void {
    if (this.isInvincible) return;

    this.isHitFlashing = true;

    this.hitFlashFilter.greyscale(1, false);
    this.container.filters = [this.hitFlashFilter];

    if (this.stats.currentHP <= 0) {
      this.stats.currentHP = 0;
      this.death();
    }
  }

  private death() {
    if (this.isImmortalObject) return;

    if (this.stats.currentHP <= 0) {
      this.container.position.set(210, 380);
      this.stats.currentHP = this.stats.maxHP;
    }
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
      }
    }
  }
}
