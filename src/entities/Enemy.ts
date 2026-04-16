import { ColorMatrixFilter, Sprite, Texture, Point } from "pixi.js";
import { Entity } from "../core/Entity";
import { Collider } from "../core/Collider";
import { CollisionManager } from "../core/CollisionManager";
import { Player } from "./Player";
import { AttackComponent } from "../core/AttackComponent";
import { AttackCollider } from "../core/AttackCollider";
import { AnimationController } from "../core/AnimationController";
import { StatsComponent } from "@core/components/StatsComponent";

type AttackState = "none" | "windup" | "active" | "recovery";
// type Direction = "up" | "down" | "left" | "right";

export class Enemy extends Entity {
  // RENDER
  private sprite: Sprite;
  private collider: Collider;
  public tag: string = "enemy";
  public currentDir: string = "down";
  private frames: Record<string, Texture[]>;
  private anim: AnimationController;
  private hitFlashFilter: ColorMatrixFilter = new ColorMatrixFilter();
  private windupFilter: ColorMatrixFilter = new ColorMatrixFilter();
  // DATA
  public stats = new StatsComponent({
    maxHP: 20,
    attack: 6,
    defense: 1,
    critChance: 0.1,
  });
  private speed: number = 140; // pixels/second
  private isDead: boolean = false;
  private perceptionRange: number = 250; // pixels
  private playerRef: Player;
  public target: Player | null = null;
  // COMBAT
  private attackState: AttackState = "none";
  private attackComponent: AttackComponent;
  private attackCollider: AttackCollider;
  private attackDirection: Point | null = null;
  private WINDUP_TIME: number = 450;
  private ACTIVE_TIME: number = 420;
  private RECOVERY_TIME: number = 1000;
  private attackTimer: number = 0;
  private isHitFlashing: boolean = false;
  private hitFlashingTimer: number = 0;
  private HIT_FLASH_DURATION: number = 150;
  private VFXFrames: Record<string, Texture[]>;
  // BEHAVIOUR
  private roamTarget: Point | null = null;
  private roamWaitTimer: number = 0;
  private roamingArea: { x: number; y: number; width: number; height: number };
  private isInCombat: boolean = false;
  private isPassive: boolean = true;
  public isInvincible: boolean = false;
  private moveDir: Point = new Point(0, 0);
  private flankSign: 1 | -1 = 1;
  private flankSwitchTimerMS: number = 0;
  private readonly FLANK_SPEED_SCALE: number = 0.7;
  private readonly FLANK_RADIUS_MULT: number = 1.8;

  constructor(
    frames: Record<string, Texture[]>,
    playerRef: Player,
    VFXFrames: Record<string, Texture[]>,
    roamingArea: { x: number; y: number; width: number; height: number },
  ) {
    super();

    this.VFXFrames = VFXFrames;
    this.frames = frames;
    this.sprite = new Sprite(this.frames["idle_down"][0]);
    this.sprite.anchor.set(0.5);
    this.anim = new AnimationController(this.sprite);
    this.setupAnimation();

    this.anim.play("idle_down");

    this.container.addChild(this.sprite);

    this.collider = new Collider(22, 48, 3, 5, this.container, this);
    CollisionManager.registerEntityCollider(this.collider);

    this.attackCollider = new AttackCollider(
      40,
      40,
      this.ACTIVE_TIME,
      this.container,
      this,
      this.VFXFrames,
    );

    this.attackComponent = new AttackComponent(this, {
      attackCollider: this.attackCollider,
      maxTargets: 1,
      target: "player",
    });

    this.roamingArea = roamingArea;

    this.playerRef = playerRef;

    this.collider.drawDebug();
  }

