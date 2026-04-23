import type { Era, Archetype, Region, Theme, SiteMetadata } from './types';
import { deriveSeed, createRng } from './seed';
import { eras } from './data/eras';
import { archetypes } from './data/archetypes';
import { regions } from './data/regions';
import { selectTheme } from './theme-mapper';
import { generateMetadata } from './generators/metadata-generator';

export interface GeneratedSite {
  readonly seed: string;
  readonly era: Era;
  readonly archetype: Archetype;
  readonly region: Region;
  readonly theme: Theme;
  readonly metadata: SiteMetadata;
}

export function generateSite(seed: string): GeneratedSite {
  const eraRng = createRng(deriveSeed(seed, 'era'));
  const era = eraRng.pick(eras);

  const compatibleArchetypes = archetypes.filter((a) =>
    a.compatibleEraIds.includes(era.id),
  );
  const archRng = createRng(deriveSeed(seed, 'archetype'));
  const archetype = archRng.pick(compatibleArchetypes);

  const compatibleRegions = regions.filter((r) =>
    archetype.compatibleRegionIds.includes(r.id),
  );
  const regionRng = createRng(deriveSeed(seed, 'region'));
  const region = regionRng.pick(compatibleRegions);

  const theme = selectTheme(seed, era);
  const metadata = generateMetadata(seed, { ...era }, { ...archetype }, { ...region });

  return { seed, era, archetype, region, theme, metadata };
}
