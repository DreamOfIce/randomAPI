// parameter mappings
const paramMapping = {
  // abbr
  c: 'category',
  e: 'encoding',
  f: 'format',
  s: 'seletor',
  t: 'tag',
  // old version compatible
  game: 'category',
  selete: 'seletor',
};

// URL path mappings
const pathMapping = ['category', 'tag', 'format', 'encoding', 'seletor'];

const handleParams = (params) => {
  if (!params || Object.keys(params).length === 0) return {};
  const result = {};
  Object.entries(params).forEach(([key, value]) => {
    if (paramMapping[key]) {
      Object.assign(result, { [paramMapping[key]]: value });
    } else {
      Object.assign(result, { [key]: value });
    }
  });
  return result;
};

const handlePath = (path) => {
  if (path.length === 1) return {};
  const result = {};
  path
    .substring(1)
    .split('/')
    .forEach((str, index) => {
      // Use '+' to split the parameter string
      let param = str.split('+').map((string) => decodeURIComponent(string));
      if (param.length === 1) {
        [param] = param;
      }
      Object.assign(result, {
        [pathMapping[index] ?? `param${index + 1}`]: param, // use param+n as the default
      });
    });
  return result;
};

export default (req, _res, next) => {
  req.parsedParams = {
    ...handleParams(req.body),
    ...handlePath(req.path),
    ...handleParams(req.query),
  };
  next();
};
