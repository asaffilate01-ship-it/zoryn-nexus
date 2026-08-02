import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "e2e/**", "node_modules/**", "dist/**", ".output/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      exclude: [
        "src/routeTree.gen.ts",
        "src/integrations/supabase/types.ts",
        "tests/**",
        "e2e/**",
        "**/*.d.ts",
      ],
    },
  },
});
