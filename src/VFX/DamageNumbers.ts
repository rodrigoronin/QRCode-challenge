import { Container, Text, TextStyle } from "pixi.js";

export class DamageNumber {
  private text: Text;
  private timer = 0;
  private phase: "up" | "down" | "hold" = "up";
  private crit: boolean = false;

  private readonly UP_TIME = 280;
  private readonly DOWN_TIME = 380;
  private readonly TEXT_DIRECTION: number = Math.random() > 0.3 ? 0.05 : -0.05;

  constructor(parent: Container, value: number, x: number, y: number) {
    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0xffffff,
      stroke: 0x000000,
      fontWeight: "bold",
    });

    this.text = new Text(value.toString(), style);
    this.text.anchor.set(0.5);

    // leve random horizontal (Ragnarok clássico)
    this.text.x = x;
    this.text.y = y - 20;

    this.crit = Math.random() > 0.5 ? true : false;

    parent.addChild(this.text);
  }

  update(deltaMS: number): boolean {
    this.timer += deltaMS;

    this.text.alpha -= 0.001 * deltaMS;

    if (this.crit) this.text.style.fill = 0xdc582a;

    switch (this.phase) {
      case "up":
        this.text.y -= 0.25 * deltaMS;
        if (this.timer >= this.UP_TIME) {
          this.timer = 0;
          this.phase = "down";
        }
        break;

      case "down":
        this.text.y += 0.1 * deltaMS;
        this.text.x += this.TEXT_DIRECTION * deltaMS;
        if (this.timer >= this.DOWN_TIME) {
          this.timer = 0;
          this.destroy();
          return true;
        }
        break;
    }

    return false;
  }

  private destroy() {
    this.text.parent?.removeChild(this.text);
    this.text.destroy();
  }
}
