export const ETAPAS = [
  "RECEIVED",
  "PROCESSING",
  "CLASSIFIED",
  "EDITORIAL_REVIEW",
  "VERIFICATION",
  "DECISION",
  "PUBLISHED",
  "PRESERVED",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export interface ValidacionTransicion {
  readonly valida: boolean;
  readonly razon?: string;
}

export function siguienteEtapa(actual: Etapa): Etapa | null {
  const idx = ETAPAS.indexOf(actual);
  if (idx === -1 || idx === ETAPAS.length - 1) return null;
  return ETAPAS[idx + 1];
}

export function validarTransicion(
  desde: Etapa,
  hasta: Etapa,
  tieneActorHumano: boolean = false
): ValidacionTransicion {
  const idxDesde = ETAPAS.indexOf(desde);
  const idxHasta = ETAPAS.indexOf(hasta);
  if (idxDesde === -1 || idxHasta === -1) {
    return { valida: false, razon: "Etapa desconocida" };
  }
  if (idxHasta !== idxDesde + 1) {
    return { valida: false, razon: "Solo se permite avanzar una etapa a la vez" };
  }
  if (hasta === "DECISION" && !tieneActorHumano) {
    return { valida: false, razon: "DECISION requiere actor humano" };
  }
  return { valida: true };
}

export function validarDevolucion(desde: Etapa): ValidacionTransicion {
  if (desde !== "DECISION") {
    return { valida: false, razon: "Solo desde DECISION" };
  }
  return { valida: true };
}

export function validarRechazo(desde: Etapa): ValidacionTransicion {
  if (desde !== "VERIFICATION" && desde !== "DECISION") {
    return { valida: false, razon: "Solo desde VERIFICATION o DECISION" };
  }
  return { valida: true };
}

export function esTerminal(etapa: Etapa | "RETURNED" | "REJECTED"): boolean {
  return etapa === "PRESERVED" || etapa === "REJECTED";
}
