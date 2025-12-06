import { Application, Assets, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { Player } from "./entities/Player";
import { WorldCollider } from "./core/WordlCollider";
import * as Constants from "./utils/Constants";

import "./style.css";

// Assets
import player_01 from "./assets/placeholder_player_01.png";
import mockup_map from "./assets/map_1024x1024.png";

(async () => {
  const game: Application = new Application();
  await game.init({
    width: Constants.VIEWPORT_WIDTH,
    height: Constants.VIEWPORT_HEIGHT,
    background: "#d2d2d2",
    // resizeTo: window,
  });
  document.body.appendChild(game.canvas);

  const world: Container = new Container();
  const camera: Container = new Container();

  const mapTexture = await assetLoader(mockup_map);
  const playerTexture = await assetLoader(player_01);

  const frameSize: number = 32;

  // Current player animations spritesheet has:
  // Lines 0, 1, 2, 3 -> idle_down, walk_left, walk_down, walk_up
  const frames = {
    idle_down: frameSlicer(playerTexture, frameSize, 5, 0),
    walk_down: frameSlicer(playerTexture, frameSize, 4, 2),

    idle_up: frameSlicer(playerTexture, frameSize, 1, 3),
    walk_up: frameSlicer(playerTexture, frameSize, 4, 3),

    idle_left: frameSlicer(playerTexture, frameSize, 1, 1),
    walk_left: frameSlicer(playerTexture, frameSize, 4, 1),

    idle_right: frameSlicer(playerTexture, frameSize, 1, 4),
    walk_right: frameSlicer(playerTexture, frameSize, 4, 4),
  };

  const player: Player = new Player(frames);
  player.container.x = 512;
  player.container.y = 512;

  const map: Sprite = new Sprite(
    new Texture({
      source: mapTexture,
      frame: new Rectangle(0, 0, 1024, 1024),
    })
  );

  const walls = createWalls(4, [
    {
      x: 789,
      y: 320,
      width: 28,
      height: 16,
    },
    {
      x: 755,
      y: 355,
      width: 12,
      height: 12,
    },
    {
      x: 320,
      y: 355,
      width: 28,
      height: 16,
    },
    {
      x: 388,
      y: 388,
      width: 12,
      height: 12,
    },
  ]);

  player.setWorldColliders(walls);

  game.stage.addChild(camera);
  camera.addChild(world);
  world.addChild(map, player.container);
  world.addChild(...walls.map((wall) => wall.container));

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);

    camera.x = -player.container.x + Constants.VIEWPORT_WIDTH / 2;
    camera.y = -player.container.y + Constants.VIEWPORT_HEIGHT / 2;
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

async function assetLoader(texture: any): Promise<TextureSource<any>> {
  const newTexture = await Assets.load(texture);
  const source = newTexture.source;
  source.scaleMode = "nearest";

  return source;
}

function createWalls(
  amount: number,
  transform: { x: number; y: number; width: number; height: number }[]
) {
  const wallList: WorldCollider[] = [];

  for (let i = 0; i < amount; i++) {
    wallList.push(
      new WorldCollider({
        posX: transform[i]?.x,
        posY: transform[i]?.y,
        width: transform[i].width * Constants.SCALE_FACTOR,
        height: transform[i].height * Constants.SCALE_FACTOR,
      })
    );
  }

  return wallList;
}
