export interface SeededRandom {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(array: readonly T[]): T;
  shuffle<T>(array: readonly T[]): T[];
  bool(probability?: number): boolean;
}

export type Seed = string;
