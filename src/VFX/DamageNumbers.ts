import { BlurFilter, Container, Text, TextStyle } from "pixi.js";
import type { DamagePayload } from "src/data/DamagePayload";

export class DamageNumber {
  private text: Text;
  private timer = 0;
  private phase: "up" | "down" | "hold" = "up";
  private crit: boolean = false;

  private UP_TIME = 250;
  private readonly DOWN_TIME = 300;
  private readonly HOLD_TIME = 130;
  private TEXT_DIRECTION: number = Math.random() > 0.5 ? 0.05 : -0.05;

  constructor(payload: DamagePayload, parent: Container) {
    const { value, isCrit, position, type } = payload;

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 18,
      fontWeight: "bold",
      fill: this.getColor(type, isCrit),
      stroke: 0x000000,
      dropShadow: {
        color: "#000000",
        blur: 5,
        distance: 5,
        angle: 0,
        alpha: 0.8,
      },
    });

    this.text = new Text({
      text: value,
      style,
    });
    this.text.anchor.set(0.5);
    this.text.resolution = 2;

    // Damage numbers live in a stable world VFX layer, so they can finish
    // animating even after the hit entity is removed.
    this.text.x = position.x;
    this.text.y = position.y - 20;

    this.crit = isCrit;

    parent.addChild(this.text);
  }

  update(deltaMS: number): boolean {
    this.timer += deltaMS;

    this.text.alpha -= 0.0015 * deltaMS;

    if (this.crit) {
      this.text.scale.set(1.2);
      this.TEXT_DIRECTION = 0;
      this.UP_TIME = 500;
    }

    switch (this.phase) {
      case "up":
        this.text.y -= 0.1 * deltaMS;
        this.text.x += this.TEXT_DIRECTION * deltaMS;
        if (this.timer >= this.UP_TIME) {
          this.timer = 0;
          this.phase = "hold";
        }
        break;
      case "hold":
        this.text.y -= 0.05 * deltaMS;
        this.text.x += this.TEXT_DIRECTION * deltaMS;
        this.text.filters = new BlurFilter({
          strength: 1,
        });
        if (this.timer >= this.HOLD_TIME) {
          this.timer = 0;
          this.phase = "down";
        }
        break;
      case "down":
        this.text.y += 0.1 * deltaMS;
        this.text.x += this.TEXT_DIRECTION * deltaMS;
        this.text.filters = new BlurFilter({
          strength: 2,
        });
        if (this.timer >= this.DOWN_TIME) {
          this.timer = 0;
          this.destroy();
          return true;
        }
        break;
    }

    return false;
  }

  private getColor(type?: string, isCrit?: boolean): number {
    if (isCrit) return 0xffa500;

    switch (type) {
      case "fire":
        return 0xff4500;
      case "ice":
        return 0x00bfff;
      case "poison":
        return 0x32cd32;
      default:
        return 0xffffff;
    }
  }

  private destroy() {
    this.text.parent?.removeChild(this.text);
    this.text.destroy();
  }
}
