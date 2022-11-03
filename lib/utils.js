const isCategoryInclude = (category, inputParam) =>
  inputParam === 'all' ||
  (typeof inputParam === 'string'
    ? inputParam === category
    : inputParam.includes(category));

// eslint-disable-next-line import/prefer-default-export
export { isCategoryInclude };
