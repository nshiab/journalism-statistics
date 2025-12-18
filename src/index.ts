/**
 * @module
 *
 * The Journalism library
 *
 * To install the library with Deno, use:
 * ```bash
 * deno add jsr:@nshiab/journalism-statistics
 * ```
 *
 * To install the library with Node.js, use:
 * ```bash
 * npx jsr add @nshiab/journalism-statistics
 * ```
 *
 * To import a function, use:
 * ```ts
 * import { functionName } from "@nshiab/journalism-statistics";
 * ```
 */

import getCovarianceMatrix from "./statistics/getCovarianceMatrix.ts";
import invertMatrix from "./statistics/invertMatrix.ts";
import getMahalanobisDistance from "./statistics/getMahalanobisDistance.ts";
import addMahalanobisDistance from "./statistics/addMahalanobisDistance.ts";
import addZScore from "./statistics/addZScore.ts";
import addClusters from "./statistics/addClusters.ts";
import euclidianDistance from "./statistics/euclidianDistance.ts";
import getSampleSizeProportion from "./statistics/getSampleSizeProportion.ts";
import getSampleSizeMean from "./statistics/getSampleSizeMean.ts";
import performZTest from "./statistics/performZTest.ts";
import performTTest from "./statistics/performTTest.ts";
import performPairedTTest from "./statistics/performPairedTTest.ts";
import performTwoSampleTTest from "./statistics/performTwoSampleTTest.ts";
import performChiSquaredIndependenceTest from "./statistics/performChiSquaredIndependenceTest.ts";
import performChiSquaredGoodnessOfFitTest from "./statistics/performChiSquaredGoodnessOfFitTest.ts";

export {
  addClusters,
  addMahalanobisDistance,
  addZScore,
  euclidianDistance,
  getCovarianceMatrix,
  getMahalanobisDistance,
  getSampleSizeMean,
  getSampleSizeProportion,
  invertMatrix,
  performChiSquaredGoodnessOfFitTest,
  performChiSquaredIndependenceTest,
  performPairedTTest,
  performTTest,
  performTwoSampleTTest,
  performZTest,
};
