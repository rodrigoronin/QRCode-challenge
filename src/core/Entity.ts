import { Container, Point } from "pixi.js";
import type { DepthSortContainer, DepthSortOptions } from "./systems/YSortSystem";
import { configureDepthSort } from "./systems/YSortSystem";

export abstract class Entity {
  public container: DepthSortContainer;
  public tag: string = "entity";

  constructor(depthSortOptions: DepthSortOptions = {}) {
    this.container = new Container() as DepthSortContainer;
    configureDepthSort(this.container, depthSortOptions);
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

  public setDepthSortOffsetY(offsetY: number): void {
    this.container.depthSortOffsetY = offsetY;
  }

  public setDepthSortPriority(priority: number): void {
    this.container.depthSortPriority = priority;
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
