import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { AttackCollider } from "./AttackCollider";
import type { Collider } from "./Collider";
import { CollisionManager } from "./CollisionManager";

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
  private damagedList: Collider[] = [];

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

    for (let i = 0; i < hits.length; i++) {
      if (
        hits[i].owner?.tag === this.target &&
        this.damagedList.length < this.maxTargets &&
        !this.damagedList.includes(hits[i])
      ) {
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
      closestEnemy.owner?.takeDamage(1);
      this.damagedList.push(closestEnemy);
    }
  }

  activate() {
    this.isActive = true;
    this.damagedList = [];
  }

  deactivate() {
    this.isActive = false;
  }
}
