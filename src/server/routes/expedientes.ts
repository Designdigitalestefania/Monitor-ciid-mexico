import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getExpedienteRepoAsync, getTenantRepoAsync } from '../context.js';
import { IngestService } from '../../modules/ingest/service.js';
import { PipelineService } from '../../modules/pipeline/service.js';
import { TenantsService } from '../../modules/tenants/service.js';
import { crearActor } from '../../domain/actor.js';
import type { RecibirInput } from '../../modules/ingest/types.js';
import type { Expediente } from '../../domain/expediente.js';

async function obtenerExpedienteOr404(id: string, repo: any): Promise<Expediente | null> {
  return repo.obtener(id);
}

export async function expedientesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { tenant?: string; etapa?: string } }>(
    '/api/v1/expedientes',
    { preHandler: requireApiKey },
    async (req) => {
      const repo = await getExpedienteRepoAsync();
      const ingest = new IngestService(repo);
      const { tenant, etapa } = req.query ?? {};
      const filtros: Record<string, string | undefined> = {};
      if (tenant) filtros.tenantId = tenant;
      if (etapa) filtros.etapa = etapa;
      return ingest.filtrar(filtros as never);
    }
  );

  app.post<{ Body: RecibirInput }>(
    '/api/v1/expedientes',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const input = req.body;
      if (!input?.id || !input?.tenantId || !input?.origen || !input?.territorio) {
        return reply.code(400).send({ error: 'Faltan datos' });
      }
      
      const tenantRepo = await getTenantRepoAsync();
      const expRepo = await getExpedienteRepoAsync();
      const tenants = new TenantsService(tenantRepo);
      const ingest = new IngestService(expRepo);

      const tenant = tenants.obtenerPorId(input.tenantId);
      if (!tenant) return reply.code(404).send({ error: 'Tenant no encontrado' });

      const resultado = ingest.recibir(input, tenant);
      if (!resultado.exito) return reply.code(400).send({ error: resultado.razon });
      return reply.code(201).send(resultado.expediente);
    }
  );

  app.patch<{ Params: { id: string }; Body: { razon?: string; actorRol?: string } }>(
    '/api/v1/expedientes/:id/avanzar',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const expRepo = await getExpedienteRepoAsync();
      const exp = await obtenerExpedienteOr404(req.params.id, expRepo);
      if (!exp) return reply.code(404).send({ error: 'No encontrado' });

      const actor = crearActor({ userId: 'op', nombre: 'Operador', rol: (req.body?.actorRol as any) ?? 'periodista', tenantId: exp.tenantId });
      const pipeline = new PipelineService();
      const res = pipeline.avanzar({ expediente: exp, actor, razon: req.body?.razon });
      
      if (!res.exito) return reply.code(400).send({ error: res.razon });
      expRepo.guardar(res.expediente!);
      return res.expediente;
    }
  );

  app.patch<{ Params: { id: string }; Body: { razon?: string } }>(
    '/api/v1/expedientes/:id/aprobar',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const expRepo = await getExpedienteRepoAsync();
      const exp = await obtenerExpedienteOr404(req.params.id, expRepo);
      if (!exp) return reply.code(404).send({ error: 'No encontrado' });

      const actor = crearActor({ userId: 'ed', nombre: 'Editor', rol: 'editor', tenantId: exp.tenantId });
      const pipeline = new PipelineService();
      const res = pipeline.aprobarPublicacion({ expediente: exp, actor, razon: req.body?.razon });
      
      if (!res.exito) return reply.code(400).send({ error: res.razon });
      expRepo.guardar(res.expediente!);
      return res.expediente;
    }
  );
}
