import { type Repository } from "../../persistence/types.js";
import { InMemoryRepository } from "../../persistence/in-memory.js";
import {
  validarCanal,
  validarIdDistribucion,
  validarContenido,
  validarMotivoRetiroDistribucion,
} from "./rules.js";
import {
  type Distribucion,
  type DistribuirInput,
  type FiltrosDistribucion,
  type ResultadoDistribucion,
} from "./types.js";

/**
 * Servicio de distribucion.
 *
 * Convierte un expediente aprobado en contenido adaptado a cada canal.
 * Registra versiones, permite retirar y aisla por tenant.
 */
export class DistributionService {
  constructor(
    private readonly repo: Repository<Distribucion> =
      new InMemoryRepository<Distribucion>()
  ) {}

  distribuir(input: DistribuirInput): ResultadoDistribucion {
    const validaciones = [
      validarIdDistribucion(input.id),
      validarCanal(input.canal),
      validarContenido({ titulo: input.titulo, cuerpo: input.cuerpo }),
    ];

    for (const v of validaciones) {
      if (!v.exito) return v;
    }

    if (this.repo.existe(input.id)) {
      return { exito: false, razon: "Distribucion ya existe: " + input.id };
    }

    const version = this.calcularVersion(input.expedienteId, input.canal);
    const ahora = new Date().toISOString();

    const distribucion: Distribucion = {
      id: input.id,
      expedienteId: input.expedienteId,
      tenantId: input.tenantId,
      canal: input.canal,
      version,
      titulo: input.titulo,
      cuerpo: input.cuerpo,
      estado: "activa",
      creadaEn: ahora,
      creadaPor: input.creadaPor,
      retiradaEn: null,
      motivoRetiro: null,
    };

    this.repo.guardar(distribucion);

    return { exito: true, distribucion };
  }

  obtenerDistribucion(id: string): Distribucion | null {
    return this.repo.obtener(id);
  }

  listarPorExpediente(expedienteId: string): Distribucion[] {
    return this.repo.listar().filter((d) => d.expedienteId === expedienteId);
  }

  listarPorTenant(tenantId: string): Distribucion[] {
    return this.repo.listar().filter((d) => d.tenantId === tenantId);
  }

  filtrar(filtros: FiltrosDistribucion): Distribucion[] {
    return this.repo.listar().filter((d) => {
      if (filtros.tenantId && d.tenantId !== filtros.tenantId) return false;
      if (filtros.expedienteId && d.expedienteId !== filtros.expedienteId) return false;
      if (filtros.canal && d.canal !== filtros.canal) return false;
      if (filtros.estado && d.estado !== filtros.estado) return false;
      return true;
    });
  }

  retirar(id: string, motivo: string): ResultadoDistribucion {
    const distribucion = this.repo.obtener(id);
    if (!distribucion) {
      return { exito: false, razon: "Distribucion no encontrada: " + id };
    }

    const validacionMotivo = validarMotivoRetiroDistribucion(motivo);
    if (!validacionMotivo.exito) return validacionMotivo;

    if (distribucion.estado === "retirada") {
      return { exito: false, razon: "La distribucion ya esta retirada" };
    }

    const actualizada: Distribucion = {
      ...distribucion,
      estado: "retirada",
      retiradaEn: new Date().toISOString(),
      motivoRetiro: motivo,
    };

    this.repo.guardar(actualizada);

    return { exito: true, distribucion: actualizada };
  }

  contar(): number {
    return this.repo.contar();
  }

  limpiar(): void {
    this.repo.limpiar();
  }

  private calcularVersion(expedienteId: string, canal: string): number {
    const previas = this.repo
      .listar()
      .filter((d) => d.expedienteId === expedienteId && d.canal === canal);
    return previas.length + 1;
  }
}
