#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$HOME/ciid-mexico"

echo "→ Fix 1: Reordenar re-export en citizen/types.ts"

cat > src/modules/citizen/types.ts <<'CITIZEN_TYPES_EOF'
import { type TerritorioSnapshot } from "../../domain/territorio.js";
import { type LenguaSnapshot } from "../../domain/lengua.js";

// Re-export del dominio canónico
export type { Consentimiento } from "../../domain/aporte.js";

import { type Consentimiento } from "../../domain/aporte.js";

export type CanalCiudadano =
  | "whatsapp"
  | "correo"
  | "web"
  | "telefono"
  | "presencial";

export type EstadoReporte = "activo" | "vinculado" | "retirado";

export interface RegistroCiudadano {
  readonly id: string;
  readonly tenantId: string;
  readonly canal: CanalCiudadano;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas: readonly LenguaSnapshot[];
  readonly consentimiento: Consentimiento;
  readonly estado: EstadoReporte;
  readonly expedienteId: string | null;
  readonly creadoEn: string;
  readonly retiradoEn: string | null;
  readonly motivoRetiro: string | null;
}

export interface RegistrarInput {
  readonly id: string;
  readonly tenantId: string;
  readonly canal: CanalCiudadano;
  readonly territorio: TerritorioSnapshot;
  readonly lenguas?: LenguaSnapshot[];
  readonly consentimiento: Consentimiento;
}

export interface FiltrosCiudadano {
  readonly tenantId?: string;
  readonly canal?: CanalCiudadano;
  readonly estado?: EstadoReporte;
}

export interface ResultadoCiudadano {
  readonly exito: boolean;
  readonly registro?: RegistroCiudadano;
  readonly razon?: string;
}

export type { TerritorioSnapshot, LenguaSnapshot };
CITIZEN_TYPES_EOF

echo "  OK citizen/types.ts reordenado"
echo ""

echo "→ Fix 2: Ajustar pipeline/service.ts para manejar EtapaEspecial"

python3 <<'PYEOF'
with open("src/modules/pipeline/service.ts", "r", encoding="utf-8") as f:
    contenido = f.read()

# Agregar guard al inicio de avanzar()
old_avanzar = '''  avanzar(input: AvanzarInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    const validacion = validarAvance(expediente.etapaActual, actor);'''

new_avanzar = '''  avanzar(input: AvanzarInput): ResultadoPipeline {
    const { expediente, actor, razon } = input;

    // Guard v1.1: no se puede avanzar desde una etapa especial
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede avanzar desde una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacion = validarAvance(expediente.etapaActual as Etapa, actor);'''

contenido = contenido.replace(old_avanzar, new_avanzar)

# Agregar guard a aprobarPublicacion()
old_aprobar = '''    const validacionActor = validarActorParaDecision(actor);
    if (!validacionActor.exito) return validacionActor;

    if (expediente.etapaActual !== "DECISION") {'''

new_aprobar = '''    const validacionActor = validarActorParaDecision(actor);
    if (!validacionActor.exito) return validacionActor;

    // Guard v1.1: etapa especial no permite aprobar
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede aprobar desde una etapa especial: " + expediente.etapaActual,
      };
    }

    if (expediente.etapaActual !== "DECISION") {'''

contenido = contenido.replace(old_aprobar, new_aprobar)

# Agregar guard a devolver()
old_devolver = '''    const validacionEtapa = validarDevolucionDesde(expediente.etapaActual);'''

new_devolver = '''    // Guard v1.1: etapa especial no permite devolver
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "No se puede devolver desde una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacionEtapa = validarDevolucionDesde(expediente.etapaActual as Etapa);'''

contenido = contenido.replace(old_devolver, new_devolver)

# Agregar guard a rechazar()
old_rechazar = '''    const validacionEtapa = validarRechazoDesde(expediente.etapaActual);'''

new_rechazar = '''    // Guard v1.1: etapa especial no permite rechazar de nuevo
    if (expediente.etapaActual === "RETURNED" || expediente.etapaActual === "REJECTED") {
      return {
        exito: false,
        razon: "Ya está en una etapa especial: " + expediente.etapaActual,
      };
    }

    const validacionEtapa = validarRechazoDesde(expediente.etapaActual as Etapa);'''

contenido = contenido.replace(old_rechazar, new_rechazar)

# Asegurar que se importa Etapa
if 'import { type Etapa' not in contenido and 'Etapa,' not in contenido:
    # Agregar al primer import de etapa.js
    contenido = contenido.replace(
        'from "../../domain/etapa.js";',
        'from "../../domain/etapa.js";',
        1
    )

with open("src/modules/pipeline/service.ts", "w", encoding="utf-8") as f:
    f.write(contenido)

print("  OK pipeline/service.ts actualizado con guards")
PYEOF

echo ""
echo "→ Verificando typecheck"
npm run typecheck 2>&1 | tail -15

echo ""
echo "════════════════════════════════════════════════════"
echo "  Fix v2 completado"
echo "════════════════════════════════════════════════════"
