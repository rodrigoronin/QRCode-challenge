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
  const interactionSystem = new InteractionSystem();

  const scene = new MainScene(assets);
  const commandMapper: InputCommandMapper = new InputCommandMapper(scene.player, interactionSystem);
  const input = InputManager.get();
  const overlay = new GameOverlay();

  const camera = new Camera(game, scene.map, scene.player);

  const world: Container = new Container();
  const worldVFX: Container = new Container();

  // CONTAINER HIERARCHY
  game.stage.addChild(camera.container);
  camera.container.addChild(world, worldVFX);
  scene.mount(world);
  scene.registerInteractions(interactionSystem);

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

    overlay.update(interactionSystem, scene.player);

    // DAMAGE NUMBERS
    DamageNumberSystem.update(ticker.deltaMS);

    // FIXED UPDATE
    while (step >= Constants.FIXED_TIMESTEP) {
      updateGame(Constants.FIXED_TIMESTEP);
      input.commit();
      step -= Constants.FIXED_TIMESTEP;
    }
  });

  function updateGame(deltaMS: number) {
    scene.update(deltaMS);
    camera.update();
  }
})();
