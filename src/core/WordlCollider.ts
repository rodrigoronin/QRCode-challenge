import { Container, Graphics } from "pixi.js";

interface WorldColliderProps {
  posX: number;
  posY: number;
  width: number;
  height: number;
}

export class WorldCollider {
  private posX: number;
  private posY: number;
  private width: number;
  private height: number;
  private debugGraphics: Graphics;
  public container: Container;

  constructor({ posX, posY, width, height }: WorldColliderProps) {
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;

    this.container = new Container();
    this.debugGraphics = new Graphics();

    this.container.x = this.posX;
    this.container.y = this.posY;

    this.container.addChild(this.debugGraphics);
    this.drawDebug();
  }

  getBounds() {
    return {
      x: this.posX,
      y: this.posY,
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
