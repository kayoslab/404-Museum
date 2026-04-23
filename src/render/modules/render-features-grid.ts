import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { featureNames, featureDescriptions, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderFeaturesGrid(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-features-grid';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Features', site);
  section.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'features-grid';

  const count = rng.int(3, 6);
  const names = rng.shuffle([...featureNames]);
  const descs = rng.shuffle([...featureDescriptions]);

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    icon.textContent = '◆';
    card.appendChild(icon);

    const title = document.createElement('h3');
    title.textContent = names[i % names.length]!;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = descs[i % descs.length]!;
    card.appendChild(desc);

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}
