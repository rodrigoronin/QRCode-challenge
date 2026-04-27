import type { Player } from "@entities/Player";
import type { AssetLoader } from "./AssetLoader";
import type { SceneManager } from "./systems/SceneManager";
import type { AreaDefinition } from "src/game/AreaDefinition";
import { MainScene } from "../game/scenes/MainScene";

interface ICallback {
  assets: AssetLoader;
  player: Player;
  requestSceneChange: (targetAreaId: string, spawnId: string) => void;
}

export async function loadAllMaps(
  sceneManager: SceneManager,
  assets: AssetLoader,
  player: Player,
  requestSceneChange: (targetAreaId: string, spawnId: string) => void,
) {
  const modules: Record<string, (callback: ICallback) => AreaDefinition> = import.meta.glob(
    "../game/areas/*.ts",
    {
      eager: true,
      import: "load",
    },
  );

  for (const path in modules) {
    const createAreaFn = modules[path];
    const pathSliced: string[] = path.split("/");
    const name: string = pathSliced[pathSliced.length - 1].replace(".ts", "").toLowerCase();

    sceneManager.registerSceneFactory(
      name,
      () => new MainScene(createAreaFn({ assets, player, requestSceneChange }), player),
    );
  }
}
