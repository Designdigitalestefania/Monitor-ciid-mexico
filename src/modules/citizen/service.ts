import { type Repository } from "../../persistence/types.js";
import { InMemoryRepository } from "../../persistence/in-memory.js";
import {
  validarConsentimiento,
  validarIdReporte,
  validarMotivoRetiro,
  validarTerritorioCiudadano,
} from "./rules.js";
import {
  type FiltrosCiudadano,
  type RegistrarInput,
  type RegistroCiudadano,
  type ResultadoCiudadano,
} from "./types.js";

/**
 * Servicio de participacion ciudadana.
 *
 * Convierte un reporte ciudadano en un registro auditable con
 * consentimiento informado, canal, territorio y lenguas declaradas.
 */
export class CitizenService {
  constructor(
    private readonly repo: Repository<RegistroCiudadano> =
      new InMemoryRepository<RegistroCiudadano>()
  ) {}

  registrar(input: RegistrarInput): ResultadoCiudadano {
    const validaciones = [
      validarIdReporte(input.id),
      validarTerritorioCiudadano(input.territorio),
      validarConsentimiento(input.consentimiento),
    ];

    for (const v of validaciones) {
      if (!v.exito) return v;
    }

    if (this.repo.existe(input.id)) {
      return { exito: false, razon: "Reporte ya existe: " + input.id };
    }

    const ahora = new Date().toISOString();
    const registro: RegistroCiudadano = {
      id: input.id,
      tenantId: input.tenantId,
      canal: input.canal,
      territorio: input.territorio,
      lenguas: input.lenguas ?? [],
      consentimiento: input.consentimiento,
      estado: "activo",
      expedienteId: null,
      creadoEn: ahora,
      retiradoEn: null,
      motivoRetiro: null,
    };

    this.repo.guardar(registro);

    return { exito: true, registro };
  }

  obtenerPorId(id: string): RegistroCiudadano | null {
    return this.repo.obtener(id);
  }

  listar(): RegistroCiudadano[] {
    return this.repo.listar();
  }

  listarPorTenant(tenantId: string): RegistroCiudadano[] {
    return this.repo.listar().filter((r) => r.tenantId === tenantId);
  }

  filtrar(filtros: FiltrosCiudadano): RegistroCiudadano[] {
    return this.repo.listar().filter((r) => {
      if (filtros.tenantId && r.tenantId !== filtros.tenantId) return false;
      if (filtros.canal && r.canal !== filtros.canal) return false;
      if (filtros.estado && r.estado !== filtros.estado) return false;
      return true;
    });
  }

  vincularAExpediente(id: string, expedienteId: string): ResultadoCiudadano {
    const registro = this.repo.obtener(id);
    if (!registro) {
      return { exito: false, razon: "Reporte no encontrado: " + id };
    }
    if (registro.estado === "retirado") {
      return { exito: false, razon: "No se puede vincular un reporte retirado" };
    }

    const actualizado: RegistroCiudadano = {
      ...registro,
      estado: "vinculado",
      expedienteId,
    };

    this.repo.guardar(actualizado);

    return { exito: true, registro: actualizado };
  }

  retirar(id: string, motivo: string): ResultadoCiudadano {
    const registro = this.repo.obtener(id);
    if (!registro) {
      return { exito: false, razon: "Reporte no encontrado: " + id };
    }

    const validacionMotivo = validarMotivoRetiro(motivo);
    if (!validacionMotivo.exito) return validacionMotivo;

    if (registro.estado === "retirado") {
      return { exito: false, razon: "El reporte ya esta retirado" };
    }

    const actualizado: RegistroCiudadano = {
      ...registro,
      estado: "retirado",
      retiradoEn: new Date().toISOString(),
      motivoRetiro: motivo,
    };

    this.repo.guardar(actualizado);

    return { exito: true, registro: actualizado };
  }

  contar(): number {
    return this.repo.contar();
  }

  limpiar(): void {
    this.repo.limpiar();
  }
}
