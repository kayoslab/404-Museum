import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRng, deriveSeed } from "../src/domain/seed";

const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Lazy imports — tests compile even before implementation exists
// ---------------------------------------------------------------------------
async function loadGenerator() {
  const mod = await import("../src/domain/generators/index.js");
  return mod.generateName as (
    rng: ReturnType<typeof createRng>,
    archetype: { id: string; [k: string]: unknown },
    region: { id: string; tld: string; [k: string]: unknown },
  ) => {
    companyName: string;
    tagline?: string;
    domain: string;
    archetype: string;
  };
}

async function loadData() {
  const mod = await import("../src/domain/data/index.js");
  return {
    archetypes: mod.archetypes as ReadonlyArray<{
      id: string;
      label: string;
      compatibleRegionIds: readonly string[];
      [k: string]: unknown;
    }>,
    regions: mod.regions as ReadonlyArray<{
      id: string;
      tld: string;
      language: string;
      [k: string]: unknown;
    }>,
  };
}

// Brand safety denylist — must match what the generator uses
const BRAND_DENYLIST = [
  "google",
  "apple",
  "amazon",
  "lufthansa",
  "microsoft",
  "facebook",
  "twitter",
  "netflix",
  "spotify",
  "uber",
  "ryanair",
  "easyjet",
  "mozilla",
  "oracle",
  "samsung",
  "boeing",
];

// All 8 archetypes paired with fixed seeds for snapshot coverage
const ARCHETYPE_IDS = [
  "budget-airline",
  "os-vendor",
  "media-startup",
  "mmorpg-guild",
  "webmail-provider",
  "e-commerce-shop",
  "forum-community",
  "personal-homepage",
] as const;

