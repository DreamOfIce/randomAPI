import express from 'express';
import { reqLogger } from './lib/logger.js';
import { handleUpdateRequest, update } from './lib/update.js';
import { getHomepage } from './lib/utils.js';
import parser from './lib/parser.js';
import hitokoto from './api/hitokoto.js';
import media from './api/media.js';

function startSever(config, logger, resources) {
  const app = express();
  config.api.list.forEach((api) => {
    switch (api.type) {
      case 'media':
        app.use(
          api.path,
          express.json(),
          express.urlencoded({ extended: true }),
          parser,
          media.bind(null, { config, logger, resources }),
        );
        break;
      case 'hitokoto':
        app.use(
          api.path,
          express.json(),
          express.urlencoded({ extended: true }),
          parser,
          hitokoto.bind(null, { config, logger, resources }),
        );
        break;
      default:
        throw new Error(`Invalid API type:${api.type}!`);
    }
  });

  if (config.update.type === 'timing') {
    setInterval(update, config.update.frequency * 1000, {
      config,
      logger,
      resources,
    });
  } else {
    app.use(
      '/update',
      express.raw({
        limit: '10mb',
        type: ['application/json', 'application/x-www-form-urlencoded'],
      }),
      handleUpdateRequest.bind(null, { config, logger }),
    );
  }
  // log request
  app.use('/', ...reqLogger(logger));
  // homepage
  app.use('^/$', getHomepage);
  const { host, port } = config;
  // start server
  app.listen(port, host, () => {
    logger.info(`Start listening on http://${host}:${port}`);
  });
}

export default startSever;
