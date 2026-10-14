import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    // Numeric algorithms intentionally preallocate arrays by length.
    rules: { "unicorn/no-new-array": "off" },
  },
  fmt: {
    ignorePatterns: ["docs/**", "llm.md", "llms.txt", "test/data/**"],
  },
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
  },
});
