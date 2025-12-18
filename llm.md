# The Journalism library

To install the library with Deno, use:

```bash
deno add jsr:@nshiab/journalism-statistics
```

To install the library with Node.js, use:

```bash
npx jsr add @nshiab/journalism-statistics
```

To import a function, use:

```ts
import { functionName } from "@nshiab/journalism-statistics";
```

## addClusters

Groups data points into clusters using the DBSCAN (Density-Based Spatial
Clustering of Applications with Noise) algorithm. This method is particularly
effective at identifying clusters of arbitrary shapes and handling noise in the
data.

The function operates based on two key parameters: `minDistance` (also known as
epsilon or ε) and `minNeighbours`. It classifies each data point into one of
three categories:

- **Core point**: A point that has at least `minNeighbours` other points
  (including itself) within a `minDistance` radius. These points are the
  foundation of a cluster.
- **Border point**: A point that is within the `minDistance` of a core point but
  does not have enough neighbors to be a core point itself. Border points are on
  the edge of a cluster.
- **Noise point**: A point that is neither a core point nor a border point.
  These are outliers that do not belong to any cluster.

The function modifies the input `data` array by adding two properties to each
point:

- `clusterId`: A unique identifier for the cluster the point belongs to (e.g.,
  'cluster1'). For noise points, this will be `null`.
- `clusterType`: The classification of the point, which can be 'core', 'border',
  or 'noise'.

### Signature

```typescript
function addClusters<T extends Record<string, unknown>>(
  data: T[],
  minDistance: number,
  minNeighbours: number,
  distance: (a: T, b: T) => number,
  options?: { reset?: boolean },
): asserts data is (T & {
  clusterId: string | null;
  clusterType: "core" | "border" | "noise";
})[];
```

### Parameters

- **`data`**: An array of data points. Each point is an object with any number
  of properties.
- **`minDistance`**: The maximum distance between two points for them to be
  considered neighbors. This is a crucial parameter that defines the density of
  the clusters.
- **`minNeighbours`**: The minimum number of points required to form a dense
  region (a core point). A larger value will result in more points being
  classified as noise.
- **`distance`**: A function that takes two points as input and returns the
  distance between them. This allows for flexible distance metrics (e.g.,
  Euclidean, Manhattan).
- **`options`**: Optional settings for the clustering process.
- **`options.reset`**: If `true`, the `clusterId` and `clusterType` properties
  of all points will be cleared before the clustering process begins. This is
  useful for re-running the clustering with different parameters.

### Examples

```ts
// Basic usage with Euclidean distance
const data = [
  { id: "a", x: 1, y: 2 },
  { id: "b", x: 2, y: 3 },
  { id: "c", x: 10, y: 10 },
  { id: "d", x: 11, y: 11 },
  { id: "e", x: 50, y: 50 },
];

// Use the journalism library's euclideanDistance function to calculate the distance
const distance = (a, b) => euclideanDistance(a.x, a.y, b.x, b.y);

addClusters(data, 5, 2, distance);

console.log(data);
// Expected output:
// [
//   { id: 'a', x: 1, y: 2, clusterId: 'cluster1', clusterType: 'core' },
//   { id: 'b', x: 2, y: 3, clusterId: 'cluster1', clusterType: 'core' },
//   { id: 'c', x: 10, y: 10, clusterId: 'cluster2', clusterType: 'core' },
//   { id: 'd', x: 11, y: 11, clusterId: 'cluster2', clusterType: 'core' },
//   { id: 'e', x: 50, y: 50, clusterId: null, clusterType: 'noise' }
// ]
```

```ts
// Re-running clustering with different parameters
addClusters(data, 10, 2, distance, { reset: true });

console.log(data);
// Expected output with a larger minDistance:
// [
//   { id: 'a', x: 1, y: 2, clusterId: 'cluster1', clusterType: 'core' },
//   { id: 'b', x: 2, y: 3, clusterId: 'cluster1', clusterType: 'border' },
//   { id: 'c', x: 10, y: 10, clusterId: 'cluster1', clusterType: 'core' },
//   { id: 'd', x: 11, y: 11, clusterId: 'cluster1', clusterType: 'border' },
//   { id: 'e', x: 50, y: 50, clusterId: null, clusterType: 'noise' }
// ]
```

## addMahalanobisDistance

Calculates the Mahalanobis distance for each object in an array relative to a
specified origin point.

The function enriches the input `data` array by adding a `mahaDist` property to
each object, representing its Mahalanobis distance from the `origin`. The
dimensions for the calculation are determined by the keys in the `origin`
object.

Optionally, you can also compute a `similarity` score, which is a normalized
value between 0 and 1, where 1 indicates that the point is identical to the
origin. To improve performance on large datasets, you can provide a pre-computed
inverted covariance matrix.

### Signature

```typescript
function addMahalanobisDistance<T extends Record<string, unknown>>(
  origin: Record<string, number>,
  data: T[],
  options: { similarity: true; matrix?: number[][] },
): (T & { mahaDist: number; similarity: number })[];
```

### Parameters

- **`origin`**: - An object defining the reference point for the distance
  calculation. The keys of this object represent the variables (dimensions) to
  be used, and the values are their corresponding coordinates.
- **`data`**: - An array of objects to be analyzed. Each object should contain
  the same keys as the `origin` object, and their values for these keys should
  be numbers.
- **`options`**: - Optional parameters to customize the function's behavior.
- **`options.similarity`**: - If `true`, a `similarity` property will be added
  to each object in the `data` array. The similarity is calculated as
  `1 - (mahaDist / maxMahaDist)`, providing an intuitive measure of closeness to
  the origin.
- **`options.matrix`**: - A pre-computed inverted covariance matrix. Providing
  this can significantly speed up calculations, as it avoids re-computing the
  matrix for each call. This matrix should be obtained from
  `getCovarianceMatrix` with `invert: true`.

### Returns

The input `data` array, with `mahaDist` (and optionally `similarity`) properties
added to each object.

### Throws

- **`Error`**: If the dimensions of the data points or the provided matrix do
  not match, or if `getCovarianceMatrix` throws an error (e.g., due to
  non-numeric data).

### Examples

