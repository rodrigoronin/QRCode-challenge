import { Application, Assets, Container, Texture, Rectangle, Sprite } from "pixi.js";
import "./style.css";

// Assets
import player_01 from "./assets/placeholder_player_01.png";

(async () => {
  const game: Application = new Application();
  await game.init({
    background: "#d2d2d2",
    resizeTo: window,
  });

  document.body.appendChild(game.canvas);

  console.log("Game is running");

  const entities: Container = new Container();
  const playerTexture = await Assets.load(player_01);
  playerTexture.source.scaleMode = "nearest";
  playerTexture.source.style.magFilter = "nearest";
  playerTexture.source.style.minFilter = "nearest";
  const frame: Texture = new Texture({
    source: playerTexture.source,
    frame: new Rectangle(0, 0, 32, 32),
  });

  const player: Sprite = new Sprite(frame);
  player.anchor.set(0.5);
  player.x = game.screen.width / 2;
  player.y = game.screen.height / 2;

  entities.addChild(player);

  game.stage.addChild(entities);
})();
