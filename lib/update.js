import { createHmac } from 'node:crypto';
import { URL } from 'node:url';
import axios from 'axios';
import { config, logger, resources } from './globals.js';

// if you are sure you need a larger file depth, change the following value
const maxDepth = 10;
// ghproxy url,for chinese user only
const ghproxyUrl = 'https://ghproxy.com/';

/**
 * @description Get the list of files in the github repository
 * @param {string} repo repository string in format 'user/repo'
 * @param {string} path subdir within the repository
 * @param {object} apiConfig an api configuration object
 * @param {int} currentDepth optional parameter(for internal recursion)
 * @returns {array} array of files in the github repository
 */
const getRepoFiles = async (repo, path, apiConfig, currentDepth = 1) => {
  if (currentDepth > maxDepth) return [];
  const response = await axios.get(
    `https://api.github.com/repos/${repo}/contents${path}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: config.accessToken,
      },
      auth: {
        username: config.auth.username,
        password: config.auth.password,
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
                currentDepth + 1,
              )),
            );
          } else {
            fileList.push({
              fileName: obj.name,
              path: obj.path,
              url: new URL(obj.path, apiConfig.resourceUrl).href, // format the URL
              downloadUrl: config.enableGhProxy
                ? `${ghproxyUrl}${obj.download_url}`
                : obj.download_url,
            });
          }
          break;
        case 'dir':
          fileList.push(
            ...(await getRepoFiles(
              repo,
              `/${obj.path}`,
              apiConfig,
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
};

/**
 * @description Update the resources
 */
const update = async () => {
  await Promise.all(
    config.apis.map(async (apiConfig) => {
      const fileList = await getRepoFiles(
        apiConfig.repo,
        apiConfig.resourcePath,
        apiConfig,
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
};

const handleUpdateRequest = async (req, res, next) => {
  logger.info(`Received a new update request from ${req.ip}.`);

  // verify request if webhookSecret is set
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

  // update resources
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
    res
      .status(500)
      .send({ status: 'error', message: err.message, timestamp: Date.now() });
  }

  // run next router
  next();
};

export { handleUpdateRequest, update };
