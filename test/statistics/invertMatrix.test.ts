import { expect, test } from "vite-plus/test";
import invertMatrix from "../../src/statistics/invertMatrix.ts";

test("should invert a 2x2 matrix", () => {
  const matrix2x2 = [
    [4, 7],
    [2, 6],
  ];
  const inverted2x2 = invertMatrix(matrix2x2);
  expect(inverted2x2).toStrictEqual([
    [0.6, -0.7],
    [-0.2, 0.4],
  ]);
});

test("should invert a 3x3 matrix", () => {
  const matrix3x3 = [
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ];
  const inverted3x3 = invertMatrix(matrix3x3);
  expect(inverted3x3).toStrictEqual([
    [-24.000000000000085, 18.000000000000064, 5.000000000000018],
    [20.00000000000007, -15.000000000000053, -4.000000000000014],
    [-5.000000000000018, 4.000000000000013, 1.0000000000000036],
  ]);
});

test("should throw an error for a singular matrix", () => {
  const singularMatrix = [
    [1, 2],
    [2, 4],
  ];
  let error: Error | null = null;
  try {
    invertMatrix(singularMatrix);
  } catch (e) {
    error = e as Error;
  }
  expect(error instanceof Error).toStrictEqual(true);
  expect(error?.message).toStrictEqual("Matrix is singular and cannot be inverted");
});
