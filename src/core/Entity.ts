import { Container } from "pixi.js";

export abstract class Entity {
  public container: Container;

  constructor() {
    this.container = new Container();
  }

  update(deltaTime: number): void {}

  addTo(parent: Container): void {
    parent.addChild(this.container);
  }

  remove() {
    this.container.destroy({ children: true });
  }
}
