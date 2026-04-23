import type { GeneratedSite } from '../domain/generate-site';

export function renderAbandonmentDetails(site: GeneratedSite, siteBody: HTMLElement): void {
  if (!site.abandonmentDetails || site.abandonmentDetails.length === 0) return;

  for (const detail of site.abandonmentDetails) {
    const el = document.createElement('div');
    el.className = detail.cssClass;

    switch (detail.id) {
      case 'missing-asset-placeholder': {
        const icon = document.createElement('span');
        icon.className = 'missing-asset-icon';
        icon.textContent = '\u2716';
        el.appendChild(icon);
        const text = document.createElement('span');
        text.textContent = detail.label;
        el.appendChild(text);
        break;
      }
      case 'dead-counter': {
        const counter = document.createElement('span');
        counter.className = 'counter-value';
        counter.textContent = detail.label;
        el.appendChild(counter);
        break;
      }
      case 'defunct-partner-logo': {
        const logo = document.createElement('span');
        logo.className = 'partner-logo-placeholder';
        logo.textContent = detail.label;
        el.appendChild(logo);
        break;
      }
      default: {
        el.textContent = detail.label;
        break;
      }
    }

    siteBody.appendChild(el);
  }
}
