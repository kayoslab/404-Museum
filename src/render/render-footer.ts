import type { GeneratedSite } from '../domain/generate-site';

const ERA_FOOTER_LINES: Record<string, string> = {
  'early-web': 'Best viewed in Netscape Navigator 4.0',
  'portal-era': 'Powered by Apache/1.3',
  'web2': 'Built with passion and AJAX',
  'startup-minimalism': 'Made with love',
  'alt-timeline': 'Rendered via hyperportal mesh v2.1',
};

export function renderFooter(site: GeneratedSite): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  const copyright = document.createElement('p');
  copyright.className = 'footer-copyright';
  copyright.textContent = `\u00A9 ${site.metadata.yearFounded} ${site.metadata.siteName}`;
  footer.appendChild(copyright);

  const status = document.createElement('p');
  status.className = 'footer-status';
  status.textContent = site.metadata.statusLabel;
  footer.appendChild(status);

  const reason = document.createElement('p');
  reason.className = 'footer-reason';
  reason.textContent = site.metadata.closureReason;
  footer.appendChild(reason);

  const eraLine = ERA_FOOTER_LINES[site.era.id];
  if (eraLine) {
    const flavor = document.createElement('p');
    flavor.className = 'footer-era-flavor';
    flavor.textContent = eraLine;
    footer.appendChild(flavor);
  }

  // Add localized legal links for German region
  if (site.region.id === 'de-de') {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    const overrides = site.region.vocabularyOverrides;
    for (const key of ['Legal', 'Privacy']) {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = overrides[key] ?? key;
      legal.appendChild(a);
    }
    footer.appendChild(legal);
  }

  return footer;
}
