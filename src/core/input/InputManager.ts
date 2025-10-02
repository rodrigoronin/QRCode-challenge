export const InputAction = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
};

export type InputAction = (typeof InputAction)[keyof typeof InputAction];

export class InputManager {
  private keys: Record<InputAction, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private keyMap: Record<string, InputAction> = {
    w: InputAction.Up,
    s: InputAction.Down,
    a: InputAction.Left,
    d: InputAction.Right,
  };

  constructor() {
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const mapped = this.keyMap[key];
    if (mapped) this.keys[mapped] = true;
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const mapped = this.keyMap[key];
    if (mapped) this.keys[mapped] = false;
  }

  isPressed(action: InputAction) {
    return this.keys[action];
  }
}
