import type { SiteMetadata } from "../types";
import { deriveSeed, createRng } from "../seed";
import { generateName } from "./name-generator";
import {
  statusLabels,
  closureReasons,
  summaryTemplates,
  fallbackSummaryTemplates,
} from "../data/metadata-fragments";

export function generateMetadata(
  seed: string,
  era: { id: string; yearStart: number; yearEnd: number; [k: string]: unknown },
  archetype: { id: string; [k: string]: unknown },
  region: { id: string; tld: string; [k: string]: unknown },
): SiteMetadata {
  const metaSeed = deriveSeed(seed, "metadata");
  const rng = createRng(metaSeed);

  const nameSeed = deriveSeed(seed, "name");
  const nameRng = createRng(nameSeed);
  const generatedName = generateName(nameRng, archetype, region);

  const yearFounded = rng.int(era.yearStart, era.yearEnd);
  const statusLabel = rng.pick(statusLabels);
  const closureReason = rng.pick(closureReasons);

  const templates = summaryTemplates[archetype.id] ?? fallbackSummaryTemplates;
  const template = rng.pick(templates);
  const summary = template.replace("{name}", generatedName.companyName);

  return {
    siteName: generatedName.companyName,
    tagline: generatedName.tagline,
    yearFounded,
    statusLabel,
    closureReason,
    summary,
  };
}
