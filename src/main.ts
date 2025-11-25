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
    background: "#223222",
    // resizeTo: window,
  });
  document.body.appendChild(game.canvas);

  const input: InputManager = new InputManager();
  const entities: Container = new Container();
  game.stage.addChild(entities);

  const playerTexture = await Assets.load(player_01);
  playerTexture.source.style.magFilter = "nearest";
  playerTexture.source.style.minFilter = "nearest";
  const frame: Texture = new Texture({
    source: playerTexture.source,
    frame: new Rectangle(0, 0, 32, 32),
  });

  const player: Player = new Player(frame, input);
  player.container.x = game.screen.width / 2;
  player.container.y = game.screen.height / 2;
  player.addTo(entities);

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);
  });
})();
