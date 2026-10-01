import type { Concept as ConceptSchema } from '@domain/content';

/**
 * V1 concept glossary stubs.
 *
 * Phase 1 only needs the concept universe to exist so that lab configs can
 * reference concept ids and the build-time validator can check those
 * references. Rich definitions (analogies, formulas, TF.js APIs and
 * cross-references) are authored in Phase 6; this file is the single source of
 * truth for concept ids until then.
 *
 * The file is intentionally self-contained so the Node content validator can
 * import it directly with a `.ts` specifier.
 */

/** Compact `[id, title]` authoring format. */
const CONCEPT_SEEDS: readonly [string, string][] = [
  ['tensor', 'Tensor'],
  ['escalar', 'Escalar'],
  ['vetor', 'Vetor'],
  ['matriz', 'Matriz'],
  ['rank', 'Rank'],
  ['shape', 'Shape'],
  ['size', 'Size'],
  ['dtype', 'dtype'],
  ['reshape', 'reshape'],
  ['flatten', 'flatten'],
  ['expandDims', 'expandDims'],
  ['squeeze', 'squeeze'],
  ['operacoes-elementares', 'Operações elementares'],
  ['broadcasting', 'Broadcasting'],
  ['reducao', 'Redução'],
  ['media', 'Média'],
  ['soma', 'Soma'],
  ['eixo', 'Eixo (axis)'],
  ['transpose', 'transpose'],
  ['matMul', 'matMul'],
  ['produto-escalar', 'Produto escalar'],
  ['transformacao-linear', 'Transformação linear'],
  ['dataset', 'Dataset'],
  ['feature', 'Feature'],
  ['label', 'Label'],
  ['loss', 'Loss'],
  ['epoca', 'Época'],
  ['batch', 'Batch'],
  ['learning-rate', 'Learning rate'],
  ['regressao-linear', 'Regressão linear'],
  ['mse', 'MSE'],
  ['predicao', 'Predição'],
  ['gradiente', 'Gradiente'],
  ['convergencia', 'Convergência'],
  ['minimo-local', 'Mínimo local'],
  ['neuronio', 'Neurônio'],
  ['peso', 'Peso'],
  ['bias', 'Bias'],
  ['soma-ponderada', 'Soma ponderada'],
  ['ativacao', 'Ativação'],
  ['sigmoid', 'Sigmoid'],
  ['relu', 'ReLU'],
  ['tanh', 'Tanh'],
  ['softmax', 'Softmax'],
  ['derivada', 'Derivada'],
  ['camada', 'Camada'],
  ['forward-propagation', 'Forward propagation'],
  ['backpropagation', 'Backpropagation'],
  ['treino', 'Treino'],
  ['classificacao', 'Classificação'],
  ['fronteira-de-decisao', 'Fronteira de decisão'],
  ['xor', 'XOR'],
  ['imagem', 'Imagem'],
  ['rgb', 'RGB'],
  ['grayscale', 'Grayscale'],
  ['normalizacao', 'Normalização'],
  ['memoria', 'Memória'],
  ['dispose', 'dispose'],
  ['tidy', 'tidy'],
  ['vazamento', 'Vazamento de memória'],
];

/** All concept definitions, in authoring order. */
export const CONCEPTS: readonly ConceptSchema[] = CONCEPT_SEEDS.map(([id, title]) => ({
  id,
  title,
  shortDefinition: title,
  fullDefinition: title,
  tfjsApi: [],
  relatedConcepts: [],
  introducedInLab: '',
  reinforcedInLabs: [],
}));

/** Set of every known concept id, for O(1) reference validation. */
export const CONCEPT_IDS: ReadonlySet<string> = new Set(CONCEPTS.map((concept) => concept.id));
