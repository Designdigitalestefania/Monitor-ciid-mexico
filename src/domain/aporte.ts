export type AporteCanal = "whatsapp" | "correo" | "web" | "telefono" | "presencial";
export type AporteTipo = "texto" | "audio" | "foto" | "video" | "documento";

export interface Consentimiento {
  readonly otorgado: boolean;
  readonly fecha: string;
  readonly usoInformativo: boolean;
  readonly usoPatrimonial: boolean;
}

export interface Aporte {
  readonly id: string;
  readonly expedienteId: string;
  readonly fuenteId: string | null;
  readonly tenantId: string;
  readonly canal: AporteCanal;
  readonly tipoMaterial: AporteTipo;
  readonly contenidoTexto: string | null;
  readonly archivoRuta: string | null;
  readonly archivoMimeType: string | null;
  readonly archivoTamano: number | null;
  readonly hashDocumental: string;
  readonly timestampRecepcion: string;
  readonly ubicacionGps: { lat: number; lng: number } | null;
  readonly consentimiento: Consentimiento | null;
  readonly metadataExtra: Record<string, unknown>;
  readonly creadoEn: string;
}

export function crearAporte(input: {
  id: string;
  expedienteId: string;
  tenantId: string;
  canal: AporteCanal;
  tipoMaterial: AporteTipo;
  hashDocumental: string;
  contenidoTexto?: string;
  archivoRuta?: string;
  fuenteId?: string;
  archivoMimeType?: string;
  archivoTamano?: number;
  ubicacionGps?: { lat: number; lng: number };
  consentimiento?: Consentimiento;
  metadataExtra?: Record<string, unknown>;
}): Aporte {
  if (!input.contenidoTexto && !input.archivoRuta) {
    throw new Error("Aporte: debe tener texto o archivo");
  }
  if (!input.hashDocumental.trim()) {
    throw new Error("Aporte: el hashDocumental es obligatorio");
  }
  return {
    id: input.id,
    expedienteId: input.expedienteId,
    fuenteId: input.fuenteId ?? null,
    tenantId: input.tenantId,
    canal: input.canal,
    tipoMaterial: input.tipoMaterial,
    contenidoTexto: input.contenidoTexto ?? null,
    archivoRuta: input.archivoRuta ?? null,
    archivoMimeType: input.archivoMimeType ?? null,
    archivoTamano: input.archivoTamano ?? null,
    hashDocumental: input.hashDocumental,
    timestampRecepcion: new Date().toISOString(),
    ubicacionGps: input.ubicacionGps ?? null,
    consentimiento: input.consentimiento ?? null,
    metadataExtra: input.metadataExtra ?? {},
    creadoEn: new Date().toISOString(),
  };
}
