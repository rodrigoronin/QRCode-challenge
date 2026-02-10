import { ColorMatrixFilter, Sprite, Texture, Point } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import { Player } from "./Player";
import { AttackComponent } from "../core/AttackComponent";
import { AttackCollider } from "../core/AttackCollider";
import { AnimationController } from "../core/AnimationController";
import { DamageNumberManager } from "../VFX/DamageNumberManager";

type AttackState = "none" | "windup" | "active" | "recovery";
type Direction = "up" | "down" | "left" | "right";

export class Enemy extends Entity {
  // RENDER
  private sprite: Sprite;
  private collider: Collider;
  public tag: string = "enemy";
  private currentDir: string = "down";
  private facingDir: Direction = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();
  private windupFilter: ColorMatrixFilter = new ColorMatrixFilter();
  // DATA
  private maxHealthPoints: number = 20;
  private healthPoints: number = this.maxHealthPoints;
  private speed: number = 140; // pixels/second
  private isDead: boolean = false;
  private perceptionRange: number = 250; // pixels
  private playerRef: Player;
  public target: Player | null = null;
  // COMBAT
  private attackState: AttackState = "none";
  private attackManager: AttackComponent;
  private attackCollider: AttackCollider;
  private WINDUP_TIME: number = 450;
  private ACTIVE_TIME: number = 420;
  private RECOVERY_TIME: number = 2000;
  private attackTimer: number = 0;
  private isHitFlashing: boolean = false;
  private hitFlashingTimer: number = 0;
  private HIT_FLASH_DURATION: number = 150;
  private VFXFrames: Record<string, Texture[]>;
  // BEHAVIOUR
  private roamTarget: Point | null = null;
  private roamWaitTimer: number = 0;
  private isInCombat: boolean = false;
  private isPassive: boolean = true;
  private isInvincible: boolean = false;
  private allowFlanking: boolean = true;
  private flankSide: number = Math.random() < 0.5 ? -1 : 1;
  private moveDir: Point = new Point(0, 0);

  constructor(
    frames: Record<string, Texture[]>,
    playerRef: Player,
    VFXFrames: Record<string, Texture[]>,
  ) {
    super();

    this.VFXFrames = VFXFrames;
    this.frames = frames;
    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.anim = new AnimationController(this.sprite);
    this.setupAnimation();

    this.anim.play("idle_down");

    this.container.addChild(this.sprite);

    this.collider = new Collider(22, 48, 3, 5, this.container, this);
    CollisionManager.registerEntityCollider(this.collider);

    this.attackCollider = new AttackCollider(
      40,
      40,
      this.ACTIVE_TIME,
      this.container,
      this,
      this.VFXFrames,
    );

    this.attackManager = new AttackComponent(this, {
      attackCollider: this.attackCollider,
      maxTargets: 1,
      target: "player",
    });

    this.playerRef = playerRef;

    // this.collider.drawDebug();
  }

  update(_deltaTime: number): void {
    if (!this.isDead) {
      this.updateHitFlashFilter(_deltaTime);

      if (!this.isPassive) {
        this.perceptionRadar();
        this.followTarget(_deltaTime);
      }

      this.roaming({ x: 400, y: 400, width: 300, height: 300 }, _deltaTime);

      if (this.attackState !== "none") {
        this.updateAttackPhases(_deltaTime);

        if (this.attackCollider.active) {
          this.attackManager.update();
          this.attackCollider.update(_deltaTime);
          this.attackCollider.updatePosition();
          // this.attackCollider.drawDebug();
        }
      }
    }

    this.anim.update(_deltaTime);
  }

