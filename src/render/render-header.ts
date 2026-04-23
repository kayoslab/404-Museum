import type { GeneratedSite } from '../domain/generate-site';
import { deriveSeed, createRng } from '../domain/seed';

const NAV_ITEMS_BY_ARCHETYPE: Record<string, string[]> = {
  'budget-airline': ['Home', 'Flights', 'Destinations', 'Check-In', 'About', 'Contact'],
  'os-vendor': ['Home', 'Download', 'Features', 'Support', 'Community', 'About'],
  'media-startup': ['Home', 'Watch', 'Browse', 'Pricing', 'About', 'Contact'],
  'mmorpg-guild': ['Home', 'Members', 'Raids', 'Forum', 'Gallery', 'About'],
  'webmail-provider': ['Home', 'Login', 'Register', 'Features', 'Support', 'About'],
  'e-commerce-shop': ['Home', 'Shop', 'Deals', 'Cart', 'About', 'Contact'],
  'forum-community': ['Home', 'Forum', 'Members', 'Search', 'Rules', 'About'],
  'personal-homepage': ['Home', 'About', 'Links', 'Gallery', 'Contact'],
};

const NAV_ITEMS_BY_ERA: Record<string, string[]> = {
  'early-web': ['Home', 'Guestbook', 'Links', 'About', 'Contact'],
  'portal-era': ['Home', 'News', 'Community', 'Search', 'About', 'Contact'],
  'web2': ['Home', 'Features', 'Blog', 'About', 'Contact'],
  'startup-minimalism': ['Home', 'Product', 'Pricing', 'About', 'Contact'],
  'alt-timeline': ['Home', 'Netspace', 'Uplink', 'About', 'Contact'],
};

function localizeLabel(label: string, overrides: Readonly<Record<string, string>>): string {
  return overrides[label] ?? label;
}

export function renderHeader(site: GeneratedSite): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';

  const logo = document.createElement('div');
  logo.className = 'site-logo';
  logo.textContent = site.metadata.siteName;
  header.appendChild(logo);

  const nav = document.createElement('nav');
  nav.className = 'site-nav';

  const rng = createRng(deriveSeed(site.seed, 'nav'));
  const archetypeItems = NAV_ITEMS_BY_ARCHETYPE[site.archetype.id] ?? NAV_ITEMS_BY_ERA[site.era.id] ?? ['Home', 'About', 'Contact'];
  const eraItems = NAV_ITEMS_BY_ERA[site.era.id] ?? [];

  // Merge archetype-specific items with era-specific flavor, deduplicated
  const combined = [...archetypeItems];
  for (const item of eraItems) {
    if (!combined.includes(item)) {
      combined.push(item);
    }
  }

  // Pick 3-5 items deterministically
  const count = rng.int(3, Math.min(5, combined.length));
  const shuffled = rng.shuffle(combined);
  const selected = shuffled.slice(0, count);

  // Ensure "Home" is always first if present
  const homeIdx = selected.indexOf('Home');
  if (homeIdx > 0) {
    selected.splice(homeIdx, 1);
    selected.unshift('Home');
  }

  const overrides = site.region.vocabularyOverrides;
  for (const item of selected) {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = localizeLabel(item, overrides);
    nav.appendChild(a);
  }

  header.appendChild(nav);
  return header;
}
