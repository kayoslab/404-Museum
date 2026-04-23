import './styles/reset.css';
import './styles/shell.css';

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  const generatedSite = app.querySelector<HTMLDivElement>("#generated-site");
  const overlayUi = app.querySelector<HTMLDivElement>("#overlay-ui");

  if (!generatedSite || !overlayUi) {
    console.error("404 Museum: Missing required containers");
  }
}
