import { assertEquals, assertThrows } from "jsr:@std/assert";
import calculateGbmParameters from "../../../src/statistics/helpers/getGbmParameters.ts";

Deno.test("calculateGbmParameters should throw error if less than three data points", () => {
  assertThrows(
    () => calculateGbmParameters([100], 252),
    Error,
    "Need at least three data points.",
  );
  assertThrows(
    () => calculateGbmParameters([100, 110], 252),
    Error,
    "Need at least three data points.",
  );
});

Deno.test("calculateGbmParameters should throw error if any value is non-positive", () => {
  assertThrows(
    () => calculateGbmParameters([100, 0, 105], 252),
    Error,
    "All values must be positive.",
  );
  assertThrows(
    () => calculateGbmParameters([100, -50, 105], 252),
    Error,
    "All values must be positive.",
  );
});

Deno.test("calculateGbmParameters should throw error if periodsPerYear is not positive", () => {
  assertThrows(
    () => calculateGbmParameters([100, 110, 121], 0),
    Error,
    "periodsPerYear must be positive.",
  );
  assertThrows(
    () => calculateGbmParameters([100, 110, 121], -1),
    Error,
    "periodsPerYear must be positive.",
  );
});

Deno.test("calculateGbmParameters should calculate mu and sigma correctly for a simple case", () => {
  const prices = [100, 110, 121];
  const periodsPerYear = 1;

  const { mu, sigma } = calculateGbmParameters(prices, periodsPerYear);

  assertEquals(mu.toFixed(5), Math.log(1.1).toFixed(5));
  assertEquals(sigma, 0);
});

Deno.test("calculateGbmParameters should match example values roughly", () => {
  const prices = [100, 102, 101, 105, 107, 110];
  const periodsPerYear = 252;

  const { mu, sigma } = calculateGbmParameters(prices, periodsPerYear);

  assertEquals(mu.toFixed(4), "4.8446");
  assertEquals(sigma.toFixed(4), "0.2864");
});
