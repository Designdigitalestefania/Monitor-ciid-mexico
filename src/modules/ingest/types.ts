import {
  type Expediente,
  type ExpedienteOrigen,
} from "../../domain/expediente.js";
import { type Etapa } from "../../domain/etapa.js";
import { type TerritorioSnapshot } from "../../domain/territorio.js";

export interface RecibirInput {
  readonly id: string;
  readonly tenantId: string;
  readonly origen: ExpedienteOrigen;
  readonly territorio: TerritorioSnapshot;
}

export interface FiltrosIngest {
  readonly tenantId?: string;
  readonly origen?: ExpedienteOrigen;
  readonly etapa?: Etapa;
}

export interface ResultadoIngest {
  readonly exito: boolean;
  readonly expediente?: Expediente;
  readonly razon?: string;
}

export type { Expediente };
