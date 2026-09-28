#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$HOME/ciid-mexico"

echo "→ Fix 1: Agregando EtapaEspecial a etapa.ts"

python3 <<'PYEOF'
with open("src/domain/etapa.ts", "r", encoding="utf-8") as f:
    contenido = f.read()

# Verificar si ya existe
if "export type EtapaEspecial" in contenido:
    print("  Ya existe EtapaEspecial, saltando")
else:
    # Insertar después de la línea "export type Etapa = ..."
    needle = 'export type Etapa = (typeof ETAPAS)[number];'
    replacement = '''export type Etapa = (typeof ETAPAS)[number];

export type EtapaEspecial = "RETURNED" | "REJECTED";'''
    
    contenido = contenido.replace(needle, replacement)
    
    with open("src/domain/etapa.ts", "w", encoding="utf-8") as f:
        f.write(contenido)
    
    print("  OK EtapaEspecial agregado")
PYEOF

echo ""
echo "→ Fix 2: Resolviendo Consentimiento duplicado"

python3 <<'PYEOF'
# Actualizar citizen/types.ts para re-exportar en lugar de redefinir
with open("src/modules/citizen/types.ts", "r", encoding="utf-8") as f:
    contenido = f.read()

# Eliminar la interface Consentimiento del citizen/types.ts
import re

patron = r'export interface Consentimiento \{[^}]*\}'
contenido_nuevo = re.sub(patron, '', contenido, flags=re.DOTALL)

# Agregar un re-export al inicio del archivo (después de los imports)
if 'export type { Consentimiento }' not in contenido_nuevo:
    # Insertar después de la última línea de import
    lineas = contenido_nuevo.split('\n')
    ultima_import = 0
    for i, linea in enumerate(lineas):
        if linea.startswith('import ') or linea.startswith('} from '):
            ultima_import = i
    
    # Insertar re-export
    lineas.insert(ultima_import + 1, '')
    lineas.insert(ultima_import + 2, '// Re-export del dominio canónico')
    lineas.insert(ultima_import + 3, 'export type { Consentimiento } from "../../domain/aporte.js";')
    
    contenido_nuevo = '\n'.join(lineas)

with open("src/modules/citizen/types.ts", "w", encoding="utf-8") as f:
    f.write(contenido_nuevo)

print("  OK citizen/types.ts actualizado (re-exporta Consentimiento del dominio)")
PYEOF

echo ""
echo "→ Verificando typecheck"
npm run typecheck 2>&1 | tail -10

echo ""
echo "════════════════════════════════════════════════════"
echo "  Fix completado"
echo "════════════════════════════════════════════════════"
