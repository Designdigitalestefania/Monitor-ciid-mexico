-- ============================================================
-- MONITOR CIID · Esquema SQLite
-- ============================================================
-- Este archivo es la fuente de verdad del esquema de la base
-- de datos local. En produccion, este esquema se migra a
-- PostgreSQL o Firestore sin cambios en el dominio.
--
-- Patron: cada tabla almacena el objeto completo serializado
-- en la columna 'data' (JSON). Esto permite que el repositorio
-- generico funcione sin conocer los campos especificos de cada
-- entidad.
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
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Registros patrimoniales (preservation)
CREATE TABLE IF NOT EXISTS registros_patrimoniales (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Reportes ciudadanos (citizen)
CREATE TABLE IF NOT EXISTS reportes_ciudadanos (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Hablantes (linguistic)
CREATE TABLE IF NOT EXISTS hablantes (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Validaciones linguisticas
CREATE TABLE IF NOT EXISTS validaciones (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

-- Distribuciones
CREATE TABLE IF NOT EXISTS distribuciones (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
