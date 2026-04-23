import type { GeneratedSite } from '../domain/generate-site';
import type { SeededRandom } from '../domain/types';
import { createRng, deriveSeed } from '../domain/seed';
import { contentModules } from './modules/index';

export interface ContentModule {
  readonly id: string;
  readonly label: string;
  readonly compatibleArchetypeIds: readonly string[];
  readonly compatibleEraIds: readonly string[];
  render(site: GeneratedSite, rng: SeededRandom): HTMLElement;
}

export function selectModules(site: GeneratedSite): ContentModule[] {
  const compatible = contentModules.filter(
    (m) =>
      m.compatibleArchetypeIds.includes(site.archetype.id) &&
      m.compatibleEraIds.includes(site.era.id),
  );

  const rng = createRng(deriveSeed(site.seed, 'modules'));
  const shuffled = rng.shuffle(compatible);
  const count = Math.min(rng.int(2, 4), shuffled.length);

  return shuffled.slice(0, Math.max(count, Math.min(2, shuffled.length)));
}
