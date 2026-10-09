import { expect, test } from "vitest";
import captureError from "../helpers/captureError.ts";
import getCholeskyMatrix from "../../src/statistics/getCholeskyMatrix.ts";

test("getCholeskyMatrix: correctly decomposes a symmetric positive-definite matrix", () => {
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
      expect(Math.abs(L[i][j] - expectedL[i][j])).toBeLessThanOrEqual(1e-6);
    }
  }
});

test("getCholeskyMatrix: throws if matrix is not square", () => {
  const invalidMatrix = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  const error = captureError(() => getCholeskyMatrix(invalidMatrix));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("Matrix must be square.");
});

test("getCholeskyMatrix: throws if matrix is not positive-definite", () => {
  const nonPDMatrix = [
    [1, 2],
    [2, 1],
  ];
  const error = captureError(() => getCholeskyMatrix(nonPDMatrix));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Matrix is not positive-definite. Try increasing the jitter (current: 0).",
  );
});

test("getCholeskyMatrix: correctly handles jitter to force positive-definiteness", () => {
  // This matrix is NOT positive-definite
  const nonPDMatrix = [
    [1, 2],
    [2, 1],
  ];

  // With a large enough jitter, it should become positive-definite
  const jitter = 1.1; // j - 1 > 0 => 1.1 - 1 = 0.1 > 0
  const L = getCholeskyMatrix(nonPDMatrix, jitter);

  // Reconstruct matrix: L * L^T = Matrix + jitter*I
  const reconstructed = [
    [L[0][0] ** 2, L[0][0] * L[1][0]],
    [L[1][0] * L[0][0], L[1][0] ** 2 + L[1][1] ** 2],
  ];

  expect(Math.abs(reconstructed[0][0] - (1 + jitter))).toBeLessThanOrEqual(
    1e-6,
  );
  expect(Math.abs(reconstructed[0][1] - 2)).toBeLessThanOrEqual(1e-6);
  expect(Math.abs(reconstructed[1][0] - 2)).toBeLessThanOrEqual(1e-6);
  expect(Math.abs(reconstructed[1][1] - (1 + jitter))).toBeLessThanOrEqual(
    1e-6,
  );
});

test("getCholeskyMatrix: throws with custom jitter message if still not positive-definite", () => {
  const nonPDMatrix = [
    [1, 2],
    [2, 1],
  ];
  const jitter = 0.5;
  const error = captureError(() => getCholeskyMatrix(nonPDMatrix, jitter));
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain(
    "Matrix is not positive-definite. Try increasing the jitter (current: 0.5).",
  );
});

test("getCholeskyMatrix: works for 1x1 matrix", () => {
  const matrix = [[4]];
  const L = getCholeskyMatrix(matrix);
  expect(Math.abs(L[0][0] - 2)).toBeLessThanOrEqual(1e-6);
});

test("getCholeskyMatrix: works for 1x1 matrix with jitter", () => {
  const matrix = [[3]];
  const jitter = 1;
  const L = getCholeskyMatrix(matrix, jitter);
  expect(Math.abs(L[0][0] - 2)).toBeLessThanOrEqual(1e-6);
});

test("getCholeskyMatrix: works for zero matrix with jitter", () => {
  const matrix = [
    [0, 0],
    [0, 0],
  ];
  const jitter = 1e-9;
  const L = getCholeskyMatrix(matrix, jitter);
  expect(Math.abs(L[0][0] - Math.sqrt(jitter))).toBeLessThanOrEqual(1e-12);
  expect(Math.abs(L[1][1] - Math.sqrt(jitter))).toBeLessThanOrEqual(1e-12);
  expect(Math.abs(L[1][0] - 0)).toBeLessThanOrEqual(1e-12);
});
