import { crearExpediente } from "../../domain/expediente.js";
import { crearAporte, type Aporte } from "../../domain/aporte.js";
import { type MensajeWhatsApp } from "./types.js";
import { validarMensaje, tipoAPorteTipo } from "./rules.js";

export interface WhatsAppServiceDeps {
  readonly generarIdExpediente: () => string;
  readonly generarIdAporte: () => string;
  readonly calcularHashAporte: (contenido: string) => string;
  readonly guardarExpediente: (expedienteId: string, mensaje: MensajeWhatsApp) => void;
  readonly guardarAporte: (aporte: Aporte) => void;
}

export interface ResultadoProcesamientoWA {
  readonly exito: boolean;
  readonly messageId: string;
  readonly expedienteId?: string;
  readonly razon?: string;
}

export class WhatsAppService {
  constructor(private readonly deps: WhatsAppServiceDeps) {}

  procesarMensaje(mensaje: MensajeWhatsApp): ResultadoProcesamientoWA {
    const validacion = validarMensaje(mensaje);
    if (!validacion.exito) {
      return {
        exito: false,
        messageId: validacion.messageId,
        razon: validacion.razon,
      };
    }

    try {
      const expedienteId = this.deps.generarIdExpediente();
      const aporteId = this.deps.generarIdAporte();

      crearExpediente({
        id: expedienteId,
        tenantId: "monitor-noticias",
        origen: "ciudadania",
        territorio: { estado: "Oaxaca" },
      });

      const contenidoParaHash = mensaje.texto ?? mensaje.mediaId ?? mensaje.messageId;

      const aporte = crearAporte({
        id: aporteId,
        expedienteId,
        tenantId: "monitor-noticias",
        canal: "whatsapp",
        tipoMaterial: tipoAPorteTipo(mensaje.tipo),
        hashDocumental: this.deps.calcularHashAporte(contenidoParaHash),
        contenidoTexto: mensaje.texto ?? undefined,
        archivoRuta: mensaje.mediaId ? "whatsapp://media/" + mensaje.mediaId : undefined,
        archivoMimeType: mensaje.mediaMimeType ?? undefined,
        metadataExtra: {
          from: mensaje.from,
          nombreContacto: mensaje.nombreContacto,
          mediaSha256: mensaje.mediaSha256,
        },
      });

      this.deps.guardarExpediente(expedienteId, mensaje);
      this.deps.guardarAporte(aporte);

      return { exito: true, messageId: mensaje.messageId, expedienteId };
    } catch (err) {
      return {
        exito: false,
        messageId: mensaje.messageId,
        razon: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  }
}
