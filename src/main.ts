import './styles/reset.css';
import './styles/shell.css';
import './styles/info-button.css';
import './styles/info-modal.css';
import './styles/share-button.css';
import './styles/refresh-button.css';
import './styles/toast.css';
import './styles/generated-site.css';
import { createInfoButton } from './ui/info-button';
import { createInfoModal } from './ui/info-modal';
import { createShareButton } from './ui/share-button';
import { createRefreshButton } from './ui/refresh-button';
import { createToast } from './ui/toast';
import { performShare } from './ui/share-action';
import { readSeedFromUrl, writeSeedToUrl } from './domain/url-seed';
import { resolveSeed } from './domain/resolve-seed';
import { generateSeed } from './domain/seed';
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

    const shareButton = createShareButton(overlayUi);
    const toast = createToast(overlayUi);
    shareButton.addEventListener('click', async () => {
      const result = await performShare(window.location.href);
      if (result.ok && result.method === 'clipboard') {
        toast.show('Link copied to clipboard');
      } else if (!result.ok) {
        toast.show('Could not share link', 'error');
      }
    });

    const refreshButton = createRefreshButton(overlayUi);
    refreshButton.addEventListener('click', () => {
      const newSeed = generateSeed();
      writeSeedToUrl(newSeed);
      const site = generateSite(newSeed);
      renderHomepage(generatedSiteContainer, site);
    });
  }

  const rawSeed = readSeedFromUrl();
  const seed = resolveSeed(rawSeed);
  writeSeedToUrl(seed);

  if (generatedSiteContainer) {
    const site = generateSite(seed);
    renderHomepage(generatedSiteContainer, site);
  }
}
