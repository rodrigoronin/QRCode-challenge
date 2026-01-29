import { Container } from "pixi.js";
import { DamageNumber } from "./DamageNumbers";

export class DamageNumberManager {
  private static numbers: DamageNumber[] = [];

  static spawn(parent: Container, value: number, x: number, y: number) {
    this.numbers.push(new DamageNumber(parent, value, x, y));
  }

  static update(delta: number) {
    this.numbers = this.numbers.filter((n) => !n.update(delta));
  }
}
