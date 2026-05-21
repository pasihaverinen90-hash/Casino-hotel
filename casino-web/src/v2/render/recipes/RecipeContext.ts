// RecipeContext.ts — shared input shape for V2 object recipes.
//
// Declared in a small standalone file so recipe modules don't have to
// import from ObjectRendererV2 (which would create a cycle once the
// dispatcher imports the recipes back).
//
// `tiles` is included so wall-service recipes can call
// PlacementValidator.detectWallDir(...) to find which visible wall they
// attach to. Tiles are read-only — recipes never mutate them.
import Phaser from 'phaser';
import * as GC from '../../../logic/GameConstants';
// `import type` keeps this module's dependency on the sprite assets
// folder at type-level only, so the recipe layer never carries a runtime
// import of Phaser-specific Image pooling code (which would create a
// cycle through ObjectRendererV2 ↔ recipes ↔ registry).
import type { ObjectSpriteRegistry } from '../assets/ObjectSpriteRegistry';

export interface RecipeContext {
  g             : Phaser.GameObjects.Graphics;
  obj           : GC.PlacedObj;
  tiles         : readonly GC.Tile[];
  baseX         : number;
  baseY         : number;
  ts            : number;
  // 1.0 when functional, 0.45 when inert. Recipes multiply every fillStyle
  // / strokeStyle alpha by this so a dim object reads correctly without
  // recipes having to track functional state per-paint.
  alpha         : number;
  isFunctional  : boolean;
  // Optional. Set by PresentationSceneV2 for the main object pass so
  // recipes can replace their procedural cabinet body with a sprite.
  // Absent from ghost / preview contexts — recipes that consult it must
  // handle `undefined` and fall back to procedural drawing.
  spriteRegistry?: ObjectSpriteRegistry;
}
