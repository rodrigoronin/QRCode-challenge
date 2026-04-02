import { Application, Assets, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { Player } from "@entities/Player";
import { Enemy } from "@entities/Enemy";
import { InputCommandMapper } from "@input/InputCommandMapper";
import { InputManager } from "@input/InputManager";
import { DamageNumberManager } from "./VFX/DamageNumberManager";
import * as Constants from "@utils/Constants";
import { Time } from "@core/Time";
import { Camera } from "./core/Camera";
import NPC from "@entities/NPC";

import "./style.css";

// Assets
import playerSprite from "@sprites/_wizard.png";
import elvenMageSprite from "@sprites/_elven_mage.png";
import blackSmithSprite from "@sprites/_blacksmith.png";
import fountainSprite from "@sprites/_fountain.png";
import treeSprite from "@sprites/_tree.png";
import goblinMaceSprite from "@sprites/_goblin-mace-shield.png";
import sword_vfx from "@sprites/_sword_slash.png";
import trainingMapTiles from "@sprites/_training-tiles.png";

(async () => {
  const game: Application = new Application();
  await game.init({
    width: Constants.LOGICAL_WIDTH,
    height: Constants.LOGICAL_HEIGHT,
    background: "#d2d2d2",
    resizeTo: window,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });
  document.body.appendChild(game.canvas);

  const assets = await assetLoader([
    playerSprite,
    goblinMaceSprite,
    sword_vfx,
    trainingMapTiles,
    elvenMageSprite,
    blackSmithSprite,
    fountainSprite,
    treeSprite,
  ]);

  const world: Container = new Container();

  const frameSize: number = 64;
  const playerTexture = playerSprite.slice(playerSprite.indexOf("_"), playerSprite.indexOf("."));
  const elvenMageTexture = elvenMageSprite.slice(
    elvenMageSprite.indexOf("_"),
    elvenMageSprite.indexOf("."),
  );
  const blackSmithTexture = blackSmithSprite.slice(
    blackSmithSprite.indexOf("_"),
    blackSmithSprite.indexOf("."),
  );

  // Current player animations spritesheet has:
  // Lines 0, 1, 2, 3 -> idle_down, walk_left, walk_down, walk_up
  const frames = {
    idle_down: frameSlicer(assets[playerTexture], frameSize, 1, 0, 2),
    walk_down: frameSlicer(assets[playerTexture], frameSize, 1, 0, 2),

    idle_left: frameSlicer(assets[playerTexture], frameSize, 1, 0),
    walk_left: frameSlicer(assets[playerTexture], frameSize, 1, 0),

    idle_up: frameSlicer(assets[playerTexture], frameSize, 1, 0, 1),
    walk_up: frameSlicer(assets[playerTexture], frameSize, 1, 0, 1),

    idle_right: frameSlicer(assets[playerTexture], frameSize, 1, 0),
    walk_right: frameSlicer(assets[playerTexture], frameSize, 1, 0),

    dash_down: frameSlicer(assets[playerTexture], frameSize, 1, 0),
    dash_right: frameSlicer(assets[playerTexture], frameSize, 1, 0),
    dash_up: frameSlicer(assets[playerTexture], frameSize, 1, 0),
    dash_left: frameSlicer(assets[playerTexture], frameSize, 1, 0),
  };

  const elvenMageFrames = {
    idle_down: frameSlicer(assets[elvenMageTexture], frameSize, 1, 0),
  };
  const blacksmithFrames = {
    idle_down: frameSlicer(assets[blackSmithTexture], frameSize, 1, 0),
  };

  const daggerVFXFrames = {
    attack_up: frameSlicer(assets["_sword_slash"], 81, 7, 1),
    attack_down: frameSlicer(assets["_sword_slash"], 81, 7, 1),

    attack_right: frameSlicer(assets["_sword_slash"], 81, 7, 0),
    attack_left: frameSlicer(assets["_sword_slash"], 81, 7, 0),
  };

  const enemyFrames = {
    idle_down: frameSlicer(assets["_gobling-mace-shield"], frameSize, 1, 0),
    idle_left: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    idle_up: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    idle_right: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    walk_down: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    walk_right: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    walk_up: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
    walk_left: frameSlicer(assets["_goblin-mace-shield"], frameSize, 1, 0),
  };

  const player: Player = new Player(frames, daggerVFXFrames);
  // const elvenMage: Player = new Player(elvenMageFrames, daggerVFXFrames);
  const elvenMage: NPC = new NPC(elvenMageFrames);
  elvenMage.container.position.x = 470;
  elvenMage.container.position.y = 752;
  const blacksmith: Player = new Player(blacksmithFrames, daggerVFXFrames);
  blacksmith.container.position.x = 410;
  blacksmith.container.position.y = 280;

  // Enemy spawns
  const enemy_01 = new Enemy(enemyFrames, player, daggerVFXFrames);
  enemy_01.container.x = 1200;
  enemy_01.container.y = 520;
  const enemy_02 = new Enemy(enemyFrames, player, daggerVFXFrames);
  enemy_02.container.x = 1000;
  enemy_02.container.y = 1000;
  const enemy_03 = new Enemy(enemyFrames, player, daggerVFXFrames);
  enemy_03.container.x = 1000;
  enemy_03.container.y = 512;
  const ranged_enemy_01 = new Enemy(enemyFrames, player, daggerVFXFrames);
  ranged_enemy_01.container.x = 750;
  ranged_enemy_01.container.y = 312;

  const map: Sprite = new Sprite(
    new Texture({
      source: assets["_map"],
      frame: new Rectangle(0, 0, 1024, 1024),
    }),
  );
  map.texture.source.scaleMode = "nearest";

  player.container.position.x = map.width / 2;
  player.container.position.y = map.height / 2;

  const testMap = generateTestMap(
    frameSlicer(assets["_training-tiles"], 32, 3, 0),
    32,
    32,
    2048,
    2048,
  );

  const fountain: Sprite = new Sprite(
    new Texture({
      source: assets["_fountain"],
      frame: new Rectangle(0, 0, 84, 71),
    }),
  );

  fountain.position.x = 250;
  fountain.position.y = 200;

  const tree: Sprite = new Sprite(
    new Texture({
      source: assets["_tree"],
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );

  tree.position.x = 1000;
  tree.position.y = 350;

  const camera = new Camera(game, testMap, player);

  const enemiesList: Enemy[] = [];

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world);
  // world.addChild(map);
  world.addChild(testMap);
  world.addChild(enemy_01.container);
  world.addChild(enemy_02.container);
  world.addChild(enemy_03.container);
  world.addChild(ranged_enemy_01.container);
  // world.addChild(fountain);
  world.addChild(tree);
  world.addChild(elvenMage.container);
  world.addChild(blacksmith.container);
  world.addChild(player.container);
  // world.addChild(...walls.map((wall) => wall.container));

  enemiesList.push(enemy_01, enemy_02, enemy_03, ranged_enemy_01);

  const commandMapper: InputCommandMapper = new InputCommandMapper(player);
  const input = InputManager.get();

  let step: number = 0;

  const healthHUD = document.createElement("span");
  const magicHUD = document.createElement("span");

  generateHUD(magicHUD);
  generateHUD(healthHUD);

  magicHUD.style.left = "18rem";
  magicHUD.innerText = `MP: ${20} / ${20}`;

  navigator.getGamepads();

  game.ticker.add((ticker) => {
    step += ticker.deltaMS;

    Time.update(ticker.deltaMS);

    healthHUD.innerText = `HP: ${player.currentHP} / ${player.maxHP}`;

    while (step >= Constants.FIXED_TIMESTEP) {
      updateGame(Constants.FIXED_TIMESTEP);
      step -= Constants.FIXED_TIMESTEP;
    }
  });

  function updateGame(deltaMS: number) {
    input.poll();

    if (input.isPressed("ATTACK")) commandMapper.get("ATTACK")?.execute(deltaMS);
    if (input.wasJustPressed("DASH")) commandMapper.get("DASH")?.execute(deltaMS);

    player.update(deltaMS);

    enemiesList.forEach((enemy) => enemy.update(deltaMS));
    elvenMage.update();
    camera.update();

    input.commit();
    DamageNumberManager.update(deltaMS);
  }
})();

// To help speed animations during MVP
// TODO: Refactor this to accept bigger animations starting
// from the columns > 0
function frameSlicer(
  s: TextureSource<any>,
  frameSize: number,
  frameCount: number,
  startRow: number,
  startColumn: number = 0,
): Texture[] {
  const frames: Texture[] = [];

  if (frameCount === 1) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(startColumn * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );

    return frames;
  }

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(i * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );
  }

  return frames;
}

async function assetLoader(textures: string[]): Promise<Record<string, TextureSource>> {
  let result: Record<string, TextureSource> = {};
  for (const texture of textures) {
    const newTexture: Texture = await Assets.load(texture);
    const source = newTexture.source;
    source.scaleMode = "nearest";

    result = { ...result, [texture.slice(texture.indexOf("_")).replace(".png", "")]: source };
  }

  return result;
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

function generateHUD(elem: HTMLElement) {
  elem.style.fontFamily = "Arial";
  // elem.style.color = "silver";
  elem.style.fontSize = "2rem";
  elem.style.fontWeight = "700";
  elem.style.position = "absolute";
  elem.style.top = "1rem";
  elem.style.left = "1rem";

  document.body.prepend(elem);
}

export async function loadAllTextures() {
  const modules: Record<string, any> = import.meta.glob("@assets/sprites/**/*.png", {
    eager: true,
    import: "default",
  });

  const textures = new Map<string, Texture>();

  for (const path in modules) {
    const name: string = path.replace("/src/assets/", "").replace(".png", "");
    const url: string = modules[path];

    const texture = await Assets.load(url);
    texture.source.scaleMode = "nearest";
    textures.set(name, texture);
  }
}

await loadAllTextures();
