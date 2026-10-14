import { expect, test } from "vite-plus/test";
import getSampleSizeMean from "../../src/statistics/getSampleSizeMean.ts";

// Compared with https://select-statistics.co.uk/calculators/sample-size-calculator-population-mean/
// and scipy (python)

// List of 100 random student grades (0-100)
const grades = [
  { grade: 87 },
  { grade: 92 },
  { grade: 78 },
  { grade: 95 },
  { grade: 83 },
  { grade: 71 },
  { grade: 89 },
  { grade: 76 },
  { grade: 94 },
  { grade: 82 },
  { grade: 88 },
  { grade: 73 },
  { grade: 91 },
  { grade: 85 },
  { grade: 79 },
  { grade: 96 },
  { grade: 84 },
  { grade: 77 },
  { grade: 90 },
  { grade: 86 },
  { grade: 72 },
  { grade: 93 },
  { grade: 81 },
  { grade: 75 },
  { grade: 97 },
  { grade: 80 },
  { grade: 74 },
  { grade: 92 },
  { grade: 86 },
  { grade: 78 },
  { grade: 89 },
  { grade: 84 },
  { grade: 77 },
  { grade: 95 },
  { grade: 82 },
  { grade: 88 },
  { grade: 73 },
  { grade: 91 },
  { grade: 85 },
  { grade: 79 },
  { grade: 96 },
  { grade: 83 },
  { grade: 76 },
  { grade: 90 },
  { grade: 87 },
  { grade: 81 },
  { grade: 74 },
  { grade: 92 },
  { grade: 85 },
  { grade: 78 },
  { grade: 94 },
  { grade: 80 },
  { grade: 86 },
  { grade: 72 },
  { grade: 89 },
  { grade: 83 },
  { grade: 77 },
  { grade: 95 },
  { grade: 84 },
  { grade: 76 },
  { grade: 91 },
  { grade: 88 },
  { grade: 75 },
  { grade: 93 },
  { grade: 82 },
  { grade: 79 },
  { grade: 96 },
  { grade: 85 },
  { grade: 73 },
  { grade: 90 },
  { grade: 87 },
  { grade: 81 },
  { grade: 74 },
  { grade: 92 },
  { grade: 86 },
  { grade: 78 },
  { grade: 89 },
  { grade: 84 },
  { grade: 77 },
  { grade: 95 },
  { grade: 83 },
  { grade: 76 },
  { grade: 91 },
  { grade: 88 },
  { grade: 72 },
  { grade: 94 },
  { grade: 85 },
  { grade: 79 },
  { grade: 96 },
  { grade: 82 },
  { grade: 75 },
  { grade: 90 },
  { grade: 87 },
  { grade: 81 },
  { grade: 74 },
  { grade: 93 },
  { grade: 86 },
  { grade: 78 },
  { grade: 89 },
  { grade: 95 },
];

test("should calculate the sample size for a mean with 90% confidence and error of margin of 3", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 90, 3);
  expect(sampleSize).toStrictEqual(14);
});
test("should calculate the sample size for a mean with 95% confidence and error of margin of 3", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 95, 3);
  expect(sampleSize).toStrictEqual(19);
});
test("should calculate the sample size for a mean with 99% confidence and error of margin of 3", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 99, 3);
  expect(sampleSize).toStrictEqual(28);
});
test("should calculate the sample size for a mean with 90% confidence and error of margin of 2", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 90, 2);
  expect(sampleSize).toStrictEqual(27);
});
test("should calculate the sample size for a mean with 95% confidence and error of margin of 2", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 95, 2);
  expect(sampleSize).toStrictEqual(34);
});
test("should calculate the sample size for a mean with 99% confidence and error of margin of 2", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 99, 2);
  expect(sampleSize).toStrictEqual(47);
});

