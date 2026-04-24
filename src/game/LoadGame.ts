import { AssetLoader } from "@core/AssetLoader";
import { InteractionSystem } from "@core/systems/InteractionSystem";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import { Application, Container } from "pixi.js";
import { town } from "./areas/Town";
import { Camera } from "@core/Camera";
import { SceneManager } from "@core/systems/SceneManager";
import { MainScene } from "./scenes/MainScene";
import { InputCommandMapper } from "@core/input/InputCommandMapper";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";
import { createDungeonArea } from "./areas/DungeonArea";
import { InputManager } from "@core/input/InputManager";
import { GameOverlay } from "@core/GameOverlay";

export async function loadGame(game: Application) {
  const assets = new AssetLoader();
  await assets.init();
  const interactionSystem = new InteractionSystem();

  const playerTexture = assets.getTexture("sprites/mage");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const frameSize = 64;

  const frames = {
    idle_down: frameSlicer(playerTexture, frameSize, 1, 0, 1),
    walk_down: frameSlicer(playerTexture, frameSize, 1, 0, 1),

    idle_right: frameSlicer(playerTexture, frameSize, 1, 0, 2),
    walk_right: frameSlicer(playerTexture, frameSize, 8, 1),

    idle_left: frameSlicer(playerTexture, frameSize, 1, 0, 2),
    walk_left: frameSlicer(playerTexture, frameSize, 8, 1),

    idle_up: frameSlicer(playerTexture, frameSize, 1, 0, 3),
    walk_up: frameSlicer(playerTexture, frameSize, 1, 0, 3),

    run_right: frameSlicer(playerTexture, frameSize, 8, 2, 0),
    run_left: frameSlicer(playerTexture, frameSize, 8, 2, 0),

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

  const world: Container = new Container();
  const worldVFX: Container = new Container();
  const camera = new Camera(game, new Container(), player);

  const commandMapper: InputCommandMapper = new InputCommandMapper(player, interactionSystem);
  const input = InputManager.get();
  const overlay = new GameOverlay();

  // SceneMAnager Config
  const sceneManager = new SceneManager(world, interactionSystem, camera);
  const requestSceneChange = sceneManager.requestSceneChange.bind(sceneManager);

  sceneManager.registerSceneFactory(
    "town",
    () => new MainScene(town({ assets, player, requestSceneChange }), player),
  );
  sceneManager.registerSceneFactory(
    "dungeon",
    () =>
      new MainScene(createDungeonArea({ assets, player, requestSceneChange }), player),
  );

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world, worldVFX);
  sceneManager.requestSceneChange("town");

  DamageNumberSystem.initialize(worldVFX);

  return {
    player,
    input,
    commandMapper,
    interactionSystem,
    sceneManager,
    camera,
    overlay,
  };
}
