const LANCZOS_COEFFICIENTS = [
  0.9999999999998099,
  676.5203681218851,
  -1259.1392167224028,
  771.3234287776531,
  -176.6150291621406,
  12.507343278686905,
  -0.13857109526572012,
  9.984369578019572e-6,
  1.5056327351493116e-7,
] as const;

const LOG_SQRT_TWO_PI = 0.9189385332046727;
const CONTINUED_FRACTION_EPSILON = 3e-14;
const CONTINUED_FRACTION_FLOOR = 1e-300;
const MAX_ITERATIONS = 200;
const GAMMA_EPSILON = 1e-15;
const GAMMA_MAX_ITERATIONS = 10_000;

/** Natural logarithm of the gamma function, using the Lanczos approximation. */
export function logGamma(value: number): number {
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) -
      logGamma(1 - value);
  }

  const shifted = value - 1;
  let sum = LANCZOS_COEFFICIENTS[0];
  for (let index = 1; index < LANCZOS_COEFFICIENTS.length; index++) {
    sum += LANCZOS_COEFFICIENTS[index] / (shifted + index);
  }
  const base = shifted + 7.5;
  return LOG_SQRT_TWO_PI + (shifted + 0.5) * Math.log(base) - base +
    Math.log(sum);
}

function incompleteBetaContinuedFraction(
  firstShape: number,
  secondShape: number,
  value: number,
): number {
  const shapeSum = firstShape + secondShape;
  const firstShapePlusOne = firstShape + 1;
  const firstShapeMinusOne = firstShape - 1;
  let numeratorFactor = 1;
  let denominatorFactor = 1 - shapeSum * value / firstShapePlusOne;
  if (Math.abs(denominatorFactor) < CONTINUED_FRACTION_FLOOR) {
    denominatorFactor = CONTINUED_FRACTION_FLOOR;
  }
  denominatorFactor = 1 / denominatorFactor;
  let fraction = denominatorFactor;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const doubledIteration = 2 * iteration;
    let numerator = iteration * (secondShape - iteration) * value /
      ((firstShapeMinusOne + doubledIteration) *
        (firstShape + doubledIteration));
    denominatorFactor = 1 + numerator * denominatorFactor;
    if (Math.abs(denominatorFactor) < CONTINUED_FRACTION_FLOOR) {
      denominatorFactor = CONTINUED_FRACTION_FLOOR;
    }
    numeratorFactor = 1 + numerator / numeratorFactor;
    if (Math.abs(numeratorFactor) < CONTINUED_FRACTION_FLOOR) {
      numeratorFactor = CONTINUED_FRACTION_FLOOR;
    }
    denominatorFactor = 1 / denominatorFactor;
    fraction *= denominatorFactor * numeratorFactor;

    numerator = -(firstShape + iteration) * (shapeSum + iteration) * value /
      ((firstShape + doubledIteration) *
        (firstShapePlusOne + doubledIteration));
    denominatorFactor = 1 + numerator * denominatorFactor;
    if (Math.abs(denominatorFactor) < CONTINUED_FRACTION_FLOOR) {
      denominatorFactor = CONTINUED_FRACTION_FLOOR;
    }
    numeratorFactor = 1 + numerator / numeratorFactor;
    if (Math.abs(numeratorFactor) < CONTINUED_FRACTION_FLOOR) {
      numeratorFactor = CONTINUED_FRACTION_FLOOR;
    }
    denominatorFactor = 1 / denominatorFactor;
    const delta = denominatorFactor * numeratorFactor;
    fraction *= delta;

    if (Math.abs(delta - 1) <= CONTINUED_FRACTION_EPSILON) {
      return fraction;
    }
  }

  throw new Error("The incomplete beta continued fraction did not converge.");
}

/** Regularized incomplete beta I_x(a, b). */
export function regularizedIncompleteBeta(
  value: number,
  firstShape: number,
  secondShape: number,
): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;

  const scale = Math.exp(
    logGamma(firstShape + secondShape) - logGamma(firstShape) -
      logGamma(secondShape) + firstShape * Math.log(value) +
      secondShape * Math.log1p(-value),
  );

  if (value < (firstShape + 1) / (firstShape + secondShape + 2)) {
    return scale * incompleteBetaContinuedFraction(
      firstShape,
      secondShape,
      value,
    ) / firstShape;
  }
  return 1 - scale * incompleteBetaContinuedFraction(
        secondShape,
        firstShape,
        1 - value,
      ) /
      secondShape;
}

