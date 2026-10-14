[**Journalism Statistics v1.5.8**](../index.md)

***

[Journalism Statistics](../globals.md) / getCholeskyMatrix

# Function: getCholeskyMatrix()

> **getCholeskyMatrix**(`matrix`, `jitter?`): `number`[][]

Performs Cholesky Decomposition on a symmetric, positive-definite covariance matrix.

## Parameters

### matrix

`number`[][]

A square, symmetric, positive-definite covariance matrix.

### jitter?

`number` = `0`

A tiny positive value (e.g., 1e-9) added to the diagonal to force positive-definiteness.

## Returns

`number`[][]

A lower triangular matrix L.
