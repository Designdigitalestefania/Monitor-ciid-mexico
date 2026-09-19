import { type Expediente } from "../../domain/expediente.js";
import { type Distribucion } from "../distribution/types.js";
import { type ValidacionLinguistica } from "../linguistic/types.js";
import { type RegistroCiudadano } from "../citizen/types.js";
import {
  validarTenantId,
  validarRango,
  dentroDeRango,
} from "./rules.js";
import {
  type ConteoPorCanal,
  type ConteoPorEstado,
  type ConteoPorEtapa,
  type RangoFechas,
  type ResumenTenant,
  type ResultadoMetrica,
} from "./types.js";

export interface FuentesMetricas {
  readonly expedientes: readonly Expediente[];
  readonly distribuciones: readonly Distribucion[];
  readonly validaciones: readonly ValidacionLinguistica[];
  readonly reportesCiudadanos: readonly RegistroCiudadano[];
}

/**
 * Servicio de metricas y auditoria.
 *
 * No almacena datos propios: agrega y audita lo que producen los
 * otros modulos del sistema.
 */
export class MetricsService {
  constructor(private readonly fuentes: FuentesMetricas) {}

  resumenTenant(tenantId: string): ResumenTenant | null {
    const validacion = validarTenantId(tenantId);
    if (!validacion.exito) return null;

    const expedientes = this.fuentes.expedientes.filter(
      (e) => e.tenantId === tenantId
    );
    const distribuciones = this.fuentes.distribuciones.filter(
      (d) => d.tenantId === tenantId
    );
    const validaciones = this.fuentes.validaciones.filter(
      (v) => v.tenantId === tenantId
    );
    const reportes = this.fuentes.reportesCiudadanos.filter(
      (r) => r.tenantId === tenantId
    );

    return {
      tenantId,
      totalExpedientes: expedientes.length,
      expedientesPorEtapa: this.agruparPorEtapa(expedientes),
      totalDistribuciones: distribuciones.length,
      distribucionesPorCanal: this.agruparPorCanal(distribuciones),
      totalValidaciones: validaciones.length,
      validacionesPorEstado: this.agruparPorEstado(
        validaciones.map((v) => v.estado)
      ),
      totalReportesCiudadanos: reportes.length,
      reportesPorEstado: this.agruparPorEstado(
        reportes.map((r) => r.estado)
      ),
      generadoEn: new Date().toISOString(),
    };
  }

  conteoPorEtapa(tenantId: string): ConteoPorEtapa[] {
    const validacion = validarTenantId(tenantId);
    if (!validacion.exito) return [];
    const expedientes = this.fuentes.expedientes.filter(
      (e) => e.tenantId === tenantId
    );
    return this.agruparPorEtapa(expedientes);
  }

  conteoPorCanal(tenantId: string): ConteoPorCanal[] {
    const validacion = validarTenantId(tenantId);
    if (!validacion.exito) return [];
    const distribuciones = this.fuentes.distribuciones.filter(
      (d) => d.tenantId === tenantId
    );
    return this.agruparPorCanal(distribuciones);
  }

  conteoValidaciones(tenantId: string): ConteoPorEstado[] {
    const validacion = validarTenantId(tenantId);
    if (!validacion.exito) return [];
    const validaciones = this.fuentes.validaciones.filter(
      (v) => v.tenantId === tenantId
    );
    return this.agruparPorEstado(validaciones.map((v) => v.estado));
  }

  conteoCiudadano(tenantId: string): ConteoPorEstado[] {
    const validacion = validarTenantId(tenantId);
    if (!validacion.exito) return [];
    const reportes = this.fuentes.reportesCiudadanos.filter(
      (r) => r.tenantId === tenantId
    );
    return this.agruparPorEstado(reportes.map((r) => r.estado));
  }

  reportePorRango(
    tenantId: string,
    rango: RangoFechas
  ): ResultadoMetrica & { resumen?: ResumenTenant } {
    const validacionTenant = validarTenantId(tenantId);
    if (!validacionTenant.exito) return validacionTenant;

    const validacionRango = validarRango(rango);
    if (!validacionRango.exito) return validacionRango;

    const expedientes = this.fuentes.expedientes.filter(
      (e) => e.tenantId === tenantId && dentroDeRango(e.creadoEn, rango)
    );
    const distribuciones = this.fuentes.distribuciones.filter(
      (d) => d.tenantId === tenantId && dentroDeRango(d.creadaEn, rango)
    );
    const validaciones = this.fuentes.validaciones.filter(
      (v) => v.tenantId === tenantId && dentroDeRango(v.creadaEn, rango)
    );
    const reportes = this.fuentes.reportesCiudadanos.filter(
      (r) => r.tenantId === tenantId && dentroDeRango(r.creadoEn, rango)
    );

    const resumen: ResumenTenant = {
      tenantId,
      totalExpedientes: expedientes.length,
      expedientesPorEtapa: this.agruparPorEtapa(expedientes),
      totalDistribuciones: distribuciones.length,
      distribucionesPorCanal: this.agruparPorCanal(distribuciones),
      totalValidaciones: validaciones.length,
      validacionesPorEstado: this.agruparPorEstado(
        validaciones.map((v) => v.estado)
      ),
      totalReportesCiudadanos: reportes.length,
      reportesPorEstado: this.agruparPorEstado(
        reportes.map((r) => r.estado)
      ),
      generadoEn: new Date().toISOString(),
    };

    return { exito: true, resumen };
  }

  private agruparPorEtapa(items: readonly Expediente[]): ConteoPorEtapa[] {
    const conteo = new Map<string, number>();
    for (const item of items) {
      conteo.set(item.etapaActual, (conteo.get(item.etapaActual) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .map(([etapa, total]) => ({ etapa, total }))
      .sort((a, b) => a.etapa.localeCompare(b.etapa));
  }

  private agruparPorEstado(estados: readonly string[]): ConteoPorEstado[] {
    const conteo = new Map<string, number>();
    for (const estado of estados) {
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .map(([estado, total]) => ({ estado, total }))
      .sort((a, b) => a.estado.localeCompare(b.estado));
  }

  private agruparPorCanal(items: readonly Distribucion[]): ConteoPorCanal[] {
    const conteo = new Map<string, number>();
    for (const item of items) {
      conteo.set(item.canal, (conteo.get(item.canal) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .map(([canal, total]) => ({ canal, total }))
      .sort((a, b) => a.canal.localeCompare(b.canal));
  }
}

export type { Expediente, RangoFechas };