  setupAnimation() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  public takeDamage(damage: number, direction: string | undefined) {
    this.isPassive = false;

    // TODO: create a system to handle directional knockback
    // and other effects later
    const knockbackStrength = 20;

    switch (direction) {
      case "up":
        this.container.position.y = this.container.position.y - knockbackStrength;
        break;
      case "down":
        this.container.position.y = this.container.position.y + knockbackStrength;
        break;
      case "left":
        this.container.position.x -= knockbackStrength;
        break;
      case "right":
        this.container.position.x = this.container.position.x + knockbackStrength;
        break;
      default:
        break;
    }

    if (!this.isInvincible) {
      this.healthPoints -= damage;
      this.isHitFlashing = true;
    }

    DamageNumberManager.spawn(this.container.parent!, damage, this.container.x, this.container.y);

    this.hitFlashFilter.greyscale(1, false);
    this.addFilter(this.hitFlashFilter);

    console.log(`Enemy HP: ${this.healthPoints} / ${this.maxHealthPoints}`);

    if (this.healthPoints <= 0) this.die();
  }

  private die() {
    this.isDead = true;
    CollisionManager.removeEntityCollider(this.collider);
    this.remove();
  }

  private updateHitFlashFilter(deltaTime: number) {
    if (this.isHitFlashing) {
      this.hitFlashingTimer += deltaTime;

      if (this.hitFlashingTimer >= this.HIT_FLASH_DURATION) {
        this.isHitFlashing = false;
        this.removeFilter(this.hitFlashFilter);
        this.hitFlashingTimer = 0;
      }
    }
  }