```ts
// Basic usage with a dataset of wines
const wines = [
  { "fixed acidity": 6.5, "alcohol": 11.0 },
  { "fixed acidity": 7.1, "alcohol": 12.2 },
  { "fixed acidity": 6.3, "alcohol": 10.5 },
  { "fixed acidity": 7.2, "alcohol": 11.3 },
];

// Define the ideal wine profile (our origin)
const idealWine = { "fixed acidity": 7.2, "alcohol": 11.3 };

// Calculate the Mahalanobis distance for each wine
addMahalanobisDistance(idealWine, wines);

// Sort the wines by their distance to the ideal profile
wines.sort((a, b) => a.mahaDist - b.mahaDist);

console.log(wines);
// Expected output:
// [
//   { 'fixed acidity': 7.2, 'alcohol': 11.3, mahaDist: 0 },
//   { 'fixed acidity': 7.1, 'alcohol': 12.2, mahaDist: 0.939 },
//   { 'fixed acidity': 6.5, 'alcohol': 11.0, mahaDist: 1.263 },
//   { 'fixed acidity': 6.3, 'alcohol': 10.5, mahaDist: 2.079 }
// ]
```

```ts
// Usage with the similarity option
addMahalanobisDistance(idealWine, wines, { similarity: true });

console.log(wines);
// Expected output with similarity scores:
// [
//   { 'fixed acidity': 7.2, 'alcohol': 11.3, mahaDist: 0, similarity: 1 },
//   { 'fixed acidity': 7.1, 'alcohol': 12.2, mahaDist: 0.939, similarity: 0.548 },
//   { 'fixed acidity': 6.5, 'alcohol': 11.0, mahaDist: 1.263, similarity: 0.392 },
//   { 'fixed acidity': 6.3, 'alcohol': 10.5, mahaDist: 2.079, similarity: 0 }
// ]
```

## addMahalanobisDistance

Calculates the Mahalanobis distance for each object in an array relative to a
specified origin point (without similarity scores).

### Signature

```typescript
function addMahalanobisDistance<T extends Record<string, unknown>>(
  origin: Record<string, number>,
  data: T[],
  options?: { similarity?: false; matrix?: number[][] },
): (T & { mahaDist: number })[];
```

### Parameters

- **`origin`**: - An object defining the reference point for the distance
  calculation.
- **`data`**: - An array of objects to be analyzed.
- **`options`**: - Optional parameters (similarity defaults to false).

### Returns

The input data array with mahaDist properties added to each object.

## addZScore

Calculates the Z-score for a specific numeric variable within an array of
objects and adds it as a new property to each object. The Z-score is a
statistical measure that indicates how many standard deviations a data point is
from the mean of the dataset.

The function modifies the input `data` array by adding a new key to each object,
which by default is `zScore`. You can customize the name of this new key by
using the `newKey` option.

### Signature

```typescript
function addZScore<T extends Record<string, unknown>, K extends string>(
  data: T[],
  variable: string,
  options: { newKey: K },
): (T & { [P in K]: number })[];
```

### Parameters

- **`data`**: - An array of objects. Each object should contain the variable for
  which the Z-score is to be calculated.
- **`variable`**: - The key (as a string) of the numeric variable for which the
  Z-score will be computed.
- **`options`**: - Optional settings for the Z-score calculation.
- **`options.newKey`**: - The name of the new key to be added to each object,
  representing the Z-score. If not provided, it defaults to `'zScore'`.

### Returns

The input `data` array, with the Z-score added to each object under the
specified key.

### Throws

- **`Error`**: If the specified `variable` is not found in an object or its
  value is not a number.

### Examples

```ts
// Basic usage with a list of student grades
const studentData = [
  { student: "Alice", grade: 85 },
  { student: "Bob", grade: 92 },
  { student: "Charlie", grade: 78 },
  { student: "David", grade: 95 },
  { student: "Eve", grade: 62 },
];

// Calculate the Z-score for the 'grade' variable
addZScore(studentData, "grade");

console.log(studentData);
// Expected output:
// [
//   { student: 'Alice', grade: 85, zScore: 0.25 },
//   { student: 'Bob', grade: 92, zScore: 0.83 },
//   { student: 'Charlie', grade: 78, zScore: -0.33 },
//   { student: 'David', grade: 95, zScore: 1.08 },
//   { student: 'Eve', grade: 62, zScore: -1.83 }
// ]
```

```ts
// Using a custom key for the Z-score
addZScore(studentData, "grade", { newKey: "gradeZScore" });

console.log(studentData);
// Expected output with a custom key:
// [
//   { student: 'Alice', grade: 85, gradeZScore: 0.25 },
//   { student: 'Bob', grade: 92, gradeZScore: 0.83 },
//   { student: 'Charlie', grade: 78, gradeZScore: -0.33 },
//   { student: 'David', grade: 95, gradeZScore: 1.08 },
//   { student: 'Eve', grade: 62, gradeZScore: -1.83 }
// ]
```

## addZScore

Calculates the Z-score for a specific numeric variable within an array of
objects using the default 'zScore' key name.

### Signature

```typescript
function addZScore<T extends Record<string, unknown>>(
  data: T[],
  variable: string,
  options?: { newKey?: undefined },
): (T & { zScore: number })[];
```

### Parameters

- **`data`**: - An array of objects. Each object should contain the variable for
  which the Z-score is to be calculated.
- **`variable`**: - The key (as a string) of the numeric variable for which the
  Z-score will be computed.
- **`options`**: - Optional settings (newKey defaults to undefined, using
  'zScore').

### Returns

The input data array with zScore properties added to each object.

## euclidianDistance

Calculates the Euclidean distance between two points in a 2D Cartesian
coordinate system. The Euclidean distance is the shortest straight-line distance
between two points, often referred to as the "as the crow flies" distance.

This function applies the Pythagorean theorem to compute the distance.

### Signature

```typescript
function euclidianDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number;
```

### Parameters

- **`x1`**: The x-coordinate of the first point.
- **`y1`**: The y-coordinate of the first point.
- **`x2`**: The x-coordinate of the second point.
- **`y2`**: The y-coordinate of the second point.

### Returns

The Euclidean distance between the two points.

### Examples

```ts
// Basic usage: Calculate the distance between (0,0) and (3,4).
const dist1 = euclideanDistance(0, 0, 3, 4);
console.log(dist1); // 5
```

```ts
// Calculate the distance between two points with negative coordinates.
const dist2 = euclideanDistance(-1, -1, 2, 3);
console.log(dist2); // 5
```

```ts
// Distance between identical points should be zero.
const dist3 = euclideanDistance(5, 10, 5, 10);
console.log(dist3); // 0
```

## getCovarianceMatrix

