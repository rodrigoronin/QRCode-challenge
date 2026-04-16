import { Container } from "pixi.js";
import { Player } from "@entities/Player";
import { CollisionManager } from "@core/CollisionManager";
import type { InteractionSystem } from "@core/systems/InteractionSystem";
import type { SceneDefinition } from "./SceneDefinition";
import type { AreaDefinition } from "../areas/AreaDefinition";
import type { WorldCollider } from "@core/WorldCollider";

export class MainScene implements SceneDefinition {
  public readonly id = "main";
  public readonly player: Player;
  public readonly map: Container;
  private area: AreaDefinition;
  private activeTriggers: Set<string> = new Set();

  private readonly root: Container = new Container();

  constructor(area: AreaDefinition, player: Player) {
    this.area = area;
    this.player = player;
    this.map = area.map;
  }

  public update(deltaMS: number) {
    this.player.update(deltaMS);

    this.area.enemies.forEach((enemy) => {
      enemy.update(deltaMS);
    });

    this.area.npcs.forEach((npc) => {
      npc.update();
    });

    this.updateTriggers();
  }

  private updateTriggers(): void {
    const playerBounds = this.player.collider.getBounds();

    this.area.worldColliders.forEach((collider) => {
      if (!collider.isTrigger) return;

      const colliderBounds = collider.getBounds();
      const overlaps = CollisionManager.rectIntersects(playerBounds, colliderBounds);

      if (overlaps && !this.activeTriggers.has(collider.id)) {
        this.handleTriggerEnter(collider);
        this.activeTriggers.add(collider.id);
      } else if (!overlaps && this.activeTriggers.has(collider.id)) {
        this.handleTriggerExit(collider);
        this.activeTriggers.delete(collider.id);
      }
    });
  }

  private handleTriggerEnter(trigger: WorldCollider): void {
    console.log(`Player entered the area ${trigger.id}`);
  }

  private handleTriggerExit(trigger: WorldCollider): void {
    console.log(`Player exited the area ${trigger.id}`);
  }

  private queueSceneChange(targetAreaId: string): void {
    this.activeTriggers;
  }

  public mount(world: Container, interactionSystem: InteractionSystem) {
    this.registerInteractions(interactionSystem);
    this.area.enemies.forEach((enemy) => enemy.resume());

    this.player.container.position.set(this.area.playerSpawn.x, this.area.playerSpawn.y);

    if (this.root.children.length === 0) {
      this.root.addChild(this.map);

      this.area.enemies.forEach((enemy) => {
        this.root.addChild(enemy.container);
      });

      this.area.npcs.forEach((npc) => {
        this.root.addChild(npc.container);
      });

      this.area.worldColliders.forEach((collider) => {
        this.root.addChild(collider.container);
      });

      this.area.props.forEach((prop) => {
        this.root.addChild(prop);
      });

      this.root.addChild(this.player.container);
    }

    if (this.root.parent !== world) {
      world.addChild(this.root);
    }
  }

  public unmount(interactionSystem: InteractionSystem) {
    this.area.npcs.forEach((npc) => {
      interactionSystem.unregister(npc.interactable);
    });
    this.area.enemies.forEach((enemy) => enemy.suspend());

    this.root.parent?.removeChild(this.root);
  }

  private registerInteractions(interactionSystem: InteractionSystem) {
    this.area.npcs.forEach((npc) => {
      interactionSystem.register(npc.interactable);
    });
  }
}
