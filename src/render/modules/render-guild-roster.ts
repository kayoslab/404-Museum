import type { GeneratedSite } from '../../domain/generate-site';
import type { SeededRandom } from '../../domain/types';
import { guildMemberNames, guildRanks, moduleHeadingOverrides } from '../../domain/data/module-fragments';

function localizeHeading(heading: string, site: GeneratedSite): string {
  const overrides = moduleHeadingOverrides[site.region.id];
  return overrides?.[heading] ?? heading;
}

export function renderGuildRoster(site: GeneratedSite, rng: SeededRandom): HTMLElement {
  const section = document.createElement('section');
  section.className = 'module-guild-roster';

  const h2 = document.createElement('h2');
  h2.textContent = localizeHeading('Guild Roster', site);
  section.appendChild(h2);

  const table = document.createElement('table');
  table.className = 'roster-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const label of ['Name', 'Rank', 'Joined']) {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const count = rng.int(5, 8);
  const names = rng.shuffle([...guildMemberNames]);
  const ranks = rng.shuffle([...guildRanks]);

  for (let i = 0; i < count; i++) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = names[i % names.length]!;
    row.appendChild(nameCell);

    const rankCell = document.createElement('td');
    rankCell.textContent = ranks[i % ranks.length]!;
    row.appendChild(rankCell);

    const dateCell = document.createElement('td');
    const year = site.metadata.yearFounded + rng.int(0, 2);
    const month = rng.int(1, 12);
    dateCell.textContent = `${year}-${String(month).padStart(2, '0')}`;
    row.appendChild(dateCell);

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}
