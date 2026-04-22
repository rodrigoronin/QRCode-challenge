export type DebugListener = (enabled: boolean) => void;

class DebugState {
  private enabled = false;
  private listeners = new Set<DebugListener>();

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  setEnabled(next: boolean) {
    if (this.enabled === next) return;

    this.enabled = next;

    for (const listener of this.listeners) {
      listener(this.enabled);
    }
  }

  subscribe(listener: DebugListener) {
    this.listeners.add(listener);

    listener(this.enabled); // Late sync for new listeners

    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const debugState = new DebugState();
