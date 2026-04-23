export function createRefreshButton(container: HTMLElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'refresh-button';
  button.setAttribute('aria-label', 'Generate new site');
  button.textContent = '↻';
  container.appendChild(button);
  return button;
}
