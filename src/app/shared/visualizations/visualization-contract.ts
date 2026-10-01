export interface VisualizationInteraction {
  /** Interaction kind, e.g. `hover`, `select`, `slice-change`. */
  type: string;
  /** Optional payload describing the interaction. */
  detail?: unknown;
}
