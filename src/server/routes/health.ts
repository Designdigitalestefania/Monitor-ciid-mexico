import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'monitor-ciid',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

  app.get('/api/v1/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    env: process.env.NODE_ENV ?? 'development',
  }));
}
