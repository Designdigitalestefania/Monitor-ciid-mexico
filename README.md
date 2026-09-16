<div align="center">

<img src="./assets/logo-ciid.svg" alt="MONITOR CIID" width="320">

# MONITOR CIID

**Centro Inteligente de Informacion Digital**

<p>
  <img src="https://img.shields.io/badge/version-v0.5.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/tests-99_passing-success?style=for-the-badge" alt="Tests">
  <img src="https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/deploy-Netlify-00C7B7?style=for-the-badge" alt="Deploy">
</p>

<p><em>"La tecnologia asiste. El periodista decide."</em></p>

</div>

---

## Estado del proyecto

**Piloto tecnico fundacional completado.**

| Aspecto | Estado |
|---------|--------|
| Version | v0.5.0 |
| Modulos funcionales | 5 |
| Tests automatizados | 99 |
| Estado del CI | Verde |

## Concepto

**MONITOR CIID** es una infraestructura periodistica de nueva generacion
que asiste al periodista en el procesamiento, verificacion, distribucion
y preservacion de informacion, con preservacion del patrimonio cultural
y linguistico de las comunidades de Oaxaca.

> **"El objetivo no es publicar mas rapido. El objetivo es publicar mejor."**

## Modulos del sistema

| Modulo | Responsabilidad | Tests |
|--------|----------------|-------|
| domain | Entidades y reglas puras | 33 |
| tenants | Multi-tenancy con aislamiento | 13 |
| ingest | Puerta de entrada al pipeline | 9 |
| pipeline | Maquina de estados | 17 |
| preservation | Archivo patrimonial | 10 |
| Integracion | Flujo completo | 15 |
| Seguridad | Aislamiento entre tenants | 2 |
| **Total** | | **99** |

## Reglas duras implementadas

1. **Aislamiento estricto entre tenants.** Ningun dato cruza fronteras.
2. **No se saltan etapas.** El pipeline es lineal.
3. **DECISION requiere actor humano.** Periodista o editor.
4. **No hay publicacion automatica.** La tecnologia asiste, no decide.
5. **Trazabilidad completa.** Cada transicion con actor, rol, timestamp y razon.
6. **Preservacion inmutable.** Un expediente preservado no se modifica.
7. **Lenguas originarias conservan su variante.** No se homogenizan.

## Instalacion

git clone https://github.com/Designdigitalestefania/Monitor-ciid-mexico.git
cd Monitor-ciid-mexico
npm install
npm run test
npm run ci

## Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| npm run lint | ESLint sobre TypeScript |
| npm run typecheck | Verificacion de tipos |
| npm run test | Ejecucion de los 99 tests |
| npm run build | Compilacion a dist/ |
| npm run ci | Pipeline completo |

## Documentacion

| Documento | Contenido |
|-----------|-----------|
| ARCHITECTURE.md | Arquitectura del sistema |
| GOVERNANCE.md | Gobernanza del proyecto |
| SECURITY.md | Politica de seguridad |
| CONTRIBUTING.md | Guia de contribucion |
| docs/ROADMAP.md | Plan de desarrollo |
| docs/decisions/ | Architecture Decision Records |
| docs/bitacora/ | Bitacora del proyecto |

## Demo publica

Pipeline visual: https://monitorciid.netlify.app/?demo=2

## Releases

- v0.5.0 · Piloto tecnico fundacional

## Autoria

**Estefania Perez Vazquez** - Creadora y directora del proyecto
Estrategia e Innovacion Digital - Arquitectura de Proyectos Tecnologicos

Proyectos creados por la misma autora:
- MONITOR CIID - Centro Inteligente de Informacion Digital
- IXIMI LEGACY - Tecnologia para preservar cultura

## Licencia

Propietaria. Todos los derechos reservados.

---

<em>Innovar para informar. Digitalizar para preservar.</em>
Hecho con cuidado en Oaxaca, Mexico.
