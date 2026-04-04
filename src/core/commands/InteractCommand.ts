import type { Player } from "@entities/Player";
import type { Command } from "./Command";
import { InteractionSystem } from "@core/systems/InteractionSystem";

export class InteractCommand implements Command {
  private player: Player;
  private interactionSystem: InteractionSystem;

  constructor(player: Player, interactionSystem: InteractionSystem) {
    this.player = player;
    this.interactionSystem = interactionSystem;
  }

  execute(): void {
    this.interactionSystem.getBestInRange(this.player)?.interact();
  }
}
