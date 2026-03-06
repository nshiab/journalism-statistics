import {
  assert,
  assertEquals,
  assertGreater,
  assertThrows,
} from "jsr:@std/assert";
import getCirParameters from "../../src/statistics/getCirParameters.ts";

Deno.test("getCirParameters should throw error if less than four data points", () => {
  assertThrows(
    () => getCirParameters([0.02, 0.03, 0.04], 12),
    Error,
    "Need at least four data points.",
  );
});

Deno.test("getCirParameters should throw error for non-positive periodsPerYear", () => {
  assertThrows(
    () => getCirParameters([0.02, 0.03, 0.04, 0.05], 0),
    Error,
    "periodsPerYear must be positive.",
  );
  assertThrows(
    () => getCirParameters([0.02, 0.03, 0.04, 0.05], -12),
    Error,
    "periodsPerYear must be positive.",
  );
});

Deno.test("getCirParameters should throw error for negative values", () => {
  assertThrows(
    () => getCirParameters([0.02, -0.03, 0.04, 0.05], 12),
    Error,
    "All values must be non-negative.",
  );
});

Deno.test("getCirParameters should throw error on degenerate data", () => {
  assertThrows(
    () => getCirParameters([0.05, 0.05, 0.05, 0.05], 12),
    Error,
    "Degenerate data: Cannot estimate parameters.",
  );
});

Deno.test("getCirParameters should handle mean reversion toward a target", () => {
  // A sequence that clearly moves toward 0.05 and stabilizes
  const rates = [0.02, 0.035, 0.043, 0.047, 0.049, 0.05, 0.05];
  const periodsPerYear = 12;

  const { a, b, sigma } = getCirParameters(rates, periodsPerYear);

  // a (reversion speed) should be positive
  assertGreater(a, 0);
  assert(Number.isFinite(a));

  // b (long-term mean) should be around the target
  assertGreater(b, 0.04);
  assert(Number.isFinite(b));
  assertGreater(0.06, b);

  // sigma should be calculated
  assertGreater(sigma, 0);
  assert(Number.isFinite(sigma));
});

Deno.test("getCirParameters with constant rates should have sigma close to 0", () => {
  const rates = [0.05, 0.05001, 0.04999, 0.05, 0.05, 0.05002];
  const periodsPerYear = 12;

  const { sigma } = getCirParameters(rates, periodsPerYear);

  assertGreater(0.001, sigma);
});
