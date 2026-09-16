import { type Tenant } from "../../domain/tenant.js";
import { type ResultadoAcceso } from "./types.js";

/**
 * Reglas de negocio del modulo tenants.
 * Ver ADR-004: aislamiento estricto entre tenants.
 */

export function puedeOperar(tenant: Tenant): ResultadoAcceso {
  if (tenant.estado === "suspendido") {
    return { permitido: false, razon: "Tenant suspendido" };
  }
  if (tenant.estado === "archivado") {
    return { permitido: false, razon: "Tenant archivado" };
  }
  return { permitido: true };
}

export function puedeRecibirParticipacion(tenant: Tenant): ResultadoAcceso {
  const base = puedeOperar(tenant);
  if (!base.permitido) return base;

  if (!tenant.configuracion.permiteParticipacionCiudadana) {
    return {
      permitido: false,
      razon: "Participacion ciudadana deshabilitada para este tenant",
    };
  }
  return { permitido: true };
}

export function tenantsDistintos(a: Tenant, b: Tenant): boolean {
  return a.id !== b.id;
}