  update(_deltaTime: number): void {
    if (!this.isDead) {
      this.updateHitFlashFilter(_deltaTime);

      this.roaming(this.roamingArea, _deltaTime);

      if (!this.isPassive) {
        this.perceptionRadar();
        this.chaseTarget(_deltaTime);
      }

      if (this.attackState !== "none") {
        this.updateAttackPhases(_deltaTime);
      }
    }

    this.anim.update(_deltaTime);
  }

  setupAnimation() {
    for (const key in this.frames) {
      this.anim.addAnimation(key, this.frames[key]);
    }
  }

  public takeDamage(direction?: string | undefined): void {
    this.isPassive = false;

    // TODO: create a system to handle directional knockback
    // and other effects later
    const knockbackStrength = 10;

    switch (direction) {
      case "up":
        this.container.position.y = this.container.position.y - knockbackStrength;
        break;
      case "down":
        this.container.position.y = this.container.position.y + knockbackStrength;
        break;
      case "left":
        this.container.position.x -= knockbackStrength;
        break;
      case "right":
        this.container.position.x = this.container.position.x + knockbackStrength;
        break;
      default:
        break;
    }

    // Set hit flash if not invincible (maybe remove it in the future)
    if (!this.isInvincible) {
      this.isHitFlashing = true;
    }

    this.hitFlashFilter.greyscale(1, false);
    this.addFilter(this.hitFlashFilter);

    console.log(`Enemy HP: ${this.stats.currentHP} / ${this.stats.maxHP}`);

    if (this.stats.currentHP <= 0) this.die();
  }

  private die() {
    this.isDead = true;
    CollisionManager.removeEntityCollider(this.collider);
    this.remove();
  }

  public suspend() {
    if (this.isDead) return;

    this.attackComponent.deactivate();
    this.attackCollider.deactivate();
    CollisionManager.removeEntityCollider(this.collider);
  }

  public resume() {
    if (this.isDead) return;

    CollisionManager.registerEntityCollider(this.collider);
  }

  public dispose() {
    this.isDead = true;
    this.attackComponent.deactivate();
    this.attackCollider.deactivate();
    CollisionManager.removeEntityCollider(this.collider);
    this.remove();
  }

  private updateHitFlashFilter(deltaTime: number) {
    if (this.isHitFlashing) {
      this.hitFlashingTimer += deltaTime;

      if (this.hitFlashingTimer >= this.HIT_FLASH_DURATION) {
        this.isHitFlashing = false;
        this.removeFilter(this.hitFlashFilter);
        this.hitFlashingTimer = 0;
      }
    }
  }

