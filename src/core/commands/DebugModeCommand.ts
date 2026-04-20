import type { Command } from "./Command";
import { debugState } from "@core/systems/DebugState";

export class DebugModeCommand implements Command {
  constructor() {}

  execute(): void {
    debugState.toggle();
    console.log(`Debug mode: ${debugState.isEnabled() ? "ON" : "OFF"}`);
  }
}
