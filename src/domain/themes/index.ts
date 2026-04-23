import type { Theme } from "../types";
import { earlyWebTheme } from "./early-web";
import { portalEraTheme } from "./portal-era";
import { web2Theme } from "./web2";
import { startupMinimalTheme } from "./startup-minimal";
import { altTimelineTheme } from "./alt-timeline";

export const themes: readonly Theme[] = [
  earlyWebTheme,
  portalEraTheme,
  web2Theme,
  startupMinimalTheme,
  altTimelineTheme,
];

export const themesByEraId: Readonly<Record<string, Theme>> = Object.fromEntries(
  themes.map((t) => [t.id, t]),
);
