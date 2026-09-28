import { type Etapa, type EtapaEspecial } from "./etapa.js";
import { type ActorRol } from "./actor.js";

export type EventoTipo =
  | "ingesta"
  | "normalizacion"
  | "clasificacion"
  | "editorial"
  | "verificacion"
  | "validacion-linguistica"
  | "decision"
  | "publicacion"
  | "devolucion"
  | "rechazo"
  | "preservacion";

export interface Evento {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly tipoEvento: EventoTipo;
  readonly etapaDesde: Etapa | EtapaEspecial | null;
  readonly etapaHasta: Etapa | EtapaEspecial;
  readonly actorUserId: string;
  readonly actorNombre: string;
  readonly actorRol: ActorRol;
  readonly timestamp: string;
  readonly razon: string | null;
  readonly metadata: Record<string, unknown>;
  readonly hashEvento: string;
  readonly hashAnterior: string | null;
  readonly creadoEn: string;
}

export function crearEvento(input: {
  id: string;
  expedienteId: string;
  tenantId: string;
  tipoEvento: EventoTipo;
  etapaDesde: Etapa | EtapaEspecial | null;
  etapaHasta: Etapa | EtapaEspecial;
  actorUserId: string;
  actorNombre: string;
  actorRol: ActorRol;
  razon?: string;
  metadata?: Record<string, unknown>;
  hashEvento: string;
  hashAnterior?: string;
}): Evento {
  if (!input.hashEvento.trim()) {
    throw new Error("Evento: el hashEvento es obligatorio");
  }
  if (input.etapaHasta === "RETURNED" && !input.razon) {
    throw new Error("Evento: las devoluciones requieren razon");
  }
  return {
    id: input.id,
    expedienteId: input.expedienteId,
    tenantId: input.tenantId,
    tipoEvento: input.tipoEvento,
    etapaDesde: input.etapaDesde,
    etapaHasta: input.etapaHasta,
    actorUserId: input.actorUserId,
    actorNombre: input.actorNombre,
    actorRol: input.actorRol,
    timestamp: new Date().toISOString(),
    razon: input.razon ?? null,
    metadata: input.metadata ?? {},
    hashEvento: input.hashEvento,
    hashAnterior: input.hashAnterior ?? null,
    creadoEn: new Date().toISOString(),
  };
}
