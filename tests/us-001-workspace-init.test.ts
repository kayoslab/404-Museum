import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function readJSON(relativePath: string): unknown {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

describe("US-001: Initialize Vite and TypeScript workspace", () => {
  describe("package.json scripts", () => {
    it("package.json exists", () => {
      expect(existsSync(resolve(ROOT, "package.json"))).toBe(true);
    });

    it('contains a "dev" script', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.dev).toBeDefined();
    });

    it('contains a "build" script', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.build).toBeDefined();
    });

    it('contains a "preview" script', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.preview).toBeDefined();
    });
  });

  describe("TypeScript strict mode", () => {
    it("tsconfig.json exists", () => {
      expect(existsSync(resolve(ROOT, "tsconfig.json"))).toBe(true);
    });

    it("strict mode is enabled in tsconfig.json", () => {
      const tsconfig = readJSON("tsconfig.json") as {
        compilerOptions?: { strict?: boolean };
      };
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions!.strict).toBe(true);
    });
  });

  describe("project structure", () => {
    it("index.html exists at project root", () => {
      expect(existsSync(resolve(ROOT, "index.html"))).toBe(true);
    });

    it("src/main.ts entry point exists", () => {
      expect(existsSync(resolve(ROOT, "src/main.ts"))).toBe(true);
    });

    it("vite.config.ts exists", () => {
      expect(existsSync(resolve(ROOT, "vite.config.ts"))).toBe(true);
    });

    it("src/vite-env.d.ts exists with Vite client types", () => {
      const filePath = resolve(ROOT, "src/vite-env.d.ts");
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain('/// <reference types="vite/client" />');
    });

    it("node_modules directory exists (npm install was run)", () => {
      expect(existsSync(resolve(ROOT, "node_modules"))).toBe(true);
    });
  });

  describe("npm install", () => {
    it("completes successfully", () => {
      expect(() => {
        execSync("npm install", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });
  });

  describe("npm run build", () => {
    it("creates a production bundle in dist/", () => {
      execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      expect(existsSync(resolve(ROOT, "dist"))).toBe(true);
    });

    it("dist/ contains index.html", () => {
      expect(existsSync(resolve(ROOT, "dist/index.html"))).toBe(true);
    });

    it("dist/ contains JS assets", () => {
      const assetsDir = resolve(ROOT, "dist/assets");
      expect(existsSync(assetsDir)).toBe(true);
      const files = readdirSync(assetsDir);
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      expect(jsFiles.length).toBeGreaterThan(0);
    });
  });

  describe("TypeScript compilation", () => {
    it("compiles cleanly with strict mode (tsc --noEmit)", () => {
      expect(() => {
        execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });
  });

  describe("dev server", () => {
    it("npm run dev starts successfully", async () => {
      const { spawn } = await import("node:child_process");
      const devProcess = spawn("npm", ["run", "dev"], {
        cwd: ROOT,
        stdio: "pipe",
      });

      const result = await Promise.race([
        new Promise<string>((resolve) => {
          let output = "";
          devProcess.stdout.on("data", (data: Buffer) => {
            output += data.toString();
            if (output.includes("Local:") || output.includes("localhost")) {
              resolve(output);
            }
          });
          devProcess.stderr.on("data", (data: Buffer) => {
            output += data.toString();
            if (output.includes("Local:") || output.includes("localhost")) {
              resolve(output);
            }
          });
        }),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Dev server did not start within 15s")), 15_000),
        ),
      ]);

      devProcess.kill("SIGTERM");
      expect(result).toMatch(/localhost/i);
    }, 20_000);
  });

  describe("preview server", () => {
    it("npm run preview starts successfully after build", async () => {
      // Ensure build exists
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
          setTimeout(() => reject(new Error("Preview server did not start within 15s")), 15_000),
        ),
      ]);

      previewProcess.kill("SIGTERM");
      expect(result).toMatch(/localhost/i);
    }, 20_000);
  });

  describe("index.html content", () => {
    it("references src/main.ts as a module script", () => {
      const html = readFileSync(resolve(ROOT, "index.html"), "utf-8");
      expect(html).toContain('type="module"');
      expect(html).toContain("src/main.ts");
    });

    it('contains a mount point element (div#app or similar)', () => {
      const html = readFileSync(resolve(ROOT, "index.html"), "utf-8");
      expect(html).toMatch(/id=["']app["']/);
    });
  });
});
