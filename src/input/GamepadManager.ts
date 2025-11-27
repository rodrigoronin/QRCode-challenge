import { InputManager, InputAction } from "./InputManager";

export class GamepadManager {
  private input: InputManager;
  private gamepadIndex: number | null = null;

  // default deadzone, adjust if needed
  private deadzone = 0.25;

  constructor(input: InputManager) {
    this.input = input;

    window.addEventListener("gamepadconnected", (e) => {
      this.gamepadIndex = e.gamepad.index;
      console.log("Gamepad connected:", e.gamepad.id);
    });
    window.addEventListener("gamepaddisconnected", () => {
      this.gamepadIndex = null;
      console.log("Gamepad disconnected");
    });
  }

  // normalize axis with deadzone
  private deadzoneNormalized(value: number): number {
    return Math.abs(value) < this.deadzone ? 0 : value;
  }

  public update() {
    if (this.gamepadIndex === null) return;

    const pads = navigator.getGamepads();
    const pad = pads[this.gamepadIndex];
    if (!pad) return;

    // left analog axis (default XInput/DualShock/etc)
    const x = this.deadzoneNormalized(pad.axes[0]); // -1 left | +1 right
    const y = this.deadzoneNormalized(pad.axes[1]); // -1 up | +1 down

    if (x === 0 && y === 0) return;

    // clean states
    this.input.setPressed(InputAction.Left, false);
    this.input.setPressed(InputAction.Right, false);
    this.input.setPressed(InputAction.Up, false);
    this.input.setPressed(InputAction.Down, false);

    // updates based on analog stick
    if (x < 0) this.input.setPressed(InputAction.Left, true);
    if (x > 0) this.input.setPressed(InputAction.Right, true);
    if (y < 0) this.input.setPressed(InputAction.Up, true);
    if (y > 0) this.input.setPressed(InputAction.Down, true);
  }
}