  protected perceptionRadar() {
    if (!this.playerRef) return;
    if (this.playerRef.tag !== "player") return;

    const dx = this.playerRef.container.x - this.container.x;
    const dy = this.playerRef.container.y - this.container.y;
    this.target = this.playerRef;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.perceptionRange) {
      this.target = this.playerRef;
      this.isInCombat = true;
    } else {
      this.target = null;
      this.isInCombat = false;
    }
  }

  protected followTarget(deltaMS: number) {
    if (!this.target) return;
    if (this.attackState === "active") return;

    const dx: number = this.target.container.x - this.container.x;
    const dy: number = this.target.container.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    if (distance <= this.container.width) {
      this.windupAttack();
      return;
    }

    if (distance <= 0.001) return;

    const attackRange = this.container.width;
    const slowRadius = attackRange * 2.5;
    const speedScale = distance < slowRadius ? Math.max(0.35, distance / slowRadius) : 1;

    let dirX = dx / distance;
    let dirY = dy / distance;

    if (this.allowFlanking) {
      const flankRange = Math.max(slowRadius, attackRange * 4);
      const flankT = Math.max(0, Math.min(1, (flankRange - distance) / flankRange));

      if (flankT > 0) {
        const perpX = -dirY;
        const perpY = dirX;
        const flankStrength = 0.9;
        let steerX = dirX + perpX * this.flankSide * flankStrength * flankT;
        let steerY = dirY + perpY * this.flankSide * flankStrength * flankT;
        const steerDist = Math.hypot(steerX, steerY);

        if (steerDist > 0.001) {
          steerX /= steerDist;
          steerY /= steerDist;
          dirX = steerX;
          dirY = steerY;
        }
      }
    }

    const blend = 0.18;
    this.moveDir.x += (dirX - this.moveDir.x) * blend;
    this.moveDir.y += (dirY - this.moveDir.y) * blend;
    const blendedDist = Math.hypot(this.moveDir.x, this.moveDir.y);

    if (blendedDist > 0.001) {
      this.moveDir.x /= blendedDist;
      this.moveDir.y /= blendedDist;
    }

    this.move(this.moveDir.x, this.moveDir.y, 1, deltaMS, speedScale);
  }

  protected move(dx: number, dy: number, distance: number, delta: number, speedScale: number = 1) {
    const dirX = dx / distance;
    const dirY = dy / distance;

    const deltaSec = delta / 1000;

    const moveX = dirX * this.speed * speedScale * deltaSec;
    const moveY = dirY * this.speed * speedScale * deltaSec;

    if (CollisionManager.canMove(this.collider, this.container.x + moveX, this.container.y))
      this.container.x += moveX;
    if (CollisionManager.canMove(this.collider, this.container.x, this.container.y + moveY))
      this.container.y += moveY;

    this.updateFacingDirection({ x: moveX, y: moveY });
    this.applyFacingToSprite();

    if (this.container.x !== 0 || this.container.y !== 0) {
      this.anim.play(`walk_${this.currentDir}`);
    } else {
      this.anim.play(`idle_${this.currentDir}`);
    }

    this.anim.update(delta);
  }

  protected roaming(
    zone: { x: number; y: number; width: number; height: number },
    delta: number,
  ): void {
    if (this.isInCombat) return;

    if (this.roamWaitTimer > 0) {
      this.roamWaitTimer -= delta;

      if (this.roamWaitTimer <= 0) this.roamTarget = null;

      return;
    }

    // chance to roam or stay still
    if (!this.roamTarget) {
      if (Math.random() < 0.5) {
        this.roamWaitTimer = 800;
        return;
      }

      const x = zone.x + Math.random() * zone.width;
      const y = zone.y + Math.random() * zone.height;

      this.roamTarget = new Point(x, y);

      return;
    }

    const dx: number = this.roamTarget.x - this.container.x;
    const dy: number = this.roamTarget.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    if (distance < 2) {
      this.roamTarget = null;
      this.roamWaitTimer = 4000;
      return;
    }

    this.move(dx, dy, distance, delta);
  }

  protected windupAttack() {
    if (!this.target) return;
    if (this.attackState !== "none") return;

    this.attackState = "windup";
    this.attackTimer = this.WINDUP_TIME;

    // TELEGRAPH
    this.windupFilter.brightness(1.5, false);
    this.sprite.tint = 0xff5555;

    this.addFilter(this.windupFilter);
  }

  protected basicAttack() {
    if (!this.target && !this.attackCollider.active) return;

    this.attackState = "active";
    this.attackTimer = this.ACTIVE_TIME;

    // CLEARS TELEGRAPH
    this.removeFilter(this.windupFilter);
    this.sprite.tint = 0xffffff;

    this.attackCollider.activate(this.getAttackDirection(), 45);
    this.attackManager.activate();
  }

  protected updateAttackPhases(deltaMS: number) {
    if (this.attackState === "none") return;

    this.attackTimer -= deltaMS;

    switch (this.attackState) {
      case "windup":
        if (this.attackTimer <= 0) this.basicAttack();
        break;

      case "active":
        this.attackManager.update();
        this.attackCollider.update(deltaMS);
        this.attackCollider.updatePosition();

        if (this.attackTimer <= 0) this.enterRecovery();
        break;

      case "recovery":
        if (this.attackTimer <= 0) this.attackState = "none";
        break;
    }
  }

  private enterRecovery() {
    this.attackState = "recovery";
    this.attackTimer = this.RECOVERY_TIME;

    this.attackManager.deactivate();
    this.attackCollider.deactivate();
  }

  protected updateFacingDirection(m: { x: number; y: number }) {
    // if (Math.abs(m.x) > Math.abs(m.y)) {
    this.facingDir = m.x > 0 ? "right" : "left";
    // } else if (m.y !== 0) {
    //   this.facingDir = m.y > 0 ? "down" : "up";
    // }
  }

  protected applyFacingToSprite() {
    switch (this.facingDir) {
      case "left":
        this.sprite.scale.x = 1;
        break;

      case "right":
        this.sprite.scale.x = -1;
        break;

      case "up":
      case "down":
        // TEMPORÁRIO:
        // mantém a orientação anterior
        break;
    }
  }

  private addFilter(filter: ColorMatrixFilter) {
    const filters = this.container.filters ?? [];
    if (!filters.includes(filter)) {
      this.container.filters = [...filters, filter];
    }
  }

  private removeFilter(filter: ColorMatrixFilter) {
    if (!this.container.filters) return;
    this.container.filters = this.container.filters.filter((f) => f !== filter);
  }

  protected getAttackDirection(): Direction {
    if (!this.target) return this.facingDir;

    const dx = this.target.container.x - this.container.x;
    const dy = this.target.container.y - this.container.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    } else {
      return dy > 0 ? "down" : "up";
    }
  }
}
