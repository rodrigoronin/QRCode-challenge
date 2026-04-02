import { Assets, type Texture } from "pixi.js";

export class AssetLoader {
  private textureList: Map<string, Texture>;

  constructor() {
    this.textureList = new Map<string, Texture>();
  }

  public async init(): Promise<void> {
    await this.loadAllTextures();
  }

  private async loadAllTextures(): Promise<void> {
    const modules: Record<string, any> = import.meta.glob("@assets/sprites/**/*.png", {
      eager: true,
      import: "default",
    });

    for (const path in modules) {
      const name: string = path.replace("/src/assets/", "").replace(".png", "");
      const url: string = modules[path];

      const texture: Texture = await Assets.load(url);
      texture.source.scaleMode = "nearest";

      this.textureList.set(name, texture);
    }
  }

  public getTexture(name: string): Texture {
    const texture = this.textureList.get(name);

    if (!texture) {
      throw new Error(`Texture not found: '${name}'`);
    }

    return texture;
  }
}
