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

  const frames = {
    idle_down: frameSlicer(source, frameSize, 5, 0, true, 4, 14),
    walk_down: frameSlicer(source, frameSize, 4, 2),

    idle_up: frameSlicer(source, frameSize, 1, 3),
    walk_up: frameSlicer(source, frameSize, 4, 3),

    idle_left: frameSlicer(source, frameSize, 1, 1),
    walk_left: frameSlicer(source, frameSize, 4, 1),

    idle_right: frameSlicer(source, frameSize, 1, 1),
    walk_right: frameSlicer(source, frameSize, 4, 1),
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
  startLine: number,
  repeat: boolean = false,
  frameToRepeat: number = 0,
  timesToRepeat: number = 0
): Texture[] {
  const frames: Texture[] = [];

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(i * frameSize, startLine * frameSize, frameSize, frameSize),
      })
    );

    if (repeat && i === frameToRepeat) {
      for (let j = 0; j <= timesToRepeat; j++) {
        frames.push(
          new Texture({
            source: s,
            frame: new Rectangle(
              frameToRepeat * frameSize,
              startLine * frameSize,
              frameSize,
              frameSize
            ),
          })
        );
      }
    }
  }

  return frames;
}
