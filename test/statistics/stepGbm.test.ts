import { expect, test } from "vite-plus/test";
import stepGbm from "../../src/statistics/stepGbm.ts";

test("stepGbm: calculates next step correctly", () => {
  const current = 100;
  const mu = 0.05;
  const sigma = 0.2;
  const dt = 1 / 12;
  const shock = 0.5; // Z value

  const drift = (mu - sigma ** 2 / 2) * dt;
  const diffusion = sigma * Math.sqrt(dt) * shock;
  const expected = current * Math.exp(drift + diffusion);

  expect(Math.abs(stepGbm(current, mu, sigma, dt, shock) - expected)).toBeLessThanOrEqual(1e-6);
});
