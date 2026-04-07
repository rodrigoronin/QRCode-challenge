import { StatsComponent } from "@core/components/StatsComponent";

export class DamageSystem {
  static calculate(attacker: StatsComponent, defender: StatsComponent) {
    const base = attacker.attack;
    const mitigated = base - defender.defense;

    let damage = Math.max(1, mitigated);

    if (Math.random() < attacker.critChance) {
      damage *= attacker.critMultiplier;
    }

    return Math.floor(damage);
  }
}
