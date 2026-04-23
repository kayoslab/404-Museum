/**
 * CSS-only background patterns per era.
 *
 * Each pattern is a complete CSS `background` shorthand value built from
 * gradients and/or inline SVG data URIs — no external images required.
 * The renderer picks one per seed and applies it to the page wrapper.
 */

export interface BackgroundPattern {
  readonly id: string;
  readonly css: string;
  /** Override the page text/background colors when the pattern is dark. */
  readonly dark?: boolean;
}

// ---------------------------------------------------------------------------
// Early Web (1995–1999)
//   Tiled textures, starfields, dark backgrounds — the Geocities look.
// ---------------------------------------------------------------------------
const earlyWebPatterns: readonly BackgroundPattern[] = [
  {
    id: 'ew-starfield',
    dark: true,
    css: [
      'radial-gradient(1px 1px at 10% 20%, #fff 50%, transparent 50%)',
      'radial-gradient(1px 1px at 40% 70%, #ccc 50%, transparent 50%)',
      'radial-gradient(1px 1px at 70% 30%, #fff 50%, transparent 50%)',
      'radial-gradient(1px 1px at 85% 80%, #aaa 50%, transparent 50%)',
      'radial-gradient(1px 1px at 25% 55%, #ddd 50%, transparent 50%)',
      '#0a0a2e',
    ].join(', '),
  },
  {
    id: 'ew-diamonds',
    dark: false,
    css: [
      'linear-gradient(45deg, #c0c0c0 25%, transparent 25%)',
      'linear-gradient(-45deg, #c0c0c0 25%, transparent 25%)',
      'linear-gradient(45deg, transparent 75%, #c0c0c0 75%)',
      'linear-gradient(-45deg, transparent 75%, #c0c0c0 75%)',
    ].join(', '),
  },
  {
    id: 'ew-construction',
    dark: false,
    css: 'repeating-linear-gradient(45deg, #f5c842 0px, #f5c842 10px, #222 10px, #222 20px)',
  },
  {
    id: 'ew-midnight',
    dark: true,
    css: 'linear-gradient(180deg, #000033 0%, #000066 50%, #000033 100%)',
  },
  {
    id: 'ew-none',
    dark: false,
    css: '#ffffff',
  },
];

// ---------------------------------------------------------------------------
// Portal Era (2000–2006)
//   Subtle gradients, faint textures, brushed-metal energy.
// ---------------------------------------------------------------------------
const portalEraPatterns: readonly BackgroundPattern[] = [
  {
    id: 'pe-subtle-grid',
    dark: false,
    css: [
      'linear-gradient(#e8e8e8 1px, transparent 1px)',
      'linear-gradient(90deg, #e8e8e8 1px, transparent 1px)',
      '#f5f5f5',
    ].join(', '),
  },
  {
    id: 'pe-blue-header-fade',
    dark: false,
    css: 'linear-gradient(180deg, #d4e4f7 0%, #ffffff 180px)',
  },
  {
    id: 'pe-dotted',
    dark: false,
    css: [
      'radial-gradient(circle, #ccc 1px, transparent 1px)',
      '#f9f9f9',
    ].join(', '),
  },
  {
    id: 'pe-none',
    dark: false,
    css: '#ffffff',
  },
];

// ---------------------------------------------------------------------------
// Web 2.0 (2007–2013)
//   Linen textures, diagonal pinstripes, subtle noise impressions.
// ---------------------------------------------------------------------------
const web2Patterns: readonly BackgroundPattern[] = [
  {
    id: 'w2-pinstripes',
    dark: false,
    css: 'repeating-linear-gradient(120deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
  },
  {
    id: 'w2-linen',
    dark: false,
    css: [
      'linear-gradient(0deg, rgba(0,0,0,0.02) 50%, transparent 50%)',
      'linear-gradient(90deg, rgba(0,0,0,0.02) 50%, transparent 50%)',
      '#f5f0eb',
    ].join(', '),
  },
  {
    id: 'w2-top-glow',
    dark: false,
    css: 'linear-gradient(180deg, #e8f0fe 0%, #ffffff 200px)',
  },
  {
    id: 'w2-none',
    dark: false,
    css: '#ffffff',
  },
];

// ---------------------------------------------------------------------------
// Startup Minimalism (2014–2019)
//   Almost always white/clean. Occasionally a faint geometric accent.
// ---------------------------------------------------------------------------
const startupMinimalPatterns: readonly BackgroundPattern[] = [
  {
    id: 'sm-none',
    dark: false,
    css: '#ffffff',
  },
  {
    id: 'sm-warm-white',
    dark: false,
    css: '#fafaf8',
  },
  {
    id: 'sm-faint-dots',
    dark: false,
    css: [
      'radial-gradient(circle, #e0e0e0 0.5px, transparent 0.5px)',
      '#ffffff',
    ].join(', '),
  },
];

// ---------------------------------------------------------------------------
// Alt-Timeline
//   Scanlines, grids, otherworldly dark surfaces.
// ---------------------------------------------------------------------------
const altTimelinePatterns: readonly BackgroundPattern[] = [
  {
    id: 'at-scanlines',
    dark: true,
    css: [
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      '#1e293b',
    ].join(', '),
  },
  {
    id: 'at-grid',
    dark: true,
    css: [
      'linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)',
      '#1e293b',
    ].join(', '),
  },
  {
    id: 'at-vignette',
    dark: true,
    css: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
  },
];

// ---------------------------------------------------------------------------
// Lookup by era ID
// ---------------------------------------------------------------------------
export const backgroundPatternsByEra: Readonly<Record<string, readonly BackgroundPattern[]>> = {
  'early-web': earlyWebPatterns,
  'portal-era': portalEraPatterns,
  'web2': web2Patterns,
  'startup-minimalism': startupMinimalPatterns,
  'alt-timeline': altTimelinePatterns,
};
