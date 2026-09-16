import { type Expediente } from "../../domain/expediente.js";
import { type ResultadoPreservacion } from "./types.js";

/**
 * Reglas del modulo preservation.
 *
 * Ver ADR-003: solo se preservan expedientes que llegaron a PUBLISHED.
 * Un expediente preservado es inmutable.
 */

export function validarEtapaPreservable(
  expediente: Expediente
): ResultadoPreservacion {
  if (expediente.etapaActual !== "PUBLISHED") {
    return {
      exito: false,
      razon: "Solo se pueden preservar expedientes en etapa PUBLISHED",
    };
  }
  return { exito: true };
}

export function validarYaPreservado(
  expediente: Expediente
): ResultadoPreservacion {
  if (expediente.etapaActual === "PRESERVED") {
    return {
      exito: false,
      razon: "El expediente ya esta preservado",
    };
  }
  return { exito: true };
}

export function validarTieneTransiciones(
  expediente: Expediente
): ResultadoPreservacion {
  if (expediente.transiciones.length === 0) {
    return {
      exito: false,
      razon: "El expediente no tiene historial de transiciones",
    };
  }
  return { exito: true };
}

export function validarTerritorioPreservable(
  expediente: Expediente
): ResultadoPreservacion {
  if (!expediente.territorio.estado) {
    return {
      exito: false,
      razon: "El expediente no tiene territorio registrado",
    };
  }
  return { exito: true };
}
