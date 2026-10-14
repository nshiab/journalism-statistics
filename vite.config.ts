import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      // Numeric algorithms intentionally preallocate arrays by length.
      "unicorn/no-new-array": "off",
    },
  },
  fmt: {
    ignorePatterns: ["docs/**", "llm.md", "llms.txt", "test/data/**"],
  },
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
  },
});
