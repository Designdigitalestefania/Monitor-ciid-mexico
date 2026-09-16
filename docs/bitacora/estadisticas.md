# Estadisticas del proyecto

Metricas acumuladas de MONITOR CIID, actualizadas por sesion.

Ultima actualizacion: 2026-09-15

## Resumen ejecutivo

| Metrica | Valor |
|---------|-------|
| Version actual | v0.5.0 |
| Sesiones registradas | 1 |
| Modulos funcionales | 5 |
| Tests pasando | 99 |
| Archivos de produccion | 29 |
| Lineas de produccion | 1,333 |
| Archivos de tests | 15 |
| Lineas de tests | 1,558 |
| Ratio test/produccion | 1.17:1 |
| Duracion del CI | ~18 segundos |
| Estado del CI | Verde |

## Historial por fase

| Fase | Fecha | Modulo | Tests | Lineas prod | Lineas tests |
|------|-------|--------|-------|-------------|--------------|
| 0 | 2026-09-15 | Repositorio fundacional | 0 | 0 | 0 |
| 1 | 2026-09-15 | Dominio puro | 35 | ~434 | ~700 |
| 2 | 2026-09-15 | Tenants | 51 | ~613 | ~900 |
| 3 | 2026-09-15 | Ingest | 64 | ~841 | ~1200 |
| 4 | 2026-09-15 | Pipeline | 86 | ~1104 | ~1400 |
| 5 | 2026-09-15 | Preservation | 99 | ~1333 | ~1558 |

## Distribucion del codigo

### Modulos de produccion

| Modulo | Archivos | Descripcion |
|--------|----------|-------------|
| domain | 8 | Dominio puro del sistema |
| modules/tenants | 5 | Multi-tenancy |
| modules/ingest | 5 | Ingesta de informacion |
| modules/pipeline | 4 | Maquina de estados |
| modules/preservation | 4 | Archivo patrimonial |
| src/index.ts | 1 | Punto de entrada |
| **Total** | **27 + 2** | **29** |

### Tests por categoria

| Categoria | Archivos | Tests |
|-----------|----------|-------|
| unit/domain | 6 | 33 |
| unit/modules/tenants | 1 | 13 |
| unit/modules/ingest | 1 | 9 |
| unit/modules/pipeline | 1 | 17 |
| unit/modules/preservation | 1 | 10 |
| integration | 4 | 15 |
| security | 1 | 2 |
| **Total** | **15** | **99** |

## Reglas duras probadas

| # | Regla | Test asociado |
|---|-------|---------------|
| 1 | Aislamiento estricto entre tenants | security/aislamiento-tenant |
| 2 | No se saltan etapas del pipeline | unit/domain/etapa |
| 3 | DECISION requiere actor humano | integration/pipeline-completo |
| 4 | Publicacion solo desde DECISION | unit/modules/pipeline |
| 5 | Devolucion requiere razon | unit/modules/pipeline |
| 6 | Rechazo solo desde VERIFICATION o DECISION | unit/modules/pipeline |
| 7 | Trazabilidad completa con actor + timestamp | integration/pipeline-completo |
| 8 | Preservacion solo desde PUBLISHED | unit/modules/preservation |
| 9 | Archivo patrimonial aisla por tenant | integration/preservation-completo |
| 10 | Lenguas conservan variante especifica | integration/preservation-completo |

## Estado de seguridad

| Herramienta | Estado |
|-------------|--------|
| Dependabot | Activo |
| Secret scanning | Activo |
| Push protection | Activo |
| CodeQL | Activo |
| Branch protection en main | Activo |

### Vulnerabilidades conocidas

Actualmente 7 vulnerabilidades en dependencias de desarrollo
(Vitest, Vite, esbuild). Documentadas en `docs/security/pendientes-vitest.md`.
No afectan produccion.

## Estado de documentacion

| Documento | Estado |
|-----------|--------|
| README.md | Completo |
| ARCHITECTURE.md | Completo |
| GOVERNANCE.md | Completo |
| SECURITY.md | Completo |
| CONTRIBUTING.md | Completo |
| CODE_OF_CONDUCT.md | Completo |
| CHANGELOG.md | En curso |
| docs/ROADMAP.md | Completo |
| docs/decisions/ | 6 ADRs |
| docs/CONSENTIMIENTO-INFORMADO.md | Completo |
| docs/bitacora/ | Activo |

## Siguiente fase

Fase 6: Modulo de participacion ciudadana.

---

<p align="center">
  <em>Medir es respetar el trabajo propio.</em>
</p>
