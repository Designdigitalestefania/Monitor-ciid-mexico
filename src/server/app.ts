import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import staticPlugin from '@fastify/static';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import { healthRoutes } from './routes/health.js';
import { tenantsRoutes } from './routes/tenants.js';
import { expedientesRoutes } from './routes/expedientes.js';
import { pipelineRoutes } from './routes/pipeline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', '..', 'public');

interface ErrorConCodigo {
  statusCode?: number;
  message?: string;
  code?: string;
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.env === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, { origin: true });
  await app.register(formbody);
  await app.register(staticPlugin, { root: publicDir, prefix: '/' });

  await app.register(healthRoutes);
  await app.register(tenantsRoutes);
  await app.register(expedientesRoutes);
  await app.register(pipelineRoutes);

  app.setErrorHandler((err: unknown, _req, reply) => {
    const e = err as ErrorConCodigo;
    app.log.error(err);
    reply.code(e.statusCode ?? 500).send({
      error: e.message ?? 'Error interno',
      code: e.code ?? 'INTERNAL_ERROR',
    });
  });

  return app;
}
