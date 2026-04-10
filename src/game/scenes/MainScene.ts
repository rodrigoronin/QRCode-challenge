import { Container, Sprite, Texture, TextureSource, Rectangle } from "pixi.js";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import type { AssetLoader } from "@core/AssetLoader";
import { Enemy } from "@entities/Enemy";
import NPC from "@entities/NPC";
import type { InteractionSystem } from "@core/systems/InteractionSystem";

export class MainScene {
  public player!: Player;
  private enemy01!: Enemy;
  private enemy02!: Enemy;
  private enemy03!: Enemy;
  private elvenMage!: NPC;
  private blacksmith!: NPC;
  private fountain!: Sprite;
  private tree!: Sprite;
  private house!: Sprite;
  private assets: AssetLoader;
  public entities: Array<Player | Enemy> = [];
  public npcs: NPC[] = [];
  public props: Sprite[] = [];
  public map!: Container;

  constructor(assets: AssetLoader) {
    this.assets = assets;

    this.init();
  }

  public update(deltaMS: number) {
    this.entities.forEach((entity) => {
      entity.update(deltaMS);
    });
    this.npcs.forEach((entity: NPC) => {
      entity.update();
    });
  }

  public mount(world: Container) {
    world.addChild(this.map);

    this.props.forEach((entity) => {
      world.addChild(entity);
    });
    this.entities.forEach((entity) => {
      world.addChild(entity.container);
    });
    this.npcs.forEach((entity) => {
      world.addChild(entity.container);
    });
  }

  public registerInteractions(interactionSystem: InteractionSystem) {
    this.npcs.forEach((npc) => {
      interactionSystem.register(npc.interactable);
    });
  }

  private init() {
    this.loadEntities();

    this.player.container.position.x = 210;
    this.player.container.position.y = 380;

    this.enemy01.container.x = 1200;
    this.enemy01.container.y = 520;
    this.enemy02.container.x = 1000;
    this.enemy02.container.y = 1000;
    this.enemy03.container.x = 1000;
    this.enemy03.container.y = 512;

    this.elvenMage.setTag("Elven Mage");
    this.elvenMage.container.position.x = 150;
    this.elvenMage.container.position.y = 270;

    this.blacksmith.setTag("Blacksmith");
    this.blacksmith.container.position.x = 270;
    this.blacksmith.container.position.y = 270;

    this.fountain.position.x = 167;
    this.fountain.position.y = 310;
    this.tree.position.x = 1000;
    this.tree.position.y = 350;
    this.house.position.x = 100;
    this.house.position.y = 100;

    this.entities.push(this.player, this.enemy01, this.enemy02, this.enemy03);
    this.npcs.push(this.elvenMage, this.blacksmith);
    this.props.push(this.fountain, this.tree, this.house);
  }

  private loadEntities() {
    const playerTexture = this.assets.getTexture("sprites/mage");
    const goblinMaceShield = this.assets.getTexture("sprites/goblin-mace-shield");
    const swordSlashTexture = this.assets.getTexture("sprites/_sword_slash");
    const elvenMageTexture = this.assets.getTexture("sprites/elven_mage");
    const blackSmithTexture = this.assets.getTexture("sprites/blacksmith");
    const fountainTexture = this.assets.getTexture("sprites/fountain");
    const treeTexture = this.assets.getTexture("sprites/tree");
    const houseTexture = this.assets.getTexture("sprites/house");
    const frameSize = 64;

    const frames = {
      idle_down: frameSlicer(playerTexture, frameSize, 1, 1, 0),
      walk_down: frameSlicer(playerTexture, frameSize, 1, 1, 0),

      idle_left: frameSlicer(playerTexture, frameSize, 1, 0),
      walk_left: frameSlicer(playerTexture, frameSize, 6, 0, 1),

      idle_up: frameSlicer(playerTexture, frameSize, 1, 2, 0),
      walk_up: frameSlicer(playerTexture, frameSize, 1, 2, 0),

      idle_right: frameSlicer(playerTexture, frameSize, 1, 0),
      walk_right: frameSlicer(playerTexture, frameSize, 6, 0, 1),

      dash_down: frameSlicer(playerTexture, frameSize, 1, 0),
      dash_right: frameSlicer(playerTexture, frameSize, 1, 0),
      dash_up: frameSlicer(playerTexture, frameSize, 1, 0),
      dash_left: frameSlicer(playerTexture, frameSize, 1, 0),
    };
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

    this.player = new Player(frames, daggerVFXFrames);

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

      // linha par: tile 1 e 2
      // linha ímpar: tile 1 e 3
      const tileA = isEvenRow ? tiles[0] : tiles[2];
      const tileB = isEvenRow ? tiles[1] : tiles[0];

      for (let x = 0; x < cols; x++) {
        const useTileA = x % 2 === 0;
        const texture = useTileA ? tileA : tileB;

        const sprite = new Sprite(texture);
        sprite.x = x * tileWidth;
        sprite.y = y * tileHeight;

        container.addChild(sprite);
      }
    }

    return container;
  }
}
