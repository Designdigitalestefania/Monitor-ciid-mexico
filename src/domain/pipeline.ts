import { PIPELINE_STAGES, type PipelineStage } from "../index.js";

export interface PipelineValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Valida que una transición de estado sea legal dentro del pipeline CIID.
 *
 * Reglas duras:
 *   - Solo se puede avanzar una etapa a la vez.
 *   - DECISION requiere actor humano registrado.
 *   - Nunca se puede saltar de VERIFICATION a PUBLISHED sin pasar por DECISION.
 */
export function validateTransition(
  from: PipelineStage,
  to: PipelineStage,
  hasHumanActor: boolean = false
): PipelineValidation {
  const fromIdx = PIPELINE_STAGES.indexOf(from);
  const toIdx = PIPELINE_STAGES.indexOf(to);

  if (fromIdx === -1 || toIdx === -1) {
    return { valid: false, reason: "Etapa desconocida" };
  }

  if (toIdx !== fromIdx + 1) {
    return {
      valid: false,
      reason: "Solo se permite avanzar una etapa a la vez",
    };
  }

  if (to === "DECISION" && !hasHumanActor) {
    return {
      valid: false,
      reason: "DECISION requiere un actor humano registrado",
    };
  }

  return { valid: true };
}
