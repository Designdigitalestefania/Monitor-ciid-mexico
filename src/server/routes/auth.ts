import type { FastifyInstance } from 'fastify';

const USUARIOS = {
  'estefania': { password: 'Monitoreo2026!', rol: 'admin' },
  'periodista': { password: 'MonitorNoticias2026!', rol: 'periodista' }
};

export async function authRoutes(app: FastifyInstance) {
  
  // Página de login
  app.get('/login.html', async (_req, reply) => {
    return reply.sendFile('login.html');
  });

  // Procesar login
  app.post('/api/v1/auth/login', async (req, reply) => {
    const { usuario, password } = req.body as any;
    const user = USUARIOS[usuario as keyof typeof USUARIOS];

    if (user && user.password === password) {
      // Crear cookie de sesión (dura 1 día)
      reply.setCookie('ciid_session', 'token_valido', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400 // 24 horas
      });
      return { ok: true, rol: user.rol };
    }
    
    return reply.code(401).send({ error: 'Credenciales incorrectas' });
  });

  // Cerrar sesión
  app.post('/api/v1/auth/logout', async (_req, reply) => {
    reply.clearCookie('ciid_session', { path: '/' });
    return { ok: true };
  });
}
