import { Application, Assets, Container, Texture, Rectangle } from "pixi.js";
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

  const entities: Container = new Container();
  game.stage.addChild(entities);

  const playerTexture = await Assets.load(player_01);
  const source = playerTexture.source;
  source.scaleMode = "nearest";

  const frames = {
    // idle
    idle_down: new Texture({ source, frame: new Rectangle(0, 0, 32, 32) }),
    idle_up: new Texture({ source, frame: new Rectangle(32, 0, 32, 32) }),
    idle_left: new Texture({ source, frame: new Rectangle(64, 0, 32, 32) }),
    idle_right: new Texture({ source, frame: new Rectangle(64, 0, 32, 32) }),

    // walk (temp, reutiliza)
    walk_down: new Texture({ source, frame: new Rectangle(0, 0, 32, 32) }),
    walk_down_left: new Texture({ source, frame: new Rectangle(0, 0, 32, 32) }),
    walk_down_right: new Texture({ source, frame: new Rectangle(0, 0, 32, 32) }),
    walk_up: new Texture({ source, frame: new Rectangle(32, 0, 32, 32) }),
    walk_up_left: new Texture({ source, frame: new Rectangle(32, 0, 32, 32) }),
    walk_up_right: new Texture({ source, frame: new Rectangle(32, 0, 32, 32) }),
    walk_left: new Texture({ source, frame: new Rectangle(64, 0, 32, 32) }),
    walk_right: new Texture({ source, frame: new Rectangle(64, 0, 32, 32) }),
  };
  const player: Player = new Player(frames);
  player.container.x = game.screen.width / 2;
  player.container.y = game.screen.height / 2;
  player.addTo(entities);

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);
  });
})();
