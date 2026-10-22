[**Journalism Statistics v1.5.12**](index.md)

***

# Journalism Statistics v1.5.12

Statistical calculations for journalism projects.

Install with `npm install @nshiab/journalism-statistics`.
Requires Node.js 24.21.0 or later and ES modules.

## Example

```ts
import { getSampleSizeProportion } from "@nshiab/journalism-statistics";

const sampleSize = getSampleSizeProportion(1000, 95, 5);
console.log(sampleSize); // 278
```

## Statistics

- [addClusters](functions/addClusters.md)
- [addMahalanobisDistance](functions/addMahalanobisDistance.md)
- [addZScore](functions/addZScore.md)
- [euclidianDistance](functions/euclidianDistance.md)
- [generateCirPath](functions/generateCirPath.md)
- [generateGbmPath](functions/generateGbmPath.md)
- [getCholeskyMatrix](functions/getCholeskyMatrix.md)
- [getCirParameters](functions/getCirParameters.md)
- [getCorrelatedShocks](functions/getCorrelatedShocks.md)
- [getCorrelationMatrix](functions/getCorrelationMatrix.md)
- [getCovarianceMatrix](functions/getCovarianceMatrix.md)
- [getGbmParameters](functions/getGbmParameters.md)
- [getMahalanobisDistance](functions/getMahalanobisDistance.md)
- [getSampleSizeMean](functions/getSampleSizeMean.md)
- [getSampleSizeProportion](functions/getSampleSizeProportion.md)
- [invertMatrix](functions/invertMatrix.md)
- [performChiSquaredGoodnessOfFitTest](functions/performChiSquaredGoodnessOfFitTest.md)
- [performChiSquaredIndependenceTest](functions/performChiSquaredIndependenceTest.md)
- [performPairedTTest](functions/performPairedTTest.md)
- [performTTest](functions/performTTest.md)
- [performTwoSampleTTest](functions/performTwoSampleTTest.md)
- [performZTest](functions/performZTest.md)
- [stepCir](functions/stepCir.md)
- [stepGbm](functions/stepGbm.md)
