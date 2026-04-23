import type { Archetype } from "../types";

export const archetypes: readonly Archetype[] = [
  {
    id: "budget-airline",
    label: "Budget Airline",
    description: "A low-cost carrier homepage with flight search and garish promotions",
    compatibleEraIds: ["early-web", "portal-era", "web2", "startup-minimalism"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "os-vendor",
    label: "Operating System Vendor",
    description: "A forgotten operating system company with downloads and feature tours",
    compatibleEraIds: ["early-web", "portal-era", "web2", "alt-timeline"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "media-startup",
    label: "Media Startup",
    description: "A digital media or streaming platform that never quite launched",
    compatibleEraIds: ["web2", "startup-minimalism", "alt-timeline"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "mmorpg-guild",
    label: "MMORPG Guild Page",
    description: "A fan-run guild or clan homepage with member rosters and raid schedules",
    compatibleEraIds: ["early-web", "portal-era", "web2"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "webmail-provider",
    label: "Webmail Provider",
    description: "A free email service with storage counters and inbox previews",
    compatibleEraIds: ["portal-era", "web2", "alt-timeline"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "e-commerce-shop",
    label: "E-Commerce Shop",
    description: "An online retail store with product listings and shopping cart",
    compatibleEraIds: ["portal-era", "web2", "startup-minimalism"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "forum-community",
    label: "Forum Community",
    description: "A topic-based discussion board with threads and user profiles",
    compatibleEraIds: ["early-web", "portal-era", "web2"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
  {
    id: "personal-homepage",
    label: "Personal Homepage",
    description: "A hobbyist personal page with links, interests, and a guestbook",
    compatibleEraIds: ["early-web", "portal-era", "web2", "alt-timeline"],
    compatibleRegionIds: ["en-us", "de-de", "en-gb"],
  },
] as const;
