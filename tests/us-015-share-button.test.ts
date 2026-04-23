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

describe("US-015: Create floating share button", () => {
  describe("source files exist", () => {
    it("src/ui/share-button.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/share-button.ts"))).toBe(true);
    });

    it("src/ui/share-action.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/share-action.ts"))).toBe(true);
    });

    it("src/ui/toast.ts exists", () => {
      expect(existsSync(resolve(ROOT, "src/ui/toast.ts"))).toBe(true);
    });

    it("src/styles/share-button.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/share-button.css"))).toBe(
        true,
      );
    });

    it("src/styles/toast.css exists", () => {
      expect(existsSync(resolve(ROOT, "src/styles/toast.css"))).toBe(true);
    });
  });

  describe("share-button.css", () => {
    it("has pointer-events: auto so clicks register inside pointer-events:none overlay", () => {
      const css = readFile("src/styles/share-button.css");
      expect(css).toMatch(/pointer-events\s*:\s*auto/);
    });

    it("positions with bottom and right properties", () => {
      const css = readFile("src/styles/share-button.css");
      expect(css).toMatch(/bottom\s*:/);
      expect(css).toMatch(/right\s*:/);
    });

    it("uses fixed or absolute positioning", () => {
      const css = readFile("src/styles/share-button.css");
      expect(css).toMatch(/position\s*:\s*(fixed|absolute)/);
    });

    it("has a minimum touch target size of 44px for mobile accessibility", () => {
      const css = readFile("src/styles/share-button.css");
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

  describe("toast.css", () => {
    it("has pointer-events: none so it does not block interaction", () => {
      const css = readFile("src/styles/toast.css");
      expect(css).toMatch(/pointer-events\s*:\s*none/);
    });

    it("uses opacity or visibility transition for show/hide animation", () => {
      const css = readFile("src/styles/toast.css");
      expect(css).toMatch(/transition\s*:.*(?:opacity|visibility)/);
    });

    it("positions toast with sufficient clearance above buttons", () => {
      const css = readFile("src/styles/toast.css");
      const bottomMatch = css.match(/bottom\s*:\s*(\d+)px/);
      expect(bottomMatch).not.toBeNull();
      expect(parseInt(bottomMatch![1], 10)).toBeGreaterThanOrEqual(140);
    });

    it("has a .toast--visible modifier class", () => {
      const css = readFile("src/styles/toast.css");
      expect(css).toMatch(/\.toast--visible/);
    });

    it("has a .toast--error variant class", () => {
      const css = readFile("src/styles/toast.css");
      expect(css).toMatch(/\.toast--error/);
    });
  });

  describe("share-button.ts", () => {
    it("exports a createShareButton function", () => {
      const src = readFile("src/ui/share-button.ts");
      expect(src).toMatch(/export\s+.*createShareButton/);
    });

    it("sets aria-label for accessibility", () => {
      const src = readFile("src/ui/share-button.ts");
      expect(src).toMatch(/aria-label/i);
    });

    it("applies the share-button class name", () => {
      const src = readFile("src/ui/share-button.ts");
      expect(src).toMatch(/share-button/);
    });
  });

  describe("share-action.ts", () => {
    it("exports a performShare function", () => {
      const src = readFile("src/ui/share-action.ts");
      expect(src).toMatch(/export\s+.*performShare/);
    });

    it("uses navigator.share for Web Share API", () => {
      const src = readFile("src/ui/share-action.ts");
      expect(src).toMatch(/navigator\.share/);
    });

    it("falls back to navigator.clipboard for copying", () => {
      const src = readFile("src/ui/share-action.ts");
      expect(src).toMatch(/navigator\.clipboard/);
    });

    it("handles AbortError for user-cancelled share sheet", () => {
      const src = readFile("src/ui/share-action.ts");
      expect(src).toMatch(/AbortError/);
    });
  });

  describe("toast.ts", () => {
    it("exports a createToast function", () => {
      const src = readFile("src/ui/toast.ts");
      expect(src).toMatch(/export\s+.*createToast/);
    });

    it("toggles toast--visible class for show/hide", () => {
      const src = readFile("src/ui/toast.ts");
      expect(src).toMatch(/toast--visible/);
    });

    it("uses setTimeout for auto-dismiss", () => {
      const src = readFile("src/ui/toast.ts");
      expect(src).toMatch(/setTimeout/);
    });
  });

  describe("main.ts integration", () => {
    it("imports share-button module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(
        /import\s+.*from\s+["']\.\/ui\/share-button["']/,
      );
    });

    it("imports toast module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+.*from\s+["']\.\/ui\/toast["']/);
    });

    it("imports share-action module", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(
        /import\s+.*from\s+["']\.\/ui\/share-action["']/,
      );
    });

    it("imports share-button.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/share-button\.css["']/);
    });

    it("imports toast.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/toast\.css["']/);
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
