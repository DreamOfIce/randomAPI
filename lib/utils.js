import { marked } from 'marked';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rootDir } from './globals.js';

const isCategoryInclude = (category, inputParam) =>
  inputParam === 'all' ||
  (typeof inputParam === 'string'
    ? inputParam === category
    : inputParam.includes(category));

const getHomepage = (() => {
  let homepage;
  return async (_req, res) => {
    if (!homepage) {
      const content = await marked(
        await readFile(join(rootDir, 'README.md'), { encoding: 'utf-8' }),
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

export { isCategoryInclude, getHomepage };
