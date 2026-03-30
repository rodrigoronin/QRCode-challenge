import { Application, Container } from "pixi.js";
import type { Player } from "@entities/Player";
import type NPC from "@entities/NPC";
import { clamp } from "../utils/Clamp";

export class Camera {
  public container: Container;
  public game: Application;
  public mapRef: Container;
  public playerRef: Player | NPC;

  private canMaxX: number = 0;
  private canMinX: number = 0;
  private canMaxY: number = 0;
  private canMinY: number = 0;

  private readonly CAMERA_LERP: number = 0.08;

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

    const screenW = this.game.screen.width;
    const screenH = this.game.screen.height;
    const scale = this.zoom;

    this.canMaxX = screenW - this.mapRef.width * scale;
    this.canMaxY = screenH - this.mapRef.height * scale;

    let targetX = clamp(
      -this.playerRef.container.x * this.zoom + screenW / 2,
      this.canMaxX,
      this.canMinX,
    );

    let targetY = clamp(
      -this.playerRef.container.y * this.zoom + screenH / 2,
      this.canMaxY,
      this.canMinY,
    );

    this.container.x += (targetX - this.container.x) * this.CAMERA_LERP;
    this.container.y += (targetY - this.container.y) * this.CAMERA_LERP;

    this.container.x = Math.round(this.container.x);
    this.container.y = Math.round(this.container.y);
  }

  private setupZoom() {
    window.addEventListener("wheel", (e: WheelEvent) => {
      const zoomSpeed = 0.1;

      const oldZoom = this.zoom;

      if (e.deltaY < 0) this.zoom += zoomSpeed;
      else this.zoom -= zoomSpeed;

      this.zoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom));

      const newZoom = this.zoom;

      if (oldZoom === newZoom) return;

      const screenW = this.game.screen.width;
      const screenH = this.game.screen.height;
      const centerX = screenW / 2;
      const centerY = screenH / 2;

      const worldPosX = (centerX - this.container.x) / oldZoom;
      const worldPosY = (centerY - this.container.y) / oldZoom;

      this.container.scale.set(newZoom);

      this.container.x = centerX - worldPosX * newZoom;
      this.container.y = centerY - worldPosY * newZoom;
    });
  }
}
