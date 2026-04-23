export function createShareButton(container: HTMLElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'share-button';
  button.setAttribute('aria-label', 'Share this page');
  button.textContent = '↗';
  container.appendChild(button);
  return button;
}
