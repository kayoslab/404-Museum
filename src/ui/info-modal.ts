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

  const description = document.createElement('p');
  description.textContent =
    'Every page is a website that never existed. Refresh for a new one.';

  modal.appendChild(closeButton);
  modal.appendChild(heading);
  modal.appendChild(description);
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
