import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import {
  eraNewsPools,
  archetypeNewsHeadlines,
  archetypeNewsSnippets,
  moduleHeadingOverrides,
} from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderNewsBlock(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-news-block';

  const pool = eraNewsPools[site.era.id];
  const heading = pool?.heading ?? 'Latest News';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading(heading, site);
  section.appendChild(h2);

  const list = document.createElement('ul');
  list.className = 'news-list';

  // Build headline pool: era headlines + archetype-specific headlines
  const eraHeadlines = pool ? [...pool.headlines] : [];
  const archHeadlines = archetypeNewsHeadlines[site.archetype.id] ?? [];
  const allHeadlines = rng.shuffle([...eraHeadlines, ...archHeadlines]);

  // Build snippet pool: era snippets + archetype-specific snippets
  const eraSnippets = pool ? [...pool.snippets] : [];
  const archSnippets = archetypeNewsSnippets[site.archetype.id] ?? [];
  const allSnippets = rng.shuffle([...eraSnippets, ...archSnippets]);

  const count = rng.int(3, 5);

  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'news-item';

    const date = document.createElement('time');
    const year = site.metadata.yearFounded + rng.int(0, 3);
    const month = rng.int(1, 12);
    const day = rng.int(1, 28);
    date.textContent = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    li.appendChild(date);

    const headline = document.createElement('h3');
    headline.textContent = allHeadlines[i % allHeadlines.length]!;
    li.appendChild(headline);

    const snippet = document.createElement('p');
    snippet.textContent = allSnippets[i % allSnippets.length]!;
    li.appendChild(snippet);

    list.appendChild(li);
  }

  section.appendChild(list);
  return section;
}
