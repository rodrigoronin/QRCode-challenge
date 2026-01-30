import { Container, Graphics } from "pixi.js";
import * as Constants from "../utils/Constants";

interface WorldColliderProps {
  posX: number;
  posY: number;
  width: number;
  height: number;
}

export class WorldCollider {
  private width: number;
  private height: number;
  private debugGraphics: Graphics;
  public container: Container;

  constructor({ posX, posY, width, height }: WorldColliderProps) {
    this.width = width;
    this.height = height;

    this.container = new Container();
    this.container.x = posX;
    this.container.y = posY;

    this.debugGraphics = new Graphics();

    this.container.addChild(this.debugGraphics);
    this.drawDebug();
  }

  getBounds() {
    return {
      x: this.container.x,
      y: this.container.y,
      width: this.width,
      height: this.height,
    };
  }

  drawDebug() {
    this.debugGraphics.clear();
    this.debugGraphics
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0x00aaff, alpha: 0.2 })
      .stroke({ width: 1, color: 0x00aaff });
  }
}
