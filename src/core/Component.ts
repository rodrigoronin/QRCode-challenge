import type GameObject from "./GameObject";

abstract class Component {
  public owner: GameObject;

  constructor(owner: GameObject) {
    this.owner = owner;
  }
  update?(delta: number): void;
}

export default Component;
