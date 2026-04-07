import { StatsComponent } from "@core/components/StatsComponent";

export class DamageSystem {
  static calculate(attacker: StatsComponent, defender: StatsComponent) {
    const base = attacker.attack;
    const mitigated = base - defender.defense;
    const isCrit = Math.random() < attacker.critChance;

    let damage = Math.max(1, mitigated);

    if (isCrit) {
      damage *= attacker.critMultiplier;
    }

    return {
      damage: Math.floor(damage),
      isCrit: isCrit,
    };
  }
}
