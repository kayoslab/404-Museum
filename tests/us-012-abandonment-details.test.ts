// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Lazy imports — tests compile even before implementation exists
// ---------------------------------------------------------------------------

type AbandonmentDetailShape = {
  id: string;
  label: string;
  cssClass: string;
};

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
  abandonmentDetails?: readonly AbandonmentDetailShape[];
};

async function loadGenerator() {
  const mod = await import("../src/domain/generators/index.js");
  return mod.generateAbandonmentDetails as (
    seed: string,
    era: { id: string; yearStart: number; yearEnd: number; [k: string]: unknown },
    archetype: { id: string; [k: string]: unknown },
    region: { id: string; tld: string; [k: string]: unknown },
  ) => AbandonmentDetailShape[];
}

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

const ERA_IDS = [
  "early-web",
  "portal-era",
  "web2",
  "startup-minimalism",
  "alt-timeline",
] as const;

function createContainer(): HTMLElement {
  const el = document.createElement("div");
  el.id = "app";
  document.body.appendChild(el);
  return el;
}

// ---------------------------------------------------------------------------
// 1 · File structure — expected source files exist
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — file structure", () => {
  it("abandonment generator exists at src/domain/generators/abandonment-generator.ts", () => {
    expect(
      existsSync(resolve(ROOT, "src/domain/generators/abandonment-generator.ts")),
    ).toBe(true);
  });

  it("abandonment fragments dataset exists at src/domain/data/abandonment-fragments.ts", () => {
    expect(
      existsSync(resolve(ROOT, "src/domain/data/abandonment-fragments.ts")),
    ).toBe(true);
  });

  it("abandonment render module exists at src/render/render-abandonment-details.ts", () => {
    expect(
      existsSync(resolve(ROOT, "src/render/render-abandonment-details.ts")),
    ).toBe(true);
  });

  it("generators barrel exports generateAbandonmentDetails", async () => {
    const mod = await import("../src/domain/generators/index.js");
    expect(typeof mod.generateAbandonmentDetails).toBe("function");
  });

  it("data barrel exports abandonment fragments", async () => {
    const mod = await import("../src/domain/data/index.js");
    expect(mod.abandonmentFragments).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2 · AbandonmentDetail shape — all required fields present with correct types
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — structure", () => {
  it("generateAbandonmentDetails returns an array of objects with required fields", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();
    const result = generateAbandonmentDetails(
      "shape-test",
      eras[0]!,
      archetypes[0]!,
      regions[0]!,
    );

    expect(Array.isArray(result)).toBe(true);
    for (const detail of result) {
      expect(detail).toHaveProperty("id");
      expect(detail).toHaveProperty("label");
      expect(detail).toHaveProperty("cssClass");

      expect(typeof detail.id).toBe("string");
      expect(typeof detail.label).toBe("string");
      expect(typeof detail.cssClass).toBe("string");
    }
  });

  it("detail labels are non-empty strings", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const seed of FIXED_SEEDS.slice(0, 10)) {
      const result = generateAbandonmentDetails(seed, eras[0]!, archetypes[0]!, regions[0]!);
      for (const detail of result) {
        expect(detail.label.length).toBeGreaterThan(0);
        expect(detail.id.length).toBeGreaterThan(0);
        expect(detail.cssClass.length).toBeGreaterThan(0);
      }
    }
  });

  it("detail IDs are from the expected set", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const validIds = new Set([
      "outdated-copyright",
      "stale-news-date",
      "broken-badge",
      "dead-counter",
      "deprecated-browser-notice",
      "missing-asset-placeholder",
      "expired-ssl-notice",
      "defunct-partner-logo",
    ]);

    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, eras[0]!, archetypes[0]!, regions[0]!);
      for (const detail of result) {
        expect(validIds.has(detail.id)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 3 · Count bounds — 2 to 5 details per site
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — count bounds", () => {
  it("returns between 2 and 5 details for every seed", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, eras[0]!, archetypes[0]!, regions[0]!);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.length).toBeLessThanOrEqual(5);
    }
  });

  it("returns 2–5 details for every era/archetype combination", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const era of eras) {
      const compatibleArchetypes = archetypes.filter((a) =>
        a.compatibleEraIds.includes(era.id),
      );
      for (const arch of compatibleArchetypes) {
        const result = generateAbandonmentDetails(
          `count-${era.id}-${arch.id}`,
          era,
          arch,
          regions[0]!,
        );
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it("returns 2–5 details for every region", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const region of regions) {
      const result = generateAbandonmentDetails(
        `count-region-${region.id}`,
        eras[0]!,
        archetypes[0]!,
        region,
      );
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.length).toBeLessThanOrEqual(5);
    }
  });
});

