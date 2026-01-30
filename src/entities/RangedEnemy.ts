import type { Texture } from "pixi.js";
import { Enemy } from "./Enemy";
import { Player } from "./Player";

export class RangedEnemy extends Enemy {
  constructor(
    frames: Record<string, Texture[]>,
    playerRef: Player,
    VFXFrames: Record<string, Texture[]>,
  ) {
    super(frames, playerRef, VFXFrames);
  }
}
