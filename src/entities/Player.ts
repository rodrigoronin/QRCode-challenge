// src/entities/Player.ts (versão corrigida e testada)
import { Sprite, Texture } from "pixi.js";
import { Entity } from "../core/Entity"; // ajusta o caminho conforme tua estrutura
import { InputManager } from "../input/InputManager"; // ajusta o caminho

type Direction8 =
  | "down"
  | "down_left"
  | "down_right"
  | "left"
  | "right"
  | "up"
  | "up_left"
  | "up_right";

export class Player extends Entity {
  private sprite: Sprite;
  private speed = 180; // pixels/segundo
  private input = InputManager.get();
  private currentDir: Direction8 = "down";
  private frames: Record<string, Texture>;

  constructor(frames: Record<string, Texture>) {
    super();
    this.frames = frames;
    this.sprite = new Sprite(this.frames.walk_down);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(3); // y positivo pra garantir
    this.container.addChild(this.sprite);
  }

  update(deltaTime: number) {
    const deltaSec = deltaTime / 1000;
    const move = this.input.getMovementVector();

    // movimento
    this.container.x += move.x * this.speed * deltaSec;
    this.container.y += move.y * this.speed * deltaSec;

    // animação/direção
    if (move.x !== 0 || move.y !== 0) {
      this.updateDirection(move.x, move.y);
      this.sprite.texture = this.frames[`walk_${this.currentDir}`] ?? this.frames.walk_down;
    } else {
      this.sprite.texture = this.frames[`idle_${this.currentDir}`] ?? this.frames.idle_down;
    }

    console.log(this.currentDir); // pra debug
  }

  private updateDirection(x: number, y: number) {
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360; // 0-360, 0= right, 90=down, 180=left, 270=up

    if (angle < 22.5 || angle >= 337.5) this.currentDir = "right";
    else if (angle < 67.5) this.currentDir = "down_right";
    else if (angle < 112.5) this.currentDir = "down";
    else if (angle < 157.5) this.currentDir = "down_left";
    else if (angle < 202.5) this.currentDir = "left";
    else if (angle < 247.5) this.currentDir = "up_left";
    else if (angle < 292.5) this.currentDir = "up";
    else this.currentDir = "up_right";

    // flip horizontal pros lados esquerdo
    this.sprite.scale.x = this.currentDir.includes("left") ? 3 : -3;
  }
}