// ---------------------------------------------------------------------------
// 4 · Determinism — same seed produces identical details across 50 runs
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — determinism", () => {
  it("same inputs produce identical details across 50 runs", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const results = Array.from({ length: 50 }, () =>
      generateAbandonmentDetails("determinism-check", eras[0]!, archetypes[0]!, regions[0]!),
    );

    const first = results[0];
    for (const r of results) {
      expect(r).toEqual(first);
    }
  });

  it("determinism holds for every archetype", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const arch of archetypes) {
      const a = generateAbandonmentDetails("det-arch", eras[0]!, arch, regions[0]!);
      const b = generateAbandonmentDetails("det-arch", eras[0]!, arch, regions[0]!);
      expect(a).toEqual(b);
    }
  });

  it("determinism holds for every era", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const era of eras) {
      const a = generateAbandonmentDetails("det-era", era, archetypes[0]!, regions[0]!);
      const b = generateAbandonmentDetails("det-era", era, archetypes[0]!, regions[0]!);
      expect(a).toEqual(b);
    }
  });
});

// ---------------------------------------------------------------------------
// 5 · Era appropriateness — details match the selected era
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — era appropriateness", () => {
  it("early-web sites never get startup-era-specific details", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const earlyWeb = eras.find((e) => e.id === "early-web")!;
    // Startup-specific terms that should not appear in early-web
    const startupTerms = ["beta invite", "launching q", "waitlist", "product hunt"];

    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, earlyWeb, archetypes[0]!, regions[0]!);
      for (const detail of result) {
        const labelLower = detail.label.toLowerCase();
        for (const term of startupTerms) {
          expect(labelLower).not.toContain(term);
        }
      }
    }
  });

  it("startup-minimalism sites never get early-web-specific details", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const startup = eras.find((e) => e.id === "startup-minimalism")!;
    // Early-web-specific terms that should not appear in startup era
    const earlyWebTerms = ["shockwave flash", "geocities", "under construction", "ie6"];

    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, startup, archetypes[0]!, regions[0]!);
      for (const detail of result) {
        const labelLower = detail.label.toLowerCase();
        for (const term of earlyWebTerms) {
          expect(labelLower).not.toContain(term);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 6 · No template syntax leaking — placeholders are resolved
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — template resolution", () => {
  it("no labels contain unresolved {placeholder} syntax", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const era of eras) {
      for (const seed of FIXED_SEEDS.slice(0, 10)) {
        const result = generateAbandonmentDetails(seed, era, archetypes[0]!, regions[0]!);
        for (const detail of result) {
          expect(detail.label).not.toMatch(/\{[a-zA-Z]+\}/);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 7 · Independence from DOM — pure function, no DOM imports
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — independence from DOM", () => {
  it("generator runs in Node without DOM environment", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const result = generateAbandonmentDetails("node-env", eras[0]!, archetypes[0]!, regions[0]!);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]!.label).toBeTruthy();
  });

  it("abandonment-generator.ts does not import DOM APIs", async () => {
    const source = readFileSync(
      resolve(ROOT, "src/domain/generators/abandonment-generator.ts"),
      "utf-8",
    );
    expect(source).not.toMatch(/\bdocument\b/);
    expect(source).not.toMatch(/\bwindow\b/);
    expect(source).not.toMatch(/\bDOM\b/i);
    expect(source).not.toMatch(/\bgetElementBy/);
    expect(source).not.toMatch(/\bquerySelector\b/);
  });
});

// ---------------------------------------------------------------------------
// 8 · RNG isolation — uses deriveSeed('abandonment')
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — RNG isolation", () => {
  it("calling generateAbandonmentDetails does not depend on external RNG state", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { createRng } = await loadSeedUtils();
    const { eras, archetypes, regions } = await loadData();

    const baseline = generateAbandonmentDetails("rng-iso", eras[0]!, archetypes[0]!, regions[0]!);

    // Consume values from an external RNG with the same seed
    const externalRng = createRng("rng-iso");
    externalRng.next();
    externalRng.next();
    externalRng.next();
    externalRng.int(0, 100);

    const afterExternal = generateAbandonmentDetails("rng-iso", eras[0]!, archetypes[0]!, regions[0]!);
    expect(afterExternal).toEqual(baseline);
  });

  it("abandonment generator uses deriveSeed with 'abandonment' key", async () => {
    const source = readFileSync(
      resolve(ROOT, "src/domain/generators/abandonment-generator.ts"),
      "utf-8",
    );
    expect(source).toMatch(/deriveSeed\([^)]*,\s*['"]abandonment['"]\)/);
  });

  it("adding abandonment details does not change other generator outputs", async () => {
    const generateSite = await loadGenerateSite();

    const site1 = generateSite("isolation-check");
    const site2 = generateSite("isolation-check");

    expect(site1.era.id).toBe(site2.era.id);
    expect(site1.archetype.id).toBe(site2.archetype.id);
    expect(site1.region.id).toBe(site2.region.id);
    expect(site1.metadata.siteName).toBe(site2.metadata.siteName);
    expect(site1.metadata.yearFounded).toBe(site2.metadata.yearFounded);
    expect(site1.metadata.tagline).toBe(site2.metadata.tagline);
  });
});

