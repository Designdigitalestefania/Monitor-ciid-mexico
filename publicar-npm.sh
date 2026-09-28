#!/data/data/com.termux/files/usr/bin/bash
# Publicar ciid-mexico en NPM con token granular
set -e

DIR_BACK="$HOME/ciid-mexico"

echo ""
echo "===================================================="
echo "  MONITOR CIID · Publicar en NPM"
echo "===================================================="
echo ""

cd "$DIR_BACK"

# 1. Verificar que estamos listos
echo "[1/5] Verificando estado del paquete..."

if ! grep -q '"private": false' package.json; then
  echo "  ERROR: package.json debe tener private: false"
  exit 1
fi

if [ ! -f "dist/index.js" ]; then
  echo "  ERROR: dist/index.js no existe. Corre: npm run build"
  exit 1
fi

if [ ! -f "dist/index.d.ts" ]; then
  echo "  ERROR: dist/index.d.ts no existe. Corre: npm run build"
  exit 1
fi

echo "  OK: paquete listo"
echo ""

# 2. Verificar login
echo "[2/5] Verificando autenticacion en NPM..."

if ! npm whoami >/dev/null 2>&1; then
  echo "  ERROR: no estas autenticado. Corre primero: npm login"
  exit 1
fi

USUARIO=$(npm whoami)
echo "  OK: autenticado como: $USUARIO"
echo ""

# 3. Verificar si hay token granular configurado
echo "[3/5] Verificando token de publicacion..."

TOKEN=$(npm config get //registry.npmjs.org/:_authToken 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "undefined" ]; then
  echo "  AVISO: no hay token granular configurado."
  echo ""
  echo "  NPM requiere 2FA para publicar. Tienes 2 opciones:"
  echo ""
  echo "  OPCION A · Publicar con OTP (rapido, manual cada vez):"
  echo "    1. Abre tu app de autenticacion (Google Authenticator, Authy)"
  echo "    2. Copia el codigo de 6 digitos de NPM"
  echo "    3. Ejecuta: cd ~/ciid-mexico && npm publish --access public --otp=CODIGO"
  echo ""
  echo "  OPCION B · Crear token granular con bypass 2FA (recomendado):"
  echo "    1. Abre: https://www.npmjs.com/settings/$USUARIO/tokens"
  echo "    2. Toca 'Generate New Token' -> 'Granular Access Token'"
  echo "    3. Configura:"
  echo "       - Token name: termux-ciid-mexico"
  echo "       - Expiration: 90 days"
  echo "       - Packages and scopes: Read and write"
  echo "       - Marca 'Bypass 2FA' ✅"
  echo "    4. Copia el token (empieza con npm_...)"
  echo "    5. Corre:"
  echo "       npm config set //registry.npmjs.org/:_authToken=TU_TOKEN"
  echo "    6. Corre de nuevo este script"
  echo ""
  exit 1
fi

echo "  OK: token configurado ($(echo $TOKEN | head -c 12)...)"
echo ""

# 4. Confirmar version
echo "[4/5] Confirmando version a publicar..."

VERSION=$(node -p "require('./package.json').version")
NAME=$(node -p "require('./package.json').name")
echo "  Paquete: $NAME"
echo "  Version: $VERSION"
echo ""

# Verificar si esa version ya existe en NPM
if npm view "$NAME@$VERSION" version >/dev/null 2>&1; then
  echo "  AVISO: la version $VERSION ya esta publicada en NPM."
  echo "  Debes incrementar la version antes de publicar:"
  echo "    npm version patch   # 1.0.0 -> 1.0.1"
  echo "    npm version minor   # 1.0.0 -> 1.1.0"
  echo "    npm version major   # 1.0.0 -> 2.0.0"
  exit 1
fi

echo "  OK: version $VERSION disponible para publicar"
echo ""

# 5. Publicar
echo "[5/5] Publicando en NPM..."
echo ""

npm publish --access public

echo ""
echo "===================================================="
echo "  ✅ Publicado exitosamente"
echo "===================================================="
echo ""
echo "Verifica en:"
echo "  https://www.npmjs.com/package/$NAME"
echo ""
echo "Cualquier persona puede instalarlo con:"
echo "  npm install $NAME"
echo ""
echo "Siguiente paso:"
echo "  cd $HOME/monitor-ciid-web"
echo "  rm -rf node_modules package-lock.json"
echo "  npm install"
echo "  npm run ci"
echo "  git add ."
echo "  git commit -m 'chore: consume ciid-mexico desde NPM publico'"
echo "  git push"
echo ""
