import type { Theme } from "../types";

export const altTimelineTheme: Theme = {
  id: "alt-timeline",
  label: "Strange Alternate Timeline",
  typography: {
    fontFamily: "Futura, sans-serif",
    headingFont: "Palatino, serif",
    monoFont: "Consolas, monospace",
    baseFontSize: 15,
    lineHeight: 1.55,
    headingWeight: 500,
  },
  palette: {
    primary: "#8B5CF6",
    secondary: "#0D9488",
    accent: "#D97706",
    background: "#1E293B",
    surface: "#334155",
    text: "#F0FDF4",
    muted: "#94A3B8",
  },
  spacing: {
    unit: 6,
    small: 6,
    medium: 14,
    large: 28,
    sectionGap: 48,
  },
  borders: {
    radius: 6,
    width: 1,
    style: "solid",
    color: "#475569",
  },
  surfaces: {
    background: "radial-gradient(ellipse at center, #1E293B, #0F172A)",
    shadow: "0 4px 12px rgba(139,92,246,0.15)",
    texture: "ambient",
  },
};
