export type InputAction = "ATTACK" | "DASH" | "INTERACT";

export class InputManager {
  private gamepadButtons: Record<string, boolean> = {};
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
  private keyboardMovement = { x: 0, y: 0 };
  private gamepadMovement = { x: 0, y: 0 };
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
      KeyE: "INTERACT",
    };

    window.addEventListener("keydown", (e) => {
      const mappedKey = map[e.code];
      const action = keyToAction[e.code];

      if (action) this.buttons[action] = true;

      if (e.repeat) return;

      if (mappedKey) {
        this.keyboardMovement.x += mappedKey.x;
        this.keyboardMovement.y += mappedKey.y;
      }
    });

    window.addEventListener("keyup", (e) => {
      const mappedKey = map[e.code];
      const action = keyToAction[e.code];

      if (action) this.buttons[action] = false;

      if (mappedKey) {
        this.keyboardMovement.x -= mappedKey.x;
        this.keyboardMovement.y -= mappedKey.y;
      }
    });
  }

  public poll() {
    this.pollGamepad();
    this.combineSources();
  }

  public commit() {
    const keys = new Set([
      ...Object.keys(this.prevButtons),
      ...Object.keys(this.buttons),
      ...Object.keys(this.gamepadButtons),
    ]);

    for (const key of keys) {
      this.prevButtons[key] = this.getActionState(key);
    }
  }

  private pollGamepad() {
    this.gamepadActive = false;
    const pads = navigator.getGamepads();

    const keyToAction: Record<string, InputAction> = {
      x: "ATTACK",
      a: "DASH",
      b: "INTERACT",
    };

    if (!pads) {
      for (const action of Object.values(keyToAction)) {
        this.gamepadButtons[action] = false;
      }
      return;
    }

    const gamePadMapper = {
      x: pads[0]?.buttons[2].pressed,
      a: pads[0]?.buttons[0].pressed,
      y: pads[0]?.buttons[3].pressed,
      b: pads[0]?.buttons[1].pressed,
    };

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

      this.gamepadMovement.x = rawX;
      this.gamepadMovement.y = rawY;
      if (this.gamepadActive) break;
    }

    // ATTACK (XBOX X)
    if (gamePadMapper.x) this.gamepadButtons[keyToAction.x] = true;
    else this.gamepadButtons[keyToAction.x] = false;
    // DASH (XBOX B)
    if (gamePadMapper.a) this.gamepadButtons[keyToAction.a] = true;
    else this.gamepadButtons[keyToAction.a] = false;
    // INTERACT (XBOX B)
    if (gamePadMapper.b) this.gamepadButtons[keyToAction.b] = true;
    else this.gamepadButtons[keyToAction.b] = false;
  }

  private combineSources() {
    // Golden Rule: if the stick left the deadzone in this frame -> gamepad has priority
    // If it got back to center -> keyboard takes control immediately
    if (this.gamepadActive) {
      this.movement.x = this.gamepadMovement.x;
      this.movement.y = this.gamepadMovement.y;
    } else {
      // só usa teclado se gamepad estiver realmente parado
      const kx = Math.sign(this.keyboardMovement.x);
      const ky = Math.sign(this.keyboardMovement.y);
      const kmag = Math.hypot(kx, ky);
      this.movement.x = kmag > 0 ? kx / kmag : 0;
      this.movement.y = kmag > 0 ? ky / kmag : 0;
    }
  }

  private getActionState(key: string): boolean {
    return !!this.buttons[key] || !!this.gamepadButtons[key];
  }

  isPressed(key: string) {
    return this.getActionState(key);
  }

  wasJustPressed(key: string): boolean {
    const prev = !!this.prevButtons[key];
    const cur = this.getActionState(key);
    return !prev && cur;
  }

  wasJustReleased(key: string) {
    const prev = !!this.prevButtons[key];
    const cur = this.getActionState(key);
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
