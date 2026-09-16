import { crearTenant, type Tenant } from "../../domain/tenant.js";
import { TenantRepository } from "./repository.js";
import { puedeOperar, puedeRecibirParticipacion } from "./rules.js";
import {
  type CrearTenantInput,
  type FiltrosTenant,
  type ResultadoAcceso,
} from "./types.js";

/**
 * Servicio de tenants.
 *
 * Interfaz publica del modulo. Toda operacion de negocio pasa por aqui.
 */
export class TenantsService {
  constructor(
    private readonly repo: TenantRepository = new TenantRepository()
  ) {}

  crear(input: CrearTenantInput): Tenant {
    if (this.repo.existe(input.id)) {
      throw new Error("Tenant ya existe: " + input.id);
    }
    const tenant = crearTenant(input);
    this.repo.guardar(tenant);
    return tenant;
  }

  obtenerPorId(id: string): Tenant | null {
    return this.repo.obtener(id);
  }

  listar(): Tenant[] {
    return this.repo.listar();
  }

  filtrar(filtros: FiltrosTenant): Tenant[] {
    return this.repo.listar().filter((t) => {
      if (filtros.tipo && t.tipo !== filtros.tipo) return false;
      if (filtros.estado && t.estado !== filtros.estado) return false;
      if (filtros.territorioId && t.territorioId !== filtros.territorioId) {
        return false;
      }
      return true;
    });
  }

  verificarOperacion(tenantId: string): ResultadoAcceso {
    const tenant = this.repo.obtener(tenantId);
    if (!tenant) {
      return { permitido: false, razon: "Tenant no encontrado" };
    }
    return puedeOperar(tenant);
  }

  verificarParticipacion(tenantId: string): ResultadoAcceso {
    const tenant = this.repo.obtener(tenantId);
    if (!tenant) {
      return { permitido: false, razon: "Tenant no encontrado" };
    }
    return puedeRecibirParticipacion(tenant);
  }

  cambiarEstado(tenantId: string, nuevoEstado: Tenant["estado"]): Tenant {
    const tenant = this.repo.obtener(tenantId);
    if (!tenant) {
      throw new Error("Tenant no encontrado: " + tenantId);
    }
    const actualizado: Tenant = { ...tenant, estado: nuevoEstado };
    this.repo.guardar(actualizado);
    return actualizado;
  }

  contar(): number {
    return this.repo.contar();
  }

  limpiar(): void {
    this.repo.limpiar();
  }
}
