#!/data/data/com.termux/files/usr/bin/bash
# Preparar ciid-mexico para publicacion en NPM
set -e

DIR_BACK="$HOME/ciid-mexico"
DIR_FRONT="$HOME/monitor-ciid-web"

echo ""
echo "===================================================="
echo "  MONITOR CIID · Preparar publicacion en NPM"
echo "===================================================="
echo ""

cd "$DIR_BACK"

# 1. Verificar package.json del backend
echo "[1/5] Verificando package.json del backend..."

if ! grep -q '"private": false' package.json; then
  echo "  ERROR: el package.json debe tener private: false"
  exit 1
fi

if ! grep -q '"types"' package.json; then
  echo "  ERROR: el package.json debe tener campo types"
  exit 1
fi

if ! grep -q '"exports"' package.json; then
  echo "  ERROR: el package.json debe tener campo exports"
  exit 1
fi

echo "  OK: package.json valido para publicacion"
echo ""

# 2. Verificar que dist/ exista
echo "[2/5] Verificando dist/ compilado..."

if [ ! -f "dist/index.js" ]; then
  echo "  ERROR: dist/index.js no existe. Ejecuta: npm run build"
  exit 1
fi

if [ ! -f "dist/index.d.ts" ]; then
  echo "  ERROR: dist/index.d.ts no existe. Ejecuta: npm run build"
  exit 1
fi

echo "  OK: dist/ compilado"
echo ""

# 3. Crear .npmignore
echo "[3/5] Creando .npmignore..."

cat > .npmignore <<'NPMIGNORE_EOF'
# Tests
tests/
coverage/
*.test.ts

# Codigo fuente (solo publicamos dist/)
src/

# Configuracion de desarrollo
.github/
tsconfig.json
.eslintrc.json
vitest.config.ts

# Documentacion interna
docs/
*.md
!README.md

# Archivos temporales
*.log
*.tmp
.DS_Store
NPMIGNORE_EOF

echo "  OK: .npmignore creado"
echo ""

# 4. Dry run de npm publish
echo "[4/5] Ejecutando npm publish --dry-run (simulacion)..."

npm publish --dry-run 2>&1 | tail -30

echo ""

# 5. Actualizar el frontend para usar la version de NPM
echo "[5/5] Actualizando frontend para consumir ciid-mexico desde NPM..."

cd "$DIR_FRONT"

# Guardar backup del package.json
cp package.json package.json.bak

python3 <<'PYEOF'
import json

with open("package.json", "r", encoding="utf-8") as f:
    pkg = json.load(f)

# Cambiar la referencia local por version de NPM
pkg["dependencies"]["ciid-mexico"] = "^1.0.0"

with open("package.json", "w", encoding="utf-8") as f:
    json.dump(pkg, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("  OK: package.json actualizado (ciid-mexico: ^1.0.0)")
PYEOF

echo ""
echo "===================================================="
echo "  Preparacion completada"
echo "===================================================="
echo ""
echo "Backend listo para publicar. Falta:"
echo ""
echo "  1. Crear cuenta NPM (si no tienes):"
echo "     Abre: https://www.npmjs.com/signup"
echo ""
echo "  2. Login desde Termux:"
echo "     cd $DIR_BACK"
echo "     npm login"
echo "     (te pedira username, password y email)"
echo ""
echo "  3. Publicar:"
echo "     cd $DIR_BACK"
echo "     npm publish --access public"
echo ""
echo "  4. Confirmar en NPM:"
echo "     Abre: https://www.npmjs.com/package/ciid-mexico"
echo ""
echo "  5. Reinstalar en el frontend:"
echo "     cd $DIR_FRONT"
echo "     rm -rf node_modules package-lock.json"
echo "     npm install"
echo ""
echo "  6. Commit + push del frontend:"
echo "     cd $DIR_FRONT"
echo "     git add ."
echo "     git commit -m 'chore: consume ciid-mexico desde NPM'"
echo "     git push"
echo ""
echo "IMPORTANTE: no ejecutes 'npm publish' todavia."
echo "Primero revisa que el --dry-run haya salido sin errores."
echo ""
