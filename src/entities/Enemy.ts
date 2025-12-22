import { ColorMatrixFilter, type Sprite } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import * as Constants from "../utils/Constants";
import { Player } from "./Player";

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
  private speed: number = 120; // pixels/second
  private perceptionRange: number = 150; // pixels
  public target: Player | null = null;

  constructor(texture: Sprite, playerRef: Player) {
    super();

    this.sprite = texture;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.container.addChild(this.sprite);

    this.collider = new Collider(14, 16, this.container, this);
    CollisionManager.addEntityCollider(this.collider);

    this.playerRef = playerRef;

    // this.collider.drawDebug();
  }

  update(_deltaTime: number): void {
    if (this.isHitFlashing) {
      this.hitFlashTimer += _deltaTime;

      if (this.hitFlashTimer >= this.HIT_FLASH_DURATION) {
        console.log(this.isHitFlashing);
        this.isHitFlashing = false;
        this.container.filters = [];
        this.hitFlashTimer = 0;
      }
    }

    if (!this.isDead) {
      this.getDistanceFromPlayer();
      this.followTarget(_deltaTime);
    }
  }

  takeDamage(damage: number) {
    if (this.isDead) return;

    this.healthPoints -= damage;
    this.isHitFlashing = true;
    const colorMatrixFilter = new ColorMatrixFilter();
    colorMatrixFilter.greyscale(1, false);
    this.container.filters = [colorMatrixFilter];
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

  private getDistanceFromPlayer() {
    if (!this.playerRef) return;

    const dx = this.playerRef.container.x - this.container.x;
    const dy = this.playerRef.container.y - this.container.y;
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

    if (distance <= this.container.width) return;

    const dirX = dx / distance;
    const dirY = dy / distance;

    const moveX = dirX * this.speed * deltaSec;
    const moveY = dirY * this.speed * deltaSec;

    if (CollisionManager.canMove(this.collider, this.container.x + moveX, dirY))
      this.container.x += moveX;
    if (CollisionManager.canMove(this.collider, dirX, this.container.y + moveY))
      this.container.y += moveY;
  }
}
