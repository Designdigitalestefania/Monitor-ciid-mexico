import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server/app.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('API · Health', () => {
  it('GET /health responde ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('monitor-ciid');
  });

  it('GET /api/v1/pipeline/etapas devuelve 8 etapas', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/pipeline/etapas',
      headers: { 'x-api-key': 'dev-key-cambiar-en-produccion' },
    });
    expect(res.statusCode).toBe(200);
    const etapas = res.json();
    expect(etapas).toHaveLength(8);
    expect(etapas[0]).toBe('RECEIVED');
    expect(etapas[7]).toBe('PRESERVED');
  });

  it('GET /api/v1/tenants sin API key devuelve 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/tenants' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/v1/tenants con API key devuelve array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/tenants',
      headers: { 'x-api-key': 'dev-key-cambiar-en-produccion' },
    });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
  });
});
