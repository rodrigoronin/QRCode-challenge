import type { Player } from "@entities/Player";
import type { Enemy } from "@entities/Enemy";
import type { AttackCollider } from "./AttackCollider";
import type { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";
import { Time } from "./Time";
import { DamageSystem } from "./systems/DamageSystem";
import { DamageNumberSystem } from "../VFX/DamageNumberSystem";

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
        if (targetEntity?.stats && this.owner["stats"]) {
          const damage = DamageSystem.calculate(this.owner["stats"], targetEntity.stats);
          const isCrit = damage + 30% === this.owner['stats'].critChance;

          DamageNumberSystem.spawn({
            value: damage,
            isCrit,
            type: "physical",
            position: { x: closestEnemy.container.x, y: closestEnemy.container.y },
          });

          targetEntity.takeDamage(damage, this.direction);
        }

        this.damagedSet.add(closestEnemy);

        Time.triggerHitstop(80);
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
