import {
  registrarTransicion,
  type Expediente,
} from "../../domain/expediente.js";
import { registrarActor, type Actor } from "../../domain/actor.js";
import { type Etapa } from "../../domain/etapa.js";
import {
  validarAvance,
  validarDevolucionDesde,
  validarRechazoDesde,
  validarActorParaDecision,
  validarRazon,
} from "./rules.js";
import {
  type AvanzarInput,
  type DevolverInput,
  type RechazarInput,
  type ResultadoPipeline,
  type EntradaHistorial,
} from "./types.js";

/**
 * Servicio de pipeline.
 *
 * Controla el avance de un expediente a traves de las etapas formales.
 * Ninguna transicion se ejecuta sin validacion previa.
 *
 * Regla dura: la etapa DECISION requiere actor humano con rol
 * periodista o editor. El sistema no puede saltarla.
 */
export class PipelineService {
  /**
   * Avanza un expediente a la siguiente etapa.
   * Valida la transicion segun las reglas del dominio.
   */
  avanzar(input: AvanzarInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    // Guard v1.1: no se puede avanzar desde una etapa especial
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede avanzar desde una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacion = validarAvance(expediente.etapaActual as Etapa, actor);
    if (!validacion.exito || !validacion.siguiente) {
      return validacion;
    }

    const actorRegistrado = registrarActor(actor);
    const actualizado = registrarTransicion(expediente, {
      hasta: validacion.siguiente,
      actor: actorRegistrado,
      razon: razon ?? "Avance de etapa",
    });

    return { exito: true, expediente: actualizado };
  }

  /**
   * Aprueba la publicacion de un expediente.
   * Requiere actor humano con rol periodista o editor.
   */
  aprobarPublicacion(input: AvanzarInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    const validacionActor = validarActorParaDecision(actor);
    if (!validacionActor.exito) return validacionActor;

    // Guard v1.1: etapa especial no permite aprobar
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede aprobar desde una etapa especial: " + expediente.etapaActual,
      };
    }

    if (expediente.etapaActual !== "DECISION") {
      return {
        exito: false,
        razon: "Solo se puede publicar desde la etapa DECISION",
      };
    }

    const actorRegistrado = registrarActor(actor);
    const actualizado = registrarTransicion(expediente, {
      hasta: "PUBLISHED",
      actor: actorRegistrado,
      razon: razon ?? "Aprobacion editorial",
    });

    return { exito: true, expediente: actualizado };
  }

  /**
   * Devuelve un expediente a edicion (RETURNED).
   * Solo permitido desde DECISION.
   */
  devolver(input: DevolverInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    // Guard v1.1: etapa especial no permite devolver
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede devolver desde una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacionEtapa = validarDevolucionDesde(expediente.etapaActual as Etapa);
    if (!validacionEtapa.exito) return validacionEtapa;

    const validacionRazon = validarRazon(razon);
    if (!validacionRazon.exito) return validacionRazon;

    const actorRegistrado = registrarActor(actor);
    const actualizado = registrarTransicion(expediente, {
      hasta: "EDITORIAL_REVIEW",
      actor: actorRegistrado,
      razon: "Devolucion: " + razon,
    });

    return { exito: true, expediente: actualizado };
  }

  /**
   * Rechaza un expediente definitivamente (REJECTED).
   * Solo permitido desde VERIFICATION o DECISION.
   */
  rechazar(input: RechazarInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    // Guard v1.1: etapa especial no permite rechazar de nuevo
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "Ya está en una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacionEtapa = validarRechazoDesde(expediente.etapaActual as Etapa);
    if (!validacionEtapa.exito) return validacionEtapa;

    const validacionRazon = validarRazon(razon);
    if (!validacionRazon.exito) return validacionRazon;

    const actorRegistrado = registrarActor(actor);
    const actualizado = registrarTransicion(expediente, {
      hasta: "PRESERVED",
      actor: actorRegistrado,
      razon: "Rechazo: " + razon,
    });

    return { exito: true, expediente: actualizado };
  }

  /**
   * Devuelve el historial completo de transiciones de un expediente.
   */
  historial(expediente: Expediente): EntradaHistorial[] {
    return expediente.transiciones.map((t) => ({
      desde: t.desde,
      hasta: t.hasta,
      actor: t.actor.nombre,
      rol: t.actor.rol,
      timestamp: t.timestamp,
      razon: t.razon,
    }));
  }

  /**
   * Devuelve la etapa actual del expediente.
   */
  etapaActual(expediente: Expediente) {
    return expediente.etapaActual;
  }
}

export type { Actor };
