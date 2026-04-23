import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { newsHeadlines, newsSnippets, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderNewsBlock(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-news-block';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Latest News', site);
  section.appendChild(h2);

  const list = document.createElement('ul');
  list.className = 'news-list';

  const count = rng.int(3, 5);
  const headlines = rng.shuffle([...newsHeadlines]);
  const snippets = rng.shuffle([...newsSnippets]);

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
    headline.textContent = headlines[i % headlines.length]!;
    li.appendChild(headline);

    const snippet = document.createElement('p');
    snippet.textContent = snippets[i % snippets.length]!;
    li.appendChild(snippet);

    list.appendChild(li);
  }

  section.appendChild(list);
  return section;
}
