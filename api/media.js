import iconv from 'iconv-lite';
import { logger, resources } from '../lib/globals.js';
import { isCategoryInclude } from '../lib/utils.js';

const media = (req, res, next) => {
  const {
    category = 'all',
    format = 'raw',
    encoding = 'utf-8',
  } = req.parsedParams;

  // selete random resource
  const files = [];
  Object.entries(resources[req.baseUrl]).forEach(([key, value]) => {
    if (isCategoryInclude(key, category)) files.push(...value);
  });

  if (files.length === 0) {
    res.status(500).send('No matching resource found');
    logger.debug(
      `[ERROR] ${req.method} ${req.baseUrl}${req.url} No matching resource found!`,
    );
    return;
  }
  const result = files[Math.floor(Math.random() * files.length)];

  // send response
  switch (format) {
    case 'raw':
      res.redirect(302, result.url);
      break;
    case 'json':
      res
        .set({ 'Content-Type': `application/json charset=${encoding}` })
        .send(iconv.encode(JSON.stringify(result), encoding));
      break;
    default:
      res.status(400).send(`Invalid format: ${format}`);
      logger.debug(`[ERROR] Invalid format: ${format}!`);
      break;
  }
  next();
};

export default media;
