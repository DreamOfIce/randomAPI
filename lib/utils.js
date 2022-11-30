import { marked } from 'marked';
import axios from 'axios';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const isCategoryInclude = (category, inputParam) =>
  inputParam === 'all' ||
  (typeof inputParam === 'string'
    ? inputParam === category
    : inputParam.includes(category));

const githubUrlList = {
  api: ['https://api.github.com/', 'https://github.api.zenless.top/'],
  raw: [
    'https://raw.githubusercontent.com/',
    'https://ghproxy.com/https://raw.githubusercontent.com/',
    'https://raw.githubusercontents.com/',
  ],
};

const testConnect = (url, abortCtl) =>
  axios
    .get(url, {
      signal: abortCtl.signal,
      timeout: 5000,
      validateStatus: () => true,
    })
    .then(() => {
      abortCtl.abort();
      return true;
    })
    .catch(() => false);

const generateUrlList = (index) =>
  Object.entries(githubUrlList).reduce(
    (acc, [name, list], i) => ({
      ...acc,
      [name]: list[typeof index === 'number' ? index : index[i]],
    }),
    {},
  );

/**
 * @description Verify the configuration settings.githubProxy and converted into a list of URLs
 * @param {(String|Boolean)} value Input
 * @returns {Promise<Object>} List of Github URLs
 */
const verifyGithubProxy = async (value) => {
  switch (value) {
    case true:
      return generateUrlList(1);
    case false:
      return generateUrlList(0);
    case 'auto': {
      return generateUrlList(
        await Promise.all(
          Object.entries(githubUrlList).map(async ({ 1: list }) => {
            const abortCtl = new AbortController();
            return Math.max(
              (
                await Promise.all(list.map((url) => testConnect(url, abortCtl)))
              ).indexOf(true),
              0,
            ); // return 0 if all tests failed
          }),
        ),
      );
    }
    default:
      return {
        ...githubUrlList(0),
        ...value.split(';').map((str) => Object.fromEntries(str.split(':'))),
      };
  }
};

const getHomepage = (() => {
  let homepage;
  return async (_req, res) => {
    if (!homepage) {
      const content = await marked(
        await readFile(join(root, 'README.md'), { encoding: 'utf-8' }),
        { async: true },
      );
      homepage = `<!DOCTYPE html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://fastly.jsdelivr.net/npm/github-markdown-css/github-markdown.css">
    <style>
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
    </style>
  </head>
  <body>
    <article class="markdown-body">
      ${content}
    </article>
  </body>`;
    }
    res.send(homepage);
  };
})();

export { isCategoryInclude, getHomepage, verifyGithubProxy };
