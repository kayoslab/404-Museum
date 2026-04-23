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

describe("US-013: Create floating info button", () => {
  describe("source files exist", () => {
    it("src/ui/info-button.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/info-button.ts"))).toBe(true);
    });

    it("src/ui/info-modal.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/info-modal.ts"))).toBe(true);
    });

    it("src/styles/info-button.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/info-button.css"))).toBe(
        true,
      );
    });

    it("src/styles/info-modal.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/info-modal.css"))).toBe(
        true,
      );
    });
  });

  describe("info-button.css", () => {
    it("has pointer-events: auto so clicks register inside pointer-events:none overlay", () => {
      const css = readFile("src/styles/info-button.css");
      expect(css).toMatch(/pointer-events\s*:\s*auto/);
    });

    it("positions in bottom-right corner with bottom and right properties", () => {
      const css = readFile("src/styles/info-button.css");
      expect(css).toMatch(/bottom\s*:/);
      expect(css).toMatch(/right\s*:/);
    });

    it("uses fixed positioning or is styled for the fixed #overlay-ui container", () => {
      const css = readFile("src/styles/info-button.css");
      // The button lives inside #overlay-ui which is position:fixed,
      // so it can use position:fixed or position:absolute within that container
      expect(css).toMatch(/position\s*:\s*(fixed|absolute)/);
    });

    it("has a minimum touch target size of 44px for mobile accessibility", () => {
      const css = readFile("src/styles/info-button.css");
      // Check for width/height or min-width/min-height >= 44px
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

  describe("info-modal.css", () => {
    it("has pointer-events: auto so clicks register on the modal", () => {
      const css = readFile("src/styles/info-modal.css");
      expect(css).toMatch(/pointer-events\s*:\s*auto/);
    });

    it("has a backdrop or overlay style with semi-transparent background", () => {
      const css = readFile("src/styles/info-modal.css");
      // Look for rgba/hsla or opacity-based backdrop
      expect(css).toMatch(/rgba\s*\(|hsla\s*\(|opacity\s*:/);
    });

    it("constrains width with max-width for readability", () => {
      const css = readFile("src/styles/info-modal.css");
      expect(css).toMatch(/max-width\s*:/);
    });
  });

  describe("info-modal.ts close mechanisms", () => {
    it("has an Escape key listener for closing", () => {
      const modal = readFile("src/ui/info-modal.ts");
      expect(modal).toMatch(/Escape/);
    });

    it("has a close button element", () => {
      const modal = readFile("src/ui/info-modal.ts");
      // Should create a close button with × or similar
      expect(modal).toMatch(/close|×|✕/i);
    });

    it("supports backdrop click to close", () => {
      const modal = readFile("src/ui/info-modal.ts");
      // Should have click handler on backdrop/overlay
      expect(modal).toMatch(/click/i);
    });

    it("exports show and hide functions or methods", () => {
      const modal = readFile("src/ui/info-modal.ts");
      expect(modal).toMatch(/show/);
      expect(modal).toMatch(/hide/);
    });
  });

  describe("info-button.ts", () => {
    it("exports a createInfoButton function", () => {
      const button = readFile("src/ui/info-button.ts");
      expect(button).toMatch(/export\s+.*createInfoButton/);
    });

    it("creates a button element with aria-label for accessibility", () => {
      const button = readFile("src/ui/info-button.ts");
      expect(button).toMatch(/aria-label/i);
    });
  });

  describe("main.ts integration", () => {
    it("imports info-button module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(
        /import\s+.*from\s+["']\.\/ui\/info-button["']/,
      );
    });

    it("imports info-modal module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(
        /import\s+.*from\s+["']\.\/ui\/info-modal["']/,
      );
    });

    it("imports info-button.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/info-button\.css["']/);
    });

    it("imports info-modal.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/info-modal\.css["']/);
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
