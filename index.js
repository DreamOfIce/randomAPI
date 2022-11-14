import express from 'express';
import { config, logger } from './lib/globals.js';
import { handleUpdateRequest, update } from './lib/update.js';
import { getHomepage } from './lib/utils.js';
import hitokoto from './api/hitokoto.js';
import media from './api/media.js';
import parser from './lib/parser.js';

const app = express();

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

// homepage
app.use('^/$', getHomepage);

// initialization
(async () => {
  // get resources list
  logger.info('Initializing resources...');
  await update();
  logger.info('Done.');
  // start server
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 8006;
  app.listen(port, host, () => {
    logger.info(`Start listening on http://${host}:${port}`);
  });
})();
