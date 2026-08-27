import { assert } from "jsr:@std/assert";

export type Tail = "two-tailed" | "left-tailed" | "right-tailed";

export function sampleWithTStatistic(
  degreesOfFreedom: number,
  tStatistic: number,
): Array<{ value: number }> {
  const sampleSize = degreesOfFreedom + 1;
  const deviation = Math.sqrt(degreesOfFreedom / 2);
  const mean = tStatistic / Math.sqrt(sampleSize);
  return [
    { value: mean - deviation },
    { value: mean + deviation },
    ...Array.from({ length: sampleSize - 2 }, () => ({ value: mean })),
  ];
}

export function assertProbability(
  actual: number,
  expected: number,
  { absolute = 2e-14, relative = 2e-12 } = {},
): void {
  const tolerance = Math.max(absolute, relative * Math.abs(expected));
  assert(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

export function goodnessOfFitData(
  degreesOfFreedom: number,
  chiSquared: number,
): Array<{ category: number; observed: number; expected: number }> {
  const categoryCount = degreesOfFreedom + 1;
  const expected = Math.max(1000, chiSquared);
  const deviation = Math.sqrt(chiSquared * expected / 2);
  return Array.from({ length: categoryCount }, (_, category) => ({
    category,
    observed: expected +
      (category === 0 ? deviation : category === 1 ? -deviation : 0),
    expected,
  }));
}

export function independenceData(
  degreesOfFreedom: number,
  chiSquared: number,
): Array<{ row: number; column: number; count: number }> {
  const columnCount = degreesOfFreedom + 1;
  const expected = Math.max(1000, chiSquared);
  const deviation = Math.sqrt(chiSquared * expected / 4);
  const data: Array<{ row: number; column: number; count: number }> = [];

  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < columnCount; column++) {
      const direction = column === 0
        ? (row === 0 ? 1 : -1)
        : column === 1
        ? (row === 0 ? -1 : 1)
        : 0;
      data.push({ row, column, count: expected + direction * deviation });
    }
  }
  return data;
}
