import type { Container } from "pixi.js";
import { DamageNumber } from "./DamageNumbers";
import type { DamagePayload } from "src/data/DamagePayload";

export class DamageNumberSystem {
  private static numbers: DamageNumber[] = [];
  private static layer: Container | null = null;

  static initialize(layer: Container) {
    this.layer = layer;
  }

  static spawn(payload: DamagePayload) {
    if (!this.layer) return;

    this.numbers.push(new DamageNumber(payload, this.layer));
  }

  static update(delta: number) {
    this.numbers = this.numbers.filter((n) => !n.update(delta));
  }
}
