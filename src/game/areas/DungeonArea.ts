import type { AssetLoader } from "@core/AssetLoader";
import type { AreaDefinition } from "./AreaDefinition";
import type { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import { Container, Rectangle, Sprite, Texture, TextureSource } from "pixi.js";
import { WorldCollider } from "@core/WorldCollider";
import { Enemy } from "@entities/Enemy";
import { configureDepthSort } from "@core/systems/YSortSystem";

type DungeonAreaConfig = {
  assets: AssetLoader;
  player: Player;
  requestSceneChange: (targetAreaId: string, spawnId: string) => void;
};

export function createDungeonArea(config: DungeonAreaConfig): AreaDefinition {
  const { assets, player } = config;

  const goblinMaceShield = assets.getTexture("sprites/goblin-mace-shield");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
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

  const goblinRoamingArea = {
    x: 400,
    y: 300,
    width: 400,
    height: 400,
  };

  const enemy01 = new Enemy(enemyFrames, player, daggerVFXFrames, goblinRoamingArea);
  const enemy02 = new Enemy(enemyFrames, player, daggerVFXFrames, goblinRoamingArea);
  const enemy03 = new Enemy(enemyFrames, player, daggerVFXFrames, goblinRoamingArea);

  enemy01.container.position.set(200, 380);
  enemy02.container.position.set(200, 380);
  enemy03.container.position.set(200, 380);

  const map = generateTestMap(
    frameSlicer(assets.getTexture("sprites/training-tiles"), 32, 3, 0),
    32,
    32,
    1024,
    1024,
  );

  const tree = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );
  configureDepthSort(tree, { depthSortOffsetY: tree.height });
  tree.position.set(180, 180);

  const house = new Sprite(
    new Texture({
      source: houseTexture.source,
      frame: new Rectangle(0, 0, 218, 177),
    }),
  );
  configureDepthSort(house, { depthSortOffsetY: house.height });
  house.position.set(320, 280);

  const portalBack = new WorldCollider({
    id: "village_entrance",
    posX: 700,
    posY: 700,
    width: 30,
    height: 30,
  }).setTrigger(true);
  portalBack.setCallbacks({
    onTriggerEnter: () => {
      config.requestSceneChange("village", "village_south_portal");
    },
  });
  const transitions = new Map();
  transitions.set("village_south_portal", {
    id: "village_entrance",
    targetAreaId: "village",
    spawnId: "village_south_portal",
  });
  transitions.set("entry", {
    id: "field_transition",
    targetAreaId: "dungeon",
    spawnId: "entry",
  });

  const enemies = [enemy01, enemy02, enemy03];

  return {
    id: "dungeon",
    map,
    spawnPoints: {
      dungeon_north_gate: { x: 80, y: 200 },
      entry: { x: 100, y: 100 },
    },
    props: [tree, house],
    npcs: [],
    enemies,
    worldColliders: [portalBack],
    transitions,
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
