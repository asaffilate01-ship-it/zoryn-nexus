import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: [
      "tests/provider-contracts/**/*.test.ts",
      "tests/provider-fixtures/**/*.test.ts",
      "tests/provider/**/*.test.ts",
      "tests/security/**/*.test.ts",
    ],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "src/features/providers/**/*.ts",
        "src/features/provider-runtime/**/*.ts",
        "src/features/swan/**/*.ts",
        "src/features/adyen/**/*.ts",
      ],
      exclude: [
        "**/*.server.ts",
        "**/*.d.ts",
        "**/types.ts",
        "**/index.ts",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        statements: 60,
        branches: 50,
      },
    },
  },
});