// Tests for the new populationSize option
test("should use data.length as population size when no populationSize option is provided (backward compatibility)", () => {
  const sampleSizeWithoutOption = getSampleSizeMean(grades, "grade", 95, 3);
  const sampleSizeWithOption = getSampleSizeMean(grades, "grade", 95, 3, {
    populationSize: grades.length,
  });
  expect(sampleSizeWithoutOption).toStrictEqual(sampleSizeWithOption);
});

test("should calculate different sample size when populationSize is larger than data.length", () => {
  // Using a smaller subset of data to estimate standard deviation
  const smallSample = grades.slice(0, 10);

  // Sample size when treating the 10 records as the full population
  const sampleSizeSmallPop = getSampleSizeMean(smallSample, "grade", 95, 3);

  // Sample size when the true population is 1000 students
  const sampleSizeLargePop = getSampleSizeMean(smallSample, "grade", 95, 3, {
    populationSize: 1000,
  });

  // With a larger population, we should need a larger sample size
  expect(sampleSizeSmallPop < sampleSizeLargePop).toStrictEqual(true);
});

test("should handle very large population sizes (approaching infinite population)", () => {
  const sampleSize = getSampleSizeMean(grades.slice(0, 20), "grade", 95, 3, {
    populationSize: 1000000,
  });
  // With a very large population, the finite population correction should have minimal effect
  // So the sample size should be close to what we'd get with infinite population formula
  expect(typeof sampleSize).toStrictEqual("number");
  expect(sampleSize > 0).toStrictEqual(true);
});

test("should work with populationSize equal to data.length", () => {
  const sampleSizeWithOption = getSampleSizeMean(grades, "grade", 95, 3, {
    populationSize: grades.length,
  });
  const sampleSizeWithoutOption = getSampleSizeMean(grades, "grade", 95, 3);
  expect(sampleSizeWithOption).toStrictEqual(sampleSizeWithoutOption);
});

// Tests for margin of error validation
test("should accept margin of error less than 1", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 95, 0.5);
  expect(typeof sampleSize).toStrictEqual("number");
  expect(sampleSize > 0).toStrictEqual(true);
});

test("should accept margin of error greater than 100", () => {
  const sampleSize = getSampleSizeMean(grades, "grade", 95, 2000);
  expect(typeof sampleSize).toStrictEqual("number");
  expect(sampleSize > 0).toStrictEqual(true);
});

test("should throw error for zero margin of error", () => {
  try {
    getSampleSizeMean(grades, "grade", 95, 0);
    expect(true, "Should have thrown an error").toStrictEqual(false);
  } catch (error) {
    expect((error as Error).message).toStrictEqual(
      "Invalid margin of error. Must be greater than 0.",
    );
  }
});

test("should throw error for negative margin of error", () => {
  try {
    getSampleSizeMean(grades, "grade", 95, -1);
    expect(true, "Should have thrown an error").toStrictEqual(false);
  } catch (error) {
    expect((error as Error).message).toStrictEqual(
      "Invalid margin of error. Must be greater than 0.",
    );
  }
});

// Tests for data length validation
test("should throw error for empty data array", () => {
  try {
    getSampleSizeMean([], "grade", 95, 3);
    expect(true, "Should have thrown an error").toStrictEqual(false);
  } catch (error) {
    expect((error as Error).message).toStrictEqual(
      "At least 2 data points are required to calculate sample standard deviation.",
    );
  }
});

test("should throw error for single data point", () => {
  try {
    getSampleSizeMean([{ grade: 85 }], "grade", 95, 3);
    expect(true, "Should have thrown an error").toStrictEqual(false);
  } catch (error) {
    expect((error as Error).message).toStrictEqual(
      "At least 2 data points are required to calculate sample standard deviation.",
    );
  }
});

test("should work with exactly 2 data points", () => {
  const twoPoints = [{ grade: 80 }, { grade: 90 }];
  const sampleSize = getSampleSizeMean(twoPoints, "grade", 95, 3);
  expect(typeof sampleSize).toStrictEqual("number");
  expect(sampleSize > 0).toStrictEqual(true);
});
