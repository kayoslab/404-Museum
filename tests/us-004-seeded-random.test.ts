import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  createRng,
  deriveSeed,
  isValidSeed,
  generateSeed,
} from "../src/domain/seed";
import type { SeededRandom } from "../src/domain/types";

const ROOT = resolve(__dirname, "..");

describe("US-004: Deterministic seeded random utility", () => {
  describe("determinism — same seed produces same sequence", () => {
    it("two RNGs with the same seed produce identical .next() sequences", () => {
      const rng1 = createRng("test-seed-alpha");
      const rng2 = createRng("test-seed-alpha");
      const seq1 = Array.from({ length: 100 }, () => rng1.next());
      const seq2 = Array.from({ length: 100 }, () => rng2.next());
      expect(seq1).toEqual(seq2);
    });

    it("determinism holds across all methods (int, pick, bool, shuffle)", () => {
      const items = ["a", "b", "c", "d", "e"];
      const run = (seed: string) => {
        const rng = createRng(seed);
        return {
          nextVals: Array.from({ length: 10 }, () => rng.next()),
          intVals: Array.from({ length: 10 }, () => rng.int(0, 100)),
          picks: Array.from({ length: 10 }, () => rng.pick(items)),
          bools: Array.from({ length: 10 }, () => rng.bool()),
          shuffled: rng.shuffle(items),
        };
      };
      expect(run("determinism-check")).toEqual(run("determinism-check"));
    });
  });

  describe("different seeds produce different sequences", () => {
    it("different seed strings yield different .next() sequences", () => {
      const rng1 = createRng("seed-one");
      const rng2 = createRng("seed-two");
      const seq1 = Array.from({ length: 20 }, () => rng1.next());
      const seq2 = Array.from({ length: 20 }, () => rng2.next());
      expect(seq1).not.toEqual(seq2);
    });

    it("seeds differing by one character yield different sequences", () => {
      const rng1 = createRng("abc");
      const rng2 = createRng("abd");
      const seq1 = Array.from({ length: 10 }, () => rng1.next());
      const seq2 = Array.from({ length: 10 }, () => rng2.next());
      expect(seq1).not.toEqual(seq2);
    });
  });

  describe("next() returns values in [0, 1)", () => {
    it("all values are within range over 1000 calls", () => {
      const rng = createRng("range-test");
      for (let i = 0; i < 1000; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("int(min, max) bounds and distribution", () => {
    it("returns values within [min, max] inclusive over many iterations", () => {
      const rng = createRng("int-bounds");
      for (let i = 0; i < 1000; i++) {
        const val = rng.int(5, 15);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(15);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it("all values in range appear at least once (rough distribution check)", () => {
      const rng = createRng("int-distribution");
      const counts = new Map<number, number>();
      for (let i = 0; i < 10_000; i++) {
        const val = rng.int(0, 10);
        counts.set(val, (counts.get(val) ?? 0) + 1);
      }
      // Every value from 0 to 10 should appear at least once
      for (let v = 0; v <= 10; v++) {
        expect(counts.get(v)).toBeGreaterThan(0);
      }
    });
  });

  describe("pick()", () => {
    it("returns an element from the provided array", () => {
      const rng = createRng("pick-test");
      const items = ["apple", "banana", "cherry", "date"];
      for (let i = 0; i < 50; i++) {
        expect(items).toContain(rng.pick(items));
      }
    });

    it("is deterministic with the same seed", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const picks1 = Array.from({ length: 20 }, () =>
        createRng("pick-det").pick(items),
      );
      // Each call gets a fresh RNG with same seed, so first pick is always the same
      const uniquePicks = new Set(picks1);
      expect(uniquePicks.size).toBe(1);
    });
  });

  describe("shuffle()", () => {
    it("returns the same permutation for the same seed", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8];
      const shuffled1 = createRng("shuffle-det").shuffle(items);
      const shuffled2 = createRng("shuffle-det").shuffle(items);
      expect(shuffled1).toEqual(shuffled2);
    });

    it("returns a different permutation for a different seed", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled1 = createRng("shuffle-a").shuffle(items);
      const shuffled2 = createRng("shuffle-b").shuffle(items);
      expect(shuffled1).not.toEqual(shuffled2);
    });

    it("preserves all original elements (same length, same set)", () => {
      const items = [10, 20, 30, 40, 50];
      const shuffled = createRng("shuffle-preserve").shuffle(items);
      expect(shuffled).toHaveLength(items.length);
      expect([...shuffled].sort((a, b) => a - b)).toEqual(
        [...items].sort((a, b) => a - b),
      );
    });

    it("does not mutate the original array", () => {
      const items = [1, 2, 3, 4, 5];
      const original = [...items];
      createRng("shuffle-immutable").shuffle(items);
      expect(items).toEqual(original);
    });
  });

  describe("bool()", () => {
    it("returns a boolean value", () => {
      const rng = createRng("bool-type");
      for (let i = 0; i < 20; i++) {
        expect(typeof rng.bool()).toBe("boolean");
      }
    });

    it("respects probability parameter — probability=0 always false", () => {
      const rng = createRng("bool-zero");
      for (let i = 0; i < 100; i++) {
        expect(rng.bool(0)).toBe(false);
      }
    });

    it("respects probability parameter — probability=1 always true", () => {
      const rng = createRng("bool-one");
      for (let i = 0; i < 100; i++) {
        expect(rng.bool(1)).toBe(true);
      }
    });

    it("default probability (~0.5) produces both true and false", () => {
      const rng = createRng("bool-default");
      const results = Array.from({ length: 200 }, () => rng.bool());
      expect(results).toContain(true);
      expect(results).toContain(false);
    });
  });

  describe("deriveSeed()", () => {
    it("same parent + same key → same derived seed", () => {
      expect(deriveSeed("parent", "child")).toBe(deriveSeed("parent", "child"));
    });

    it("same parent + different key → different derived seed", () => {
      expect(deriveSeed("parent", "key-a")).not.toBe(
        deriveSeed("parent", "key-b"),
      );
    });

    it("different parent + same key → different derived seed", () => {
      expect(deriveSeed("parent-a", "key")).not.toBe(
        deriveSeed("parent-b", "key"),
      );
    });

    it("derived seed is a valid URL-safe string", () => {
      const derived = deriveSeed("my-seed", "section");
      expect(isValidSeed(derived)).toBe(true);
    });

    it("derived sub-stream produces deterministic RNG sequences", () => {
      const sub1 = deriveSeed("root", "module-a");
      const sub2 = deriveSeed("root", "module-a");
      const seq1 = Array.from({ length: 50 }, () => createRng(sub1).next());
      const seq2 = Array.from({ length: 50 }, () => createRng(sub2).next());
      expect(seq1).toEqual(seq2);
    });

    it("sub-seed isolation: parent RNG state does not affect derived seed", () => {
      // First run: derive immediately
      const derived1 = deriveSeed("root-seed", "sub-key");
      const seq1 = Array.from({ length: 20 }, () =>
        createRng(derived1).next(),
      );

      // Second run: consume some parent RNG values first, then derive
      const parentRng = createRng("root-seed");
      for (let i = 0; i < 50; i++) parentRng.next(); // consume values
      const derived2 = deriveSeed("root-seed", "sub-key");
      const seq2 = Array.from({ length: 20 }, () =>
        createRng(derived2).next(),
      );

      // deriveSeed is pure — doesn't depend on RNG state
      expect(derived1).toBe(derived2);
      expect(seq1).toEqual(seq2);
    });
  });

  describe("isValidSeed()", () => {
    it("accepts alphanumeric strings", () => {
      expect(isValidSeed("abc123")).toBe(true);
      expect(isValidSeed("ABC")).toBe(true);
      expect(isValidSeed("a1B2c3")).toBe(true);
    });

    it("accepts strings with dashes and underscores", () => {
      expect(isValidSeed("my-seed")).toBe(true);
      expect(isValidSeed("my_seed")).toBe(true);
      expect(isValidSeed("a-b_c-d")).toBe(true);
    });

    it("rejects empty string", () => {
      expect(isValidSeed("")).toBe(false);
    });

    it("rejects strings with spaces", () => {
      expect(isValidSeed("has space")).toBe(false);
    });

    it("rejects strings with special characters", () => {
      expect(isValidSeed("no!way")).toBe(false);
      expect(isValidSeed("no@way")).toBe(false);
      expect(isValidSeed("path/here")).toBe(false);
      expect(isValidSeed("query=val")).toBe(false);
      expect(isValidSeed("a&b")).toBe(false);
    });

    it("rejects strings with unicode characters", () => {
      expect(isValidSeed("héllo")).toBe(false);
      expect(isValidSeed("日本語")).toBe(false);
    });
  });

  describe("generateSeed()", () => {
    it("produces a valid URL-safe seed", () => {
      const seed = generateSeed();
      expect(isValidSeed(seed)).toBe(true);
    });

    it("produces seeds matching /^[a-zA-Z0-9_-]+$/", () => {
      for (let i = 0; i < 100; i++) {
        const seed = generateSeed();
        expect(seed).toMatch(/^[a-zA-Z0-9_-]+$/);
      }
    });

    it("produces seeds of reasonable length (8–16 chars)", () => {
      for (let i = 0; i < 100; i++) {
        const seed = generateSeed();
        expect(seed.length).toBeGreaterThanOrEqual(8);
        expect(seed.length).toBeLessThanOrEqual(16);
      }
    });

    it("produces different seeds on successive calls (non-deterministic)", () => {
      const seeds = new Set(Array.from({ length: 20 }, () => generateSeed()));
      // With 20 random seeds, we should get at least 2 unique values
      expect(seeds.size).toBeGreaterThan(1);
    });
  });

  describe("edge case seeds", () => {
    it("single character seed produces valid output", () => {
      const rng = createRng("a");
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it("numeric-only seed works", () => {
      const rng = createRng("1234567890");
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it("dash-underscore-only seed works", () => {
      const rng = createRng("---___---");
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it("very long seed works", () => {
      const longSeed = "a".repeat(1000);
      const rng = createRng(longSeed);
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it("very long seed is still deterministic", () => {
      const longSeed = "x".repeat(500);
      const seq1 = Array.from({ length: 10 }, () =>
        createRng(longSeed).next(),
      );
      const seq2 = Array.from({ length: 10 }, () =>
        createRng(longSeed).next(),
      );
      expect(seq1).toEqual(seq2);
    });
  });

  describe("SeededRandom interface compliance", () => {
    it("createRng returns an object with all required methods", () => {
      const rng: SeededRandom = createRng("interface-check");
      expect(typeof rng.next).toBe("function");
      expect(typeof rng.int).toBe("function");
      expect(typeof rng.pick).toBe("function");
      expect(typeof rng.shuffle).toBe("function");
      expect(typeof rng.bool).toBe("function");
    });
  });

  describe("no Math.random() in generator code", () => {
    it("src/ files do not call Math.random() except in generateSeed", () => {
      const srcDir = resolve(ROOT, "src");
      const tsFiles = collectTsFiles(srcDir);

      const violations: string[] = [];
      for (const filePath of tsFiles) {
        const content = readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!;
          if (line.includes("Math.random")) {
            const relativePath = filePath.replace(ROOT + "/", "");
            // Allow Math.random only in generateSeed function
            if (
              relativePath === "src/domain/seed.ts" &&
              isInsideGenerateSeed(content, i)
            ) {
              continue;
            }
            violations.push(`${relativePath}:${i + 1}: ${line.trim()}`);
          }
        }
      }

      expect(
        violations,
        `Math.random() found outside generateSeed:\n${violations.join("\n")}`,
      ).toHaveLength(0);
    });
  });
});

/** Recursively collect all .ts files in a directory */
function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

/** Rough check: is line index inside a function named generateSeed? */
function isInsideGenerateSeed(content: string, lineIndex: number): boolean {
  const lines = content.split("\n");
  // Walk backwards from the line to find the nearest function declaration
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i]!;
    if (/function\s+generateSeed/.test(line) || /generateSeed\s*[=(]/.test(line)) {
      return true;
    }
    // If we hit another function declaration first, we're not in generateSeed
    if (i < lineIndex && /^(export\s+)?(function|const|let|var)\s+\w/.test(line.trim())) {
      return false;
    }
  }
  return false;
}
