import { AssetLoader } from "@core/AssetLoader";
import { InteractionSystem } from "@core/systems/InteractionSystem";
import { Player } from "@entities/Player";
import { frameSlicer } from "@utils/FrameSlicer";
import { Application, Container } from "pixi.js";
import { Camera } from "@core/Camera";
import { SceneManager } from "@core/systems/SceneManager";
import { InputCommandMapper } from "@core/input/InputCommandMapper";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";
import { InputManager } from "@core/input/InputManager";
import { GameOverlay } from "@core/GameOverlay";
import { loadAllMaps } from "@core/MapLoader";
import { SceneStore } from "@core/persistence/SceneStore";

export async function loadGame(game: Application) {
  const assets = new AssetLoader();
  await assets.init();
  const interactionSystem = new InteractionSystem();

  const saveStore = new SceneStore();

  // const templateHumanMale = assets.getTexture("sprites/template-human-male");
  const humanFemaleTemplate = assets.getTexture("sprites/human-female-template");
  const movementAtlas = assets.getTexture("sprites/movement_atlas");
  const swordNShieldAtlas = assets.getTexture("sprites/sns-atlas");
  const swordSlashTexture = assets.getTexture("sprites/_sword_slash");
  const frameSize = 64;
  const frameSize96 = 96;

  const frames = {
    idle_down: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 0),
    idle_right: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 1),
    idle_left: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 1),
    idle_up: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 2),
    walk_down: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 0),
    walk_right: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 1),
    walk_left: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 1),
    walk_up: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 2),
    run_down: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 0, 0),
    run_right: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 8, 3),
    run_left: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 8, 3),
    run_up: frameSlicer(humanFemaleTemplate, frameSize96, frameSize96, 1, 0, 2),
    dash_down: frameSlicer(movementAtlas, frameSize, frameSize, 1, 2),
    dash_right: frameSlicer(movementAtlas, frameSize, frameSize, 1, 1, 3),
    dash_up: frameSlicer(movementAtlas, frameSize, frameSize, 1, 2),
    dash_left: frameSlicer(movementAtlas, frameSize, frameSize, 1, 1, 3),

    attack_right: frameSlicer(swordNShieldAtlas, 174, 128, 5, 1),
    attack_left: frameSlicer(swordNShieldAtlas, 174, 128, 5, 1),
  };
  const vfxFrames = {
    attack_up: frameSlicer(swordSlashTexture, 81, 81, 7, 1),
    attack_down: frameSlicer(swordSlashTexture, 81, 81, 7, 1),

    attack_right: frameSlicer(swordSlashTexture, 81, 81, 7, 0),
    attack_left: frameSlicer(swordSlashTexture, 81, 81, 7, 0),
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

  await loadAllMaps(sceneManager, assets, player, requestSceneChange, saveStore);

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
    saveStore,
  };
}
