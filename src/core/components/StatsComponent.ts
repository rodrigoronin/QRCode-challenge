export class StatsComponent {
  public maxHP: number;
  public currentHP: number;
  public attack: number;
  public defense: number;
  public critChance: number;
  public critMultiplier: number;

  constructor(config: Partial<StatsComponent>) {
    this.maxHP = config.maxHP ?? 10;
    this.currentHP = config.currentHP ?? this.maxHP;
    this.attack = config.attack ?? 5;
    this.defense = config.defense ?? 0;
    this.critChance = config.critChance ?? 0;
    this.critMultiplier = config.critMultiplier ?? 1.3;
  }
}
