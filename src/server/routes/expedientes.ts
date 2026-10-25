// @ts-nocheck
import type { FastifyInstance } from 'fastify';
import { requireApiKey } from '../auth.js';
import { getExpedienteRepoAsync, getTenantRepoAsync } from '../context.js';
import { IngestService } from '../../modules/ingest/service.js';
import { TenantsService } from '../../modules/tenants/service.js';
import { crearActor } from '../../domain/actor.js';
import { PipelineService } from '../../modules/pipeline/service.js';

export async function expedientesRoutes(app: FastifyInstance) {
  
  // 1. LISTAR EXPEDIENTES (Para la bandeja)
  app.get('/api/v1/expedientes', { preHandler: requireApiKey }, async () => {
    const expRepo = await getExpedienteRepoAsync();
    return expRepo.listar();
  });

  // 2. OBTENER UN EXPEDIENTE (La ruta que faltaba)
  app.get('/api/v1/expedientes/:id', { preHandler: requireApiKey }, async (req, reply) => {
    const expRepo = await getExpedienteRepoAsync();
    const exp = await expRepo.obtener(req.params.id);
    if (!exp) return reply.code(404).send({ error: 'Expediente no encontrado' });
    return exp;
  });

  // 3. CREAR EXPEDIENTE
  app.post('/api/v1/expedientes', { preHandler: requireApiKey }, async (req, reply) => {
    const input = req.body;
    if (!input?.id || !input?.tenantId || !input?.origen || !input?.territorio) {
      return reply.code(400).send({ error: 'Faltan datos obligatorios' });
    }
    
    const tenantRepo = await getTenantRepoAsync();
    const expRepo = await getExpedienteRepoAsync();
    const tenants = new TenantsService(tenantRepo);

    let tenant = tenants.obtenerPorId(input.tenantId);
    if (!tenant) {
      tenant = tenants.crear({ id: input.tenantId, nombre: "Monitor Noticias", tipo: "medio", territorioId: input.territorio.id } as any);
    }

    const ingest = new IngestService(expRepo);
    const resultado = ingest.recibir(input, tenant);
    
    if (!resultado.exito) return reply.code(400).send({ error: resultado.razon });
    return reply.code(201).send(resultado.expediente);
  });

  // 4. AVANZAR ETAPA
  app.patch('/api/v1/expedientes/:id/avanzar', { preHandler: requireApiKey }, async (req, reply) => {
    const expRepo = await getExpedienteRepoAsync();
    const exp = await expRepo.obtener(req.params.id);
    if (!exp) return reply.code(404).send({ error: 'No encontrado' });

    const actor = crearActor({ userId: 'op', nombre: 'Operador', rol: 'periodista' as any, tenantId: exp.tenantId });
    const res = new PipelineService().avanzar({ expediente: exp, actor, razon: req.body?.razon });
    
    if (!res.exito) return reply.code(400).send({ error: res.razon });
    expRepo.guardar(res.expediente!);
    return res.expediente;
  });

  // 5. APROBAR Y PUBLICAR
  app.patch('/api/v1/expedientes/:id/aprobar', { preHandler: requireApiKey }, async (req, reply) => {
    const expRepo = await getExpedienteRepoAsync();
    const exp = await expRepo.obtener(req.params.id);
    if (!exp) return reply.code(404).send({ error: 'No encontrado' });

    const actor = crearActor({ userId: 'ed', nombre: 'Editor', rol: 'editor' as any, tenantId: exp.tenantId });
    const res = new PipelineService().aprobarPublicacion({ expediente: exp, actor, razon: req.body?.razon });
    
    if (!res.exito) return reply.code(400).send({ error: res.razon });
    expRepo.guardar(res.expediente!);
    return res.expediente;
  });
}