  protected perceptionRadar() {
    if (!this.playerRef) return;

    const dx = this.playerRef.container.x - this.container.x;
    const dy = this.playerRef.container.y - this.container.y;
    this.target = this.playerRef;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.perceptionRange) {
      this.target = this.playerRef;
      this.isInCombat = true;
    } else {
      this.target = null;
      this.isInCombat = false;
    }
  }

  protected chaseTarget(deltaMS: number) {
    if (!this.target) return;

    // Don't slide during telegraph; just face the player.
    if (this.attackState === "windup") {
      const dx = this.target.container.x - this.container.x;
      const dy = this.target.container.y - this.container.y;
      this.updateDirection({ x: dx, y: dy });
      this.applyFacingToSprite({ x: dx, y: dy });
      this.anim.play(`idle_${this.currentDir}`);
      return;
    }

    if (this.attackState === "active") return;

    // While recovering (cooldown), strafe sideways around the player.
    if (this.attackState === "recovery") {
      this.flankTarget(deltaMS);
      return;
    }

    const dx: number = this.target.container.x - this.container.x;
    const dy: number = this.target.container.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    const attackRange = this.container.width;

    if (distance <= attackRange) {
      this.windupAttack();
      return;
    }

    if (distance <= 0.001) return;

    const slowRadius = attackRange * 2.5;
    const speedScale = distance < slowRadius ? Math.max(0.35, distance / slowRadius) : 1;

    let dirX = dx / distance;
    let dirY = dy / distance;

    // how much movement the enemy will make to turn around
    const blend = 0.3;
    this.moveDir.x += (dirX - this.moveDir.x) * blend;
    this.moveDir.y += (dirY - this.moveDir.y) * blend;
    const blendedDist = Math.hypot(this.moveDir.x, this.moveDir.y);

    if (blendedDist > 0.001) {
      this.moveDir.x /= blendedDist;
      this.moveDir.y /= blendedDist;
    }

    this.move(this.moveDir.x, this.moveDir.y, 1, deltaMS, speedScale);
  }

  private flankTarget(deltaMS: number) {
    if (!this.target) return;

    const dx = this.target.container.x - this.container.x;
    const dy = this.target.container.y - this.container.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0.001) return;

    // Occasionally swap strafe side so it doesn't get stuck on walls.
    this.flankSwitchTimerMS -= deltaMS;
    if (this.flankSwitchTimerMS <= 0) {
      this.flankSign = (this.flankSign * -1) as 1 | -1;
      this.flankSwitchTimerMS = 650 + Math.random() * 650;
    }

    const toX = dx / dist;
    const toY = dy / dist;

    // Perpendicular (sideways) movement relative to player.
    const sideX = -toY * this.flankSign;
    const sideY = toX * this.flankSign;

    // Keep a loose "orbit" radius so it feels like flanking, not fleeing.
    const attackRange = this.container.width;
    const desiredRadius = Math.max(16, attackRange * this.FLANK_RADIUS_MULT);
    const radiusError = dist - desiredRadius; // + too far, - too close

    const correctionStrength = 0.65;
    const correctionScale = Math.min(1, Math.abs(radiusError) / desiredRadius) * correctionStrength;
    const correctionDir = radiusError > 0 ? 1 : -1; // pull in if far, push out if close
    const radialX = toX * correctionDir * correctionScale;
    const radialY = toY * correctionDir * correctionScale;

    let desiredX = sideX + radialX;
    let desiredY = sideY + radialY;

    const desiredMag = Math.hypot(desiredX, desiredY);
    if (desiredMag > 0.001) {
      desiredX /= desiredMag;
      desiredY /= desiredMag;
    }

    const blend = 0.25;
    this.moveDir.x += (desiredX - this.moveDir.x) * blend;
    this.moveDir.y += (desiredY - this.moveDir.y) * blend;

    const blendedMag = Math.hypot(this.moveDir.x, this.moveDir.y);
    if (blendedMag > 0.001) {
      this.moveDir.x /= blendedMag;
      this.moveDir.y /= blendedMag;
    }

    this.move(this.moveDir.x, this.moveDir.y, 1, deltaMS, this.FLANK_SPEED_SCALE);
  }

  protected move(dx: number, dy: number, distance: number, delta: number, speedScale: number = 1) {
    const dirX = dx / distance;
    const dirY = dy / distance;

    const deltaSec = delta / 1000;

    const moveX = dirX * this.speed * speedScale * deltaSec;
    const moveY = dirY * this.speed * speedScale * deltaSec;

    if (CollisionManager.canMove(this.collider, this.container.x + moveX, this.container.y))
      this.container.x += moveX;
    if (CollisionManager.canMove(this.collider, this.container.x, this.container.y + moveY))
      this.container.y += moveY;

    this.updateDirection({ x: moveX, y: moveY });
    this.applyFacingToSprite({ x: moveX, y: moveY });

    if (this.container.x !== 0 || this.container.y !== 0) {
      this.anim.play(`walk_${this.currentDir}`);
    } else {
      this.anim.play(`idle_${this.currentDir}`);
    }

    this.anim.update(delta);
  }

  protected roaming(
    zone: { x: number; y: number; width: number; height: number },
    delta: number,
  ): void {
    if (this.isInCombat) return;

    if (this.roamWaitTimer > 0) {
      this.roamWaitTimer -= delta;

      if (this.roamWaitTimer <= 0) this.roamTarget = null;

      return;
    }

    // chance to roam or stay still
    if (!this.roamTarget) {
      if (Math.random() < 0.5) {
        this.roamWaitTimer = 800;
        return;
      }

      const x = zone.x + Math.random() * zone.width;
      const y = zone.y + Math.random() * zone.height;

      this.roamTarget = new Point(x, y);

      return;
    }

    const dx: number = this.roamTarget.x - this.container.x;
    const dy: number = this.roamTarget.y - this.container.y;
    const distance: number = Math.hypot(dx, dy);

    if (distance < 2) {
      this.roamTarget = null;
      this.roamWaitTimer = 4000;
      return;
    }

    this.move(dx, dy, distance, delta);
  }

  protected windupAttack() {
    if (!this.target) return;
    if (this.attackState !== "none") return;

    this.attackState = "windup";
    this.attackTimer = this.WINDUP_TIME;

    // TELEGRAPH
    this.windupFilter.brightness(1.5, false);
    this.sprite.tint = 0xff5555;

    this.attackDirection = this.getAttackDirection();

    this.addFilter(this.windupFilter);
  }

  protected basicAttack() {
    if (!this.attackDirection) return;

    this.attackState = "active";
    this.attackTimer = this.ACTIVE_TIME;

    // CLEARS TELEGRAPH
    this.removeFilter(this.windupFilter);
    this.sprite.tint = 0xffffff;

    this.attackCollider.activate(this.attackDirection, 45);
    this.attackComponent.activate();
  }

  protected updateAttackPhases(deltaMS: number) {
    if (this.attackState === "none") return;

    switch (this.attackState) {
      case "windup":
        if (this.attackTimer <= 0) this.basicAttack();
        break;

      case "active":
        this.attackComponent.update();
        this.attackCollider.update(deltaMS);
        this.attackCollider.updatePosition();
        this.attackCollider.drawDebug();

        if (this.attackTimer <= 0) this.enterRecovery();
        break;

      case "recovery":
        if (this.attackTimer <= 0) this.attackState = "none";
        break;
    }

    this.attackTimer -= deltaMS;
  }

  private enterRecovery() {
    this.attackState = "recovery";
    this.attackTimer = this.RECOVERY_TIME;

    this.attackComponent.deactivate();
    this.attackCollider.deactivate();

    this.attackDirection = null;

    // Pick a strafe direction for the cooldown window.
    this.flankSign = (Math.random() < 0.5 ? -1 : 1) as 1 | -1;
    this.flankSwitchTimerMS = 650 + Math.random() * 650;
  }

  protected updateDirection(m: { x: number; y: number }) {
    if (Math.abs(m.x) > Math.abs(m.y)) {
      this.currentDir = m.x > 0 ? "right" : "left";
    } else if (m.y !== 0) {
      this.currentDir = m.y > 0 ? "down" : "up";
    }
  }

  protected applyFacingToSprite(m: { x: number; y: number }) {
    m.x > 0 ? (this.sprite.scale.x = -1) : (this.sprite.scale.x = 1);
  }

  private addFilter(filter: ColorMatrixFilter) {
    const filters = this.container.filters ?? [];
    if (!filters.includes(filter)) {
      this.container.filters = [...filters, filter];
    }
  }

  private removeFilter(filter: ColorMatrixFilter) {
    if (!this.container.filters) return;
    this.container.filters = this.container.filters.filter((f) => f !== filter);
  }

  protected getAttackDirection(): Point {
    if (!this.target) return new Point(0, 0);

    const dir = new Point(0, 0);

    const dx = this.target.container.x - this.container.x;
    const dy = this.target.container.y - this.container.y;
    const magnitude = Math.hypot(dx, dy);

    magnitude > 0 ? dir.set(dx / magnitude, dy / magnitude) : dir.set(0, 1);

    return dir;
  }
}
