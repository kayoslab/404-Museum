import './styles/reset.css';
import './styles/shell.css';
import './styles/info-button.css';
import './styles/info-modal.css';
import './styles/generated-site.css';
import { createInfoButton } from './ui/info-button';
import { createInfoModal } from './ui/info-modal';
import { readSeedFromUrl, writeSeedToUrl } from './domain/url-seed';
import { resolveSeed } from './domain/resolve-seed';
import { generateSite } from './domain/generate-site';
import { renderHomepage } from './render/render-homepage';

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  const generatedSiteContainer = app.querySelector<HTMLDivElement>("#generated-site");
  const overlayUi = app.querySelector<HTMLDivElement>("#overlay-ui");

  if (!generatedSiteContainer || !overlayUi) {
    console.error("404 Museum: Missing required containers");
  } else {
    const infoButton = createInfoButton(overlayUi);
    const infoModal = createInfoModal(overlayUi);
    infoButton.addEventListener('click', () => infoModal.show());
  }

  const rawSeed = readSeedFromUrl();
  const seed = resolveSeed(rawSeed);
  writeSeedToUrl(seed);

  if (generatedSiteContainer) {
    const site = generateSite(seed);
    renderHomepage(generatedSiteContainer, site);
  }
}
