import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  lint: {
    ignorePatterns: ["dist/**", "site/**"],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "no-unused-vars": "error",
      "typescript/no-explicit-any": "error",
      "unicorn/no-new-array": "off",
      "typescript/restrict-template-expressions": "off",
    },
  },
  fmt: {
    printWidth: 80,
    sortPackageJson: false,
    ignorePatterns: ["llm.md", "llms.txt", "test/data/**", "package-lock.json"],
  },
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "node",
    target: "node24",
    dts: true,
    sourcemap: true,
  },
});
