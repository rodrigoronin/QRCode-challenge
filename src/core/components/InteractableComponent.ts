import type { Entity } from "@core/Entity";

interface IInteractable {
  entity: Entity;
  priority: number;
  interactionText: string;
  interactionRadius: number;
  interact: () => void;
}

export class InteractableComponent implements IInteractable {
  public entity: Entity;
  public priority: number;
  public interactionText: string;
  public interactionRadius: number;
  private onInteract: () => void;

  constructor(
    entity: Entity,
    priority: number,
    interactionText: string,
    onInteract: () => void,
    interactionRadius: number = 96,
  ) {
    this.entity = entity;
    this.priority = priority;
    this.interactionText = interactionText;
    this.onInteract = onInteract;
    this.interactionRadius = interactionRadius;
  }

  interact() {
    this.onInteract();
  }

  isInRange(interactor: Entity): boolean {
    return this.entity.distanceTo(interactor) <= this.interactionRadius;
  }
}
