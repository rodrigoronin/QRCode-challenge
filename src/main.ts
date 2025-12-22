import { Application, Assets, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { WorldCollider } from "./core/WorldCollider";
import * as Constants from "./utils/Constants";

import "./style.css";

// Assets
import player_01 from "./assets/_player_01.png";
import mockup_map from "./assets/_map_1024x1024.png";
import map_01_colliders from "./assets/maps/mock_map_01.json";
import { CollisionManager } from "./core/CollisionManager";

(async () => {
  const game: Application = new Application();
  await game.init({
    width: Constants.VIEWPORT_WIDTH,
    height: Constants.VIEWPORT_HEIGHT,
    background: "#d2d2d2",
    // resizeTo: window,
    resolution: 16 / 9,
  });
  document.body.appendChild(game.canvas);

  const assets = await assetLoader([player_01, mockup_map]);

  const world: Container = new Container();
  const camera: Container = new Container();

  const frameSize: number = 32;

  // Current player animations spritesheet has:
  // Lines 0, 1, 2, 3 -> idle_down, walk_left, walk_down, walk_up
  const frames = {
    idle_down: frameSlicer(assets["_player_01"], frameSize, 5, 0),
    walk_down: frameSlicer(assets["_player_01"], frameSize, 4, 2),

    idle_up: frameSlicer(assets["_player_01"], frameSize, 1, 3),
    walk_up: frameSlicer(assets["_player_01"], frameSize, 4, 3),

    idle_left: frameSlicer(assets["_player_01"], frameSize, 1, 1),
    walk_left: frameSlicer(assets["_player_01"], frameSize, 4, 1),

    idle_right: frameSlicer(assets["_player_01"], frameSize, 1, 4),
    walk_right: frameSlicer(assets["_player_01"], frameSize, 4, 4),

    dash_down: frameSlicer(assets["_player_01"], frameSize, 5, 5),
    dash_left: frameSlicer(assets["_player_01"], frameSize, 1, 6),
    dash_right: frameSlicer(assets["_player_01"], frameSize, 1, 7),
    dash_up: frameSlicer(assets["_player_01"], frameSize, 1, 8),
  };

  const player: Player = new Player(frames);
  player.container.x = 512;
  player.container.y = 512;

  // Enemy prototype
  const enemySprite = new Sprite(frames["dash_down"][4]);
  const enemy_01 = new Enemy(enemySprite, player);
  enemy_01.container.x = 600;
  enemy_01.container.y = 512;

  const enemySprite2 = new Sprite(frames["dash_down"][4]);
  const enemy_02 = new Enemy(enemySprite2, player);
  enemy_02.container.x = 560;
  enemy_02.container.y = 582;

  const enemySprite3 = new Sprite(frames["dash_down"][4]);
  const enemy_03 = new Enemy(enemySprite3, player);
  enemy_03.container.x = 595;
  enemy_03.container.y = 582;

  const map: Sprite = new Sprite(
    new Texture({
      source: assets["_map_1024x1024"],
      frame: new Rectangle(0, 0, 1024, 1024),
    })
  );

  const colliders: { x: number; y: number; width: number; height: number }[] =
    map_01_colliders.colliders;
  const walls = createWalls(colliders);
  const enemiesList: Enemy[] = [];

  game.stage.addChild(camera);
  camera.addChild(world);
  world.addChild(map);
  world.addChild(enemy_01.container, enemy_02.container, enemy_03.container);
  world.addChild(player.container);
  world.addChild(...walls.map((wall) => wall.container));

  enemiesList.push(enemy_01, enemy_02, enemy_03);

  game.ticker.add((ticker) => {
    player.update(ticker.deltaMS);
    enemiesList.forEach((enemy) => enemy.update(ticker.deltaMS));

    const canMinX = -(map.width - Constants.VIEWPORT_WIDTH);
    const canMaxX = 0;

    camera.x = clamp(-player.container.x + Constants.VIEWPORT_WIDTH / 2, canMinX, canMaxX);

    const canMinY = -(map.height - Constants.VIEWPORT_HEIGHT);
    const canMaxY = 0;

    camera.y = clamp(-player.container.y + Constants.VIEWPORT_HEIGHT / 2, canMinY, canMaxY);
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

async function assetLoader(textures: string[]): Promise<Record<string, TextureSource>> {
  let result: Record<string, TextureSource> = {};
  for (const texture of textures) {
    const newTexture: Texture = await Assets.load(texture);
    const source = newTexture.source;
    source.scaleMode = "nearest";

    result = { ...result, [texture.slice(texture.indexOf("_")).replace(".png", "")]: source };
  }

  return result;
}

// All map geometry uses pixels base (1×). The game renders with global SCALE_FACTOR.
function createWalls(transform: { x: number; y: number; width: number; height: number }[]) {
  const wallList: WorldCollider[] = [];

  for (const col of transform) {
    const wall = new WorldCollider({
      posX: col.x,
      posY: col.y,
      width: col.width,
      height: col.height,
    });
    CollisionManager.addWorldCollider(wall);
    wallList.push(wall);
  }

  return wallList;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
