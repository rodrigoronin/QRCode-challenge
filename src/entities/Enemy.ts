import type { Sprite } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import * as Constants from "../utils/Constants";

export class Enemy extends Entity {
  private sprite: Sprite;
  private collider: Collider;
  public tag: string = "enemy";

  private maxHealthPoints: number = 3;
  private healthPoints: number = this.maxHealthPoints;
  private isDead: boolean = false;

  constructor(texture: Sprite) {
    super();

    this.sprite = texture;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.container.addChild(this.sprite);

    this.collider = new Collider(14, 16, this.container, this);
    CollisionManager.addEntityCollider(this.collider);

    // this.collider.drawDebug();
  }

  takeDamage(damage: number) {
    if (this.isDead) return;

    this.healthPoints -= damage;
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
}
