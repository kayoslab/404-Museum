import type { Region } from "../types";

export const regions: readonly Region[] = [
  {
    id: "en-us",
    label: "United States",
    language: "en",
    tld: ".com",
    currencySymbol: "$",
    vocabularyOverrides: {},
  },
  {
    id: "de-de",
    label: "Germany",
    language: "de",
    tld: ".de",
    currencySymbol: "\u20AC",
    vocabularyOverrides: {
      Home: "Startseite",
      About: "\u00DCber uns",
      Contact: "Kontakt",
      Legal: "Impressum",
      Privacy: "Datenschutz",
      Search: "Suche",
      Login: "Anmelden",
      Register: "Registrieren",
      Download: "Herunterladen",
      News: "Nachrichten",
    },
  },
  {
    id: "en-gb",
    label: "United Kingdom",
    language: "en",
    tld: ".co.uk",
    currencySymbol: "\u00A3",
    vocabularyOverrides: {
      Color: "Colour",
      Favorite: "Favourite",
      Center: "Centre",
      License: "Licence",
    },
  },
] as const;
