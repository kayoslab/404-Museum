import type { Theme } from '../domain/types';

export function applyTheme(container: HTMLElement, theme: Theme): void {
  const s = container.style;

  // Typography
  s.setProperty('--font-family', theme.typography.fontFamily);
  s.setProperty('--heading-font', theme.typography.headingFont);
  s.setProperty('--mono-font', theme.typography.monoFont);
  s.setProperty('--base-font-size', `${theme.typography.baseFontSize}px`);
  s.setProperty('--line-height', String(theme.typography.lineHeight));
  s.setProperty('--heading-weight', String(theme.typography.headingWeight));

  // Palette
  s.setProperty('--color-primary', theme.palette.primary);
  s.setProperty('--color-secondary', theme.palette.secondary);
  s.setProperty('--color-accent', theme.palette.accent);
  s.setProperty('--color-background', theme.palette.background);
  s.setProperty('--color-surface', theme.palette.surface);
  s.setProperty('--color-text', theme.palette.text);
  s.setProperty('--color-muted', theme.palette.muted);

  // Spacing
  s.setProperty('--spacing-unit', `${theme.spacing.unit}px`);
  s.setProperty('--spacing-small', `${theme.spacing.small}px`);
  s.setProperty('--spacing-medium', `${theme.spacing.medium}px`);
  s.setProperty('--spacing-large', `${theme.spacing.large}px`);
  s.setProperty('--spacing-section-gap', `${theme.spacing.sectionGap}px`);

  // Borders
  s.setProperty('--border-radius', `${theme.borders.radius}px`);
  s.setProperty('--border-width', `${theme.borders.width}px`);
  s.setProperty('--border-style', theme.borders.style);
  s.setProperty('--border-color', theme.borders.color);

  // Surfaces
  s.setProperty('--surface-background', theme.surfaces.background);
  s.setProperty('--surface-shadow', theme.surfaces.shadow);
  s.setProperty('--surface-texture', theme.surfaces.texture);
}
