/**
 * Performs Cholesky Decomposition on a symmetric, positive-definite covariance matrix.
 * @param matrix - A square, symmetric, positive-definite covariance matrix.
 * @returns A lower triangular matrix L.
 */
export default function getCholeskyMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  if (n === 0 || matrix.some((row) => row.length !== n)) {
    throw new Error("Matrix must be square.");
  }

  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      if (j === i) {
        for (let k = 0; k < j; k++) sum += L[j][k] ** 2;
        const val = matrix[j][j] - sum;
        if (val <= 0) throw new Error("Matrix is not positive-definite.");
        L[j][j] = Math.sqrt(val);
      } else {
        for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}
