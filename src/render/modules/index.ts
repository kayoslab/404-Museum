import type { ContentModule } from '../select-modules';
import { renderFeaturesGrid } from './render-features-grid';
import { renderNewsBlock } from './render-news-block';
import { renderDownloadPanel } from './render-download-panel';
import { renderTestimonials } from './render-testimonials';
import { renderGuildRoster } from './render-guild-roster';
import { renderPricingTable } from './render-pricing-table';

export type { ContentModule };

const ALL_ERAS = ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] as const;
const ALL_ARCHETYPES = [
  'budget-airline', 'os-vendor', 'media-startup', 'mmorpg-guild',
  'webmail-provider', 'e-commerce-shop', 'forum-community', 'personal-homepage',
] as const;

export const contentModules: ContentModule[] = [
  {
    id: 'features-grid',
    label: 'Features Grid',
    compatibleArchetypeIds: [...ALL_ARCHETYPES],
    compatibleEraIds: [...ALL_ERAS],
    render: renderFeaturesGrid,
  },
  {
    id: 'news-block',
    label: 'News Block',
    compatibleArchetypeIds: [...ALL_ARCHETYPES],
    compatibleEraIds: [...ALL_ERAS],
    render: renderNewsBlock,
  },
  {
    id: 'download-panel',
    label: 'Download Panel',
    compatibleArchetypeIds: ['os-vendor', 'media-startup', 'webmail-provider', 'e-commerce-shop', 'forum-community'],
    compatibleEraIds: [...ALL_ERAS],
    render: renderDownloadPanel,
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    compatibleArchetypeIds: ['os-vendor', 'media-startup', 'webmail-provider', 'e-commerce-shop', 'budget-airline'],
    compatibleEraIds: ['web2', 'startup-minimalism', 'alt-timeline'],
    render: renderTestimonials,
  },
  {
    id: 'guild-roster',
    label: 'Guild Roster',
    compatibleArchetypeIds: ['mmorpg-guild'],
    compatibleEraIds: ['early-web', 'portal-era', 'web2'],
    render: renderGuildRoster,
  },
  {
    id: 'pricing-table',
    label: 'Pricing Table',
    compatibleArchetypeIds: ['os-vendor', 'media-startup', 'webmail-provider', 'e-commerce-shop', 'budget-airline', 'forum-community'],
    compatibleEraIds: ['web2', 'startup-minimalism', 'alt-timeline'],
    render: renderPricingTable,
  },
];
