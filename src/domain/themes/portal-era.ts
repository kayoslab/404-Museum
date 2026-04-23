import type { Theme } from "../types";

export const portalEraTheme: Theme = {
  id: "portal-era",
  label: "Portal Era",
  typography: {
    fontFamily: "Verdana, Geneva, sans-serif",
    headingFont: "Arial, Helvetica, sans-serif",
    monoFont: "Courier New, monospace",
    baseFontSize: 12,
    lineHeight: 1.5,
    headingWeight: 700,
  },
  palette: {
    primary: "#336699",
    secondary: "#FF6600",
    accent: "#003366",
    background: "#FFFFFF",
    surface: "#EEEEEE",
    text: "#333333",
    muted: "#999999",
  },
  spacing: {
    unit: 4,
    small: 4,
    medium: 10,
    large: 20,
    sectionGap: 30,
  },
  borders: {
    radius: 3,
    width: 1,
    style: "solid",
    color: "#CCCCCC",
  },
  surfaces: {
    background: "linear-gradient(to bottom, #FFFFFF, #F0F0F0)",
    shadow: "1px 1px 3px rgba(0,0,0,0.15)",
    texture: "",
  },
};
