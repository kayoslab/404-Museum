// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isValidSeed } from "../src/domain/seed";

const ROOT = resolve(__dirname, "..");

describe("US-005: Read and write seed from URL parameters", () => {
  describe("source modules exist", () => {
    it("src/domain/url-seed.ts exists and exports readSeedFromUrl and writeSeedToUrl", async () => {
      const mod = await import("../src/domain/url-seed");
      expect(typeof mod.readSeedFromUrl).toBe("function");
      expect(typeof mod.writeSeedToUrl).toBe("function");
    });

    it("src/domain/resolve-seed.ts exists and exports resolveSeed", async () => {
      const mod = await import("../src/domain/resolve-seed");
      expect(typeof mod.resolveSeed).toBe("function");
    });
  });

  describe("resolveSeed()", () => {
    let resolveSeed: (raw: string | null) => string;

    beforeEach(async () => {
      const mod = await import("../src/domain/resolve-seed");
      resolveSeed = mod.resolveSeed;
    });

    describe("returns the input unchanged when it is a valid seed", () => {
      it.each([
        "abc123",
        "my-seed",
        "test_seed",
        "A",
        "UPPER-lower_123",
        "a-b-c-d-e-f-g-h",
        "abcdefghijkl",
      ])("passes through valid seed: %s", (seed) => {
        expect(resolveSeed(seed)).toBe(seed);
      });
    });

    describe("generates a new valid seed when input is null", () => {
      it("returns a valid seed when input is null", () => {
        const result = resolveSeed(null);
        expect(result).toBeTruthy();
        expect(isValidSeed(result)).toBe(true);
      });

      it("generated seed is non-empty", () => {
        const result = resolveSeed(null);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe("generates a new valid seed when input is invalid", () => {
      it.each([
        ["empty string", ""],
        ["spaces", "has space"],
        ["special chars !@#$%", "no!way"],
        ["at sign", "user@host"],
        ["equals sign", "a=b"],
        ["unicode", "héllo"],
        ["tab character", "has\ttab"],
        ["newline", "has\nnewline"],
        ["forward slash", "path/to"],
        ["period", "file.ext"],
      ])("replaces invalid seed (%s): %s", (_label, invalidSeed) => {
        const result = resolveSeed(invalidSeed);
        expect(result).not.toBe(invalidSeed);
        expect(isValidSeed(result)).toBe(true);
      });
    });

    it("determinism: a valid seed always resolves to itself", () => {
      const seed = "stable-seed-42";
      for (let i = 0; i < 50; i++) {
        expect(resolveSeed(seed)).toBe(seed);
      }
    });
  });

  describe("readSeedFromUrl()", () => {
    let readSeedFromUrl: () => string | null;
    const originalLocation = window.location;

    beforeEach(async () => {
      const mod = await import("../src/domain/url-seed");
      readSeedFromUrl = mod.readSeedFromUrl;
    });

    afterEach(() => {
      // Restore original location
      vi.unstubAllGlobals();
    });

    it("returns the seed value when ?seed=abc123 is present", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?seed=abc123" });
      expect(readSeedFromUrl()).toBe("abc123");
    });

    it("returns the seed value when seed is among multiple params", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?foo=bar&seed=xyz789&baz=1" });
      expect(readSeedFromUrl()).toBe("xyz789");
    });

    it("returns null when seed param is missing", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?other=value" });
      expect(readSeedFromUrl()).toBeNull();
    });

    it("returns null when query string is empty", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "" });
      expect(readSeedFromUrl()).toBeNull();
    });

    it("returns empty string when ?seed= has no value", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?seed=" });
      const result = readSeedFromUrl();
      // Should return empty string or null — either way, resolveSeed handles it
      expect(result === "" || result === null).toBe(true);
    });

    it("the query parameter key is exactly 'seed' (not 'Seed', 'SEED', etc.)", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?Seed=abc&SEED=def" });
      expect(readSeedFromUrl()).toBeNull();
    });

    it("handles seed with valid special chars (hyphens, underscores)", () => {
      vi.stubGlobal("location", { ...originalLocation, search: "?seed=my-test_seed-01" });
      expect(readSeedFromUrl()).toBe("my-test_seed-01");
    });
  });

  describe("writeSeedToUrl()", () => {
    let writeSeedToUrl: (seed: string) => void;
    let replaceStateSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      const mod = await import("../src/domain/url-seed");
      writeSeedToUrl = mod.writeSeedToUrl;
      replaceStateSpy = vi.fn();
      vi.stubGlobal("history", { ...window.history, replaceState: replaceStateSpy });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("calls history.replaceState", () => {
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "" });
      writeSeedToUrl("abc123");
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    });

    it("sets ?seed=<value> in the URL", () => {
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "" });
      writeSeedToUrl("my-seed");
      const call = replaceStateSpy.mock.calls[0];
      const url = call[2] as string;
      expect(url).toContain("seed=my-seed");
    });

    it("preserves the existing pathname", () => {
      vi.stubGlobal("location", { ...window.location, pathname: "/some/path", search: "" });
      writeSeedToUrl("abc");
      const call = replaceStateSpy.mock.calls[0];
      const url = call[2] as string;
      expect(url).toContain("/some/path");
    });

    it("does not trigger a full page reload (uses replaceState, not assign)", () => {
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "" });
      const assignSpy = vi.fn();
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "", assign: assignSpy });
      writeSeedToUrl("no-reload");
      expect(assignSpy).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    it("preserves other existing query parameters", () => {
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "?debug=true" });
      writeSeedToUrl("keep-others");
      const call = replaceStateSpy.mock.calls[0];
      const url = call[2] as string;
      expect(url).toContain("debug=true");
      expect(url).toContain("seed=keep-others");
    });
  });

  describe("round-trip: write then read", () => {
    it("reading a written seed returns the same value", async () => {
      const mod = await import("../src/domain/url-seed");

      // Track what replaceState sets
      let capturedUrl = "";
      vi.stubGlobal("history", {
        ...window.history,
        replaceState: (_state: unknown, _title: string, url: string) => {
          capturedUrl = url;
        },
      });
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "" });

      const seed = "round-trip-test";
      mod.writeSeedToUrl(seed);

      // Now set location.search to match what was written
      const writtenSearch = capturedUrl.includes("?") ? capturedUrl.slice(capturedUrl.indexOf("?")) : "";
      vi.stubGlobal("location", { ...window.location, search: writtenSearch });

      expect(mod.readSeedFromUrl()).toBe(seed);
    });
  });

  describe("main.ts integration wiring", () => {
    it("main.ts imports from url-seed and resolve-seed modules", () => {
      const mainSrc = readFileSync(resolve(ROOT, "src/main.ts"), "utf-8");
      expect(mainSrc).toMatch(/url-seed/);
      expect(mainSrc).toMatch(/resolve-seed/);
    });

    it("main.ts calls readSeedFromUrl", () => {
      const mainSrc = readFileSync(resolve(ROOT, "src/main.ts"), "utf-8");
      expect(mainSrc).toMatch(/readSeedFromUrl/);
    });

    it("main.ts calls resolveSeed", () => {
      const mainSrc = readFileSync(resolve(ROOT, "src/main.ts"), "utf-8");
      expect(mainSrc).toMatch(/resolveSeed/);
    });

    it("main.ts calls writeSeedToUrl", () => {
      const mainSrc = readFileSync(resolve(ROOT, "src/main.ts"), "utf-8");
      expect(mainSrc).toMatch(/writeSeedToUrl/);
    });
  });

  describe("acceptance criteria verification", () => {
    it("AC: query parameter key is exactly 'seed'", async () => {
      const mod = await import("../src/domain/url-seed");
      vi.stubGlobal("location", { ...window.location, search: "?seed=test123" });
      expect(mod.readSeedFromUrl()).toBe("test123");
      vi.unstubAllGlobals();
    });

    it("AC: if seed param exists, the application uses that seed", async () => {
      const { resolveSeed } = await import("../src/domain/resolve-seed");
      const validSeed = "existing-seed";
      expect(resolveSeed(validSeed)).toBe(validSeed);
    });

    it("AC: if seed is missing, a valid seed is generated", async () => {
      const { resolveSeed } = await import("../src/domain/resolve-seed");
      const result = resolveSeed(null);
      expect(isValidSeed(result)).toBe(true);
    });

    it("AC: if an invalid seed is provided, it is replaced with a valid seed", async () => {
      const { resolveSeed } = await import("../src/domain/resolve-seed");
      const result = resolveSeed("!!!invalid!!!");
      expect(result).not.toBe("!!!invalid!!!");
      expect(isValidSeed(result)).toBe(true);
    });

    it("AC: generated seed is written to URL using history APIs (no full reload)", async () => {
      const mod = await import("../src/domain/url-seed");
      const spy = vi.fn();
      vi.stubGlobal("history", { ...window.history, replaceState: spy });
      vi.stubGlobal("location", { ...window.location, pathname: "/", search: "" });
      mod.writeSeedToUrl("test-seed");
      expect(spy).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it("AC: refreshing with same seed reproduces identical output (seed resolves to itself)", async () => {
      const { resolveSeed } = await import("../src/domain/resolve-seed");
      const seed = "reproducible-abc";
      // Simulating multiple "refreshes" — resolveSeed should always return the same seed
      const results = Array.from({ length: 10 }, () => resolveSeed(seed));
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe(seed);
    });
  });
});
