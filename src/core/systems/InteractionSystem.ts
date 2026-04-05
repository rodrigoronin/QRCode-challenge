import type { Entity } from "@core/Entity";
import { InteractableComponent } from "@core/components/InteractableComponent";

export class InteractionSystem {
  private candidates: Set<InteractableComponent> = new Set();

  register(interactable: InteractableComponent) {
    this.candidates.add(interactable);
  }

  unregister(interactable: InteractableComponent) {
    this.candidates.delete(interactable);
  }

  getBestInRange(player: Entity): InteractableComponent | null {
    let best: InteractableComponent | null = null;
    let bestScore = -Infinity;

    for (const candidate of this.candidates) {
      if (!candidate.isInRange(player)) {
        continue;
      }

      const dist = candidate.entity.distanceTo(player);
      const score = candidate.priority - dist * 0.1;

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }
}
