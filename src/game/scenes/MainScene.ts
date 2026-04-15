import { Container } from "pixi.js";
import { Player } from "@entities/Player";
import type { InteractionSystem } from "@core/systems/InteractionSystem";
import type { SceneDefinition } from "./SceneDefinition";
import type { AreaDefinition } from "../areas/AreaDefinition";

export class MainScene implements SceneDefinition {
  public readonly id = "main";
  public readonly player: Player;
  public readonly map: Container;
  private area: AreaDefinition;

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

      this.root.addChild(this.player.container);

      this.area.props.forEach((prop) => {
        this.root.addChild(prop);
      });
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
