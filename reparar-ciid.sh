#!/data/data/com.termux/files/usr/bin/bash
# Reparar ciid-mexico

set -e

BASE="$HOME/ciid-mexico"
cd "$BASE"

echo ""
echo "=== Reparando ciid-mexico ==="
echo ""

# 1. Limpiar SECURITY.md corrupto
echo "1) Limpiando SECURITY.md..."
rm -f SECURITY.md
cat > SECURITY.md <<'END_SEC'
# Politica de Seguridad

## Reporte de vulnerabilidades

NO reportes vulnerabilidades en Issues publicos.

Envia los detalles a: estefaniaprzvzqz@outlook.com

Compromiso: acuse de recibo en 72 horas.

## Versiones soportadas

- Produccion: https://monitorciid.netlify.app
- Repositorio fundacional: rama main

## Alcance

- Codigo fuente
- Assets
- Documentacion

## Fuera de alcance

- Servicios de terceros
- Ataques de ingenieria social
- Denegacion de servicio
END_SEC
echo "   OK ($(wc -c < SECURITY.md) bytes)"

# 2. Estructura de carpetas
echo "2) Creando carpetas faltantes..."
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p docs/decisions
mkdir -p src/domain
echo "   OK"

# 3. CONTRIBUTING.md
echo "3) CONTRIBUTING.md..."
cat > CONTRIBUTING.md <<'END_CTB'
# Guia de Contribucion

Antes de contribuir, lee el Codigo de Conducta.

## Reportar bugs o proponer mejoras

Abre un Issue con la plantilla correspondiente.

## Enviar codigo

1. Fork del repositorio
2. Rama descriptiva (feature/, fix/, docs/)
3. Commits claros en imperativo
4. Verifica localmente: npm install && npm run ci
5. Abre Pull Request describiendo el cambio

## Estilo de codigo

- TypeScript estricto
- ESLint sin warnings
- Tests obligatorios para logica de dominio
- Commits: feat, fix, docs, chore, test, refactor

## Contribuciones linguisticas

Requieren hablante nativo y consentimiento informado registrado.
END_CTB
echo "   OK"

# 4. CODE_OF_CONDUCT.md
echo "4) CODE_OF_CONDUCT.md..."
cat > CODE_OF_CONDUCT.md <<'END_COC'
# Codigo de Conducta

Basado en Contributor Covenant 2.1.

## Compromiso

Mantenemos un entorno respetuoso para todas las personas. Dado que trabajamos
con patrimonio cultural y linguistico de comunidades originarias, asumimos un
compromiso adicional: el respeto profundo por las comunidades, sus lenguas y
sus procesos de decision.

## Estandares

Positivos:
- Lenguaje respetuoso
- Respeto por lenguas originarias y sus hablantes
- Critica constructiva
- Prioridad al beneficio comunitario

Inaceptables:
- Lenguaje ofensivo
- Apropiacion cultural sin consentimiento
- Publicacion sin verificacion
- Acoso
- Uso del proyecto para fines ajenos

## Aplicacion

Reporta casos a: estefaniaprzvzqz@outlook.com
END_COC
echo "   OK"

# 5. LICENSE
echo "5) LICENSE..."
cat > LICENSE <<'END_LIC'
Copyright (c) 2026 Estefania Perez Vazquez
Proyecto: MONITOR CIID - Centro Inteligente de Informacion Digital

Todos los derechos reservados.

Este repositorio contiene propiedad intelectual, metodologia, arquitectura,
documentacion y codigo fuente de MONITOR CIID.

Queda estrictamente prohibido:

- Copiar, modificar o distribuir el codigo sin autorizacion escrita.
- Reutilizar la metodologia CIID.
- Usar la marca MONITOR CIID.
- Replicar la arquitectura sin licencia.

Para licenciamiento, alianzas o colaboraciones:
Contacto: estefaniaprzvzqz@outlook.com

De Oaxaca para el mundo.
END_LIC
echo "   OK"

# 6. CHANGELOG.md
echo "6) CHANGELOG.md..."
cat > CHANGELOG.md <<'END_CHG'
# Changelog

Sigue Keep a Changelog. Semantic Versioning.

## [Unreleased]

### Planeado
- Modulos auth, tenants, ingest
- Multi-tenancy operativo
- Integracion WhatsApp Business API

## [0.1.0] - 2026-09-15

### Anadido
- Repositorio fundacional
- Estructura empresarial (src/, tests/, docs/)
- Pipeline CIID tipado
- Validacion de transiciones de estado
- Regla de decision humana en codigo
- CI configurado
- ADRs iniciales
- Gobernanza y politica de seguridad
END_CHG
echo "   OK"

# 7. .env.example
echo "7) .env.example..."
cat > .env.example <<'END_ENV'
# MONITOR CIID - Variables de entorno (ejemplo)

NEXT_PUBLIC_APP_NAME=MONITOR CIID
NEXT_PUBLIC_APP_URL=https://monitorciid.netlify.app
NEXT_PUBLIC_APP_ENV=development

DEFAULT_TENANT_ID=monitor-noticias

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_VERIFY_TOKEN=

