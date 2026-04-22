import type { Player } from "@entities/Player";
import { type Command } from "./Command";

export class RunCommand implements Command {
  constructor(_entity: Player) {
    // Run is handled as a held input modifier directly by Player now.
  }

  execute(): void {
    // Intentionally empty.
  }
}
