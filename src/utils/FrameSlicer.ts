import { Rectangle, Texture } from "pixi.js";

// To help speed animations during MVP
export function frameSlicer(
  texture: Texture,
  frameSize: number,
  frameCount: number,
  startRow: number,
  startColumn: number = 0,
): Texture[] {
  const frames: Texture[] = [];

  if (frameCount === 1) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(startColumn * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );

    return frames;
  }

  // TODO: add validations when frameCount > texture total frames
  for (let i = startColumn; i < startColumn + frameCount; i++) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(i * frameSize, startRow * frameSize, frameSize, frameSize),
      }),
    );
  }

  return frames;
}
