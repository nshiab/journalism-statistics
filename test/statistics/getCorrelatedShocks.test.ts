import { assertEquals } from "jsr:@std/assert";
import getCorrelatedShocks from "../../src/statistics/getCorrelatedShocks.ts";

Deno.test("getCorrelatedShocks: correctly multiplies lower triangular matrix by Z vector", () => {
  const L = [
    [2.0, 0.0],
    [0.5, 1.5],
  ];
  const Z = [1.0, -1.0];

  // X[0] = 2.0 * 1.0 + 0.0 * -1.0 = 2.0
  // X[1] = 0.5 * 1.0 + 1.5 * -1.0 = -1.0
  const expectedX = [2.0, -1.0];

  const X = getCorrelatedShocks(L, Z);
  assertEquals(X, expectedX);
});
