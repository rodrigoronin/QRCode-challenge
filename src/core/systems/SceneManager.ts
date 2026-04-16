import type { Container } from "pixi.js";
import type { Camera } from "@core/Camera";
import type { SceneDefinition } from "../../game/scenes/SceneDefinition";
import type { InteractionSystem } from "./InteractionSystem";

export class SceneManager {
  public currentScene: SceneDefinition | null = null;
  private readonly sceneFactories: Map<string, () => SceneDefinition> = new Map();
  private readonly world: Container;
  private readonly interactions: InteractionSystem;
  private readonly camera: Camera;

  constructor(world: Container, interactions: InteractionSystem, camera: Camera) {
    this.world = world;
    this.interactions = interactions;
    this.camera = camera;
  }

  update(deltaMS: number) {
    this.currentScene?.update(deltaMS);
  }

  public registerSceneFactory(areaId: string, factory: () => SceneDefinition): void {
    this.sceneFactories.set(areaId, factory);
  }

  public requestSceneChange(targetAreaId: string): void {
    const factory = this.sceneFactories.get(targetAreaId);

    if (!factory) {
      console.warn(`Scene not found: ${targetAreaId}`);
      return;
    }

    this.changeScene(factory());
  }

  public changeScene(nextScene: SceneDefinition): void {
    if (this.currentScene?.id === nextScene.id) return;

    if (this.currentScene) {
      this.currentScene.unmount(this.interactions);
    }

    this.interactions.clear();
    this.currentScene = nextScene;
    this.currentScene.mount(this.world, this.interactions);
    this.camera.setMapRef(this.currentScene.map);
  }
}
