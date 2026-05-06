import type { AssetLoader } from "@core/AssetLoader";
import type { Player } from "@entities/Player";
import type { AreaDefinition } from "../AreaDefinition";
import { frameSlicer } from "@utils/FrameSlicer";
import { Rectangle, Sprite, Texture } from "pixi.js";
import NPC from "@entities/NPC";
import { WorldCollider } from "@core/WorldCollider";
import { configureDepthSort } from "@core/systems/YSortSystem";

type TownConfig = {
  assets: AssetLoader;
  player: Player;
  requestSceneChange: (targetAreaId: string, spawnId: string) => void;
};

export function load(config: TownConfig): AreaDefinition {
  const { assets } = config;

  const elvenMageTexture = assets.getTexture("sprites/elven_mage");
  const blackSmithTexture = assets.getTexture("sprites/blacksmith");
  const trainingDummyTexture = assets.getTexture("sprites/training-dummy");
  const treeTexture = assets.getTexture("sprites/tree");
  const treeTexture3 = assets.getTexture("sprites/town/tree_3");
  const treeTextureSmall = assets.getTexture("sprites/town/tree_small");
  const townGroundTexture = assets.getTexture("sprites/town/town_ground-sheet");
  const houseTexture = assets.getTexture("sprites/house");
  const houseTexture2 = assets.getTexture("sprites/town/house_2");
  const houseTexture3 = assets.getTexture("sprites/town/house_3");
  const houseTexture4 = assets.getTexture("sprites/town/house_4");
  const houseTexture5 = assets.getTexture("sprites/town/house_5");
  const frameSize = 64;

  const elvenMageFrames = {
    idle_down: frameSlicer(elvenMageTexture, frameSize, frameSize, 1, 0),
  };

  const blacksmithFrames = {
    idle_down: frameSlicer(blackSmithTexture, frameSize, frameSize, 1, 0),
  };

  const dummy = new Sprite(
    new Texture({
      source: trainingDummyTexture.source,
      frame: new Rectangle(0, 0, 96, 96),
    }),
  );
  configureDepthSort(dummy, { depthSortOffsetY: dummy.height });
  dummy.position.set(470, 440);
  const dummyCollider = new WorldCollider({
    id: "dummy_1",
    posX: dummy.position.x + 33,
    posY: dummy.position.y + 20,
    width: dummy.width - 70,
    height: 60,
  });

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

  const house = new Sprite(
    new Texture({
      source: houseTexture.source,
      frame: new Rectangle(0, 0, 218, 177),
    }),
  );
  configureDepthSort(house, { depthSortOffsetY: house.height });
  house.scale.set(1.2);
  house.position.set(120, 750);

  const house2 = new Sprite(
    new Texture({
      source: houseTexture2.source,
      frame: new Rectangle(0, 0, 339, 294),
    }),
  );
  configureDepthSort(house2, { depthSortOffsetY: house2.height });
  house2.position.set(38, 405);
  const houseCollider2 = new WorldCollider({
    id: "house_2",
    posX: house2.position.x + 5,
    posY: house2.position.y + 120,
    width: house2.width - 10,
    height: 140,
  });

  const house3 = new Sprite(
    new Texture({
      source: houseTexture3.source,
      frame: new Rectangle(0, 0, 427, 319),
    }),
  );
  configureDepthSort(house3, { depthSortOffsetY: house3.height });
  house3.position.set(553, 28);
  const houseCollider3 = new WorldCollider({
    id: "house_3",
    posX: house3.position.x + 5,
    posY: house3.position.y + 120,
    width: house3.width - 10,
    height: 160,
  });

  const house4 = new Sprite(
    new Texture({
      source: houseTexture4.source,
      frame: new Rectangle(0, 0, 427, 319),
    }),
  );
  configureDepthSort(house4, { depthSortOffsetY: house4.height });
  house4.position.set(655, 400);
  const houseCollider4 = new WorldCollider({
    id: "house_4",
    posX: house4.position.x + 5,
    posY: house4.position.y + 140,
    width: house4.width - 115,
    height: 140,
  });

  const house5 = new Sprite(
    new Texture({
      source: houseTexture5.source,
      frame: new Rectangle(0, 0, 343, 338),
    }),
  );
  configureDepthSort(house5, { depthSortOffsetY: house5.height });
  house5.position.set(50, 0);
  const houseCollider5 = new WorldCollider({
    id: "house_1",
    posX: house5.position.x + 10,
    posY: house5.position.y + 180,
    width: house5.width - 20,
    height: 120,
  });

  const elvenMage = new NPC(elvenMageFrames, { depthSortOffsetY: frameSize / 2 });
  const blacksmith = new NPC(blacksmithFrames, { depthSortOffsetY: frameSize / 2 });

  const map = new Sprite(
    new Texture({
      source: townGroundTexture.source,
      frame: new Rectangle(0, 0, 1024, 1024),
    }),
  );
  map.position.set(0);

  elvenMage.setTag("Elven Mage");
  elvenMage.container.position.set(150, 370);

  blacksmith.setTag("Blacksmith");
  blacksmith.container.position.set(250, 962);
  blacksmith.sprite.scale.x = -1;

  const fieldPortal_south = new WorldCollider({
    id: "village_fild01_n",
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
  transitions.set("village_fild01_n", {
    id: "field_transition",
    targetAreaId: "village_fild01",
    spawnId: "village_south_portal",
  });
  transitions.set("entry", {
    id: "field_transition",
    targetAreaId: "village",
    spawnId: "entry",
  });

  const npcs = [elvenMage, blacksmith];
  const props = [dummy, smallTree, tree, tree3, house, house2, house3, house4, house5];

  return {
    id: "village",
    map,
    spawnPoints: {
      village_south_portal: { x: 512, y: 880 },
      entry: { x: 460, y: 480 },
    },
    props,
    npcs,
    enemies: [],
    worldColliders: [
      fieldPortal_south,
      dummyCollider,
      houseCollider2,
      houseCollider3,
      houseCollider4,
      houseCollider5,
      treeCollider,
      treeCollider3,
      treeCollider3_1,
      smallTreeCollider,
    ],
    transitions,
  };
}
