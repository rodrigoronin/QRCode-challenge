import { Container, Graphics } from "pixi.js";
import type { Entity } from "./Entity";

interface WorldColliderProps {
  id: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
}

export class WorldCollider {
  public id: string;
  public isTrigger: boolean = false;
  private onTriggerEnter?: (entity: Entity) => void;
  private onTriggerExit?: (entity: Entity) => void;
  private width: number;
  private height: number;
  private debugGraphics: Graphics;
  public container: Container;

  constructor({ id, posX, posY, width, height }: WorldColliderProps) {
    this.id = id;
    this.width = width;
    this.height = height;

    this.container = new Container();
    this.container.x = posX;
    this.container.y = posY;

    this.debugGraphics = new Graphics();

    this.container.addChild(this.debugGraphics);
    // this.drawDebug();
  }

  public setTrigger(enabled = true): this {
    this.isTrigger = enabled;
    return this;
  }

  public setCallbacks(callbacks: {
    onTriggerEnter?: (entity: Entity) => void;
    onTriggerExit?: (entity: Entity) => void;
  }): WorldCollider {
    this.onTriggerEnter = callbacks.onTriggerEnter;
    this.onTriggerExit = callbacks.onTriggerExit;

    return this;
  }

  public triggerEnter(entity: Entity): void {
    this.onTriggerEnter?.(entity);
  }

  public triggerExit(entity: Entity): void {
    this.onTriggerExit?.(entity);
  }

  getBounds() {
    return {
      x: this.container.x,
      y: this.container.y,
      width: this.width,
      height: this.height,
    };
  }

  drawDebug(): void {
    this.debugGraphics.clear();
    this.debugGraphics
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0x00aaff, alpha: 0.2 })
      .stroke({ width: 1, color: 0x00aaff });
  }
}
