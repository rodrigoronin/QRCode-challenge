import { Application, Assets, Container, Texture, Rectangle, Sprite } from "pixi.js";
import { InputManager, InputAction } from "./core/input/InputManager";
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
  const input = new InputManager();
  document.body.appendChild(game.canvas);

  const entities: Container = new Container();

  const playerTexture = await Assets.load(player_01);
  playerTexture.source.style.magFilter = "nearest";
  playerTexture.source.style.minFilter = "nearest";
  const frame: Texture = new Texture({
    source: playerTexture.source,
    frame: new Rectangle(0, 0, 32, 32),
  });

  const player: Sprite = new Sprite(frame);
  player.anchor.set(0.5);
  player.scale.set(2);
  player.x = game.screen.width / 2;
  player.y = game.screen.height / 2;

  function updatePlayer(deltaTime: number): void {
    const speed: number = 200;
    let vx: number = 0;
    let vy: number = 0;

    if (input.isPressed(InputAction.Up)) vy -= 1;
    if (input.isPressed(InputAction.Down)) vy += 1;
    if (input.isPressed(InputAction.Left)) vx -= 1;
    if (input.isPressed(InputAction.Right)) vx += 1;

    const magnitude: number = Math.hypot(vx, vy);
    if (magnitude > 0) {
      vx = (vx / magnitude) * speed;
      vy = (vy / magnitude) * speed;
    }

    player.x += (vx * deltaTime) / 1000;
    player.y += (vy * deltaTime) / 1000;

    console.log(player.x);
  }

  entities.addChild(player);

  game.stage.addChild(entities);

  game.ticker.add((ticker) => {
    updatePlayer(ticker.deltaMS);
  });
})();
