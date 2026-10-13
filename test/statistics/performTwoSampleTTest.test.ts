import { expect, test } from "vite-plus/test";
import captureError from "../helpers/captureError.ts";
import performTwoSampleTTest from "../../src/statistics/performTwoSampleTTest.ts";
import {
  assertProbability,
  type Tail,
} from "../helpers/distributionCharacterization.ts";

// Tested with
// https://www.graphpad.com/quickcalcs/ttest2/

test("performTwoSampleTTest - basic two-tailed test", () => {
  const group1 = [
    { id: 1, value: 10 },
    { id: 2, value: 12 },
    { id: 3, value: 14 },
    { id: 4, value: 16 },
    { id: 5, value: 18 },
  ];

  const group2 = [
    { id: 1, value: 20 },
    { id: 2, value: 22 },
    { id: 3, value: 24 },
    { id: 4, value: 26 },
    { id: 5, value: 28 },
  ];

  const result = performTwoSampleTTest(group1, group2, "value");

  expect(result).toStrictEqual({
    group1SampleSize: 5,
    group2SampleSize: 5,
    group1Mean: 14,
    group2Mean: 24,
    group1StdDev: 3.1622776601683795,
    group2StdDev: 3.1622776601683795,
    group1Variance: 10,
    group2Variance: 10,
    meanDifference: -10,
    degreesOfFreedom: 8,
    tStatistic: -5,
    pValue: 0.0010528257933665392,
  });
});

test("performTwoSampleTTest - right-tailed test", () => {
  const group1 = [
    { score: 85 },
    { score: 90 },
    { score: 95 },
    { score: 88 },
    { score: 92 },
  ];

  const group2 = [
    { score: 78 },
    { score: 82 },
    { score: 80 },
    { score: 85 },
    { score: 79 },
  ];

  const result = performTwoSampleTTest(group1, group2, "score", {
    tail: "right-tailed",
  });

  expect(result).toStrictEqual({
    group1SampleSize: 5,
    group2SampleSize: 5,
    group1Mean: 90,
    group2Mean: 80.8,
    group1StdDev: 3.8078865529319543,
    group2StdDev: 2.7748873851023212,
    group1Variance: 14.5,
    group2Variance: 7.699999999999999,
    meanDifference: 9.200000000000003,
    degreesOfFreedom: 7.313793871039548,
    tStatistic: 4.366126780461497,
    pValue: 0.0014817043823860264,
  });
});

test("performTwoSampleTTest - left-tailed test", () => {
  const group1 = [{ value: 15 }, { value: 18 }, { value: 20 }, { value: 17 }];

  const group2 = [
    { value: 25 },
    { value: 28 },
    { value: 30 },
    { value: 27 },
    { value: 26 },
  ];

  const result = performTwoSampleTTest(group1, group2, "value", {
    tail: "left-tailed",
  });

  expect(result).toStrictEqual({
    group1SampleSize: 4,
    group2SampleSize: 5,
    group1Mean: 17.5,
    group2Mean: 27.2,
    group1StdDev: 2.0816659994661326,
    group2StdDev: 1.9235384061671346,
    group1Variance: 4.333333333333333,
    group2Variance: 3.7,
    meanDifference: -9.7,
    degreesOfFreedom: 6.295249249586221,
    tStatistic: -7.183543044794596,
    pValue: 0.00014783740286633217,
  });
});

test("performTwoSampleTTest - Welch's test (unequal variances)", () => {
  const group1 = [
    { measure: 100 },
    { measure: 102 },
    { measure: 101 },
    { measure: 99 },
    { measure: 103 },
  ];

  const group2 = [
    { measure: 110 },
    { measure: 120 },
    { measure: 105 },
    { measure: 115 },
    { measure: 125 },
    { measure: 108 },
  ];

  const result = performTwoSampleTTest(group1, group2, "measure");

  expect(result).toStrictEqual({
    group1SampleSize: 5,
    group2SampleSize: 6,
    group1Mean: 101,
    group2Mean: 113.83333333333333,
    group1StdDev: 1.5811388300841898,
    group2StdDev: 7.626707459098367,
    group1Variance: 2.5,
    group2Variance: 58.166666666666664,
    meanDifference: -12.833333333333329,
    degreesOfFreedom: 5.510735970410618,
    tStatistic: -4.019367282483479,
    pValue: 0.008297784874449671,
  });
});

