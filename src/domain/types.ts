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

export interface SiteMetadata {
  readonly siteName: string;
  readonly tagline: string | undefined;
  readonly yearFounded: number;
  readonly statusLabel: string;
  readonly closureReason: string;
  readonly summary: string;
}

export type Seed = string;
