import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import pkg from "../package.json" with { type: "json" };
import config from "../typedoc.json" with { type: "json" };

// The llms.txt plugin does not use TypeDoc's hostedBaseUrl.
const index = readFileSync("site/llms.txt", "utf8")
  .replace(/^# .+$/m, `# ${config.name} v${pkg.version}`)
  .replaceAll(/\]\(([^)]+)\)/g, (_, target) => `](${new URL(target, config.hostedBaseUrl).href})`);

writeFileSync("llms.txt", index);
for (const file of ["llm.md", "llms.txt"]) copyFileSync(file, `site/${file}`);
