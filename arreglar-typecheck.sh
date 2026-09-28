#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$HOME/ciid-mexico"

echo "→ Fix 1: verificar exports de etapa.ts"
grep -E "^export" src/domain/etapa.ts | head -20
echo ""

echo "→ Fix 2: verificar Consentimiento duplicado"
grep -rn "interface Consentimiento" src/ || true
echo ""
