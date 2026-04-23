import type { GeneratedSite } from '../domain/generate-site';

const CTA_BY_ERA: Record<string, string[]> = {
  'early-web': ['Enter Site', 'Click Here', 'Come In'],
  'portal-era': ['Sign Up Free', 'Join Now', 'Explore'],
  'web2': ['Get Started', 'Try It Free', 'Download Now'],
  'startup-minimalism': ['Get Started', 'Sign Up Free', 'Learn More'],
  'alt-timeline': ['Enter the Portal', 'Begin Uplink', 'Connect'],
};

export function renderHero(site: GeneratedSite): HTMLElement {
  const section = document.createElement('section');
  section.className = 'site-hero';

  if (site.metadata.tagline) {
    const h1 = document.createElement('h1');
    h1.className = 'hero-tagline';
    h1.textContent = site.metadata.tagline;
    section.appendChild(h1);
  }

  const summary = document.createElement('p');
  summary.className = 'hero-summary';
  summary.textContent = site.metadata.summary;
  section.appendChild(summary);

  const ctaOptions = CTA_BY_ERA[site.era.id] ?? ['Enter'];
  const cta = document.createElement('a');
  cta.href = '#';
  cta.className = 'hero-cta';
  cta.textContent = ctaOptions[0]!;
  section.appendChild(cta);

  return section;
}
