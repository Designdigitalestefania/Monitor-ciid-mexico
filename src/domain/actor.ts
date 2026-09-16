export type ActorRol =
  | "sistema"
  | "periodista"
  | "editor"
  | "verificador"
  | "hablante-nativo"
  | "ciudadano";

export interface Actor {
  readonly userId: string;
  readonly nombre: string;
  readonly rol: ActorRol;
  readonly tenantId: string;
}

export interface ActorRegistro {
  readonly userId: string;
  readonly nombre: string;
  readonly rol: ActorRol;
  readonly tenantId: string;
  readonly timestamp: string;
}

export function crearActor(input: {
  userId: string;
  nombre: string;
  rol: ActorRol;
  tenantId: string;
}): Actor {
  if (!input.userId || input.userId.trim().length === 0) {
    throw new Error("Actor: userId vacio");
  }
  if (!input.nombre || input.nombre.trim().length === 0) {
    throw new Error("Actor: nombre vacio");
  }
  if (!input.tenantId || input.tenantId.trim().length === 0) {
    throw new Error("Actor: tenantId vacio");
  }
  return { ...input };
}

export function registrarActor(actor: Actor): ActorRegistro {
  return {
    userId: actor.userId,
    nombre: actor.nombre,
    rol: actor.rol,
    tenantId: actor.tenantId,
    timestamp: new Date().toISOString(),
  };
}

export function puedeDecidirPublicacion(actor: Actor): boolean {
  return actor.rol === "periodista" || actor.rol === "editor";
}
