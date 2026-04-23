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
  return mod.generateMetadata as (
    seed: string,
    era: { id: string; yearStart: number; yearEnd: number; [k: string]: unknown },
    archetype: { id: string; [k: string]: unknown },
    region: { id: string; tld: string; [k: string]: unknown },
  ) => {
    siteName: string;
    tagline: string | undefined;
    yearFounded: number;
    statusLabel: string;
    closureReason: string;
    summary: string;
  };
}

async function loadData() {
  const mod = await import("../src/domain/data/index.js");
  return {
    eras: mod.eras as ReadonlyArray<{
      id: string;
      label: string;
      yearStart: number;
      yearEnd: number;
      [k: string]: unknown;
    }>,
    archetypes: mod.archetypes as ReadonlyArray<{
      id: string;
      label: string;
      compatibleEraIds: readonly string[];
      compatibleRegionIds: readonly string[];
      [k: string]: unknown;
    }>,
    regions: mod.regions as ReadonlyArray<{
      id: string;
      tld: string;
      [k: string]: unknown;
    }>,
  };
}

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

describe("US-008: Generate fake site metadata", () => {
  // --------------------------------------------------------------------------
  // File structure
  // --------------------------------------------------------------------------
  describe("file structure", () => {
    it("metadata generator module exists at src/domain/generators/metadata-generator.ts", () => {
      expect(
        existsSync(resolve(ROOT, "src/domain/generators/metadata-generator.ts")),
      ).toBe(true);
    });

    it("metadata fragments dataset exists at src/domain/data/metadata-fragments.ts", () => {
      expect(
        existsSync(resolve(ROOT, "src/domain/data/metadata-fragments.ts")),
      ).toBe(true);
    });

    it("generators barrel exports generateMetadata", async () => {
      const mod = await import("../src/domain/generators/index.js");
      expect(typeof mod.generateMetadata).toBe("function");
    });
  });

  // --------------------------------------------------------------------------
  // SiteMetadata shape — all required fields present with correct types
  // --------------------------------------------------------------------------
  describe("SiteMetadata structure", () => {
    it("generateMetadata returns an object with all required fields", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();
      const result = generateMetadata("shape-test", eras[0]!, archetypes[0]!, regions[0]!);

      expect(result).toHaveProperty("siteName");
      expect(result).toHaveProperty("yearFounded");
      expect(result).toHaveProperty("statusLabel");
      expect(result).toHaveProperty("closureReason");
      expect(result).toHaveProperty("summary");

      expect(typeof result.siteName).toBe("string");
      expect(typeof result.yearFounded).toBe("number");
      expect(typeof result.statusLabel).toBe("string");
      expect(typeof result.closureReason).toBe("string");
      expect(typeof result.summary).toBe("string");

      expect(result.siteName.length).toBeGreaterThan(0);
      expect(result.statusLabel.length).toBeGreaterThan(0);
      expect(result.closureReason.length).toBeGreaterThan(0);
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it("tagline is either a string or undefined", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (let i = 0; i < 20; i++) {
        const result = generateMetadata(`tagline-type-${i}`, eras[0]!, archetypes[0]!, regions[0]!);
        if (result.tagline !== undefined) {
          expect(typeof result.tagline).toBe("string");
          expect(result.tagline.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Year-era compatibility — yearFounded within era bounds
  // --------------------------------------------------------------------------
  describe("year-era compatibility", () => {
    it("yearFounded falls within era yearStart and yearEnd for each era", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (const era of eras) {
        for (let i = 0; i < 20; i++) {
          const result = generateMetadata(
            `year-era-${era.id}-${i}`,
            era,
            archetypes[0]!,
            regions[0]!,
          );
          expect(result.yearFounded).toBeGreaterThanOrEqual(era.yearStart);
          expect(result.yearFounded).toBeLessThanOrEqual(era.yearEnd);
        }
      }
    });

    it("yearFounded is always an integer", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (const era of eras) {
        for (let i = 0; i < 5; i++) {
          const result = generateMetadata(`year-int-${era.id}-${i}`, era, archetypes[0]!, regions[0]!);
          expect(Number.isInteger(result.yearFounded)).toBe(true);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Determinism — same seed + era + archetype + region = identical output
  // --------------------------------------------------------------------------
  describe("determinism", () => {
    it("same inputs produce identical metadata across 50 runs", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      const results = Array.from({ length: 50 }, () =>
        generateMetadata("determinism-check", eras[0]!, archetypes[0]!, regions[0]!),
      );

      const first = results[0];
      for (const r of results) {
        expect(r).toEqual(first);
      }
    });

    it("determinism holds for every archetype", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        const a = generateMetadata("det-arch", eras[0]!, arch, regions[0]!);
        const b = generateMetadata("det-arch", eras[0]!, arch, regions[0]!);
        expect(a).toEqual(b);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Independence from DOM — pure function, no DOM imports
  // --------------------------------------------------------------------------
  describe("independence from DOM", () => {
    it("generator runs in Node without DOM environment", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      // If it runs here, it's DOM-independent (no jsdom environment directive)
      const result = generateMetadata("node-env", eras[0]!, archetypes[0]!, regions[0]!);
      expect(result.siteName).toBeTruthy();
      expect(result.summary).toBeTruthy();
    });

    it("metadata-generator.ts does not import DOM APIs", async () => {
      const { readFileSync } = await import("node:fs");
      const source = readFileSync(
        resolve(ROOT, "src/domain/generators/metadata-generator.ts"),
        "utf-8",
      );
      expect(source).not.toMatch(/\bdocument\b/);
      expect(source).not.toMatch(/\bwindow\b/);
      expect(source).not.toMatch(/\bDOM\b/i);
      expect(source).not.toMatch(/\bgetElementBy/);
      expect(source).not.toMatch(/\bquerySelector\b/);
    });
  });

  // --------------------------------------------------------------------------
  // Cross-seed uniqueness — different seeds produce varied output
  // --------------------------------------------------------------------------
  describe("cross-seed uniqueness", () => {
    it("30 different seeds produce multiple distinct siteName values", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      const names = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const result = generateMetadata(`unique-${i}`, eras[0]!, archetypes[0]!, regions[0]!);
        names.add(result.siteName);
      }
      expect(names.size).toBeGreaterThan(5);
    });

    it("different seeds produce varied summaries", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      const summaries = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const result = generateMetadata(`sum-unique-${i}`, eras[0]!, archetypes[0]!, regions[0]!);
        summaries.add(result.summary);
      }
      expect(summaries.size).toBeGreaterThan(3);
    });
  });

  // --------------------------------------------------------------------------
  // Summary is homepage-ready copy between 10–500 chars
  // --------------------------------------------------------------------------
  describe("summary length", () => {
    it("summary is between 10 and 500 characters for all archetypes", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (const arch of archetypes) {
        for (let i = 0; i < 5; i++) {
          const result = generateMetadata(`sumlen-${arch.id}-${i}`, eras[0]!, arch, regions[0]!);
          expect(result.summary.length).toBeGreaterThanOrEqual(10);
          expect(result.summary.length).toBeLessThanOrEqual(500);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Tagline handling — some undefined, some string
  // --------------------------------------------------------------------------
  describe("tagline handling", () => {
    it("across many seeds, some taglines are undefined and some are strings", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      let undefinedCount = 0;
      let stringCount = 0;

      for (let i = 0; i < 50; i++) {
        const result = generateMetadata(`tagline-${i}`, eras[0]!, archetypes[0]!, regions[0]!);
        if (result.tagline === undefined) {
          undefinedCount++;
        } else {
          expect(typeof result.tagline).toBe("string");
          stringCount++;
        }
      }

      expect(undefinedCount).toBeGreaterThan(0);
      expect(stringCount).toBeGreaterThan(0);
    });

    it("tagline is never an empty string", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      for (let i = 0; i < 30; i++) {
        const result = generateMetadata(`tagline-empty-${i}`, eras[0]!, archetypes[0]!, regions[0]!);
        if (result.tagline !== undefined) {
          expect(result.tagline.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // RNG isolation — metadata uses deriveSeed internally, not shared RNG
  // --------------------------------------------------------------------------
  describe("RNG isolation", () => {
    it("calling generateMetadata does not depend on external RNG state", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      // Call without any external RNG activity
      const baseline = generateMetadata("rng-iso", eras[0]!, archetypes[0]!, regions[0]!);

      // Create an external RNG from the same seed, consume some values
      const externalRng = createRng("rng-iso");
      externalRng.next();
      externalRng.next();
      externalRng.next();
      externalRng.int(0, 100);

      // Call generateMetadata again — must produce identical result
      const afterExternal = generateMetadata("rng-iso", eras[0]!, archetypes[0]!, regions[0]!);
      expect(afterExternal).toEqual(baseline);
    });

    it("metadata takes seed string, not an RNG instance", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      // The function signature takes string seed, not SeededRandom
      const result = generateMetadata("string-seed", eras[0]!, archetypes[0]!, regions[0]!);
      expect(result).toBeDefined();
      expect(typeof result.siteName).toBe("string");
    });
  });

  // --------------------------------------------------------------------------
  // Cross-archetype variation — different archetypes with same seed differ
  // --------------------------------------------------------------------------
  describe("cross-archetype variation", () => {
    it("different archetypes with the same seed produce different summaries or status labels", async () => {
      const generateMetadata = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();

      const results = archetypes.map((arch) =>
        generateMetadata("cross-arch", eras[0]!, arch, regions[0]!),
      );

      const summaries = new Set(results.map((r) => r.summary));
      // With 8 archetypes, we should see at least some variation
      expect(summaries.size).toBeGreaterThan(1);
    });
  });

  // --------------------------------------------------------------------------
  // Snapshot tests — 8 archetypes × 3 seeds = 24+ snapshots
  // --------------------------------------------------------------------------
  describe("snapshot stability", () => {
    const SNAPSHOT_SEEDS = ["snap-alpha", "snap-beta", "snap-gamma"];

    for (const archetypeId of ARCHETYPE_IDS) {
      for (const seed of SNAPSHOT_SEEDS) {
        it(`snapshot: ${archetypeId} with seed "${seed}"`, async () => {
          const generateMetadata = await loadGenerator();
          const { eras, archetypes, regions } = await loadData();
          const arch = archetypes.find((a) => a.id === archetypeId)!;
          const era = eras[0]!;
          const region = regions.find((r) => r.id === "en-us")!;
          const result = generateMetadata(seed, era, arch, region);
          expect(result).toMatchSnapshot();
        });
      }
    }

    // Additional snapshots across different eras
    for (const archetypeId of ARCHETYPE_IDS.slice(0, 4)) {
      it(`snapshot: ${archetypeId} with era "portal-era"`, async () => {
        const generateMetadata = await loadGenerator();
        const { eras, archetypes, regions } = await loadData();
        const arch = archetypes.find((a) => a.id === archetypeId)!;
        const era = eras.find((e) => e.id === "portal-era")!;
        const region = regions.find((r) => r.id === "en-us")!;
        const result = generateMetadata("snap-portal", era, arch, region);
        expect(result).toMatchSnapshot();
      });
    }

    // German region snapshots
    for (const archetypeId of ARCHETYPE_IDS.slice(0, 4)) {
      it(`snapshot: ${archetypeId} with region "de-de"`, async () => {
        const generateMetadata = await loadGenerator();
        const { eras, archetypes, regions } = await loadData();
        const arch = archetypes.find((a) => a.id === archetypeId)!;
        const era = eras[0]!;
        const region = regions.find((r) => r.id === "de-de")!;
        const result = generateMetadata("snap-de", era, arch, region);
        expect(result).toMatchSnapshot();
      });
    }
  });
});
