import type { Player } from "@entities/Player";
import type { InteractionSystem } from "@core/systems/InteractionSystem";

export class GameOverlay {
  private readonly healthHUD: HTMLElement;
  private readonly healthBar: HTMLElement;
  private readonly healthBarText: HTMLElement;
  private readonly manaHUD: HTMLElement;
  private readonly manaBar: HTMLElement;
  private readonly manaBarText: HTMLElement;
  private readonly interactionHint: HTMLElement;

  constructor() {
    this.healthHUD = this.generateHUD("div");
    this.healthBar = this.healthHUD.firstElementChild as HTMLElement;
    this.healthBarText = this.healthHUD.lastElementChild as HTMLElement;
    this.healthBar.style.backgroundColor = "green";
    this.healthBar.style.color = "green";
    this.healthBar.textContent = ".";

    this.manaHUD = this.generateHUD("div");
    this.manaHUD.style.left = "16rem";
    this.manaBar = this.manaHUD.firstElementChild as HTMLElement;
    this.manaBarText = this.manaHUD.lastElementChild as HTMLElement;
    this.manaBar.style.backgroundColor = "RoyalBlue";
    this.manaBar.style.color = "RoyalBlue";
    this.manaBar.textContent = ".";

    this.interactionHint = document.createElement("div");
    this.generateInteractionHint(this.interactionHint);
  }

  update(interactionSystem: InteractionSystem, player: Player) {
    this.updateInteractionHint(interactionSystem, player);

    const healthPercentage = player.currentHP / player.maxHP;
    this.healthBarText.textContent = `${player.currentHP} / ${player.maxHP}`;
    this.healthBar.style.width = `${healthPercentage * 192 - 6}px`;

    this.manaBarText.textContent = `${20} / ${20}`;
  }

  private generateHUD(type: string): HTMLElement {
    const elem: HTMLElement = document.createElement(type);
    elem.style.fontFamily = "Arial";
    elem.style.color = "black";
    elem.style.width = "192px";
    elem.style.fontSize = "1.5rem";
    elem.style.fontWeight = "700";
    elem.style.position = "absolute";
    elem.style.top = "1rem";
    elem.style.left = "1rem";
    elem.style.border = "3px solid rgba(0,0,0,0.75)";
    elem.style.borderTopRightRadius = "8px";
    elem.style.borderBottomLeftRadius = "8px";

    const bar = document.createElement("div");
    bar.style.position = "relative";
    bar.style.width = "calc(192px - 6px)";
    bar.style.borderTopRightRadius = "4px";
    bar.style.borderBottomLeftRadius = "4px";

    const text = document.createElement("div");
    text.style.position = "absolute";
    text.style.top = "0px";
    text.style.left = "1rem";

    elem.appendChild(bar);
    elem.appendChild(text);
    document.body.prepend(elem);

    return elem;
  }

  private generateInteractionHint(elem: HTMLElement) {
    elem.style.fontFamily = "Arial";
    elem.style.color = "white";
    elem.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    elem.style.fontSize = "1.5rem";
    elem.style.fontWeight = "700";
    elem.style.position = "absolute";
    elem.style.left = "50%";
    elem.style.bottom = "2rem";
    elem.style.transform = "translateX(-50%)";
    elem.style.padding = "0.75rem 1rem";
    elem.style.borderRadius = "0.5rem";
    elem.style.display = "none";
    elem.style.pointerEvents = "none";

    document.body.prepend(elem);
  }

  private updateInteractionHint(interactionSystem: InteractionSystem, player: Player) {
    const interactable = interactionSystem.getBestInRange(player);

    if (!interactable) {
      this.interactionHint.style.display = "none";
      return;
    }

    this.interactionHint.innerText = `Press B to ${interactable.interactionText}`;
    this.interactionHint.style.display = "block";
  }
}