Computes the covariance matrix for a given dataset. The covariance matrix is a
square matrix that describes the covariance between each pair of variables in a
dataset.

The function takes a 2D array (matrix) as input, where each inner array
represents a data point and each element within the inner array represents a
variable. It calculates the covariance between all pairs of variables.

Optionally, you can choose to invert the computed covariance matrix by setting
the `invert` option to `true`. The inverse covariance matrix is often used in
statistical applications, particularly in the calculation of Mahalanobis
distance.

### Signature

```typescript
function getCovarianceMatrix(
  data: number[][],
  options?: { invert?: boolean },
): number[][];
```

### Parameters

- **`data`**: - A 2D array of numbers representing the dataset. Each inner array
  is a data point, and each element is a variable.
- **`options`**: - Optional settings for the covariance matrix computation.
- **`options.invert`**: - If `true`, the function will return the inverse of the
  computed covariance matrix. Defaults to `false`.

### Returns

A 2D array representing the covariance matrix. If `options.invert` is `true`,
the inverse covariance matrix is returned.

### Throws

- **`Error`**: If any element in the input `data` is not a number.

### Examples

```ts
// Basic usage: Compute the covariance matrix for a 2x2 dataset.
// This example uses a subset of the wine-quality dataset.
const twoVariables = [
  [6.5, 11],
  [7.1, 12.2],
  [6.3, 10.5],
];
const matrix2x2 = getCovarianceMatrix(twoVariables);
console.log(matrix2x2);
// Expected output (approximately):
// [
//   [0.7119681970550005, -0.12550719251309772],
//   [-0.12550719251309772, 1.514117788841716]
// ]
```

```ts
// Compute the inverse covariance matrix for a 2x2 dataset.
const invertedMatrix2x2 = getCovarianceMatrix(twoVariables, { invert: true });
console.log(invertedMatrix2x2);
// Expected output (approximately):
// [
//   [1.4253851985430073, 0.1181520327131952],
//   [0.11815203271319519, 0.6702443742450724]
// ]
```

// Basic usage: Compute the covariance matrix for a 3x3 dataset. const
threeVariables = [ [6.5, 1.9, 11], [7.1, 2.2, 12.2], [6.3, 2.1, 10.5] ]; const
matrix3x3 = getCovarianceMatrix(threeVariables); console.log(matrix3x3); //
Expected output (approximately): // [ // [0.7119681970550005,
0.3809440223475775, -0.12550719251309772], // [0.3809440223475775,
25.72051786341322, -2.8121660685891356], // [-0.12550719251309772,
-2.8121660685891356, 1.514117788841716] // ]

// Compute the inverse covariance matrix for a 3x3 dataset. const
invertedMatrix3x3 = getCovarianceMatrix(threeVariables, { invert: true });
console.log(invertedMatrix3x3); // Expected output (approximately): // [ //
[1.4275549391155293, -0.01029636303437083, 0.09920848359253127], //
[-0.010296363034370827, 0.048860722373056165, 0.08989538259823723], //
[0.09920848359253126, 0.08989538259823725, 0.835636521966158] // ]

// Basic usage: Compute the covariance matrix for a 4x4 dataset. const
fourVariables = [ [6.5, 1.9, 0.99], [7.1, 2.2, 0.98], [6.3, 2.1, 0.97] ]; const
matrix4x4 = getCovarianceMatrix(fourVariables); console.log(matrix4x4); //
Expected output (approximately): // [ // [0.7119681970550005,
0.3809440223475775, 0.0006695405312093783, -0.12550719251309772], //
[0.3809440223475775, 25.72051786341322, 0.012724566900994994,
-2.8121660685891356], // [0.0006695405312093783, 0.012724566900994994,
0.000008943697841212739, -0.00287084411696803], // [-0.12550719251309772,
-2.8121660685891356, -0.00287084411696803, 1.514117788841716] // ]

// Compute the inverse covariance matrix for a 4x4 dataset. const
invertedMatrix4x4 = getCovarianceMatrix(fourVariables, { invert: true });
console.log(invertedMatrix4x4); // Expected output (approximately): // [ //
[1.890366500801349, 0.29548258210193046, -857.0948891407204,
-0.9196015969508056], // [0.29548258210193046, 0.2508884395460819,
-566.2813827046937, -0.583230998661561], // [-857.0948891407204,
-566.2813827046937, 1587280.2449344082, 1886.7655549874191], //
[-0.9196015969508056, -0.583230998661561, 1886.7655549874191, 3.078393760864504]
// ]

## getMahalanobisDistance

Computes the Mahalanobis distance between two data points (`x1` and `x2`) given
the inverted covariance matrix of the dataset. The Mahalanobis distance is a
measure of the distance between a point and a distribution. It is a unitless
measure. This function can handle data points of any dimension (i.e., with more
than 2 coordinates).

This function requires the inverted covariance matrix of your dataset, which can
be computed using the `getCovarianceMatrix` function with the `invert: true`
option.

### Signature

```typescript
function getMahalanobisDistance(
  x1: number[],
  x2: number[],
  invCovMatrix: number[][],
): number;
```

### Parameters

- **`x1`**: - The first data point (an array of numbers).
- **`x2`**: - The second data point (an array of numbers).
- **`invCovMatrix`**: - The inverted covariance matrix of the dataset (a 2D
  array of numbers).

### Returns

The Mahalanobis distance between `x1` and `x2`.

### Examples

```ts
// Calculate the Mahalanobis distance between two simple 2D points.
// Note: In a real-world scenario, `invCovMatrix` would be derived from a dataset.
const x1 = [1, 2];
const x2 = [3, 4];
const invCovMatrix = [
  [1, 0],
  [0, 1],
];
const distance = getMahalanobisDistance(x1, x2, invCovMatrix);
console.log(`Mahalanobis Distance: ${distance}`);
```

```ts
// Calculate the Mahalanobis distance for 3D points.
const p1 = [1, 2, 3];
const p2 = [4, 5, 6];
const invCovMatrix3D = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const distance3D = getMahalanobisDistance(p1, p2, invCovMatrix3D);
console.log(`Mahalanobis Distance (3D): ${distance3D}`);
```

