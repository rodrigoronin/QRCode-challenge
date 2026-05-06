import type { AssetLoader } from "@core/AssetLoader";
import type { Player } from "@entities/Player";
import { Enemy } from "@entities/Enemy";
import type { AreaDefinition } from "../AreaDefinition";
import { Container, Rectangle, Sprite, Texture, TextureSource } from "pixi.js";
import { WorldCollider } from "@core/WorldCollider";
import { configureDepthSort } from "@core/systems/YSortSystem";
import { frameSlicer } from "@utils/FrameSlicer";

type TownConfig = {
  assets: AssetLoader;
  player: Player;
  requestSceneChange: (targetAreaId: string, spawnId: string) => void;
};

export function load(config: TownConfig): AreaDefinition {
  const { assets, player } = config;

  const goblinMaceShield = assets.getTexture("sprites/goblin-mace-shield");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const treeTexture = assets.getTexture("sprites/tree");
  const treeTexture3 = assets.getTexture("sprites/town/tree_3");
  const treeTextureSmall = assets.getTexture("sprites/town/tree_small");
  const frameSize = 64;

  const daggerVFXFrames = {
    attack_up: frameSlicer(swordSlashTexture, 81, 81, 7, 1),
    attack_down: frameSlicer(swordSlashTexture, 81, 81, 7, 1),
    attack_right: frameSlicer(swordSlashTexture, 81, 81, 7, 0),
    attack_left: frameSlicer(swordSlashTexture, 81, 81, 7, 0),
  };

  const enemyFrames = {
    idle_down: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    idle_left: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    idle_up: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    idle_right: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    walk_down: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    walk_right: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    walk_up: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
    walk_left: frameSlicer(goblinMaceShield, frameSize, frameSize, 1, 0),
  };

  const goblinRoamingArea = {
    x: 420,
    y: 500,
    width: 220,
    height: 220,
  };

  const testGoblin = new Enemy(enemyFrames, player, daggerVFXFrames, goblinRoamingArea);
  testGoblin.container.position.set(560, 610);

  const tree = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );
  configureDepthSort(tree, { depthSortOffsetY: tree.height });
  tree.position.set(340, 270);
  const treeCollider = new WorldCollider({
    id: "treeCollider",
    posX: tree.position.x + 22,
    posY: tree.position.y + 115,
    width: tree.width - 80,
    height: 10,
  });

  const tree3 = new Sprite(
    new Texture({
      source: treeTexture3.source,
      frame: new Rectangle(0, 0, 272, 215),
    }),
  );
  configureDepthSort(tree3, { depthSortOffsetY: tree3.height });
  tree3.position.set(630, 780);
  const treeCollider3 = new WorldCollider({
    id: "treeCollider3",
    posX: tree3.position.x + 70,
    posY: tree3.position.y + 150,
    width: 30,
    height: 30,
  });
  const treeCollider3_1 = new WorldCollider({
    id: "treeCollider3",
    posX: tree3.position.x + 145,
    posY: tree3.position.y + 135,
    width: 30,
    height: 60,
  });

  const smallTree = new Sprite(
    new Texture({
      source: treeTextureSmall.source,
      frame: new Rectangle(0, 0, 84, 76),
    }),
  );
  configureDepthSort(smallTree, { depthSortOffsetY: smallTree.height });
  smallTree.position.set(330, 670);
  const smallTreeCollider = new WorldCollider({
    id: "treeCollider",
    posX: smallTree.position.x + 22,
    posY: smallTree.position.y + 50,
    width: smallTree.width - 40,
    height: 10,
  });

  const map = generateTestMap(
    frameSlicer(assets.getTexture("sprites/training-tiles"), 32, 32, 3, 0),
    32,
    32,
    1024,
    1024,
  );

  const fieldPortal_south = new WorldCollider({
    id: "village_fild01",
    posX: map.width / 2 - 50,
    posY: map.height - 30,
    width: 80,
    height: 30,
  })
    .setTrigger(true)
    .setCallbacks({
      onTriggerEnter: () => {
        config.requestSceneChange(
          transitions.get(fieldPortal_south.id).targetAreaId,
          transitions.get(fieldPortal_south.id).spawnId,
        );
      },
    });

  const transitions = new Map();
  transitions.set("dungeon_north_gate", {
    id: "field_transition",
    targetAreaId: "dungeon",
    spawnId: "dungeon_north_gate",
  });
  transitions.set("entry", {
    id: "field_transition",
    targetAreaId: "village",
    spawnId: "entry",
  });

  const props = [smallTree, tree, tree3];

  return {
    id: "village_fild01",
    map,
    spawnPoints: {
      village_south_portal: { x: 512, y: 880 },
      entry: { x: 512, y: 540 },
    },
    props,
    npcs: [],
    enemies: [testGoblin],
    worldColliders: [
      fieldPortal_south,
      treeCollider,
      treeCollider3,
      treeCollider3_1,
      smallTreeCollider,
    ],
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
