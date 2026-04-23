import type { Era, Theme } from "./types";
import { deriveSeed, createRng } from "./seed";
import { themesByEraId } from "./themes/index";

export function selectTheme(seed: string, era: Era): Theme {
  const themeSeed = deriveSeed(seed, "theme");
  // RNG created for future variant selection within an era
  createRng(themeSeed);

  const theme = themesByEraId[era.id];
  if (!theme) {
    throw new Error(`No theme found for era "${era.id}"`);
  }

  return theme;
}