```ts
// Demonstrate how `getMahalanobisDistance` would typically be used with `getCovarianceMatrix`.
import { getCovarianceMatrix, getMahalanobisDistance } from "journalism";

const dataPoints = [
  [1, 10],
  [2, 12],
  [3, 11],
  [4, 15],
  [5, 13],
];
const point1 = [2, 12];
const point2 = [4, 15];

const covMatrix = getCovarianceMatrix(dataPoints, { invert: true });
const mahalanobisDist = getMahalanobisDistance(point1, point2, covMatrix);
console.log(
  `Mahalanobis Distance between point1 and point2: ${mahalanobisDist}`,
);
```

## getSampleSizeMean

Calculates the required sample size for estimating a population mean with a
specified confidence level and margin of error.

The function uses the finite population correction formula. It calculates the
sample standard deviation from the provided data to estimate the population
standard deviation, which is then used in the sample size calculation.

**When to use this function:**

- Use when you want to estimate the average (mean) value of a numeric variable
  in a population
- When your outcome is continuous/numeric data (income, age, test scores,
  measurements, etc.)
- When you need to answer questions like "What's the average household income?"
  or "What's the mean temperature?"
- When you have existing data to calculate the standard deviation from

**Use `getSampleSizeProportion` instead when:**

- You want to estimate what percentage/proportion of a population has a certain
  characteristic
- Your outcome is categorical (yes/no, present/absent, pass/fail, etc.)
- You need to answer questions like "What percentage of people support this
  policy?" or "What proportion of records are accurate?"

### Signature

```typescript
function getSampleSizeMean<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  confidenceLevel: 90 | 95 | 99,
  marginOfError: number,
  options?: { populationSize?: number },
): number;
```

### Parameters

- **`data`**: - An array of objects used to calculate the sample standard
  deviation. Each object must contain the specified key with numeric values.
- **`key`**: - The key in each data object that contains the numeric values to
  analyze for calculating the sample size.
- **`confidenceLevel`**: - The desired confidence level for the sample. Must be
  90, 95, or 99. The higher the confidence level, the larger the returned sample
  size.
- **`marginOfError`**: - The acceptable margin of error in the same units as the
  data values. The smaller the margin of error, the larger the returned sample
  size.
- **`options`**: - Optional configuration object.
- **`options.populationSize`**: - The total size of the population. If not
  provided, the function assumes the provided data represents the entire
  population and uses data.length as the population size.

### Returns

The minimum required sample size, rounded up to the nearest whole number.

### Examples

```ts
// A journalist analyzing income data wants to know how many records to sample
// to estimate the average income with confidence
const incomeData = [
  { household_id: 1, annual_income: 45000 },
  { household_id: 2, annual_income: 52000 },
  { household_id: 3, annual_income: 38000 },
  // ... thousands more records
];
const sampleSize = getSampleSizeMean(incomeData, "annual_income", 95, 2000);
console.log(
  `You need to analyze ${sampleSize} income records to estimate the average income within $2,000 with 95% confidence`,
);
```

```ts
// Example with known population size - using a small sample to estimate standard deviation
// but knowing the true population size for accurate sample size calculation
const pilotData = [
  { student_id: 1, score: 85 },
  { student_id: 2, score: 92 },
  { student_id: 3, score: 78 },
  // Only 50 pilot records to estimate variability
];
const requiredSample = getSampleSizeMean(
  pilotData,
  "score",
  99,
  5,
  { populationSize: 10000 }, // Total student population is 10,000
);
console.log(
  `For 99% confidence with a 5-point margin of error, sample ${requiredSample} test scores from the 10,000 students.`,
);
```

```ts
// Example for analyzing test scores
const testScores = [
  { student_id: 1, score: 85 },
  { student_id: 2, score: 92 },
  { student_id: 3, score: 78 },
  // ... more test data
];
const requiredSample = getSampleSizeMean(testScores, "score", 99, 5);
console.log(
  `For 99% confidence with a 5-point margin of error, sample ${requiredSample} test scores.`,
);
```

## getSampleSizeProportion

Calculates the required sample size for estimating a population proportion with
a specified confidence level and margin of error.

The function uses the finite population correction formula when the population
size is known, which provides more accurate sample size calculations for smaller
populations. It assumes a worst-case scenario proportion of 0.5 (50%) to ensure
the calculated sample size is sufficient regardless of the actual population
proportion.

**When to use this function:**

- Use when you want to estimate what percentage/proportion of a population has a
  certain characteristic
- When your outcome is categorical (yes/no, pass/fail, present/absent)
- When you need to answer questions like "What percentage of voters support this
  candidate?" or "What proportion of records contain errors?"
- When you don't know the actual proportion in advance (this function uses the
  conservative 50% assumption)

**Use `getSampleSizeMean` instead when:**

- You want to estimate an average value (mean) rather than a proportion
- Your data is continuous/numeric (income, temperature, test scores, etc.)
- You need to answer questions like "What's the average salary?" or "What's the
  mean test score?"

### Signature

```typescript
function getSampleSizeProportion(
  populationSize: number,
  confidenceLevel: 90 | 95 | 99,
  marginOfError: number,
): number;
```

### Parameters

- **`populationSize`**: - The size of the population from which the sample will
  be drawn. Used in the finite population correction formula for more accurate
  sample size calculations.
- **`confidenceLevel`**: - The desired confidence level for the sample. Must be
  90, 95, or 99. The higher the confidence level, the larger the returned sample
  size.
- **`marginOfError`**: - The acceptable margin of error as a percentage (1-100).
  The smaller the margin of error, the larger the returned sample size.

### Returns

The minimum required sample size, rounded up to the nearest whole number.

### Examples

```ts
// A journalist has a dataset of 1,000 records and wants to know how many
// data points to manually double-check to ensure their analysis is accurate
const recordsToVerify = getSampleSizeProportion(1000, 95, 5);
console.log(
  `You need to manually verify ${recordsToVerify} records to be 95% confident in your analysis with a 5% margin of error`,
); // 278
```

```ts
// Example for survey planning
const requiredSample = getSampleSizeProportion(50000, 95, 4);
console.log(
  `For a city survey with 95% confidence and 4% margin of error, you need ${requiredSample} respondents.`,
); // 594
```

## invertMatrix

Computes the inverse of a square matrix.

The function takes a square matrix as input and returns its inverse. It handles
both 2x2 and larger square matrices. If the matrix is singular (i.e., its
determinant is zero), it cannot be inverted, and the function will throw an
error.

### Signature

```typescript
function invertMatrix(matrix: number[][]): number[][];
```

### Parameters

- **`matrix`**: - The square matrix to be inverted. It must be a 2D array where
  the number of rows equals the number of columns.

### Returns

