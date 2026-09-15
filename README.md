<div align="center">

# MONITOR CIID

**Centro Inteligente de Información Digital**

### Modelo de innovación tecnológica para la información

<p>
  <img src="https://img.shields.io/badge/status-fundacional-blue?style=for-the-badge" alt="Estado">
  <img src="https://img.shields.io/badge/version-v0.1.0-green?style=for-the-badge" alt="Versión">
  <img src="https://img.shields.io/badge/license-proprietary-red?style=for-the-badge" alt="Licencia">
</p>

<p><em>"La tecnología asiste. El periodista decide."</em></p>
<p><em>"Innovar para informar. Digitalizar para preservar."</em></p>
<p><strong>De Oaxaca para el mundo.</strong></p>

</div>

---

## Overview

MONITOR CIID es una infraestructura periodística de nueva generación. Transforma
los procesos mediante los cuales los medios reciben, procesan, analizan,
verifican, preservan y distribuyen información.

Su diferencial clave es la **preservación del patrimonio cultural y lingüístico**
de las comunidades originarias, con validación por hablantes nativos y
consentimiento informado.

## Principios

1. **Decisión humana final.** Ninguna publicación se automatiza.
2. **Verificación obligatoria.** Ningún reporte ciudadano se publica sin contraste.
3. **Preservación por diseño.** El archivo patrimonial es parte del ciclo, no un extra.
4. **Multi-tenancy desde el día uno.** Cada organización es un espacio aislado.
5. **Trazabilidad total.** Cada decisión deja registro auditable.

## Arquitectura

Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para el pipeline completo, la
jerarquía territorial y el modelo multi-tenant.

## Pipeline

```

INGESTA → NORMALIZACIÓN → CLASIFICACIÓN → ASISTENCIA EDITORIAL
→ VERIFICACIÓN → VALIDACIÓN LINGÜÍSTICA → DECISIÓN HUMANA
→ DISTRIBUCIÓN → PRESERVACIÓN → MÉTRICAS

```

## Seguridad

Consulta [SECURITY.md](./SECURITY.md). Reportes privados a **estefaniaprzvzqz@outlook.com**.

## Desarrollo

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

Testing

· tests/unit/ — Pruebas unitarias de lógica de dominio.
· tests/integration/ — Pruebas de integración entre módulos.
· tests/e2e/ — Pruebas de extremo a extremo.
· tests/security/ — Pruebas de reglas de acceso y aislamiento de tenant.

Gobernanza

Consulta GOVERNANCE.md.

Roadmap

Consulta docs/ROADMAP.md.

Decisiones arquitectónicas

Consulta docs/decisions/.

Licencia

Propietaria. Todos los derechos reservados. Ver LICENSE.

---

<div align="center">

<em>Hecho con 💙 en Oaxaca, México.</em>

</div>
