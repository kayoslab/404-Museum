import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { testimonialQuotes, testimonialNames, testimonialRoles, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderTestimonials(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-testimonials';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Testimonials', site);
  section.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'testimonials-grid';

  const count = rng.int(2, 4);
  const quotes = rng.shuffle([...testimonialQuotes]);
  const names = rng.shuffle([...testimonialNames]);
  const roles = rng.shuffle([...testimonialRoles]);

  for (let i = 0; i < count; i++) {
    const card = document.createElement('blockquote');
    card.className = 'testimonial-card';

    const quote = document.createElement('p');
    quote.className = 'testimonial-quote';
    quote.textContent = `"${quotes[i % quotes.length]!}"`;
    card.appendChild(quote);

    const cite = document.createElement('cite');
    cite.textContent = `— ${names[i % names.length]!}, ${roles[i % roles.length]!}`;
    card.appendChild(cite);

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}
