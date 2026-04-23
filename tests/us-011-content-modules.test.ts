// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Lazy loaders — tests compile even before implementation exists
// ---------------------------------------------------------------------------

type SiteShape = {
  seed: string;
  era: {
    id: string;
    label: string;
    yearStart: number;
    yearEnd: number;
    [k: string]: unknown;
  };
  archetype: {
    id: string;
    label: string;
    compatibleEraIds: readonly string[];
    compatibleRegionIds: readonly string[];
    [k: string]: unknown;
  };
  region: {
    id: string;
    label: string;
    language: string;
    tld: string;
    vocabularyOverrides: Readonly<Record<string, string>>;
    [k: string]: unknown;
  };
  theme: {
    id: string;
    label: string;
    typography: { fontFamily: string; headingFont: string; [k: string]: unknown };
    palette: { primary: string; background: string; text: string; [k: string]: unknown };
    spacing: { unit: number; [k: string]: unknown };
    borders: { radius: number; style: string; [k: string]: unknown };
    surfaces: { background: string; [k: string]: unknown };
  };
  metadata: {
    siteName: string;
    tagline: string | undefined;
    yearFounded: number;
    statusLabel: string;
    closureReason: string;
    summary: string;
  };
};

type ContentModuleShape = {
  id: string;
  label: string;
  compatibleArchetypeIds: readonly string[];
  compatibleEraIds: readonly string[];
  render: (site: SiteShape, rng: unknown) => HTMLElement;
};

async function loadGenerateSite() {
  const mod = await import("../src/domain/generate-site.js");
  return mod.generateSite as (seed: string) => SiteShape;
}

async function loadRenderHomepage() {
  const mod = await import("../src/render/render-homepage.js");
  return mod.renderHomepage as (
    container: HTMLElement,
    site: SiteShape,
  ) => void;
}

async function loadSelectModules() {
  const mod = await import("../src/render/select-modules.js");
  return mod.selectModules as (site: SiteShape) => ContentModuleShape[];
}

async function loadContentModules() {
  const mod = await import("../src/render/modules/index.js");
  return mod.contentModules as ContentModuleShape[];
}

async function loadData() {
  const mod = await import("../src/domain/data/index.js");
  return {
    eras: mod.eras as ReadonlyArray<{ id: string; [k: string]: unknown }>,
    archetypes: mod.archetypes as ReadonlyArray<{
      id: string;
      compatibleEraIds: readonly string[];
      compatibleRegionIds: readonly string[];
      [k: string]: unknown;
    }>,
    regions: mod.regions as ReadonlyArray<{
      id: string;
      vocabularyOverrides: Readonly<Record<string, string>>;
      [k: string]: unknown;
    }>,
  };
}

