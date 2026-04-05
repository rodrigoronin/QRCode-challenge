import { AttackCommand } from "@core/commands/AttackCommand";
import { DashCommand } from "@core/commands/DashCommand";
import { InteractCommand } from "@core/commands/InteractCommand";
import type { Command } from "@core/commands/Command";
import type { Player } from "@entities/Player";
import { InteractionSystem } from "@core/systems/InteractionSystem";

export class InputCommandMapper {
  private commands: Record<string, Command>;

  constructor(entity: Player, interactionSystem: InteractionSystem) {
    this.commands = {
      ATTACK: new AttackCommand(entity),
      DASH: new DashCommand(entity),
      INTERACT: new InteractCommand(entity, interactionSystem),
    };
  }

  get(action: string): Command | null {
    return this.commands[action] ?? null;
  }
}
