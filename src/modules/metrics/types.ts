/**
 * Tipos del modulo metrics.
 *
 * Agrega y audita datos de los modulos ingest, distribution,
 * linguistic y citizen. No almacena nada propio.
 */

export interface ConteoPorEtapa {
  readonly etapa: string;
  readonly total: number;
}

export interface ConteoPorCanal {
  readonly canal: string;
  readonly total: number;
}

export interface ConteoPorEstado {
  readonly estado: string;
  readonly total: number;
}

export interface ResumenTenant {
  readonly tenantId: string;
  readonly totalExpedientes: number;
  readonly expedientesPorEtapa: readonly ConteoPorEtapa[];
  readonly totalDistribuciones: number;
  readonly distribucionesPorCanal: readonly ConteoPorCanal[];
  readonly totalValidaciones: number;
  readonly validacionesPorEstado: readonly ConteoPorEstado[];
  readonly totalReportesCiudadanos: number;
  readonly reportesPorEstado: readonly ConteoPorEstado[];
  readonly generadoEn: string;
}

export interface RangoFechas {
  readonly desde: string;
  readonly hasta: string;
}

export interface ResultadoMetrica {
  readonly exito: boolean;
  readonly razon?: string;
}
