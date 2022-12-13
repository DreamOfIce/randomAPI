import iconv from 'iconv-lite';
import { isCategoryInclude } from '../lib/utils.js';

const hitokoto = ({ resources }, req, res, next) => {
  const {
    category = 'all',
    format = 'json',
    encoding = 'utf-8',
    seletor = '#hitokoto',
  } = req.parsedParams;

  // Check encoding
  if (!iconv.encodingExists(encoding)) {
    res.status(400);
    next(`Unsupported encoding: ${encoding}`);
  }

  // Selete a random hitokoto
  const hitokotos = [];
  Object.entries(resources[req.baseUrl]).forEach(([c, h]) => {
    if (isCategoryInclude(c, category)) {
      hitokotos.push(...h.map((obj) => ({ ...obj, category: c })));
    }
  });
  if (hitokotos.length === 0) {
    res.status(500);
    next('No matching hitokoto found');
    return;
  }
  const result = hitokotos[Math.floor(Math.random() * hitokotos.length)];

  // Send response
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
      res.status(400);
      next(`Invalid format: ${format}`);
      break;
  }
  next();
};

export default hitokoto;
