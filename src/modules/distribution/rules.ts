import {
  type ResultadoDistribucion,
  type Canal,
} from "./types.js";

/**
 * Reglas del modulo distribution.
 *
 * Ver ADR-001 y ADR-006: solo se distribuye lo que paso por
 * decision editorial humana.
 */

export const CANALES_VALIDOS: readonly Canal[] = [
  "web",
  "facebook",
  "instagram",
  "x",
  "youtube",
  "radio-comunitaria",
  "whatsapp-breve",
];

export function validarCanal(canal: string): ResultadoDistribucion {
  if (!CANALES_VALIDOS.includes(canal as Canal)) {
    return {
      exito: false,
      razon: "Canal no valido: " + canal,
    };
  }
  return { exito: true };
}

export function validarIdDistribucion(id: string): ResultadoDistribucion {
  if (!id || id.trim().length === 0) {
    return { exito: false, razon: "El id no puede estar vacio" };
  }
  if (!id.startsWith("DIS-")) {
    return {
      exito: false,
      razon: "El id de distribucion debe iniciar con DIS-",
    };
  }
  return { exito: true };
}

export function validarContenido(input: {
  titulo: string;
  cuerpo: string;
}): ResultadoDistribucion {
  if (!input.titulo || input.titulo.trim().length === 0) {
    return { exito: false, razon: "El titulo no puede estar vacio" };
  }
  if (!input.cuerpo || input.cuerpo.trim().length === 0) {
    return { exito: false, razon: "El cuerpo no puede estar vacio" };
  }
  return { exito: true };
}

export function validarMotivoRetiroDistribucion(motivo: string): ResultadoDistribucion {
  if (!motivo || motivo.trim().length === 0) {
    return {
      exito: false,
      razon: "El motivo de retiro es obligatorio",
    };
  }
  return { exito: true };
}
