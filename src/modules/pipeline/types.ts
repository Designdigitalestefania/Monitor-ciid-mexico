import { type Etapa } from "../../domain/etapa.js";
import { type Expediente } from "../../domain/expediente.js";
import { type Actor } from "../../domain/actor.js";

/**
 * Tipos del modulo pipeline.
 *
 * Ver ADR-001 y ADR-006: el flujo es lineal, no se salta etapas,
 * y DECISION requiere actor humano.
 */

export interface ResultadoPipeline {
  readonly exito: boolean;
  readonly expediente?: Expediente;
  readonly razon?: string;
}

export interface AvanzarInput {
  readonly expediente: Expediente;
  readonly actor: Actor;
  readonly razon?: string;
}

export interface DevolverInput {
  readonly expediente: Expediente;
  readonly actor: Actor;
  readonly razon: string;
}

export interface RechazarInput {
  readonly expediente: Expediente;
  readonly actor: Actor;
  readonly razon: string;
}

export interface EntradaHistorial {
  readonly desde: Etapa;
  readonly hasta: Etapa;
  readonly actor: string;
  readonly rol: string;
  readonly timestamp: string;
  readonly razon?: string;
}

export type { Etapa, Expediente, Actor };
