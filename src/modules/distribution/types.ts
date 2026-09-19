/**
 * Tipos del modulo distribution.
 *
 * Ver ADR-001: solo se distribuye un expediente que paso por
 * decision humana. Ver ADR-006: no hay publicacion automatica.
 */

export type Canal =
  | "web"
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "radio-comunitaria"
  | "whatsapp-breve";

export type EstadoDistribucion = "activa" | "retirada";

export interface Distribucion {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly canal: Canal;
  readonly version: number;
  readonly titulo: string;
  readonly cuerpo: string;
  readonly estado: EstadoDistribucion;
  readonly creadaEn: string;
  readonly creadaPor: string;
  readonly retiradaEn: string | null;
  readonly motivoRetiro: string | null;
}

export interface DistribuirInput {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly canal: Canal;
  readonly titulo: string;
  readonly cuerpo: string;
  readonly creadaPor: string;
}

export interface FiltrosDistribucion {
  readonly tenantId?: string;
  readonly expedienteId?: string;
  readonly canal?: Canal;
  readonly estado?: EstadoDistribucion;
}

export interface ResultadoDistribucion {
  readonly exito: boolean;
  readonly distribucion?: Distribucion;
  readonly razon?: string;
}
