// ObjectSpriteManifest.ts — typed manifest of optional sprite assets
// that may replace the procedural body of a floor object.
//
// Phase 12B scope: SLOT_MACHINE only, one entry per facing. Every other
// object keeps its procedural recipe. Adding sprites for further types
// is a matter of appending entries here and shipping the PNGs.
//
// URLs are routed through import.meta.env.BASE_URL so the build path
// (e.g. /Casino-hotel/) is applied automatically — never hardcode the
// repo path. visibleHeightPx is the height of the alpha-bbox of the
// visible cabinet within the source canvas; the renderer scales sprites
// by this height, not the full canvas height, so transparent margins
// don't shrink the cabinet on screen.
import * as GC from '../../../logic/GameConstants';

export interface ObjectSpriteEntry {
  type             : GC.ObjType;
  facing?          : GC.Orientation;
  key              : string;       // Phaser texture key — must be unique
  url              : string;       // Resolved with BASE_URL
  anchorX          : number;       // Phaser image origin X (0..1)
  anchorY          : number;       // Phaser image origin Y (0..1)
  refTileSize      : number;       // Reference ts the art was authored at
  targetHeightTiles: number;       // Target on-screen height in tile units
  visibleHeightPx  : number;       // Tight alpha-bbox height in source px
}

const BASE = import.meta.env.BASE_URL;

// Each sprite was extracted from the master sheet onto a 480 × 800
// transparent canvas with the cabinet bottom-aligned and horizontally
// centred. anchorX=0.5, anchorY=1.0 places the bottom-centre of the
// sprite at the renderer's chosen world position.
//
// visibleHeightPx values come from the alpha bounding boxes of the
// final shipped PNG content. They drive the scale formula:
//   scale = (ts * targetHeightTiles) / visibleHeightPx
// Re-measure and update if a sprite file is replaced or mirrored.
export const OBJECT_SPRITES: readonly ObjectSpriteEntry[] = [
  {
    type             : GC.ObjType.SLOT_MACHINE,
    facing           : 'S',
    key              : 'v2-slot-machine-s',
    url              : `${BASE}assets/v2/objects/slot-machine/slot-machine-s.png`,
    anchorX          : 0.5,
    anchorY          : 1.0,
    refTileSize      : 46,
    targetHeightTiles: 2.10,
    visibleHeightPx  : 730,
  },
  {
    type             : GC.ObjType.SLOT_MACHINE,
    facing           : 'N',
    key              : 'v2-slot-machine-n',
    url              : `${BASE}assets/v2/objects/slot-machine/slot-machine-n.png`,
    anchorX          : 0.5,
    anchorY          : 1.0,
    refTileSize      : 46,
    targetHeightTiles: 2.10,
    visibleHeightPx  : 698,
  },
  {
    type             : GC.ObjType.SLOT_MACHINE,
    facing           : 'E',
    key              : 'v2-slot-machine-e',
    url              : `${BASE}assets/v2/objects/slot-machine/slot-machine-e.png`,
    anchorX          : 0.5,
    anchorY          : 1.0,
    refTileSize      : 46,
    targetHeightTiles: 2.10,
    visibleHeightPx  : 743,
  },
  {
    type             : GC.ObjType.SLOT_MACHINE,
    facing           : 'W',
    key              : 'v2-slot-machine-w',
    url              : `${BASE}assets/v2/objects/slot-machine/slot-machine-w.png`,
    anchorX          : 0.5,
    anchorY          : 1.0,
    refTileSize      : 46,
    targetHeightTiles: 2.10,
    visibleHeightPx  : 680,
  },
];
