import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Lazy loaders
// ---------------------------------------------------------------------------

async function loadGenerateSite() {
  const mod = await import("../src/domain/generate-site.js");
  return mod.generateSite;
}

async function loadGenerateMetadata() {
  const mod = await import("../src/domain/generators/metadata-generator.js");
  return mod.generateMetadata;
}

async function loadGenerateName() {
  const mod = await import("../src/domain/generators/name-generator.js");
  return mod.generateName;
}

async function loadSelectTheme() {
  const mod = await import("../src/domain/theme-mapper.js");
  return mod.selectTheme;
}

async function loadData() {
  const data = await import("../src/domain/data/index.js");
  return {
    eras: data.eras as ReadonlyArray<{
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
    }>,
    archetypes: data.archetypes as ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly compatibleEraIds: readonly string[];
      readonly compatibleRegionIds: readonly string[];
      [k: string]: unknown;
    }>,
    regions: data.regions as ReadonlyArray<{
      readonly id: string;
      readonly tld: string;
      readonly language: string;
      [k: string]: unknown;
    }>,
  };
}

async function loadSeed() {
  const mod = await import("../src/domain/seed.js");
  return mod;
}

// ---------------------------------------------------------------------------
// Seeds chosen to cover all 5 eras deterministically
// ---------------------------------------------------------------------------
const PIPELINE_SEEDS = [
  "us017-snap-alpha",
  "us017-snap-beta",
  "us017-snap-gamma",
  "us017-snap-delta",
  "us017-snap-epsilon",
];

describe("US-017: Snapshot regression tests", () => {
  // --------------------------------------------------------------------------
  // (a) generateSite full pipeline — 5 seeds covering all eras
  // --------------------------------------------------------------------------
  describe("generateSite pipeline snapshots", () => {
    for (const seed of PIPELINE_SEEDS) {
      it(`generateSite("${seed}") matches snapshot`, async () => {
        const generateSite = await loadGenerateSite();
        const site = generateSite(seed);

        // Snapshot the stable, serializable subset of the site
        expect({
          eraId: site.era.id,
          archetypeId: site.archetype.id,
          regionId: site.region.id,
          themeId: site.theme.id,
          metadata: site.metadata,
          abandonmentDetails: site.abandonmentDetails,
        }).toMatchSnapshot();
      });
    }

    it("generateSite is deterministic — same seed yields identical output", async () => {
      const generateSite = await loadGenerateSite();
      const seed = "determinism-us017";
      const a = generateSite(seed);
      const b = generateSite(seed);
      expect(a).toEqual(b);
    });
  });

  // --------------------------------------------------------------------------
  // (b) generateMetadata — 3 seeds × 3 era/archetype combos
  // --------------------------------------------------------------------------
  describe("generateMetadata snapshots", () => {
    const META_SEEDS = ["us017-meta-1", "us017-meta-2", "us017-meta-3"];

    // Use specific era/archetype/region combos for coverage
    const COMBOS = [
      { eraId: "early-web", archetypeId: "budget-airline", regionId: "en-us" },
      { eraId: "web2", archetypeId: "mmorpg-guild", regionId: "en-gb" },
      { eraId: "startup-minimalism", archetypeId: "media-startup", regionId: "de-de" },
    ];

    for (const seed of META_SEEDS) {
      for (const combo of COMBOS) {
        it(`generateMetadata("${seed}") with ${combo.eraId}/${combo.archetypeId} matches snapshot`, async () => {
          const generateMetadata = await loadGenerateMetadata();
          const { eras, archetypes, regions } = await loadData();

          const era = eras.find((e) => e.id === combo.eraId)!;
          const archetype = archetypes.find((a) => a.id === combo.archetypeId)!;
          const region = regions.find((r) => r.id === combo.regionId)!;

          const metadata = generateMetadata(seed, era, archetype, region);
          expect(metadata).toMatchSnapshot();
        });
      }
    }
  });

  // --------------------------------------------------------------------------
  // (c) generateName — 3 seeds × 3 archetypes
  // --------------------------------------------------------------------------
  describe("generateName snapshots", () => {
    const NAME_SEEDS = ["us017-name-1", "us017-name-2", "us017-name-3"];
    const NAME_ARCHETYPES = ["os-vendor", "e-commerce-shop", "personal-homepage"];

    for (const seed of NAME_SEEDS) {
      for (const archetypeId of NAME_ARCHETYPES) {
        it(`generateName with seed "${seed}" and archetype "${archetypeId}" matches snapshot`, async () => {
          const generateName = await loadGenerateName();
          const { createRng } = await loadSeed();
          const { archetypes, regions } = await loadData();

          const archetype = archetypes.find((a) => a.id === archetypeId)!;
          const region = regions.find((r) => r.id === "en-us")!;
          const rng = createRng(seed);

          const name = generateName(rng, archetype, region);
          expect(name).toMatchSnapshot();
        });
      }
    }
  });

  // --------------------------------------------------------------------------
  // (d) selectTheme — each era verifying theme id mapping
  // --------------------------------------------------------------------------
  describe("selectTheme snapshots", () => {
    const ERA_IDS = [
      "early-web",
      "portal-era",
      "web2",
      "startup-minimalism",
      "alt-timeline",
    ];

    for (const eraId of ERA_IDS) {
      it(`selectTheme for era "${eraId}" matches snapshot`, async () => {
        const selectTheme = await loadSelectTheme();
        const { eras } = await loadData();
        const era = eras.find((e) => e.id === eraId)!;

        const theme = selectTheme("us017-theme-snap", era);
        expect({ themeId: theme.id, label: theme.label }).toMatchSnapshot();
      });
    }

    it("selectTheme maps each era to the correct theme id", async () => {
      const selectTheme = await loadSelectTheme();
      const { eras } = await loadData();

      for (const era of eras) {
        const theme = selectTheme("us017-era-theme-check", era);
        // Theme id should match the era id (current 1:1 mapping)
        expect(theme.id).toBe(era.id);
      }
    });
  });
});
