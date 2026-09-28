export type MensajeTipo = "text" | "audio" | "image" | "video" | "document" | "unknown";

export interface MensajeWhatsApp {
  readonly messageId: string;
  readonly from: string;
  readonly timestamp: string;
  readonly tipo: MensajeTipo;
  readonly texto: string | null;
  readonly mediaId: string | null;
  readonly mediaMimeType: string | null;
  readonly mediaSha256: string | null;
  readonly nombreContacto: string | null;
}

export interface ResultadoProcesamiento {
  readonly exito: boolean;
  readonly messageId: string;
  readonly expedienteId?: string;
  readonly razon?: string;
}

export interface ConfiguracionWhatsApp {
  readonly verifyToken: string;
  readonly appSecret: string;
  readonly accessToken: string;
  readonly phoneNumberId: string;
  readonly modoSimulacion: boolean;
}
