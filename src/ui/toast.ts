export interface Toast {
  show(message: string, type?: 'success' | 'error'): void;
}

export function createToast(container: HTMLElement): Toast {
  const el = document.createElement('div');
  el.className = 'toast';
  container.appendChild(el);

  let timer: ReturnType<typeof setTimeout> | null = null;

  function hide() {
    el.classList.remove('toast--visible');
    el.classList.remove('toast--error');
  }

  function show(message: string, type: 'success' | 'error' = 'success') {
    if (timer) {
      clearTimeout(timer);
    }

    el.textContent = message;
    el.classList.remove('toast--error');

    if (type === 'error') {
      el.classList.add('toast--error');
    }

    el.classList.add('toast--visible');

    timer = setTimeout(() => {
      hide();
      timer = null;
    }, 2500);
  }

  return { show };
}
