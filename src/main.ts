import { Application, Container } from "pixi.js";
import { AssetLoader } from "@core/AssetLoader";
import { GameOverlay } from "@core/GameOverlay";
import { InputCommandMapper } from "@input/InputCommandMapper";
import { InputManager } from "@input/InputManager";
import * as Constants from "@utils/Constants";
import { Time } from "@core/Time";
import { Camera } from "./core/Camera";
import { InteractionSystem } from "@core/systems/InteractionSystem";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";
import { MainScene } from "./game/scenes/MainScene";

import "./style.css";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import { SceneManager } from "@core/systems/SceneManager";
import { createMainArea } from "./game/areas/Town";
import { createDungeonArea } from "./game/areas/DungeonArea";

async function init() {
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
  const interactionSystem = new InteractionSystem();

  const playerTexture = assets.getTexture("sprites/mage");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const frameSize = 64;

  const frames = {
    idle_down: frameSlicer(playerTexture, frameSize, 1, 1, 0),
    walk_down: frameSlicer(playerTexture, frameSize, 1, 1, 0),

    idle_right: frameSlicer(playerTexture, frameSize, 1, 0),
    walk_right: frameSlicer(playerTexture, frameSize, 8, 0, 1),

    idle_left: frameSlicer(playerTexture, frameSize, 1, 0),
    walk_left: frameSlicer(playerTexture, frameSize, 8, 0, 1),

    idle_up: frameSlicer(playerTexture, frameSize, 1, 2, 0),
    walk_up: frameSlicer(playerTexture, frameSize, 1, 2, 0),

    dash_down: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_right: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_up: frameSlicer(playerTexture, frameSize, 1, 0),
    dash_left: frameSlicer(playerTexture, frameSize, 1, 0),
  };
  const vfxFrames = {
    attack_up: frameSlicer(swordSlashTexture, 81, 7, 1),
    attack_down: frameSlicer(swordSlashTexture, 81, 7, 1),

    attack_right: frameSlicer(swordSlashTexture, 81, 7, 0),
    attack_left: frameSlicer(swordSlashTexture, 81, 7, 0),
  };

  const player = new Player(frames, vfxFrames);

  const commandMapper: InputCommandMapper = new InputCommandMapper(player, interactionSystem);
  const input = InputManager.get();
  const overlay = new GameOverlay();

  const world: Container = new Container();
  const worldVFX: Container = new Container();
  const mainArea = createMainArea({ assets, player });
  const camera = new Camera(game, mainArea.map, player);
  const sceneManager = new SceneManager(world, interactionSystem, camera);
  const requestSceneChange = sceneManager.requestSceneChange.bind(sceneManager);
  const scene = new MainScene(mainArea, player, requestSceneChange);

  sceneManager.registerSceneFactory(
    "main",
    () => new MainScene(createMainArea({ assets, player }), player, requestSceneChange),
  );
  sceneManager.registerSceneFactory(
    "dungeon",
    () => new MainScene(createDungeonArea({ assets, player }), player, requestSceneChange),
  );

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world, worldVFX);
  sceneManager.changeScene(scene);

  DamageNumberSystem.initialize(worldVFX);

  let step: number = 0;

  navigator.getGamepads();

  game.ticker.add((ticker) => {
    input.poll();

    step += ticker.deltaMS;

    Time.update(ticker.deltaMS);

    if (input.isPressed("ATTACK")) commandMapper.get("ATTACK")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("DASH")) commandMapper.get("DASH")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("INTERACT")) commandMapper.get("INTERACT")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("DEBUG_MODE"))
      commandMapper.get("DEBUG_MODE")?.execute(ticker.deltaMS);

    overlay.update(interactionSystem, player);

    // DAMAGE NUMBERS
    DamageNumberSystem.update(ticker.deltaMS);

    // FIXED UPDATE
    while (step >= Constants.FIXED_TIMESTEP) {
      updateGame(Constants.FIXED_TIMESTEP);
      step -= Constants.FIXED_TIMESTEP;
    }

    input.commit();
  });

  function updateGame(deltaMS: number) {
    sceneManager.update(deltaMS);
    camera.update();
  }
}

await init();
