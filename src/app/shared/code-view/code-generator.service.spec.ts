import type { TensorSnapshot } from '@core/tfjs';
import { CodeGeneratorService } from './code-generator.service';

function snapshot(values: number[], shape: number[], overrides: Partial<TensorSnapshot> = {}): TensorSnapshot {
  return {
    values,
    shape,
    dtype: 'float32',
    size: values.length,
    truncated: false,
    stats: { min: 0, max: 0, mean: 0, std: 0 },
    ...overrides,
  };
}

describe('CodeGeneratorService', () => {
  const service = new CodeGeneratorService();
  const input = {
    operation: 'matMul',
    inputs: [snapshot([1, 2, 3, 4], [2, 2]), snapshot([1, 0], [2, 1])],
    output: snapshot([1, 3], [2, 1]),
  };

  it('generates a one-line essential snippet with the result comment', () => {
    const code = service.generate(input, 'essential');

    expect(code).toContain('const result = tf.matMul(A, B);');
    expect(code).toContain('shape [2, 1]');
  });

  it('generates an annotated snippet with tensor creation', () => {
    const code = service.generate(input, 'annotated');

    expect(code).toContain('const A = tf.tensor([1, 2, 3, 4], [2, 2], \'float32\');');
    expect(code).toContain('const B = tf.tensor([1, 0], [2, 1], \'float32\');');
    expect(code).toContain('// Operação');
  });

  it('generates a full snippet with imports and disposal', () => {
    const code = service.generate(input, 'full');

    expect(code).toContain("import * as tf from '@tensorflow/tfjs';");
    expect(code).toContain('result.print();');
    expect(code).toContain('result.dispose();');
    expect(code).toContain('A.dispose();');
    expect(code).toContain('B.dispose();');
  });

  it('marks truncated tensors instead of dumping every value', () => {
    const code = service.generate(
      { operation: 'sum', inputs: [snapshot([1, 2, 3], [3], { truncated: true, size: 500 })] },
      'annotated',
    );

    expect(code).toContain('[... 500 valores]');
  });

  describe('with lab-supplied code', () => {
    const withCode = {
      ...input,
      code: 'tf.browser.fromPixels(image).toFloat()',
    };

    it('prefers the code that actually ran over the generated call', () => {
      const code = service.generate(withCode, 'annotated');

      expect(code).toContain('tf.browser.fromPixels(image).toFloat()');
      expect(code).not.toContain('const result = tf.matMul(A, B);');
      expect(code).toContain('shape [2, 1]');
    });

    it('shows the supplied code unchanged in essential mode', () => {
      expect(service.generate(withCode, 'essential')).toBe(
        'tf.browser.fromPixels(image).toFloat()',
      );
    });

    it('adds the TF.js import in full mode', () => {
      const code = service.generate(withCode, 'full');

      expect(code).toContain("import * as tf from '@tensorflow/tfjs';");
      expect(code).toContain('tf.browser.fromPixels(image).toFloat()');
    });

    it('falls back to generation when the supplied code is blank', () => {
      const code = service.generate({ ...input, code: '   ' }, 'essential');

      expect(code).toContain('const result = tf.matMul(A, B);');
    });
  });
});
