import express from 'express';
import { config, logger } from './lib/globals.js';
import { processUpdateRequest, update } from './lib/update.js';
import hitokoto from './lib/hitokoto.js';
import media from './lib/media.js';

const app = express();

// Initialization
config.apis.forEach((api) => {
  switch (api.type) {
    case 'media':
      app.use(api.path, media);
      break;
    case 'hitokoto':
      app.use(api.path, hitokoto);
      break;
    default:
      throw new Error(`Invalid API type:${api.type}!`);
  }
});
app.use('/update', processUpdateRequest);

// Get resources list
logger.info('Start getting resources...');
update();
logger.info('Done.');

// Start server
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8006;
app.listen(port, host, () => {
  logger.info(`Start listening on http://${host}:${port}`);
});
