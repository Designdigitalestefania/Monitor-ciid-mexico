# Sesion fundacional · 2026-09-15

## Contexto

Primera sesion de desarrollo de MONITOR CIID como proyecto tecnico formal.

Objetivo declarado: construir la base tecnica del proyecto desde cero,
con estandares profesionales, documentacion institucional y arquitectura
auditable.

## Objetivos de la sesion

1. Publicar una demo navegable del piloto en Netlify.
2. Crear el repositorio fundacional en GitHub.
3. Construir el dominio puro con tests.
4. Construir los modulos funcionales del pipeline.
5. Dejar CI/CD, seguridad y documentacion institucional operativos.

## Trabajo realizado

### Demo navegable

- Demo HTML + JS vanilla desplegada en Netlify.
- URL publica: https://monitorciid.netlify.app
- Auto-deploy desde GitHub.
- Pipeline CIID visual de 8 etapas.
- Narracion por voz con Web Speech API.
- Modo presentacion narrativo.

### Repositorio fundacional

- Repositorio: https://github.com/Designdigitalestefania/Monitor-ciid-mexico
- Documentacion institucional completa.
- 6 ADRs iniciales.
- CI/CD con GitHub Actions.
- CodeQL activo.
- Dependabot activo.
- Branch protection en main.

### Modulos del piloto tecnico

| Fase | Modulo | Descripcion |
|------|--------|-------------|
| 1 | domain | Dominio puro: tenant, territorio, lengua, actor, etapa, expediente |
| 2 | tenants | Multi-tenancy con aislamiento estricto |
| 3 | ingest | Puerta de entrada al pipeline |
| 4 | pipeline | Maquina de estados con validacion de transiciones |
| 5 | preservation | Archivo patrimonial vivo |

## Commits de la sesion
ad213cb feat(preservation): Fase 5 - modulo preservation con archivo patrimonial
13bfa69 feat(pipeline): Fase 4 - maquina de estados con validacion de transiciones
30577a1 feat(ingest): Fase 3 - modulo ingest con servicio y tests de integracion
28e25d5 feat(tenants): Fase 2 - modulo tenants con servicio, reglas y tests
41f965d chore(deps): actualiza a vitest 2.1.9 y documenta vulnerabilidades de dev
6761312 Merge branch 'main' of https://github.com/Designdigitalestefania/Monitor-ciid-mexico
389cbfd feat(domain): Fase 1 - dominio puro CIID con 35 tests
3fead84 Merge pull request #10 from Designdigitalestefania/alert-autofix-1

```

## Metricas

### Codigo de produccion

- **Archivos:** 29
- **Lineas:** 1,333
- **Distribucion:**
  - domain: 8 archivos
  - modules/tenants: 5 archivos
  - modules/ingest: 5 archivos
  - modules/pipeline: 4 archivos
  - modules/preservation: 4 archivos
  - src/index.ts: 1 archivo

### Tests

- **Archivos:** 15
- **Tests:** 99
- **Lineas:** 1,558
- **Ratio test/produccion:** 1.17:1

### Distribucion de tests

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

### CI/CD

- **Workflows activos:** 3 (CI, CodeQL, Dependency Review)
- **Duracion del CI:** ~18 segundos
- **Estado:** verde en cada push

## Decisiones tomadas (ADRs)

- **ADR-001:** Capa de decision humana obligatoria.
- **ADR-002:** Participacion ciudadana como fuente de primera clase.
- **ADR-003:** Preservacion cultural como parte del ciclo.
- **ADR-004:** Multi-tenancy desde el dia uno.
- **ADR-005:** Jerarquia territorial formal.
- **ADR-006:** Prohibicion de publicacion automatica.

## Reglas duras implementadas y probadas

1. Ningun dato cruza fronteras entre tenants.
2. No se puede saltar etapas del pipeline.
3. DECISION requiere actor humano con rol periodista o editor.
4. Publicacion solo desde DECISION con permiso editorial.
5. Devolucion solo desde DECISION con razon obligatoria.
6. Rechazo solo desde VERIFICATION o DECISION.
7. Cada transicion queda registrada con actor, rol, timestamp y razon.
8. Preservacion solo desde PUBLISHED y con historial completo.
9. El archivo patrimonial aisla registros por tenant.
10. Las lenguas originarias conservan su variante especifica.

## Aprendizajes

### Tecnicos

- Termux permite desarrollo profesional completo en Android.
- Pegar archivos grandes en Termux rompe here-documents; es mejor bloque por bloque.
- Vitest 2.x tiene vulnerabilidades conocidas en sus dependencias de dev, documentadas.
- La separacion estricta dominio / modulos / infraestructura desde el inicio evita deuda tecnica.

### De proceso

- Trabajar en bloques pequenos permite verificar cada paso.
- Un test que falla por expectativa incorrecta no indica bug en produccion.
- El ratio test/produccion de 1.17:1 es indicador de disciplina real.
- Un CI en 18 segundos permite iterar rapido sin friccion.

## Obstaculos resueltos

1. Corrupcion de here-documents al pegar scripts grandes en Termux.
   Solucion: dividir en bloques de un archivo cada uno.

2. Conflictos de merge al subir por primera vez a GitHub.
   Solucion: usar `git pull --allow-unrelated-histories -X ours`.

3. Vulnerabilidades de dependencias de desarrollo.
   Solucion: actualizar a versiones estables y documentar pendientes.

## Estado al cierre de la sesion

- **Piloto tecnico:** completado.
- **Version:** v0.5.0.
- **Tests:** 99 pasando.
- **CI:** verde.
- **Demo publica:** funcionando.
- **Repositorio:** institucional y auditable.

## Siguiente paso

1. Crear tag v0.5.0 y publicar release en GitHub.
2. Actualizar README con estado del proyecto.
3. Iniciar Fase 6: modulo de participacion ciudadana.
4. Documentar ADR-007 sobre el modelo de archivado patrimonial.

---

<p align="center">
  <em>Sesion fundacional cerrada con 99 tests en verde.</em>
</p>