describe("US-007: Generate believable fake names", () => {
  // --------------------------------------------------------------------------
  // File structure
  // --------------------------------------------------------------------------
  describe("file structure", () => {
    it("name generator module exists at src/domain/generators/name-generator.ts", () => {
      expect(
        existsSync(resolve(ROOT, "src/domain/generators/name-generator.ts")),
      ).toBe(true);
    });

    it("name fragment dataset exists at src/domain/data/name-fragments.ts", () => {
      expect(
        existsSync(resolve(ROOT, "src/domain/data/name-fragments.ts")),
      ).toBe(true);
    });

    it("generators barrel export exists at src/domain/generators/index.ts", () => {
      expect(
        existsSync(resolve(ROOT, "src/domain/generators/index.ts")),
      ).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // GeneratedName shape
  // --------------------------------------------------------------------------
  describe("GeneratedName structure", () => {
    it("generateName returns an object with companyName, domain, and archetype", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();
      const rng = createRng("shape-test");
      const result = generateName(rng, archetypes[0]!, regions[0]!);

      expect(result).toHaveProperty("companyName");
      expect(result).toHaveProperty("domain");
      expect(result).toHaveProperty("archetype");
      expect(typeof result.companyName).toBe("string");
      expect(typeof result.domain).toBe("string");
      expect(typeof result.archetype).toBe("string");
      expect(result.companyName.length).toBeGreaterThan(0);
      expect(result.domain.length).toBeGreaterThan(0);
    });

    it("tagline is either a string or undefined", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();
      // Generate several to hit both cases
      for (let i = 0; i < 20; i++) {
        const rng = createRng(`tagline-check-${i}`);
        const result = generateName(rng, archetypes[0]!, regions[0]!);
        if (result.tagline !== undefined) {
          expect(typeof result.tagline).toBe("string");
          expect(result.tagline.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Determinism — same seed + archetype + region = identical output
  // --------------------------------------------------------------------------
  describe("determinism", () => {
    it("same seed, archetype, and region produce identical names every time", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        const rng1 = createRng("determinism-check");
        const rng2 = createRng("determinism-check");
        const result1 = generateName(rng1, arch, regions[0]!);
        const result2 = generateName(rng2, arch, regions[0]!);
        expect(result1).toEqual(result2);
      }
    });

    it("name generation uses the seeded random utility (not Math.random)", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      // Run 50 times with same seed — must always produce same result
      const results = Array.from({ length: 50 }, () => {
        const rng = createRng("rng-discipline");
        return generateName(rng, archetypes[0]!, regions[0]!);
      });

      const first = results[0];
      for (const r of results) {
        expect(r).toEqual(first);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Cross-seed uniqueness
  // --------------------------------------------------------------------------
  describe("cross-seed uniqueness", () => {
    it("different seeds produce different names for the same archetype and region", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      const names = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const rng = createRng(`unique-seed-${i}`);
        const result = generateName(rng, archetypes[0]!, regions[0]!);
        names.add(result.companyName);
      }
      // With 30 different seeds, we should get many distinct names
      expect(names.size).toBeGreaterThan(5);
    });
  });

  // --------------------------------------------------------------------------
  // Archetype variation — names feel different per archetype
  // --------------------------------------------------------------------------
  describe("archetype variation", () => {
    it("different archetypes produce different name distributions", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      const namesByArchetype = new Map<string, string[]>();
      for (const arch of archetypes) {
        const names: string[] = [];
        for (let i = 0; i < 10; i++) {
          const rng = createRng(`archvar-${i}`);
          names.push(generateName(rng, arch, regions[0]!).companyName);
        }
        namesByArchetype.set(arch.id, names);
      }

      // At least some archetypes must produce entirely different sets
      const allSets = [...namesByArchetype.values()];
      let distinctPairs = 0;
      for (let i = 0; i < allSets.length; i++) {
        for (let j = i + 1; j < allSets.length; j++) {
          const overlap = allSets[i]!.filter((n) => allSets[j]!.includes(n));
          if (overlap.length < allSets[i]!.length) {
            distinctPairs++;
          }
        }
      }
      // Most archetype pairs should differ
      expect(distinctPairs).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // German-flavored names
  // --------------------------------------------------------------------------
  describe("German-flavored names", () => {
    it("de-de region produces German-sounding names for multiple archetypes", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();
      const deRegion = regions.find((r) => r.id === "de-de")!;

      const germanNames: string[] = [];
      for (const arch of archetypes) {
        for (let i = 0; i < 5; i++) {
          const rng = createRng(`german-${arch.id}-${i}`);
          germanNames.push(generateName(rng, arch, deRegion).companyName);
        }
      }

      // At least some names should contain German-looking fragments
      // (compound words, common German business suffixes/prefixes)
      expect(germanNames.length).toBeGreaterThanOrEqual(40);
      // Snapshot the full set for manual review of German plausibility
      expect(germanNames).toMatchSnapshot();
    });

    it("de-de names have .de domain TLD", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();
      const deRegion = regions.find((r) => r.id === "de-de")!;

      for (const arch of archetypes) {
        const rng = createRng(`de-tld-${arch.id}`);
        const result = generateName(rng, arch, deRegion);
        expect(result.domain).toMatch(/\.de$/);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Domain formatting
  // --------------------------------------------------------------------------
  describe("domain formatting", () => {
    it("domain ends with the correct TLD for each region", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      for (const region of regions) {
        const rng = createRng(`tld-${region.id}`);
        const result = generateName(rng, archetypes[0]!, region);
        expect(result.domain.endsWith(region.tld)).toBe(true);
      }
    });

    it("domain is lowercased and contains no spaces", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        for (const region of regions) {
          const rng = createRng(`domain-format-${arch.id}-${region.id}`);
          const result = generateName(rng, arch, region);
          expect(result.domain).toBe(result.domain.toLowerCase());
          expect(result.domain).not.toMatch(/\s/);
        }
      }
    });

    it("domain has a plausible structure (name + TLD)", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        const rng = createRng(`domain-struct-${arch.id}`);
        const result = generateName(rng, archetypes[0]!, regions[0]!);
        // Should have at least a name part before the TLD
        const parts = result.domain.split(".");
        expect(parts.length).toBeGreaterThanOrEqual(2);
        expect(parts[0]!.length).toBeGreaterThan(0);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Brand safety — no parody or imitation of famous brands
  // --------------------------------------------------------------------------
  describe("brand safety", () => {
    it("generated names do not contain denylist brand substrings (100+ names)", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      const violations: string[] = [];

      for (let i = 0; i < 150; i++) {
        const arch = archetypes[i % archetypes.length]!;
        const region = regions[i % regions.length]!;
        const rng = createRng(`brand-safety-${i}`);
        const result = generateName(rng, arch, region);
        const lower = result.companyName.toLowerCase();

        for (const brand of BRAND_DENYLIST) {
          if (lower.includes(brand)) {
            violations.push(
              `Seed "brand-safety-${i}" produced "${result.companyName}" containing "${brand}"`,
            );
          }
        }
      }

      expect(
        violations,
        `Brand denylist violations found:\n${violations.join("\n")}`,
      ).toHaveLength(0);
    });

    it("generated domains do not contain denylist brand substrings", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      const violations: string[] = [];

      for (let i = 0; i < 100; i++) {
        const arch = archetypes[i % archetypes.length]!;
        const region = regions[i % regions.length]!;
        const rng = createRng(`brand-domain-${i}`);
        const result = generateName(rng, arch, region);
        const lower = result.domain.toLowerCase();

        for (const brand of BRAND_DENYLIST) {
          if (lower.includes(brand)) {
            violations.push(
              `Seed "brand-domain-${i}" produced domain "${result.domain}" containing "${brand}"`,
            );
          }
        }
      }

      expect(violations).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Snapshot tests — at least 20 using fixed seeds (acceptance criteria)
  // --------------------------------------------------------------------------
  describe("snapshot stability", () => {
    // 8 archetypes × 3 seeds each = 24 snapshots
    const SNAPSHOT_SEEDS = ["snap-alpha", "snap-beta", "snap-gamma"];

    for (const archetypeId of ARCHETYPE_IDS) {
      for (const seed of SNAPSHOT_SEEDS) {
        it(`snapshot: ${archetypeId} with seed "${seed}" (en-us)`, async () => {
          const generateName = await loadGenerator();
          const { archetypes, regions } = await loadData();
          const arch = archetypes.find((a) => a.id === archetypeId)!;
          const region = regions.find((r) => r.id === "en-us")!;
          const rng = createRng(seed);
          const result = generateName(rng, arch, region);
          expect(result).toMatchSnapshot();
        });
      }
    }

    // Additional German snapshots for variety
    for (const archetypeId of ARCHETYPE_IDS.slice(0, 4)) {
      it(`snapshot: ${archetypeId} with seed "snap-de" (de-de)`, async () => {
        const generateName = await loadGenerator();
        const { archetypes, regions } = await loadData();
        const arch = archetypes.find((a) => a.id === archetypeId)!;
        const region = regions.find((r) => r.id === "de-de")!;
        const rng = createRng("snap-de");
        const result = generateName(rng, arch, region);
        expect(result).toMatchSnapshot();
      });
    }
  });

  // --------------------------------------------------------------------------
  // Archetype ID in output
  // --------------------------------------------------------------------------
  describe("archetype reference in output", () => {
    it("the archetype field in the result matches the input archetype id", async () => {
      const generateName = await loadGenerator();
      const { archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        const rng = createRng(`archref-${arch.id}`);
        const result = generateName(rng, arch, regions[0]!);
        expect(result.archetype).toBe(arch.id);
      }
    });
  });
});
