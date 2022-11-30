import iconv from 'iconv-lite';
import { isCategoryInclude } from '../lib/utils.js';

const media = ({ resources }, req, res, next) => {
  const {
    category = 'all',
    format = 'raw',
    encoding = 'utf-8',
  } = req.parsedParams;

  // Selete random resource
  const files = [];
  Object.entries(resources[req.baseUrl]).forEach(([key, value]) => {
    if (isCategoryInclude(key, category)) files.push(...value);
  });

  if (files.length === 0) {
    res.status(500);
    next('No matching resource found');
    return;
  }
  const result = files[Math.floor(Math.random() * files.length)];

  // Send response
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
      res.status(400);
      next(`Invalid format: ${format}`);
      break;
  }
  next();
};

export default media;
