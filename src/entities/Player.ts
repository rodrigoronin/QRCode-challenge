import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity";
import { InputManager, InputAction } from "../input/InputManager";

export class Player extends Entity {
  private sprite: Sprite;
  private speed = 200;
  private input: InputManager;

  constructor(texture: Texture, input: InputManager) {
    super();

    this.input = input;

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(2);

    this.container.addChild(this.sprite);
  }

  update(deltaTime: number) {
    this.move(deltaTime);
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
    }

    this.container.x += (vx * deltaTime) / 1000;
    this.container.y += (vy * deltaTime) / 1000;
  }
}
