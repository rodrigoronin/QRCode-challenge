import { AssetLoader } from "@core/AssetLoader";
import { InteractionSystem } from "@core/systems/InteractionSystem";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import { Application, Container } from "pixi.js";
import { village } from "./areas/Village";
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
  const movementAtlas = assets.getTexture("sprites/movement_atlas");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const frameSize = 64;

  const frames = {
    idle_down: frameSlicer(playerTexture, frameSize, 1, 0),
    idle_right: frameSlicer(playerTexture, frameSize, 1, 0, 1),
    idle_left: frameSlicer(playerTexture, frameSize, 1, 0, 1),
    idle_up: frameSlicer(playerTexture, frameSize, 1, 0, 2),

    walk_down: frameSlicer(movementAtlas, frameSize, 1, 2),
    walk_right: frameSlicer(movementAtlas, frameSize, 8, 0),
    walk_left: frameSlicer(movementAtlas, frameSize, 8, 0),
    walk_up: frameSlicer(movementAtlas, frameSize, 1, 2),

    run_down: frameSlicer(movementAtlas, frameSize, 8, 2, 0),
    run_right: frameSlicer(movementAtlas, frameSize, 8, 1, 0),
    run_left: frameSlicer(movementAtlas, frameSize, 8, 1, 0),
    run_up: frameSlicer(movementAtlas, frameSize, 8, 2, 0),

    dash_down: frameSlicer(movementAtlas, frameSize, 1, 2),
    dash_right: frameSlicer(movementAtlas, frameSize, 1, 1, 3),
    dash_up: frameSlicer(movementAtlas, frameSize, 1, 2),
    dash_left: frameSlicer(movementAtlas, frameSize, 1, 1, 3),
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
    "village",
    () => new MainScene(village({ assets, player, requestSceneChange }), player),
  );
  sceneManager.registerSceneFactory(
    "dungeon",
    () => new MainScene(createDungeonArea({ assets, player, requestSceneChange }), player),
  );

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world, worldVFX);
  sceneManager.requestSceneChange("village");

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
