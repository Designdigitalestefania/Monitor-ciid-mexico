import { type Etapa } from "./etapa.js";
import { type TerritorioSnapshot } from "./territorio.js";
import { type LenguaSnapshot } from "./lengua.js";
import { type ActorRegistro } from "./actor.js";

export type ExpedienteOrigen = "ciudadania" | "institucional" | "interno";

export interface ExpedienteTransicion {
  readonly desde: Etapa;
  readonly hasta: Etapa;
  readonly actor: ActorRegistro;
  readonly timestamp: string;
  readonly razon?: string;
}

export interface Expediente {
  readonly id: string;
  readonly idInterno: string;
  readonly tenantId: string;
  readonly origen: ExpedienteOrigen;
  readonly etapaActual: Etapa;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas: readonly LenguaSnapshot[];
  readonly transiciones: readonly ExpedienteTransicion[];
  readonly creadoEn: string;
  readonly actualizadoEn: string;
}

export function generarIdPublico(year: number, secuencial: number): string {
  if (year < 2020 || year > 2200) {
    throw new Error("Expediente: anio fuera de rango");
  }
  if (secuencial < 1 || secuencial > 9999) {
    throw new Error("Expediente: secuencial entre 1 y 9999");
  }
  return "CIID-" + year + "-" + secuencial.toString().padStart(4, "0");
}

export function generarIdInterno(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  return "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

export function crearExpediente(input: {
  id: string;
  tenantId: string;
  origen: ExpedienteOrigen;
  territorio: TerritorioSnapshot;
  lenguas?: LenguaSnapshot[];
}): Expediente {
  if (!input.id || input.id.trim().length === 0) {
    throw new Error("Expediente: id vacio");
  }
  if (!input.tenantId || input.tenantId.trim().length === 0) {
    throw new Error("Expediente: tenantId vacio");
  }
  if (!input.territorio.estado) {
    throw new Error("Expediente: territorio requiere estado");
  }
  const ahora = new Date().toISOString();
  return {
    id: input.id,
    idInterno: generarIdInterno(),
    tenantId: input.tenantId,
    origen: input.origen,
    etapaActual: "RECEIVED",
    territorio: input.territorio,
    lenguas: input.lenguas ?? [],
    transiciones: [],
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

export function registrarTransicion(
  exp: Expediente,
  input: { hasta: Etapa; actor: ActorRegistro; razon?: string }
): Expediente {
  const transicion: ExpedienteTransicion = {
    desde: exp.etapaActual,
    hasta: input.hasta,
    actor: input.actor,
    timestamp: new Date().toISOString(),
    razon: input.razon,
  };
  return {
    ...exp,
    etapaActual: input.hasta,
    transiciones: [...exp.transiciones, transicion],
    actualizadoEn: transicion.timestamp,
  };
}

export function expedientePerteneceATenant(
  exp: Expediente,
  tenantId: string
): boolean {
  return exp.tenantId === tenantId;
}
