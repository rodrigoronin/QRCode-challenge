import type { WorldCollider } from "@core/WorldCollider";
import type { Enemy } from "@entities/Enemy";
import type NPC from "@entities/NPC";
import type { Container, Sprite } from "pixi.js";

type AreaTransitionDefinition = {
  id: string;
  targetAreaId: string;
  spawnId: string;
};

export type AreaDefinition = {
  id: string;
  map: Container;
  spawnPoints: Record<string, { x: number; y: number }>;
  props: Sprite[];
  npcs: NPC[];
  enemies: Enemy[];
  worldColliders: WorldCollider[];
  transitions: Map<string, AreaTransitionDefinition>;
};
