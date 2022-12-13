import { createHmac } from 'node:crypto';
import { URL } from 'node:url';
import axios from 'axios';

// If you are sure you need a larger file depth, change the following value
const maxDepth = 10;

/**
 * @description Get the list of files in the github repository
 * @param {String} repo Repository string in format 'user/repo'
 * @param {String} path Subdir within the repository
 * @param {Object} apiConfig An api configuration object
 * @param {Object} settings Settings object
 * @param logger Winston logger
 * @returns {Array} Array of files in the github repository
 */
async function getRepoFiles(
  repo,
  path,
  apiConfig,
  settings,
  logger,
  currentDepth = 1,
) {
  if (currentDepth > maxDepth) return [];
  const { _githubAuth, githubProxy } = settings;
  const response = await axios.get(
    `${githubProxy.api}repos/${repo}/contents${path}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: _githubAuth,
      },
    },
  );
  const fileList = [];
  await Promise.all(
    response.data.map(async (obj) => {
      switch (obj.type) {
        case 'file':
          if (obj.size === 0) {
            fileList.push(
              ...(await getRepoFiles(
                repo,
                `/${obj.path}`,
                apiConfig,
                settings,
                logger,
                currentDepth + 1,
              )),
            );
          } else {
            fileList.push({
              fileName: obj.name,
              path: obj.path,
              url: new URL(obj.path, apiConfig.resourceUrl).href, // format the URL
              downloadUrl: obj.download_url.replace(
                'https://raw.githubusercontent.com/',
                githubProxy.raw,
              ),
            });
          }
          break;
        case 'dir':
          fileList.push(
            ...(await getRepoFiles(
              repo,
              `/${obj.path}`,
              apiConfig,
              settings,
              logger,
              currentDepth + 1,
            )),
          );
          break;
        case 'symlink':
          if (!obj.target.startsWith(`/${path}`)) {
            fileList.push(
              ...(await getRepoFiles(
                repo,
                obj.target,
                apiConfig,
                settings,
                logger,
                currentDepth + 1,
              )),
            );
          }
          break;
        case 'submodule':
          if (
            apiConfig.includeSubModule &&
            obj.git_url // only support github repo
          ) {
            fileList.push(
              ...(await getRepoFiles(
                obj.submodule_git_url.match(
                  /github\.com(?::|\/)([\S^/]+\/[\S^/]+)(?:\.git?)/,
                ),
                '/',
                apiConfig,
                settings,
                logger,
                currentDepth + 1,
              )),
            );
          }
          break;
        default:
          logger.warn(`Unknown content type:${obj.type},skip it.`);
          break;
      }
    }),
  );
  return fileList;
}

/**
 * @description Update the resources
 */
async function update({ config, logger, resources }) {
  await Promise.all(
    config.api.list.map(async (apiConfig) => {
      const fileList = await getRepoFiles(
        apiConfig.repo,
        apiConfig.resourcePath,
        apiConfig,
        config.settings,
        logger,
      );
      switch (apiConfig.type) {
        case 'hitokoto': {
          const hitokotos = {};
          await Promise.all(
            fileList.map(async (file) => {
              if (file.fileName.endsWith('.hitokoto.json')) {
                const { data } = await axios.get(file.downloadUrl);
                Object.assign(hitokotos, {
                  [file.fileName.replace(/(\.hitokoto\.json)$/, '')]: data,
                });
              }
            }),
          );
          Object.assign(resources, { [apiConfig.path]: hitokotos });
          break;
        }
        case 'media': {
          const files = {};
          fileList.forEach((file) => {
            const { fileName, path, url } = file;
            const category = path.slice(
              apiConfig.path.length,
              path.indexOf('/', apiConfig.path.length + 1),
            );
            if (
              !apiConfig.extensions ||
              apiConfig.extensions.find((ext) => fileName.endsWith(ext))
            ) {
              if (!files[category]) Object.assign(files, { [category]: [] });
              files[category].push({
                category,
                name: fileName.replace(/^(.+?)\.(.+)$/u, '$1'),
                url,
              });
            }
          });
          Object.assign(resources, { [apiConfig.path]: files });
          break;
        }
        default: {
          Object.assign(resources, { [apiConfig.path]: fileList });
        }
      }

      if (!resources[apiConfig.path])
        logger.warn(`No resources found for ${apiConfig.path}!`);
    }),
  );
}

const handleUpdateRequest = async ({ config, logger }, req, res, next) => {
  logger.info(`Received a new update request from ${req.ip}.`);

  // Verify request if webhookSecret is set
  if (config.webhookSecret) {
    const signature = req.get('x-hub-signature-256');
    const payload = req.body ?? '';
    const hmac = createHmac('sha256', config.webhookSecret);
    hmac.update(payload);
    const hash = `sha256=${hmac.digest('hex')}`;
    logger.debug(`Signature: ${signature}\nPayload hash: ${hash}`);
    if (hash !== signature) {
      logger.warn('Signature does not match,abort!');
      res.sendStatus(403);
      return;
    }
  }

  // Update resources
  logger.info('Start updating resources...');
  try {
    await update();
    logger.info('Update successful.');
    res
      .status(200)
      .send({ status: 'OK', message: 'success', timestamp: Date.now() });
  } catch (err) {
    logger.error(`Update failed: ${err.message}`);
    logger.debug(`Full error info:\n${JSON.stringify(err, null, 2)}`); // for debugging
    res.status(500);
    next({ status: 'error', message: err.message, timestamp: Date.now() });
  }

  next();
};

export { handleUpdateRequest, update };
