import express from 'express';
import { config, logger } from './lib/globals.js';
import { handleUpdateRequest, update } from './lib/update.js';
import hitokoto from './lib/hitokoto.js';
import media from './lib/media.js';
import parser from './lib/parser.js';

const app = express();

// Initialization
config.apis.forEach((api) => {
  switch (api.type) {
    case 'media':
      app.use(
        api.path,
        express.json(),
        express.urlencoded({ extended: true }),
        parser,
        media,
      );
      break;
    case 'hitokoto':
      app.use(
        api.path,
        express.json(),
        express.urlencoded({ extended: true }),
        parser,
        hitokoto,
      );
      break;
    default:
      throw new Error(`Invalid API type:${api.type}!`);
  }
});
app.use(
  '/update',
  express.raw({
    limit: '10mb',
    type: ['application/json', 'application/x-www-form-urlencoded'],
  }),
  handleUpdateRequest,
);

(async () => {
  // Get resources list
  logger.info('Start getting resources...');
  await update();
  logger.info('Done.');
  // Start server
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 8006;
  app.listen(port, host, () => {
    logger.info(`Start listening on http://${host}:${port}`);
  });
})();
