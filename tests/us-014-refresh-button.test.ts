import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function readFile(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

/**
 * Extracts a CSS rule block for a given selector from a CSS string.
 * Returns the content between { and } for the first matching selector.
 */
function extractCssBlock(css: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped + "\\s*\\{([^}]*)\\}", "s");
  const match = css.match(regex);
  return match ? match[1] : null;
}

describe("US-014: Create floating refresh button", () => {
  describe("source files exist", () => {
    it("src/ui/refresh-button.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/refresh-button.ts"))).toBe(true);
    });

    it("src/styles/refresh-button.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/refresh-button.css"))).toBe(
        true,
      );
    });
  });

  describe("refresh-button.css", () => {
    it("has pointer-events: auto so clicks register inside pointer-events:none overlay", () => {
      const css = readFile("src/styles/refresh-button.css");
      expect(css).toMatch(/pointer-events\s*:\s*auto/);
    });

    it("positions with bottom: 136px to stack above share button", () => {
      const css = readFile("src/styles/refresh-button.css");
      const block = extractCssBlock(css, ".refresh-button");
      expect(block).not.toBeNull();
      const bottomMatch = block!.match(/bottom\s*:\s*(\d+)px/);
      expect(bottomMatch).not.toBeNull();
      expect(parseInt(bottomMatch![1], 10)).toBe(136);
    });

    it("positions with right: 24px to align with other buttons", () => {
      const css = readFile("src/styles/refresh-button.css");
      const block = extractCssBlock(css, ".refresh-button");
      expect(block).not.toBeNull();
      expect(block).toMatch(/right\s*:\s*24px/);
    });

    it("uses absolute positioning within the overlay container", () => {
      const css = readFile("src/styles/refresh-button.css");
      expect(css).toMatch(/position\s*:\s*(fixed|absolute)/);
    });

    it("has a minimum touch target size of 44px for mobile accessibility", () => {
      const css = readFile("src/styles/refresh-button.css");
      const sizeMatches = css.match(
        /(?:min-)?(?:width|height)\s*:\s*(\d+)px/g,
      );
      expect(sizeMatches).not.toBeNull();
      const sizes = sizeMatches!.map((m) => {
        const num = m.match(/(\d+)px/);
        return num ? parseInt(num[1], 10) : 0;
      });
      expect(sizes.some((s) => s >= 44)).toBe(true);
    });
  });

  describe("button stacking — no overlap between floating buttons", () => {
    it("info button is at bottom: 24px", () => {
      const css = readFile("src/styles/info-button.css");
      const block = extractCssBlock(css, ".info-button");
      expect(block).not.toBeNull();
      expect(block).toMatch(/bottom\s*:\s*24px/);
    });

    it("share button is at bottom: 80px", () => {
      const css = readFile("src/styles/share-button.css");
      const block = extractCssBlock(css, ".share-button");
      expect(block).not.toBeNull();
      expect(block).toMatch(/bottom\s*:\s*80px/);
    });

    it("refresh button is at bottom: 136px", () => {
      const css = readFile("src/styles/refresh-button.css");
      const block = extractCssBlock(css, ".refresh-button");
      expect(block).not.toBeNull();
      expect(block).toMatch(/bottom\s*:\s*136px/);
    });

    it("all three buttons have the same right offset", () => {
      const infoCss = readFile("src/styles/info-button.css");
      const shareCss = readFile("src/styles/share-button.css");
      const refreshCss = readFile("src/styles/refresh-button.css");

      const infoRight = extractCssBlock(infoCss, ".info-button")?.match(
        /right\s*:\s*(\d+)px/,
      );
      const shareRight = extractCssBlock(shareCss, ".share-button")?.match(
        /right\s*:\s*(\d+)px/,
      );
      const refreshRight = extractCssBlock(
        refreshCss,
        ".refresh-button",
      )?.match(/right\s*:\s*(\d+)px/);

      expect(infoRight).not.toBeNull();
      expect(shareRight).not.toBeNull();
      expect(refreshRight).not.toBeNull();
      expect(infoRight![1]).toBe(shareRight![1]);
      expect(shareRight![1]).toBe(refreshRight![1]);
    });
  });

  describe("refresh-button.ts", () => {
    it("exports a createRefreshButton function", () => {
      const src = readFile("src/ui/refresh-button.ts");
      expect(src).toMatch(/export\s+.*createRefreshButton/);
    });

    it("sets aria-label for accessibility", () => {
      const src = readFile("src/ui/refresh-button.ts");
      expect(src).toMatch(/aria-label/i);
    });

    it("applies the refresh-button class name", () => {
      const src = readFile("src/ui/refresh-button.ts");
      expect(src).toMatch(/refresh-button/);
    });

    it("uses the refresh symbol character as text content", () => {
      const src = readFile("src/ui/refresh-button.ts");
      // Should contain ↻ or similar refresh symbol
      expect(src).toMatch(/↻|⟳|🔄|refresh/i);
    });
  });

  describe("main.ts integration", () => {
    it("imports refresh-button module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(
        /import\s+.*from\s+["']\.\/ui\/refresh-button["']/,
      );
    });

    it("imports refresh-button.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/refresh-button\.css["']/);
    });

    it("imports generateSeed from seed module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/generateSeed/);
    });

    it("has a reusable render function or inline refresh logic that calls generateSite and renderHomepage", () => {
      const main = readFile("src/main.ts");
      // The refresh handler must call generateSite and renderHomepage
      expect(main).toMatch(/generateSite/);
      expect(main).toMatch(/renderHomepage/);
    });

    it("calls writeSeedToUrl when refreshing to update the URL", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/writeSeedToUrl/);
    });

    it("does not use location.reload for refresh", () => {
      const main = readFile("src/main.ts");
      expect(main).not.toMatch(/location\.reload/);
    });

    it("still uses resolveSeed for initial page load (preserves seed-from-URL behavior)", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/resolveSeed/);
    });
  });

  describe("no duplicate controls after repeated refresh", () => {
    it("refresh click handler does not re-create overlay UI elements", () => {
      const main = readFile("src/main.ts");
      // createInfoButton, createShareButton, createRefreshButton should each appear
      // exactly once — not inside any click handler or render function that runs repeatedly
      const infoButtonCalls = main.match(/createInfoButton/g);
      const shareButtonCalls = main.match(/createShareButton/g);
      const refreshButtonCalls = main.match(/createRefreshButton/g);

      // Each import adds one match, each call adds another — expect exactly 2 (import + call)
      expect(infoButtonCalls).not.toBeNull();
      expect(infoButtonCalls!.length).toBe(2);
      expect(shareButtonCalls).not.toBeNull();
      expect(shareButtonCalls!.length).toBe(2);
      expect(refreshButtonCalls).not.toBeNull();
      expect(refreshButtonCalls!.length).toBe(2);
    });
  });

  describe("build verification", () => {
    it("TypeScript compiles cleanly", () => {
      const { execSync } = require("node:child_process");
      expect(() => {
        execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });

    it("Vite build succeeds", () => {
      const { execSync } = require("node:child_process");
      expect(() => {
        execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });
  });
});
