import { type Tenant } from "../../domain/tenant.js";
import { type TerritorioSnapshot } from "../../domain/territorio.js";
import { type ResultadoIngest } from "./types.js";
import { puedeOperar, puedeRecibirParticipacion } from "../tenants/rules.js";

/**
 * Reglas de negocio del modulo ingest.
 * Ver ADR-002 (participacion ciudadana) y ADR-005 (territorio).
 */

export function validarTenantParaOrigen(
  tenant: Tenant,
  origen: "ciudadania" | "institucional" | "interno"
): ResultadoIngest {
  const operacion = puedeOperar(tenant);
  if (!operacion.permitido) {
    return { exito: false, razon: operacion.razon };
  }

  if (origen === "ciudadania") {
    const participacion = puedeRecibirParticipacion(tenant);
    if (!participacion.permitido) {
      return { exito: false, razon: participacion.razon };
    }
  }

  return { exito: true };
}

export function validarTerritorio(
  territorio: TerritorioSnapshot
): ResultadoIngest {
  if (!territorio.estado || territorio.estado.trim().length === 0) {
    return { exito: false, razon: "El territorio debe incluir estado" };
  }
  return { exito: true };
}

export function validarId(id: string): ResultadoIngest {
  if (!id || id.trim().length === 0) {
    return { exito: false, razon: "El id no puede estar vacio" };
  }
  if (!id.startsWith("CIID-")) {
    return { exito: false, razon: "El id debe iniciar con CIID-" };
  }
  return { exito: true };
}
