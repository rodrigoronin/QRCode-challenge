import { Container } from "pixi.js";
import type Component from "./Component";

class GameObject {
  public container: Container;
  public components: Component[] = [];

  constructor() {
    this.container = new Container();
  }

  addComponent(component: Component) {
    this.components.push(component);
  }

  update(delta: number) {
    for (const c of this.components) {
      c.update?.(delta);
    }
  }
}

export default GameObject;
