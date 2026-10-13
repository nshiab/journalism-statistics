import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import performChiSquaredGoodnessOfFitTest from "../../src/statistics/performChiSquaredGoodnessOfFitTest.ts";
import { assertProbability, goodnessOfFitData } from "../helpers/distributionCharacterization.ts";

// Tested with
// https://www.graphpad.com/quickcalcs/chisquared2/
// and scipy (python)

// Test data for goodness of fit test - crime distribution
const crimeData = [
  { crime_type: "theft", observed_count: 120, expected_count: 100 },
  { crime_type: "assault", observed_count: 80, expected_count: 90 },
  { crime_type: "fraud", observed_count: 45, expected_count: 50 },
  { crime_type: "vandalism", observed_count: 55, expected_count: 60 },
];

// Test data for dice rolls
const diceData = [
  { face: "1", observed: 5, expected: 20 },
  { face: "2", observed: 25, expected: 20 },
  { face: "3", observed: 19, expected: 20 },
  { face: "4", observed: 30, expected: 20 },
  { face: "5", observed: 22, expected: 20 },
  { face: "6", observed: 19, expected: 20 },
];

test("should perform the chi-squared goodness of fit with crimeData", () => {
  const result = performChiSquaredGoodnessOfFitTest(
    crimeData,
    "crime_type",
    "observed_count",
    "expected_count",
  );
  expect(result).toStrictEqual({
    chiSquared: 6.027777777777778,
    degreesOfFreedom: 3,
    pValue: 0.11026656902387481,
    warnings: [],
  });
});
test("should perform the chi-squared goodness of fit with diceData", () => {
  const result = performChiSquaredGoodnessOfFitTest(diceData, "face", "observed", "expected");
  expect(result).toStrictEqual({
    chiSquared: 17.8,
    degreesOfFreedom: 5,
    pValue: 0.0032077920346052684,
    warnings: [],
  });
});

test("should perform chi-squared goodness of fit test correctly", () => {
  const result = performChiSquaredGoodnessOfFitTest(
    crimeData,
    "crime_type",
    "observed_count",
    "expected_count",
  );

  // Check basic structure
  expect(typeof result.chiSquared).toStrictEqual("number");
  expect(typeof result.degreesOfFreedom).toStrictEqual("number");
  expect(typeof result.pValue).toStrictEqual("number");
  expect(Array.isArray(result.warnings)).toStrictEqual(true);
  expect(result.degreesOfFreedom).toStrictEqual(3); // 4 categories - 1

  expect(Math.round(result.chiSquared * 100) / 100).toStrictEqual(6.03);

  // P-value should be reasonable
  expect(result.pValue >= 0 && result.pValue <= 1).toStrictEqual(true);
});

test("should handle dice roll goodness of fit test", () => {
  const result = performChiSquaredGoodnessOfFitTest(diceData, "face", "observed", "expected");

  expect(result.degreesOfFreedom).toStrictEqual(5); // 6 faces - 1

  expect(Math.round(result.chiSquared * 100) / 100).toStrictEqual(17.8);
});

test("should handle single category", () => {
  const singleData = [{ category: "A", observed: 45, expected: 45 }];

  const result = performChiSquaredGoodnessOfFitTest(singleData, "category", "observed", "expected");

  expect(result.degreesOfFreedom).toStrictEqual(0); // 1 category - 1

  // Chi-squared = (45-45)²/45 = 0/45 = 0
  expect(result.chiSquared).toStrictEqual(0);
});

test("should handle multiple entries for same category", () => {
  const duplicateData = [
    { category: "A", observed: 30, expected: 25 },
    { category: "A", observed: 20, expected: 25 }, // Same category, should be summed
    { category: "B", observed: 50, expected: 50 },
  ];

  const result = performChiSquaredGoodnessOfFitTest(
    duplicateData,
    "category",
    "observed",
    "expected",
  );

  // Verify the calculation was done correctly by checking chi-squared value
  // Expected: A: observed=50, expected=50, B: observed=50, expected=50
  // Chi-squared = (50-50)²/50 + (50-50)²/50 = 0 + 0 = 0
  expect(result.chiSquared).toStrictEqual(0);
  expect(result.degreesOfFreedom).toStrictEqual(1); // 2 categories - 1
});

