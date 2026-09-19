import {
  type ResultadoMetrica,
  type RangoFechas,
} from "./types.js";

/**
 * Reglas del modulo metrics.
 */

export function validarTenantId(tenantId: string): ResultadoMetrica {
  if (!tenantId || tenantId.trim().length === 0) {
    return { exito: false, razon: "El tenantId no puede estar vacio" };
  }
  return { exito: true };
}

export function validarRango(rango: RangoFechas): ResultadoMetrica {
  if (!rango.desde || rango.desde.trim().length === 0) {
    return { exito: false, razon: "La fecha 'desde' es obligatoria" };
  }
  if (!rango.hasta || rango.hasta.trim().length === 0) {
    return { exito: false, razon: "La fecha 'hasta' es obligatoria" };
  }
  const desde = new Date(rango.desde).getTime();
  const hasta = new Date(rango.hasta).getTime();
  if (isNaN(desde) || isNaN(hasta)) {
    return { exito: false, razon: "Fechas invalidas" };
  }
  if (desde > hasta) {
    return { exito: false, razon: "'desde' no puede ser posterior a 'hasta'" };
  }
  return { exito: true };
}

export function dentroDeRango(
  fecha: string,
  rango: RangoFechas
): boolean {
  const t = new Date(fecha).getTime();
  const desde = new Date(rango.desde).getTime();
  const hasta = new Date(rango.hasta).getTime();
  return t >= desde && t <= hasta;
}