A new 2D array representing the inverse of the input matrix.

### Throws

- **`Error`**: If the input matrix is not square (e.g.,
  `matrix.length !== matrix[0].length`), or if it is singular (non-invertible),
  an error will be thrown.

### Examples

```ts
// Invert a simple 2x2 matrix.
const matrix2x2 = [
  [4, 7],
  [2, 6],
];
const inverted2x2 = invertMatrix(matrix2x2);
console.log(inverted2x2);
```

```ts
// Invert a 3x3 matrix.
const matrix3x3 = [
  [1, 2, 3],
  [0, 1, 4],
  [5, 6, 0],
];
const inverted3x3 = invertMatrix(matrix3x3);
console.log(inverted3x3);
```

```ts
// Attempting to invert a singular matrix will throw an error.
const singularMatrix = [
  [1, 2],
  [2, 4],
];
try {
  invertMatrix(singularMatrix);
} catch (error) {
  console.error("Error:", error.message);
  // Expected output: "Error: Matrix is singular and cannot be inverted"
}
```

## performChiSquaredGoodnessOfFitTest

Performs a Chi-Squared goodness of fit test to determine if observed frequencies
match expected frequencies.

The Chi-Squared goodness of fit test examines whether observed frequencies in
categorical data differ significantly from expected frequencies. This test helps
determine if a sample follows a particular theoretical distribution or pattern.

**When to use this function:**

- Use for goodness of fit tests to see if observed data matches expected
  distribution
- When testing if a sample follows a specific theoretical distribution
- For validating assumptions about population proportions
- When comparing actual results against theoretical models

**Important Requirements:**

- The sum of observed frequencies must equal the sum of expected frequencies
  (within 0.1% tolerance)
- All expected frequencies must be greater than 0
- For reliable results, at least 80% of expected frequencies should be ≥ 5
- For tests with 1 degree of freedom, all expected frequencies should be ≥ 5

### Signature

```typescript
function performChiSquaredGoodnessOfFitTest<T extends Record<string, unknown>>(
  data: T[],
  categoryKey: keyof T,
  observedKey: keyof T,
  expectedKey: keyof T,
): {
  chiSquared: number;
  degreesOfFreedom: number;
  pValue: number;
  warnings: string[];
};
```

### Parameters

- **`data`**: - An array of objects containing the categorical data and
  frequency counts.
- **`categoryKey`**: - The key for the categorical variable.
- **`observedKey`**: - The key containing the observed frequency count for each
  category.
- **`expectedKey`**: - The key containing the expected frequency count for each
  category.

### Returns

An object containing the chi-squared statistic, degrees of freedom, p-value, and
any warnings about test assumptions.

### Examples

```ts
// Testing if observed crime types match expected distribution (goodness of fit)
const crimeData = [
  { crime_type: "theft", observed_count: 120, expected_count: 100 },
  { crime_type: "assault", observed_count: 80, expected_count: 90 },
  { crime_type: "fraud", observed_count: 45, expected_count: 50 },
  { crime_type: "vandalism", observed_count: 55, expected_count: 60 },
];
// Note: Total observed = 300, Total expected = 300 ✓

const testResult = performChiSquaredGoodnessOfFitTest(
  crimeData,
  "crime_type",
  "observed_count",
  "expected_count",
);

console.log(`Chi-squared: ${testResult.chiSquared.toFixed(3)}`);
if (testResult.pValue < 0.05) {
  console.log(
    "Observed crime distribution differs significantly from expected",
  );
} else {
  console.log("Observed crime distribution matches expected pattern");
}

// Check for any warnings about test assumptions
if (testResult.warnings.length > 0) {
  console.log("Test assumption warnings:");
  testResult.warnings.forEach((warning) => console.log("- " + warning));
}
```

```ts
// Testing if dice rolls follow uniform distribution
const diceData = [
  { face: "1", observed: 18, expected: 20 },
  { face: "2", observed: 22, expected: 20 },
  { face: "3", observed: 16, expected: 20 },
  { face: "4", observed: 25, expected: 20 },
  { face: "5", observed: 19, expected: 20 },
  { face: "6", observed: 20, expected: 20 },
];
// Note: Total observed = 120, Total expected = 120 ✓

const result = performChiSquaredGoodnessOfFitTest(
  diceData,
  "face",
  "observed",
  "expected",
);

if (result.pValue > 0.05) {
  console.log("Dice appears to be fair (follows uniform distribution)");
} else {
  console.log("Dice may be biased");
}
```

```ts
// Example that would throw an error due to mismatched totals
const invalidData = [
  { category: "A", observed: 50, expected: 40 }, // Total observed: 80
  { category: "B", observed: 30, expected: 25 }, // Total expected: 65
];

try {
  performChiSquaredGoodnessOfFitTest(
    invalidData,
    "category",
    "observed",
    "expected",
  );
} catch (error) {
  console.log("Error:", error.message);
  // "Total observed frequencies (80) must approximately equal total expected frequencies (65)"
}
```

## performChiSquaredIndependenceTest

Performs a Chi-Squared independence test to determine if two categorical
variables are statistically independent or associated.

The Chi-Squared independence test examines whether there is a statistically
significant association between two categorical variables by comparing observed
frequencies against expected frequencies calculated under the assumption of
independence.

**When to use this function:**

- Use for testing independence between two categorical variables (e.g., gender
  vs voting preference)
- When you have categorical data organized in frequency counts
- When testing hypotheses about associations between variables

### Signature

```typescript
function performChiSquaredIndependenceTest<T extends Record<string, unknown>>(
  data: T[],
  firstVariableKey: keyof T,
  secondVariableKey: keyof T,
  countKey: keyof T,
): {
  chiSquared: number;
  degreesOfFreedom: number;
  pValue: number;
  warnings: string[];
};
```

### Parameters

- **`data`**: - An array of objects containing the categorical data and
  frequency counts.
- **`firstVariableKey`**: - The key for the first categorical variable.
- **`secondVariableKey`**: - The key for the second categorical variable.
- **`countKey`**: - The key containing the frequency count for each combination.

### Returns

An object containing the chi-squared statistic, degrees of freedom, p-value,
contingency table details, and any warnings about test assumptions.

### Examples

