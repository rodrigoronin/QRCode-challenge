import type { AttackCollider } from "./AttackCollider";
import { Collider } from "./Collider";
import { WorldCollider } from "./WorldCollider";

interface IEntityData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * CollisionManager - centralizes all collision logics and overlaps
 *
 * • WorldColliders -> static/non-living objects
 * • EntityColliders -> NPCs, player, enemies, projectiles, attacks...
 */
export class CollisionManager {
  private static worldColliders: Set<WorldCollider> = new Set();
  private static entityColliders: Set<Collider> = new Set();

  // -------------------
  // COLLIDERS REGISTERS
  // -------------------

  static registerWorldCollider(col: WorldCollider): void {
    this.worldColliders.add(col);
  }

  static removeWorldCollider(col: WorldCollider): void {
    if (this.worldColliders.has(col)) {
      this.worldColliders.delete(col);
    }
  }

  static registerEntityCollider(col: Collider): void {
    if (this.entityColliders.has(col)) return;

    this.entityColliders.add(col);
  }

  static removeEntityCollider(col: Collider): void {
    if (this.entityColliders.has(col)) {
      this.entityColliders.delete(col);
    }
  }

  // -------------------
  // SAFE MOVEMENT (Player, NPCs, Enemies...)
  // -------------------
  static canMove(collider: Collider, futureX: number, futureY: number): boolean {
    const futureBounds = collider.getBoundsAt(futureX, futureY);
    for (const wCollider of this.worldColliders) {
      if (wCollider.isTrigger) continue;
      if (this.rectIntersects(futureBounds, wCollider.getBounds())) return false;
    }

    return true;
  }

  // -------------------
  // COLLISION METHODS
  // -------------------
  static getOverlaps(collider: Collider | AttackCollider): Collider[] {
    const colliderBounds: IEntityData | null = collider.getBounds();
    const hits: Collider[] = [];

    for (const entity of this.entityColliders) {
      if (entity.owner?.tag === collider.owner?.tag) continue;

      if (this.rectIntersects(colliderBounds, entity.getBounds())) hits.push(entity);
    }

    return hits;
  }

  static rectIntersects(a: IEntityData | null, b: IEntityData | null): boolean {
    if (!a || !b) return false;

    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
}
