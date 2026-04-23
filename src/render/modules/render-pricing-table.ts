import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { pricingTierNames, pricingFeatures, pricingPrices, pricingCtas, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderPricingTable(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-pricing-table';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Pricing', site);
  section.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'pricing-grid';

  const tierCount = rng.int(2, 3);
  const tierNames = rng.shuffle([...pricingTierNames]);
  const prices = rng.shuffle([...pricingPrices]);
  const ctas = rng.shuffle([...pricingCtas]);
  const features = rng.shuffle([...pricingFeatures]);

  let featureIdx = 0;
  for (let i = 0; i < tierCount; i++) {
    const col = document.createElement('div');
    col.className = 'pricing-tier';

    const name = document.createElement('h3');
    name.textContent = tierNames[i % tierNames.length]!;
    col.appendChild(name);

    const price = document.createElement('div');
    price.className = 'pricing-price';
    price.textContent = prices[i % prices.length]!;
    col.appendChild(price);

    const featureList = document.createElement('ul');
    const featureCount = rng.int(3, 5);
    for (let j = 0; j < featureCount; j++) {
      const li = document.createElement('li');
      li.textContent = features[featureIdx % features.length]!;
      featureIdx++;
      featureList.appendChild(li);
    }
    col.appendChild(featureList);

    const cta = document.createElement('a');
    cta.href = '#';
    cta.className = 'pricing-cta';
    cta.textContent = ctas[i % ctas.length]!;
    col.appendChild(cta);

    grid.appendChild(col);
  }

  section.appendChild(grid);
  return section;
}
