import {
  type ResultadoLinguistico,
  type AcreditarHablanteInput,
  type ValidarInput,
  type Hablante,
} from "./types.js";

/**
 * Reglas del modulo linguistic.
 *
 * Ver ADR-003 y ADR-005. Una validacion linguistica requiere un
 * hablante acreditado que hable la variante especifica de la lengua.
 */

export function validarIdHablante(id: string): ResultadoLinguistico {
  if (!id || id.trim().length === 0) {
    return { exito: false, razon: "El id de hablante no puede estar vacio" };
  }
  if (!id.startsWith("HAB-")) {
    return {
      exito: false,
      razon: "El id de hablante debe iniciar con HAB-",
    };
  }
  return { exito: true };
}

export function validarIdValidacion(id: string): ResultadoLinguistico {
  if (!id || id.trim().length === 0) {
    return { exito: false, razon: "El id de validacion no puede estar vacio" };
  }
  if (!id.startsWith("VAL-")) {
    return {
      exito: false,
      razon: "El id de validacion debe iniciar con VAL-",
    };
  }
  return { exito: true };
}

export function validarAcreditacion(
  input: AcreditarHablanteInput
): ResultadoLinguistico {
  if (!input.nombre || input.nombre.trim().length === 0) {
    return {
      exito: false,
      razon: "El nombre del hablante no puede estar vacio",
    };
  }
  if (!input.lenguaId || input.lenguaId.trim().length === 0) {
    return { exito: false, razon: "La lengua es obligatoria" };
  }
  if (!input.varianteId || input.varianteId.trim().length === 0) {
    return { exito: false, razon: "La variante es obligatoria" };
  }
  if (!input.comunidadReferencia || input.comunidadReferencia.trim().length === 0) {
    return {
      exito: false,
      razon: "La comunidad de referencia es obligatoria",
    };
  }
  if (!input.acreditadoPor || input.acreditadoPor.trim().length === 0) {
    return {
      exito: false,
      razon: "El acreditador es obligatorio",
    };
  }
  return { exito: true };
}

export function validarValidacion(
  input: ValidarInput,
  hablante: Hablante
): ResultadoLinguistico {
  if (!input.expedienteId || input.expedienteId.trim().length === 0) {
    return {
      exito: false,
      razon: "El expediente es obligatorio",
    };
  }
  if (
    hablante.lenguaId !== input.lenguaId ||
    hablante.varianteId !== input.varianteId
  ) {
    return {
      exito: false,
      razon:
        "El hablante no esta acreditado para esta lengua y variante",
    };
  }
  return { exito: true };
}

export function validarMotivoRechazo(motivo: string): ResultadoLinguistico {
  if (!motivo || motivo.trim().length === 0) {
    return {
      exito: false,
      razon: "El motivo de rechazo es obligatorio",
    };
  }
  return { exito: true };
}
