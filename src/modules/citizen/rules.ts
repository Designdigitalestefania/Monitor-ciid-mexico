import { type ResultadoCiudadano, type Consentimiento } from "./types.js";

/**
 * Reglas del modulo citizen.
 *
 * Ver ADR-002 y docs/CONSENTIMIENTO-INFORMADO.md.
 */

export function validarConsentimiento(
  consentimiento: Consentimiento
): ResultadoCiudadano {
  if (!consentimiento.otorgado) {
    return {
      exito: false,
      razon: "El consentimiento informado es obligatorio",
    };
  }
  if (!consentimiento.fecha || consentimiento.fecha.trim().length === 0) {
    return {
      exito: false,
      razon: "El consentimiento debe incluir fecha",
    };
  }
  if (!consentimiento.usoInformativo && !consentimiento.usoPatrimonial) {
    return {
      exito: false,
      razon: "El consentimiento debe autorizar al menos un uso",
    };
  }
  return { exito: true };
}

export function validarIdReporte(id: string): ResultadoCiudadano {
  if (!id || id.trim().length === 0) {
    return { exito: false, razon: "El id no puede estar vacio" };
  }
  if (!id.startsWith("CIU-")) {
    return {
      exito: false,
      razon: "El id de reporte ciudadano debe iniciar con CIU-",
    };
  }
  return { exito: true };
}

export function validarTerritorioCiudadano(
  territorio: { estado?: string }
): ResultadoCiudadano {
  if (!territorio.estado || territorio.estado.trim().length === 0) {
    return {
      exito: false,
      razon: "El territorio debe incluir al menos estado",
    };
  }
  return { exito: true };
}

export function validarMotivoRetiro(motivo: string): ResultadoCiudadano {
  if (!motivo || motivo.trim().length === 0) {
    return {
      exito: false,
      razon: "El motivo de retiro es obligatorio",
    };
  }
  return { exito: true };
}
