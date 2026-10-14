import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import generateGBMPath from "../../src/statistics/generateGbmPath.ts";

test("generateGBMPath should throw error for invalid input", () => {
  // startValue <= 0
  const error1 = captureError(() => generateGBMPath(0, 0.05, 0.2, 1, 12));
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain(
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );

  // sigma < 0
  const error2 = captureError(() => generateGBMPath(100, 0.05, -0.2, 1, 12));
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain(
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );

  // periodsPerYear <= 0
  const error3 = captureError(() => generateGBMPath(100, 0.05, 0.2, 1, 0));
  expect(error3).toBeInstanceOf(Error);
  expect((error3 as Error).message).toContain(
    "Invalid inputs: startValue and periodsPerYear must be > 0, sigma must be >= 0.",
  );
});

test("generateGBMPath should return an array of correct length", () => {
  const years = 2;
  const periodsPerYear = 12;
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = 2 * 12 = 24. Array should include startValue, so 25 elements.
  expect(path.length).toStrictEqual(25);
  expect(path[0]).toStrictEqual(100);
});

test("generateGBMPath should result in constant path if mu and sigma are 0", () => {
  const path = generateGBMPath(100, 0, 0, 1, 12);
  expect(path.every((v) => v === 100)).toStrictEqual(true);
});

test("generateGBMPath should stay positive even with high volatility", () => {
  // High volatility and negative drift to test positivity
  const path = generateGBMPath(100, -0.5, 2.0, 5, 12);
  expect(path.every((v) => v > 0)).toStrictEqual(true);
});

test("generateGBMPath should approximately follow drift when sigma is low", () => {
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
  expect(lastValue).toBeGreaterThan(expectedEnd - margin);
  expect(lastValue).toBeLessThan(expectedEnd + margin);
});
test("generateGBMPath should handle fractional years gracefully", () => {
  const years = 1.5; // 1.5 years
  const periodsPerYear = 12; // Monthly
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = Math.round(1.5 * 12) = 18. Array length should be 19.
  expect(path.length).toStrictEqual(19);
});

test("generateGBMPath should round fractional total steps", () => {
  const years = 1;
  const periodsPerYear = 252.5; // Awkward fractional period
  const path = generateGBMPath(100, 0.05, 0.2, years, periodsPerYear);

  // totalSteps = Math.round(252.5) = 253. Array length should be 254.
  expect(path.length).toStrictEqual(254);
});

test("generateGBMPath should generate non-deterministic paths", () => {
  const startValue = 100;
  const mu = 0.05;
  const sigma = 0.2;
  const years = 1;
  const periodsPerYear = 252;

  const path1 = generateGBMPath(startValue, mu, sigma, years, periodsPerYear);
  const path2 = generateGBMPath(startValue, mu, sigma, years, periodsPerYear);

  // The chances of two paths of length 253 being identical by random chance is
  // virtually zero. If they are equal, the RNG is broken.
  expect(path1).not.toStrictEqual(path2);

  // Also check that the final values are different
  expect(path1[path1.length - 1]).not.toStrictEqual(path2[path2.length - 1]);
});
