import {
  type Tenant,
  type TenantTipo,
  type TenantEstado,
} from "../../domain/tenant.js";

export interface FiltrosTenant {
  readonly tipo?: TenantTipo;
  readonly estado?: TenantEstado;
  readonly territorioId?: string;
}

export interface ResultadoAcceso {
  readonly permitido: boolean;
  readonly razon?: string;
}

export interface CrearTenantInput {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TenantTipo;
  readonly territorioId: string;
}

export type { Tenant };
