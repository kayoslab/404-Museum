export interface NameFragments {
  readonly prefixes: readonly string[];
  readonly roots: readonly string[];
  readonly suffixes: readonly string[];
  readonly modifiers: readonly string[];
  readonly taglines: readonly string[];
}

export const BRAND_DENYLIST = [
  "google",
  "apple",
  "amazon",
  "lufthansa",
  "microsoft",
  "facebook",
  "twitter",
  "netflix",
  "spotify",
  "uber",
  "ryanair",
  "easyjet",
  "mozilla",
  "oracle",
  "samsung",
  "boeing",
] as const;

const airlineFragments: NameFragments = {
  prefixes: ["Euro", "Trans", "Sky", "Air", "Sun", "North", "East", "West", "Polar", "Jet", "Rapid", "Atlas", "Apex", "Nova", "Coastal"],
  roots: ["Wing", "Star", "Line", "Link", "Way", "Fly", "Jet", "Bird", "Hop", "Express", "Route", "Span", "Arc", "Sail", "Glide"],
  suffixes: ["Air", "Airways", "Lines", "Express", "Jet", "Connect", "Flights", "Travel", "Aero", "Aviation"],
  modifiers: ["Budget", "Direct", "Value", "Swift", "Quick", "Easy", "Smart", "Prime", "First", "Clear"],
  taglines: [
    "Fly for less",
    "Your wings, your way",
    "The affordable way to fly",
    "See the world for less",
    "Where every seat is a deal",
    "Low fares, high standards",
    "Book now, fly tomorrow",
    "The people's airline",
  ],
};

const osVendorFragments: NameFragments = {
  prefixes: ["Cyber", "Logic", "Open", "Core", "Tera", "Hyper", "Neo", "Vex", "Hex", "Flux", "Byte", "Bit", "Grid", "Prism", "Vertex"],
  roots: ["Soft", "Tech", "Sys", "Ware", "Code", "Data", "Net", "Base", "Core", "Lab", "Frame", "Link", "Node", "Works", "Forge"],
  suffixes: ["OS", "Systems", "Computing", "Technologies", "Software", "Labs", "Works", "Digital", "Solutions", "Platforms"],
  modifiers: ["Advanced", "Unified", "Integrated", "Dynamic", "Modular", "Parallel", "Quantum", "Solid", "Rapid", "Agile"],
  taglines: [
    "Computing reimagined",
    "The future of your desktop",
    "Power meets simplicity",
    "Built for the next generation",
    "Your computer, your rules",
    "Rethinking the operating system",
    "Performance without compromise",
    "The system that works for you",
  ],
};

const mediaStartupFragments: NameFragments = {
  prefixes: ["Stream", "Pulse", "Vibe", "Pixel", "Wave", "Feed", "Clip", "Reel", "Cast", "Tune", "Snap", "Buzz", "Loop", "Sync", "Dash"],
  roots: ["Hub", "Box", "Tap", "Spot", "Pop", "Drop", "Mix", "Jam", "Pad", "Deck", "Rack", "Den", "Bay", "Dock", "Yard"],
  suffixes: ["Media", "Digital", "Studios", "Creative", "Labs", "Works", "Entertainment", "Productions", "Interactive", "Content"],
  modifiers: ["Social", "Live", "Instant", "Mobile", "Cloud", "Next", "Fresh", "Bold", "Pure", "Bright"],
  taglines: [
    "Content that connects",
    "Your story, amplified",
    "Media for the modern age",
    "Watch. Share. Discover.",
    "The future of entertainment",
    "Stories worth sharing",
    "Create without limits",
    "Where content comes alive",
  ],
};

const mmorpgGuildFragments: NameFragments = {
  prefixes: ["Shadow", "Iron", "Storm", "Blood", "Dark", "Silver", "Frost", "Flame", "Thunder", "Crimson", "Void", "Steel", "Ember", "Rune", "Night"],
  roots: ["Blade", "Fang", "Claw", "Guard", "Wolf", "Forge", "Keep", "Crown", "Heart", "Bane", "Fury", "Dawn", "Fall", "Rise", "Song"],
  suffixes: ["Legion", "Order", "Clan", "Knights", "Raiders", "Alliance", "Brotherhood", "Vanguard", "Sentinels", "Crusade"],
  modifiers: ["Elite", "Ancient", "Eternal", "Sacred", "Fallen", "Mystic", "Savage", "Noble", "Sworn", "Cursed"],
  taglines: [
    "We raid at dawn",
    "Glory through battle",
    "Strength in numbers",
    "No mercy, no retreat",
    "Forged in the fires of war",
    "Honor above all",
    "Together we conquer",
    "The guild that never sleeps",
  ],
};

