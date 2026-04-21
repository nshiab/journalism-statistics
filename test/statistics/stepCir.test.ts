import { assertAlmostEquals } from "jsr:@std/assert";
import stepCir from "../../src/statistics/stepCir.ts";

Deno.test("stepCir: bounds to minimum value to prevent negative rates", () => {
  // Force a massive negative shock
  const current = 0.02;
  const nextRate = stepCir(current, 0.2, 0.05, 0.02, 1 / 12, -1000);
  assertAlmostEquals(nextRate, 0.00001, 1e-6); // Should hit the floor boundary
});
