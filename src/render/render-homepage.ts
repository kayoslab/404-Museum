import type { GeneratedSite } from '../domain/generate-site';
import { createRng, deriveSeed } from '../domain/seed';
import { applyTheme } from './apply-theme';
import { renderHeader } from './render-header';
import { renderHero } from './render-hero';
import { renderFooter } from './render-footer';
import { selectModules } from './select-modules';
import { renderAbandonmentDetails } from './render-abandonment-details';

export function renderHomepage(container: HTMLElement, site: GeneratedSite): void {
  container.innerHTML = '';
  container.classList.remove('dark-background');
  container.style.removeProperty('--page-background');
  applyTheme(container, site.theme);

  if (site.backgroundPattern) {
    container.style.setProperty('--page-background', site.backgroundPattern.css);
    if (site.backgroundPattern.dark) {
      container.classList.add('dark-background');
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'generated-page';

  wrapper.appendChild(renderHeader(site));
  wrapper.appendChild(renderHero(site));

  const main = document.createElement('main');
  main.className = 'site-body';

  const modules = selectModules(site);
  for (const mod of modules) {
    const rng = createRng(deriveSeed(site.seed, mod.id));
    main.appendChild(mod.render(site, rng));
  }

  renderAbandonmentDetails(site, main);

  wrapper.appendChild(main);
  wrapper.appendChild(renderFooter(site));

  container.appendChild(wrapper);
}