STORAGE_BUCKET=
STORAGE_REGION=

ANALYTICS_ENABLED=false
END_ENV
echo "   OK"

# 8. CITATION.cff
echo "8) CITATION.cff..."
cat > CITATION.cff <<'END_CIT'
cff-version: 1.2.0
message: "Si utilizas MONITOR CIID en tu trabajo, por favor cita:"
title: "MONITOR CIID - Centro Inteligente de Informacion Digital"
abstract: "Infraestructura periodistica que asiste al periodista en el procesamiento, verificacion, distribucion y preservacion de informacion, con preservacion del patrimonio cultural y linguistico de las comunidades de Oaxaca."
authors:
  - family-names: "Perez Vazquez"
    given-names: "Estefania"
    affiliation: "IXIMI LEGACY - MONITOR CIID"
version: 0.1.0
date-released: "2026-09-15"
license: "Proprietary"
repository-code: "https://github.com/Designdigitalestefania/ciid-mexico"
url: "https://monitorciid.netlify.app"
keywords:
  - periodismo
  - lenguas originarias
  - Oaxaca
  - preservacion cultural
  - verificacion
END_CIT
echo "   OK"

# 9. .github/CODEOWNERS
echo "9) .github/CODEOWNERS..."
cat > .github/CODEOWNERS <<'END_CO'
*                           @Designdigitalestefania
/docs/                      @Designdigitalestefania
/src/                       @Designdigitalestefania
/tests/                     @Designdigitalestefania
/.github/                   @Designdigitalestefania
END_CO
echo "   OK"

# 10. dependabot.yml
echo "10) dependabot.yml..."
cat > .github/dependabot.yml <<'END_DEP'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore(deps)"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore(deps)"
END_DEP
echo "   OK"

# 11. ci.yml
echo "11) workflows/ci.yml..."
cat > .github/workflows/ci.yml <<'END_CI'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint - Typecheck - Test - Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
END_CI
echo "   OK"

# 12. codeql.yml
echo "12) workflows/codeql.yml..."
cat > .github/workflows/codeql.yml <<'END_CQL'
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - uses: github/codeql-action/analyze@v3
END_CQL
echo "   OK"

# 13. dependency-review.yml
echo "13) workflows/dependency-review.yml..."
cat > .github/workflows/dependency-review.yml <<'END_DR'
name: Dependency Review

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
END_DR
echo "   OK"

# 14. Issue templates
echo "14) Issue templates..."
cat > .github/ISSUE_TEMPLATE/bug_report.yml <<'END_BUG'
name: Bug report
description: Reporta un comportamiento inesperado
title: '[BUG] '
labels: ['bug']
body:
  - type: textarea
    id: descripcion
    attributes:
      label: Descripcion
    validations:
      required: true
  - type: textarea
    id: reproduccion
    attributes:
      label: Pasos para reproducir
    validations:
      required: true
  - type: textarea
    id: esperado
    attributes:
      label: Comportamiento esperado
    validations:
      required: true
END_BUG

cat > .github/ISSUE_TEMPLATE/feature_request.yml <<'END_FEAT'
name: Feature request
description: Propon una nueva funcionalidad
title: '[FEATURE] '
labels: ['enhancement']
body:
  - type: textarea
    id: problema
    attributes:
      label: Problema a resolver
    validations:
      required: true
  - type: textarea
    id: propuesta
    attributes:
      label: Solucion propuesta
    validations:
      required: true
END_FEAT

cat > .github/ISSUE_TEMPLATE/security_report.yml <<'END_SEC2'
name: Security report
description: Reporta una vulnerabilidad de forma privada
title: '[SECURITY] '
labels: ['security']
body:
  - type: markdown
    attributes:
      value: |
        NO incluyas detalles explotables en este formulario publico.
        Envia los detalles a estefaniaprzvzqz@outlook.com
  - type: textarea
    id: descripcion
    attributes:
      label: Descripcion general
    validations:
      required: true
END_SEC2

cat > .github/PULL_REQUEST_TEMPLATE.md <<'END_PR'
## Que cambio

## Por que

## Tests

## Impacto de seguridad

## Breaking changes

## Documentacion actualizada

- [ ] README
- [ ] ARCHITECTURE.md
- [ ] ADR

## Checklist

- [ ] Lei CONTRIBUTING.md
- [ ] Lei CODE_OF_CONDUCT.md
- [ ] npm run ci pasa localmente
- [ ] Tests agregados o actualizados
- [ ] Respeto el principio: la tecnologia asiste, el periodista decide
END_PR
echo "   OK"

# 15. docs/ROADMAP.md
echo "15) docs/ROADMAP.md..."
cat > docs/ROADMAP.md <<'END_RM'
# Roadmap - MONITOR CIID

## Fase 0 - Fundacion (actual)

- [x] Repositorio fundacional
- [x] Arquitectura documentada
- [x] Pipeline tipado
- [x] CI configurado
- [x] ADRs iniciales
- [ ] Branch protection en main

## Fase 1 - Modulos core

- [ ] Modulo auth
- [ ] Modulo tenants
- [ ] Modulo ingest
- [ ] Modulo classification
- [ ] Modulo editorial

