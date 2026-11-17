import { defineConfig } from "vitest/config";

export default defineConfig({
  // The tsconfig's paths, e.g. document-models/*, which tests import.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      include: [
        "document-models/**/src/reducers/**",
        "document-models/**/v*/modules/**",
        "editors/power-bd/kit/**",
      ],
      exclude: [
        "editors/power-bd/kit/**/*.test.ts",
        "editors/power-bd/kit/**/fixtures.ts",
      ],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});
