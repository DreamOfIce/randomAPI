import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAuthorization, verifyGithubProxy } from './utils.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const confPath = join(root, 'config.json');

const configStruct = {
  host: {
    type: 'String',
    default: 'localhost',
  },
  port: {
    type: 'Number',
    validate: (value) => value >= 0 && value <= 65535,
    default: 8006,
  },
  _environment: {
    accept: ['development', 'production'],
    default: 'development',
    validate: (value) => {
      process.env.NODE_ENV = value;
      return true;
    },
  },
  settings: {
    type: 'Object',
    members: {
      _githubAuth: {
        type: 'String',
        validate: (value, config) =>
          value || config._environment === 'development' // require on production environment
            ? generateAuthorization(value) // convert to Authorization header
            : false,
      },
      githubProxy: {
        default: 'auto',
        validate: verifyGithubProxy,
      },
      accessLog: { type: 'String', default: join(root, 'logs', 'access.log') },
      errorLog: { type: 'String', default: join(root, 'logs', 'error.log') },
      printLog: { type: 'Boolean', default: false },
    },
    default: {},
  },
  update: {
    type: 'Object',
    members: {
      type: { accept: ['timing', 'webhook'], default: 'timing' },
      frequency: {
        type: 'Number',
        default: 3600,
        validate: (value) => value >= 300,
      },
      maxRetries: { type: 'Number', default: 1 },
      _webhookSecret: { type: 'String' },
    },
    default: {},
  },
  api: {
    type: 'Object',
    require: true,
    members: {
      default: {
        type: 'Object',
      },
      list: {
        type: 'Array',
        members: {
          includeSubModule: { type: 'Boolean', default: false },
          path: {
            type: 'String',
            validate: (value) => value.startsWith('/'),
            require: true,
          },
          repo: { type: 'String', require: true },
          resourcePath: {
            type: 'String',
            validate: (value) => value.startsWith('/'),
            require: true,
          },
          resourceUrl: { type: 'String', require: true },
          type: { accept: ['media', 'hitokoto'], require: true },
        },
      },
    },
  },
};

const envMap = {
  HOST: 'host',
  PORT: 'port',
  NODE_ENV: '_environment',
  RA_GITHUB_AUTH: 'settings._githubAuth',
  RA_ENABLE_GITHUB_PROXY: 'settings.githubProxy',
  RA_UPDATE_TYPE: 'update.type',
  RA_UPDATE_FREQUENCY: 'update.frequency',
  RA_UPDATE_MAX_RETRIES: 'update.maxRetries',
  RA_WEBHOOK_SECRECT: 'update._webhookSecrect',
};

const argMap = {
  dev: { path: '_environment', value: 'development' },
  printLog: { path: 'settings.printLog', value: true },
};

const getTypeof = (input) => Object.prototype.toString.call(input).slice(8, -1);

const setProp = (obj, path, value) =>
  path.split('.').reduce((acc, key, index, pathArr) => {
    if (index === pathArr.length - 1) acc[key] = value;
    else acc[key] ||= {};
    return acc[key];
  }, obj);

/**
 * @description Verify the structure and allpy default value of an object
 * @param {Object} obj Object to be verified
 * @param {Object} structures Structures of the object
 * @returns {Promise<Object>} Configuration after applying default values
 */
async function verifyStruct(obj, structures, prefix = '', originalObj = obj) {
  const ret = {};
  await Promise.all(
    Object.entries(structures ?? {}).map(async ([key, struct]) => {
      let value = obj[key];
      const path = `${prefix}${key}`;
      if (!value) {
        if (struct.default) {
          value = struct.default;
        } else if (struct.require)
          throw new Error(
            `[config] Missing required property '${key}' in ${prefix}`,
          );
        else return;
      }

      const valueType = getTypeof(value);
      if (struct.type && valueType !== struct.type)
        throw new Error(
          `[config] Type '${valueType}' does not match ${struct.type} in ${path}`,
        );
      switch (valueType) {
        case 'Object':
          ret[key] = await verifyStruct(
            value,
            struct.members,
            `${path}.`,
            originalObj,
          );
          break;
        case 'Array':
          ret[key] = await Promise.all(
            value.map((e, i) =>
              verifyStruct(e, struct.members, `${path}.${i}.`, originalObj),
            ),
          );
          break;
        default:
          if (struct.accept && !struct.accept.includes(value))
            throw new Error(
              `[config] ${path} must be one of ${struct.accept.toString()}, receive '${value}'`,
            );

          if (struct.validate) {
            const result = await struct.validate(value, originalObj);
            if (typeof result !== 'boolean') {
              ret[key] = result;
              break;
            } else if (!result) {
              throw new Error(`[config] Invalid value '${value}' in ${path}`);
            }
          }
          ret[key] = value;
          break;
      }
    }),
  );
  return ret;
}

/**
 * @description Load configuration
 * @returns {Promise<Object>} Configuration
 */
async function loadConfig() {
  // Load from file
  const config = JSON.parse(await readFile(confPath));
  // Load from environment variables
  Object.entries(process.env).forEach(([envName, value]) => {
    if (envMap[envName]) {
      setProp(config, envMap[envName], value);
    }
  });
  // Load from arguments
  process.argv.slice(2).forEach((arg) => {
    if (argMap[arg]) {
      setProp(config, argMap[arg].path, argMap[arg].value);
    }
  });
  // Apply default value of api configuration
  const {
    api: { defaults, list },
  } = config;
  config.api.list = list.map((apiConfig) => ({
    ...defaults,
    ...apiConfig,
  }));
  // Verify structures
  return verifyStruct(config, configStruct);
}

export default loadConfig;
