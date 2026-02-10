import { Container } from "pixi.js";
import * as Constants from "../utils/Constants";
import type { Player } from "../entities/Player";

export class Camera {
  public container: Container;
  public mapRef: Container;
  public playerRef: Player;
  private readonly CAMERA_LERP: number = 0.1;

  constructor(map: Container, player: Player) {
    this.mapRef = map;
    this.playerRef = player;

    this.container = new Container();
  }

  public update() {
    const canMinX = window.innerWidth - this.mapRef.width * Constants.SCALE_FACTOR;
    const canMaxX = 0;

    this.container.x +=
      (this.clamp(
        -this.playerRef.container.x * Constants.SCALE_FACTOR + window.innerWidth / 2,
        canMinX,
        canMaxX,
      ) -
        this.container.x) *
      this.CAMERA_LERP;

    const canMinY = window.innerHeight - this.mapRef.height * Constants.SCALE_FACTOR;
    const canMaxY = 0;

    this.container.y +=
      (this.clamp(
        -this.playerRef.container.y * Constants.SCALE_FACTOR + window.innerHeight / 2,
        canMinY,
        canMaxY,
      ) -
        this.container.y) *
      this.CAMERA_LERP;
  }

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }
}
