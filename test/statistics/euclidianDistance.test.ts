import { expect, test } from "vite-plus/test";
import euclideanDistance from "../../src/statistics/euclidianDistance.ts";

test("should return 0 when both points are the same", () => {
  const distance = euclideanDistance(0, 0, 0, 0);
  expect(distance).toStrictEqual(0);
});

test("should return the correct distance for points on the x-axis", () => {
  const distance = euclideanDistance(0, 0, 3, 0);
  expect(distance).toStrictEqual(3);
});

test("should return the correct distance for points on the y-axis", () => {
  const distance = euclideanDistance(0, 0, 0, 4);
  expect(distance).toStrictEqual(4);
});

test("should return the correct distance for points in the first quadrant", () => {
  const distance = euclideanDistance(0, 0, 3, 4);
  expect(distance).toStrictEqual(5);
});

test("should return the correct distance for points in different quadrants", () => {
  const distance = euclideanDistance(-1, -1, 2, 3);
  expect(distance).toStrictEqual(5);
});
