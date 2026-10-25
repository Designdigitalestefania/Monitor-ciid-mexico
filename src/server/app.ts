import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import staticPlugin from '@fastify/static';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';
import { healthRoutes } from './routes/health.js';
import { tenantsRoutes } from './routes/tenants.js';
import { expedientesRoutes } from './routes/expedientes.js';
import { pipelineRoutes } from './routes/pipeline.js';
import { authRoutes } from './routes/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', '..', 'public');

export async function buildApp() {
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(formbody);
  await app.register(cookie, { secret: 'secreto-super-seguro-cambiar' });
  await app.register(staticPlugin, { root: publicDir, prefix: '/' });

  // Rutas Públicas (Login y Health)
  await app.register(authRoutes);
  await app.register(healthRoutes);

  // Rutas Protegidas
  await app.register(tenantsRoutes);
  await app.register(expedientesRoutes);
  await app.register(pipelineRoutes);

  app.setErrorHandler((err: any, _req, reply) => {
    reply.code(err.statusCode ?? 500).send({ error: err.message });
  });

  return app;
}
