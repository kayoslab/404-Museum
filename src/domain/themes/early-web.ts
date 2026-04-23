import type { Theme } from "../types";

export const earlyWebTheme: Theme = {
  id: "early-web",
  label: "Early Web",
  typography: {
    fontFamily: "Times New Roman, serif",
    headingFont: "Comic Sans MS, cursive",
    monoFont: "Courier New, monospace",
    baseFontSize: 14,
    lineHeight: 1.4,
    headingWeight: 700,
  },
  palette: {
    primary: "#000080",
    secondary: "#C0C0C0",
    accent: "#FFFF00",
    background: "#FFFFFF",
    surface: "#C0C0C0",
    text: "#000000",
    muted: "#808080",
  },
  spacing: {
    unit: 4,
    small: 4,
    medium: 8,
    large: 16,
    sectionGap: 24,
  },
  borders: {
    radius: 0,
    width: 2,
    style: "outset",
    color: "#808080",
  },
  surfaces: {
    background: "solid",
    shadow: "none",
    texture: "",
  },
};