test("should throw error for empty data", () => {
  const error = captureError(() => {
    performChiSquaredGoodnessOfFitTest([], "category", "observed", "expected");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Data must be a non-empty array");
});

test("should throw error for invalid observed values", () => {
  const invalidData = [
    { category: "A", observed: -5, expected: 10 },
    { category: "B", observed: 15, expected: 10 },
  ];

  const error = captureError(() => {
    performChiSquaredGoodnessOfFitTest(invalidData, "category", "observed", "expected");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Expected a non-negative finite number");
});

test("should throw error for zero expected frequency", () => {
  const zeroExpectedData = [
    { category: "A", observed: 10, expected: 0 },
    { category: "B", observed: 20, expected: 15 },
  ];

  const error = captureError(() => {
    performChiSquaredGoodnessOfFitTest(zeroExpectedData, "category", "observed", "expected");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Expected frequency must be greater than 0");
});

test("should throw error when observed and expected totals don't match", () => {
  const mismatchedTotalsData = [
    { category: "A", observed: 50, expected: 40 },
    { category: "B", observed: 30, expected: 25 },
  ];

  const error = captureError(() => {
    performChiSquaredGoodnessOfFitTest(mismatchedTotalsData, "category", "observed", "expected");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Total observed frequencies (80) must approximately equal total expected frequencies (65)",
  );
});

test("should handle string and number category values", () => {
  const mixedData = [
    { category: 1, observed: 25, expected: 25 },
    { category: "2", observed: 30, expected: 30 },
    { category: 3, observed: 15, expected: 15 },
  ];

  const result = performChiSquaredGoodnessOfFitTest(mixedData, "category", "observed", "expected");

  // Verify the test processed all 3 categories correctly
  expect(result.degreesOfFreedom).toStrictEqual(2); // 3 categories - 1

  // Calculate expected chi-squared
  // (25-25)²/25 + (30-30)²/30 + (15-15)²/15 = 0 + 0 + 0 = 0
  expect(result.chiSquared).toStrictEqual(0);
});

test("should generate warnings for low expected frequencies", () => {
  const lowExpectedData = [
    { category: "A", observed: 2, expected: 2 },
    { category: "B", observed: 3, expected: 3 },
  ];

  const result = performChiSquaredGoodnessOfFitTest(
    lowExpectedData,
    "category",
    "observed",
    "expected",
  );

  // Should have warnings for low expected frequencies
  expect(result.warnings.length > 0).toStrictEqual(true);

  // Check for specific warnings
  const hasLowFrequencyWarning = result.warnings.some(
    (warning) => warning.includes("80%") && warning.includes("≥ 5"),
  );
  expect(hasLowFrequencyWarning).toStrictEqual(true);

  // Check for df=1 specific warning
  const hasDfOneWarning = result.warnings.some((warning) =>
    warning.includes("1 degree of freedom"),
  );
  expect(hasDfOneWarning).toStrictEqual(true);
});

test("should generate warning for very small expected frequencies", () => {
  const verySmallData = [
    { category: "A", observed: 0.3, expected: 0.3 },
    { category: "B", observed: 2.0, expected: 2.0 },
  ];

  const result = performChiSquaredGoodnessOfFitTest(
    verySmallData,
    "category",
    "observed",
    "expected",
  );

  // Should have warnings
  expect(result.warnings.length > 0).toStrictEqual(true);

  // Check for very small frequency warning
  const hasVerySmallWarning = result.warnings.some(
    (warning) => warning.includes("very small") && warning.includes("< 0.5"),
  );
  expect(hasVerySmallWarning).toStrictEqual(true);

  // Check for frequencies below 1 warning
  const hasBelowOneWarning = result.warnings.some((warning) => warning.includes("less than 1"));
  expect(hasBelowOneWarning).toStrictEqual(true);
});

test("should not generate warnings for adequate expected frequencies", () => {
  const goodData = [
    { category: "A", observed: 25, expected: 20 },
    { category: "B", observed: 35, expected: 30 },
    { category: "C", observed: 40, expected: 50 },
  ];

  const result = performChiSquaredGoodnessOfFitTest(goodData, "category", "observed", "expected");

  // Should have no warnings
  expect(result.warnings.length).toStrictEqual(0);
});

// These characterization fixtures were recorded before removing jStat.
// Historical jStat values guard compatibility; SciPy 1.16.3 independently
// verifies central and upper-tail chi-square probabilities.
test("matches chi-square references across centers and tails", () => {
  const fixtures = [
    {
      degreesOfFreedom: 1,
      chiSquared: 0.001,
      scipyPValue: 0.9747728793699604,
      jstatPValue: 0.9747728793699613,
    },
    {
      degreesOfFreedom: 5,
      chiSquared: 17.8,
      scipyPValue: 0.0032077920346052793,
      jstatPValue: 0.0032077920346053057,
    },
    {
      degreesOfFreedom: 30,
      chiSquared: 50,
      scipyPValue: 0.012402060718900541,
      jstatPValue: 0.012402060718853303,
    },
    {
      degreesOfFreedom: 100,
      chiSquared: 100,
      scipyPValue: 0.48119168452795674,
      jstatPValue: 0.48119168455787675,
    },
    {
      degreesOfFreedom: 10,
      chiSquared: 1000,
      scipyPValue: 1.870290720915977e-208,
      jstatPValue: Number.MIN_VALUE,
    },
  ];

  for (const fixture of fixtures) {
    const result = performChiSquaredGoodnessOfFitTest(
      goodnessOfFitData(fixture.degreesOfFreedom, fixture.chiSquared),
      "category",
      "observed",
      "expected",
    );

    assertProbability(result.pValue, fixture.scipyPValue, {
      absolute: fixture.scipyPValue < 1e-100 ? 0 : 2e-14,
      relative: 3e-12,
    });

    // Number.MIN_VALUE was jStat's underflow fallback, so the independently
    // verified non-zero SciPy result is authoritative for that fixture.
    if (fixture.jstatPValue > Number.MIN_VALUE) {
      assertProbability(result.pValue, fixture.jstatPValue, {
        absolute: 6e-11,
        relative: 1e-8,
      });
    }
  }
});
