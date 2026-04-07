import { Sprite, Texture, ColorMatrixFilter, Point } from "pixi.js";
import { Entity } from "@core/Entity";
import { InputManager } from "@input/InputManager";
import { AnimationController } from "@core/AnimationController";
import { Collider } from "@core/Collider";
import { AttackCollider } from "@core/AttackCollider";
import { CollisionManager } from "@core/CollisionManager";
import { AttackComponent } from "@core/AttackComponent";
import { DamageNumberManager } from "../VFX/DamageNumberManager";
import { StatsComponent } from "@core/components/StatsComponent";

type Direction = "up" | "down" | "left" | "right";
type PlayerState = "idle" | "moving" | "attacking" | "dashing" | "conjuring" | "dead";

export class Player extends Entity {
  private sprite: Sprite;
  private state: PlayerState = "idle";
  public collider: Collider;
  private input = InputManager.get();
  public currentDir: Direction = "down";
  public moveVector: Point = new Point(0, 0);
  public lastMovedVector: Point = new Point(0, 0);
  private frames: Record<string, Texture[]>;
  private VFXFrames: Record<string, Texture[]>;
  private anim: AnimationController;
  private speed = 150; // pixels/second
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
    attack: 10,
    defense: 0,
    critChance: 0.1,
  });
  private isInvincible: boolean = false;
  private isImmortalObject: boolean = false;

  constructor(frames: Record<string, Texture[]>, VFXFrames: Record<string, Texture[]>) {
    super();
    this.frames = frames;
    this.VFXFrames = VFXFrames;

    this.setTag("Player");
    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.anim = new AnimationController(this.sprite, true);
    this.setupAnimations();

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

    // saves the last direction the player was looking
    if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
      this.lastMovedVector.x = this.moveVector.x;
      this.lastMovedVector.y = this.moveVector.y;
    }

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
        if (this.currentDir === "left") this.sprite.scale.x = -1;
        else if (this.currentDir === "right") this.sprite.scale.x = 1;
        // TODO: replace with real up/down sprites
        if (this.currentDir === "up") this.sprite.scale.x = -1;
        else if (this.currentDir === "down") this.sprite.scale.x = 1;
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

    this.state = "dashing";

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

    this.dashTime = 0;
    this.isInvincible = true;

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

  startAttack() {
    if (this.isDashing) return;
    if (this.isAttacking) return;

    this.state = "attacking";

    this.basicAttack();
  }

  private basicAttack() {
    if (this.attackCollider?.active) return;

    this.attackComponent.direction = this.currentDir;

    this.attackCollider?.activate(this.lastMovedVector, 40);
    this.attackComponent.activate();
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

  takeDamage(damage: number): void {
    if (this.isInvincible) return;

    this.stats.currentHP -= damage;
    DamageNumberManager.spawn(this.container.parent!, damage, this.container.x, this.container.y);

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
      this.container.position.set(200);
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