// ---------------------------------------------------------------------------
// 9 · Integration — abandonmentDetails on GeneratedSite
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — site integration", () => {
  it("GeneratedSite includes abandonmentDetails array", async () => {
    const generateSite = await loadGenerateSite();
    const site = generateSite("integration-test");

    expect(site.abandonmentDetails).toBeDefined();
    expect(Array.isArray(site.abandonmentDetails)).toBe(true);
  });

  it("abandonmentDetails on GeneratedSite has 2–5 entries", async () => {
    const generateSite = await loadGenerateSite();

    for (const seed of FIXED_SEEDS) {
      const site = generateSite(seed);
      expect(site.abandonmentDetails!.length).toBeGreaterThanOrEqual(2);
      expect(site.abandonmentDetails!.length).toBeLessThanOrEqual(5);
    }
  });

  it("abandonmentDetails entries have correct shape", async () => {
    const generateSite = await loadGenerateSite();
    const site = generateSite("shape-integration");

    for (const detail of site.abandonmentDetails!) {
      expect(typeof detail.id).toBe("string");
      expect(typeof detail.label).toBe("string");
      expect(typeof detail.cssClass).toBe("string");
      expect(detail.label.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 10 · No real network failures — all broken effects are CSS/DOM only
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — no real network failures", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it("no fetch or XHR calls are made during rendering", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const fetchCalls: string[] = [];
    const origFetch = globalThis.fetch;
    globalThis.fetch = ((...args: unknown[]) => {
      fetchCalls.push(String(args[0]));
      return Promise.resolve(new Response());
    }) as typeof fetch;

    const xhrOpens: string[] = [];
    const OrigXHR = globalThis.XMLHttpRequest;
    const MockXHR = class {
      open(method: string, url: string) {
        xhrOpens.push(url);
      }
      send() {}
      addEventListener() {}
      setRequestHeader() {}
    };
    globalThis.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest;

    try {
      for (const seed of FIXED_SEEDS.slice(0, 10)) {
        const site = generateSite(seed);
        renderHomepage(container, site);
      }
      expect(fetchCalls).toEqual([]);
      expect(xhrOpens).toEqual([]);
    } finally {
      globalThis.fetch = origFetch;
      globalThis.XMLHttpRequest = OrigXHR;
    }
  });
});

// ---------------------------------------------------------------------------
// 11 · Content readability — main content not obscured by abandonment elements
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — content readability", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = createContainer();
  });

  it(".site-body main content text is present and not empty", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    for (const seed of FIXED_SEEDS.slice(0, 10)) {
      const site = generateSite(seed);
      renderHomepage(container, site);

      const siteBody = container.querySelector(".site-body");
      expect(siteBody).not.toBeNull();
      expect(siteBody!.textContent!.trim().length).toBeGreaterThan(0);
      expect(siteBody!.children.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("header and footer remain present with abandonment details", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    for (const seed of FIXED_SEEDS.slice(0, 10)) {
      const site = generateSite(seed);
      renderHomepage(container, site);

      expect(container.querySelector("header")).not.toBeNull();
      expect(container.querySelector("footer")).not.toBeNull();
    }
  });

  it("hero section summary text remains readable", async () => {
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    for (const seed of FIXED_SEEDS.slice(0, 5)) {
      const site = generateSite(seed);
      renderHomepage(container, site);

      const hero = container.querySelector(".hero, section");
      expect(hero).not.toBeNull();
      expect(hero!.textContent!.trim().length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 12 · Cross-seed uniqueness — different seeds produce varied details
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — cross-seed uniqueness", () => {
  it("different seeds produce varied abandonment detail combinations", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const signatures = new Set<string>();
    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, eras[0]!, archetypes[0]!, regions[0]!);
      const sig = result.map((d) => d.id).sort().join(",");
      signatures.add(sig);
    }
    // With 25 seeds, expect at least 3 distinct detail combinations
    expect(signatures.size).toBeGreaterThanOrEqual(3);
  });

  it("different seeds produce varied detail labels", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    const allLabels = new Set<string>();
    for (const seed of FIXED_SEEDS) {
      const result = generateAbandonmentDetails(seed, eras[0]!, archetypes[0]!, regions[0]!);
      for (const detail of result) {
        allLabels.add(detail.label);
      }
    }
    // Should have meaningful variety in labels
    expect(allLabels.size).toBeGreaterThan(5);
  });
});

