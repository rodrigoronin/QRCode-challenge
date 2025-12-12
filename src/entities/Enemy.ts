import type { Sprite } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import * as Constants from "../utils/Constants";

export class Enemy extends Entity {
  private sprite: Sprite;
  private hitbox: Collider;

  constructor(texture: Sprite) {
    super();

    this.sprite = texture;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(Constants.SCALE_FACTOR);
    this.container.addChild(this.sprite);

    this.hitbox = new Collider(14, 16, this.container);
    CollisionManager.addEntityCollider(this.hitbox);
  }

  public getHitbox() {
    return this.hitbox;
  }
}
