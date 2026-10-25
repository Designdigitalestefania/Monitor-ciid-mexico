import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from './config.js';

export async function requireApiKey(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers['x-api-key'];
  const query = (req.query as Record<string, string> | undefined)?.apiKey;
  const key = Array.isArray(header) ? header[0] : header ?? query;

  if (key !== config.apiKey) {
    reply.code(401).send({ error: 'API key inválida o ausente' });
  }
}