test("performTwoSampleTTest - similar groups (no significant difference)", () => {
  const group1 = [{ score: 5 }, { score: 7 }, { score: 6 }, { score: 8 }];

  const group2 = [{ score: 6 }, { score: 8 }, { score: 7 }, { score: 9 }];

  const result = performTwoSampleTTest(group1, group2, "score");

  expect(result.group1SampleSize).toStrictEqual(4);
  expect(result.group2SampleSize).toStrictEqual(4);

  // Small difference, should not be significant
  expect(result.pValue > 0.05).toStrictEqual(true);
});

test("performTwoSampleTTest - very similar values", () => {
  const group1 = [
    { val: 10.1 },
    { val: 10.2 },
    { val: 9.9 },
    { val: 10.0 },
    { val: 10.1 },
  ];

  const group2 = [
    { val: 10.0 },
    { val: 10.1 },
    { val: 9.9 },
    { val: 10.2 },
    { val: 10.0 },
  ];

  const result = performTwoSampleTTest(group1, group2, "val");

  // The values are very close, should not be significantly different
  expect(result.pValue > 0.1).toStrictEqual(true);
});

test("performTwoSampleTTest - zero variance edge cases", () => {
  // Test case 1: Both groups have identical values AND same mean
  const identicalGroup1 = [{ x: 10 }, { x: 10 }, { x: 10 }];

  const identicalGroup2 = [{ x: 10 }, { x: 10 }, { x: 10 }];

  const resultIdentical = performTwoSampleTTest(
    identicalGroup1,
    identicalGroup2,
    "x",
  );

  expect(resultIdentical.group1Variance).toStrictEqual(0);
  expect(resultIdentical.group2Variance).toStrictEqual(0);
  expect(resultIdentical.group1Mean).toStrictEqual(10);
  expect(resultIdentical.group2Mean).toStrictEqual(10);
  expect(resultIdentical.meanDifference).toStrictEqual(0);
  expect(resultIdentical.tStatistic).toStrictEqual(0);
  expect(resultIdentical.pValue).toStrictEqual(1);

  // Test case 2: Both groups have zero variance but different means
  const zeroVarGroup1 = [{ y: 5 }, { y: 5 }, { y: 5 }];

  const zeroVarGroup2 = [{ y: 8 }, { y: 8 }, { y: 8 }];

  const error = captureError(() => {
    performTwoSampleTTest(zeroVarGroup1, zeroVarGroup2, "y");
  });
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Cannot perform t-test: both groups have zero variance",
  );
});

test("performTwoSampleTTest - error handling", () => {
  // Test with insufficient data in group 1
  const error1 = captureError(() => {
    performTwoSampleTTest([{ x: 1 }], [{ x: 1 }, { x: 2 }], "x");
  });
  expect(error1).toBeInstanceOf(Error);
  expect((error1 as Error).message).toContain(
    "Group 1 must contain at least 2 observations",
  );

  // Test with insufficient data in group 2
  const error2 = captureError(() => {
    performTwoSampleTTest([{ x: 1 }, { x: 2 }], [{ x: 1 }], "x");
  });
  expect(error2).toBeInstanceOf(Error);
  expect((error2 as Error).message).toContain(
    "Group 2 must contain at least 2 observations",
  );

  // Test with invalid data in group 1
  const error3 = captureError(() => {
    performTwoSampleTTest(
      [{ x: 1 }, { x: "invalid" }],
      [{ x: 1 }, { x: 2 }],
      "x",
    );
  });
  expect(error3).toBeInstanceOf(Error);
  expect((error3 as Error).message).toContain("Invalid data in group1");

  // Test with invalid data in group 2
  const error4 = captureError(() => {
    performTwoSampleTTest([{ x: 1 }, { x: 2 }], [{ x: 1 }, { x: null }], "x");
  });
  expect(error4).toBeInstanceOf(Error);
  expect((error4 as Error).message).toContain("Invalid data in group2");

  // Test with invalid tail option
  const error5 = captureError(() => {
    performTwoSampleTTest([{ x: 1 }, { x: 2 }], [{ x: 3 }, { x: 4 }], "x", {
      // @ts-expect-error Exercise runtime validation of unsupported tail options.
      tail: "invalid",
    });
  });
  expect(error5).toBeInstanceOf(Error);
  expect((error5 as Error).message).toContain("Invalid tail option");
});

