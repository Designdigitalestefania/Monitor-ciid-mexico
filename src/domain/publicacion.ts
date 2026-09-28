export type PublicacionCanal =
  | "web"
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "radio-comunitaria"
  | "whatsapp-breve";

export type PublicacionEstado = "activa" | "retirada";

export interface Publicacion {
  readonly id: string;
  readonly expedienteId: string;
  readonly tenantId: string;
  readonly canal: PublicacionCanal;
  readonly version: number;
  readonly titulo: string;
  readonly cuerpo: string;
  readonly idioma: string;
  readonly estado: PublicacionEstado;
  readonly eventoOrigenId: string | null;
  readonly creadaEn: string;
  readonly creadaPor: string;
  readonly retiradaEn: string | null;
  readonly motivoRetiro: string | null;
}

export function crearPublicacion(input: {
  id: string;
  expedienteId: string;
  tenantId: string;
  canal: PublicacionCanal;
  version: number;
  titulo: string;
  cuerpo: string;
  idioma?: string;
  creadaPor: string;
  eventoOrigenId?: string;
}): Publicacion {
  if (!input.titulo.trim()) throw new Error("Publicacion: el titulo es obligatorio");
  if (!input.cuerpo.trim()) throw new Error("Publicacion: el cuerpo es obligatorio");
  if (input.version < 1) throw new Error("Publicacion: la version debe ser >= 1");
  return {
    id: input.id,
    expedienteId: input.expedienteId,
    tenantId: input.tenantId,
    canal: input.canal,
    version: input.version,
    titulo: input.titulo,
    cuerpo: input.cuerpo,
    idioma: input.idioma ?? "es",
    estado: "activa",
    eventoOrigenId: input.eventoOrigenId ?? null,
    creadaEn: new Date().toISOString(),
    creadaPor: input.creadaPor,
    retiradaEn: null,
    motivoRetiro: null,
  };
}