async function loadSeedUtils() {
  const mod = await import("../src/domain/seed.js");
  return {
    createRng: mod.createRng as (seed: string) => {
      next(): number;
      int(min: number, max: number): number;
      pick<T>(array: readonly T[]): T;
      shuffle<T>(array: readonly T[]): T[];
      bool(probability?: number): boolean;
    },
    deriveSeed: mod.deriveSeed as (parent: string, key: string) => string,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FIXED_SEEDS = [
  "abc123",
  "museum_42",
  "Zx9-pQ",
  "delta-echo",
  "foxtrot_99",
  "gallery-01",
  "horizon-7",
  "kilo_bravo",
  "lima-papa",
  "november_3",
  "oscar_tango",
  "romeo-zulu",
  "sierra_lima",
  "tango-99",
  "uniform_42",
  "victor-xray",
  "whiskey_007",
  "yankee-alpha",
  "zulu-foxtrot",
  "bravo_charlie",
  "echo-99",
  "gamma_delta",
  "india-juliet",
  "kappa_mu",
  "lambda-sigma",
];

function createContainer(): HTMLElement {
  const el = document.createElement("div");
  el.id = "app";
  document.body.appendChild(el);
  return el;
}

// ---------------------------------------------------------------------------
// 1 · File structure — expected source files exist
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — file structure", () => {
  const expectedModuleFiles = [
    "src/render/modules/index.ts",
    "src/render/select-modules.ts",
  ];

  const expectedRendererFiles = [
    "src/render/modules/render-features-grid.ts",
    "src/render/modules/render-news-block.ts",
    "src/render/modules/render-download-panel.ts",
    "src/render/modules/render-testimonials.ts",
    "src/render/modules/render-guild-roster.ts",
    "src/render/modules/render-pricing-table.ts",
  ];

  for (const file of expectedModuleFiles) {
    it(`${file} exists`, () => {
      expect(existsSync(resolve(ROOT, file))).toBe(true);
    });
  }

  it("at least 6 module renderer files exist", () => {
    const found = expectedRendererFiles.filter((f) =>
      existsSync(resolve(ROOT, f)),
    );
    expect(found.length).toBeGreaterThanOrEqual(6);
  });

  it("module fragments dataset exists", () => {
    expect(
      existsSync(resolve(ROOT, "src/domain/data/module-fragments.ts")),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2 · Module registry — shape & content
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — registry", () => {
  it("contentModules exports an array with at least 6 entries", async () => {
    const modules = await loadContentModules();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThanOrEqual(6);
  });

  it("each module has required shape", async () => {
    const modules = await loadContentModules();
    for (const mod of modules) {
      expect(typeof mod.id).toBe("string");
      expect(mod.id.length).toBeGreaterThan(0);
      expect(typeof mod.label).toBe("string");
      expect(mod.label.length).toBeGreaterThan(0);
      expect(Array.isArray(mod.compatibleArchetypeIds)).toBe(true);
      expect(Array.isArray(mod.compatibleEraIds)).toBe(true);
      expect(typeof mod.render).toBe("function");
    }
  });

  it("module IDs are unique", async () => {
    const modules = await loadContentModules();
    const ids = modules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every module references valid archetype IDs", async () => {
    const modules = await loadContentModules();
    const { archetypes } = await loadData();
    const validArchIds = new Set(archetypes.map((a) => a.id));

    for (const mod of modules) {
      for (const archId of mod.compatibleArchetypeIds) {
        expect(validArchIds.has(archId)).toBe(true);
      }
    }
  });

  it("every module references valid era IDs", async () => {
    const modules = await loadContentModules();
    const { eras } = await loadData();
    const validEraIds = new Set(eras.map((e) => e.id));

    for (const mod of modules) {
      for (const eraId of mod.compatibleEraIds) {
        expect(validEraIds.has(eraId)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 3 · Module selection — selectModules()
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — selectModules", () => {
  it("returns between 2 and 4 modules for any seed", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      const selected = selectModules(site);
      expect(selected.length).toBeGreaterThanOrEqual(2);
      expect(selected.length).toBeLessThanOrEqual(4);
    }
  });

  it("determinism — same seed always returns identical modules in same order", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of FIXED_SEEDS.slice(0, 10)) {
      const site = generateSite(seed);
      const run1 = selectModules(site).map((m) => m.id);
      const run2 = selectModules(site).map((m) => m.id);
      const run3 = selectModules(site).map((m) => m.id);
      expect(run1).toEqual(run2);
      expect(run2).toEqual(run3);
    }
  });

  it("different seeds produce different module selections", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    const selections = new Set<string>();
    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      const ids = selectModules(site)
        .map((m) => m.id)
        .join(",");
      selections.add(ids);
    }
    // With 25 seeds, expect at least 3 distinct selections
    expect(selections.size).toBeGreaterThanOrEqual(3);
  });

  it("selected modules are compatible with the site archetype", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      const selected = selectModules(site);
      for (const mod of selected) {
        expect(mod.compatibleArchetypeIds).toContain(site.archetype.id);
      }
    }
  });

  it("selected modules are compatible with the site era", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      const selected = selectModules(site);
      for (const mod of selected) {
        expect(mod.compatibleEraIds).toContain(site.era.id);
      }
    }
  });

  it("no duplicate modules in a single selection", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      const ids = selectModules(site).map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// ---------------------------------------------------------------------------
// 4 · Archetype compatibility — restricted modules
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — archetype compatibility", () => {
  it("guild-roster only appears for mmorpg-guild archetype", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();
    const modules = await loadContentModules();

    const guildRoster = modules.find((m) => m.id === "guild-roster");
    if (guildRoster) {
      // Verify guild-roster declares mmorpg-guild compatibility
      expect(guildRoster.compatibleArchetypeIds).toContain("mmorpg-guild");

      // For non-mmorpg-guild sites, guild-roster must never appear
      for (const seed of FIXED_SEEDS) {
        const site = generateSite(seed);
        if (site.archetype.id !== "mmorpg-guild") {
          const selected = selectModules(site);
          const ids = selected.map((m) => m.id);
          expect(ids).not.toContain("guild-roster");
        }
      }
    }
  });

  it("route-map only appears for budget-airline archetype", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();
    const modules = await loadContentModules();

    const routeMap = modules.find((m) => m.id === "route-map");
    if (routeMap) {
      expect(routeMap.compatibleArchetypeIds).toContain("budget-airline");

      for (const seed of FIXED_SEEDS) {
        const site = generateSite(seed);
        if (site.archetype.id !== "budget-airline") {
          const selected = selectModules(site);
          const ids = selected.map((m) => m.id);
          expect(ids).not.toContain("route-map");
        }
      }
    }
  });

  it("pricing-table only appears for archetypes that sell products/services", async () => {
    const modules = await loadContentModules();
    const pricingTable = modules.find((m) => m.id === "pricing-table");
    if (pricingTable) {
      // Should NOT be compatible with mmorpg-guild or personal-homepage
      expect(pricingTable.compatibleArchetypeIds).not.toContain(
        "mmorpg-guild",
      );
      expect(pricingTable.compatibleArchetypeIds).not.toContain(
        "personal-homepage",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 5 · Edge case — fewer than requested compatible modules
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — edge cases", () => {
  it("does not crash when compatible modules are sparse", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    // Run across all seeds — even niche archetype+era combos should work
    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      expect(() => selectModules(site)).not.toThrow();
      const selected = selectModules(site);
      expect(selected.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ---------------------------------------------------------------------------
// 6 · Module rendering — individual modules produce valid DOM
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — individual render", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("each module render() returns an HTMLElement", async () => {
    const modules = await loadContentModules();
    const generateSite = await loadGenerateSite();
    const { createRng, deriveSeed } = await loadSeedUtils();

    const site = generateSite("render-test-seed");

    for (const mod of modules) {
      if (
        mod.compatibleArchetypeIds.includes(site.archetype.id) &&
        mod.compatibleEraIds.includes(site.era.id)
      ) {
        const rng = createRng(deriveSeed(site.seed, mod.id));
        const el = mod.render(site, rng);
        expect(el).toBeInstanceOf(HTMLElement);
      }
    }
  });

  it("each module renders with a unique class name or data attribute", async () => {
    const modules = await loadContentModules();
    const generateSite = await loadGenerateSite();
    const { createRng, deriveSeed } = await loadSeedUtils();

    const site = generateSite("class-test-seed");

    for (const mod of modules) {
      if (
        mod.compatibleArchetypeIds.includes(site.archetype.id) &&
        mod.compatibleEraIds.includes(site.era.id)
      ) {
        const rng = createRng(deriveSeed(site.seed, mod.id));
        const el = mod.render(site, rng);
        // Module should be identifiable via class or data attribute
        const hasIdentifier =
          el.className.includes(mod.id) ||
          el.classList.contains(`module-${mod.id}`) ||
          el.dataset.module === mod.id;
        expect(hasIdentifier).toBe(true);
      }
    }
  });

  it("rendered modules contain child elements (not empty)", async () => {
    const modules = await loadContentModules();
    const generateSite = await loadGenerateSite();
    const { createRng, deriveSeed } = await loadSeedUtils();

    const site = generateSite("content-test-seed");

    for (const mod of modules) {
      if (
        mod.compatibleArchetypeIds.includes(site.archetype.id) &&
        mod.compatibleEraIds.includes(site.era.id)
      ) {
        const rng = createRng(deriveSeed(site.seed, mod.id));
        const el = mod.render(site, rng);
        expect(el.children.length).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 7 · DOM structure — modules wired into homepage
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — homepage integration", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("rendered homepage contains .site-body element", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("dom-structure-seed");
    renderHomepage(container, site);

    const siteBody = container.querySelector(".site-body");
    expect(siteBody).not.toBeNull();
  });

  it(".site-body has at least 2 child sections", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("dom-structure-seed");
    renderHomepage(container, site);

    const siteBody = container.querySelector(".site-body");
    expect(siteBody).not.toBeNull();
    expect(siteBody!.children.length).toBeGreaterThanOrEqual(2);
  });

  it("DOM order is header > hero > main.site-body > footer", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("dom-order-seed");
    renderHomepage(container, site);

    const page = container.querySelector(".generated-page");
    expect(page).not.toBeNull();

    const children = Array.from(page!.children);
    const tags = children.map((c) => c.tagName.toLowerCase());

    const headerIdx = tags.indexOf("header");
    const mainIdx = tags.findIndex(
      (_, i) =>
        children[i]!.classList.contains("site-body") ||
        children[i]!.tagName.toLowerCase() === "main",
    );
    const footerIdx = tags.indexOf("footer");

    expect(headerIdx).toBeGreaterThanOrEqual(0);
    expect(mainIdx).toBeGreaterThan(headerIdx);
    expect(footerIdx).toBeGreaterThan(mainIdx);
  });

  it("each module section inside .site-body is identifiable", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();
    const selectModules = await loadSelectModules();

    const site = generateSite("identifiable-modules-seed");
    renderHomepage(container, site);

    const siteBody = container.querySelector(".site-body");
    expect(siteBody).not.toBeNull();

    const expectedModuleIds = selectModules(site).map((m) => m.id);
    for (const id of expectedModuleIds) {
      const found =
        siteBody!.querySelector(`.module-${id}`) ||
        siteBody!.querySelector(`[data-module="${id}"]`) ||
        siteBody!.querySelector(`[class*="${id}"]`);
      expect(found).not.toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// 8 · Theme adherence — modules use CSS custom properties
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — theme adherence", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("homepage container has theme CSS custom properties set", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("theme-check-seed");
    renderHomepage(container, site);

    const style = container.style;
    // Check key CSS custom properties are set
    expect(style.getPropertyValue("--color-primary")).toBeTruthy();
    expect(style.getPropertyValue("--font-family")).toBeTruthy();
  });

  it("module elements do not use hard-coded colors in inline styles", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("no-hardcoded-colors-seed");
    renderHomepage(container, site);

    const siteBody = container.querySelector(".site-body");
    if (siteBody) {
      const allElements = siteBody.querySelectorAll("*");
      for (const el of allElements) {
        const inlineStyle = (el as HTMLElement).getAttribute("style") ?? "";
        // If there is an inline style with color, it should reference var(--...)
        if (inlineStyle.includes("color:") || inlineStyle.includes("background:")) {
          expect(inlineStyle).toMatch(/var\(--/);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 9 · Regional overrides — German labels
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — regional overrides", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("de-de region sites use German vocabulary where overrides exist", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();
    const { createRng, deriveSeed } = await loadSeedUtils();

    // Find a seed that produces a de-de site
    let germanSite: SiteShape | undefined;
    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      if (site.region.id === "de-de") {
        germanSite = site;
        break;
      }
    }

    // If no de-de site found in fixed seeds, try more seeds
    if (!germanSite) {
      for (let i = 0; i < 100; i++) {
        const site = generateSite(`german-hunt-${i}`);
        if (site.region.id === "de-de") {
          germanSite = site;
          break;
        }
      }
    }

    // Skip if no German site could be generated
    if (!germanSite) return;

    const selected = selectModules(germanSite);
    expect(selected.length).toBeGreaterThanOrEqual(2);

    // Render modules and check for German text presence
    let foundGermanText = false;
    const germanTerms = Object.values(germanSite.region.vocabularyOverrides);

    for (const mod of selected) {
      const rng = createRng(deriveSeed(germanSite.seed, mod.id));
      const el = mod.render(germanSite, rng);
      const text = el.textContent ?? "";
      for (const term of germanTerms) {
        if (text.includes(term)) {
          foundGermanText = true;
          break;
        }
      }
      if (foundGermanText) break;
    }

    expect(foundGermanText).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10 · RNG isolation — module selection uses deriveSeed
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — RNG isolation", () => {
  it("module selection does not perturb other RNG streams", async () => {
    const generateSite = await loadGenerateSite();

    // Generate same site twice — metadata, era, archetype should be identical
    // even if module selection runs in between
    const site1 = generateSite("isolation-test");
    const site2 = generateSite("isolation-test");

    expect(site1.era.id).toBe(site2.era.id);
    expect(site1.archetype.id).toBe(site2.archetype.id);
    expect(site1.region.id).toBe(site2.region.id);
    expect(site1.metadata.siteName).toBe(site2.metadata.siteName);
    expect(site1.metadata.tagline).toBe(site2.metadata.tagline);
  });
});

// ---------------------------------------------------------------------------
// 11 · Smoke test — 25 seeds with no errors
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — smoke test", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("renders 25 seeds without throwing", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      expect(() => renderHomepage(container, site)).not.toThrow();
      // Verify basic structure after each render
      const siteBody = container.querySelector(".site-body");
      expect(siteBody).not.toBeNull();
      expect(siteBody!.children.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("no console errors during rendering", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const errors: string[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => errors.push(args.join(" "));

    try {
      for (const seed of FIXED_SEEDS) {
        const site = generateSite(seed);
        renderHomepage(container, site);
      }
      expect(errors).toEqual([]);
    } finally {
      console.error = origError;
    }
  });
});

// ---------------------------------------------------------------------------
// 12 · Snapshot stability — pinned seeds
// ---------------------------------------------------------------------------

describe("US-011 · Content modules — snapshot stability", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  const SNAPSHOT_SEEDS = ["abc123", "museum_42", "Zx9-pQ"];

  for (const seed of SNAPSHOT_SEEDS) {
    it(`snapshot for seed "${seed}"`, async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();

      const site = generateSite(seed);
      renderHomepage(container, site);

      const siteBody = container.querySelector(".site-body");
      expect(siteBody).not.toBeNull();
      expect(siteBody!.innerHTML).toMatchSnapshot();
    });
  }

  it("selectModules output is snapshot-stable", async () => {
    const generateSite = await loadGenerateSite();
    const selectModules = await loadSelectModules();

    for (const seed of SNAPSHOT_SEEDS) {
      const site = generateSite(seed);
      const ids = selectModules(site).map((m) => m.id);
      expect(ids).toMatchSnapshot();
    }
  });
});
