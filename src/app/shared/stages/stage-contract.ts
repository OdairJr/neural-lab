import type { StageType } from '@domain/content';

/** Payload emitted when a stage is completed successfully. */
export interface StageCompletionEvent {
  type: StageType;
  index: number;
  /** `true` for validated stages (challenge/experiment), omitted otherwise. */
  success?: boolean;
}

/** Human-readable labels for the ten pedagogical stage types. */
export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  contextualizacao: 'Contextualização',
  conceito: 'Conceito',
  analogia: 'Analogia',
  'exemplo-visual': 'Exemplo visual',
  demonstracao: 'Demonstração',
  experimentacao: 'Experimentação',
  desafio: 'Desafio',
  explicacao: 'Explicação',
  codigo: 'Código',
  resumo: 'Resumo',
};
