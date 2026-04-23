import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { downloadLabels, downloadVersions, systemRequirements, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderDownloadPanel(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-download-panel';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Download', site);
  section.appendChild(h2);

  const panel = document.createElement('div');
  panel.className = 'download-content';

  const version = document.createElement('p');
  version.className = 'download-version';
  version.textContent = `${site.metadata.siteName} ${rng.pick(downloadVersions)}`;
  panel.appendChild(version);

  const btn = document.createElement('a');
  btn.href = '#';
  btn.className = 'download-button';
  btn.textContent = rng.pick(downloadLabels);
  panel.appendChild(btn);

  const reqHeading = document.createElement('h3');
  reqHeading.textContent = 'System Requirements';
  panel.appendChild(reqHeading);

  const reqList = document.createElement('ul');
  reqList.className = 'system-requirements';
  const reqs = rng.shuffle([...systemRequirements]);
  const reqCount = rng.int(3, 5);
  for (let i = 0; i < reqCount; i++) {
    const li = document.createElement('li');
    li.textContent = reqs[i % reqs.length]!;
    reqList.appendChild(li);
  }
  panel.appendChild(reqList);

  section.appendChild(panel);
  return section;
}
