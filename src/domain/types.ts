export interface DesignCues {
  readonly typography: readonly string[];
  readonly colors: readonly string[];
  readonly layoutPatterns: readonly string[];
  readonly uiElements: readonly string[];
}

export interface Era {
  readonly id: string;
  readonly label: string;
  readonly yearStart: number;
  readonly yearEnd: number;
  readonly designCues: DesignCues;
  readonly vocabularyCues: readonly string[];
}

export interface Region {
  readonly id: string;
  readonly label: string;
  readonly language: string;
  readonly tld: string;
  readonly currencySymbol: string;
  readonly vocabularyOverrides: Readonly<Record<string, string>>;
}

export interface Archetype {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly compatibleEraIds: readonly string[];
  readonly compatibleRegionIds: readonly string[];
}

export interface SeededRandom {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(array: readonly T[]): T;
  shuffle<T>(array: readonly T[]): T[];
  bool(probability?: number): boolean;
}

export type Seed = string;

export interface ThemeTypography {
  readonly fontFamily: string;
  readonly headingFont: string;
  readonly monoFont: string;
  readonly baseFontSize: number;
  readonly lineHeight: number;
  readonly headingWeight: number;
}

export interface ThemePalette {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly muted: string;
}

export interface ThemeSpacing {
  readonly unit: number;
  readonly small: number;
  readonly medium: number;
  readonly large: number;
  readonly sectionGap: number;
}

export interface ThemeBorders {
  readonly radius: number;
  readonly width: number;
  readonly style: string;
  readonly color: string;
}

export interface ThemeSurfaces {
  readonly background: string;
  readonly shadow: string;
  readonly texture: string;
}

export interface Theme {
  readonly id: string;
  readonly label: string;
  readonly typography: ThemeTypography;
  readonly palette: ThemePalette;
  readonly spacing: ThemeSpacing;
  readonly borders: ThemeBorders;
  readonly surfaces: ThemeSurfaces;
}
