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

  static addWorldCollider(col: WorldCollider) {
    this.worldColliders.push(col);
  }

  static addEntityCollider(col: Collider) {
    this.entityColliders.push(col);
  }

  static removeEntityCollider(col: Collider) {
    const i = this.entityColliders.indexOf(col);
    if (i !== -1) this.entityColliders.splice(i, 1);
  }

  // -------------------
  // SAFE MOVEMENT (Player, NPCs, Enemies...)
  // -------------------
  static canMove(collider: Collider, futureX: number, futureY: number): boolean {
    // TODO: move logic
    return true;
  }

  static getOverlaps(collider: Collider) {
    return [];
  }

  // -------------------
  // COLLISION METHODS
  // -------------------
  static rectIntersects(a: IEntityData, b: IEntityData): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
}
