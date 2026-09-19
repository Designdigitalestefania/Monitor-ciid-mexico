-- ============================================================
-- MONITOR CIID · Esquema SQLite
-- ============================================================
-- Este archivo es la fuente de verdad del esquema de la base
-- de datos local. En produccion, este esquema se migra a
-- PostgreSQL o Firestore sin cambios en el dominio.
--
-- Ver docs/decisions/004-multi-tenant.md
-- ============================================================

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Expedientes (ingest + pipeline)
CREATE TABLE IF NOT EXISTS expedientes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  etapa_actual TEXT NOT NULL,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_expedientes_tenant
  ON expedientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_etapa
  ON expedientes(etapa_actual);

-- Registros patrimoniales (preservation)
CREATE TABLE IF NOT EXISTS registros_patrimoniales (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  preservado_en TEXT NOT NULL,
  data TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_registros_tenant
  ON registros_patrimoniales(tenant_id);

-- Reportes ciudadanos (citizen)
CREATE TABLE IF NOT EXISTS reportes_ciudadanos (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  estado TEXT NOT NULL,
  canal TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  data TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_reportes_tenant
  ON reportes_ciudadanos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado
  ON reportes_ciudadanos(estado);

-- Hablantes (linguistic)
CREATE TABLE IF NOT EXISTS hablantes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  lengua_id TEXT NOT NULL,
  variante_id TEXT NOT NULL,
  acreditado_en TEXT NOT NULL,
  data TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_hablantes_tenant
  ON hablantes(tenant_id);

-- Validaciones linguisticas
CREATE TABLE IF NOT EXISTS validaciones (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  expediente_id TEXT NOT NULL,
  hablante_id TEXT NOT NULL,
  estado TEXT NOT NULL,
  creada_en TEXT NOT NULL,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_validaciones_tenant
  ON validaciones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_expediente
  ON validaciones(expediente_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_estado
  ON validaciones(estado);

-- Distribuciones
CREATE TABLE IF NOT EXISTS distribuciones (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  expediente_id TEXT NOT NULL,
  canal TEXT NOT NULL,
  estado TEXT NOT NULL,
  creada_en TEXT NOT NULL,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_distribuciones_tenant
  ON distribuciones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_distribuciones_expediente
  ON distribuciones(expediente_id);
CREATE INDEX IF NOT EXISTS idx_distribuciones_canal
  ON distribuciones(canal);
