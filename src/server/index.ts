import { buildApp } from './app.js';
import { config } from './config.js';

async function main() {
  const app = await buildApp();
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`MONITOR CIID escuchando en http://${config.host}:${config.port}`);
    app.log.info(`Health: http://localhost:${config.port}/health`);
    app.log.info(`Panel:  http://localhost:${config.port}/`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