test("performTwoSampleTTest - single key for both groups", () => {
  const teachers = [
    { teacher_id: 1, salary: 45000 },
    { teacher_id: 2, salary: 48000 },
    { teacher_id: 3, salary: 46000 },
  ];

  const principals = [
    { principal_id: 1, salary: 65000 },
    { principal_id: 2, salary: 68000 },
    { principal_id: 3, salary: 67000 },
  ];

  const result = performTwoSampleTTest(teachers, principals, "salary");

  expect(result.group1Mean).toStrictEqual(46333.333333333336);
  expect(result.group2Mean).toStrictEqual(66666.66666666667);
  expect(result.meanDifference < 0).toStrictEqual(true);
  expect(result.pValue < 0.05).toStrictEqual(true); // Should be significant difference
});

test("performTwoSampleTTest - statistical properties", () => {
  const group1 = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];

  const group2 = [
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10 },
  ];

  const result = performTwoSampleTTest(group1, group2, "value");

  // Check that all statistical properties are computed
  expect(typeof result.group1Mean).toStrictEqual("number");
  expect(typeof result.group2Mean).toStrictEqual("number");
  expect(typeof result.group1StdDev).toStrictEqual("number");
  expect(typeof result.group2StdDev).toStrictEqual("number");
  expect(typeof result.group1Variance).toStrictEqual("number");
  expect(typeof result.group2Variance).toStrictEqual("number");
  expect(typeof result.degreesOfFreedom).toStrictEqual("number");
  expect(typeof result.tStatistic).toStrictEqual("number");
  expect(typeof result.pValue).toStrictEqual("number");

  // Standard deviations should be positive
  expect(result.group1StdDev > 0).toStrictEqual(true);
  expect(result.group2StdDev > 0).toStrictEqual(true);

  // P-value should be between 0 and 1
  expect(result.pValue >= 0).toStrictEqual(true);
  expect(result.pValue <= 1).toStrictEqual(true);

  // Degrees of freedom should be positive
  expect(result.degreesOfFreedom > 0).toStrictEqual(true);
});

// These characterization fixtures were recorded before removing jStat.
// Historical jStat values guard compatibility, while SciPy 1.16.3 supplies
// independent references for equal-variance-equivalent and Welch cases.
test("characterizes equal-variance and Welch cases", () => {
  const fixtures: Array<{
    group1: number[];
    group2: number[];
    tail: Tail;
    scipyPValue: number;
    jstatPValue: number;
  }> = [
    {
      // Equal sample variances: Welch and the pooled test both have df = 8.
      group1: [10, 12, 14, 16, 18],
      group2: [20, 22, 24, 26, 28],
      tail: "two-tailed",
      scipyPValue: 0.001052825793366539,
      jstatPValue: 0.0010528257934054874,
    },
    {
      // Unequal variances exercise fractional Welch-Satterthwaite df.
      group1: [100, 102, 101, 99, 103],
      group2: [110, 120, 105, 115, 125, 108],
      tail: "two-tailed",
      scipyPValue: 0.00829778487444965,
      jstatPValue: 0.008297784874405911,
    },
    {
      group1: [85, 90, 95, 88, 92],
      group2: [78, 82, 80, 85, 79],
      tail: "right-tailed",
      scipyPValue: 0.0014817043823860232,
      jstatPValue: 0.001481704382465976,
    },
    {
      group1: [15, 18, 20, 17],
      group2: [25, 28, 30, 27, 26],
      tail: "left-tailed",
      scipyPValue: 0.000147837402866332,
      jstatPValue: 0.00014783740286633591,
    },
  ];

  for (const fixture of fixtures) {
    const result = performTwoSampleTTest(
      fixture.group1.map((value) => ({ value })),
      fixture.group2.map((value) => ({ value })),
      "value",
      { tail: fixture.tail },
    );

    assertProbability(result.pValue, fixture.scipyPValue);
    assertProbability(result.pValue, fixture.jstatPValue, {
      absolute: 1e-12,
      relative: 1e-8,
    });
  }
});
