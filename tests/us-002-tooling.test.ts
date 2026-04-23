import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function readJSON(relativePath: string): unknown {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

describe("US-002: Add linting, typecheck, and unit test tooling", () => {
  describe("npm scripts exist", () => {
    it('"lint" script exists in package.json', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.lint).toBeDefined();
    });

    it('"lint" script is not a placeholder', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts!.lint).not.toContain("echo");
      expect(pkg.scripts!.lint).toMatch(/eslint/i);
    });

    it('"typecheck" script exists and runs tsc --noEmit', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.typecheck).toBeDefined();
      expect(pkg.scripts!.typecheck).toContain("tsc");
      expect(pkg.scripts!.typecheck).toContain("--noEmit");
    });

    it('"test" script exists and runs vitest', () => {
      const pkg = readJSON("package.json") as { scripts?: Record<string, string> };
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts!.test).toBeDefined();
      expect(pkg.scripts!.test).toMatch(/vitest/i);
    });
  });

  describe("ESLint configuration", () => {
    it("eslint.config.js (or .mjs/.cjs) exists at project root", () => {
      const hasConfig =
        existsSync(resolve(ROOT, "eslint.config.js")) ||
        existsSync(resolve(ROOT, "eslint.config.mjs")) ||
        existsSync(resolve(ROOT, "eslint.config.cjs"));
      expect(hasConfig).toBe(true);
    });

    it("ESLint config is loadable (npx eslint --print-config)", () => {
      expect(() => {
        execSync("npx eslint --print-config src/main.ts", {
          cwd: ROOT,
          stdio: "pipe",
        });
      }).not.toThrow();
    });

    it("ESLint is installed as a dev dependency", () => {
      const pkg = readJSON("package.json") as {
        devDependencies?: Record<string, string>;
      };
      expect(pkg.devDependencies).toBeDefined();
      expect(pkg.devDependencies!.eslint).toBeDefined();
    });

    it("typescript-eslint is installed as a dev dependency", () => {
      const pkg = readJSON("package.json") as {
        devDependencies?: Record<string, string>;
      };
      expect(pkg.devDependencies).toBeDefined();
      expect(pkg.devDependencies!["typescript-eslint"]).toBeDefined();
    });
  });

  describe("npm run lint", () => {
    it("runs ESLint without errors on src/", () => {
      expect(() => {
        execSync("npm run lint", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });

    it("runs non-interactively (no TTY prompts)", () => {
      const result = execSync("npm run lint", {
        cwd: ROOT,
        stdio: "pipe",
        timeout: 30_000,
      });
      // If we get here, the command completed without hanging
      expect(result).toBeDefined();
    });
  });

  describe("npm run typecheck", () => {
    it("runs tsc --noEmit without errors", () => {
      expect(() => {
        execSync("npm run typecheck", { cwd: ROOT, stdio: "pipe" });
      }).not.toThrow();
    });

    it("runs non-interactively (no TTY prompts)", () => {
      const result = execSync("npm run typecheck", {
        cwd: ROOT,
        stdio: "pipe",
        timeout: 30_000,
      });
      expect(result).toBeDefined();
    });
  });

  describe("npm run test (self-referential)", () => {
    it("vitest is installed as a dev dependency", () => {
      const pkg = readJSON("package.json") as {
        devDependencies?: Record<string, string>;
      };
      expect(pkg.devDependencies).toBeDefined();
      expect(pkg.devDependencies!.vitest).toBeDefined();
    });

    it("at least one test file exists in tests/", () => {
      expect(existsSync(resolve(ROOT, "tests"))).toBe(true);
      const { readdirSync } = require("node:fs");
      const files = readdirSync(resolve(ROOT, "tests")) as string[];
      const testFiles = files.filter((f: string) => f.endsWith(".test.ts"));
      expect(testFiles.length).toBeGreaterThan(0);
    });
  });

  describe("trivial assertion (proves Vitest runs)", () => {
    it("1 + 1 equals 2", () => {
      expect(1 + 1).toBe(2);
    });

    it("string concatenation works", () => {
      expect("404" + " " + "Museum").toBe("404 Museum");
    });
  });

  describe("all scripts run in sequence without prompts", () => {
    it("lint && typecheck complete in sequence", () => {
      expect(() => {
        execSync("npm run lint && npm run typecheck", {
          cwd: ROOT,
          stdio: "pipe",
          timeout: 60_000,
        });
      }).not.toThrow();
    });
  });
});
