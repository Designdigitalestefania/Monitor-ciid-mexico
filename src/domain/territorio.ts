export type TerritorioNivel =
  | "estado"
  | "region"
  | "distrito"
  | "municipio"
  | "localidad"
  | "comunidad";

export interface Territorio {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: TerritorioNivel;
  readonly padreId: string | null;
}

export interface TerritorioSnapshot {
  readonly estado: string;
  readonly region?: string;
  readonly distrito?: string;
  readonly municipio?: string;
  readonly localidad?: string;
  readonly comunidad?: string;
}

export function crearTerritorio(input: {
  id: string;
  nombre: string;
  nivel: TerritorioNivel;
  padreId: string | null;
}): Territorio {
  if (!input.id || input.id.trim().length === 0) {
    throw new Error("Territorio: id vacio");
  }
  if (!input.nombre || input.nombre.trim().length === 0) {
    throw new Error("Territorio: nombre vacio");
  }
  if (input.nivel !== "estado" && input.padreId === null) {
    throw new Error("Territorio: solo estado puede no tener padre");
  }
  if (input.nivel === "estado" && input.padreId !== null) {
    throw new Error("Territorio: estado no puede tener padre");
  }
  return { ...input };
}

export function tomarSnapshot(t: Territorio[]): TerritorioSnapshot {
  const snap: Record<string, string> = {};
  for (const item of t) {
    snap[item.nivel] = item.nombre;
  }
  return {
    estado: snap["estado"] ?? "",
    region: snap["region"],
    distrito: snap["distrito"],
    municipio: snap["municipio"],
    localidad: snap["localidad"],
    comunidad: snap["comunidad"],
  };
}
