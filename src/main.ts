import { Application, Assets, Container, Texture, Rectangle, TextureSource } from "pixi.js";
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
    resizeTo: window,
  });
  document.body.appendChild(game.canvas);

  const entities: Container = new Container();
  game.stage.addChild(entities);

  const playerTexture = await Assets.load(player_01);
  const source = playerTexture.source;
  source.scaleMode = "nearest";

  const frameSize: number = 32;

  // Current player animations spritesheet has:
  // Lines 0, 1, 2, 3 -> idle_down, walk_left, walk_down, walk_up
  const frames = {
    idle_down: frameSlicer(source, frameSize, 5, 0),
    walk_down: frameSlicer(source, frameSize, 4, 2),

    idle_up: frameSlicer(source, frameSize, 1, 3),
    walk_up: frameSlicer(source, frameSize, 4, 3),

    idle_left: frameSlicer(source, frameSize, 1, 1),
    walk_left: frameSlicer(source, frameSize, 4, 1),

    idle_right: frameSlicer(source, frameSize, 1, 4),
    walk_right: frameSlicer(source, frameSize, 4, 4),
  };

  const player: Player = new Player(frames);
  player.container.x = game.screen.width / 2;
  player.container.y = game.screen.height / 2;
  player.addTo(entities);

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);
  });
})();

// to help speed animations during MVP
function frameSlicer(
  s: TextureSource<any>,
  frameSize: number,
  frameCount: number,
  startLine: number
): Texture[] {
  const frames: Texture[] = [];

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(i * frameSize, startLine * frameSize, frameSize, frameSize),
      })
    );
  }

  return frames;
}
