import { ColorMatrixFilter, type Sprite } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import * as Constants from "../utils/Constants";
import { Player } from "./Player";
import { AttackComponent } from "../core/AttackComponent";
import { AttackCollider } from "../core/AttackCollider";

export class Enemy extends Entity {
  private sprite: Sprite;
  private collider: Collider;
  public tag: string = "enemy";

  private maxHealthPoints: number = 3;
  private healthPoints: number = this.maxHealthPoints;
  private isDead: boolean = false;
  private isHitFlashing: boolean = false;
  private hitFlashTimer: number = 0;
  private HIT_FLASH_DURATION: number = 80;

  private playerRef: Player;
  private speed: number = 100; // pixels/second
  private perceptionRange: number = 150; // pixels
  public target: Player | null = null;
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();
  // Attack
  private isAttacking: boolean = false;
  private attackManager: AttackComponent;
  private attackCollider: AttackCollider;
  private attackCooldown: number = 2000;
  private attackTimer: number = 0;

  constructor(texture: Sprite, playerRef: Player) {
    super();

    this.sprite = texture;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.container.addChild(this.sprite);

    this.collider = new Collider(14, 16, this.container, this);
    CollisionManager.addEntityCollider(this.collider);

    this.attackCollider = new AttackCollider(
      12 * Constants.SCALE_FACTOR,
      12 * Constants.SCALE_FACTOR,
      250,
      this.container,
      this
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
      this.perceptionRadar();
      this.followTarget(_deltaTime);

      if (this.isAttacking) {
        this.updateAttackLock(_deltaTime);

        if (this.attackCollider.active) {
          this.attackCollider.drawDebug();
          this.attackManager.update();
          this.attackCollider.update(_deltaTime);
          this.attackCollider.updatePosition();
        }
      }
    }
  }

  takeDamage(damage: number) {
    this.healthPoints -= damage;
    this.isHitFlashing = true;

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

  public getHitbox() {
    return this.collider;
  }

  private updateHitFlashFilter(deltaTime: number) {
    if (this.isHitFlashing) {
      this.hitFlashTimer += deltaTime;

      if (this.hitFlashTimer >= this.HIT_FLASH_DURATION) {
        console.log(this.isHitFlashing);
        this.isHitFlashing = false;
        this.container.filters = this.container.filters.filter(
          (filter) => filter !== this.hitFlashFilter
        );
        this.hitFlashTimer = 0;
      }
    }
  }

  private perceptionRadar() {
    if (!this.playerRef) return;
    if (this.playerRef.tag !== "player") return;

    const dx = this.playerRef.container.x - this.container.x;
    const dy = this.playerRef.container.y - this.container.y;
    this.target = this.playerRef;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.perceptionRange) {
      this.target = this.playerRef;
    } else {
      this.target = null;
    }
  }

  private followTarget(deltaMS: number) {
    if (!this.target) return;
    const deltaSec = deltaMS / 1000;

    const dx: number = this.target.container.x - this.container.x;
    const dy: number = this.target.container.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    if (distance <= this.container.width) {
      this.basicAttack();
      return;
    }

    const dirX = dx / distance;
    const dirY = dy / distance;

    const moveX = dirX * this.speed * deltaSec;
    const moveY = dirY * this.speed * deltaSec;

    if (CollisionManager.canMove(this.collider, this.container.x + moveX, this.container.y))
      this.container.x += moveX;
    if (CollisionManager.canMove(this.collider, this.container.x, this.container.y + moveY))
      this.container.y += moveY;
  }

  private basicAttack() {
    if (!this.target && !this.attackCollider.active) return;
    if (this.attackTimer > 0) return;

    this.attackTimer = this.attackCooldown;
    this.attackCollider.activate("left");
    this.isAttacking = true;
    this.attackManager.activate();
  }

  private updateAttackLock(deltaMS: number) {
    this.attackTimer -= deltaMS;

    if (this.attackTimer <= 0) {
      this.isAttacking = false;
      this.attackManager.deactivate();
    }
  }
}
