export class Time {
  private static hitstopTimer = 0;

  static triggerHitstop(ms: number) {
    this.hitstopTimer = ms;
  }

  static update(delta: number) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
    }
  }

  static isStopped() {
    return this.hitstopTimer > 0;
  }
}
