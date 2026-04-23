export async function performShare(
  url: string,
): Promise<{ ok: boolean; method: 'share' | 'clipboard' | 'none' }> {
  if (navigator.share) {
    try {
      await navigator.share({ title: '404 Museum', url });
      return { ok: true, method: 'share' };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ok: true, method: 'share' };
      }
      // Fall through to clipboard
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return { ok: true, method: 'clipboard' };
    } catch {
      return { ok: false, method: 'none' };
    }
  }

  return { ok: false, method: 'none' };
}
