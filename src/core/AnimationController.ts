import { Sprite, Texture } from "pixi.js";

export class AnimationController {
  private sprite: Sprite;
  private animations: Record<string, Texture[]> = {};
  private current: string = "";
  private frameIndex = 0;
  private frameTime = 0;
  private speed = 120; // ms por frame
  private loop?: boolean = true;

  constructor(sprite: Sprite, loop: boolean = true) {
    this.sprite = sprite;
    this.loop = loop;
  }

  addAnimation(name: string, frames: Texture[]) {
    this.animations[name] = frames;
  }

  play(name: string) {
    if (this.current === name) return;
    this.current = name;
    this.frameIndex = 0;
    this.frameTime = 0;
    this.applyFrame();
  }

  setSpeed(msPerFrame: number) {
    this.speed = msPerFrame;
  }

  update(deltaMS: number) {
    if (!this.current) return;
    const frames = this.animations[this.current];
    if (!frames || frames.length === 0) return;

    this.frameTime += deltaMS;
    if (this.frameTime >= this.speed) {
      this.frameTime = 0;

      if (!this.loop && this.frameIndex === frames.length - 1) return;

      this.frameIndex = (this.frameIndex + 1) % frames.length;
      this.applyFrame();
    }
  }

  private applyFrame() {
    const frames = this.animations[this.current];

    if (frames && frames[this.frameIndex]) {
      this.sprite.texture = frames[this.frameIndex];
    }
  }
}
