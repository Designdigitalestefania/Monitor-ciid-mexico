import {
  crearExpediente,
  registrarTransicion,
  type Expediente,
} from "../../domain/expediente.js";
import { crearActor, registrarActor } from "../../domain/actor.js";
import { type Tenant } from "../../domain/tenant.js";
import { type Repository } from "../../persistence/types.js";
import { InMemoryRepository } from "../../persistence/in-memory.js";
import {
  validarId,
  validarTenantParaOrigen,
  validarTerritorio,
} from "./rules.js";
import {
  type FiltrosIngest,
  type RecibirInput,
  type ResultadoIngest,
} from "./types.js";

/**
 * Servicio de ingesta.
 *
 * Puerta de entrada del pipeline CIID. Convierte informacion entrante
 * en un expediente en estado RECEIVED, con trazabilidad completa.
 *
 * Consume Repository<Expediente>: la persistencia (memoria o SQLite)
 * se inyecta en la construccion sin cambiar esta logica.
 */
export class IngestService {
  constructor(
    private readonly repo: Repository<Expediente> = new InMemoryRepository<Expediente>()
  ) {}

  recibir(input: RecibirInput, tenant: Tenant): ResultadoIngest {
    const validacionId = validarId(input.id);
    if (!validacionId.exito) return validacionId;

    if (this.repo.existe(input.id)) {
      return { exito: false, razon: "Expediente ya existe: " + input.id };
    }

    const validacionTenant = validarTenantParaOrigen(tenant, input.origen);
    if (!validacionTenant.exito) return validacionTenant;

    const validacionTerritorio = validarTerritorio(input.territorio);
    if (!validacionTerritorio.exito) return validacionTerritorio;

    const expediente = crearExpediente({
      id: input.id,
      tenantId: input.tenantId,
      origen: input.origen,
      territorio: input.territorio,
    });

    const actorSistema = registrarActor(
      crearActor({
        userId: "sistema",
        nombre: "Sistema CIID",
        rol: "sistema",
        tenantId: input.tenantId,
      })
    );

    const expedienteFinal = registrarTransicion(expediente, {
      hasta: "PROCESSING",
      actor: actorSistema,
      razon: "Ingesta automatica",
    });

    this.repo.guardar(expedienteFinal);

    return { exito: true, expediente: expedienteFinal };
  }

  obtenerPorId(id: string): Expediente | null {
    return this.repo.obtener(id);
  }

  listar(): Expediente[] {
    return this.repo.listar();
  }

  listarPorTenant(tenantId: string): Expediente[] {
    return this.repo
      .listar()
      .filter((e) => e.tenantId === tenantId);
  }

  filtrar(filtros: FiltrosIngest): Expediente[] {
    return this.repo.listar().filter((e) => {
      if (filtros.tenantId && e.tenantId !== filtros.tenantId) return false;
      if (filtros.origen && e.origen !== filtros.origen) return false;
      if (filtros.etapa && e.etapaActual !== filtros.etapa) return false;
      return true;
    });
  }

  contar(): number {
    return this.repo.contar();
  }

  limpiar(): void {
    this.repo.limpiar();
  }
}
