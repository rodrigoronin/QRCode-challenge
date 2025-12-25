export type InputAction = "ATTACK" | "DASH";

export class InputManager {
  private buttons: Record<string, boolean> = {};
  private prevButtons: Record<string, boolean> = {};
  private static instance: InputManager;
  public static get() {
    if (!this.instance) this.instance = new InputManager();
    return this.instance;
  }

  //  final normalized state (-1 a 1)
  private movement = { x: 0, y: 0 };

  // separated input sources
  private keyboard = { x: 0, y: 0 };
  private gamepad = { x: 0, y: 0 };
  private gamepadActive = false; // true only if the stick left the deadzone this frame
  private readonly DEADZONE = 0.18;

  private constructor() {
    this.setupKeyboard();
  }

  private setupKeyboard() {
    const map: Record<string, { x: number; y: number }> = {
      KeyW: { x: 0, y: -1 },
      ArrowUp: { x: 0, y: -1 },
      KeyS: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: 1 },
      KeyA: { x: -1, y: 0 },
      ArrowLeft: { x: -1, y: 0 },
      KeyD: { x: 1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const keyToAction: Record<string, InputAction> = {
      KeyJ: "ATTACK",
      Space: "DASH",
    };

    window.addEventListener("keydown", (e) => {
      const v = map[e.code];
      const action = keyToAction[e.code];

      if (action) this.buttons[action] = true;

      if (e.repeat) return;

      if (v) {
        this.keyboard.x += v.x;
        this.keyboard.y += v.y;
      }

      this.buttons[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.buttons[e.code] = false;

      const v = map[e.code];
      const action = keyToAction[e.code];

      if (action) this.buttons[action] = false;

      if (v) {
        this.keyboard.x -= v.x;
        this.keyboard.y -= v.y;
      }
    });
  }

  public pool() {
    this.pollGamepad();
    this.combineSources();
  }

  public commit() {
    this.prevButtons = { ...this.buttons };
  }

  private pollGamepad() {
    this.gamepadActive = false;
    const pads = navigator.getGamepads();
    if (!pads) return;

    for (const pad of pads) {
      if (!pad) continue;
      let rawX = pad.axes[0];
      let rawY = pad.axes[1];

      const magnitude = Math.hypot(rawX, rawY);
      if (magnitude < this.DEADZONE) {
        rawX = rawY = 0;
      } else {
        this.gamepadActive = true;
        rawX /= magnitude;
        rawY /= magnitude;
      }

      this.gamepad.x = rawX;
      this.gamepad.y = rawY;
      if (this.gamepadActive) break;
    }

    // ATTACK (XBOX X)
    if (pads[0]?.buttons[2].pressed) this.buttons["ATTACK"] = true;
    else this.buttons["ATTACK"] = false;

    // DASH (XBOX B)
    if (pads[0]?.buttons[0].pressed) this.buttons["DASH"] = true;
    else this.buttons["DASH"] = false;
  }

  private combineSources() {
    // Golden Rule: if the stick left the deadzone in this frame -> gamepad has priority
    // If it got back to center -> keyboard takes control immediately
    if (this.gamepadActive) {
      this.movement.x = this.gamepad.x;
      this.movement.y = this.gamepad.y;
    } else {
      // só usa teclado se gamepad estiver realmente parado
      const kx = Math.sign(this.keyboard.x);
      const ky = Math.sign(this.keyboard.y);
      const kmag = Math.hypot(kx, ky);
      this.movement.x = kmag > 0 ? kx / kmag : 0;
      this.movement.y = kmag > 0 ? ky / kmag : 0;
    }
  }

  isPressed(key: string) {
    return !!this.buttons[key];
  }

  wasJustPressed(key: string): boolean {
    const prev = !!this.prevButtons[key];
    const cur = !!this.buttons[key];
    return !prev && cur;
  }

  wasJustReleased(key: string) {
    const prev = !!this.prevButtons[key];
    const cur = !!this.buttons[key];
    return prev && !cur;
  }

  // public API
  public getMovementVector() {
    return { ...this.movement }; // already comes normalized and ready for the Player
  }

  public isGamepadActiveThisFrame() {
    return this.gamepadActive;
  }
}
