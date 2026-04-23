export interface AbandonmentFragment {
  readonly id: string;
  readonly template: string;
  readonly cssClass: string;
  readonly compatibleEraIds: readonly string[];
}

export const abandonmentFragments: readonly AbandonmentFragment[] = [
  // outdated-copyright — universal
  { id: 'outdated-copyright', template: 'Copyright {staleYear} — All rights reserved', cssClass: 'abandonment-badge', compatibleEraIds: ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] },

  // stale-news-date
  { id: 'stale-news-date', template: 'Last updated: {staleDate}', cssClass: 'abandonment-badge', compatibleEraIds: ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] },

  // broken-badge — early/portal/web2
  { id: 'broken-badge', template: 'Made with Macromedia Dreamweaver', cssClass: 'abandonment-badge', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'broken-badge', template: 'Hosted on Geocities', cssClass: 'abandonment-badge', compatibleEraIds: ['early-web'] },
  { id: 'broken-badge', template: 'Valid HTML 4.01 Transitional', cssClass: 'abandonment-badge', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'broken-badge', template: 'W3C XHTML 1.0 Compliant', cssClass: 'abandonment-badge', compatibleEraIds: ['portal-era', 'web2'] },
  { id: 'broken-badge', template: 'Powered by WordPress 2.1', cssClass: 'abandonment-badge', compatibleEraIds: ['web2'] },
  { id: 'broken-badge', template: 'Digg this!', cssClass: 'abandonment-badge', compatibleEraIds: ['web2'] },
  { id: 'broken-badge', template: 'RSS Feed (0 subscribers)', cssClass: 'abandonment-badge', compatibleEraIds: ['web2', 'portal-era'] },
  { id: 'broken-badge', template: 'Verified on Product Hunt', cssClass: 'abandonment-badge', compatibleEraIds: ['startup-minimalism'] },
  { id: 'broken-badge', template: 'Featured on TechCrunch', cssClass: 'abandonment-badge', compatibleEraIds: ['startup-minimalism'] },
  { id: 'broken-badge', template: 'Rendered via subether relay v0.4', cssClass: 'abandonment-badge', compatibleEraIds: ['alt-timeline'] },

  // dead-counter
  { id: 'dead-counter', template: 'Visitors: {count}', cssClass: 'abandonment-counter', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'dead-counter', template: 'You are visitor #{count}', cssClass: 'abandonment-counter', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'dead-counter', template: '{count} users online', cssClass: 'abandonment-counter', compatibleEraIds: ['portal-era', 'web2'] },
  { id: 'dead-counter', template: '{count} members registered', cssClass: 'abandonment-counter', compatibleEraIds: ['web2', 'portal-era'] },
  { id: 'dead-counter', template: 'Join {count} others on the waitlist', cssClass: 'abandonment-counter', compatibleEraIds: ['startup-minimalism'] },
  { id: 'dead-counter', template: '{count} nodes connected', cssClass: 'abandonment-counter', compatibleEraIds: ['alt-timeline'] },

  // deprecated-browser-notice
  { id: 'deprecated-browser-notice', template: 'This page requires Shockwave Flash', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['early-web'] },
  { id: 'deprecated-browser-notice', template: 'Best viewed in Internet Explorer 5.0 at 800x600', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['early-web'] },
  { id: 'deprecated-browser-notice', template: 'Optimised for IE6 — other browsers may display incorrectly', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['portal-era'] },
  { id: 'deprecated-browser-notice', template: 'Adobe Flash Player required', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['portal-era', 'web2'] },
  { id: 'deprecated-browser-notice', template: 'Please enable JavaScript and Adobe Flash to view this page', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['web2'] },
  { id: 'deprecated-browser-notice', template: 'This site works best in Chrome 28 or later', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['startup-minimalism'] },
  { id: 'deprecated-browser-notice', template: 'Requires HyperBrowse 3.x or compatible agent', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['alt-timeline'] },

  // missing-asset-placeholder
  { id: 'missing-asset-placeholder', template: '[Image not found]', cssClass: 'abandonment-missing-asset', compatibleEraIds: ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] },
  { id: 'missing-asset-placeholder', template: '[Banner image unavailable]', cssClass: 'abandonment-missing-asset', compatibleEraIds: ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] },
  { id: 'missing-asset-placeholder', template: '[Logo failed to load]', cssClass: 'abandonment-missing-asset', compatibleEraIds: ['early-web', 'portal-era', 'web2', 'startup-minimalism', 'alt-timeline'] },

  // expired-ssl-notice
  { id: 'expired-ssl-notice', template: 'Security certificate expired on {staleDate}', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['web2', 'startup-minimalism', 'alt-timeline'] },
  { id: 'expired-ssl-notice', template: 'Warning: This connection is not secure', cssClass: 'abandonment-browser-notice', compatibleEraIds: ['web2', 'startup-minimalism'] },

  // defunct-partner-logo
  { id: 'defunct-partner-logo', template: 'Partner: Altavista', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'defunct-partner-logo', template: 'Powered by Sun Microsystems', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['early-web', 'portal-era', 'web2'] },
  { id: 'defunct-partner-logo', template: 'In association with Yahoo! GeoCities', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['early-web', 'portal-era'] },
  { id: 'defunct-partner-logo', template: 'A Google Reader recommended feed', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['web2'] },
  { id: 'defunct-partner-logo', template: 'Backed by Startup Chile', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['startup-minimalism'] },
  { id: 'defunct-partner-logo', template: 'Certified by NexusTrust Authority', cssClass: 'abandonment-partner-logos', compatibleEraIds: ['alt-timeline'] },
] as const;
