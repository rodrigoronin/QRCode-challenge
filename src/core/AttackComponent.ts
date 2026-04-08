import type { Player } from "@entities/Player";
import type { Enemy } from "@entities/Enemy";
import type { AttackCollider } from "./AttackCollider";
import type { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";
import { DamageSystem } from "./systems/DamageSystem";

interface Config {
  attackCollider: AttackCollider;
  maxTargets: number;
  target: string;
}

export class AttackComponent {
  private owner: Player | Enemy;
  private attackCollider: AttackCollider;
  private target: string = "";
  private maxTargets: number;
  public isActive: boolean = false;
  private damagedSet: Set<Collider> = new Set();
  public direction?: string = "";

  constructor(owner: Player | Enemy, config: Config) {
    const { attackCollider, maxTargets, target } = config;
    this.owner = owner;
    this.attackCollider = attackCollider;
    this.maxTargets = maxTargets;
    this.target = target;
  }

  update() {
    if (!this.isActive) return;

    const hits: Collider[] = CollisionManager.getOverlaps(this.attackCollider);
    let closestEnemy: Collider | null = null;
    let closestDistance: number = Infinity;

    if (this.attackCollider.active) {
      for (let i = 0; i < hits.length; i++) {
        if (hits[i].owner.tag.toLowerCase() !== this.target.toLowerCase()) continue;

        if (this.damagedSet.size < this.maxTargets && !this.damagedSet.has(hits[i])) {
          const dX = hits[i].container.x - this.owner.container.x;
          const dY = hits[i].container.y - this.owner.container.y;
          const currentDistance = Math.hypot(dX, dY);

          if (currentDistance < closestDistance) {
            closestEnemy = hits[i];
            closestDistance = currentDistance;
          }
        }
      }

      if (closestEnemy) {
        const targetEntity = closestEnemy.owner;

        // TODO: adjust this check in the future for objects without stats
        // or just add the StatsComponent to the object (needs definition)
        if (targetEntity?.stats && this.owner["stats"]) {
          DamageSystem.applyDamage(this.owner, targetEntity, this.direction);
        }

        this.damagedSet.add(closestEnemy);
      }
    }
  }

  activate() {
    this.isActive = true;
    this.damagedSet.clear();
  }

  deactivate() {
    this.isActive = false;
  }
}
