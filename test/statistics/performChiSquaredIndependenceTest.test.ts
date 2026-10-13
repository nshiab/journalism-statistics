import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import performChiSquaredIndependenceTest from "../../src/statistics/performChiSquaredIndependenceTest.ts";
import { assertProbability, independenceData } from "../helpers/distributionCharacterization.ts";

// Tested with
// https://www.socscistatistics.com/tests/chisquare2/default2.aspx
// and scipy (python)

// Test data for independence test - voting preference by age group
const votingData = [
  { age_group: "18-30", candidate: "A", count: 45 },
  { age_group: "18-30", candidate: "B", count: 55 },
  { age_group: "31-50", candidate: "A", count: 60 },
  { age_group: "31-50", candidate: "B", count: 40 },
  { age_group: "51+", candidate: "A", count: 70 },
  { age_group: "51+", candidate: "B", count: 30 },
];
const educationData = [
  { education: "high_school", income: "low", count: 150 },
  { education: "high_school", income: "medium", count: 100 },
  { education: "high_school", income: "high", count: 50 },
  { education: "college", income: "low", count: 80 },
  { education: "college", income: "medium", count: 120 },
  { education: "college", income: "high", count: 100 },
  { education: "graduate", income: "low", count: 30 },
  { education: "graduate", income: "medium", count: 70 },
  { education: "graduate", income: "high", count: 150 },
];

test("should perform chi-squared independence test for votingData", () => {
  const result = performChiSquaredIndependenceTest(votingData, "age_group", "candidate", "count");
  const { pValue, ...statistics } = result;
  expect(statistics).toStrictEqual({
    chiSquared: 13.028571428571428,
    degreesOfFreedom: 2,
    warnings: [],
  });
  // JavaScript runtimes can differ by one ULP for this tail probability.
  const expectedPValue = 0.0014821141744508063;
  expect(Math.abs(pValue - expectedPValue)).toBeLessThanOrEqual(Number.EPSILON * expectedPValue);
});
test("should perform chi-squared independence test for educationData", () => {
  const result = performChiSquaredIndependenceTest(educationData, "education", "income", "count");
  expect(result).toStrictEqual({
    chiSquared: 145.59976422045386,
    degreesOfFreedom: 4,
    pValue: 1.7843029125544165e-30,
    warnings: [],
  });
});
test("should perform chi-squared independence test correctly", () => {
  const result = performChiSquaredIndependenceTest(votingData, "age_group", "candidate", "count");

  // Check basic structure
  expect(typeof result.chiSquared).toStrictEqual("number");
  expect(typeof result.degreesOfFreedom).toStrictEqual("number");
  expect(typeof result.pValue).toStrictEqual("number");
  expect(result.degreesOfFreedom).toStrictEqual(2); // (3-1) * (2-1) = 2

  // Verify the chi-squared value (calculated manually)
  // Expected frequencies calculated from marginal totals
  // Row totals: [100, 100, 100], Col totals: [175, 125], Grand total: 300
  // Chi-squared = 13.029 (rounded to 3 decimal places)
  expect(Math.round(result.chiSquared * 1000) / 1000).toStrictEqual(13.029);

  // P-value should be reasonable for this test
  expect(result.pValue >= 0 && result.pValue <= 1).toStrictEqual(true);
  // For chi-squared = 13.03 with df = 2, p-value should be very small (< 0.05)
  expect(result.pValue < 0.05).toStrictEqual(true); // Significant at 5% level
});

test("should handle simple 2x2 contingency table", () => {
  const simpleData = [
    { gender: "male", preference: "yes", count: 20 },
    { gender: "male", preference: "no", count: 30 },
    { gender: "female", preference: "yes", count: 25 },
    { gender: "female", preference: "no", count: 25 },
  ];

  const result = performChiSquaredIndependenceTest(simpleData, "gender", "preference", "count");

  expect(result.degreesOfFreedom).toStrictEqual(1); // (2-1) * (2-1) = 1
  expect(result.pValue > 0 && result.pValue < 1).toStrictEqual(true);
});

test("should handle string and number category values", () => {
  const mixedData = [
    { category: 1, candidate: "A", count: 25 },
    { category: 1, candidate: "B", count: 35 },
    { category: "2", candidate: "A", count: 40 },
    { category: "2", candidate: "B", count: 30 },
  ];

  const result = performChiSquaredIndependenceTest(mixedData, "category", "candidate", "count");

  expect(result.degreesOfFreedom).toStrictEqual(1);
});

test("should throw error for empty data", () => {
  const error = captureError(() => {
    performChiSquaredIndependenceTest([], "category", "preference", "count");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Data must be a non-empty array");
});

test("should throw error for invalid count values", () => {
  const invalidData = [
    { category: "A", preference: "yes", count: -5 },
    { category: "B", preference: "no", count: 15 },
  ];

  const error = captureError(() => {
    performChiSquaredIndependenceTest(invalidData, "category", "preference", "count");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Expected a non-negative finite number");
});

test("should handle large contingency table", () => {
  const result = performChiSquaredIndependenceTest(educationData, "education", "income", "count");

  expect(result.degreesOfFreedom).toStrictEqual(4); // (3-1) * (3-1) = 4
});

test("should generate warnings for low expected frequencies", () => {
  // Test data with low expected frequencies
  const lowFrequencyData = [
    { group: "A", outcome: "X", count: 2 },
    { group: "A", outcome: "Y", count: 3 },
    { group: "B", outcome: "X", count: 1 },
    { group: "B", outcome: "Y", count: 4 },
  ];

  const result = performChiSquaredIndependenceTest(lowFrequencyData, "group", "outcome", "count");

  // Should have warnings about low frequencies
  expect(result.warnings.length > 0).toStrictEqual(true);

  // Should warn about frequencies below 5 for 2x2 table
  const hasBelow5Warning = result.warnings.some((warning) =>
    warning.includes("For 2x2 contingency tables, all expected frequencies should be ≥ 5"),
  );
  expect(hasBelow5Warning).toStrictEqual(true);
});

test("should not generate warnings for adequate expected frequencies", () => {
  // Test data with adequate expected frequencies
  const goodFrequencyData = [
    { group: "A", outcome: "X", count: 25 },
    { group: "A", outcome: "Y", count: 25 },
    { group: "B", outcome: "X", count: 25 },
    { group: "B", outcome: "Y", count: 25 },
  ];

  const result = performChiSquaredIndependenceTest(goodFrequencyData, "group", "outcome", "count");

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
      chiSquared: 0.01,
      scipyPValue: 0.920344325445942,
      jstatPValue: 0.9203443254459436,
    },
    {
      degreesOfFreedom: 5,
      chiSquared: 12,
      scipyPValue: 0.03478778050624185,
      jstatPValue: 0.03478778050624165,
    },
    {
      degreesOfFreedom: 30,
      chiSquared: 50,
      scipyPValue: 0.012402060718900541,
      jstatPValue: 0.012402060718853414,
    },
    {
      degreesOfFreedom: 10,
      chiSquared: 1000,
      scipyPValue: 1.870290720915977e-208,
      jstatPValue: Number.MIN_VALUE,
    },
  ];

  for (const fixture of fixtures) {
    const result = performChiSquaredIndependenceTest(
      independenceData(fixture.degreesOfFreedom, fixture.chiSquared),
      "row",
      "column",
      "count",
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
