import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireApiKey(req: FastifyRequest, reply: FastifyReply) {
  // Verificar si el usuario tiene la cookie de sesión
  const session = req.cookies.ciid_session;
  
  if (session === 'token_valido') {
    return; // Usuario logueado, puede pasar
  }

  // Si es una petición de API (no del navegador), verificar la API Key
  const key = req.headers['x-api-key'];
  if (key === 'dev-key-cambiar-en-produccion') {
    return; // API Key válida para pruebas
  }

  // Si no está logueado y no tiene API Key, bloquear
  reply.code(401).send({ error: 'No autorizado. Inicia sesión.' });
}