## Fase 2 - Diferencial linguistico

- [ ] Modulo linguistic
- [ ] Registro de variantes
- [ ] Consentimiento digital
- [ ] Acreditacion de hablantes

## Fase 3 - Distribucion y preservacion

- [ ] Modulo distribution
- [ ] Modulo preservation
- [ ] Modulo metrics
- [ ] Modulo audit

## Fase 4 - Escala territorial

- [ ] Despliegue piloto en 3 comunidades
- [ ] Alianzas con radios comunitarias
- [ ] Auditoria externa
END_RM
echo "   OK"

# 16. docs/decisions
echo "16) ADRs..."
cat > docs/decisions/README.md <<'END_DRD'
# Decisiones arquitectonicas (ADR)

| # | Titulo | Estado |
|---|--------|--------|
| 001 | Capa de decision humana | Aceptada |
| 002 | Participacion ciudadana como fuente | Aceptada |
| 003 | Preservacion cultural en el ciclo | Aceptada |
| 004 | Multi-tenancy desde el inicio | Aceptada |
| 005 | Jerarquia territorial formal | Aceptada |
| 006 | Prohibicion de publicacion automatica | Aceptada |
END_DRD

cat > docs/decisions/001-human-decision-layer.md <<'END_A1'
# ADR-001 - Capa de decision humana

## Estado
Aceptada

## Decision
Toda publicacion requiere decision explicita de un periodista.
El estado DECISION es punto obligatorio del pipeline.

## Consecuencias
- Mayor carga operativa (deseado).
- Trazabilidad de responsabilidad garantizada.
- Se materializa el principio rector.
END_A1

cat > docs/decisions/002-citizen-submissions.md <<'END_A2'
# ADR-002 - Participacion ciudadana

## Estado
Aceptada

## Decision
La ciudadania es fuente de primera clase. Requiere consentimiento informado
y verificacion adicional antes de publicacion.
END_A2

cat > docs/decisions/003-cultural-preservation.md <<'END_A3'
# ADR-003 - Preservacion cultural

## Estado
Aceptada

## Decision
La preservacion es la ultima etapa formal del pipeline, no un agregado.
Cada contenido se preserva con material original, version linguistica
validada, contexto territorial y evidencia de verificacion.
END_A3

cat > docs/decisions/004-multi-tenant.md <<'END_A4'
# ADR-004 - Multi-tenancy desde el inicio

## Estado
Aceptada

## Decision
Toda entidad tiene tenantId desde la primera linea. Ningun dato cruza tenants.
END_A4

cat > docs/decisions/005-territorial-hierarchy.md <<'END_A5'
# ADR-005 - Jerarquia territorial

## Estado
Aceptada

## Decision
Estado - Region - Distrito - Municipio - Localidad - Comunidad.
Campos culturales obligatorios: culturalZone, originLanguage,
languageVariant, validatedBy, consent.
END_A5

cat > docs/decisions/006-no-auto-publishing.md <<'END_A6'
# ADR-006 - Prohibicion de publicacion automatica

## Estado
Aceptada

## Decision
Se prohibe terminantemente la publicacion automatica.
El sistema no puede saltar etapas del pipeline.
END_A6
echo "   OK"

# ------------------------------------------------------------
# Verificacion final
# ------------------------------------------------------------
echo ""
echo "=== Verificacion final ==="
echo ""

echo "Archivos en raiz:"
ls -1 *.md *.json *.yml .env.example CITATION.cff LICENSE .gitignore .gitattributes .eslintrc.json 2>/dev/null | sed 's/^/  /'
echo ""

echo ".github/:"
find .github -type f 2>/dev/null | sort | sed 's/^/  /'
echo ""

echo "docs/:"
find docs -type f 2>/dev/null | sort | sed 's/^/  /'
echo ""

echo "src/:"
find src -type f 2>/dev/null | sort | sed 's/^/  /'
echo ""

echo "tests/:"
find tests -type f 2>/dev/null | sort | sed 's/^/  /'
echo ""

TOTAL=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)
echo "Total: $TOTAL archivos"
echo ""

# Verificar tamaños razonables
echo "Tamaños (los .md deben ser < 10 KB):"
find . -type f -name "*.md" -not -path "./node_modules/*" -exec ls -la {} \; | awk '{print "  " $5 " bytes  " $9}'
echo ""

echo "=== Listo ==="
echo ""
echo "Siguientes pasos:"
echo ""
echo "1) Probar localmente (opcional):"
echo "   cd ~/ciid-mexico && npm install && npm run ci"
echo ""
echo "2) Crear repo vacio en GitHub:"
echo "   https://github.com/new"
echo "   Nombre: ciid-mexico"
echo "   Public, SIN README"
echo ""
echo "3) Conectar y subir:"
echo "   cd ~/ciid-mexico"
echo "   git init"
echo "   git branch -M main"
echo "   git add ."
echo "   git commit -m 'chore: init repositorio fundacional MONITOR CIID v0.1.0'"
echo "   git remote add origin https://github.com/Designdigitalestefania/ciid-mexico.git"
echo "   git push -u origin main"
echo ""
