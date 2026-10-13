import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import getGbmParameters from "../../src/statistics/getGbmParameters.ts";

test("getGbmParameters should throw error if less than three data points", () => {
  const error1 = captureError(() => getGbmParameters([100], 252));
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain(
    "Need at least three data points.",
  );
  const error2 = captureError(() => getGbmParameters([100, 110], 252));
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain(
    "Need at least three data points.",
  );
});

test("getGbmParameters should throw error if any value is non-positive", () => {
  const error1 = captureError(() => getGbmParameters([100, 0, 105], 252));
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain("All values must be positive.");
  const error2 = captureError(() => getGbmParameters([100, -50, 105], 252));
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain("All values must be positive.");
});

test("getGbmParameters should throw error if periodsPerYear is not positive", () => {
  const error1 = captureError(() => getGbmParameters([100, 110, 121], 0));
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain(
    "periodsPerYear must be positive.",
  );
  const error2 = captureError(() => getGbmParameters([100, 110, 121], -1));
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain(
    "periodsPerYear must be positive.",
  );
});

test("getGbmParameters should calculate mu and sigma correctly for a simple case", () => {
  const prices = [100, 110, 121];
  const periodsPerYear = 1;

  const { mu, sigma } = getGbmParameters(prices, periodsPerYear);

  expect(mu.toFixed(5)).toStrictEqual(Math.log(1.1).toFixed(5));
  expect(sigma).toStrictEqual(0);
});

test("getGbmParameters should match example values roughly", () => {
  const prices = [100, 102, 101, 105, 107, 110];
  const periodsPerYear = 252;

  const { mu, sigma } = getGbmParameters(prices, periodsPerYear);

  expect(mu.toFixed(4)).toStrictEqual("4.8446");
  expect(sigma.toFixed(4)).toStrictEqual("0.2864");
});