```ts
// A journalist investigating if voting preference is independent of age group
const votingData = [
  { age_group: "18-30", candidate: "A", count: 45 },
  { age_group: "18-30", candidate: "B", count: 55 },
  { age_group: "31-50", candidate: "A", count: 60 },
  { age_group: "31-50", candidate: "B", count: 40 },
  { age_group: "51+", candidate: "A", count: 70 },
  { age_group: "51+", candidate: "B", count: 30 },
];

const result = performChiSquaredIndependenceTest(
  votingData,
  "age_group",
  "candidate",
  "count",
);

console.log(`Chi-squared statistic: ${result.chiSquared.toFixed(3)}`);
console.log(`Degrees of freedom: ${result.degreesOfFreedom}`);
console.log(`P-value: ${result.pValue.toFixed(4)}`);

if (result.pValue < 0.05) {
  console.log("Voting preference is significantly associated with age group");
} else {
  console.log("Voting preference is independent of age group");
}

// Check for any warnings about test assumptions
if (result.warnings.length > 0) {
  console.log("Test assumption warnings:");
  result.warnings.forEach((warning) => console.log("- " + warning));
}
```

```ts
// Testing association between education level and income category
const educationIncomeData = [
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

const result = performChiSquaredIndependenceTest(
  educationIncomeData,
  "education",
  "income",
  "count",
);

if (result.pValue < 0.01) {
  console.log("Strong evidence that education and income are associated");
} else {
  console.log("No strong evidence of association between education and income");
}
```

## performPairedTTest

Performs a paired t-test for dependent means to determine if there is a
significant difference between two related samples.

The paired t-test is used when comparing two measurements from the same subjects
or entities, such as before and after an event, policy change, or intervention.
It tests whether the mean difference between paired observations is
significantly different from zero. This is a test for **dependent means**
(related samples), not independent groups.

**When to use this function:**

- Use when you have two measurements from the same subjects or entities
  (before/after an event, pre/post policy change)
- When comparing two related conditions or matched pairs (same districts,
  candidates, regions, etc.)
- When you want to control for individual variation between subjects (dependent
  means)
- When data differences are approximately normally distributed

**Test types:**

- **"two-tailed"** (default): Tests if the mean difference is significantly
  different from zero
- **"left-tailed"**: Tests if the mean difference is significantly less than
  zero
- **"right-tailed"**: Tests if the mean difference is significantly greater than
  zero

### Signature

```typescript
function performPairedTTest<T extends Record<string, unknown>>(
  pairedData: T[],
  firstVariableKey: keyof T,
  secondVariableKey: keyof T,
  options?: { tail?: "two-tailed" | "left-tailed" | "right-tailed" },
): {
  sampleSize: number;
  firstMean: number;
  secondMean: number;
  meanDifference: number;
  differenceStdDev: number;
  differenceVariance: number;
  degreesOfFreedom: number;
  tStatistic: number;
  pValue: number;
};
```

### Parameters

- **`pairedData`**: - An array of objects containing paired observations. Each
  object must contain both specified keys with numeric values.
- **`firstVariableKey`**: - The key for the first measurement in each pair
  (e.g., "before_event", "baseline", "pre_policy").
- **`secondVariableKey`**: - The key for the second measurement in each pair
  (e.g., "after_event", "follow_up", "post_policy").
- **`options`**: - Optional configuration object.
- **`options.tail`**: - The type of test to perform: "two-tailed" (default),
  "left-tailed", or "right-tailed".

### Returns

An object containing comprehensive test results including sample statistics,
differences, degrees of freedom, t-statistic, and p-value.

### Examples

```ts
// A journalist investigating if parking fines increased after new enforcement policy
const parkingFineData = [
  { district_id: 1, fines_before: 125, fines_after: 142 },
  { district_id: 2, fines_before: 98, fines_after: 108 },
  { district_id: 3, fines_before: 156, fines_after: 175 },
  { district_id: 4, fines_before: 87, fines_after: 95 },
  { district_id: 5, fines_before: 203, fines_after: 228 },
  { district_id: 6, fines_before: 134, fines_after: 149 },
];

const result = performPairedTTest(
  parkingFineData,
  "fines_before",
  "fines_after",
);
console.log(
  `Mean increase in fines: ${result.meanDifference.toFixed(2)} per month`,
);
console.log(`T-statistic: ${result.tStatistic.toFixed(3)}`);
console.log(`P-value: ${result.pValue.toFixed(4)}`);

if (result.pValue < 0.05) {
  console.log("Parking fines increased significantly after the new policy");
} else {
  console.log("No significant change in parking fines");
}
```

```ts
// Testing if campaign spending affects vote share (right-tailed test)
const campaignData = [
  { district_id: 1, before_ads: 32.5, after_ads: 38.2 },
  { district_id: 2, before_ads: 28.9, after_ads: 34.1 },
  { district_id: 3, before_ads: 41.3, after_ads: 43.7 },
  { district_id: 4, before_ads: 25.6, after_ads: 31.9 },
  { district_id: 5, before_ads: 36.8, after_ads: 40.3 },
];

// Test if after_ads - before_ads > 0 (increase in vote share)
const testResult = performPairedTTest(
  campaignData,
  "before_ads",
  "after_ads",
  { tail: "right-tailed" },
);

console.log(
  `Mean vote share increase: ${testResult.meanDifference.toFixed(2)}%`,
);
if (testResult.pValue < 0.05) {
  console.log("Campaign ads show significant increase in vote share!");
} else {
  console.log("Campaign ads don't show significant increase in vote share");
}
```

## performTTest

Performs a one-sample t-test for independent means to determine if a sample mean
is significantly different from a hypothesized population mean.

The function compares the mean of a sample against a hypothesized population
mean when the population standard deviation is unknown. This is the most common
scenario in real-world statistical analysis where we only have sample data and
need to estimate the population parameters. This is a test for **independent
means** (sample vs population), not related/paired samples.

**When to use this function:**

- Use when you have sample data and want to test if the sample mean differs
  significantly from a known or hypothesized value
- When the population standard deviation is unknown (most common case)
- When data is approximately normally distributed OR when you have a large
  sample size (n ≥ 30-50)
- **Robustness to non-normality**: Due to the Central Limit Theorem, the t-test
  becomes robust to violations of normality as sample size increases. For large
  samples (n ≥ 30-50), the sampling distribution of the mean approaches
  normality even if the underlying data is not normally distributed
- **Small samples (n < 30)**: Normality assumption is more critical. Consider
  checking for normality or using non-parametric alternatives (like Wilcoxon
  signed-rank test) if data is heavily skewed or has extreme outliers
- For independent observations (not paired or matched data)

