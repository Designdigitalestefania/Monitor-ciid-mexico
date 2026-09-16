export type TenantTipo = "medio" | "municipio" | "institucion" | "comunidad";
export type TenantEstado = "activo" | "suspendido" | "archivado";

export interface TenantConfiguracion {
  readonly permiteParticipacionCiudadana: boolean;
  readonly idiomasSoportados: readonly string[];
  readonly lenguasOriginariasSoportadas: readonly string[];
  readonly retencionDias: number;
}

export interface Tenant {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TenantTipo;
  readonly territorioId: string;
  readonly configuracion: TenantConfiguracion;
  readonly estado: TenantEstado;
  readonly creadoEn: string;
}

export function crearTenant(input: {
  id: string;
  nombre: string;
  tipo: TenantTipo;
  territorioId: string;
  configuracion?: Partial<TenantConfiguracion>;
}): Tenant {
  if (!input.id || input.id.trim().length === 0) {
    throw new Error("Tenant: id vacio");
  }
  if (!input.nombre || input.nombre.trim().length === 0) {
    throw new Error("Tenant: nombre vacio");
  }
  if (!input.territorioId || input.territorioId.trim().length === 0) {
    throw new Error("Tenant: territorioId vacio");
  }
  const configuracion: TenantConfiguracion = {
    permiteParticipacionCiudadana: true,
    idiomasSoportados: ["es"],
    lenguasOriginariasSoportadas: [],
    retencionDias: 365,
    ...input.configuracion,
  };
  return {
    id: input.id,
    nombre: input.nombre,
    tipo: input.tipo,
    territorioId: input.territorioId,
    configuracion,
    estado: "activo",
    creadoEn: new Date().toISOString(),
  };
}

export function mismoTenant(a: Tenant, b: Tenant): boolean {
  return a.id === b.id;
}

export function aceptaParticipacionCiudadana(tenant: Tenant): boolean {
  return (
    tenant.estado === "activo" &&
    tenant.configuracion.permiteParticipacionCiudadana
  );
}
