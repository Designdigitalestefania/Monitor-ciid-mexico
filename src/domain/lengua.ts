export interface Lengua {
  readonly id: string;
  readonly nombre: string;
  readonly familia: string;
  readonly variantes: readonly Variante[];
}

export interface Variante {
  readonly id: string;
  readonly nombre: string;
  readonly comunidadReferencia?: string;
}

export interface LenguaSnapshot {
  readonly lenguaId: string;
  readonly lenguaNombre: string;
  readonly varianteId: string;
  readonly varianteNombre: string;
  readonly validadoPor?: string;
}

export const LENGUAS_PILOTO = {
  zapoteco: "zapoteco",
  mixteco: "mixteco",
  mazateco: "mazateco",
} as const;

export type LenguaPiloto = (typeof LENGUAS_PILOTO)[keyof typeof LENGUAS_PILOTO];

export function crearLengua(input: {
  id: string;
  nombre: string;
  familia: string;
  variantes: Variante[];
}): Lengua {
  if (!input.id || input.id.trim().length === 0) {
    throw new Error("Lengua: id vacio");
  }
  if (!input.nombre || input.nombre.trim().length === 0) {
    throw new Error("Lengua: nombre vacio");
  }
  if (input.variantes.length === 0) {
    throw new Error("Lengua: debe tener variantes");
  }
  for (const v of input.variantes) {
    if (!v.id || v.id.trim().length === 0) {
      throw new Error("Lengua: variante id vacio");
    }
    if (!v.nombre || v.nombre.trim().length === 0) {
      throw new Error("Lengua: variante nombre vacio");
    }
  }
  return { ...input, variantes: [...input.variantes] };
}

export function tomarSnapshotLengua(
  lengua: Lengua,
  varianteId: string,
  validadoPor?: string
): LenguaSnapshot {
  const variante = lengua.variantes.find((v) => v.id === varianteId);
  if (!variante) {
    throw new Error("Lengua: variante inexistente");
  }
  return {
    lenguaId: lengua.id,
    lenguaNombre: lengua.nombre,
    varianteId: variante.id,
    varianteNombre: variante.nombre,
    validadoPor,
  };
}
