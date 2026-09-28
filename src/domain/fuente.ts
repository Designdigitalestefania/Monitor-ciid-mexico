import { type TerritorioSnapshot } from "./territorio.js";
import { type LenguaSnapshot } from "./lengua.js";

export type FuenteTipo = "persona" | "institucion" | "comunidad" | "anonima";

export interface Fuente {
  readonly id: string;
  readonly tenantId: string;
  readonly tipo: FuenteTipo;
  readonly nombre: string;
  readonly nombrePublico: boolean;
  readonly contacto: string | null;
  readonly territorio: TerritorioSnapshot;
  readonly lengua: LenguaSnapshot | null;
  readonly metadataExtra: Record<string, unknown>;
  readonly creadoEn: string;
  readonly actualizadoEn: string;
}

export function crearFuente(input: {
  id: string;
  tenantId: string;
  tipo: FuenteTipo;
  nombre: string;
  territorio: TerritorioSnapshot;
  nombrePublico?: boolean;
  contacto?: string;
  lengua?: LenguaSnapshot;
}): Fuente {
  if (!input.id.trim()) throw new Error("Fuente: el id no puede estar vacio");
  if (!input.nombre.trim()) throw new Error("Fuente: el nombre no puede estar vacio");
  if (!input.territorio.estado) throw new Error("Fuente: el territorio debe incluir estado");
  const ahora = new Date().toISOString();
  return {
    id: input.id,
    tenantId: input.tenantId,
    tipo: input.tipo,
    nombre: input.nombre,
    nombrePublico: input.nombrePublico ?? true,
    contacto: input.contacto ?? null,
    territorio: input.territorio,
    lengua: input.lengua ?? null,
    metadataExtra: {},
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}
