import { Container, Sprite, Texture, TextureSource, Rectangle } from "pixi.js";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import type { AssetLoader } from "@core/AssetLoader";
import { Enemy } from "@entities/Enemy";
import NPC from "@entities/NPC";
import type { InteractionSystem } from "@core/systems/InteractionSystem";
import type { Scene } from "./Scene";

interface MainSceneConfig {
  assets: AssetLoader;
  player: Player;
}

export class MainScene implements Scene {
  public readonly id = "main";
  public readonly player: Player;
  public map!: Container;

  private readonly assets: AssetLoader;
  private readonly root: Container = new Container();
  private enemy01!: Enemy;
  private enemy02!: Enemy;
  private enemy03!: Enemy;
  private elvenMage!: NPC;
  private blacksmith!: NPC;
  private fountain!: Sprite;
  private tree!: Sprite;
  private house!: Sprite;
  private enemies: Enemy[] = [];
  private npcs: NPC[] = [];
  private props: Sprite[] = [];

  constructor({ assets, player }: MainSceneConfig) {
    this.assets = assets;
    this.player = player;

    this.init();
  }

  public update(deltaMS: number) {
    this.player.update(deltaMS);

    this.enemies.forEach((enemy) => {
      enemy.update(deltaMS);
    });

    this.npcs.forEach((npc) => {
      npc.update();
    });
  }

  public mount(world: Container, interactionSystem: InteractionSystem) {
    this.registerInteractions(interactionSystem);
    this.enemies.forEach((enemy) => enemy.resume());

    if (this.root.children.length === 0) {
      this.root.addChild(this.map);

      this.props.forEach((prop) => {
        this.root.addChild(prop);
      });

      this.enemies.forEach((enemy) => {
        this.root.addChild(enemy.container);
      });

      this.npcs.forEach((npc) => {
        this.root.addChild(npc.container);
      });

      this.root.addChild(this.player.container);
    }

    if (this.root.parent !== world) {
      world.addChild(this.root);
    }
  }

  public unmount(interactionSystem: InteractionSystem) {
    this.npcs.forEach((npc) => {
      interactionSystem.unregister(npc.interactable);
    });
    this.enemies.forEach((enemy) => enemy.suspend());

    this.root.parent?.removeChild(this.root);
  }

  private registerInteractions(interactionSystem: InteractionSystem) {
    this.npcs.forEach((npc) => {
      interactionSystem.register(npc.interactable);
    });
  }

  private init() {
    this.loadEntities();

    this.player.container.position.set(210, 380);

    this.enemy01.container.position.set(1200, 520);
    this.enemy02.container.position.set(1000, 1000);
    this.enemy03.container.position.set(1000, 512);

    this.elvenMage.setTag("Elven Mage");
    this.elvenMage.container.position.set(150, 270);

    this.blacksmith.setTag("Blacksmith");
    this.blacksmith.container.position.set(270, 270);

    this.fountain.position.set(167, 310);
    this.tree.position.set(1000, 350);
    this.house.position.set(100, 100);

    this.enemies = [this.enemy01, this.enemy02, this.enemy03];
    this.npcs = [this.elvenMage, this.blacksmith];
    this.props = [this.fountain, this.tree, this.house];
  }

  private loadEntities() {
    const goblinMaceShield = this.assets.getTexture("sprites/goblin-mace-shield");
    const swordSlashTexture = this.assets.getTexture("sprites/_sword_slash");
    const elvenMageTexture = this.assets.getTexture("sprites/elven_mage");
    const blackSmithTexture = this.assets.getTexture("sprites/blacksmith");
    const fountainTexture = this.assets.getTexture("sprites/fountain");
    const treeTexture = this.assets.getTexture("sprites/tree");
    const houseTexture = this.assets.getTexture("sprites/house");
    const frameSize = 64;

    const daggerVFXFrames = {
      attack_up: frameSlicer(swordSlashTexture, 81, 7, 1),
      attack_down: frameSlicer(swordSlashTexture, 81, 7, 1),
      attack_right: frameSlicer(swordSlashTexture, 81, 7, 0),
      attack_left: frameSlicer(swordSlashTexture, 81, 7, 0),
    };

    const enemyFrames = {
      idle_down: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      idle_left: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      idle_up: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      idle_right: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      walk_down: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      walk_right: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      walk_up: frameSlicer(goblinMaceShield, frameSize, 1, 0),
      walk_left: frameSlicer(goblinMaceShield, frameSize, 1, 0),
    };

    const elvenMageFrames = {
      idle_down: frameSlicer(elvenMageTexture, frameSize, 1, 0),
    };

    const blacksmithFrames = {
      idle_down: frameSlicer(blackSmithTexture, frameSize, 1, 0),
    };

    this.fountain = new Sprite(
      new Texture({
        source: fountainTexture.source,
        frame: new Rectangle(0, 0, 84, 71),
      }),
    );

    this.tree = new Sprite(
      new Texture({
        source: treeTexture.source,
        frame: new Rectangle(0, 0, 103, 140),
      }),
    );

    this.house = new Sprite(
      new Texture({
        source: houseTexture.source,
        frame: new Rectangle(0, 0, 218, 177),
      }),
    );

    this.elvenMage = new NPC(elvenMageFrames);
    this.blacksmith = new NPC(blacksmithFrames);

    this.enemy01 = new Enemy(enemyFrames, this.player, daggerVFXFrames);
    this.enemy02 = new Enemy(enemyFrames, this.player, daggerVFXFrames);
    this.enemy03 = new Enemy(enemyFrames, this.player, daggerVFXFrames);

    this.map = this.generateTestMap(
      frameSlicer(this.assets.getTexture("sprites/training-tiles"), 32, 3, 0),
      32,
      32,
      2048,
      2048,
    );
  }

  private generateTestMap(
    tiles: Texture<TextureSource<any>>[],
    tileWidth: number,
    tileHeight: number,
    mapWidth: number,
    mapHeight: number,
  ): Container {
    const container = new Container();
    const cols = Math.ceil(mapWidth / tileWidth);
    const rows = Math.ceil(mapHeight / tileHeight);

    for (let y = 0; y < rows; y++) {
      const isEvenRow = y % 2 === 0;
      const tileA = isEvenRow ? tiles[0] : tiles[2];
      const tileB = isEvenRow ? tiles[1] : tiles[0];

      for (let x = 0; x < cols; x++) {
        const sprite = new Sprite(x % 2 === 0 ? tileA : tileB);
        sprite.position.set(x * tileWidth, y * tileHeight);
        container.addChild(sprite);
      }
    }

    return container;
  }
}