// ---------------------------------------------------------------------------
// 13 · Smoke test — no crashes across many seeds
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — smoke test", () => {
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
    }
  });

  it("no console errors during rendering with abandonment details", async () => {
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

  it("generator does not throw for any era/archetype/region combo", async () => {
    const generateAbandonmentDetails = await loadGenerator();
    const { eras, archetypes, regions } = await loadData();

    for (const era of eras) {
      for (const arch of archetypes) {
        for (const region of regions) {
          expect(() =>
            generateAbandonmentDetails(`smoke-${era.id}-${arch.id}-${region.id}`, era, arch, region),
          ).not.toThrow();
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 14 · Snapshot stability — pinned seeds across archetypes, eras, and seeds
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — snapshot stability", () => {
  const SNAPSHOT_SEEDS = ["snap-alpha", "snap-beta", "snap-gamma"];

  // Generator snapshots: 8 archetypes × 3 seeds = 24 snapshots
  for (const archetypeId of ARCHETYPE_IDS) {
    for (const seed of SNAPSHOT_SEEDS) {
      it(`snapshot: ${archetypeId} with seed "${seed}"`, async () => {
        const generateAbandonmentDetails = await loadGenerator();
        const { eras, archetypes, regions } = await loadData();
        const arch = archetypes.find((a) => a.id === archetypeId)!;
        const era = eras[0]!;
        const region = regions.find((r) => r.id === "en-us")!;
        const result = generateAbandonmentDetails(seed, era, arch, region);
        expect(result).toMatchSnapshot();
      });
    }
  }

  // Cross-era snapshots
  for (const eraId of ERA_IDS) {
    it(`snapshot: era "${eraId}" with seed "snap-era-test"`, async () => {
      const generateAbandonmentDetails = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();
      const era = eras.find((e) => e.id === eraId)!;
      const arch = archetypes[0]!;
      const region = regions.find((r) => r.id === "en-us")!;
      const result = generateAbandonmentDetails("snap-era-test", era, arch, region);
      expect(result).toMatchSnapshot();
    });
  }

  // German region snapshots
  for (const archetypeId of ARCHETYPE_IDS.slice(0, 4)) {
    it(`snapshot: ${archetypeId} with region "de-de"`, async () => {
      const generateAbandonmentDetails = await loadGenerator();
      const { eras, archetypes, regions } = await loadData();
      const arch = archetypes.find((a) => a.id === archetypeId)!;
      const era = eras[0]!;
      const region = regions.find((r) => r.id === "de-de")!;
      const result = generateAbandonmentDetails("snap-de", era, arch, region);
      expect(result).toMatchSnapshot();
    });
  }

  // DOM snapshot for rendered abandonment details
  it("rendered homepage snapshot with abandonment details", async () => {
    document.body.innerHTML = "";
    const container = createContainer();
    const generateSite = await loadGenerateSite();
    const renderHomepage = await loadRenderHomepage();

    const site = generateSite("snap-alpha");
    renderHomepage(container, site);

    const siteBody = container.querySelector(".site-body");
    expect(siteBody).not.toBeNull();
    expect(siteBody!.innerHTML).toMatchSnapshot();
  });
});

// ---------------------------------------------------------------------------
// 15 · CSS classes — abandonment elements use expected class names
// ---------------------------------------------------------------------------

describe("US-012 · Abandonment details — CSS styling", () => {
  it("generated-site.css contains abandonment CSS classes", () => {
    const css = readFileSync(
      resolve(ROOT, "src/styles/generated-site.css"),
      "utf-8",
    );

    const expectedClasses = [
      "abandonment-badge",
      "abandonment-counter",
      "abandonment-browser-notice",
      "abandonment-missing-asset",
      "abandonment-partner-logos",
    ];

    for (const className of expectedClasses) {
      expect(css).toContain(className);
    }
  });

  it("abandonment CSS classes use CSS custom properties for theme consistency", () => {
    const css = readFileSync(
      resolve(ROOT, "src/styles/generated-site.css"),
      "utf-8",
    );

    // Extract abandonment-related rule blocks and verify they reference custom properties
    const abandonmentRules = css.match(/\.abandonment-[^{]+\{[^}]+\}/g) ?? [];
    expect(abandonmentRules.length).toBeGreaterThan(0);

    // At least some rules should reference CSS custom properties
    const usesCustomProps = abandonmentRules.some((rule) => rule.includes("var(--"));
    expect(usesCustomProps).toBe(true);
  });
});
