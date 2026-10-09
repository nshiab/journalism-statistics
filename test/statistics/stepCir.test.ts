import { expect, test } from "vitest";
import stepCir from "../../src/statistics/stepCir.ts";

test("stepCir: bounds to minimum value to prevent negative rates", () => {
  // Force a massive negative shock
  const current = 0.02;
  const nextRate = stepCir(current, 0.2, 0.05, 0.02, 1 / 12, -1000);
  expect(Math.abs(nextRate - 0.00001)).toBeLessThanOrEqual(1e-6); // Should hit the floor boundary
});
