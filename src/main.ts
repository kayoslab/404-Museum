import './styles/reset.css';
import './styles/shell.css';
import { readSeedFromUrl, writeSeedToUrl } from './domain/url-seed';
import { resolveSeed } from './domain/resolve-seed';

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  const generatedSite = app.querySelector<HTMLDivElement>("#generated-site");
  const overlayUi = app.querySelector<HTMLDivElement>("#overlay-ui");

  if (!generatedSite || !overlayUi) {
    console.error("404 Museum: Missing required containers");
  }

  const rawSeed = readSeedFromUrl();
  const seed = resolveSeed(rawSeed);
  writeSeedToUrl(seed);
}
