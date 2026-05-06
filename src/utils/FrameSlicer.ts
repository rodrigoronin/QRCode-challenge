import { Rectangle, Texture } from "pixi.js";

// To help speed animations during MVP
export function frameSlicer(
  texture: Texture,
  frameWidth: number,
  frameHeight: number = 96,
  frameCount: number,
  startRow: number,
  startColumn: number = 0,
): Texture[] {
  const frames: Texture[] = [];

  if (frameCount === 1) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(
          startColumn * frameWidth,
          startRow * frameHeight,
          frameWidth,
          frameHeight,
        ),
      }),
    );

    return frames;
  }

  // TODO: add validations when frameCount > texture total frames
  for (let i = startColumn; i < startColumn + frameCount; i++) {
    frames.push(
      new Texture({
        source: texture.source,
        frame: new Rectangle(i * frameWidth, startRow * frameHeight, frameWidth, frameHeight),
      }),
    );
  }

  return frames;
}
