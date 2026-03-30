import { Application, Container } from "pixi.js";
import * as Constants from "../utils/Constants";
import type { Player } from "../entities/Player";
import type NPC from "../entities/NPC";

export class Camera {
  public container: Container;
  public game: Application;
  public mapRef: Container;
  public playerRef: Player | NPC;

  private canMaxX: number = 0;
  private canMinX: number = 0;
  private canMaxY: number = 0;
  private canMinY: number = 0;

  private readonly CAMERA_LERP: number = 0.1;

  private zoom: number = 2;
  private readonly MIN_ZOOM = 1;
  private readonly MAX_ZOOM = 3;

  constructor(game: Application, map: Container, player: Player) {
    this.game = game;
    this.mapRef = map;
    this.playerRef = player;

    this.container = new Container();

    this.setupZoom();
  }

  public update() {
    this.container.scale.set(this.zoom);

    this.canMaxX = this.game.screen.width - this.mapRef.width * this.zoom;
    this.canMaxY = this.game.screen.height - this.mapRef.height * this.zoom;

    let targetX = this.clamp(
      -this.playerRef.container.x * this.zoom + this.game.screen.width / 2,
      this.canMaxX,
      this.canMinX,
    );

    let targetY = this.clamp(
      -this.playerRef.container.y * this.zoom + this.game.screen.height / 2,
      this.canMaxY,
      this.canMinY,
    );

    this.container.x += (targetX - this.container.x) * this.CAMERA_LERP;
    this.container.y += (targetY - this.container.y) * this.CAMERA_LERP;
  }

  private clamp(value: number, max: number, min: number) {
    return Math.max(max, Math.min(min, value));
  }

  private setupZoom() {
    window.addEventListener("wheel", (e: WheelEvent) => {
      const zoomSpeed = 0.01;

      if (e.deltaY < 0) this.zoom += zoomSpeed;
      else this.zoom -= zoomSpeed;

      this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom));
    });
  }
}
