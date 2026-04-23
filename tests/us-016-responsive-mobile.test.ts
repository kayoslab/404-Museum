import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function readFile(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

/**
 * Extracts all content within a @media block matching a given max-width.
 */
function extractMediaBlock(css: string, maxWidth: string): string | null {
  const pattern = new RegExp(
    `@media\\s*\\(\\s*max-width\\s*:\\s*${maxWidth}\\s*\\)\\s*\\{`,
    "g",
  );
  const match = pattern.exec(css);
  if (!match) return null;

  let depth = 1;
  let i = match.index + match[0].length;
  const start = i;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  return css.slice(start, i - 1);
}

describe("US-016: Add responsive mobile support", () => {
  describe("source files exist", () => {
    it("src/styles/responsive.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/responsive.css"))).toBe(
        true,
      );
    });
  });

  describe("main.ts integration", () => {
    it("imports responsive.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/responsive\.css["']/);
    });

    it("imports responsive.css after other style imports", () => {
      const main = readFile("src/main.ts");
      const lines = main.split("\n");
      const responsiveIndex = lines.findIndex((l) =>
        /import\s+["']\.\/styles\/responsive\.css["']/.test(l),
      );
      const generatedSiteIndex = lines.findIndex((l) =>
        /import\s+["']\.\/styles\/generated-site\.css["']/.test(l),
      );
      expect(responsiveIndex).toBeGreaterThan(-1);
      expect(generatedSiteIndex).toBeGreaterThan(-1);
      expect(responsiveIndex).toBeGreaterThan(generatedSiteIndex);
    });
  });

  describe("responsive.css media queries", () => {
    it("contains a media query for ≤480px (small phones)", () => {
      const css = readFile("src/styles/responsive.css");
      expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*480px\s*\)/);
    });

    it("contains a media query for ≤600px", () => {
      const css = readFile("src/styles/responsive.css");
      expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*600px\s*\)/);
    });
  });

  describe("horizontal overflow prevention", () => {
    it("applies overflow-x: hidden on #generated-site", () => {
      const css = readFile("src/styles/responsive.css");
      expect(css).toMatch(/#generated-site/);
      expect(css).toMatch(/overflow-x\s*:\s*hidden/);
    });

    it("applies max-width: 100vw on #generated-site", () => {
      const css = readFile("src/styles/responsive.css");
      expect(css).toMatch(/max-width\s*:\s*100vw/);
    });
  });

  describe("floating controls responsive rules", () => {
    it("has responsive rules for .info-button at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.info-button/);
    });

    it("has responsive rules for .share-button at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.share-button/);
    });

    it("has responsive rules for .refresh-button at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.refresh-button/);
    });

    it("adjusts right offset for floating controls at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/right\s*:/);
    });

    it("adjusts bottom offset for floating controls at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/bottom\s*:/);
    });
  });

  describe("info-modal responsive rules", () => {
    it("has responsive rules for .info-modal at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.info-modal\b/);
    });

    it("constrains modal height with max-height to prevent viewport overflow", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/max-height\s*:/);
    });

    it("enables vertical scrolling on the modal with overflow-y", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/overflow-y\s*:\s*auto/);
    });
  });

  describe("toast responsive rules", () => {
    it("has responsive rules for .toast at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.toast\b/);
    });

    it("constrains toast max-width to prevent horizontal overflow", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/max-width\s*:/);
    });

    it("allows toast text wrapping with white-space: normal", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/white-space\s*:\s*normal/);
    });
  });

  describe("typography responsive rules", () => {
    it("has responsive font-size rules at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/font-size\s*:/);
    });

    it("scales .hero-tagline down at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.hero-tagline/);
    });
  });

  describe("roster table responsive rules", () => {
    it("enables horizontal scrolling for roster table at ≤480px", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "480px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/overflow-x\s*:\s*auto/);
    });
  });

  describe("existing 600px breakpoint consolidation", () => {
    it("responsive.css contains the 600px layout rules (moved from generated-site.css)", () => {
      const css = readFile("src/styles/responsive.css");
      const block = extractMediaBlock(css, "600px");
      expect(block).not.toBeNull();
      expect(block).toMatch(/\.site-header/);
      expect(block).toMatch(/\.hero-tagline/);
      expect(block).toMatch(/\.site-body/);
    });

    it("generated-site.css no longer contains the 600px media query", () => {
      const css = readFile("src/styles/generated-site.css");
      expect(css).not.toMatch(/@media\s*\(\s*max-width\s*:\s*600px\s*\)/);
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
