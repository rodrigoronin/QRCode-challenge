import type { Enemy } from "@entities/Enemy";
import type { Player } from "@entities/Player";

type Entity = Player | Enemy;
type DamageType = "physical" | "magical" | "fire" | "water" | "wind" | "earth" | "poison";

export type DamagePayload = {
  source: Entity;
  target: Entity;
  baseDamage: number;
  isCrit: boolean;
  type?: DamageType;
  position: { x: number; y: number };
  direction: string | undefined;
};
