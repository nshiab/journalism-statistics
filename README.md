# The Journalism Library (statistics)

Useful TypeScript functions for statistical calculations in journalism projects.
Part of the [journalism library](https://github.com/nshiab/journalism).

The library is maintained by [Nael Shiab](https://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use this library and more, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript. You
> might also find
> [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) useful.

## Installation

Requires **Node.js 24.21.0 or later**. Use `import`
and set `"type": "module"` in your project's `package.json`.

```sh
npm install @nshiab/journalism-statistics
```

```ts
import { getSampleSizeProportion } from "@nshiab/journalism-statistics";

const sampleSize = getSampleSizeProportion(1000, 95, 5);
console.log(sampleSize); // 278
```

To start a data project with folders, configuration and documentation for AI
agents, run:

```sh
npx @nshiab/setup-data-project
```

## Documentation

- [Documentation](https://nshiab.github.io/journalism-statistics/)
- [llms.txt — Documentation index for AI agents](https://nshiab.github.io/journalism-statistics/llms.txt)
- [llm.md — Complete Markdown reference](https://nshiab.github.io/journalism-statistics/llm.md),
  for AI assistants or offline reading
- [npm package](https://www.npmjs.com/package/@nshiab/journalism-statistics)

See
[CONTRIBUTING.md](https://github.com/nshiab/journalism-statistics/blob/main/CONTRIBUTING.md)
for development commands.
