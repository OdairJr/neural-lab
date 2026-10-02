import { Injectable } from '@angular/core';
import type { CodeViewMode } from '@domain/content';
import type { TensorSnapshot } from '@core/tfjs';

export interface CodeGenerationInput {
  operation: string;
  inputs: TensorSnapshot[];
  output?: TensorSnapshot;
  /**
   * TF.js code that actually produced the output. When supplied it takes
   * precedence over the generated `tf.<operation>(...)` call, because it is the
   * code that really ran (labs publish it through `ComputationEvent.code`).
   */
  code?: string;
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
    const supplied = input.code?.trim();
    if (supplied) {
      return this.fromSuppliedCode(supplied, input, mode);
    }
    if (mode === 'essential') {
      return this.generateEssential(input);
    }
    if (mode === 'full') {
      return this.generateFull(input);
    }
    return this.generateAnnotated(input);
  }

  /**
   * Presents the code a lab actually executed. The three detail levels still
   * differ: `essential` shows the snippet as-is, `annotated` appends the result
   * summary and `full` adds the TF.js import.
   */
  private fromSuppliedCode(
    code: string,
    input: CodeGenerationInput,
    mode: CodeViewMode,
  ): string {
    const comment = input.output ? `\n\n${resultComment(input.output)}` : '';
    if (mode === 'essential') {
      return code;
    }
    if (mode === 'full') {
      return ["import * as tf from '@tensorflow/tfjs';", '', code + comment].join('\n');
    }
    return code + comment;
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
