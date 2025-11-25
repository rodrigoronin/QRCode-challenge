import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager, InputAction } from "../input/InputManager";

const Direction = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
};

type Direction = (typeof Direction)[keyof typeof Direction];

export class Player extends Entity {
  private sprite: Sprite;
  private speed = 200;
  private input: InputManager;

  private direction: Direction = Direction.Down;
  private frames: Record<Direction, Texture>;

  constructor(frames: Record<Direction, Texture>, input: InputManager) {
    super();

    this.input = input;
    this.frames = frames;

    this.sprite = new Sprite(this.frames[Direction.Down]);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(2);

    this.container.addChild(this.sprite);
  }

  public get getSpeed(): number {
    return this.speed;
  }
  public set setSpeed(v: number) {
    this.speed = v;
  }

  update(deltaTime: number) {
    const dt = deltaTime / 1000;
    this.move(dt);
  }

  move(deltaTime: number): void {
    let vx: number = 0;
    let vy: number = 0;

    if (this.input.isPressed(InputAction.Up)) vy -= 1;
    if (this.input.isPressed(InputAction.Down)) vy += 1;
    if (this.input.isPressed(InputAction.Left)) vx -= 1;
    if (this.input.isPressed(InputAction.Right)) vx += 1;

    const magnitude: number = Math.hypot(vx, vy);
    if (magnitude > 0) {
      vx = (vx / magnitude) * this.speed;
      vy = (vy / magnitude) * this.speed;

      // determines dominant direction
      if (Math.abs(vx) > Math.abs(vy)) {
        this.direction = vx > 0 ? Direction.Right : Direction.Left;
      } else {
        this.direction = vy > 0 ? Direction.Down : Direction.Up;
      }

      this.updateFrame();
    }

    this.container.x += vx * deltaTime;
    this.container.y += vy * deltaTime;
  }

  private updateFrame() {
    this.sprite.texture = this.frames[this.direction];

    // flip horizontal frame
    if (this.direction === Direction.Right) {
      this.sprite.scale.x = -2;
    } else this.sprite.scale.x = 2;
  }
}
