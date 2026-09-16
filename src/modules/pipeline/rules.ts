import {
  validarTransicion,
  validarDevolucion,
  validarRechazo,
  siguienteEtapa,
  type Etapa,
} from "../../domain/etapa.js";
import { puedeDecidirPublicacion, type Actor } from "../../domain/actor.js";
import { type ResultadoPipeline } from "./types.js";

/**
 * Reglas del modulo pipeline.
 *
 * Ver ADR-001 (decision humana) y ADR-006 (no publicacion automatica).
 */

export function validarAvance(
  desde: Etapa,
  actor: Actor
): ResultadoPipeline & { siguiente?: Etapa } {
  const siguiente = siguienteEtapa(desde);
  if (!siguiente) {
    return { exito: false, razon: "El expediente ya esta en su etapa final" };
  }

  const tieneActorHumano = puedeDecidirPublicacion(actor);
  const resultado = validarTransicion(desde, siguiente, tieneActorHumano);

  if (!resultado.valida) {
    return { exito: false, razon: resultado.razon };
  }

  return { exito: true, siguiente };
}

export function validarDevolucionDesde(desde: Etapa): ResultadoPipeline {
  const r = validarDevolucion(desde);
  if (!r.valida) {
    return { exito: false, razon: r.razon };
  }
  return { exito: true };
}

export function validarRechazoDesde(desde: Etapa): ResultadoPipeline {
  const r = validarRechazo(desde);
  if (!r.valida) {
    return { exito: false, razon: r.razon };
  }
  return { exito: true };
}

export function validarActorParaDecision(actor: Actor): ResultadoPipeline {
  if (!puedeDecidirPublicacion(actor)) {
    return {
      exito: false,
      razon: "Solo periodistas o editores pueden decidir publicacion",
    };
  }
  return { exito: true };
}

export function validarRazon(razon: string): ResultadoPipeline {
  if (!razon || razon.trim().length === 0) {
    return { exito: false, razon: "La razon es obligatoria" };
  }
  return { exito: true };
}