function gammaSeries(shape: number, value: number): number {
  let term = 1 / shape;
  let sum = term;
  let denominator = shape;

  for (let iteration = 1; iteration <= GAMMA_MAX_ITERATIONS; iteration++) {
    denominator += 1;
    term *= value / denominator;
    sum += term;
    if (Math.abs(term) <= Math.abs(sum) * GAMMA_EPSILON) {
      return sum * Math.exp(
        -value + shape * Math.log(value) - logGamma(shape),
      );
    }
  }

  throw new Error("The incomplete gamma series did not converge.");
}

function gammaContinuedFraction(shape: number, value: number): number {
  let offset = value + 1 - shape;
  let numeratorFactor = 1 / CONTINUED_FRACTION_FLOOR;
  let denominatorFactor = 1 / offset;
  let fraction = denominatorFactor;

  for (let iteration = 1; iteration <= GAMMA_MAX_ITERATIONS; iteration++) {
    const numerator = -iteration * (iteration - shape);
    offset += 2;
    denominatorFactor = numerator * denominatorFactor + offset;
    if (Math.abs(denominatorFactor) < CONTINUED_FRACTION_FLOOR) {
      denominatorFactor = CONTINUED_FRACTION_FLOOR;
    }
    numeratorFactor = offset + numerator / numeratorFactor;
    if (Math.abs(numeratorFactor) < CONTINUED_FRACTION_FLOOR) {
      numeratorFactor = CONTINUED_FRACTION_FLOOR;
    }
    denominatorFactor = 1 / denominatorFactor;
    const delta = denominatorFactor * numeratorFactor;
    fraction *= delta;
    if (Math.abs(delta - 1) <= GAMMA_EPSILON) {
      return Math.exp(
        -value + shape * Math.log(value) - logGamma(shape),
      ) * fraction;
    }
  }

  throw new Error("The incomplete gamma continued fraction did not converge.");
}

/** Regularized lower incomplete gamma P(a, x). */
export function regularizedIncompleteGamma(
  shape: number,
  value: number,
): number {
  if (shape <= 0 || !Number.isFinite(shape)) {
    throw new Error("The gamma shape must be a positive finite number.");
  }
  if (value <= 0) return 0;
  if (value === Infinity) return 1;

  return value < shape + 1
    ? gammaSeries(shape, value)
    : 1 - gammaContinuedFraction(shape, value);
}

/** Regularized upper incomplete gamma Q(a, x), evaluated directly in its tail. */
export function regularizedIncompleteGammaSurvival(
  shape: number,
  value: number,
): number {
  if (shape <= 0 || !Number.isFinite(shape)) {
    throw new Error("The gamma shape must be a positive finite number.");
  }
  if (value <= 0) return 1;
  if (value === Infinity) return 0;

  return value < shape + 1
    ? 1 - gammaSeries(shape, value)
    : gammaContinuedFraction(shape, value);
}

/** Chi-square survival function P(X >= x). */
export function chiSquaredSurvival(
  chiSquared: number,
  degreesOfFreedom: number,
): number {
  return regularizedIncompleteGammaSurvival(
    degreesOfFreedom / 2,
    chiSquared / 2,
  );
}

/** Student's t cumulative distribution function. */
export function studentTCdf(
  tStatistic: number,
  degreesOfFreedom: number,
): number {
  if (tStatistic === 0) return 0.5;
  if (tStatistic === Infinity) return 1;
  if (tStatistic === -Infinity) return 0;

  const beta = regularizedIncompleteBeta(
    degreesOfFreedom /
      (degreesOfFreedom + tStatistic * tStatistic),
    degreesOfFreedom / 2,
    0.5,
  );
  return tStatistic < 0 ? beta / 2 : 1 - beta / 2;
}

/** Student's t survival function, calculated directly in the upper tail. */
export function studentTSurvival(
  tStatistic: number,
  degreesOfFreedom: number,
): number {
  if (tStatistic === 0) return 0.5;
  if (tStatistic === Infinity) return 0;
  if (tStatistic === -Infinity) return 1;

  const beta = regularizedIncompleteBeta(
    degreesOfFreedom /
      (degreesOfFreedom + tStatistic * tStatistic),
    degreesOfFreedom / 2,
    0.5,
  );
  return tStatistic > 0 ? beta / 2 : 1 - beta / 2;
}
