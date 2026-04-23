import { Container } from "pixi.js";
import { Player } from "@entities/Player";
import { CollisionManager } from "@core/systems/CollisionManager";
import { YSortSystem } from "@core/systems/YSortSystem";
import type { InteractionSystem } from "@core/systems/InteractionSystem";
import type { SceneDefinition } from "./SceneDefinition";
import type { AreaDefinition } from "../areas/AreaDefinition";
import type { WorldCollider } from "@core/WorldCollider";

// TODO: transform this class into a scene factory
export class MainScene implements SceneDefinition {
  public readonly id: string;
  public readonly player: Player;
  public readonly map: Container;
  private area: AreaDefinition;
  private activeTriggers: Set<string> = new Set();
  private pendingSceneChange: string | null = null;
  private requestSceneChange: (id: string) => void;

  private readonly root: Container = new Container();
  private readonly mapLayer: Container = new Container();
  private readonly actorLayer: Container = new Container();
  private readonly colliderLayer: Container = new Container();
  private readonly ySortSystem: YSortSystem;

  constructor(area: AreaDefinition, player: Player, requestSceneChange: (id: string) => void) {
    this.area = area;
    this.player = player;
    this.map = area.map;
    this.id = area.id;
    this.requestSceneChange = requestSceneChange;
    this.ySortSystem = new YSortSystem(this.actorLayer);
    this.bindTriggerCallbacks();
  }

  public update(deltaMS: number) {
    this.player.update(deltaMS);

    this.area.enemies.forEach((enemy) => {
      enemy.update(deltaMS);
    });

    this.area.npcs.forEach((npc) => {
      npc.update();
    });

    this.ySortSystem.sync();
    this.updateTriggers();
    this.flushSceneChange();
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
    trigger.triggerEnter(this.player);
  }

  private handleTriggerExit(trigger: WorldCollider): void {
    trigger.triggerExit(this.player);
  }

  private queueSceneChange(targetAreaId: string): void {
    this.pendingSceneChange = targetAreaId;
  }

  private flushSceneChange(): void {
    if (!this.pendingSceneChange) return;

    const nextAreaId = this.pendingSceneChange;
    this.pendingSceneChange = null;
    this.requestSceneChange(nextAreaId);
  }

  private bindTriggerCallbacks(): void {
    this.area.transitions.forEach((transition) => {
      const trigger = this.area.worldColliders.find((collider) => collider.id === transition.id);

      if (!trigger) return;

      trigger.setCallbacks({
        onTriggerEnter: () => {
          this.queueSceneChange(transition.targetAreaId);
        },
      });
    });
  }

  public enter(world: Container, interactionSystem: InteractionSystem) {
    this.registerInteractions(interactionSystem);
    this.area.enemies.forEach((enemy) => enemy.resume());
    this.area.worldColliders.forEach((collider) =>
      CollisionManager.registerWorldCollider(collider),
    );

    this.player.container.position.set(this.area.playerSpawn.x, this.area.playerSpawn.y);

    if (this.root.children.length === 0) {
      this.mapLayer.addChild(this.map);
      this.root.addChild(this.mapLayer);
      this.root.addChild(this.actorLayer);
      this.root.addChild(this.colliderLayer);

      this.area.enemies.forEach((enemy) => {
        this.actorLayer.addChild(enemy.container);
      });

      this.area.npcs.forEach((npc) => {
        this.actorLayer.addChild(npc.container);
      });

      this.area.worldColliders.forEach((collider) => {
        this.colliderLayer.addChild(collider.container);
      });

      this.area.props.forEach((prop) => {
        this.actorLayer.addChild(prop);
      });

      this.actorLayer.addChild(this.player.container);
    }

    this.area.enemies.forEach((enemy) => this.ySortSystem.register(enemy.container));
    this.area.npcs.forEach((npc) => this.ySortSystem.register(npc.container));
    this.area.props.forEach((prop) => this.ySortSystem.register(prop));
    this.ySortSystem.register(this.player.container);
    this.ySortSystem.sync();

    if (this.root.parent !== world) {
      world.addChild(this.root);
    }
  }

  public exit(interactionSystem: InteractionSystem) {
    this.area.npcs.forEach((npc) => {
      interactionSystem.unregister(npc.interactable);
    });
    this.area.enemies.forEach((enemy) => enemy.suspend());
    this.area.worldColliders.forEach((collider) => {
      CollisionManager.removeWorldCollider(collider);
      collider.destroy?.();
    });

    this.activeTriggers.clear();
    this.pendingSceneChange = null;
    this.ySortSystem.clear();
    this.root.parent?.removeChild(this.root);
  }

  private registerInteractions(interactionSystem: InteractionSystem) {
    this.area.npcs.forEach((npc) => {
      interactionSystem.register(npc.interactable);
    });
  }
}
