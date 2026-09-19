import { type Expediente } from "../../domain/expediente.js";
import { type TerritorioSnapshot } from "../../domain/territorio.js";
import { type LenguaSnapshot } from "../../domain/lengua.js";
import { type Actor } from "../../domain/actor.js";

/**
 * Tipos del modulo preservation.
 *
 * Ver ADR-003: la preservacion es la ultima etapa del pipeline,
 * no un agregado posterior.
 */

export interface RegistroPatrimonial {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly preservadoEn: string;
  readonly preservadoPor: string;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas: readonly LenguaSnapshot[];
  readonly hashDocumental: string;
  readonly version: string;
  readonly totalTransiciones: number;
}

export interface ResultadoPreservacion {
  readonly exito: boolean;
  readonly expediente?: Expediente;
  readonly registro?: RegistroPatrimonial;
  readonly razon?: string;
}

export interface PreservarInput {
  readonly expediente: Expediente;
  readonly actor: Actor;
}

export type { Expediente, Actor, TerritorioSnapshot, LenguaSnapshot };