**Test types:**

- **"two-tailed"** (default): Tests if sample mean is significantly different
  (higher OR lower) than hypothesized mean
- **"left-tailed"**: Tests if sample mean is significantly lower than
  hypothesized mean
- **"right-tailed"**: Tests if sample mean is significantly higher than
  hypothesized mean

### Signature

```typescript
function performTTest<T extends Record<string, unknown>>(
  sampleData: T[],
  variableKey: keyof T,
  hypothesizedMean: number,
  options?: { tail?: "two-tailed" | "left-tailed" | "right-tailed" },
): {
  sampleSize: number;
  sampleMean: number;
  sampleStdDev: number;
  sampleVariance: number;
  hypothesizedMean: number;
  degreesOfFreedom: number;
  tStatistic: number;
  pValue: number;
};
```

### Parameters

- **`sampleData`**: - An array of objects representing the sample data. Each
  object must contain the specified key with numeric values.
- **`variableKey`**: - The key in each data object that contains the numeric
  values to analyze for the statistical test.
- **`hypothesizedMean`**: - The hypothesized population mean to test against
  (null hypothesis value).
- **`options`**: - Optional configuration object.
- **`options.tail`**: - The type of test to perform: "two-tailed" (default),
  "left-tailed", or "right-tailed".

### Returns

An object containing comprehensive test results including sample statistics,
degrees of freedom, t-statistic, and p-value.

### Examples

```ts
// A journalist investigating if basketball players in a local league
// score significantly different from the national average of 10 points per game
const localPlayers = [
  { player_id: 1, name: "John", points_per_game: 15 },
  { player_id: 2, name: "Sarah", points_per_game: 12 },
  { player_id: 3, name: "Mike", points_per_game: 18 },
  { player_id: 4, name: "Lisa", points_per_game: 14 },
  { player_id: 5, name: "Tom", points_per_game: 16 },
  { player_id: 6, name: "Anna", points_per_game: 13 },
];

const nationalAverage = 10; // Known population mean

const result = performTTest(localPlayers, "points_per_game", nationalAverage);
console.log(`Sample mean: ${result.sampleMean.toFixed(2)} points per game`);
console.log(`T-statistic: ${result.tStatistic.toFixed(3)}`);
console.log(`P-value: ${result.pValue.toFixed(4)}`);

if (result.pValue < 0.05) {
  console.log(
    "Local players score significantly different from national average",
  );
} else {
  console.log("Local players' scoring is consistent with national average");
}
```

```ts
// Testing if a new training program improves performance (right-tailed test)
const trainingResults = [
  { athlete_id: 1, improvement_score: 8.5 },
  { athlete_id: 2, improvement_score: 12.3 },
  { athlete_id: 3, improvement_score: 6.7 },
  { athlete_id: 4, improvement_score: 15.2 },
  { athlete_id: 5, improvement_score: 9.8 },
];

const expectedImprovement = 5; // Null hypothesis: no significant improvement

const testResult = performTTest(
  trainingResults,
  "improvement_score",
  expectedImprovement,
  { tail: "right-tailed" },
);

console.log(`Sample mean improvement: ${testResult.sampleMean.toFixed(2)}`);
if (testResult.pValue < 0.05) {
  console.log("Training program shows significant improvement!");
} else {
  console.log("Training program doesn't show significant improvement");
}
```

## performTwoSampleTTest

Performs a two-sample t-test for independent means to determine if there is a
significant difference between two independent groups.

The two-sample t-test compares the means of two independent groups when the
population standard deviations are unknown. It tests whether the difference
between the two group means is significantly different from zero. This is a test
for **independent means** (unrelated groups), not paired/related samples.

**When to use this function:**

- Use when you have two separate, independent groups to compare
- When comparing measurements from different subjects, entities, or populations
- When the population standard deviations are unknown (most common case)
- When data in both groups are approximately normally distributed OR when you
  have large sample sizes (n ≥ 30-50 per group)
- **Robustness to non-normality**: Due to the Central Limit Theorem, the
  two-sample t-test becomes robust to violations of normality as sample sizes
  increase. For large samples (n ≥ 30-50 per group), the sampling distribution
  of the difference in means approaches normality even if the underlying data is
  not normally distributed
- **Small samples (n < 30 per group)**: Normality assumption is more critical
  for both groups. Consider checking for normality or using non-parametric
  alternatives (like Mann-Whitney U test) if data is heavily skewed or has
  extreme outliers
- For independent observations (not paired, matched, or related data)

**Test types:**

- **"two-tailed"** (default): Tests if the group means are significantly
  different from each other
- **"left-tailed"**: Tests if group 1 mean is significantly less than group 2
  mean
- **"right-tailed"**: Tests if group 1 mean is significantly greater than group
  2 mean

### Signature

```typescript
function performTwoSampleTTest<
  T1 extends Record<string, unknown>,
  T2 extends Record<string, unknown>,
  K extends keyof T1 & keyof T2,
>(
  group1Data: T1[],
  group2Data: T2[],
  variableKey: K,
  options?: { tail?: "two-tailed" | "left-tailed" | "right-tailed" },
): {
  group1SampleSize: number;
  group2SampleSize: number;
  group1Mean: number;
  group2Mean: number;
  group1StdDev: number;
  group2StdDev: number;
  group1Variance: number;
  group2Variance: number;
  meanDifference: number;
  degreesOfFreedom: number;
  tStatistic: number;
  pValue: number;
};
```

### Parameters

- **`group1Data`**: - An array of objects containing observations for the first
  group. Each object must contain the specified key with a numeric value.
- **`group2Data`**: - An array of objects containing observations for the second
  group. Each object must contain the specified key with a numeric value.
- **`variableKey`**: - The key for the measurement in both group objects (e.g.,
  "income", "score", "price").
- **`options`**: - Optional configuration object.
- **`options.tail`**: - The type of test to perform: "two-tailed" (default),
  "left-tailed", or "right-tailed".

### Returns

An object containing comprehensive test results including sample statistics for
both groups, mean difference, degrees of freedom, t-statistic, and p-value.

### Examples

