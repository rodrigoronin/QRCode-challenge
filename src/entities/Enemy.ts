import { ColorMatrixFilter, Sprite, Texture, Point } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import { Player } from "./Player";
import { AttackComponent } from "../core/AttackComponent";
import { AttackCollider } from "../core/AttackCollider";
import * as Constants from "../utils/Constants";
import { AnimationController } from "../core/AnimationController";
import { DamageNumberManager } from "../VFX/DamageNumberManager";

export class Enemy extends Entity {
  // RENDER
  private sprite: Sprite;
  private collider: Collider;
  public tag: string = "enemy";
  private currentDir: string = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();
  // DATA
  private maxHealthPoints: number = 3;
  private healthPoints: number = this.maxHealthPoints;
  private speed: number = 160; // pixels/second
  private isDead: boolean = false;
  private perceptionRange: number = 250; // pixels
  private playerRef: Player;
  public target: Player | null = null;
  // COMBAT
  private isAttacking: boolean = false;
  private attackManager: AttackComponent;
  private attackCollider: AttackCollider;
  private attackCooldown: number = 2000;
  private attackTimer: number = 0;
  private isHitFlashing: boolean = false;
  private hitFlashingTimer: number = 0;
  private HIT_FLASH_DURATION: number = 150;
  // BEHAVIOUR
  private roamTarget: Point | null = null;
  private roamWaitTimer: number = 0;
  private isInCombat: boolean = false;
  private isPassive: boolean = true;

  constructor(frames: Record<string, Texture[]>, playerRef: Player) {
    super();

    this.frames = frames;
    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.anim = new AnimationController(this.sprite);
    this.setupAnimation();

    this.anim.play("idle_down");

    this.container.addChild(this.sprite);

    this.collider = new Collider(
      14 * Constants.SCALE_FACTOR,
      12 * Constants.SCALE_FACTOR,
      2,
      0,
      this.container,
      this,
    );
    CollisionManager.registerEntityCollider(this.collider);

    this.attackCollider = new AttackCollider(
      20 * Constants.SCALE_FACTOR,
      20 * Constants.SCALE_FACTOR,
      250,
      this.container,
      this,
    );

    this.attackManager = new AttackComponent(this, {
      attackCollider: this.attackCollider,
      maxTargets: 1,
      target: "player",
    });

    this.playerRef = playerRef;

    this.collider.drawDebug();
  }

  update(_deltaTime: number): void {
    if (!this.isDead) {
      this.updateHitFlashFilter(_deltaTime);

      if (!this.isPassive) {
        this.perceptionRadar();
        this.followTarget(_deltaTime);
      }

      this.roaming({ x: 400, y: 400, width: 300, height: 300 }, _deltaTime);

      if (this.isAttacking) {
        this.updateAttackLock(_deltaTime);

        if (this.attackCollider.active) {
          this.attackManager.update();
          this.attackCollider.update(_deltaTime);
          this.attackCollider.updatePosition();
          this.attackCollider.drawDebug();
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
    switch (direction) {
      case "up":
        this.container.position.y = this.container.position.y - 50;
        break;
      case "down":
        this.container.position.y = this.container.position.y + 50;
        break;
      case "left":
        this.container.position.x -= 50;
        break;
      case "right":
        this.container.position.x = this.container.position.x + 50;
        break;
      default:
        break;
    }

    this.healthPoints -= damage;
    this.isHitFlashing = true;

    DamageNumberManager.spawn(this.container.parent!, damage, this.container.x, this.container.y);

    this.hitFlashFilter.greyscale(1, false);
    this.container.filters = [this.hitFlashFilter];

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
        this.container.filters = this.container.filters.filter(
          (filter) => filter !== this.hitFlashFilter,
        );
        this.hitFlashingTimer = 0;
        // this.sprite.x = prevX;
        // this.sprite.y = prevY;
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

    const dx: number = this.target.container.x - this.container.x;
    const dy: number = this.target.container.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    if (distance <= this.container.width) {
      this.basicAttack();
      return;
    }

    this.move(dx, dy, distance, deltaMS);
  }

  protected move(dx: number, dy: number, distance: number, delta: number) {
    const dirX = dx / distance;
    const dirY = dy / distance;

    const deltaSec = delta / 1000;

    const moveX = dirX * this.speed * deltaSec;
    const moveY = dirY * this.speed * deltaSec;

    if (CollisionManager.canMove(this.collider, this.container.x + moveX, this.container.y))
      this.container.x += moveX;
    if (CollisionManager.canMove(this.collider, this.container.x, this.container.y + moveY))
      this.container.y += moveY;

    this.updateDirection({ x: moveX, y: moveY });

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

    // 50/50 to roam or stay still
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
      this.roamWaitTimer = 500 + Math.random() * 1000; // ms
      return;
    }

    this.move(dx, dy, distance, delta);
  }

  protected basicAttack() {
    if (!this.target && !this.attackCollider.active) return;
    if (this.attackTimer > 0) return;

    this.attackTimer = this.attackCooldown;
    this.attackCollider.activate(this.currentDir, 90);
    this.isAttacking = true;
    this.attackManager.activate();
  }

  protected updateAttackLock(deltaMS: number) {
    this.attackTimer -= deltaMS;

    if (this.attackTimer <= 0) {
      this.isAttacking = false;
      this.attackManager.deactivate();
    }
  }

  protected updateDirection(m: { x: number; y: number }) {
    if (Math.abs(m.x) > Math.abs(m.y)) {
      this.currentDir = m.x > 0 ? "right" : "left";
    } else if (m.y !== 0) {
      this.currentDir = m.y > 0 ? "down" : "up";
    }
  }
}
