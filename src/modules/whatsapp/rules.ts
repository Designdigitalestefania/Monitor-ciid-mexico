import { type MensajeWhatsApp, type ResultadoProcesamiento } from "./types.js";

const TIPOS_SOPORTADOS = ["text", "audio", "image", "video", "document"];

export function validarTipoMensaje(tipo: string): ResultadoProcesamiento {
  if (!TIPOS_SOPORTADOS.includes(tipo)) {
    return { exito: false, messageId: "unknown", razon: "Tipo no soportado: " + tipo };
  }
  return { exito: true, messageId: "unknown" };
}

export function validarTelefono(from: string): ResultadoProcesamiento {
  if (!from || from.trim().length < 5) {
    return { exito: false, messageId: "unknown", razon: "Telefono invalido: " + from };
  }
  return { exito: true, messageId: "unknown" };
}

export function validarMensaje(m: MensajeWhatsApp): ResultadoProcesamiento {
  const vTel = validarTelefono(m.from);
  if (!vTel.exito) return vTel;
  if (m.tipo === "text" && (!m.texto || m.texto.trim().length === 0)) {
    return { exito: false, messageId: m.messageId, razon: "Texto vacio" };
  }
  if (m.tipo !== "text" && !m.mediaId) {
    return { exito: false, messageId: m.messageId, razon: "Media faltante" };
  }
  if (!m.messageId || m.messageId.trim().length === 0) {
    return { exito: false, messageId: "unknown", razon: "Falta messageId" };
  }
  return { exito: true, messageId: m.messageId };
}

export function tipoAPorteTipo(tipo: string): "texto" | "audio" | "foto" | "video" | "documento" {
  switch (tipo) {
    case "text": return "texto";
    case "audio": return "audio";
    case "image": return "foto";
    case "video": return "video";
    case "document": return "documento";
    default: return "texto";
  }
}
