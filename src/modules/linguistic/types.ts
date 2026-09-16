/**
 * Tipos del modulo linguistic.
 *
 * Ver ADR-003 (preservacion cultural) y ADR-005 (jerarquia territorial).
 * Las lenguas originarias se validan por hablantes nativos. No se
 * traducen de forma literal.
 */

export type EstadoValidacion = "pendiente" | "validada" | "rechazada";

export interface Hablante {
  readonly id: string;
  readonly tenantId: string;
  readonly nombre: string;
  readonly lenguaId: string;
  readonly varianteId: string;
  readonly comunidadReferencia: string;
  readonly acreditadoEn: string;
  readonly acreditadoPor: string;
}

export interface ValidacionLinguistica {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly hablanteId: string;
  readonly lenguaId: string;
  readonly varianteId: string;
  readonly estado: EstadoValidacion;
  readonly comentario: string | null;
  readonly creadaEn: string;
  readonly validadaEn: string | null;
  readonly rechazadaEn: string | null;
  readonly motivoRechazo: string | null;
}

export interface AcreditarHablanteInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nombre: string;
  readonly lenguaId: string;
  readonly varianteId: string;
  readonly comunidadReferencia: string;
  readonly acreditadoPor: string;
}

export interface ValidarInput {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly hablanteId: string;
  readonly lenguaId: string;
  readonly varianteId: string;
  readonly comentario?: string;
}

export interface FiltrosValidacion {
  readonly tenantId?: string;
  readonly expedienteId?: string;
  readonly estado?: EstadoValidacion;
  readonly hablanteId?: string;
}

export interface ResultadoLinguistico {
  readonly exito: boolean;
  readonly hablante?: Hablante;
  readonly validacion?: ValidacionLinguistica;
  readonly razon?: string;
}
