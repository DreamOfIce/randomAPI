import iconv from 'iconv-lite';
import { logger, resources } from './globals.js';
import { isCategoryInclude } from './utils.js';

const hitokoto = (req, res, next) => {
  const {
    category = 'all',
    format = 'json',
    encoding = 'utf-8',
    seletor = '#hitokoto',
  } = req.parsedParams;

  // check encoding
  if (!iconv.encodingExists(encoding)) {
    res.status(400).send(`Unsupported encoding:${encoding}`);
    logger.debug(
      `[ERROR] ${req.method} ${req.baseUrl}${req.url} Unsupport encoding:${encoding}!`,
    );
  }

  // selete a random hitokoto
  const hitokotos = [];
  Object.entries(resources[req.baseUrl]).forEach(([c, h]) => {
    if (isCategoryInclude(c, category)) {
      hitokotos.push(...h.map((obj) => ({ ...obj, category: c })));
    }
  });
  if (hitokotos.length === 0) {
    res.status(500).send('No matching hitokoto found');
    logger.debug(
      `[ERROR] ${req.method} ${req.baseUrl}${req.url} No matching hitokoto found!`,
    );
    return;
  }
  const result = hitokotos[Math.floor(Math.random() * hitokotos.length)];

  // send response
  switch (format) {
    case 'json':
      res
        .set({ 'Content-Type': `application/json charset=${encoding}` })
        .send(iconv.encode(JSON.stringify(result), encoding));
      break;
    case 'text':
      res
        .set({ 'Content-Type': `text/plain; charset=${encoding}` })
        .send(iconv.encode(result.hitokoto, encoding));
      break;
    case 'js':
      res
        .set({ 'Content-Type': `text/js charset=${encoding}` })
        .send(
          iconv.encode(
            `document.querySeletor('${seletor}').innerText('${result.hitokoto}')`,
            encoding,
          ),
        );
      break;
    default:
      res.status(400).send(`Invalid format: ${format}`);
      logger.debug(`[ERROR] Invalid format: ${format}!`);
      break;
  }

  // writing log
  logger.info(`${req.method} ${req.baseUrl}${req.url} ${res.statusCode}`);
  next();
};

export default hitokoto;
