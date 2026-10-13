import { expect, test } from "vite-plus/test";
import getCovarianceMatrix from "../../src/statistics/getCovarianceMatrix.ts";
import getMahalanobisDistance from "../../src/statistics/getMahalanobisDistance.ts";
import wineQuality from "../data/wine-quality.json" with { type: "json" };
import columnsToRows from "../helpers/columnsToRows.ts";

const data = columnsToRows(wineQuality);

test("should return the distance with two variables", () => {
  const twoVariables = data.map((d) => [d["fixed acidity"], d.alcohol]);
  const invertedCovarianceMatrix = getCovarianceMatrix(twoVariables, {
    invert: true,
  });
  const distance = getMahalanobisDistance(
    [6.5, 11],
    [7, 8.8],
    invertedCovarianceMatrix,
  );
  expect(distance).toStrictEqual(1.8276746425479757);
});
test("should return the distance with three variables", () => {
  const twoVariables = data.map((d) => [
    d["fixed acidity"],
    d["residual sugar"],
    d.alcohol,
  ]);
  const invertedCovarianceMatrix = getCovarianceMatrix(twoVariables, {
    invert: true,
  });
  const distance = getMahalanobisDistance(
    [6.5, 10, 11],
    [7, 20.7, 8.8],
    invertedCovarianceMatrix,
  );
  expect(distance).toStrictEqual(2.3312505752256536);
});
test("should return the distance with four variables", () => {
  const twoVariables = data.map((d) => [
    d["fixed acidity"],
    d["residual sugar"],
    d.density,
    d.alcohol,
  ]);
  const invertedCovarianceMatrix = getCovarianceMatrix(twoVariables, {
    invert: true,
  });
  const distance = getMahalanobisDistance(
    [6.5, 10, 0.99, 11],
    [7, 20.7, 1.001, 8.8],
    invertedCovarianceMatrix,
  );
  expect(distance).toStrictEqual(5.894939604153916);
});
