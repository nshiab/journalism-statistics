import { assertEquals, assertGreater, assertThrows } from "jsr:@std/assert";
import getCirPath from "../../src/statistics/getCirPath.ts";

Deno.test("getCirPath should throw error for invalid parameters", () => {
  assertThrows(
    () => getCirPath(-0.05, 0.1, 0.05, 0.02, 1, 12),
    Error,
    "Start value must be non-negative.",
  );
  assertThrows(
    () => getCirPath(0.05, -0.1, 0.05, 0.02, 1, 12),
    Error,
    "Parameters a, b, and sigma must be non-negative.",
  );
  assertThrows(
    () => getCirPath(0.05, 0.1, 0.05, 0.02, 0, 12),
    Error,
    "Years and periods per year must be strictly positive.",
  );
});

Deno.test("getCirPath should return a path of the correct length with default periodsPerYear", () => {
  const years = 1;
  const path = getCirPath(0.05, 0.1, 0.05, 0.02, years);

  // Initial value (0.05) plus 1 year's worth of steps (12 defaults)
  assertEquals(path.length, 13);
});

Deno.test("getCirPath should return a path of the correct length", () => {
  const years = 1;
  const periodsPerYear = 12; // 1 month per step
  const path = getCirPath(0.05, 0.1, 0.05, 0.02, years, periodsPerYear);

  // Initial value (0.05) plus 1 year's worth of steps (12)
  assertEquals(path.length, 13);
});

Deno.test("getCirPath should start with the initial value", () => {
  const startValue = 0.03;
  const path = getCirPath(startValue, 0.1, 0.05, 0.02, 1, 12);

  assertEquals(path[0], startValue);
});

Deno.test("getCirPath should generate positive values despite high volatility", () => {
  const startValue = 0.01;
  const a = 0.1;
  const b = 0.05;
  const sigma = 5.0; // Extremely high volatility
  const path = getCirPath(startValue, a, b, sigma, 5, 52); // Weekly steps for 5 years

  for (const value of path) {
    // Math.max (currentRate, 0.00001) in the function ensures positivity
    assertGreater(value, 0);
  }
});

Deno.test("getCirPath with sigma = 0 should behave deterministically toward mean", () => {
  const startValue = 0.10; // High rate
  const b = 0.05; // Reverting to lower rate
  const a = 0.5; // High speed
  const path = getCirPath(startValue, a, b, 0, 1, 12);

  // If we start above the mean and sigma is 0, the next step should be lower than the previous
  for (let i = 1; i < path.length; i++) {
    // While still above the mean, we expect it to decrease
    if (path[i - 1] > b) {
      assertGreater(path[i - 1], path[i]);
    }
  }
});
