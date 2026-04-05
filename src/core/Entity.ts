import { Container, Point } from "pixi.js";

export abstract class Entity {
  public container: Container;
  public tag: string = "entity";

  constructor() {
    this.container = new Container();
  }

  update(_deltaTime: number): void {}

  addTo(parent: Container): void {
    parent.addChild(this.container);
  }

  remove() {
    this.container.destroy({ children: true });
  }

  get position(): Point {
    return this.container.position;
  }

  distanceTo(other: Entity): number {
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  setTag(name: string) {
    this.tag = name;
  }
}
