import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(__dirname, "..");

function readJSON(relativePath: string): unknown {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

describe("US-018: Deploy static production build", () => {
  // -------------------------------------------------------------------------
  // AC1: Production build succeeds
  // -------------------------------------------------------------------------
  describe("production build", () => {
    it("npm run build exits with code 0", () => {
      expect(() => {
        execSync("npm run build", { cwd: ROOT, stdio: "pipe", timeout: 60_000 });
      }).not.toThrow();
    });

    it("produces dist/index.html", () => {
      expect(existsSync(resolve(ROOT, "dist/index.html"))).toBe(true);
    });

    it("produces JS bundles in dist/assets/", () => {
      const assetsDir = resolve(ROOT, "dist/assets");
      expect(existsSync(assetsDir)).toBe(true);
      const files = readdirSync(assetsDir);
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      expect(jsFiles.length).toBeGreaterThan(0);
    });

    it("produces CSS bundles in dist/assets/", () => {
      const assetsDir = resolve(ROOT, "dist/assets");
      const files = readdirSync(assetsDir);
      const cssFiles = files.filter((f) => f.endsWith(".css"));
      expect(cssFiles.length).toBeGreaterThan(0);
    });

    it("dist/index.html references hashed asset files", () => {
      const html = readFileSync(resolve(ROOT, "dist/index.html"), "utf-8");
      // Vite produces hashed filenames like index-abc123.js
      expect(html).toMatch(/assets\/index-[a-zA-Z0-9_-]+\.js/);
    });
  });

  // -------------------------------------------------------------------------
  // AC2: Deployment target uses static hosting only (vercel.json)
  // -------------------------------------------------------------------------
  describe("vercel.json configuration", () => {
    it("vercel.json exists at project root", () => {
      expect(existsSync(resolve(ROOT, "vercel.json"))).toBe(true);
    });

    it("specifies vite as the framework", () => {
      const config = readJSON("vercel.json") as { framework?: string };
      expect(config.framework).toBe("vite");
    });

    it('sets buildCommand to "npm run build"', () => {
      const config = readJSON("vercel.json") as { buildCommand?: string };
      expect(config.buildCommand).toBe("npm run build");
    });

    it('sets outputDirectory to "dist"', () => {
      const config = readJSON("vercel.json") as { outputDirectory?: string };
      expect(config.outputDirectory).toBe("dist");
    });

    it("includes SPA fallback rewrite to index.html", () => {
      const config = readJSON("vercel.json") as {
        rewrites?: Array<{ source: string; destination: string }>;
      };
      expect(config.rewrites).toBeDefined();
      expect(config.rewrites!.length).toBeGreaterThan(0);

      const spaRewrite = config.rewrites!.find(
        (r) => r.destination === "/index.html"
      );
      expect(spaRewrite).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // AC3: No server-side rendering or serverless functions required
  // -------------------------------------------------------------------------
  describe("no server-side rendering or serverless functions", () => {
    it('vercel.json does not contain a "functions" key', () => {
      const config = readJSON("vercel.json") as Record<string, unknown>;
      expect(config.functions).toBeUndefined();
    });

    it("vercel.json does not contain API route rewrites", () => {
      const config = readJSON("vercel.json") as {
        rewrites?: Array<{ source: string; destination: string }>;
      };
      if (config.rewrites) {
        const apiRewrites = config.rewrites.filter(
          (r) =>
            r.destination.startsWith("/api") ||
            r.source.startsWith("/api")
        );
        expect(apiRewrites).toHaveLength(0);
      }
    });

    it("no api/ or serverless function directory exists in project root", () => {
      expect(existsSync(resolve(ROOT, "api"))).toBe(false);
    });

    it("no server entry point (server.ts, server.js) exists", () => {
      expect(existsSync(resolve(ROOT, "server.ts"))).toBe(false);
      expect(existsSync(resolve(ROOT, "server.js"))).toBe(false);
      expect(existsSync(resolve(ROOT, "src/server.ts"))).toBe(false);
    });

    it("dist/ contains only static files (no server bundles)", () => {
      const distDir = resolve(ROOT, "dist");
      if (!existsSync(distDir)) {
        execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      }

      // Check there's no server-side output
      expect(existsSync(resolve(distDir, "server"))).toBe(false);
      expect(existsSync(resolve(distDir, "functions"))).toBe(false);
      expect(existsSync(resolve(distDir, ".vercel"))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // AC4: Seeded URLs work correctly (unit-level verification)
  // -------------------------------------------------------------------------
  describe("seeded URL support in production build", () => {
    it("dist/index.html is a self-contained SPA entry", () => {
      const html = readFileSync(resolve(ROOT, "dist/index.html"), "utf-8");
      // Must have a script tag for the app bundle
      expect(html).toContain("<script");
      expect(html).toContain('type="module"');
      // Must have the mount point
      expect(html).toMatch(/id=["']app["']/);
    });

    it("preview script is available for local production testing", () => {
      const pkg = readJSON("package.json") as {
        scripts?: Record<string, string>;
      };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.preview).toBeDefined();
      expect(pkg.scripts!.preview).toContain("preview");
    });

    it("preview server starts on the production build", async () => {
      if (!existsSync(resolve(ROOT, "dist"))) {
        execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      }

      const { spawn } = await import("node:child_process");
      const previewProcess = spawn("npm", ["run", "preview"], {
        cwd: ROOT,
        stdio: "pipe",
      });

      const result = await Promise.race([
        new Promise<string>((resolve) => {
          let output = "";
          previewProcess.stdout.on("data", (data: Buffer) => {
            output += data.toString();
            if (output.includes("Local:") || output.includes("localhost")) {
              resolve(output);
            }
          });
          previewProcess.stderr.on("data", (data: Buffer) => {
            output += data.toString();
            if (output.includes("Local:") || output.includes("localhost")) {
              resolve(output);
            }
          });
        }),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error("Preview server did not start within 15s")),
            15_000
          )
        ),
      ]);

      previewProcess.kill("SIGTERM");
      expect(result).toMatch(/localhost/i);
    }, 20_000);
  });

  // -------------------------------------------------------------------------
  // AC5: Deployment steps are documented
  // -------------------------------------------------------------------------
  describe("deployment documentation", () => {
    it("deployment docs exist (README.md or DEPLOY.md)", () => {
      const hasReadme = existsSync(resolve(ROOT, "README.md"));
      const hasDeploy = existsSync(resolve(ROOT, "DEPLOY.md"));
      expect(hasReadme || hasDeploy).toBe(true);
    });

    it("documentation mentions Vercel", () => {
      let content = "";
      if (existsSync(resolve(ROOT, "DEPLOY.md"))) {
        content = readFileSync(resolve(ROOT, "DEPLOY.md"), "utf-8");
      } else if (existsSync(resolve(ROOT, "README.md"))) {
        content = readFileSync(resolve(ROOT, "README.md"), "utf-8");
      }
      expect(content.toLowerCase()).toContain("vercel");
    });

    it("documentation mentions build command or build step", () => {
      let content = "";
      if (existsSync(resolve(ROOT, "DEPLOY.md"))) {
        content = readFileSync(resolve(ROOT, "DEPLOY.md"), "utf-8");
      } else if (existsSync(resolve(ROOT, "README.md"))) {
        content = readFileSync(resolve(ROOT, "README.md"), "utf-8");
      }
      expect(content.toLowerCase()).toMatch(/build/);
    });

    it("documentation mentions seeded URLs or seed parameter", () => {
      let content = "";
      if (existsSync(resolve(ROOT, "DEPLOY.md"))) {
        content = readFileSync(resolve(ROOT, "DEPLOY.md"), "utf-8");
      } else if (existsSync(resolve(ROOT, "README.md"))) {
        content = readFileSync(resolve(ROOT, "README.md"), "utf-8");
      }
      expect(content.toLowerCase()).toMatch(/seed/);
    });
  });

  // -------------------------------------------------------------------------
  // Bundle size check (CLAUDE.md: keep bundle small)
  // -------------------------------------------------------------------------
  describe("bundle size", () => {
    it("total dist/ size is under 500KB", () => {
      const distDir = resolve(ROOT, "dist");
      if (!existsSync(distDir)) {
        execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      }

      let totalSize = 0;
      function walkDir(dir: string) {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else {
            totalSize += stat.size;
          }
        }
      }
      walkDir(distDir);

      const maxBytes = 500 * 1024; // 500KB
      expect(totalSize).toBeLessThan(maxBytes);
    });
  });

  // -------------------------------------------------------------------------
  // Quality gate: all checks pass
  // -------------------------------------------------------------------------
  describe("quality gate", () => {
    it("npm run lint passes", () => {
      expect(() => {
        execSync("npm run lint", { cwd: ROOT, stdio: "pipe", timeout: 30_000 });
      }).not.toThrow();
    });

    it("npm run typecheck passes", () => {
      expect(() => {
        execSync("npm run typecheck", { cwd: ROOT, stdio: "pipe", timeout: 30_000 });
      }).not.toThrow();
    });
  });
});
