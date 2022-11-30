import dotenv from 'dotenv';
import startSever from './app.js';
import loadConfig from './lib/config.js';
import { initLogger } from './lib/logger.js';
import { update } from './lib/update.js';

dotenv.config();

// initialization
(async () => {
  const config = await loadConfig();
  const logger = initLogger(config);
  logger.debug(`Configuration: ${JSON.stringify(config, null, 2)}`);
  logger.info('Initializing resources...');
  const resources = {};
  await update({ config, logger, resources });
  logger.info('Done.');
  // start server
  startSever(config, logger, resources);
})();
