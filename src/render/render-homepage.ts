import type { GeneratedSite } from '../domain/generate-site';
import { applyTheme } from './apply-theme';
import { renderHeader } from './render-header';
import { renderHero } from './render-hero';
import { renderFooter } from './render-footer';

export function renderHomepage(container: HTMLElement, site: GeneratedSite): void {
  container.innerHTML = '';
  applyTheme(container, site.theme);

  const wrapper = document.createElement('div');
  wrapper.className = 'generated-page';

  wrapper.appendChild(renderHeader(site));
  wrapper.appendChild(renderHero(site));
  wrapper.appendChild(renderFooter(site));

  container.appendChild(wrapper);
}
