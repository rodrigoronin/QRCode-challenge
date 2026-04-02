import { Application, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { AssetLoader } from "@core/AssetLoader";
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

  const assets = new AssetLoader();
  await assets.init();

  const world: Container = new Container();

  const playerTexture = assets.getTexture("sprites/_wizard");
  const elvenMageTexture = assets.getTexture("sprites/elven_mage");
  const blackSmithTexture = assets.getTexture("sprites/_blacksmith");
  const swordSlash = assets.getTexture("sprites/_sword_slash");
  const goblinMaceShield = assets.getTexture("sprites/goblin-mace-shield");
  const trainingMapTexture = assets.getTexture("sprites/training-tiles");
  const fountainTexture = assets.getTexture("sprites/fountain");
  const treeTexture = assets.getTexture("sprites/tree");

  const frameSize: number = 64;

  const frames = {
    idle_down: frameSlicer(playerTexture, frameSize, 1, 0, 2),
    walk_down: frameSlicer(playerTexture, frameSize, 1, 0, 2),

    idle_left: frameSlicer(playerTexture, frameSize, 1, 0),
    walk_left: frameSlicer(playerTexture, frameSize, 1, 0),

    idle_up: frameSlicer(playerTexture, frameSize, 1, 0, 1),
    walk_up: frameSlicer(playerTexture, frameSize, 1, 0, 1),

    idle_right: frameSlicer(playerTexture, frameSize, 1, 0),
    walk_right: frameSlicer(playerTexture, frameSize, 1, 0),

    dash_down: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_right: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_up: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_left: frameSlicer(playerTexture, frameSize, 1, 0),
  };

  const elvenMageFrames = {
    idle_down: frameSlicer(elvenMageTexture, frameSize, 1, 0),
  };
  const blacksmithFrames = {
    idle_down: frameSlicer(blackSmithTexture, frameSize, 1, 0),
  };

  const daggerVFXFrames = {
    attack_up: frameSlicer(swordSlash, 81, 7, 1),
    attack_down: frameSlicer(swordSlash, 81, 7, 1),

    attack_right: frameSlicer(swordSlash, 81, 7, 0),
    attack_left: frameSlicer(swordSlash, 81, 7, 0),
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

  const player: Player = new Player(frames, daggerVFXFrames);
  player.container.position.x = 100;
  player.container.position.y = 100;
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

  const testMap = generateTestMap(frameSlicer(trainingMapTexture, 32, 3, 0), 32, 32, 2048, 2048);

  const fountain: Sprite = new Sprite(
    new Texture({
      source: fountainTexture.source,
      frame: new Rectangle(0, 0, 84, 71),
    }),
  );

  fountain.position.x = 250;
  fountain.position.y = 200;

  const tree: Sprite = new Sprite(
    new Texture({
      source: treeTexture.source,
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
  texture: Texture,
  frameSize: number,
  frameCount: number,
  startRow: number,
  startColumn: number = 0,
): Texture[] {
  const frames: Texture[] = [];

  if (frameCount === 1) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(startColumn * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );

    return frames;
  }

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(i * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );
  }

  return frames;
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
