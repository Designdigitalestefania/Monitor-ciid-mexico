import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getExpedienteRepo, getTenantRepo } from '../context.js';
import { IngestService } from '../../modules/ingest/service.js';
import { PipelineService } from '../../modules/pipeline/service.js';
import { TenantsService } from '../../modules/tenants/service.js';
import { crearActor } from '../../domain/actor.js';
import type { RecibirInput } from '../../modules/ingest/types.js';
import type { Expediente } from '../../domain/expediente.js';

function obtenerExpedienteOr404(
  id: string,
  ingest: IngestService
): Expediente | null {
  const exp: Expediente | null = ingest.obtenerPorId(id);
  return exp;
}

export async function expedientesRoutes(app: FastifyInstance) {
  const ingest = new IngestService(getExpedienteRepo());
  const pipeline = new PipelineService();
  const tenants = new TenantsService(getTenantRepo());

  app.get<{ Querystring: { tenant?: string; etapa?: string } }>(
    '/api/v1/expedientes',
    { preHandler: requireApiKey },
    async (req) => {
      const { tenant, etapa } = req.query ?? {};
      const filtros: Record<string, string | undefined> = {};
      if (tenant) filtros.tenantId = tenant;
      if (etapa) filtros.etapa = etapa;
      return ingest.filtrar(filtros as never);
    }
  );

  app.get<{ Params: { id: string } }>(
    '/api/v1/expedientes/:id',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const e = obtenerExpedienteOr404(req.params.id, ingest);
      if (!e) return reply.code(404).send({ error: 'Expediente no encontrado' });
      return e;
    }
  );

  app.post<{ Body: RecibirInput }>(
    '/api/v1/expedientes',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const input = req.body;
      if (!input?.id || !input?.tenantId || !input?.origen || !input?.territorio) {
        return reply
          .code(400)
          .send({ error: 'id, tenantId, origen y territorio son requeridos' });
      }

      const tenant = tenants.obtenerPorId(input.tenantId);
      if (!tenant) {
        return reply.code(404).send({ error: 'Tenant no encontrado: ' + input.tenantId });
      }

      const resultado = ingest.recibir(input, tenant);
      if (!resultado.exito) {
        return reply.code(400).send({ error: resultado.razon });
      }
      return reply.code(201).send(resultado.expediente);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { razon?: string; actorNombre?: string; actorRol?: string };
  }>(
    '/api/v1/expedientes/:id/avanzar',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const exp = obtenerExpedienteOr404(req.params.id, ingest);
      if (!exp) return reply.code(404).send({ error: 'Expediente no encontrado' });

      const actor = crearActor({
        userId: 'operador',
        nombre: req.body?.actorNombre ?? 'Operador CIID',
        rol: (req.body?.actorRol as never) ?? 'periodista',
        tenantId: exp.tenantId,
      });

      const resultado = pipeline.avanzar({
        expediente: exp,
        actor,
        razon: req.body?.razon,
      });

      if (!resultado.exito || !resultado.expediente) {
        return reply.code(400).send({ error: resultado.razon ?? 'Error al avanzar' });
      }

      getExpedienteRepo().guardar(resultado.expediente);
      return resultado.expediente;
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { razon?: string; actorNombre?: string; actorRol?: string };
  }>(
    '/api/v1/expedientes/:id/aprobar',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const exp = obtenerExpedienteOr404(req.params.id, ingest);
      if (!exp) return reply.code(404).send({ error: 'Expediente no encontrado' });

      const actor = crearActor({
        userId: 'operador',
        nombre: req.body?.actorNombre ?? 'Editor CIID',
        rol: (req.body?.actorRol as never) ?? 'editor',
        tenantId: exp.tenantId,
      });

      const resultado = pipeline.aprobarPublicacion({
        expediente: exp,
        actor,
        razon: req.body?.razon,
      });

      if (!resultado.exito || !resultado.expediente) {
        return reply.code(400).send({ error: resultado.razon ?? 'Error al aprobar' });
      }

      getExpedienteRepo().guardar(resultado.expediente);
      return resultado.expediente;
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { razon: string; actorNombre?: string; actorRol?: string };
  }>(
    '/api/v1/expedientes/:id/devolver',
    { preHandler: requireApiKey },
    async (req, reply) => {
      if (!req.body?.razon) {
        return reply.code(400).send({ error: 'razon es requerida para devolver' });
      }

      const exp = obtenerExpedienteOr404(req.params.id, ingest);
      if (!exp) return reply.code(404).send({ error: 'Expediente no encontrado' });

      const actor = crearActor({
        userId: 'operador',
        nombre: req.body?.actorNombre ?? 'Editor CIID',
        rol: (req.body?.actorRol as never) ?? 'editor',
        tenantId: exp.tenantId,
      });

      const resultado = pipeline.devolver({
        expediente: exp,
        actor,
        razon: req.body.razon,
      });

      if (!resultado.exito || !resultado.expediente) {
        return reply.code(400).send({ error: resultado.razon ?? 'Error al devolver' });
      }

      getExpedienteRepo().guardar(resultado.expediente);
      return resultado.expediente;
    }
  );
}
