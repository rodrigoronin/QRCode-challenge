import { Application, Assets, Container, Texture, Rectangle, TextureSource, Sprite } from "pixi.js";
import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { WorldCollider } from "./core/WorldCollider";
import { CollisionManager } from "./core/CollisionManager";
import { InputCommandMapper } from "./input/InputCommandMapper";
import { InputManager } from "./input/InputManager";
import * as Constants from "./utils/Constants";

import "./style.css";

// Assets
import player_01 from "./assets/_atlas.png";
import toxic_fly from "./assets/_toxic_fly.png";
import map_01_colliders from "./assets/maps/mock_map_01.json";
import dagger_vfx from "./assets/_VFX.png";

(async () => {
  const game: Application = new Application();
  await game.init({
    width: Constants.LOGICAL_WIDTH,
    height: Constants.LOGICAL_HEIGHT,
    background: 0x003300,
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
  });
  document.body.appendChild(game.canvas);

  const assets = await assetLoader([player_01, toxic_fly, dagger_vfx]);

  const world: Container = new Container();

  const camera: Container = new Container();

  const frameSize: number = 64;
  const newFrameSize: number = 32;

  // Current player animations spritesheet has:
  // Lines 0, 1, 2, 3 -> idle_down, walk_left, walk_down, walk_up
  const frames = {
    idle_down: frameSlicer(assets["_atlas"], newFrameSize, 1, 0),
    walk_down: frameSlicer(assets["_atlas"], newFrameSize, 4, 1),

    idle_left: frameSlicer(assets["_atlas"], newFrameSize, 1, 0, 1),
    walk_left: frameSlicer(assets["_atlas"], newFrameSize, 6, 4),

    idle_up: frameSlicer(assets["_atlas"], newFrameSize, 1, 0, 2),
    walk_up: frameSlicer(assets["_atlas"], newFrameSize, 6, 3),

    idle_right: frameSlicer(assets["_atlas"], newFrameSize, 1, 0),
    walk_right: frameSlicer(assets["_atlas"], newFrameSize, 3, 0, 1),

    dash_down: frameSlicer(assets["_atlas"], newFrameSize, 1, 5),
    dash_right: frameSlicer(assets["_atlas"], newFrameSize, 1, 6, 5),
    dash_up: frameSlicer(assets["_atlas"], newFrameSize, 1, 7),
    dash_left: frameSlicer(assets["_atlas"], newFrameSize, 1, 8, 5),
  };

  const daggerVFXFrames = {
    attack_up: frameSlicer(assets["_VFX"], frameSize, 5, 1),
    attack_down: frameSlicer(assets["_VFX"], frameSize, 5, 1),

    attack_right: frameSlicer(assets["_VFX"], frameSize, 5, 0),
    attack_left: frameSlicer(assets["_VFX"], frameSize, 5, 0),
  };

  const enemyFrames = {
    idle_down: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    idle_left: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    idle_up: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    idle_right: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    walk_down: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    walk_right: frameSlicer(assets["_toxic_fly"], frameSize, 4, 0),
    walk_up: frameSlicer(assets["_toxic_fly"], frameSize, 4, 1),
    walk_left: frameSlicer(assets["_toxic_fly"], frameSize, 4, 1),
  };

  const player: Player = new Player(frames, daggerVFXFrames);
  player.container.x = 800;
  player.container.y = 512;

  // Enemy prototype
  const enemy_01 = new Enemy(enemyFrames, player);
  enemy_01.container.x = 500;
  enemy_01.container.y = 512;
  const enemy_02 = new Enemy(enemyFrames, player);
  enemy_02.container.x = 500;
  enemy_02.container.y = 612;
  const enemy_03 = new Enemy(enemyFrames, player);
  enemy_03.container.x = 580;
  enemy_03.container.y = 512;

  const map: Sprite = new Sprite(
    new Texture({
      source: assets["_map_1024x1024"],
      frame: new Rectangle(0, 0, 1024, 1024),
    }),
  );

  const colliders: { x: number; y: number; width: number; height: number }[] =
    map_01_colliders.colliders;
  const walls = createWalls(colliders);
  const enemiesList: Enemy[] = [];

  // CONTAINER HIERARCHY
  game.stage.addChild(camera);
  camera.addChild(world);
  world.addChild(map);
  world.addChild(enemy_01.container);
  world.addChild(enemy_02.container);
  world.addChild(enemy_03.container);
  world.addChild(player.container);
  world.addChild(...walls.map((wall) => wall.container));

  enemiesList.push(enemy_01, enemy_02, enemy_03);

  const commandMapper: InputCommandMapper = new InputCommandMapper(player);
  const input = InputManager.get();

  game.ticker.add((ticker) => {
    input.poll();
    if (input.wasJustPressed("ATTACK")) commandMapper.get("ATTACK")?.execute(ticker.deltaMS);
    if (input.wasJustPressed("DASH")) commandMapper.get("DASH")?.execute(ticker.deltaMS);

    player.update(ticker.deltaMS);
    enemiesList.forEach((enemy) => enemy.update(ticker.deltaMS));

    input.commit();

    const canMinX = -map.width;
    const canMaxX = 0;

    camera.x = clamp(-player.container.x + Constants.LOGICAL_WIDTH / 2, canMinX, canMaxX);

    const canMinY = -map.height;
    const canMaxY = 0;

    camera.y = clamp(-player.container.y + Constants.LOGICAL_HEIGHT / 2, canMinY, canMaxY);
  });
})();

// To help speed animations during MVP
// TODO: Refactor this to accept bigger animations starting
// from the columns > 0
function frameSlicer(
  s: TextureSource<any>,
  frameSize: number,
  frameCount: number,
  startRow: number,
  startColumn: number = 0,
): Texture[] {
  const frames: Texture[] = [];

  if (frameCount === 1) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(startColumn * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );

    return frames;
  }

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: s,
        frame: new Rectangle(i * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
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