```ts
// A journalist comparing average housing prices between two different cities
const city1Prices = [
  { property_id: 1, price: 450000 },
  { property_id: 2, price: 520000 },
  { property_id: 3, price: 380000 },
  { property_id: 4, price: 610000 },
  { property_id: 5, price: 475000 },
];

const city2Prices = [
  { property_id: 101, price: 520000 },
  { property_id: 102, price: 580000 },
  { property_id: 103, price: 490000 },
  { property_id: 104, price: 660000 },
  { property_id: 105, price: 530000 },
  { property_id: 106, price: 615000 },
];

const result = performTwoSampleTTest(city1Prices, city2Prices, "price");
console.log(`City 1 average: $${result.group1Mean.toFixed(0)}`);
console.log(`City 2 average: $${result.group2Mean.toFixed(0)}`);
console.log(`Mean difference: $${result.meanDifference.toFixed(0)}`);
console.log(`T-statistic: ${result.tStatistic.toFixed(3)}`);
console.log(`P-value: ${result.pValue.toFixed(4)}`);

if (result.pValue < 0.05) {
  console.log("Significant difference in housing prices between cities");
} else {
  console.log("No significant difference in housing prices between cities");
}
```

```ts
// Testing if male candidates receive higher campaign donations than female candidates (right-tailed)
const maleCandidates = [
  { candidate_id: 1, donation_total: 25000 },
  { candidate_id: 2, donation_total: 32000 },
  { candidate_id: 3, donation_total: 18000 },
  { candidate_id: 4, donation_total: 41000 },
];

const femaleCandidates = [
  { candidate_id: 101, donation_total: 22000 },
  { candidate_id: 102, donation_total: 28000 },
  { candidate_id: 103, donation_total: 19000 },
  { candidate_id: 104, donation_total: 35000 },
  { candidate_id: 105, donation_total: 24000 },
];

// Test if male average > female average
const testResult = performTwoSampleTTest(
  maleCandidates,
  femaleCandidates,
  "donation_total",
  { tail: "right-tailed" },
);

console.log(`Male average: $${testResult.group1Mean.toFixed(0)}`);
console.log(`Female average: $${testResult.group2Mean.toFixed(0)}`);
if (testResult.pValue < 0.05) {
  console.log("Male candidates receive significantly higher donations");
} else {
  console.log("No significant difference in donation amounts by gender");
}
```

## performZTest

Performs a one-sample Z-test to determine if a sample mean is significantly
different from a population mean.

The function compares the mean of a sample against the mean of a known
population to test the null hypothesis. It automatically applies the finite
population correction (FPC) when the sample size exceeds 5% of the population
size, which provides more accurate results for smaller populations. This is a
**one-sample Z-test** comparing a sample against a known population, not a
comparison between two independent samples.

**When to use this function:**

- Use when you have a complete population dataset and want to test if a sample
  represents that population
- When you need to validate whether observed differences between sample and
  population means are statistically significant
- When data is approximately normally distributed or sample size is large
  (Central Limit Theorem applies)
- For independent observations (not paired or matched data)

**Test types:**

- **"two-tailed"** (default): Tests if sample mean is significantly different
  (higher OR lower) than population mean
- **"left-tailed"**: Tests if sample mean is significantly lower than population
  mean
- **"right-tailed"**: Tests if sample mean is significantly higher than
  population mean

### Signature

```typescript
function performZTest<T extends Record<string, unknown>>(
  populationData: T[],
  sampleData: T[],
  variableKey: keyof T,
  options?: { tail?: "two-tailed" | "left-tailed" | "right-tailed" },
): {
  populationSize: number;
  sampleSize: number;
  populationMean: number;
  sampleMean: number;
  populationStdDev: number;
  populationVariance: number;
  fpcApplied: boolean;
  zScore: number;
  pValue: number;
};
```

### Parameters

- **`populationData`**: - An array of objects representing the complete
  population data. Each object must contain the specified key with numeric
  values.
- **`sampleData`**: - An array of objects representing the sample data to test
  against the population. Each object must contain the specified key with
  numeric values.
- **`variableKey`**: - The key in each data object that contains the numeric
  values to analyze for the statistical test.
- **`options`**: - Optional configuration object.
- **`options.tail`**: - The type of test to perform: "two-tailed" (default),
  "left-tailed", or "right-tailed".

### Returns

An object containing comprehensive test results including population and sample
statistics, population variance and standard deviation, test statistics
(z-score), p-value, and whether finite population correction was applied.

### Examples

```ts
// A journalist investigating if Democratic candidates receive significantly
// different donation amounts compared to all political candidates (two-tailed test)
const allCandidates = [
  { candidate_id: 1, party: "Democratic", donation_amount: 2500 },
  { candidate_id: 2, party: "Republican", donation_amount: 3200 },
  { candidate_id: 3, party: "Independent", donation_amount: 1800 },
  { candidate_id: 4, party: "Democratic", donation_amount: 2800 },
  // ... complete population of all candidates (5,000 records)
];

const democraticCandidates = [
  { candidate_id: 1, party: "Democratic", donation_amount: 2500 },
  { candidate_id: 4, party: "Democratic", donation_amount: 2800 },
  { candidate_id: 7, party: "Democratic", donation_amount: 3100 },
  // ... all Democratic candidates (1,200 records)
];

const result = performZTest(
  allCandidates,
  democraticCandidates,
  "donation_amount",
);
console.log(`Population mean donation: $${result.populationMean.toFixed(2)}`);
console.log(`Democratic candidates mean: $${result.sampleMean.toFixed(2)}`);
console.log(`P-value: ${result.pValue.toFixed(4)}`);
if (result.pValue < 0.05) {
  console.log(
    "Democratic candidates receive significantly different donations than average",
  );
} else {
  console.log(
    "Democratic candidates' donations are consistent with overall average",
  );
}
```

```ts
// Testing if corporate donors give MORE than average (right-tailed test)
const allDonors = [
  { donor_id: 1, type: "individual", amount: 500 },
  { donor_id: 2, type: "corporate", amount: 5000 },
  { donor_id: 3, type: "PAC", amount: 2500 },
  // ... complete donor population
];

const corporateDonors = [
  { donor_id: 2, type: "corporate", amount: 5000 },
  { donor_id: 8, type: "corporate", amount: 7500 },
  // ... all corporate donors
];

const testResult = performZTest(allDonors, corporateDonors, "amount", {
  tail: "right-tailed",
});
console.log(
  `All donors mean donation: $${testResult.populationMean.toFixed(2)}`,
);
console.log(`Corporate donors mean: $${testResult.sampleMean.toFixed(2)}`);
if (testResult.pValue < 0.05) {
  console.log("Corporate donors give significantly MORE than average");
} else {
  console.log("Corporate donors don't give significantly more than average");
}
```
