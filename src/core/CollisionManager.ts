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
 * • WorldColliders -> objetos estáticos do cenário
 * • EntityColliders -> NPCs, player, enemies, projectiles, attacks...
 */
export class CollisionManager {
  private static worldColliders: WorldCollider[] = [];
  private static entityColliders: Collider[] = [];

  // -------------------
  // COLLIDERS REGISTERS
  // -------------------

  static addWorldCollider(col: WorldCollider): void {
    this.worldColliders.push(col);
  }

  static addEntityCollider(col: Collider): void {
    if (this.entityColliders.includes(col)) return;
    this.entityColliders.push(col);
  }

  static removeEntityCollider(col: Collider): void {
    const i = this.entityColliders.indexOf(col);
    if (i !== -1) this.entityColliders.splice(i, 1);
  }

  // -------------------
  // SAFE MOVEMENT (Player, NPCs, Enemies...)
  // -------------------
  static canMove(collider: Collider, futureX: number, futureY: number): boolean {
    const futureBounds = collider.getBoundsAt(futureX, futureY);
    for (const wall of this.worldColliders) {
      if (this.rectIntersects(futureBounds, wall.getBounds())) return false;
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
