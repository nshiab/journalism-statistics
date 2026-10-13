import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import config from "../typedoc.json" with { type: "json" };

// The llms.txt plugin does not use TypeDoc's hostedBaseUrl.
const index = readFileSync("site/llms.txt", "utf8").replaceAll(
  /\]\(([^)]+)\)/g,
  (_, target) => `](${new URL(target, config.hostedBaseUrl).href})`,
);
const fullReference = new URL("llm.md", config.hostedBaseUrl).href;

writeFileSync(
  "llms.txt",
  `${index.trimEnd()}\n\n## Optional\n\n- [llm.md — Complete Markdown reference](${fullReference}): All functions and examples in one file.\n`,
);
for (const file of ["llm.md", "llms.txt"]) copyFileSync(file, `site/${file}`);
