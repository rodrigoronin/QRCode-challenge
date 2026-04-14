import type { Container } from "pixi.js";
import type { InteractionSystem } from "@core/systems/InteractionSystem";

export interface Scene {
  id: string;
  map: Container;
  mount(world: Container, interactionSystem: InteractionSystem): void;
  unmount(interactionSystem: InteractionSystem): void;
  update(deltaMS: number): void;
}
