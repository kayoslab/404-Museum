import type { Theme } from "../types";

export const web2Theme: Theme = {
  id: "web2",
  label: "Web 2.0",
  typography: {
    fontFamily: "Lucida Grande, sans-serif",
    headingFont: "Helvetica Neue, Helvetica, sans-serif",
    monoFont: "Monaco, Consolas, monospace",
    baseFontSize: 13,
    lineHeight: 1.6,
    headingWeight: 600,
  },
  palette: {
    primary: "#4A90D9",
    secondary: "#5CB85C",
    accent: "#FF9900",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#333333",
    muted: "#888888",
  },
  spacing: {
    unit: 6,
    small: 6,
    medium: 12,
    large: 24,
    sectionGap: 36,
  },
  borders: {
    radius: 8,
    width: 1,
    style: "solid",
    color: "#D0D0D0",
  },
  surfaces: {
    background: "linear-gradient(to bottom, #FAFAFA, #E8E8E8)",
    shadow: "0 2px 6px rgba(0,0,0,0.12)",
    texture: "glossy",
  },
};
