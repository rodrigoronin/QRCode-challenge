export interface Command {
  execute(deltaMS: number): void;
}
