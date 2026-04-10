import { Application, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { AssetLoader } from "@core/AssetLoader";
import { Player } from "@entities/Player";
import { Enemy } from "@entities/Enemy";
import { InputCommandMapper } from "@input/InputCommandMapper";
import { InputManager } from "@input/InputManager";
import * as Constants from "@utils/Constants";
import { Time } from "@core/Time";
import { Camera } from "./core/Camera";
import { InteractionSystem } from "@core/systems/InteractionSystem";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";
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
  const interactionSystem = new InteractionSystem();

  await assets.init();

  const playerTexture = assets.getTexture("sprites/mage");
  const elvenMageTexture = assets.getTexture("sprites/elven_mage");
  const blackSmithTexture = assets.getTexture("sprites/blacksmith");
  const swordSlash = assets.getTexture("sprites/_sword_slash");
  const goblinMaceShield = assets.getTexture("sprites/goblin-mace-shield");
  const trainingMapTexture = assets.getTexture("sprites/training-tiles");
  const fountainTexture = assets.getTexture("sprites/fountain");
  const treeTexture = assets.getTexture("sprites/tree");
  const houseTexture = assets.getTexture("sprites/house");

  const frameSize: number = 64;

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
  player.container.position.x = 210;
  player.container.position.y = 380;
  const elvenMage: NPC = new NPC(elvenMageFrames);
  elvenMage.setTag("Elven Mage");
  elvenMage.container.position.x = 150;
  elvenMage.container.position.y = 270;
  const blacksmith: NPC = new NPC(blacksmithFrames);
  blacksmith.setTag("Blacksmith");
  blacksmith.container.position.x = 270;
  blacksmith.container.position.y = 270;

  interactionSystem.register(elvenMage.interactable);
  interactionSystem.register(blacksmith.interactable);

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

  const trainingMap = generateTestMap(
    frameSlicer(trainingMapTexture, 32, 3, 0),
    32,
    32,
    2048,
    2048,
  );

  const fountain: Sprite = new Sprite(
    new Texture({
      source: fountainTexture.source,
      frame: new Rectangle(0, 0, 84, 71),
    }),
  );

  fountain.position.x = 167;
  fountain.position.y = 310;

  const tree: Sprite = new Sprite(
    new Texture({
      source: treeTexture.source,
      frame: new Rectangle(0, 0, 103, 140),
    }),
  );

  tree.position.x = 1000;
  tree.position.y = 350;

  const house: Sprite = new Sprite(
    new Texture({
      source: houseTexture.source,
      frame: new Rectangle(0, 0, 218, 177),
    }),
  );

  house.position.x = 100;
  house.position.y = 100;

  const camera = new Camera(game, trainingMap, player);

  const enemiesList: Enemy[] = [];

  const world: Container = new Container();
  const worldVFX: Container = new Container();

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world, worldVFX);
  world.addChild(
    trainingMap,
    ranged_enemy_01.container,
    tree,
    house,
    elvenMage.container,
    blacksmith.container,
    fountain,
    enemy_01.container,
    enemy_02.container,
    enemy_03.container,
    player.container,
  );

  DamageNumberSystem.initialize(worldVFX);

  enemiesList.push(enemy_01, enemy_02, enemy_03, ranged_enemy_01);

  const commandMapper: InputCommandMapper = new InputCommandMapper(player, interactionSystem);
  const input = InputManager.get();

  let step: number = 0;

  // TODO: refactor this later to add a proper HUD manager
  const healthHUD = generateHUD("div");
  const healthBar = healthHUD.firstElementChild as HTMLElement;
  const healthBarText = healthHUD.lastElementChild as HTMLElement;
  healthBar.style.backgroundColor = "green";
  healthBar.style.color = "green";
  healthBar.textContent = ".";

  const magicHUD = generateHUD("div");
  magicHUD.style.left = "16rem";
  const manaBar: HTMLElement = magicHUD.firstElementChild as HTMLElement;
  const manaBarText: HTMLElement = magicHUD.lastElementChild as HTMLElement;
  manaBar.style.backgroundColor = "RoyalBlue";
  manaBar.style.color = "RoyalBlue";
  manaBar.textContent = `.`;

  const interactionHint = document.createElement("div");
  generateInteractionHint(interactionHint);

  navigator.getGamepads();

  game.ticker.add((ticker) => {
    input.poll();

    step += ticker.deltaMS;

    Time.update(ticker.deltaMS);

    if (input.isPressed("ATTACK")) commandMapper.get("ATTACK")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("DASH")) commandMapper.get("DASH")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("INTERACT")) commandMapper.get("INTERACT")?.execute(ticker.deltaMS);

    // HUD
    const healthPercentage = player.currentHP / player.maxHP;

    healthBarText.textContent = `${player.currentHP} / ${player.maxHP}`;
    healthBar.style.width = `${healthPercentage * 192 - 6}px`;

    manaBarText.textContent = `${20} / ${20}`;

    DamageNumberSystem.update(ticker.deltaMS);

    updateInteractionHint();

    // FIXED UPDATE
    while (step >= Constants.FIXED_TIMESTEP) {
      updateGame(Constants.FIXED_TIMESTEP);
      input.commit();
      step -= Constants.FIXED_TIMESTEP;
    }
  });

  function updateGame(deltaMS: number) {
    player.update(deltaMS);

    enemiesList.forEach((enemy) => enemy.update(deltaMS));
    elvenMage.update();
    blacksmith.update();
    camera.update();
  }

  function updateInteractionHint() {
    const interactable = interactionSystem.getBestInRange(player);

    if (!interactable) {
      interactionHint.style.display = "none";
      return;
    }

    interactionHint.innerText = `Press B to ${interactable.interactionText}`;
    interactionHint.style.display = "block";
  }
})();

// To help speed animations during MVP
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

  // TODO: add validations when frameCount > texture total frames
  for (let i = startColumn; i < startColumn + frameCount; i++) {
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

// TODO: refactor this later to add a proper HUD manager
function generateHUD(type: string): HTMLElement {
  const elem: HTMLElement = document.createElement(type);
  elem.style.fontFamily = "Arial";
  elem.style.color = "black";
  elem.style.width = "192px";
  elem.style.fontSize = "1.5rem";
  elem.style.fontWeight = "700";
  elem.style.position = "absolute";
  elem.style.top = "1rem";
  elem.style.left = "1rem";
  elem.style.border = "3px solid rgba(0,0,0,0.75)";
  elem.style.borderTopRightRadius = "8px";
  elem.style.borderBottomLeftRadius = "8px";

  const bar = document.createElement("div");
  bar.style.position = "relative";
  bar.style.width = "calc(192 - 6)px";
  bar.style.borderTopRightRadius = "4px";
  bar.style.borderBottomLeftRadius = "4px";

  const text = document.createElement("div");
  text.style.position = "absolute";
  text.style.top = "0px";
  text.style.left = "1rem";

  elem.appendChild(bar);
  elem.appendChild(text);
  document.body.prepend(elem);

  return elem;
}

function generateInteractionHint(elem: HTMLElement) {
  elem.style.fontFamily = "Arial";
  elem.style.color = "white";
  elem.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  elem.style.fontSize = "1.5rem";
  elem.style.fontWeight = "700";
  elem.style.position = "absolute";
  elem.style.left = "50%";
  elem.style.bottom = "2rem";
  elem.style.transform = "translateX(-50%)";
  elem.style.padding = "0.75rem 1rem";
  elem.style.borderRadius = "0.5rem";
  elem.style.display = "none";
  elem.style.pointerEvents = "none";

  document.body.prepend(elem);
}
