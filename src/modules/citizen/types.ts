import { type TerritorioSnapshot } from "../../domain/territorio.js";
import { type LenguaSnapshot } from "../../domain/lengua.js";

/**
 * Tipos del modulo citizen.
 *
 * Ver ADR-002: participacion ciudadana como fuente de primera clase.
 */

export type CanalCiudadano =
  | "whatsapp"
  | "correo"
  | "web"
  | "telefono"
  | "presencial";

export type EstadoReporte = "activo" | "vinculado" | "retirado";

export interface Consentimiento {
  readonly otorgado: boolean;
  readonly fecha: string;
  readonly usoInformativo: boolean;
  readonly usoPatrimonial: boolean;
}

export interface RegistroCiudadano {
  readonly id: string;
  readonly tenantId: string;
  readonly canal: CanalCiudadano;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas: readonly LenguaSnapshot[];
  readonly consentimiento: Consentimiento;
  readonly estado: EstadoReporte;
  readonly expedienteId: string | null;
  readonly creadoEn: string;
  readonly retiradoEn: string | null;
  readonly motivoRetiro: string | null;
}

export interface RegistrarInput {
  readonly id: string;
  readonly tenantId: string;
  readonly canal: CanalCiudadano;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas?: LenguaSnapshot[];
  readonly consentimiento: Consentimiento;
}

export interface FiltrosCiudadano {
  readonly tenantId?: string;
  readonly canal?: CanalCiudadano;
  readonly estado?: EstadoReporte;
}

export interface ResultadoCiudadano {
  readonly exito: boolean;
  readonly registro?: RegistroCiudadano;
  readonly razon?: string;
}

export type { TerritorioSnapshot, LenguaSnapshot };
