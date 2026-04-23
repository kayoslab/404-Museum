import { test, expect } from "@playwright/test";
import type { ConsoleMessage } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helper: collect console errors during a test
// ---------------------------------------------------------------------------
function trackConsoleErrors(page: ReturnType<typeof test["info"]> extends never ? never : Parameters<Parameters<typeof test>[1]>[0]["page"]) {
  const errors: string[] = [];
  (page as { on(event: "console", listener: (msg: ConsoleMessage) => void): void }).on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ---------------------------------------------------------------------------
// (a) First load without seed
// ---------------------------------------------------------------------------
test.describe("US-017: Smoke tests", () => {
  test("first load without seed renders a generated site and assigns a seed param", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // The generated site container has content
    const generatedPage = page.locator(".generated-page");
    await expect(generatedPage).toBeVisible();

    // URL should now contain a seed param
    const url = new URL(page.url());
    expect(url.searchParams.has("seed")).toBe(true);
    expect(url.searchParams.get("seed")!.length).toBeGreaterThan(0);

    // No console errors
    expect(errors).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // (b) First load with seed
  // ---------------------------------------------------------------------------
  test("first load with seed renders deterministic content", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const fixedSeed = "test-abc123";
    await page.goto(`/?seed=${fixedSeed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // URL still contains the original seed
    const url = new URL(page.url());
    expect(url.searchParams.get("seed")).toBe(fixedSeed);

    // Page has visible content
    const logo = page.locator(".site-logo");
    await expect(logo).toBeVisible();
    const logoText = await logo.textContent();
    expect(logoText!.length).toBeGreaterThan(0);

    // Reload and verify determinism — same seed produces same logo text
    await page.goto(`/?seed=${fixedSeed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });
    const logoTextAgain = await page.locator(".site-logo").textContent();
    expect(logoTextAgain).toBe(logoText);

    // No console errors
    expect(errors).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // (c) Refresh button flow
  // ---------------------------------------------------------------------------
  test("refresh button generates a new seed and re-renders", async ({ page }) => {
    await page.goto("/?seed=refresh-test-seed");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // Capture initial state
    const initialUrl = new URL(page.url());
    const initialSeed = initialUrl.searchParams.get("seed");
    const initialLogo = await page.locator(".site-logo").textContent();

    // Click refresh button
    const refreshButton = page.locator(".refresh-button");
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Wait for re-render
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // Seed in URL should have changed
    const newUrl = new URL(page.url());
    const newSeed = newUrl.searchParams.get("seed");
    expect(newSeed).not.toBe(initialSeed);
    expect(newSeed!.length).toBeGreaterThan(0);

    // Content is still present
    const generatedPage = page.locator(".generated-page");
    await expect(generatedPage).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // (d) Share-link reproduction flow
  // ---------------------------------------------------------------------------
  test("share-link reproduction — same seed URL produces identical content", async ({ page }) => {
    const fixedSeed = "share-repro-seed-42";

    // First visit
    await page.goto(`/?seed=${fixedSeed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const headerText = await page.locator(".site-logo").textContent();
    const heroSection = page.locator(".site-hero");
    const heroText = await heroSection.textContent();

    expect(headerText!.length).toBeGreaterThan(0);

    // Navigate away
    await page.goto("about:blank");

    // Navigate back to the same seeded URL
    await page.goto(`/?seed=${fixedSeed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // Verify content matches exactly
    const headerTextAgain = await page.locator(".site-logo").textContent();
    const heroTextAgain = await page.locator(".site-hero").textContent();

    expect(headerTextAgain).toBe(headerText);
    expect(heroTextAgain).toBe(heroText);
  });
});
