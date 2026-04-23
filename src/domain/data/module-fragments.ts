export const featureNames = [
  'Multi-User Support',
  'Real-Time Sync',
  'Advanced Search',
  'Custom Themes',
  'Offline Mode',
  'Data Export',
  'API Access',
  'Auto-Save',
  'Version History',
  'Role Management',
  'Two-Factor Auth',
  'Plugin System',
  'Bulk Import',
  'Activity Log',
  'Smart Filters',
] as const;

export const featureDescriptions = [
  'Collaborate with your entire team seamlessly.',
  'Changes appear instantly across all devices.',
  'Find exactly what you need in seconds.',
  'Personalize your workspace to match your style.',
  'Keep working even without an internet connection.',
  'Download your data in multiple formats.',
  'Integrate with your favorite tools and services.',
  'Never lose your work again.',
  'Roll back to any previous version at any time.',
  'Control who can access what.',
  'Keep your account secure with an extra layer of protection.',
  'Extend functionality with community-built add-ons.',
  'Migrate your existing data with ease.',
  'Track every change and who made it.',
  'Narrow down results with intelligent filtering.',
] as const;

export const newsHeadlines = [
  'Version 3.0 Released with Major Performance Improvements',
  'Scheduled Maintenance Window This Weekend',
  'New Partnership Announcement Coming Soon',
  'Community Meetup Recap and Photos',
  'Security Update: Please Change Your Password',
  'Holiday Hours and Support Availability',
  'Beta Program Now Open for Early Adopters',
  'Server Migration Complete — Thank You for Your Patience',
  'Annual User Survey Results Published',
  'New Regional Office Opening in Frankfurt',
  'Mobile App Update Available on All Platforms',
  'We Are Hiring — Join Our Growing Team',
] as const;

export const newsSnippets = [
  'We are excited to share the latest updates with our community.',
  'Thank you for your continued patience during this transition.',
  'Read on for full details and instructions.',
  'Your feedback has been instrumental in shaping this release.',
  'Please review the updated documentation for more information.',
  'We look forward to seeing you at the next event.',
  'Early access is available to all registered members.',
  'Performance benchmarks show a 40% improvement.',
  'Contact support if you experience any issues.',
  'This change affects all users on the standard plan.',
] as const;

export const testimonialQuotes = [
  'Completely transformed how our team works together.',
  'I cannot imagine going back to the old way of doing things.',
  'Simple, reliable, and exactly what we needed.',
  'The best tool I have used in my 15 years in this industry.',
  'Setup took minutes, not days. Genuinely impressed.',
  'Our productivity increased noticeably within the first week.',
  'Worth every penny. The support team is fantastic.',
  'Finally, software that just works.',
  'We switched from three different tools to just this one.',
  'Intuitive interface — even our least technical staff love it.',
  'Handles our scale with no issues whatsoever.',
  'The export feature alone saved us dozens of hours.',
] as const;

export const testimonialNames = [
  'M. Thompson',
  'S. Wagner',
  'J. Petersen',
  'R. Nakamura',
  'L. Fernandez',
  'A. Kowalski',
  'D. Chen',
  'K. O\'Brien',
  'T. Müller',
  'P. Johansson',
  'E. Rossi',
  'H. Park',
] as const;

export const testimonialRoles = [
  'CTO',
  'Project Manager',
  'Lead Developer',
  'IT Director',
  'Freelance Consultant',
  'System Administrator',
  'Operations Manager',
  'Technical Lead',
  'Founder',
  'Head of Engineering',
] as const;

export const downloadLabels = [
  'Download for Windows',
  'Download for Mac',
  'Download for Linux',
  'Get the Installer',
  'Download Free Trial',
  'Download Stable Release',
  'Get Started — Free',
  'Download Now',
] as const;

export const downloadVersions = [
  'v2.4.1',
  'v3.0.0-beta',
  'v1.8.7',
  'v4.1.0',
  'v2.0.3',
  'v5.2.1',
  'v1.0.0',
  'v3.7.2',
  'v2.9.0-rc1',
  'v6.0.0',
] as const;

export const systemRequirements = [
  'Windows 98 / ME / 2000 / XP',
  'Mac OS X 10.4 or later',
  'Linux kernel 2.6+',
  'Pentium III 500 MHz or faster',
  '256 MB RAM minimum',
  '64 MB free disk space',
  'Internet connection required for activation',
  'Java Runtime 1.4 or newer',
  'DirectX 8.0 compatible graphics',
  '.NET Framework 2.0',
] as const;

export const guildMemberNames = [
  'Shadowbane',
  'CrystalFire',
  'DarkPaladin',
  'MoonWhisper',
  'IronClad',
  'StormBringer',
  'FrostNova',
  'SilverArrow',
  'NightShade',
  'ThunderFist',
  'EmberHeart',
  'VoidWalker',
  'RuneKeeper',
  'BladeRunner',
  'StarForge',
] as const;

export const guildRanks = [
  'Guild Master',
  'Officer',
  'Veteran',
  'Member',
  'Recruit',
  'Elite',
  'Champion',
  'Advisor',
] as const;

export const routeCities = [
  'London',
  'Berlin',
  'Paris',
  'Madrid',
  'Rome',
  'Amsterdam',
  'Vienna',
  'Prague',
  'Stockholm',
  'Lisbon',
  'Dublin',
  'Warsaw',
  'Budapest',
  'Copenhagen',
  'Helsinki',
] as const;

export const routePrices = [
  '€29',
  '€39',
  '€49',
  '€59',
  '€69',
  '€79',
  '€89',
  '€99',
  '€119',
  '€149',
] as const;

export const pricingTierNames = [
  'Basic',
  'Standard',
  'Professional',
  'Enterprise',
  'Starter',
  'Growth',
  'Premium',
] as const;

export const pricingFeatures = [
  '5 GB storage',
  '25 GB storage',
  '100 GB storage',
  'Unlimited storage',
  'Email support',
  'Priority support',
  '24/7 phone support',
  'Custom domain',
  'API access',
  'Advanced analytics',
  'Single sign-on',
  'Audit log',
  'Up to 5 users',
  'Up to 25 users',
  'Unlimited users',
] as const;

export const pricingPrices = [
  '$0',
  '$9/mo',
  '$19/mo',
  '$29/mo',
  '$49/mo',
  '$99/mo',
  '$199/mo',
  '€9/mo',
  '€19/mo',
  '€49/mo',
] as const;

export const pricingCtas = [
  'Get Started',
  'Sign Up Free',
  'Start Trial',
  'Contact Sales',
  'Buy Now',
  'Choose Plan',
] as const;

export const moduleHeadingOverrides: Record<string, Record<string, string>> = {
  'de-de': {
    Features: 'Funktionen',
    'Latest News': 'Neuigkeiten',
    Download: 'Herunterladen',
    Testimonials: 'Kundenstimmen',
    'Guild Roster': 'Gildenliste',
    Pricing: 'Preise',
    'Route Map': 'Streckenplan',
  },
};
