import { Application, Assets, Container, Texture, Rectangle } from "pixi.js";
import { InputManager } from "./input/InputManager";
import { Player } from "./entities/Player";

import "./style.css";

// Assets
import player_01 from "./assets/placeholder_player_01.png";

(async () => {
  const game: Application = new Application();
  await game.init({
    width: 1280,
    height: 720,
    background: "#d2d2d2",
    // resizeTo: window,
  });
  document.body.appendChild(game.canvas);

  const input: InputManager = new InputManager();
  const entities: Container = new Container();
  game.stage.addChild(entities);

  const playerTexture = await Assets.load(player_01);
  const source = playerTexture.source;

  const frames = {
    down: new Texture({
      source,
      frame: new Rectangle(0, 0, 32, 32),
    }),
    up: new Texture({
      source,
      frame: new Rectangle(32, 0, 32, 32),
    }),
    left: new Texture({
      source,
      frame: new Rectangle(64, 0, 32, 32),
    }),
  };

  const player: Player = new Player(frames, input);
  player.container.x = game.screen.width / 2;
  player.container.y = game.screen.height / 2;
  player.addTo(entities);

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);
  });
})();
