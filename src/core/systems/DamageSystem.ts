import type { Enemy } from "@entities/Enemy";
import type { Player } from "@entities/Player";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";
import type { DamagePayload } from "src/data/DamagePayload";

type Entity = Player | Enemy;

export class DamageSystem {
  static applyDamage(attacker: Entity, defender: Entity, direction: string | undefined) {
    const { attack, critChance, critMultiplier } = attacker.stats;
    const { defense } = defender.stats;

    const baseDamage = attack;
    const mitigated = baseDamage - defense;
    const isCrit = Math.random() < critChance;

    let damage = Math.max(1, mitigated);

    if (isCrit) {
      damage *= critMultiplier;
    }

    damage = Math.round(damage);

    const payload: DamagePayload = {
      source: attacker,
      target: defender,
      baseDamage: Math.round(damage),
      isCrit,
      type: "physical",
      position: { x: defender.position.x, y: defender.position.y },
      direction,
    };

    // DamageNumberSystem.spawn() needs to be called before takeDamage() to get the
    // defender reference otherwhise the defender will be dead before the numbers can appear.
    // Renders the damage numbers based on the enemy position and type of attack
    DamageNumberSystem.spawn(payload);

    // Reduces the Entity health based on damage applied
    if (!defender.isInvincible) {
      defender.stats.currentHP -= damage;
      defender.takeDamage(direction);
    }
  }
}
