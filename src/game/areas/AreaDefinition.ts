import type { WorldCollider } from "@core/WorldCollider";
import type { Enemy } from "@entities/Enemy";
import type NPC from "@entities/NPC";
import type { Container, Sprite } from "pixi.js";

type AreaSpawnPoint = {
  x: number;
  y: number;
};

type AreaTransitionDefinition = {
  id: string;
  targetAreaId: string;
  spawnId: string;
};

export type AreaDefinition = {
  id: string;
  map: Container;
  playerSpawn: AreaSpawnPoint;
  props: Sprite[];
  npcs: NPC[];
  enemies: Enemy[];
  worldColliders: WorldCollider[];
  transitions: AreaTransitionDefinition[];
};
