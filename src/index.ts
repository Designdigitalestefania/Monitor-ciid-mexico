/**
 * MONITOR CIID · Centro Inteligente de Información Digital
 *
 * Punto de entrada del paquete fundacional.
 *
 * Principio rector:
 *   "La tecnología asiste. El periodista decide."
 */

export const CIID_VERSION = "0.1.0";

export interface CiidInfo {
  name: string;
  version: string;
  motto: string;
  principle: string;
}

export const ciid: CiidInfo = {
  name: "MONITOR CIID",
  version: CIID_VERSION,
  motto: "Innovar para informar. Digitalizar para preservar.",
  principle: "La tecnología asiste. El periodista decide.",
};

/**
 * Etapas formales del pipeline CIID.
 * El orden refleja el flujo obligatorio del sistema.
 */
export const PIPELINE_STAGES = [
  "RECEIVED",
  "PROCESSING",
  "CLASSIFIED",
  "EDITORIAL_REVIEW",
  "VERIFICATION",
  "DECISION",
  "PUBLISHED",
  "PRESERVED",
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

/**
 * Devuelve la siguiente etapa del pipeline.
 * La etapa DECISION es un punto obligatorio: nunca se salta.
 */
export function nextStage(current: PipelineStage): PipelineStage | null {
  const idx = PIPELINE_STAGES.indexOf(current);
  if (idx === -1 || idx === PIPELINE_STAGES.length - 1) return null;
  return PIPELINE_STAGES[idx + 1];
}