const webmailFragments: NameFragments = {
  prefixes: ["Mail", "Post", "Inbox", "Send", "Fast", "Quick", "Net", "Web", "Open", "Free", "My", "Easy", "Sure", "True", "All"],
  roots: ["Mail", "Post", "Box", "Note", "Message", "Letter", "Dash", "Relay", "Drop", "Hub", "Vault", "Gate", "Port", "Link", "Zone"],
  suffixes: ["Mail", "Post", "Online", "Web", "Net", "Cloud", "Express", "Plus", "Pro", "Central"],
  modifiers: ["Free", "Secure", "Fast", "Simple", "Smart", "Safe", "Private", "Instant", "Global", "Unlimited"],
  taglines: [
    "Email made simple",
    "Your inbox, reimagined",
    "Free email for everyone",
    "Fast, secure, reliable",
    "Stay connected everywhere",
    "Where email just works",
    "Communication without limits",
    "The smarter way to email",
  ],
};

const ecommerceFragments: NameFragments = {
  prefixes: ["Shop", "Buy", "Deal", "Best", "Top", "Value", "Smart", "Quick", "Super", "Mega", "Net", "Web", "Click", "Cart", "Trade"],
  roots: ["Mart", "Store", "Shop", "Deal", "Goods", "Haul", "Pick", "Find", "Grab", "Stack", "Shelf", "Stash", "Vault", "Trove", "Base"],
  suffixes: ["Market", "Store", "Shop", "Direct", "Express", "Outlet", "Depot", "Bazaar", "Emporium", "Warehouse"],
  modifiers: ["Online", "Digital", "Discount", "Premium", "Everyday", "Global", "Local", "Trusted", "Verified", "Certified"],
  taglines: [
    "Shop smarter, save more",
    "Deals delivered daily",
    "Everything you need, one click away",
    "Your online marketplace",
    "Quality finds at honest prices",
    "Shopping made effortless",
    "Great deals, great selection",
    "Where value meets variety",
  ],
};

const forumFragments: NameFragments = {
  prefixes: ["Talk", "Chat", "Forum", "Hub", "Board", "Thread", "Topic", "Open", "The", "All", "Meta", "Base", "Core", "Main", "Root"],
  roots: ["Talk", "Voice", "Word", "Mind", "View", "Pulse", "Vibe", "Hive", "Nest", "Den", "Ring", "Circle", "Node", "Point", "Scene"],
  suffixes: ["Forums", "Community", "Board", "Talks", "Hub", "Network", "Space", "Zone", "Central", "Collective"],
  modifiers: ["Open", "Active", "Live", "United", "Connected", "Engaged", "Informed", "Passionate", "Dedicated", "Independent"],
  taglines: [
    "Join the conversation",
    "Your community awaits",
    "Where ideas meet",
    "Discuss. Debate. Discover.",
    "The forum that listens",
    "Real talk, real people",
    "Knowledge shared freely",
    "Community-driven since day one",
  ],
};

const personalFragments: NameFragments = {
  prefixes: ["My", "The", "Just", "Hey", "Welcome", "Visit", "See", "Meet", "About", "Home", "Cool", "Fun", "Wild", "Big", "Little"],
  roots: ["Page", "Site", "Corner", "Spot", "Place", "World", "Zone", "Space", "Land", "Web", "Pad", "Nook", "Den", "Lair", "Realm"],
  suffixes: ["Online", "Web", "Page", "Site", "Net", "Homepage", "Portal", "Corner", "Spot", "Central"],
  modifiers: ["Personal", "Cool", "Awesome", "Rad", "Epic", "Sweet", "Random", "Digital", "Virtual", "Cyber"],
  taglines: [
    "Welcome to my corner of the web",
    "Thanks for stopping by!",
    "Under construction... forever",
    "Best viewed in 800×600",
    "You are visitor number",
    "Sign my guestbook!",
    "Last updated",
    "Made with love and HTML",
  ],
};

export const germanFragments = {
  prefixes: ["Stern", "Netz", "Blitz", "Funk", "Kern", "Frei", "Welt", "Berg", "Stein", "Wald", "Turm", "Kreis", "Strom", "Licht", "Klar"],
  roots: ["Werk", "Haus", "Dienst", "Gruppe", "Bund", "Kreis", "Markt", "Platz", "Zentrum", "Punkt", "Ring", "Kraft", "Raum", "Feld", "Grund"],
  suffixes: ["GmbH", "AG", "Verlag", "Technik", "Systeme", "Medien", "Digital", "Online", "Zentral", "Direkt"],
  modifiers: ["Schnell", "Sicher", "Stark", "Neu", "Gross", "Klein", "Fein", "Rein", "Wahr", "Echt"],
} as const;

export const fragmentsByArchetype: Readonly<Record<string, NameFragments>> = {
  "budget-airline": airlineFragments,
  "os-vendor": osVendorFragments,
  "media-startup": mediaStartupFragments,
  "mmorpg-guild": mmorpgGuildFragments,
  "webmail-provider": webmailFragments,
  "e-commerce-shop": ecommerceFragments,
  "forum-community": forumFragments,
  "personal-homepage": personalFragments,
} as const;
