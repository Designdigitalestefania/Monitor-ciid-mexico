import { type Etapa, type EtapaEspecial } from "./etapa.js";
import { type TerritorioSnapshot } from "./territorio.js";
import { type LenguaSnapshot } from "./lengua.js";
import { type ActorRegistro } from "./actor.js";

export type ExpedienteOrigen = "ciudadania" | "institucional" | "interno";
export type ExpedienteEstado = "activo" | "cerrado" | "archivado";

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
  readonly etapaActual: Etapa | EtapaEspecial;
  readonly estado: ExpedienteEstado;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas: readonly LenguaSnapshot[];
  readonly expedienteRelacionadoId: string | null;
  readonly metadataExtra: Record<string, unknown>;
  readonly transiciones: readonly ExpedienteTransicion[];
  readonly creadoEn: string;
  readonly actualizadoEn: string;
  readonly cerradoEn: string | null;
}

export function generarIdPublico(year: number, secuencial: number): string {
  if (year < 2020 || year > 2200) {
    throw new Error("Expediente: anio fuera de rango razonable");
  }
  if (secuencial < 1 || secuencial > 9999) {
    throw new Error("Expediente: el secuencial debe estar entre 1 y 9999");
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
  expedienteRelacionadoId?: string;
  metadataExtra?: Record<string, unknown>;
}): Expediente {
  if (!input.id || input.id.trim().length === 0) {
    throw new Error("Expediente: el id no puede estar vacio");
  }
  if (!input.tenantId || input.tenantId.trim().length === 0) {
    throw new Error("Expediente: el tenantId no puede estar vacio");
  }
  if (!input.territorio.estado) {
    throw new Error("Expediente: el territorio debe incluir al menos estado");
  }
  const ahora = new Date().toISOString();
  return {
    id: input.id,
    idInterno: generarIdInterno(),
    tenantId: input.tenantId,
    origen: input.origen,
    etapaActual: "RECEIVED",
    estado: "activo",
    territorio: input.territorio,
    lenguas: input.lenguas ?? [],
    expedienteRelacionadoId: input.expedienteRelacionadoId ?? null,
    metadataExtra: input.metadataExtra ?? {},
    transiciones: [],
    creadoEn: ahora,
    actualizadoEn: ahora,
    cerradoEn: null,
  };
}

export function registrarTransicion(
  exp: Expediente,
  input: { hasta: Etapa; actor: ActorRegistro; razon?: string }
): Expediente {
  const transicion: ExpedienteTransicion = {
    desde: exp.etapaActual as Etapa,
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

export function cerrarExpediente(exp: Expediente): Expediente {
  if (exp.estado === "cerrado") {
    throw new Error("Expediente: ya esta cerrado");
  }
  const ahora = new Date().toISOString();
  return { ...exp, estado: "cerrado", cerradoEn: ahora, actualizadoEn: ahora };
}

export function archivarExpediente(exp: Expediente): Expediente {
  if (exp.estado === "archivado") {
    throw new Error("Expediente: ya esta archivado");
  }
  return { ...exp, estado: "archivado", actualizadoEn: new Date().toISOString() };
}

export function expedientePerteneceATenant(exp: Expediente, tenantId: string): boolean {
  return exp.tenantId === tenantId;
}

export function esExpedientePreservado(exp: Expediente): boolean {
  return exp.etapaActual === "PRESERVED";
}

export function aceptaNuevosEventos(exp: Expediente): boolean {
  return exp.estado === "activo" && exp.etapaActual !== "PRESERVED";
}
