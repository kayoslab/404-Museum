import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function readFile(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

describe("US-003: Create full-screen application shell", () => {
  describe("index.html structure", () => {
    it("#app mount point still exists", () => {
      const html = readFile("index.html");
      expect(html).toMatch(/id=["']app["']/);
    });

    it("#generated-site container exists inside #app", () => {
      const html = readFile("index.html");
      expect(html).toMatch(/id=["']generated-site["']/);
      // Verify it appears after #app opens and before #app closes
      const appMatch = html.match(
        /(<div[^>]*id=["']app["'][^>]*>)([\s\S]*?)(<\/div>\s*<script)/,
      );
      expect(appMatch).not.toBeNull();
      expect(appMatch![2]).toMatch(/id=["']generated-site["']/);
    });

    it("#overlay-ui container exists inside #app", () => {
      const html = readFile("index.html");
      expect(html).toMatch(/id=["']overlay-ui["']/);
      const appMatch = html.match(
        /(<div[^>]*id=["']app["'][^>]*>)([\s\S]*?)(<\/div>\s*<script)/,
      );
      expect(appMatch).not.toBeNull();
      expect(appMatch![2]).toMatch(/id=["']overlay-ui["']/);
    });

    it("still references src/main.ts as a module script", () => {
      const html = readFile("index.html");
      expect(html).toContain('type="module"');
      expect(html).toContain("src/main.ts");
    });
  });

  describe("reset.css", () => {
    it("file exists at src/styles/reset.css", () => {
      expect(existsSync(resolve(ROOT, "src/styles/reset.css"))).toBe(true);
    });

    it("sets box-sizing to border-box universally", () => {
      const css = readFile("src/styles/reset.css");
      expect(css).toMatch(/box-sizing\s*:\s*border-box/);
    });

    it("sets margin: 0 on html/body or universally", () => {
      const css = readFile("src/styles/reset.css");
      expect(css).toMatch(/margin\s*:\s*0/);
    });

    it("sets padding: 0 on html/body or universally", () => {
      const css = readFile("src/styles/reset.css");
      expect(css).toMatch(/padding\s*:\s*0/);
    });

    it("sets html/body width to 100vw", () => {
      const css = readFile("src/styles/reset.css");
      expect(css).toMatch(/width\s*:\s*100vw/);
    });

    it("sets html/body height to 100dvh (with optional 100vh fallback)", () => {
      const css = readFile("src/styles/reset.css");
      // Must have 100dvh; may also have 100vh as fallback
      expect(css).toMatch(/height\s*:\s*100[dv]vh/);
    });

    it("sets overflow: hidden on body to suppress default scrollbars", () => {
      const css = readFile("src/styles/reset.css");
      expect(css).toMatch(/overflow\s*:\s*hidden/);
    });
  });

  describe("shell.css", () => {
    it("file exists at src/styles/shell.css", () => {
      expect(existsSync(resolve(ROOT, "src/styles/shell.css"))).toBe(true);
    });

    it("#generated-site uses absolute positioning", () => {
      const css = readFile("src/styles/shell.css");
      // Find the #generated-site block and verify position
      const block = extractCssBlock(css, "#generated-site");
      expect(block).not.toBeNull();
      expect(block).toMatch(/position\s*:\s*absolute/);
    });

    it("#generated-site has inset: 0 to fill viewport", () => {
      const css = readFile("src/styles/shell.css");
      const block = extractCssBlock(css, "#generated-site");
      expect(block).not.toBeNull();
      expect(block).toMatch(/inset\s*:\s*0/);
    });

    it("#generated-site allows internal scrolling with overflow: auto", () => {
      const css = readFile("src/styles/shell.css");
      const block = extractCssBlock(css, "#generated-site");
      expect(block).not.toBeNull();
      expect(block).toMatch(/overflow\s*:\s*auto/);
    });

    it("#overlay-ui uses fixed positioning", () => {
      const css = readFile("src/styles/shell.css");
      const block = extractCssBlock(css, "#overlay-ui");
      expect(block).not.toBeNull();
      expect(block).toMatch(/position\s*:\s*fixed/);
    });

    it("#overlay-ui has inset: 0", () => {
      const css = readFile("src/styles/shell.css");
      const block = extractCssBlock(css, "#overlay-ui");
      expect(block).not.toBeNull();
      expect(block).toMatch(/inset\s*:\s*0/);
    });

    it("#overlay-ui has pointer-events: none", () => {
      const css = readFile("src/styles/shell.css");
      const block = extractCssBlock(css, "#overlay-ui");
      expect(block).not.toBeNull();
      expect(block).toMatch(/pointer-events\s*:\s*none/);
    });

    it("#overlay-ui has a z-index higher than #generated-site", () => {
      const css = readFile("src/styles/shell.css");
      const overlayBlock = extractCssBlock(css, "#overlay-ui");
      expect(overlayBlock).not.toBeNull();

      const overlayZIndex = overlayBlock!.match(/z-index\s*:\s*(\d+)/);
      expect(overlayZIndex).not.toBeNull();

      // generated-site may or may not have an explicit z-index
      const siteBlock = extractCssBlock(css, "#generated-site");
      const siteZIndex = siteBlock?.match(/z-index\s*:\s*(\d+)/);
      const siteZ = siteZIndex ? parseInt(siteZIndex[1], 10) : 0;
      const overlayZ = parseInt(overlayZIndex![1], 10);

      expect(overlayZ).toBeGreaterThan(siteZ);
    });
  });

  describe("main.ts imports", () => {
    it("imports reset.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/reset\.css["']/);
    });

    it("imports shell.css", () => {
      const main = readFile("src/main.ts");
      expect(main).toMatch(/import\s+["']\.\/styles\/shell\.css["']/);
    });
  });

  describe("viewport resize resilience", () => {
    it("uses CSS viewport units (vw/dvh) ensuring resize works without JS", () => {
      const css = readFile("src/styles/reset.css");
      // Viewport units inherently respond to resize — just verify they are used
      expect(css).toMatch(/100vw/);
      expect(css).toMatch(/100[dv]vh/);
    });

    it("no JS resize listeners are needed (CSS handles it)", () => {
      const main = readFile("src/main.ts");
      // There should be no resize event listener — CSS viewport units handle this
      expect(main).not.toMatch(/addEventListener\s*\(\s*["']resize["']/);
    });
  });

  describe("build still works", () => {
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

/**
 * Extracts a CSS rule block for a given selector from a CSS string.
 * Returns the content between { and } for the first matching selector.
 */
function extractCssBlock(css: string, selector: string): string | null {
  // Escape special regex chars in selector
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped + "\\s*\\{([^}]*)\\}", "s");
  const match = css.match(regex);
  return match ? match[1] : null;
}
