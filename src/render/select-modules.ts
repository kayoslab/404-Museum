// TODO: US-011 — implement module selection logic
// Stub file for test compilation

import type { GeneratedSite } from '../domain/generate-site';

export interface ContentModule {
  readonly id: string;
  readonly label: string;
  readonly compatibleArchetypeIds: readonly string[];
  readonly compatibleEraIds: readonly string[];
  render(site: GeneratedSite, rng: unknown): HTMLElement;
}

export function selectModules(site: GeneratedSite): ContentModule[] {
  void site;
  throw new Error('selectModules not yet implemented');
}
