import type { Theme } from "../types";

export const startupMinimalTheme: Theme = {
  id: "startup-minimalism",
  label: "Startup Minimalism",
  typography: {
    fontFamily: "Open Sans, sans-serif",
    headingFont: "Montserrat, sans-serif",
    monoFont: "Source Code Pro, monospace",
    baseFontSize: 16,
    lineHeight: 1.7,
    headingWeight: 300,
  },
  palette: {
    primary: "#00B4D8",
    secondary: "#222222",
    accent: "#FF6B6B",
    background: "#FFFFFF",
    surface: "#FAFAFA",
    text: "#222222",
    muted: "#AAAAAA",
  },
  spacing: {
    unit: 8,
    small: 8,
    medium: 16,
    large: 32,
    sectionGap: 64,
  },
  borders: {
    radius: 4,
    width: 1,
    style: "solid",
    color: "#E0E0E0",
  },
  surfaces: {
    background: "flat",
    shadow: "0 1px 3px rgba(0,0,0,0.08)",
    texture: "",
  },
};
