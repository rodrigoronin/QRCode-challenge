import { Container } from "pixi.js";
import * as Constants from "../utils/Constants";
import type { Player } from "../Entities/Player";

export class Camera {
  public container: Container;
  public mapRef: Container;
  public playerRef: Player;
  private canMaxX: number = 0;
  private canMinX: number = 0;
  private canMaxY: number = 0;
  private canMinY: number = 0;
  private readonly CAMERA_LERP: number = 0.1;

  constructor(map: Container, player: Player) {
    this.mapRef = map;
    this.playerRef = player;

    this.container = new Container();
  }

  public update() {
    this.canMaxX = window.innerWidth - this.mapRef.width * Constants.SCALE_FACTOR;

    this.container.x += Math.round(
      (this.clamp(
        -this.playerRef.container.x * Constants.SCALE_FACTOR + window.innerWidth / 2,
        this.canMaxX,
        this.canMinX,
      ) -
        this.container.x) *
        this.CAMERA_LERP,
    );

    this.canMaxY = window.innerHeight - this.mapRef.height * Constants.SCALE_FACTOR;

    this.container.y += Math.round(
      (this.clamp(
        -this.playerRef.container.y * Constants.SCALE_FACTOR + window.innerHeight / 2,
        this.canMaxY,
        this.canMinY,
      ) -
        this.container.y) *
        this.CAMERA_LERP,
    );
  }

  private clamp(value: number, max: number, min: number) {
    return Math.max(max, Math.min(min, value));
  }
}
