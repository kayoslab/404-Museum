import { test, expect } from "@playwright/test";
import type { ConsoleMessage } from "@playwright/test";

// ---------------------------------------------------------------------------
// US-018: E2E tests against the production preview server
//
// These tests validate that the static production build works correctly
// when served via `npm run preview` (Vite preview on port 4173).
// They verify seeded URLs, deterministic rendering, and all interactive
// controls work with the production bundle.
// ---------------------------------------------------------------------------

test.describe("US-018: Production build — seeded URL access", () => {
  // -------------------------------------------------------------------------
  // Direct seeded URL opens correctly in production
  // -------------------------------------------------------------------------
  test("opening a seeded URL directly renders the correct site", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const seed = "prod-deploy-test-1";
    await page.goto(`/?seed=${seed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    // Seed is preserved in the URL
    const url = new URL(page.url());
    expect(url.searchParams.get("seed")).toBe(seed);

    // Content is rendered
    const generatedPage = page.locator(".generated-page");
    await expect(generatedPage).toBeVisible();

    const logo = page.locator(".site-logo");
    await expect(logo).toBeVisible();
    const logoText = await logo.textContent();
    expect(logoText!.length).toBeGreaterThan(0);

    // No console errors in production
    expect(errors).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Seeded URL determinism in production build
  // -------------------------------------------------------------------------
  test("same seed produces identical output across reloads in production", async ({ page }) => {
    const seed = "prod-determinism-42";

    // First load
    await page.goto(`/?seed=${seed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });
    const logoFirst = await page.locator(".site-logo").textContent();
    const heroFirst = await page.locator(".site-hero").textContent();

    // Navigate away
    await page.goto("about:blank");

    // Second load with same seed
    await page.goto(`/?seed=${seed}`);
    await page.waitForSelector(".generated-page", { timeout: 10_000 });
    const logoSecond = await page.locator(".site-logo").textContent();
    const heroSecond = await page.locator(".site-hero").textContent();

    expect(logoSecond).toBe(logoFirst);
    expect(heroSecond).toBe(heroFirst);
  });

  // -------------------------------------------------------------------------
  // Fresh load without seed generates one and renders
  // -------------------------------------------------------------------------
  test("loading without a seed assigns one and renders content", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const url = new URL(page.url());
    expect(url.searchParams.has("seed")).toBe(true);
    expect(url.searchParams.get("seed")!.length).toBeGreaterThan(0);

    const generatedPage = page.locator(".generated-page");
    await expect(generatedPage).toBeVisible();

    expect(errors).toHaveLength(0);
  });
});

test.describe("US-018: Production build — interactive controls", () => {
  // -------------------------------------------------------------------------
  // Refresh button works in production
  // -------------------------------------------------------------------------
  test("refresh button generates new content in production build", async ({ page }) => {
    await page.goto("/?seed=prod-refresh-test");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const initialSeed = new URL(page.url()).searchParams.get("seed");

    const refreshButton = page.locator(".refresh-button");
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const newSeed = new URL(page.url()).searchParams.get("seed");
    expect(newSeed).not.toBe(initialSeed);
    expect(newSeed!.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Share button works in production
  // -------------------------------------------------------------------------
  test("share button is visible and clickable in production build", async ({ page }) => {
    await page.goto("/?seed=prod-share-test");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const shareButton = page.locator(".share-button");
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    // Share action should trigger a toast notification
    const toast = page.locator(".toast");
    await expect(toast).toBeVisible({ timeout: 5_000 });
  });

  // -------------------------------------------------------------------------
  // Info modal works in production
  // -------------------------------------------------------------------------
  test("info modal opens and closes in production build", async ({ page }) => {
    await page.goto("/?seed=prod-info-test");
    await page.waitForSelector(".generated-page", { timeout: 10_000 });

    const infoButton = page.locator(".info-button");
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    const modal = page.locator(".info-modal");
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Close modal
    const closeButton = modal.locator("button, .close-button, [aria-label='Close']");
    await closeButton.first().click();

    await expect(modal).not.toBeVisible({ timeout: 5_000 });
  });
});
