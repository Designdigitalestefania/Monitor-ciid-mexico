import { buildApp } from './app.js';
import { config } from './config.js';
import { getTenantRepoAsync } from './context.js';

async function main() {
  console.log('🚀 Iniciando MONITOR CIID...');
  
  // Inicializar repositorios ANTES de arrancar el servidor
  await getTenantRepoAsync();
  
  const app = await buildApp();
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`MONITOR CIID escuchando en http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
