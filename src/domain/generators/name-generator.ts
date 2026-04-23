import type { SeededRandom } from "../types";
import {
  fragmentsByArchetype,
  germanFragments,
  BRAND_DENYLIST,
} from "../data/name-fragments";

export interface GeneratedName {
  readonly companyName: string;
  readonly tagline: string | undefined;
  readonly domain: string;
  readonly archetype: string;
}

function buildName(rng: SeededRandom, archetypeId: string, isGerman: boolean): string {
  const fragments = fragmentsByArchetype[archetypeId];
  if (!fragments) {
    return "Unknown";
  }

  if (isGerman && rng.bool(0.6)) {
    return buildGermanName(rng, fragments);
  }

  const pattern = rng.int(0, 3);
  switch (pattern) {
    case 0:
      return rng.pick(fragments.prefixes) + rng.pick(fragments.roots);
    case 1:
      return rng.pick(fragments.prefixes) + rng.pick(fragments.suffixes);
    case 2:
      return rng.pick(fragments.modifiers) + rng.pick(fragments.roots);
    case 3:
      return rng.pick(fragments.prefixes) + rng.pick(fragments.roots) + " " + rng.pick(fragments.suffixes);
    default:
      return rng.pick(fragments.prefixes) + rng.pick(fragments.roots);
  }
}

function buildGermanName(rng: SeededRandom, fragments: { prefixes: readonly string[]; roots: readonly string[] }): string {
  const pattern = rng.int(0, 3);
  switch (pattern) {
    case 0:
      return rng.pick(germanFragments.prefixes) + rng.pick(germanFragments.roots).toLowerCase();
    case 1:
      return rng.pick(germanFragments.prefixes) + rng.pick(fragments.roots).toLowerCase();
    case 2:
      return rng.pick(fragments.prefixes) + rng.pick(germanFragments.roots).toLowerCase();
    case 3:
      return rng.pick(germanFragments.prefixes) + rng.pick(germanFragments.roots).toLowerCase() + " " + rng.pick(germanFragments.suffixes);
    default:
      return rng.pick(germanFragments.prefixes) + rng.pick(germanFragments.roots).toLowerCase();
  }
}

function buildDomain(companyName: string, tld: string): string {
  return companyName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "") + tld;
}

function isBrandUnsafe(name: string): boolean {
  const lower = name.toLowerCase();
  return BRAND_DENYLIST.some((brand) => lower.includes(brand));
}

function pickTagline(rng: SeededRandom, archetypeId: string): string | undefined {
  const fragments = fragmentsByArchetype[archetypeId];
  if (!fragments) return undefined;

  if (rng.bool(0.6)) {
    return rng.pick(fragments.taglines);
  }
  return undefined;
}

export function generateName(
  rng: SeededRandom,
  archetype: { id: string; [k: string]: unknown },
  region: { id: string; tld: string; [k: string]: unknown },
): GeneratedName {
  const isGerman = region.id === "de-de";

  let companyName = "";
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    companyName = buildName(rng, archetype.id, isGerman);
    if (!isBrandUnsafe(companyName)) break;
    if (attempt === maxAttempts - 1) {
      companyName = buildName(rng, archetype.id, false);
    }
  }

  const domain = buildDomain(companyName, region.tld);
  const tagline = pickTagline(rng, archetype.id);

  return {
    companyName,
    tagline,
    domain,
    archetype: archetype.id,
  };
}
