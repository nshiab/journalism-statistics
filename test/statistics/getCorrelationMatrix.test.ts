import { assertEquals } from "jsr:@std/assert";
import getCorrelationMatrix from "../../src/statistics/getCorrelationMatrix.ts";
import wineQuality from "../data/wine-quality.json" with { type: "json" };
import { arraysToData } from "@nshiab/journalism-format";

const data = arraysToData(wineQuality) as Record<string, number>[];

Deno.test("should return a 2x2 correlation matrix", () => {
  const twoVariables = data.map((d) => [d["fixed acidity"], d.alcohol]);
  const matrix = getCorrelationMatrix(twoVariables);
  assertEquals(matrix, [
    [1, -0.12088112319352692],
    [-0.12088112319352692, 1],
  ]);
});
Deno.test("should return a 2x2 inverted correlation matrix", () => {
  const twoVariables = data.map((d) => [d["fixed acidity"], d.alcohol]);
  const matrix = getCorrelationMatrix(twoVariables, { invert: true });
  assertEquals(matrix, [
    [1.0148289299155488, 0.12267366089747656],
    [0.12267366089747656, 1.0148289299155488],
  ]);
});
Deno.test("should return a 3x3 correlation matrix", () => {
  const threeVariables = data.map((d) => [
    d["fixed acidity"],
    d["residual sugar"],
    d.alcohol,
  ]);
  const matrix = getCorrelationMatrix(threeVariables);
  assertEquals(matrix, [
    [1, 0.08902070136220205, -0.12088112319352692],
    [0.08902070136220205, 1, -0.45063122203291867],
    [-0.12088112319352692, -0.45063122203291867, 1],
  ]);
});
Deno.test("should return a 4x4 correlation matrix", () => {
  const fourVariables = data.map((d) => [
    d["fixed acidity"],
    d["residual sugar"],
    d.density,
    d.alcohol,
  ]);
  const matrix = getCorrelationMatrix(fourVariables);
  assertEquals(matrix, [
    [
      1,
      0.08902070136220205,
      0.26533101359741595,
      -0.12088112319352692,
    ],
    [
      0.08902070136220205,
      1,
      0.8389664540583123,
      -0.45063122203291867,
    ],
    [
      0.26533101359741595,
      0.8389664540583123,
      1,
      -0.7801376206303495,
    ],
    [
      -0.12088112319352692,
      -0.45063122203291867,
      -0.7801376206303495,
      1,
    ],
  ]);
});
Deno.test("should return 0 for correlation with a constant variable", () => {
  const data = [
    [1, 10],
    [2, 10],
    [3, 10],
  ];
  const matrix = getCorrelationMatrix(data);
  assertEquals(matrix, [
    [1, 0],
    [0, 1],
  ]);
});
