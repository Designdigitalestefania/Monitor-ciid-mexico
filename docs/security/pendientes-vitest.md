# Vulnerabilidades pendientes · Vitest / Vite / esbuild

## Estado

**Última revisión:** 2026-09-15

Actualmente existen 5 vulnerabilidades reportadas por Dependabot en
dependencias **de desarrollo** (no llegan a producción):

- `vitest` (framework de tests)
- `vite` (bundler de desarrollo)
- `esbuild` (compilador interno de vite)
- `@vitest/mocker` (módulo interno de vitest)

## Por qué no se han resuelto aún

La corrección oficial requiere actualizar a `vitest@5.0.1`, que introduce
**breaking changes** en la configuración de tests y en el mocking.

Actualizar en este momento implicaría:

1. Reescribir la configuración de `vitest.config.ts`.
2. Revisar y ajustar los 35 tests existentes.
3. Verificar compatibilidad con TypeScript 5.6.
4. Detener el desarrollo de nuevos módulos durante la migración.

Dado que estas vulnerabilidades **no afectan producción** (el código
desplegado es HTML+CSS+JS estático, sin estas dependencias), se decide:

- **Mantener** la versión actual estable de vitest (2.1.9).
- **Documentar** la decisión.
- **Planificar** la migración para una fase específica del roadmap.

## Análisis de riesgo

| Aspecto | Riesgo |
|---------|--------|
| Exposición en producción | ❌ Nulo |
| Superficie de ataque | Solo en entorno de desarrollo local |
| Impacto si se explota | Bajo (requiere acceso físico o red local) |
| Mitigación posible | No exponer el servidor de Vitest en red pública |

## Plan de migración

Programado para la **Fase 2 del roadmap**, antes de:

- [ ] Primera release estable (v1.0.0).
- [ ] Auditoría externa de seguridad.
- [ ] Publicación de casos de uso.

## Referencias

- [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) (Vitest path traversal)
- [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) (esbuild dev server)
- [Vitest 5 release notes](https://github.com/vitest-dev/vitest/releases)
