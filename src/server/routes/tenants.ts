import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getTenantRepo } from '../context.js';
import { TenantsService } from '../../modules/tenants/service.js';
import type { CrearTenantInput } from '../../modules/tenants/types.js';

export async function tenantsRoutes(app: FastifyInstance) {
  const svc = new TenantsService(getTenantRepo());

  app.get('/api/v1/tenants', { preHandler: requireApiKey }, async () => {
    return svc.listar();
  });

  app.get<{ Params: { id: string } }>(
    '/api/v1/tenants/:id',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const t = svc.obtenerPorId(req.params.id);
      if (!t) return reply.code(404).send({ error: 'Tenant no encontrado' });
      return t;
    }
  );

  app.post<{ Body: CrearTenantInput }>(
    '/api/v1/tenants',
    { preHandler: requireApiKey },
    async (req, reply) => {
      const { id, nombre, tipo, territorioId } = req.body ?? ({} as CrearTenantInput);
      if (!id || !nombre || !tipo || !territorioId) {
        return reply
          .code(400)
          .send({ error: 'id, nombre, tipo y territorioId son requeridos' });
      }
      try {
        const t = svc.crear({ id, nombre, tipo, territorioId });
        return reply.code(201).send(t);
      } catch (e) {
        const err = e as Error;
        return reply.code(409).send({ error: err.message });
      }
    }
  );
}
