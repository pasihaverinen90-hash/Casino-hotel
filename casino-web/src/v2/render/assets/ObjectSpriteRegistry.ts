// ObjectSpriteRegistry.ts — scene-scoped pool of Phaser Image
// GameObjects that stand in for procedural cabinet bodies when a
// matching sprite is available.
//
// Lifecycle per redraw:
//   1. PresentationSceneV2 calls beginFrame()    — marks pool unused.
//   2. ObjectRendererV2 dispatches per object;   slot.ts (and any
//      future sprite-aware recipe) calls drawSprite(ctx, col, row).
//   3. PresentationSceneV2 calls endFrame()      — hides leftover
//      pool entries so removed objects don't ghost on screen.
//
// Pool key is `${type}-${facing ?? ''}` so each (type, facing) pair
// has its own reusable list of Images. This avoids creating /
// destroying GameObjects on every frame.
//
// Depth model is deliberately simple in this first phase: sprite
// Images draw at depth ≈ 2 + depthKey * EPSILON, which keeps them
// inside the object layer band (above floor/walls at depth 0–1,
// below guests at depth 3). Exact interleaving with the procedural
// gfxObjects Graphics layer (also at depth 2) is not solved here —
// sprites consistently draw on top of that layer. Slots are small
// 1×1 cabinets so the artifact is rare; revisit when more object
// types get sprites.
//
// `?procedural=1` in the URL forces every lookup to miss, so the
// procedural recipe runs everywhere. Useful for A/B comparison.
import Phaser from 'phaser';
import * as GC from '../../../logic/GameConstants';
import * as Proj from '../ProjectionV2';
import {
  OBJECT_SPRITES,
  type ObjectSpriteEntry,
} from './ObjectSpriteManifest';

// Depth band: keep sprite depths inside (2.0, 3.0) so they sit above
// the procedural object Graphics (depth 2) but below the guest layer
// (depth 3). depthKey returns col + row + (w + h) * 0.5 — for a 60×60
// board this stays well under 1000, so DEPTH_EPSILON = 0.001 keeps the
// total offset below 1.
const DEPTH_BASE    = 2.0;
const DEPTH_EPSILON = 0.001;

export class ObjectSpriteRegistry {
  private readonly scene           : Phaser.Scene;
  private readonly byKey           : Map<string, ObjectSpriteEntry>;
  private readonly pools           : Map<string, Phaser.GameObjects.Image[]>;
  private readonly poolUsage       : Map<string, number>;
  private readonly forceProcedural : boolean;

  constructor(scene: Phaser.Scene) {
    this.scene           = scene;
    this.byKey           = new Map();
    this.pools           = new Map();
    this.poolUsage       = new Map();
    this.forceProcedural = _readProceduralFlag();

    for (const entry of OBJECT_SPRITES) {
      this.byKey.set(_makeKey(entry.type, entry.facing), entry);
    }

    // Hide and free pool when the scene shuts down.
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._destroy());
  }

  // True when a sprite is registered AND the texture is loaded AND the
  // ?procedural=1 override is off. Recipes call this before deciding
  // whether to draw the sprite or fall back to procedural.
  has(type: GC.ObjType, facing?: GC.Orientation): boolean {
    if (this.forceProcedural) return false;
    const entry = this.byKey.get(_makeKey(type, facing));
    if (!entry) return false;
    return this.scene.textures.exists(entry.key);
  }

  // Reset pool usage counters. Existing pool images stay alive but are
  // logically "unused" until drawSprite reclaims them.
  beginFrame(): void {
    for (const key of this.pools.keys()) this.poolUsage.set(key, 0);
  }

  // Hide any pool images that weren't claimed this frame.
  endFrame(): void {
    for (const [key, pool] of this.pools) {
      const used = this.poolUsage.get(key) ?? 0;
      for (let i = used; i < pool.length; i++) pool[i].setVisible(false);
    }
  }

  // Draw the sprite for ctx.obj at the given anchor tile (the cabinet
  // tile for a slot machine). Returns true when the sprite was drawn,
  // false when no sprite is available (caller should fall back to its
  // procedural recipe).
  drawSprite(
    ctx: {
      obj   : GC.PlacedObj,
      baseX : number,
      baseY : number,
      ts    : number,
      alpha : number,
    },
    anchorCol: number,
    anchorRow: number,
  ): boolean {
    if (this.forceProcedural) return false;
    const entry = this.byKey.get(_makeKey(ctx.obj.type, ctx.obj.facing));
    if (!entry) return false;
    if (!this.scene.textures.exists(entry.key)) return false;

    const key = _makeKey(ctx.obj.type, ctx.obj.facing);
    let pool  = this.pools.get(key);
    if (!pool) { pool = []; this.pools.set(key, pool); }
    const idx = this.poolUsage.get(key) ?? 0;

    let img = pool[idx];
    if (!img) {
      img = this.scene.add.image(0, 0, entry.key);
      img.setOrigin(entry.anchorX, entry.anchorY);
      pool.push(img);
    }

    // Bottom-centre of sprite lands at tile centre. The sprite was
    // baked bottom-aligned in its canvas so the visible cabinet base
    // sits at the anchor row/col centre — same ground-plane intuition
    // as the procedural cabinet's inset footprint base.
    const centre = Proj.tileCenter(anchorCol, anchorRow, ctx.ts);
    const scale  = (ctx.ts * entry.targetHeightTiles) / entry.visibleHeightPx;

    img.setPosition(centre.x + ctx.baseX, centre.y + ctx.baseY);
    img.setScale(scale);
    img.setAlpha(ctx.alpha);
    img.setDepth(
      DEPTH_BASE
        + Proj.depthKey(anchorCol, anchorRow, 1, 1) * DEPTH_EPSILON,
    );
    img.setVisible(true);

    this.poolUsage.set(key, idx + 1);
    return true;
  }

  private _destroy(): void {
    for (const pool of this.pools.values()) {
      for (const img of pool) img.destroy();
    }
    this.pools.clear();
    this.poolUsage.clear();
  }
}

function _makeKey(type: GC.ObjType, facing?: GC.Orientation): string {
  return `${type}-${facing ?? ''}`;
}

function _readProceduralFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('procedural');
  } catch {
    return false;
  }
}
