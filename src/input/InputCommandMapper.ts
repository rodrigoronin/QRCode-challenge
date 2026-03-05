import { AttackCommand } from "../core/commands/AttackCommand";
import { DashCommand } from "../core/commands/DashCommand";
import type { Command } from "../core/commands/Command";
import type { Player } from "../Entities/Player";

export class InputCommandMapper {
  private commands: Record<string, Command>;

  constructor(entity: Player) {
    this.commands = {
      ATTACK: new AttackCommand(entity),
      DASH: new DashCommand(entity),
    };
  }

  get(action: string): Command | null {
    return this.commands[action] ?? null;
  }
}
