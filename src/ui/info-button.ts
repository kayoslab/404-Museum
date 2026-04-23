export function createInfoButton(container: HTMLElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'info-button';
  button.setAttribute('aria-label', 'About 404 Museum');
  button.textContent = 'i';
  container.appendChild(button);
  return button;
}
