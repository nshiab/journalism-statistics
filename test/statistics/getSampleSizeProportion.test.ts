import { expect, test } from "vitest";
import captureError from "../helpers/captureError.ts";
import getSampleSizeProportion from "../../src/statistics/getSampleSizeProportion.ts";

// Compared with https://www.surveymonkey.com/mp/sample-size-calculator/
// and scipy (python)

const populationSize = 1000;

test("Return the sample size for a proportion with 90% confidence and 5% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 90, 5);
  expect(sampleSize).toStrictEqual(214);
});
test("Return the sample size for a proportion with 95% confidence and 5% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 95, 5);
  expect(sampleSize).toStrictEqual(278);
});
test("Return the sample size for a proportion with 99% confidence and 5% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 99, 5);
  expect(sampleSize).toStrictEqual(400);
});
test("Return the sample size for a proportion with 90% confidence and 3% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 90, 3);
  expect(sampleSize).toStrictEqual(430);
});
test("Return the sample size for a proportion with 95% confidence and 3% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 95, 3);
  expect(sampleSize).toStrictEqual(517);
});
test("Return the sample size for a proportion with 99% confidence and 3% margin of error", () => {
  const sampleSize = getSampleSizeProportion(populationSize, 99, 3);
  expect(sampleSize).toStrictEqual(649);
});
test("Return the sample size for the doc example", () => {
  const sampleSize = getSampleSizeProportion(50000, 95, 4);
  expect(sampleSize).toStrictEqual(594);
});

test("Throw error for population size of 0", () => {
  const error = captureError(() => getSampleSizeProportion(0, 95, 5));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Population size must be greater than 0.",
  );
});

test("Throw error for negative population size", () => {
  const error = captureError(() => getSampleSizeProportion(-10, 95, 5));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Population size must be greater than 0.",
  );
});

test("Throw error for invalid confidence level", () => {
  const error = captureError(() => {
    // @ts-expect-error Exercise runtime validation of unsupported confidence levels.
    getSampleSizeProportion(1000, 85, 5);
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Invalid confidence level. Use 90, 95, or 99.",
  );
});

test("Throw error for invalid margin of error (too low)", () => {
  const error = captureError(() => getSampleSizeProportion(1000, 95, 0.5));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Invalid margin of error. Use a value between 1 and 100.",
  );
});

test("Throw error for invalid margin of error (too high)", () => {
  const error = captureError(() => getSampleSizeProportion(1000, 95, 101));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Invalid margin of error. Use a value between 1 and 100.",
  );
});
