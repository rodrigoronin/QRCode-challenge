import { Container, Sprite, Graphics, FederatedPointerEvent } from "pixi.js";

export function makeDraggable(obj: Container | Sprite | Graphics, onDragEnd?: (obj: any) => void) {
  obj.eventMode = "dynamic";
  obj.cursor = "grab";

  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

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
      const newPos = obj.parent.toLocal(e.global);
      obj.x = newPos.x - dragOffset.x;
      obj.y = newPos.y - dragOffset.y;
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    obj.cursor = "grab";
    // TODO: use this to save GameObjects positions before exiting dev mode
    onDragEnd?.(obj);
  };

  obj.on("pointermove", onPointerMove);
  obj.on("globalpointermove", onPointerMove);
  obj.on("pointerup", onPointerUp);
  obj.on("pointerupoutside", onPointerUp);
}
