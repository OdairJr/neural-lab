import type { LineChartData } from '@domain/content';
import type { TrainingMetric, TrainingWorkerService } from '@core/training';
import { GRADIENT_DESCENT_DATASET } from '@content/lab-configs/lab-10-gradient-descent';
import type { ExperimentFn, ExperimentResult } from '@shared/experiments';
import { concatWith, defer, map, of } from 'rxjs';

export const LAB_10_GRADIENT_DESCENT = 'lab-10-gradient-descent';

/** The dataset used by the gradient-descent training run. */
export function gradientDescentData(): { x: number; y: number }[] {
  return GRADIENT_DESCENT_DATASET.map((point) => ({ x: point.x, y: point.y }));
}

/** Builds the per-epoch loss line chart from the metrics received so far. */
export function lossChart(history: readonly TrainingMetric[], title: string): LineChartData {
  return {
    type: 'line-chart',
    title,
    series: [{ label: 'MSE', data: history.map((metric) => metric.loss) }],
    xLabels: history.map((metric) => String(metric.epoch)),
  };
}

/**
 * Factory for the Lab 10 experiment. The training itself runs in the
 * `TrainingWorkerService` worker and streams one metric per epoch; the returned
 * observable updates the loss chart live and appends a final result carrying the
 * learned `w`, `b` and loss for the "Under the Hood" panel.
 */
export function createGradientDescentExperiment(
  worker: Pick<TrainingWorkerService, 'run'>,
): ExperimentFn {
  return (params, runtime) => {
    const learningRate = Number(params['lr'] ?? 0.003);
    const epochs = Math.min(200, Math.max(1, Number(params['epochs'] ?? 50)));
    const data = gradientDescentData();
    const history: TrainingMetric[] = [];

    return worker
      .run({ data, learningRate, epochs, epochDelayMs: 12 })
      .pipe(
        map((metric) => {
          history.push(metric);
          return {
            visualizationData: lossChart(
              history,
              `lr = ${learningRate} · época ${metric.epoch} · MSE = ${metric.loss.toFixed(
                4,
              )} · w = ${metric.w.toFixed(3)} · b = ${metric.b.toFixed(3)}`,
            ),
          };
        }),
        concatWith(defer(() => of(finalPanelResult(runtime, history, learningRate)))),
      );
  };
}

function finalPanelResult(
  runtime: Parameters<ExperimentFn>[1],
  history: readonly TrainingMetric[],
  learningRate: number,
): ExperimentResult {
  const last = history[history.length - 1];
  const w = last?.w ?? 0;
  const b = last?.b ?? 0;
  const loss = last?.loss ?? 0;
  const finalEpoch = last?.epoch ?? 0;

  const wTensor = runtime.createTensor([w], [1], 'float32', 'lab-10-w');
  const bTensor = runtime.createTensor([b], [1], 'float32', 'lab-10-b');
  const lossTensor = runtime.createTensor([loss], [1], 'float32', 'lab-10-loss');

  return {
    tensors: [wTensor, bTensor, lossTensor],
    visualizationData: lossChart(
      history,
      `Convergência: lr = ${learningRate} · ${finalEpoch} épocas · w = ${w.toFixed(
        3,
      )} · b = ${b.toFixed(3)} · MSE final = ${loss.toFixed(4)}`,
    ),
    codeSnippet: [
      '// Uma época:',
      'const dw = 2 * tf.mean(tf.mul(errors, xs));',
      'const db = 2 * tf.mean(errors);',
      `w -= ${learningRate} * dw;`,
      `b -= ${learningRate} * db;`,
    ].join('\n'),
  };
}
