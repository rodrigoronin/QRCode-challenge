import { Application } from "pixi.js";
import * as Constants from "@utils/Constants";
import { Time } from "@core/Time";
import { DamageNumberSystem } from "@fx/DamageNumberSystem";

import "./style.css";
import { loadGame } from "./game/LoadGame";

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

  const core = await loadGame(game);
  const { input, interactionSystem, player, camera, commandMapper, sceneManager, overlay } = core;

  let step: number = 0;

  navigator.getGamepads();

  game.ticker.add((ticker) => {
    input.poll();

    step += ticker.deltaMS;

    Time.update(ticker.deltaMS);

    if (input.isPressed("ATTACK")) commandMapper.get("ATTACK")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("DASH")) commandMapper.get("DASH")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("RUN")) commandMapper.get("RUN")?.execute(ticker.deltaMS);
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
