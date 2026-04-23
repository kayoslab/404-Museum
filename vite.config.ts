import { defineConfig } from "vite";

export default defineConfig({
  test: {
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
