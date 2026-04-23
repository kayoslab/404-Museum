export interface InfoModal {
  show(): void;
  hide(): void;
}

export function createInfoModal(container: HTMLElement): InfoModal {
  const backdrop = document.createElement('div');
  backdrop.className = 'info-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'info-modal';

  const closeButton = document.createElement('button');
  closeButton.className = 'info-modal-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';

  const heading = document.createElement('h2');
  heading.textContent = '404 Museum';

  const intro = document.createElement('p');
  intro.textContent =
    'Every refresh generates a fake abandoned website from an alternate internet timeline. ' +
    'A failed European airline from 1997. A forgotten operating system vendor from 2001. ' +
    'A dead MMORPG guild fan page. Each site is procedurally generated and styled to match ' +
    'its era — from table layouts and beveled buttons to startup minimalism and flat UI.';

  const details = document.createElement('p');
  details.textContent =
    'Every site is derived from a deterministic seed, so sharing a URL guarantees the ' +
    'recipient sees the exact same page. Names, descriptions, content sections, and visual ' +
    'decay are all assembled from curated datasets. No two refreshes are alike, but every ' +
    'seed is reproducible.';

  const howTo = document.createElement('p');
  howTo.className = 'info-modal-howto';
  howTo.textContent =
    'Use the refresh button to generate a new site, or the share button to copy ' +
    'the current seeded URL to your clipboard.';

  const sourceLink = document.createElement('a');
  sourceLink.href = 'https://github.com/kayoslab/404-Museum';
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener noreferrer';
  sourceLink.className = 'info-modal-source';
  sourceLink.textContent = 'View source on GitHub';

  modal.appendChild(closeButton);
  modal.appendChild(heading);
  modal.appendChild(intro);
  modal.appendChild(details);
  modal.appendChild(howTo);
  modal.appendChild(sourceLink);
  backdrop.appendChild(modal);
  container.appendChild(backdrop);

  function show() {
    backdrop.classList.add('visible');
  }

  function hide() {
    backdrop.classList.remove('visible');
  }

  closeButton.addEventListener('click', hide);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      hide();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('visible')) {
      hide();
    }
  });

  return { show, hide };
}
