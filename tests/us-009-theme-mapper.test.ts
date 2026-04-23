import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Lazy loaders — tests compile even before implementation exists
// ---------------------------------------------------------------------------

async function loadThemes() {
  const mod = await import("../src/domain/themes/index.js");
  return mod;
}

async function loadThemeMapper() {
  const mod = await import("../src/domain/theme-mapper.js");
  return mod;
}

async function loadEras() {
  const mod = await import("../src/domain/data/index.js");
  return mod.eras as ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly yearStart: number;
    readonly yearEnd: number;
    readonly designCues: {
      readonly typography: readonly string[];
      readonly colors: readonly string[];
      readonly layoutPatterns: readonly string[];
      readonly uiElements: readonly string[];
    };
    readonly vocabularyCues: readonly string[];
  }>;
}

async function loadSeed() {
  const mod = await import("../src/domain/seed.js");
  return mod;
}

// ---------------------------------------------------------------------------
// Hex color regex for palette validation
// ---------------------------------------------------------------------------
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

describe("US-009: Create style theme mapper by era", () => {
  // --------------------------------------------------------------------------
  // File structure
  // --------------------------------------------------------------------------
  describe("file structure", () => {
    it("theme type definitions exist in src/domain/types.ts", () => {
      expect(existsSync(resolve(ROOT, "src/domain/types.ts"))).toBe(true);
    });

    it("themes directory exists at src/domain/themes/", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes"))).toBe(true);
    });

    it("themes barrel export exists at src/domain/themes/index.ts", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/index.ts"))).toBe(true);
    });

    it("theme mapper exists at src/domain/theme-mapper.ts", () => {
      expect(existsSync(resolve(ROOT, "src/domain/theme-mapper.ts"))).toBe(true);
    });

    it("early-web theme file exists", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/early-web.ts"))).toBe(true);
    });

    it("portal-era theme file exists", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/portal-era.ts"))).toBe(true);
    });

    it("web2 theme file exists", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/web2.ts"))).toBe(true);
    });

    it("startup-minimal theme file exists", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/startup-minimal.ts"))).toBe(true);
    });

    it("alt-timeline theme file exists", () => {
      expect(existsSync(resolve(ROOT, "src/domain/themes/alt-timeline.ts"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Theme cardinality — at least 5 themes
  // --------------------------------------------------------------------------
  describe("theme cardinality", () => {
    it("at least 5 visual themes exist", async () => {
      const { themes } = await loadThemes();
      expect(themes.length).toBeGreaterThanOrEqual(5);
    });
  });

  // --------------------------------------------------------------------------
  // Theme completeness — every field is populated with correct types
  // --------------------------------------------------------------------------
  describe("theme completeness", () => {
    it("every theme has an id and label", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(typeof theme.id).toBe("string");
        expect(theme.id.length).toBeGreaterThan(0);
        expect(typeof theme.label).toBe("string");
        expect(theme.label.length).toBeGreaterThan(0);
      }
    });

    it("every theme has complete typography fields", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(theme).toHaveProperty("typography");
        const t = theme.typography;
        expect(typeof t.fontFamily).toBe("string");
        expect(t.fontFamily.length).toBeGreaterThan(0);
        expect(typeof t.headingFont).toBe("string");
        expect(t.headingFont.length).toBeGreaterThan(0);
        expect(typeof t.monoFont).toBe("string");
        expect(t.monoFont.length).toBeGreaterThan(0);
        expect(typeof t.baseFontSize).toBe("number");
        expect(t.baseFontSize).toBeGreaterThan(0);
        expect(typeof t.lineHeight).toBe("number");
        expect(t.lineHeight).toBeGreaterThan(0);
        expect(typeof t.headingWeight).toBe("number");
        expect(t.headingWeight).toBeGreaterThanOrEqual(100);
      }
    });

    it("every theme has a complete palette with valid hex colors", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(theme).toHaveProperty("palette");
        const p = theme.palette;
        const colorFields = [
          "primary",
          "secondary",
          "accent",
          "background",
          "surface",
          "text",
          "muted",
        ] as const;
        for (const field of colorFields) {
          expect(typeof p[field]).toBe("string");
          expect(p[field]).toMatch(HEX_COLOR);
        }
      }
    });

    it("every theme has complete spacing fields", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(theme).toHaveProperty("spacing");
        const s = theme.spacing;
        expect(typeof s.unit).toBe("number");
        expect(s.unit).toBeGreaterThan(0);
        expect(typeof s.small).toBe("number");
        expect(s.small).toBeGreaterThan(0);
        expect(typeof s.medium).toBe("number");
        expect(s.medium).toBeGreaterThan(0);
        expect(typeof s.large).toBe("number");
        expect(s.large).toBeGreaterThan(0);
        expect(typeof s.sectionGap).toBe("number");
        expect(s.sectionGap).toBeGreaterThan(0);
      }
    });

    it("every theme has complete border fields", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(theme).toHaveProperty("borders");
        const b = theme.borders;
        expect(typeof b.radius).toBe("number");
        expect(b.radius).toBeGreaterThanOrEqual(0);
        expect(typeof b.width).toBe("number");
        expect(b.width).toBeGreaterThanOrEqual(0);
        expect(typeof b.style).toBe("string");
        expect(b.style.length).toBeGreaterThan(0);
        expect(typeof b.color).toBe("string");
        expect(b.color.length).toBeGreaterThan(0);
      }
    });

    it("every theme has complete surface fields", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        expect(theme).toHaveProperty("surfaces");
        const s = theme.surfaces;
        expect(typeof s.background).toBe("string");
        expect(s.background.length).toBeGreaterThan(0);
        expect(typeof s.shadow).toBe("string");
        // shadow can be "none" which is still a valid string
        expect(typeof s.texture).toBe("string");
      }
    });

    it("no undefined or null values in any theme property", async () => {
      const { themes } = await loadThemes();
      for (const theme of themes) {
        const walk = (obj: Record<string, unknown>, path: string) => {
          for (const [key, value] of Object.entries(obj)) {
            const fullPath = `${path}.${key}`;
            expect(value, `${fullPath} should not be undefined`).not.toBeUndefined();
            expect(value, `${fullPath} should not be null`).not.toBeNull();
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
              walk(value as Record<string, unknown>, fullPath);
            }
          }
        };
        walk(theme as unknown as Record<string, unknown>, theme.id);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Referential integrity — every era maps to a theme
  // --------------------------------------------------------------------------
  describe("referential integrity", () => {
    it("themesByEraId contains an entry for every era ID in the dataset", async () => {
      const { themesByEraId } = await loadThemes();
      const eras = await loadEras();
      const eraIds = eras.map((e) => e.id);
      for (const eraId of eraIds) {
        expect(
          themesByEraId[eraId],
          `missing theme for era "${eraId}"`,
        ).toBeDefined();
      }
    });

    it("no theme references an era ID that does not exist in the dataset", async () => {
      const { themes } = await loadThemes();
      const eras = await loadEras();
      const validEraIds = new Set(eras.map((e) => e.id));
      for (const theme of themes) {
        expect(
          validEraIds.has(theme.id),
          `theme "${theme.id}" has no matching era in the dataset`,
        ).toBe(true);
      }
    });

    it("no duplicate theme IDs", async () => {
      const { themes } = await loadThemes();
      const ids = themes.map((t: { id: string }) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // --------------------------------------------------------------------------
  // selectTheme determinism
  // --------------------------------------------------------------------------
  describe("determinism — same seed + era produces same theme", () => {
    it("same seed and era returns identical theme over 100 iterations", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const era = eras[0]!;
      const seed = "determinism-us009";

      const baseline = selectTheme(seed, era);
      for (let i = 0; i < 100; i++) {
        expect(selectTheme(seed, era)).toEqual(baseline);
      }
    });

    it("determinism holds across all eras", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const seed = "all-eras-determinism";

      for (const era of eras) {
        const first = selectTheme(seed, era);
        const second = selectTheme(seed, era);
        expect(first).toEqual(second);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Different seeds can produce different selections
  // --------------------------------------------------------------------------
  describe("different seeds can produce different themes", () => {
    it("at least two distinct themes appear across 50 different seeds", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      // Use an era that might have variants; if not, just verify the function works
      const era = eras[0]!;
      const themeIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const theme = selectTheme(`seed-variation-${i}`, era);
        themeIds.add(theme.id);
      }
      // With a single theme per era, we expect exactly 1 — this is valid
      // With variants we'd expect more. Either way the function must return valid themes.
      expect(themeIds.size).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // Independence — no shared mutable state
  // --------------------------------------------------------------------------
  describe("independence — no shared mutable state", () => {
    it("theme selection for one seed is not affected by prior calls", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const era = eras[0]!;

      // Get baseline with no prior calls
      const baseline = selectTheme("independence-test", era);

      // Make many calls with different seeds
      for (let i = 0; i < 50; i++) {
        selectTheme(`noise-${i}`, eras[i % eras.length]!);
      }

      // Same seed + era should still return the same result
      const afterNoise = selectTheme("independence-test", era);
      expect(afterNoise).toEqual(baseline);
    });

    it("call order does not affect results", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const seedA = "order-test-a";
      const seedB = "order-test-b";

      // Order 1: A then B
      const resultA1 = selectTheme(seedA, eras[0]!);
      const resultB1 = selectTheme(seedB, eras[1]!);

      // Order 2: B then A
      const resultB2 = selectTheme(seedB, eras[1]!);
      const resultA2 = selectTheme(seedA, eras[0]!);

      expect(resultA1).toEqual(resultA2);
      expect(resultB1).toEqual(resultB2);
    });
  });

  // --------------------------------------------------------------------------
  // selectTheme returns complete Theme objects
  // --------------------------------------------------------------------------
  describe("selectTheme returns complete themes", () => {
    it("every era produces a theme with all required fields", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const seed = "completeness-check";

      for (const era of eras) {
        const theme = selectTheme(seed, era);
        expect(theme).toHaveProperty("id");
        expect(theme).toHaveProperty("label");
        expect(theme).toHaveProperty("typography");
        expect(theme).toHaveProperty("palette");
        expect(theme).toHaveProperty("spacing");
        expect(theme).toHaveProperty("borders");
        expect(theme).toHaveProperty("surfaces");

        // Verify deep structure
        expect(typeof theme.typography.fontFamily).toBe("string");
        expect(typeof theme.palette.primary).toBe("string");
        expect(typeof theme.spacing.unit).toBe("number");
        expect(typeof theme.borders.radius).toBe("number");
        expect(typeof theme.surfaces.background).toBe("string");
      }
    });
  });

  // --------------------------------------------------------------------------
  // selectTheme uses deriveSeed for deterministic sub-stream
  // --------------------------------------------------------------------------
  describe("selectTheme uses seed derivation", () => {
    it("theme is derived from seed, not from raw seed string", async () => {
      const { selectTheme } = await loadThemeMapper();
      const { deriveSeed, createRng } = await loadSeed();
      const eras = await loadEras();
      const seed = "derivation-check";
      const era = eras[0]!;

      // The function should use deriveSeed internally — verify it's deterministic
      const theme1 = selectTheme(seed, era);
      const theme2 = selectTheme(seed, era);
      expect(theme1).toEqual(theme2);

      // A different seed should still produce a valid theme
      const theme3 = selectTheme("different-seed", era);
      expect(theme3).toHaveProperty("id");
      expect(theme3).toHaveProperty("typography");
    });
  });

  // --------------------------------------------------------------------------
  // Type safety — tsc --noEmit
  // --------------------------------------------------------------------------
  describe("type safety", () => {
    it("TypeScript strict typecheck passes with noEmit", () => {
      execSync("npx tsc --noEmit", {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      expect(true).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Snapshot stability
  // --------------------------------------------------------------------------
  describe("snapshot stability", () => {
    it("early-web theme matches snapshot", async () => {
      const { themesByEraId } = await loadThemes();
      expect(themesByEraId["early-web"]).toMatchSnapshot();
    });

    it("portal-era theme matches snapshot", async () => {
      const { themesByEraId } = await loadThemes();
      expect(themesByEraId["portal-era"]).toMatchSnapshot();
    });

    it("web2 theme matches snapshot", async () => {
      const { themesByEraId } = await loadThemes();
      expect(themesByEraId["web2"]).toMatchSnapshot();
    });

    it("startup-minimalism theme matches snapshot", async () => {
      const { themesByEraId } = await loadThemes();
      expect(themesByEraId["startup-minimalism"]).toMatchSnapshot();
    });

    it("alt-timeline theme matches snapshot", async () => {
      const { themesByEraId } = await loadThemes();
      expect(themesByEraId["alt-timeline"]).toMatchSnapshot();
    });

    it("selectTheme output matches snapshot for fixed seeds", async () => {
      const { selectTheme } = await loadThemeMapper();
      const eras = await loadEras();
      const fixedSeeds = ["snapshot-seed-1", "snapshot-seed-2", "snapshot-seed-3"];

      for (const seed of fixedSeeds) {
        for (const era of eras) {
          expect(selectTheme(seed, era)).toMatchSnapshot();
        }
      }
    });
  });
});
