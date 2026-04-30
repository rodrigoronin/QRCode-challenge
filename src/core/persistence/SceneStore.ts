type SavedPosition = {
  x: number;
  y: number;
};

type SceneDocument = {
  version: number;
  scenes: Record<string, Record<string, SavedPosition>>;
};

export class SceneStore {
  private doc: SceneDocument = {
    version: 1,
    scenes: {},
  };

  setPosition(sceneId: string, objId: string, position: SavedPosition) {
    if (!this.doc.scenes[sceneId]) {
      this.doc.scenes[sceneId] = {};
    }

    this.doc.scenes[sceneId][objId] = position;
  }

  getPosition(sceneId: string, objId: string): SavedPosition {
    return this.doc.scenes[sceneId][objId];
  }

  saveToJSON() {
    return JSON.stringify(this.doc, null, 2);
  }

  loadJSON(json: string) {
    const parsed = JSON.parse(json) as SceneDocument;

    if (parsed.version !== 1) {
      throw new Error(`Wrong save version: ${parsed.version}`);
    }

    this.doc = parsed;
  }
}
