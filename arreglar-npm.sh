#!/data/data/com.termux/files/usr/bin/bash
# Diagnostico y publicacion en NPM

DIR="$HOME/ciid-mexico"
cd "$DIR"

echo ""
echo "===================================================="
echo "  MONITOR CIID · Arreglar publicacion NPM"
echo "===================================================="
echo ""

# 1. Estado del paquete
echo "[1/6] Estado del paquete:"
echo "  Nombre: $(node -p "require('./package.json').name")"
echo "  Version: $(node -p "require('./package.json').version")"
echo "  Private: $(node -p "require('./package.json').private")"
echo ""

# 2. Token actual en .npmrc
echo "[2/6] Token configurado en ~/.npmrc:"
if [ -f "$HOME/.npmrc" ]; then
  cat "$HOME/.npmrc" | sed 's/:_authToken=[^ ]*/:_authToken=***OCULTO***/'
else
  echo "  NO existe ~/.npmrc"
fi
echo ""

# 3. Login actual
echo "[3/6] Usuario autenticado:"
USER_NPM=$(npm whoami 2>/dev/null || echo "NO AUTENTICADO")
echo "  $USER_NPM"
echo ""

# 4. Instrucciones para resolver
echo "[4/6] NECESITAS hacer esto en Chrome:"
echo ""
echo "  A) Abre tu app de autenticacion (Google Authenticator/Authy)"
echo "     y copia el codigo de 6 digitos de NPM."
echo ""
echo "  B) O crea un token nuevo con Bypass 2FA marcado:"
echo "     https://www.npmjs.com/settings/designdigitalestefania/tokens"
echo "     - Token name: termux-npm-final"
echo "     - Expiration: 90 days"
echo "     - Permissions: Read and write (publish and stage)"
echo "     - Bypass 2FA: ✅ MARCAR"
echo "     - Allowed IP: vacio"
echo "     - Toca Generate Token"
echo "     - Copia el token (empieza con npm_...)"
echo ""
echo "  C) Si vas a usar OTP, ten el codigo listo ahora."
echo ""

# 5. Menu interactivo
echo "[5/6] Selecciona una opcion:"
echo ""
echo "  1) Publicar con OTP (recomendado, requiere app 2FA)"
echo "  2) Configurar token nuevo (pegar el token)"
echo "  3) Ver estado actual y salir"
echo ""
read -p "  Opcion [1/2/3]: " OPCION

case "$OPCION" in
  1)
    echo ""
    read -p "  Pegar el codigo OTP de 6 digitos: " OTP
    echo ""
    echo "  Publicando con OTP: $OTP"
    echo ""
    cd "$DIR" && npm publish --access public --otp="$OTP"
    ;;
  2)
    echo ""
    read -p "  Pegar el token nuevo (npm_...): " TOKEN
    echo ""
    if [[ ! "$TOKEN" =~ ^npm_ ]]; then
      echo "  ERROR: el token debe empezar con 'npm_'"
      exit 1
    fi
    npm config set //registry.npmjs.org/:_authToken="$TOKEN"
    echo "  ✓ Token configurado"
    echo ""
    echo "  Publicando..."
    echo ""
    cd "$DIR" && npm publish --access public
    ;;
  3)
    echo ""
    echo "  Saliendo sin cambios"
    exit 0
    ;;
  *)
    echo ""
    echo "  Opcion invalida"
    exit 1
    ;;
esac

echo ""
echo "===================================================="
echo "  Proceso terminado"
echo "===================================================="
echo ""
