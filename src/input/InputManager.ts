export class InputManager {
  private static instance: InputManager;
  public static get() {
    if (!this.instance) this.instance = new InputManager();
    return this.instance;
  }

  // estado final normalizado (-1 a 1)
  private movement = { x: 0, y: 0 };

  // fontes separadas
  private keyboard = { x: 0, y: 0 };
  private gamepad = { x: 0, y: 0 };
  private gamepadActive = false; // só true se o stick saiu da deadzone neste frame
  private readonly DEADZONE = 0.18;

  private constructor() {
    this.setupKeyboard();
    requestAnimationFrame(() => this.loop());
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

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      const v = map[e.code];
      if (v) {
        this.keyboard.x += v.x;
        this.keyboard.y += v.y;
      }
    });

    window.addEventListener("keyup", (e) => {
      const v = map[e.code];
      if (v) {
        this.keyboard.x -= v.x;
        this.keyboard.y -= v.y;
      }
    });
  }

  private loop() {
    this.pollGamepad();
    this.combineSources();
    requestAnimationFrame(() => this.loop());
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
        // CORREÇÃO: normaliza pra vetor unitário (magnitude=1)
        // antes tava rawX * magnitude (bug que causava diagonal mais rápida)
        rawX /= magnitude;
        rawY /= magnitude;
      }

      this.gamepad.x = rawX;
      this.gamepad.y = rawY;
      if (this.gamepadActive) break;
    }
  }

  private combineSources() {
    // Regra de ouro: se o analógico saiu da deadzone neste frame → gamepad tem prioridade total
    // Se voltou pro centro → volta pro teclado imediatamente
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

  // API pública
  public getMovementVector() {
    return { ...this.movement }; // já vem normalizado e pronto pro Player
  }

  public isGamepadActiveThisFrame() {
    return this.gamepadActive;
  }
}
