import { assertAlmostEquals, assertThrows } from "jsr:@std/assert";
import getCholeskyMatrix from "../../src/statistics/getCholeskyMatrix.ts";

Deno.test("getCholeskyMatrix: correctly decomposes a symmetric positive-definite matrix", () => {
  // A known positive-definite matrix
  const covarianceMatrix = [
    [4, 12, -16],
    [12, 37, -43],
    [-16, -43, 98],
  ];

  // The expected lower triangular matrix L
  const expectedL = [
    [2, 0, 0],
    [6, 1, 0],
    [-8, 5, 3],
  ];

  const L = getCholeskyMatrix(covarianceMatrix);

  for (let i = 0; i < L.length; i++) {
    for (let j = 0; j < L[i].length; j++) {
      assertAlmostEquals(L[i][j], expectedL[i][j], 1e-6);
    }
  }
});

Deno.test("getCholeskyMatrix: throws if matrix is not square", () => {
  const invalidMatrix = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  assertThrows(
    () => getCholeskyMatrix(invalidMatrix),
    Error,
    "Matrix must be square.",
  );
});

Deno.test("getCholeskyMatrix: throws if matrix is not positive-definite", () => {
  const nonPDMatrix = [
    [1, 2],
    [2, 1],
  ];
  assertThrows(
    () => getCholeskyMatrix(nonPDMatrix),
    Error,
    "Matrix is not positive-definite.",
  );
});
