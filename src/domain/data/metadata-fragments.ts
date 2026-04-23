export const statusLabels: readonly string[] = [
  "This site has been permanently closed",
  "Domain expired",
  "Service discontinued",
  "No longer maintained",
  "This website is no longer available",
  "Account suspended",
  "Shut down by administrator",
  "Operations ceased",
  "Site decommissioned",
  "Project abandoned",
];

export const closureReasons: readonly string[] = [
  "Acquired and shut down",
  "Ran out of funding",
  "Superseded by competitor",
  "Founder moved on",
  "Company dissolved",
  "Merged with parent company",
  "Failed to find product-market fit",
  "Regulatory changes made operations unviable",
  "Key team members departed",
  "Technology became obsolete",
  "Hosting provider went offline",
  "Lost in a corporate restructuring",
];

export const summaryTemplates: Readonly<Record<string, readonly string[]>> = {
  "budget-airline": [
    "{name} offered affordable flights across Europe and beyond.",
    "Fly with {name} — low fares to over 40 destinations.",
    "{name} was your gateway to budget-friendly air travel.",
    "Book cheap flights and holiday packages with {name}.",
    "{name} connected travelers to destinations they never expected.",
  ],
  "os-vendor": [
    "{name} built operating systems for the next generation of computing.",
    "Discover {name} — the OS designed for professionals and creators.",
    "{name} delivered secure, reliable computing for businesses worldwide.",
    "Power your workstation with {name} — performance meets stability.",
    "{name} reimagined what an operating system could be.",
  ],
  "media-startup": [
    "{name} was a digital media platform for independent creators.",
    "Stream, share, and discover with {name} — media reimagined.",
    "{name} brought stories to life through innovative digital media.",
    "Welcome to {name} — where content meets community.",
    "{name} pioneered new ways to experience digital entertainment.",
  ],
  "mmorpg-guild": [
    "{name} — a legendary guild forged in the fires of battle.",
    "Join {name} and conquer the realm with fellow adventurers.",
    "{name} has been raiding since the early days of the server.",
    "Welcome to the {name} guild hall — glory awaits.",
    "{name} stood as one of the most respected guilds on the server.",
  ],
  "webmail-provider": [
    "{name} offered free email with generous storage for everyone.",
    "Sign up for {name} — fast, reliable, and always free email.",
    "{name} provided secure webmail trusted by millions of users.",
    "Your inbox, your way — {name} made email simple.",
    "{name} delivered email you could count on, every single day.",
  ],
  "e-commerce-shop": [
    "{name} was your one-stop shop for great deals online.",
    "Shop {name} for the best prices on electronics and more.",
    "{name} brought the high street to your browser.",
    "Find everything you need at {name} — fast shipping included.",
    "{name} made online shopping easy, affordable, and fun.",
  ],
  "forum-community": [
    "{name} was a thriving community of passionate enthusiasts.",
    "Join the conversation at {name} — pair knowledge and debate.",
    "{name} brought together experts and newcomers to discuss what matters.",
    "Welcome to {name} — your home for in-depth discussion.",
    "{name} hosted thousands of threads on topics you care about.",
  ],
  "personal-homepage": [
    "Welcome to {name} — my corner of the internet.",
    "{name} is where I share my projects, thoughts, and links.",
    "Hi! This is {name}, my personal homepage on the web.",
    "{name} — a personal page built with passion and curiosity.",
    "Thanks for visiting {name} — feel free to look around.",
  ],
};

export const fallbackSummaryTemplates: readonly string[] = [
  "{name} was a website that once meant something to someone.",
  "Welcome to {name} — a forgotten corner of the internet.",
  "{name} served its community faithfully for years.",
  "You have reached {name}. This site is no longer active.",
  "{name} — one of many sites lost to the passage of time.",
];
