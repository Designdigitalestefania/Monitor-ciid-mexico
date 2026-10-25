import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getTenantRepoAsync } from '../context.js';
import { TenantsService } from '../../modules/tenants/service.js';

export async function tenantsRoutes(app: FastifyInstance) {
  app.get('/api/v1/tenants', { preHandler: requireApiKey }, async () => {
    const repo = await getTenantRepoAsync();
    const svc = new TenantsService(repo);
    return svc.listar();
  });

  app.post<{ Body: any }>('/api/v1/tenants', { preHandler: requireApiKey }, async (req, reply) => {
    const repo = await getTenantRepoAsync();
    const svc = new TenantsService(repo);
    try {
      // Forzamos a "any" para que TypeScript no se queje
      const t = svc.crear(req.body as any);
      return reply.code(201).send(t);
    } catch (e: any) {
      return reply.code(409).send({ error: e.message });
    }
  });
}
