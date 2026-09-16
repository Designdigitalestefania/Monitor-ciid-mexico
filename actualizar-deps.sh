#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$HOME/ciid-mexico"

echo "Backup del package.json..."
cp package.json package.json.bak

echo "Escribiendo package.json actualizado..."

cat > package.json <<'PKGEOF'
{
  "name": "ciid-mexico",
  "version": "0.1.0",
  "private": true,
  "description": "MONITOR CIID - Centro Inteligente de Informacion Digital",
  "license": "SEE LICENSE IN LICENSE",
  "author": "Estefania Perez Vazquez",
  "type": "module",
  "scripts": {
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc",
    "ci": "npm run lint && npm run typecheck && npm run test && npm run build"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "eslint": "^8.57.1",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
PKGEOF

echo "Limpiando node_modules y package-lock.json..."
rm -rf node_modules package-lock.json

echo "Instalando dependencias actualizadas..."
npm install

echo ""
echo "Verificando vulnerabilidades..."
npm audit || true

echo ""
echo "Corriendo tests..."
npm run test

echo ""
echo "Corriendo CI completo..."
npm run ci

echo ""
echo "===================================================="
echo "  Dependencias actualizadas"
echo "===================================================="
