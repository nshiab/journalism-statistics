import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import getCirParameters from "../../src/statistics/getCirParameters.ts";

test("getCirParameters should throw error if less than four data points", () => {
  const error = captureError(() => getCirParameters([0.02, 0.03, 0.04], 12));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Need at least four data points.");
});

test("getCirParameters should throw error for non-positive periodsPerYear", () => {
  const error1 = captureError(() => getCirParameters([0.02, 0.03, 0.04, 0.05], 0));
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain("periodsPerYear must be positive.");
  const error2 = captureError(() => getCirParameters([0.02, 0.03, 0.04, 0.05], -12));
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain("periodsPerYear must be positive.");
});

test("getCirParameters should throw error for negative values", () => {
  const error = captureError(() => getCirParameters([0.02, -0.03, 0.04, 0.05], 12));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("All values must be non-negative.");
});

test("getCirParameters should throw error on degenerate data", () => {
  const error = captureError(() => getCirParameters([0.05, 0.05, 0.05, 0.05], 12));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Degenerate data: Cannot estimate parameters.");
});

test("getCirParameters should handle mean reversion toward a target", () => {
  // A sequence that clearly moves toward 0.05 and stabilizes
  const rates = [0.02, 0.035, 0.043, 0.047, 0.049, 0.05, 0.05];
  const periodsPerYear = 12;

  const { a, b, sigma } = getCirParameters(rates, periodsPerYear);

  // a (reversion speed) should be positive
  expect(a).toBeGreaterThan(0);
  expect(Number.isFinite(a)).toBeTruthy();

  // b (long-term mean) should be around the target
  expect(b).toBeGreaterThan(0.04);
  expect(Number.isFinite(b)).toBeTruthy();
  expect(0.06).toBeGreaterThan(b);

  // sigma should be calculated
  expect(sigma).toBeGreaterThan(0);
  expect(Number.isFinite(sigma)).toBeTruthy();
});

test("getCirParameters with constant rates should have sigma close to 0", () => {
  const rates = [0.05, 0.05001, 0.04999, 0.05, 0.05, 0.05002];
  const periodsPerYear = 12;

  const { sigma } = getCirParameters(rates, periodsPerYear);

  expect(0.001).toBeGreaterThan(sigma);
});
