/**
 * Pure linear-regression and gradient-descent math shared by the regression
 * labs, the training Web Worker and the unit tests. Everything here is
 * side-effect free and free of TF.js so it can run on any thread.
 */

export interface DataPoint {
  x: number;
  y: number;
}

export interface GradientDescentOptions {
  learningRate: number;
  epochs: number;
  initialW?: number;
  initialB?: number;
  /** Loss above which the run is considered divergent and stopped early. */
  divergeThreshold?: number;
}

export interface GradientDescentStep {
  epoch: number;
  loss: number;
  w: number;
  b: number;
}

export interface GradientDescentResult {
  history: GradientDescentStep[];
  w: number;
  b: number;
  loss: number;
  diverged: boolean;
  epochsRun: number;
}

export const DEFAULT_DIVERGE_THRESHOLD = 1e7;

/** Linear prediction `ŷ = w·x + b`. */
export function predict(x: number, w: number, b: number): number {
  return w * x + b;
}

/** Mean squared error `(1/n) Σ (ŷ - y)²`. */
export function meanSquaredError(data: readonly DataPoint[], w: number, b: number): number {
  if (data.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const point of data) {
    const error = predict(point.x, w, b) - point.y;
    sum += error * error;
  }
  return sum / data.length;
}

/** Analytic gradients of the MSE w.r.t. `w` and `b`. */
export function mseGradients(
  data: readonly DataPoint[],
  w: number,
  b: number,
): { dw: number; db: number } {
  if (data.length === 0) {
    return { dw: 0, db: 0 };
  }
  let dw = 0;
  let db = 0;
  for (const point of data) {
    const error = predict(point.x, w, b) - point.y;
    dw += error * point.x;
    db += error;
  }
  const scale = 2 / data.length;
  return { dw: dw * scale, db: db * scale };
}

/** Runs batch gradient descent and returns the full per-epoch history. */
export function gradientDescentRun(
  data: readonly DataPoint[],
  options: GradientDescentOptions,
): GradientDescentResult {
  const initialW = options.initialW ?? 0;
  const initialB = options.initialB ?? 0;
  const divergeThreshold = options.divergeThreshold ?? DEFAULT_DIVERGE_THRESHOLD;

  let w = initialW;
  let b = initialB;
  const history: GradientDescentStep[] = [];
  let diverged = false;

  for (let epoch = 0; ; epoch++) {
    const loss = meanSquaredError(data, w, b);
    history.push({ epoch, loss, w, b });

    if (!Number.isFinite(loss) || loss > divergeThreshold) {
      diverged = true;
      break;
    }
    if (epoch >= options.epochs) {
      break;
    }

    const { dw, db } = mseGradients(data, w, b);
    w -= options.learningRate * dw;
    b -= options.learningRate * db;
  }

  const last = history[history.length - 1];
  return {
    history,
    w: last?.w ?? initialW,
    b: last?.b ?? initialB,
    loss: last?.loss ?? meanSquaredError(data, initialW, initialB),
    diverged,
    epochsRun: history.length - 1,
  };
}

/** Least-squares fit `y = w·x + b` computed in closed form. */
export function ordinaryLeastSquares(data: readonly DataPoint[]): { w: number; b: number } {
  const n = data.length;
  if (n === 0) {
    return { w: 0, b: 0 };
  }
  const meanX = data.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = data.reduce((sum, point) => sum + point.y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (const point of data) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) ** 2;
  }
  const w = denominator === 0 ? 0 : numerator / denominator;
  return { w, b: meanY - w * meanX };
}

/** Pearson correlation coefficient between two equal-length series. */
export function pearsonCorrelation(xs: readonly number[], ys: readonly number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) {
    return 0;
  }
  const meanX = xs.slice(0, n).reduce((sum, value) => sum + value, 0) / n;
  const meanY = ys.slice(0, n).reduce((sum, value) => sum + value, 0) / n;

  let numerator = 0;
  let sumXSquares = 0;
  let sumYSquares = 0;
  for (let index = 0; index < n; index++) {
    const dx = xs[index] - meanX;
    const dy = ys[index] - meanY;
    numerator += dx * dy;
    sumXSquares += dx * dx;
    sumYSquares += dy * dy;
  }
  const denominator = Math.sqrt(sumXSquares * sumYSquares);
  return denominator === 0 ? 0 : numerator / denominator;
}

/** MSE as a function of `w` for a fixed `b`, used to draw the cost curve. */
export function mseCurve(
  data: readonly DataPoint[],
  b: number,
  wValues: readonly number[],
): number[] {
  return wValues.map((w) => meanSquaredError(data, w, b));
}
