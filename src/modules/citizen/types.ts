import { type TerritorioSnapshot } from "../../domain/territorio.js";
import { type LenguaSnapshot } from "../../domain/lengua.js";

// Re-export del dominio canónico
export type { Consentimiento } from "../../domain/aporte.js";

import { type Consentimiento } from "../../domain/aporte.js";

export type CanalCiudadano =
  | "whatsapp"
  | "correo"
  | "web"
  | "telefono"
  | "presencial";

export type EstadoReporte = "activo" | "vinculado" | "retirado";

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
