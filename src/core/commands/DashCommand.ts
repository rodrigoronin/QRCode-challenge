import type { Player } from "../../entities/Player";
import { type Command } from "./Command";

export class DashCommand implements Command {
  private entity: Player;
  constructor(entity: Player) {
    this.entity = entity;
  }

  execute(): void {
    this.entity.startDash();
  }
}
