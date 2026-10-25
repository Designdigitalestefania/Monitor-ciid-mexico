import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getExpedienteRepoAsync } from '../context.js';

const ETAPAS = ['RECEIVED', 'PROCESSING', 'CLASSIFIED', 'EDITORIAL_REVIEW', 'VERIFICATION', 'DECISION', 'PUBLISHED', 'PRESERVED'] as const;

export async function pipelineRoutes(app: FastifyInstance) {
  app.get('/api/v1/pipeline/etapas', { preHandler: requireApiKey }, async () => ETAPAS);

  app.get<{ Querystring: { tenant?: string } }>('/api/v1/pipeline/resumen', { preHandler: requireApiKey }, async (req) => {
    const repo = await getExpedienteRepoAsync();
    const todos = repo.listar();
    const filtrados = req.query?.tenant ? todos.filter((e: any) => e.tenantId === req.query.tenant) : todos;
    const porEtapa: Record<string, number> = {};
    for (const etapa of ETAPAS) porEtapa[etapa] = 0;
    for (const e of filtrados) porEtapa[e.etapaActual] = (porEtapa[e.etapaActual] ?? 0) + 1;
    return { total: filtrados.length, porEtapa, tenant: req.query?.tenant ?? null };
  });
}
