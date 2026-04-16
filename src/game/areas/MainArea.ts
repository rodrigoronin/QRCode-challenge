import type { AssetLoader } from "@core/AssetLoader";
import type { Player } from "@entities/Player";
import type { AreaDefinition } from "./AreaDefinition";
import { frameSlicer } from "@utils/FrameSlicer";
import { Container, Point, Rectangle, Sprite, Texture, TextureSource } from "pixi.js";
import NPC from "@entities/NPC";
import { Enemy } from "@entities/Enemy";
import { WorldCollider } from "@core/WorldCollider";
import { CollisionManager } from "@core/CollisionManager";

type MainAreaConfig = {
  assets: AssetLoader;
  player: Player;
};

export function createMainArea(config: MainAreaConfig): AreaDefinition {
  const { assets, player } = config;

  const goblinMaceShield = assets.getTexture("sprites/goblin-mace-shield");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const elvenMageTexture = assets.getTexture("sprites/elven_mage");
  const blackSmithTexture = assets.getTexture("sprites/blacksmith");
  const fountainTexture = assets.getTexture("sprites/fountain");
  const treeTexture = assets.getTexture("sprites/tree");
  const houseTexture = assets.getTexture("sprites/house");
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

  const fountain = new Sprite(
    new Texture({
      source: fountainTexture.source,
      frame: new Rectangle(0, 0, 84, 71),
    }),
  );

  const tree = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );

  const house = new Sprite(
    new Texture({
      source: houseTexture.source,
      frame: new Rectangle(0, 0, 218, 177),
    }),
  );

  // Trees to represent the portal
  const treePortal_1 = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );
  const treePortal_2 = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );
  const treePortal_3 = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );

  const elvenMage = new NPC(elvenMageFrames);
  const blacksmith = new NPC(blacksmithFrames);

  const enemy01 = new Enemy(enemyFrames, player, daggerVFXFrames);
  const enemy02 = new Enemy(enemyFrames, player, daggerVFXFrames);
  const enemy03 = new Enemy(enemyFrames, player, daggerVFXFrames);

  const map = generateTestMap(
    frameSlicer(assets.getTexture("sprites/training-tiles"), 32, 3, 0),
    32,
    32,
    2048,
    2048,
  );

  enemy01.container.position.set(1200, 520);
  enemy02.container.position.set(1000, 1000);
  enemy03.container.position.set(1000, 512);

  elvenMage.setTag("Elven Mage");
  elvenMage.container.position.set(150, 270);

  blacksmith.setTag("Blacksmith");
  blacksmith.container.position.set(270, 270);

  fountain.position.set(167, 310);
  tree.position.set(1000, 350);
  house.position.set(100, 100);

  // Portal position
  treePortal_1.position.set(250, 650);
  treePortal_2.position.set(300, 600);
  treePortal_3.position.set(350, 650);

  const portal = new WorldCollider({
    posX: 330,
    posY: 750,
    width: 30,
    height: 30,
  })
    .setTrigger(true)
    .setCallbacks({
      onTriggerEnter: () => {
        // request dungeon transition
      },
    });

  CollisionManager.registerWorldCollider(portal);

  const enemies = [enemy01, enemy02, enemy03];
  const npcs = [elvenMage, blacksmith];
  const props = [fountain, tree, house, treePortal_2, treePortal_1, treePortal_3];

  return {
    id: "1",
    map,
    playerSpawn: new Point(210, 380),
    props,
    npcs,
    enemies,
    worldColliders: [portal],
    transitions: [],
  };
}

function generateTestMap(
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
