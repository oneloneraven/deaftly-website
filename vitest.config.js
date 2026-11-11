import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: { DEAFTLY_RELEASES_FIXTURE: "test/fixtures/releases.json", DEAFTLY_HELP_FIXTURE: "test/fixtures/help" },
    include: ["test/**/*.test.js"],
    passWithNoTests: true,
    coverage: { provider: "v8", reporter: ["text", "json-summary"] },
  },
});
