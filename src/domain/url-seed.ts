export function readSeedFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.has("seed") ? params.get("seed") : null;
}

export function writeSeedToUrl(seed: string): void {
  const params = new URLSearchParams(window.location.search);
  params.set("seed", seed);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", url);
}
