[**Journalism Statistics v1.5.10**](../index.md)

***

[Journalism Statistics](../globals.md) / getCorrelatedShocks

# Function: getCorrelatedShocks()

> **getCorrelatedShocks**(`L`, `Z`): `number`[]

Multiplies a lower triangular Cholesky matrix (L) by a vector of independent standard normal random variables (Z).

## Parameters

### L

`number`[][]

The lower triangular matrix.

### Z

`number`[]

An array of independent standard normal random variables.

## Returns

`number`[]

An array of correlated random variables.
