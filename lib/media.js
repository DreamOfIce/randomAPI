import iconv from 'iconv-lite';
import { config, logger, resources } from './globals.js';

const media = (req, res, next) => {
  const {
    category = 'all',
    format = 'raw',
    encoding = 'utf-8',
  } = req.parsedParams;
  const { extensions = [] } = config.apis.find(
    (api) => api.path === req.baseUrl,
  );

  // constructing regular expressions
  const extExp = new RegExp(
    `^(.+?)(?:\\.${''.concat(
      ...extensions.map((ext) => `${ext}|`).slice(0, -1),
    )})$`,
    'iu',
  );
  const pathExp = new RegExp(
    `^(${
      typeof category === 'string'
        ? category
        : ''.concat(...category.map((c) => `${c}|`)).slice(0, -1)
    })$`,
    'u',
  );

  const files = resources[req.baseUrl].filter(
    (file) =>
      (extensions.length === 0 || extExp.test(file.name)) &&
      (category === 'all' || pathExp.test(file.path)),
  );

  if (files.length === 0) {
    res.status(500).send('No matching resource found');
    logger.debug(
      `${req.method} ${req.baseUrl}${req.url} No matching resource found!`,
    );
    return;
  }
  const result = files[Math.floor(Math.random() * files.length)];
  console.log(files);
  next();
};

export default media;
