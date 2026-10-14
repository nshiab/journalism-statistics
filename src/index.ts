/**
 * Statistical calculations for journalism projects.
 *
 * Install with `npm install @nshiab/journalism-statistics`.
 * Requires Node.js 24.21.0 or later and ES modules.
 *
 * @example
 * ```ts
 * import { getSampleSizeProportion } from "@nshiab/journalism-statistics";
 *
 * const sampleSize = getSampleSizeProportion(1000, 95, 5);
 * console.log(sampleSize); // 278
 * ```
 *
 * @module
 */

import getCovarianceMatrix from "./statistics/getCovarianceMatrix.ts";
import getCorrelationMatrix from "./statistics/getCorrelationMatrix.ts";
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
import getCirParameters from "./statistics/getCirParameters.ts";
import generateCirPath from "./statistics/generateCirPath.ts";
import getGbmParameters from "./statistics/getGbmParameters.ts";
import generateGbmPath from "./statistics/generateGbmPath.ts";
import getCholeskyMatrix from "./statistics/getCholeskyMatrix.ts";
import getCorrelatedShocks from "./statistics/getCorrelatedShocks.ts";
import stepGbm from "./statistics/stepGbm.ts";
import stepCir from "./statistics/stepCir.ts";

export {
  addClusters,
  addMahalanobisDistance,
  addZScore,
  euclidianDistance,
  generateCirPath,
  generateGbmPath,
  getCholeskyMatrix,
  getCirParameters,
  getCorrelatedShocks,
  getCorrelationMatrix,
  getCovarianceMatrix,
  getGbmParameters,
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
  stepCir,
  stepGbm,
};
