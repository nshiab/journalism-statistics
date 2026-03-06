import {
  assertEquals,
  assertGreater,
  assertLess,
  assertNotEquals,
  assertThrows,
} from "jsr:@std/assert";
import generateGBMPath from "../../src/statistics/generateGbmPath.ts";

Deno.test("generateGBMPath should throw error for invalid input", () => {
  // startValue <= 0
  assertThrows(
    () => generateGBMPath(0, 0.05, 0.2, 1, 12),
    Error,
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );

  // sigma < 0
  assertThrows(
    () => generateGBMPath(100, 0.05, -0.2, 1, 12),
    Error,
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );

  // periodsPerYear <= 0
  assertThrows(
    () => generateGBMPath(100, 0.05, 0.2, 1, 0),
    Error,
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );
});

Deno.test("generateGBMPath should return an array of correct length", () => {
  const years = 2;
  const periodsPerYear = 12;
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = 2 * 12 = 24. Array should include startValue, so 25 elements.
  assertEquals(path.length, 25);
  assertEquals(path[0], 100);
});

Deno.test("generateGBMPath should result in constant path if mu and sigma are 0", () => {
  const path = generateGBMPath(100, 0, 0, 1, 12);
  assertEquals(path.every((v) => v === 100), true);
});

Deno.test("generateGBMPath should stay positive even with high volatility", () => {
  // High volatility and negative drift to test positivity
  const path = generateGBMPath(100, -0.5, 2.0, 5, 12);
  assertEquals(path.every((v) => v > 0), true);
});

Deno.test("generateGBMPath should approximately follow drift when sigma is low", () => {
  const startValue = 100;
  const mu = 0.1;
  const sigma = 0.0001; // Very low volatility
  const years = 1;
  const periodsPerYear = 12;

  const path = generateGBMPath(startValue, mu, sigma, years, periodsPerYear);
  const lastValue = path[path.length - 1];

  // Expected value E[S_t] = S_0 * exp(mu * t)
  // For small sigma, the simulated value should be close to the drift
  const expectedEnd = startValue * Math.exp(mu * years);

  // Allowing a tiny margin for the small sigma
  const margin = 0.1;
  assertGreater(lastValue, expectedEnd - margin);
  assertLess(lastValue, expectedEnd + margin);
});
Deno.test("generateGBMPath should handle fractional years gracefully", () => {
  const years = 1.5; // 1.5 years
  const periodsPerYear = 12; // Monthly
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = Math.round(1.5 * 12) = 18. Array length should be 19.
  assertEquals(path.length, 19);
});

Deno.test("generateGBMPath should round fractional total steps", () => {
  const years = 1;
  const periodsPerYear = 252.5; // Awkward fractional period
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = Math.round(252.5) = 253. Array length should be 254.
  assertEquals(path.length, 254);
});

Deno.test("generateGBMPath should generate non-deterministic paths", () => {
  const startValue = 100;
  const mu = 0.05;
  const sigma = 0.2;
  const years = 1;
  const periodsPerYear = 252;

  const path1 = generateGBMPath(startValue, mu, sigma, years, periodsPerYear);
  const path2 = generateGBMPath(startValue, mu, sigma, years, periodsPerYear);

  // The chances of two paths of length 253 being identical by random chance is
  // virtually zero. If they are equal, the RNG is broken.
  assertNotEquals(path1, path2);

  // Also check that the final values are different
  assertNotEquals(path1[path1.length - 1], path2[path2.length - 1]);
});
