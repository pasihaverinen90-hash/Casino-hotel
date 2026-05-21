// PreloadAssetsV2.ts — registers V2 sprite textures with the Phaser
// loader. Called from PresentationSceneV2.preload(). Missing image files
// don't crash the scene — the registry checks textures.exists() before
// drawing and falls back to the procedural recipe.
import Phaser from 'phaser';
import { OBJECT_SPRITES } from './ObjectSpriteManifest';

export function preloadObjectSpritesV2(scene: Phaser.Scene): void {
  for (const entry of OBJECT_SPRITES) {
    if (scene.textures.exists(entry.key)) continue;
    scene.load.image(entry.key, entry.url);
  }
}
