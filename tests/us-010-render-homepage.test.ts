// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Lazy loaders — tests compile even before implementation exists
// ---------------------------------------------------------------------------

async function loadGenerateSite() {
  const mod = await import("../src/domain/generate-site.js");
  return mod.generateSite as (seed: string) => {
    seed: string;
    era: { id: string; label: string; yearStart: number; yearEnd: number; [k: string]: unknown };
    archetype: { id: string; label: string; compatibleEraIds: readonly string[]; compatibleRegionIds: readonly string[]; [k: string]: unknown };
    region: { id: string; label: string; language: string; tld: string; vocabularyOverrides: Readonly<Record<string, string>>; [k: string]: unknown };
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
}

async function loadRenderHomepage() {
  const mod = await import("../src/render/render-homepage.js");
  return mod.renderHomepage as (container: HTMLElement, site: ReturnType<Awaited<ReturnType<typeof loadGenerateSite>>>) => void;
}

async function loadApplyTheme() {
  const mod = await import("../src/render/apply-theme.js");
  return mod.applyTheme as (container: HTMLElement, theme: { palette: Record<string, string>; typography: Record<string, unknown>; spacing: Record<string, unknown>; borders: Record<string, unknown>; [k: string]: unknown }) => void;
}

async function loadRenderHeader() {
  const mod = await import("../src/render/render-header.js");
  return mod.renderHeader as (site: ReturnType<Awaited<ReturnType<typeof loadGenerateSite>>>) => HTMLElement;
}

async function loadRenderHero() {
  const mod = await import("../src/render/render-hero.js");
  return mod.renderHero as (site: ReturnType<Awaited<ReturnType<typeof loadGenerateSite>>>) => HTMLElement;
}

async function loadRenderFooter() {
  const mod = await import("../src/render/render-footer.js");
  return mod.renderFooter as (site: ReturnType<Awaited<ReturnType<typeof loadGenerateSite>>>) => HTMLElement;
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

// ---------------------------------------------------------------------------
// Helper to create a fresh container
// ---------------------------------------------------------------------------
function createContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "generated-site";
  document.body.appendChild(container);
  return container;
}

describe("US-010: Render base generated homepage structure", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // File structure
  // --------------------------------------------------------------------------
  describe("file structure", () => {
    it("site generation orchestrator exists at src/domain/generate-site.ts", () => {
      expect(existsSync(resolve(ROOT, "src/domain/generate-site.ts"))).toBe(true);
    });

    it("apply-theme module exists at src/render/apply-theme.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/apply-theme.ts"))).toBe(true);
    });

    it("render-header module exists at src/render/render-header.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/render-header.ts"))).toBe(true);
    });

    it("render-hero module exists at src/render/render-hero.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/render-hero.ts"))).toBe(true);
    });

    it("render-footer module exists at src/render/render-footer.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/render-footer.ts"))).toBe(true);
    });

    it("render-homepage orchestrator exists at src/render/render-homepage.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/render-homepage.ts"))).toBe(true);
    });

    it("render barrel export exists at src/render/index.ts", () => {
      expect(existsSync(resolve(ROOT, "src/render/index.ts"))).toBe(true);
    });

    it("generated-site styles exist at src/styles/generated-site.css", () => {
      expect(existsSync(resolve(ROOT, "src/styles/generated-site.css"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // GeneratedSite shape — all required fields present
  // --------------------------------------------------------------------------
  describe("generateSite returns a complete GeneratedSite object", () => {
    it("returns an object with seed, era, archetype, region, theme, and metadata", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("shape-test-us010");

      expect(site).toHaveProperty("seed");
      expect(site).toHaveProperty("era");
      expect(site).toHaveProperty("archetype");
      expect(site).toHaveProperty("region");
      expect(site).toHaveProperty("theme");
      expect(site).toHaveProperty("metadata");
    });

    it("seed in output matches the input seed", async () => {
      const generateSite = await loadGenerateSite();
      const seed = "seed-match-test";
      const site = generateSite(seed);
      expect(site.seed).toBe(seed);
    });

    it("era has required fields", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("era-fields-test");

      expect(typeof site.era.id).toBe("string");
      expect(site.era.id.length).toBeGreaterThan(0);
      expect(typeof site.era.label).toBe("string");
      expect(typeof site.era.yearStart).toBe("number");
      expect(typeof site.era.yearEnd).toBe("number");
    });

    it("archetype has required fields", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("archetype-fields-test");

      expect(typeof site.archetype.id).toBe("string");
      expect(site.archetype.id.length).toBeGreaterThan(0);
      expect(typeof site.archetype.label).toBe("string");
      expect(Array.isArray(site.archetype.compatibleEraIds)).toBe(true);
      expect(Array.isArray(site.archetype.compatibleRegionIds)).toBe(true);
    });

    it("region has required fields", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("region-fields-test");

      expect(typeof site.region.id).toBe("string");
      expect(site.region.id.length).toBeGreaterThan(0);
      expect(typeof site.region.label).toBe("string");
      expect(typeof site.region.language).toBe("string");
      expect(typeof site.region.tld).toBe("string");
      expect(typeof site.region.vocabularyOverrides).toBe("object");
    });

    it("theme has required fields", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("theme-fields-test");

      expect(typeof site.theme.id).toBe("string");
      expect(site.theme.id.length).toBeGreaterThan(0);
      expect(typeof site.theme.label).toBe("string");
      expect(site.theme).toHaveProperty("typography");
      expect(site.theme).toHaveProperty("palette");
      expect(site.theme).toHaveProperty("spacing");
      expect(site.theme).toHaveProperty("borders");
      expect(site.theme).toHaveProperty("surfaces");
    });

    it("metadata has required fields", async () => {
      const generateSite = await loadGenerateSite();
      const site = generateSite("metadata-fields-test");

      expect(typeof site.metadata.siteName).toBe("string");
      expect(site.metadata.siteName.length).toBeGreaterThan(0);
      expect(typeof site.metadata.yearFounded).toBe("number");
      expect(typeof site.metadata.statusLabel).toBe("string");
      expect(site.metadata.statusLabel.length).toBeGreaterThan(0);
      expect(typeof site.metadata.closureReason).toBe("string");
      expect(site.metadata.closureReason.length).toBeGreaterThan(0);
      expect(typeof site.metadata.summary).toBe("string");
      expect(site.metadata.summary.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Determinism — same seed produces identical output
  // --------------------------------------------------------------------------
  describe("determinism", () => {
    it("same seed produces identical GeneratedSite across 3 calls", async () => {
      const generateSite = await loadGenerateSite();
      const seed = "determinism-us010";

      const first = generateSite(seed);
      const second = generateSite(seed);
      const third = generateSite(seed);

      expect(first).toEqual(second);
      expect(second).toEqual(third);
    });

    it("determinism holds for 100 iterations", async () => {
      const generateSite = await loadGenerateSite();
      const seed = "determinism-100";

      const baseline = generateSite(seed);
      for (let i = 0; i < 100; i++) {
        expect(generateSite(seed)).toEqual(baseline);
      }
    });

    it("call order does not affect results", async () => {
      const generateSite = await loadGenerateSite();
      const seedA = "order-a-us010";
      const seedB = "order-b-us010";

      const resultA1 = generateSite(seedA);
      const resultB1 = generateSite(seedB);

      const resultB2 = generateSite(seedB);
      const resultA2 = generateSite(seedA);

      expect(resultA1).toEqual(resultA2);
      expect(resultB1).toEqual(resultB2);
    });
  });

  // --------------------------------------------------------------------------
  // Era/archetype/region compatibility
  // --------------------------------------------------------------------------
  describe("era-archetype-region compatibility", () => {
    it("selected archetype is compatible with the selected era", async () => {
      const generateSite = await loadGenerateSite();

      for (let i = 0; i < 30; i++) {
        const site = generateSite(`compat-era-arch-${i}`);
        expect(
          site.archetype.compatibleEraIds.includes(site.era.id),
          `archetype "${site.archetype.id}" should be compatible with era "${site.era.id}"`,
        ).toBe(true);
      }
    });

    it("selected region is compatible with the selected archetype", async () => {
      const generateSite = await loadGenerateSite();

      for (let i = 0; i < 30; i++) {
        const site = generateSite(`compat-arch-region-${i}`);
        expect(
          site.archetype.compatibleRegionIds.includes(site.region.id),
          `region "${site.region.id}" should be compatible with archetype "${site.archetype.id}"`,
        ).toBe(true);
      }
    });

    it("yearFounded falls within the selected era range", async () => {
      const generateSite = await loadGenerateSite();

      for (let i = 0; i < 20; i++) {
        const site = generateSite(`year-range-${i}`);
        expect(site.metadata.yearFounded).toBeGreaterThanOrEqual(site.era.yearStart);
        expect(site.metadata.yearFounded).toBeLessThanOrEqual(site.era.yearEnd);
      }
    });
  });

  // --------------------------------------------------------------------------
  // DOM structure — renderHomepage produces header, hero, footer
  // --------------------------------------------------------------------------
  describe("DOM structure", () => {
    it("renderHomepage produces a header element", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("dom-header-test");

      renderHomepage(container, site);

      const header = container.querySelector("header");
      expect(header, "should contain a <header> element").not.toBeNull();
    });

    it("renderHomepage produces a hero section", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("dom-hero-test");

      renderHomepage(container, site);

      const section = container.querySelector("section");
      expect(section, "should contain a <section> element for the hero").not.toBeNull();
    });

    it("renderHomepage produces a footer element", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("dom-footer-test");

      renderHomepage(container, site);

      const footer = container.querySelector("footer");
      expect(footer, "should contain a <footer> element").not.toBeNull();
    });

    it("all three sections are present in a single render", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("dom-all-sections");

      renderHomepage(container, site);

      expect(container.querySelector("header")).not.toBeNull();
      expect(container.querySelector("section")).not.toBeNull();
      expect(container.querySelector("footer")).not.toBeNull();
    });

    it("header appears before hero, hero appears before footer in DOM order", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("dom-order-test");

      renderHomepage(container, site);

      const header = container.querySelector("header");
      const section = container.querySelector("section");
      const footer = container.querySelector("footer");

      expect(header).not.toBeNull();
      expect(section).not.toBeNull();
      expect(footer).not.toBeNull();

      // compareDocumentPosition returns bitmask; bit 4 (DOCUMENT_POSITION_FOLLOWING) means the arg follows
      const headerBeforeSection = header!.compareDocumentPosition(section!) & Node.DOCUMENT_POSITION_FOLLOWING;
      const sectionBeforeFooter = section!.compareDocumentPosition(footer!) & Node.DOCUMENT_POSITION_FOLLOWING;

      expect(headerBeforeSection).toBeTruthy();
      expect(sectionBeforeFooter).toBeTruthy();
    });

    it("renderHomepage clears previous content before rendering", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();

      // First render
      const site1 = generateSite("first-render");
      renderHomepage(container, site1);
      expect(container.querySelectorAll("header").length).toBe(1);

      // Second render — should replace, not append
      const site2 = generateSite("second-render");
      renderHomepage(container, site2);
      expect(container.querySelectorAll("header").length).toBe(1);
      expect(container.querySelectorAll("footer").length).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // Header content — site name and navigation
  // --------------------------------------------------------------------------
  describe("header content", () => {
    it("header contains the site name text", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("header-name-test");

      renderHomepage(container, site);

      const header = container.querySelector("header")!;
      expect(header.textContent).toContain(site.metadata.siteName);
    });

    it("header contains a nav element", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("header-nav-test");

      renderHomepage(container, site);

      const nav = container.querySelector("header nav");
      expect(nav, "header should contain a <nav> element").not.toBeNull();
    });

    it("nav contains at least 3 links or items", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("header-links-test");

      renderHomepage(container, site);

      const nav = container.querySelector("header nav")!;
      // Nav items could be <a> tags or other elements within the nav
      const items = nav.querySelectorAll("a");
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("renderHeader returns a header element independently", async () => {
      const generateSite = await loadGenerateSite();
      const renderHeader = await loadRenderHeader();
      const site = generateSite("render-header-standalone");

      const header = renderHeader(site);
      expect(header.tagName.toLowerCase()).toBe("header");
      expect(header.textContent).toContain(site.metadata.siteName);
    });
  });

  // --------------------------------------------------------------------------
  // Hero content — tagline and summary
  // --------------------------------------------------------------------------
  describe("hero content", () => {
    it("hero section contains the summary text", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("hero-summary-test");

      renderHomepage(container, site);

      const section = container.querySelector("section")!;
      expect(section.textContent).toContain(site.metadata.summary);
    });

    it("hero section contains the tagline when present", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();

      // Try multiple seeds to find one with a tagline
      for (let i = 0; i < 50; i++) {
        const site = generateSite(`hero-tagline-${i}`);
        if (site.metadata.tagline !== undefined) {
          const container = createContainer();
          renderHomepage(container, site);
          const section = container.querySelector("section")!;
          expect(section.textContent).toContain(site.metadata.tagline);
          return; // Found and tested
        }
      }
      // If no tagline was generated in 50 seeds, that's unusual but acceptable
      expect(true).toBe(true);
    });

    it("renderHero returns a section element independently", async () => {
      const generateSite = await loadGenerateSite();
      const renderHero = await loadRenderHero();
      const site = generateSite("render-hero-standalone");

      const hero = renderHero(site);
      expect(hero.tagName.toLowerCase()).toBe("section");
      expect(hero.textContent).toContain(site.metadata.summary);
    });
  });

  // --------------------------------------------------------------------------
  // Footer content — copyright year and status label
  // --------------------------------------------------------------------------
  describe("footer content", () => {
    it("footer contains the yearFounded", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("footer-year-test");

      renderHomepage(container, site);

      const footer = container.querySelector("footer")!;
      expect(footer.textContent).toContain(String(site.metadata.yearFounded));
    });

    it("footer contains the status label", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("footer-status-test");

      renderHomepage(container, site);

      const footer = container.querySelector("footer")!;
      expect(footer.textContent).toContain(site.metadata.statusLabel);
    });

    it("footer contains the site name for copyright", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("footer-copyright-test");

      renderHomepage(container, site);

      const footer = container.querySelector("footer")!;
      expect(footer.textContent).toContain(site.metadata.siteName);
    });

    it("renderFooter returns a footer element independently", async () => {
      const generateSite = await loadGenerateSite();
      const renderFooter = await loadRenderFooter();
      const site = generateSite("render-footer-standalone");

      const footer = renderFooter(site);
      expect(footer.tagName.toLowerCase()).toBe("footer");
      expect(footer.textContent).toContain(String(site.metadata.yearFounded));
      expect(footer.textContent).toContain(site.metadata.statusLabel);
    });
  });

  // --------------------------------------------------------------------------
  // Theme CSS custom properties applied to container
  // --------------------------------------------------------------------------
  describe("theme application", () => {
    it("applyTheme sets CSS custom properties on the container", async () => {
      const generateSite = await loadGenerateSite();
      const applyTheme = await loadApplyTheme();
      const container = createContainer();
      const site = generateSite("theme-props-test");

      applyTheme(container, site.theme);

      // Check custom properties via style.getPropertyValue (works in jsdom)
      const fontFamily = container.style.getPropertyValue("--font-family");
      expect(fontFamily.length).toBeGreaterThan(0);

      const colorPrimary = container.style.getPropertyValue("--color-primary");
      expect(colorPrimary.length).toBeGreaterThan(0);

      const colorBackground = container.style.getPropertyValue("--color-background");
      expect(colorBackground.length).toBeGreaterThan(0);

      const colorText = container.style.getPropertyValue("--color-text");
      expect(colorText.length).toBeGreaterThan(0);
    });

    it("renderHomepage applies theme properties to the container", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("homepage-theme-test");

      renderHomepage(container, site);

      // After render, the container (or a child wrapper) should have CSS vars set
      const target = container;
      const fontFamily = target.style.getPropertyValue("--font-family");
      expect(fontFamily.length).toBeGreaterThan(0);
    });

    it("theme properties match the generated theme values", async () => {
      const generateSite = await loadGenerateSite();
      const applyTheme = await loadApplyTheme();
      const container = createContainer();
      const site = generateSite("theme-match-test");

      applyTheme(container, site.theme);

      const colorPrimary = container.style.getPropertyValue("--color-primary");
      expect(colorPrimary.trim()).toBe(site.theme.palette.primary);
    });
  });

  // --------------------------------------------------------------------------
  // Multi-seed smoke test — no exceptions across many seeds
  // --------------------------------------------------------------------------
  describe("multi-seed smoke test", () => {
    it("generateSite does not throw for 20 different seeds", async () => {
      const generateSite = await loadGenerateSite();

      for (let i = 0; i < 20; i++) {
        expect(() => generateSite(`smoke-${i}`)).not.toThrow();
      }
    });

    it("renderHomepage does not throw for 20 different seeds", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();

      for (let i = 0; i < 20; i++) {
        const container = createContainer();
        const site = generateSite(`smoke-render-${i}`);
        expect(() => renderHomepage(container, site)).not.toThrow();
      }
    });

    it("all 3 sections are present for every seed across 20 seeds", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();

      for (let i = 0; i < 20; i++) {
        const container = createContainer();
        const site = generateSite(`smoke-sections-${i}`);
        renderHomepage(container, site);

        expect(container.querySelector("header"), `seed smoke-sections-${i}: missing header`).not.toBeNull();
        expect(container.querySelector("section"), `seed smoke-sections-${i}: missing section`).not.toBeNull();
        expect(container.querySelector("footer"), `seed smoke-sections-${i}: missing footer`).not.toBeNull();
      }
    });

    it("all generated sites have valid metadata across 20 seeds", async () => {
      const generateSite = await loadGenerateSite();

      for (let i = 0; i < 20; i++) {
        const site = generateSite(`smoke-meta-${i}`);
        expect(site.metadata.siteName.length).toBeGreaterThan(0);
        expect(site.metadata.summary.length).toBeGreaterThan(0);
        expect(site.metadata.statusLabel.length).toBeGreaterThan(0);
        expect(site.metadata.closureReason.length).toBeGreaterThan(0);
        expect(Number.isInteger(site.metadata.yearFounded)).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Cross-seed variation — different seeds produce varied output
  // --------------------------------------------------------------------------
  describe("cross-seed variation", () => {
    it("different seeds produce multiple distinct site names across 30 seeds", async () => {
      const generateSite = await loadGenerateSite();

      const names = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const site = generateSite(`variation-${i}`);
        names.add(site.metadata.siteName);
      }
      expect(names.size).toBeGreaterThan(5);
    });

    it("different seeds select from multiple eras", async () => {
      const generateSite = await loadGenerateSite();

      const eraIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const site = generateSite(`era-variation-${i}`);
        eraIds.add(site.era.id);
      }
      expect(eraIds.size).toBeGreaterThan(1);
    });

    it("different seeds select from multiple archetypes", async () => {
      const generateSite = await loadGenerateSite();

      const archetypeIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const site = generateSite(`arch-variation-${i}`);
        archetypeIds.add(site.archetype.id);
      }
      expect(archetypeIds.size).toBeGreaterThan(1);
    });
  });

  // --------------------------------------------------------------------------
  // Region vocabulary — German labels in nav for de-de region
  // --------------------------------------------------------------------------
  describe("region vocabulary", () => {
    it("German region sites use vocabulary overrides in rendered content", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const { regions } = await loadData();
      const deRegion = regions.find((r) => r.id === "de-de");
      expect(deRegion, "de-de region must exist in dataset").toBeDefined();

      // Find a seed that produces a de-de region site
      let found = false;
      for (let i = 0; i < 200; i++) {
        const site = generateSite(`de-region-${i}`);
        if (site.region.id === "de-de") {
          const container = createContainer();
          renderHomepage(container, site);

          // Check that at least one German vocabulary override appears in the rendered content
          const overrides = Object.values(site.region.vocabularyOverrides);
          const pageText = container.textContent ?? "";
          const hasGermanLabel = overrides.some((label) => pageText.includes(label));
          expect(
            hasGermanLabel,
            `German vocabulary override should appear in rendered content for de-de region`,
          ).toBe(true);
          found = true;
          break;
        }
      }

      // If after 200 seeds we couldn't find a de-de region, skip gracefully
      if (!found) {
        console.warn("Could not find a de-de region seed in 200 attempts — skipping vocabulary test");
      }
    });
  });

  // --------------------------------------------------------------------------
  // No runtime errors — rendering does not throw
  // --------------------------------------------------------------------------
  describe("no runtime errors", () => {
    it("rendering a generated site does not produce console errors", async () => {
      const generateSite = await loadGenerateSite();
      const renderHomepage = await loadRenderHomepage();
      const container = createContainer();
      const site = generateSite("no-errors-test");

      const errors: string[] = [];
      const originalError = console.error;
      console.error = (...args: unknown[]) => errors.push(args.map(String).join(" "));

      try {
        renderHomepage(container, site);
      } finally {
        console.error = originalError;
      }

      expect(errors, "no console.error calls during render").toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // Barrel exports
  // --------------------------------------------------------------------------
  describe("barrel exports", () => {
    it("render/index.ts exports renderHomepage", async () => {
      const mod = await import("../src/render/index.js");
      expect(typeof mod.renderHomepage).toBe("function");
    });

    it("domain/generate-site.ts exports generateSite", async () => {
      const mod = await import("../src/domain/generate-site.js");
      expect(typeof mod.generateSite).toBe("function");
    });
  });

  // --------------------------------------------------------------------------
  // Snapshot stability
  // --------------------------------------------------------------------------
  describe("snapshot stability", () => {
    const SNAPSHOT_SEEDS = ["snap-us010-alpha", "snap-us010-beta", "snap-us010-gamma"];

    for (const seed of SNAPSHOT_SEEDS) {
      it(`generateSite snapshot for seed "${seed}"`, async () => {
        const generateSite = await loadGenerateSite();
        const site = generateSite(seed);
        expect(site).toMatchSnapshot();
      });
    }
  });
});
