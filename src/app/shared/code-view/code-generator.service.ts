import { Injectable } from '@angular/core';
import type { CodeViewMode } from '@domain/content';
import type { TensorSnapshot } from '@core/tfjs';

export interface CodeGenerationInput {
  operation: string;
  inputs: TensorSnapshot[];
  output?: TensorSnapshot;
}

const INPUT_NAMES = ['A', 'B', 'C', 'D', 'E'];

function tensorLiteral(snapshot: TensorSnapshot): string {
  const values = snapshot.truncated
    ? `[... ${snapshot.size} valores]`
    : `[${snapshot.values.join(', ')}]`;
  return `tf.tensor(${values}, [${snapshot.shape.join(', ')}], '${snapshot.dtype}')`;
}

function inputName(index: number): string {
  return INPUT_NAMES[index] ?? `input${index}`;
}

function callExpression(operation: string, inputs: TensorSnapshot[]): string {
  const args = inputs.map((_, index) => inputName(index)).join(', ');
  return `tf.${operation}(${args})`;
}

function resultComment(output: TensorSnapshot | undefined): string {
  if (!output) {
    return '// Resultado indisponível';
  }
  return `// Resultado: shape [${output.shape.join(', ')}], dtype ${output.dtype}`;
}

/**
 * Generates TypeScript snippets from an executed tensor operation for the
 * "Under the Hood" panel. Three detail levels are supported: `essential`
 * (one-liner), `annotated` (with tensor creation and comments) and `full`
 * (with imports, printing and disposal).
 */
@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  generate(input: CodeGenerationInput, mode: CodeViewMode = 'annotated'): string {
    if (mode === 'essential') {
      return this.generateEssential(input);
    }
    if (mode === 'full') {
      return this.generateFull(input);
    }
    return this.generateAnnotated(input);
  }

  private generateEssential(input: CodeGenerationInput): string {
    return `${resultComment(input.output)}\nconst result = ${callExpression(
      input.operation,
      input.inputs,
    )};`;
  }

  private generateAnnotated(input: CodeGenerationInput): string {
    const lines: string[] = ['// Tensores de entrada'];
    input.inputs.forEach((snapshot, index) => {
      lines.push(`const ${inputName(index)} = ${tensorLiteral(snapshot)};`);
    });
    lines.push('', '// Operação');
    lines.push(`const result = ${callExpression(input.operation, input.inputs)};`);
    lines.push('', resultComment(input.output));
    return lines.join('\n');
  }

  private generateFull(input: CodeGenerationInput): string {
    const lines: string[] = ["import * as tf from '@tensorflow/tfjs';", ''];
    input.inputs.forEach((snapshot, index) => {
      lines.push(`const ${inputName(index)} = ${tensorLiteral(snapshot)};`);
    });
    lines.push('', `const result = ${callExpression(input.operation, input.inputs)};`);
    lines.push(resultComment(input.output));
    lines.push('');
    lines.push('result.print();');
    lines.push('');
    lines.push('// Libera a memória explicitamente');
    lines.push('result.dispose();');
    input.inputs.forEach((_, index) => {
      lines.push(`${inputName(index)}.dispose();`);
    });
    return lines.join('\n');
  }
}
