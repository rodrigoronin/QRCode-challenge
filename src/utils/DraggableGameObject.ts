import {
  Point,
  type Container,
  type FederatedPointerEvent,
  type Graphics,
  type Sprite,
} from "pixi.js";

type GameObject = Container | Sprite | Graphics;

type DragEndPayload = {
  id: string;
  x: number;
  y: number;
};

export function makeDraggable(
  obj: GameObject,
  objId: string,
  onDragEnd?: (payload: DragEndPayload) => void,
) {
  obj.eventMode = "dynamic";
  obj.cursor = "grab";

  let dragging = false;

  let dragOffset = new Point(0, 0);

  obj.on("pointerdown", (e: FederatedPointerEvent) => {
    dragging = true;
    obj.cursor = "grabbing";

    const globalPos = e.global;
    const localPos = obj.toLocal(globalPos);

    dragOffset.x = localPos.x;
    dragOffset.y = localPos.y;
  });

  const onPointerMove = (e: FederatedPointerEvent) => {
    if (!dragging) return;

    if (obj.parent) {
      const localPos = obj.parent.toLocal(e.global);
      obj.x = localPos.x - dragOffset.x;
      obj.y = localPos.y - dragOffset.y;
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;

    dragging = false;
    obj.cursor = "grab";

    onDragEnd?.({
      id: objId,
      x: obj.x,
      y: obj.y,
    });
  };

  obj.on("pointerup", onPointerUp);
  obj.on("pointermove", onPointerMove);
  obj.on("globalpointermove", onPointerMove);
}
