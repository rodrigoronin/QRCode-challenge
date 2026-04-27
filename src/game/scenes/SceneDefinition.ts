import type { Container } from "pixi.js";
import type { InteractionSystem } from "@core/systems/InteractionSystem";

export interface SceneDefinition {
  id: string;
  map: Container;
  enter(world: Container, interactionSystem: InteractionSystem, spawnId: string): void;
  exit(interactionSystem: InteractionSystem): void;
  update(deltaMS: number): void;
}
