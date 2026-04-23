import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

describe("US-006: Alternate timeline dataset definitions", () => {
  // ---------------------------------------------------------------------------
  // Dynamic imports — resolved once, shared across tests
  // ---------------------------------------------------------------------------
  let eras: ReadonlyArray<Record<string, unknown>>;
  let archetypes: ReadonlyArray<Record<string, unknown>>;
  let regions: ReadonlyArray<Record<string, unknown>>;

  // We import lazily so the test file itself compiles even before the
  // implementation exists (the individual tests will fail with a clear message).
  async function loadDatasets() {
    const mod = await import("../src/domain/data/index.js");
    eras = mod.eras as typeof eras;
    archetypes = mod.archetypes as typeof archetypes;
    regions = mod.regions as typeof regions;
  }

  // --------------------------------------------------------------------------
  // File structure
  // --------------------------------------------------------------------------
  describe("file structure", () => {
    it("types file exists at src/domain/types.ts", async () => {
      const { existsSync } = await import("node:fs");
      expect(existsSync(resolve(ROOT, "src/domain/types.ts"))).toBe(true);
    });

    it("eras dataset exists at src/domain/data/eras.ts", async () => {
      const { existsSync } = await import("node:fs");
      expect(existsSync(resolve(ROOT, "src/domain/data/eras.ts"))).toBe(true);
    });

    it("regions dataset exists at src/domain/data/regions.ts", async () => {
      const { existsSync } = await import("node:fs");
      expect(existsSync(resolve(ROOT, "src/domain/data/regions.ts"))).toBe(true);
    });

    it("archetypes dataset exists at src/domain/data/archetypes.ts", async () => {
      const { existsSync } = await import("node:fs");
      expect(existsSync(resolve(ROOT, "src/domain/data/archetypes.ts"))).toBe(true);
    });

    it("barrel export exists at src/domain/data/index.ts", async () => {
      const { existsSync } = await import("node:fs");
      expect(existsSync(resolve(ROOT, "src/domain/data/index.ts"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Dataset cardinality — acceptance criteria
  // --------------------------------------------------------------------------
  describe("dataset cardinality", () => {
    it("at least 5 eras exist", async () => {
      await loadDatasets();
      expect(eras.length).toBeGreaterThanOrEqual(5);
    });

    it("at least 8 site archetypes exist", async () => {
      await loadDatasets();
      expect(archetypes.length).toBeGreaterThanOrEqual(8);
    });

    it("at least 3 regional flavors exist", async () => {
      await loadDatasets();
      expect(regions.length).toBeGreaterThanOrEqual(3);
    });
  });

  // --------------------------------------------------------------------------
  // Era records
  // --------------------------------------------------------------------------
  describe("era records", () => {
    it("every era has an id and label", async () => {
      await loadDatasets();
      for (const era of eras) {
        expect(era).toHaveProperty("id");
        expect(era).toHaveProperty("label");
        expect(typeof era.id).toBe("string");
        expect(typeof era.label).toBe("string");
        expect((era.id as string).length).toBeGreaterThan(0);
        expect((era.label as string).length).toBeGreaterThan(0);
      }
    });

    it("every era has valid yearStart < yearEnd", async () => {
      await loadDatasets();
      for (const era of eras) {
        expect(era).toHaveProperty("yearStart");
        expect(era).toHaveProperty("yearEnd");
        expect(typeof era.yearStart).toBe("number");
        expect(typeof era.yearEnd).toBe("number");
        expect(era.yearStart as number).toBeLessThan(era.yearEnd as number);
      }
    });

    it("every era includes non-empty designCues object", async () => {
      await loadDatasets();
      for (const era of eras) {
        expect(era).toHaveProperty("designCues");
        const cues = era.designCues as Record<string, unknown>;
        expect(typeof cues).toBe("object");
        expect(cues).not.toBeNull();

        // designCues should have typography, colors, layoutPatterns, uiElements
        expect(cues).toHaveProperty("typography");
        expect(cues).toHaveProperty("colors");
        expect(cues).toHaveProperty("layoutPatterns");
        expect(cues).toHaveProperty("uiElements");
      }
    });

    it("every era includes non-empty vocabularyCues array", async () => {
      await loadDatasets();
      for (const era of eras) {
        expect(era).toHaveProperty("vocabularyCues");
        const vocab = era.vocabularyCues as unknown[];
        expect(Array.isArray(vocab)).toBe(true);
        expect(vocab.length).toBeGreaterThan(0);
        for (const entry of vocab) {
          expect(typeof entry).toBe("string");
        }
      }
    });

    it("no duplicate era IDs", async () => {
      await loadDatasets();
      const ids = eras.map((e) => e.id as string);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // --------------------------------------------------------------------------
  // Region records
  // --------------------------------------------------------------------------
  describe("region records", () => {
    it("every region has id, label, language, tld, and currencySymbol", async () => {
      await loadDatasets();
      for (const region of regions) {
        expect(region).toHaveProperty("id");
        expect(region).toHaveProperty("label");
        expect(region).toHaveProperty("language");
        expect(region).toHaveProperty("tld");
        expect(region).toHaveProperty("currencySymbol");
        expect(typeof region.id).toBe("string");
        expect(typeof region.label).toBe("string");
        expect(typeof region.language).toBe("string");
        expect(typeof region.tld).toBe("string");
        expect(typeof region.currencySymbol).toBe("string");
      }
    });

    it("Germany region exists with language 'de' and .de TLD", async () => {
      await loadDatasets();
      const germany = regions.find(
        (r) => (r.language as string) === "de" || (r.id as string).includes("de"),
      );
      expect(germany).toBeDefined();
      expect(germany!.language).toBe("de");
      expect(germany!.tld).toBe(".de");
    });

    it("Germany region has vocabulary overrides with common German web terms", async () => {
      await loadDatasets();
      const germany = regions.find((r) => (r.language as string) === "de");
      expect(germany).toBeDefined();
      expect(germany).toHaveProperty("vocabularyOverrides");
      const overrides = germany!.vocabularyOverrides as Record<string, string>;
      expect(typeof overrides).toBe("object");
      expect(Object.keys(overrides).length).toBeGreaterThan(0);

      // Expect at least some common German web terms
      const values = Object.values(overrides);
      const commonTerms = ["Startseite", "Impressum", "Datenschutz"];
      const foundTerms = commonTerms.filter((term) =>
        values.some((v) => v.includes(term)),
      );
      expect(foundTerms.length).toBeGreaterThanOrEqual(1);
    });

    it("no duplicate region IDs", async () => {
      await loadDatasets();
      const ids = regions.map((r) => r.id as string);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // --------------------------------------------------------------------------
  // Archetype records
  // --------------------------------------------------------------------------
  describe("archetype records", () => {
    it("every archetype has id, label, compatibleEraIds, and compatibleRegionIds", async () => {
      await loadDatasets();
      for (const arch of archetypes) {
        expect(arch).toHaveProperty("id");
        expect(arch).toHaveProperty("label");
        expect(arch).toHaveProperty("compatibleEraIds");
        expect(arch).toHaveProperty("compatibleRegionIds");
        expect(typeof arch.id).toBe("string");
        expect(typeof arch.label).toBe("string");
        expect(Array.isArray(arch.compatibleEraIds)).toBe(true);
        expect(Array.isArray(arch.compatibleRegionIds)).toBe(true);
      }
    });

    it("every archetype has at least one compatible era", async () => {
      await loadDatasets();
      for (const arch of archetypes) {
        const eraIds = arch.compatibleEraIds as string[];
        expect(eraIds.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("every archetype has at least one compatible region", async () => {
      await loadDatasets();
      for (const arch of archetypes) {
        const regionIds = arch.compatibleRegionIds as string[];
        expect(regionIds.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("no duplicate archetype IDs", async () => {
      await loadDatasets();
      const ids = archetypes.map((a) => a.id as string);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // --------------------------------------------------------------------------
  // Referential integrity
  // --------------------------------------------------------------------------
  describe("referential integrity", () => {
    it("all archetype compatibleEraIds reference valid era IDs", async () => {
      await loadDatasets();
      const validEraIds = new Set(eras.map((e) => e.id as string));
      for (const arch of archetypes) {
        const eraIds = arch.compatibleEraIds as string[];
        for (const eraId of eraIds) {
          expect(validEraIds.has(eraId)).toBe(true);
        }
      }
    });

    it("all archetype compatibleRegionIds reference valid region IDs", async () => {
      await loadDatasets();
      const validRegionIds = new Set(regions.map((r) => r.id as string));
      for (const arch of archetypes) {
        const regionIds = arch.compatibleRegionIds as string[];
        for (const regionId of regionIds) {
          expect(validRegionIds.has(regionId)).toBe(true);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // Strong typing — typecheck must pass
  // --------------------------------------------------------------------------
  describe("strong typing", () => {
    it("TypeScript strict typecheck passes with noEmit", () => {
      const result = execSync("npx tsc --noEmit", {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      // If tsc exits with 0, the command succeeds — no assertion needed beyond not throwing
      expect(true).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Snapshot stability
  // --------------------------------------------------------------------------
  describe("snapshot stability", () => {
    it("eras dataset matches snapshot", async () => {
      await loadDatasets();
      expect(eras).toMatchSnapshot();
    });

    it("regions dataset matches snapshot", async () => {
      await loadDatasets();
      expect(regions).toMatchSnapshot();
    });

    it("archetypes dataset matches snapshot", async () => {
      await loadDatasets();
      expect(archetypes).toMatchSnapshot();
    });
  });
});
