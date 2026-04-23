import type { SeededRandom } from "./types";

const SEED_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SEED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

function hashString(s: string): number {
  let hash = 2166136261;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): SeededRandom {
  const raw = mulberry32(hashString(seed));

  return {
    next: raw,

    int(min: number, max: number): number {
      return min + Math.floor(raw() * (max - min + 1));
    },

    pick<T>(array: readonly T[]): T {
      const index = Math.floor(raw() * array.length);
      return array[index] as T;
    },

    shuffle<T>(array: readonly T[]): T[] {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(raw() * (i + 1));
        [result[i], result[j]] = [result[j] as T, result[i] as T];
      }
      return result;
    },

    bool(probability = 0.5): boolean {
      return raw() < probability;
    },
  };
}

export function deriveSeed(parentSeed: string, key: string): string {
  const combined = `${parentSeed}:${key}`;
  const hash = hashString(combined);
  const rng = mulberry32(hash);

  let result = "";
  const len = 12;
  for (let i = 0; i < len; i++) {
    result += SEED_CHARS[Math.floor(rng() * SEED_CHARS.length)];
  }
  return result;
}

export function generateSeed(): string {
  // Uses Math.random() intentionally — this is for initial seed creation only, not generation
  return Array.from({ length: 12 }, () =>
    SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)],
  ).join("");
}

export function isValidSeed(s: string): boolean {
  return s.length > 0 && SEED_PATTERN.test(s);
}
