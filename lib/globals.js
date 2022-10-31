import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();
const { combine, colorize, json, simple, timestamp } = format;

// API configuration require fields
const requireFields = [
  'includeSubModule',
  'path',
  'repo',
  'resourcePath',
  'resourceUrl',
  'type',
];

// Define the rootDir to instead of __dirname in commonJS
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

// Create logger
const accessTransport = new transports.File({
  filename: join(rootDir, 'logs', 'access.log'),
  format: combine(timestamp(), json()),
  level: 'info',
  maxFiles: 16,
  maxsize: 131072, // 128k
  tailable: true,
});
const errorTransport = new transports.File({
  filename: join(rootDir, 'logs', 'error.log'),
  format: combine(timestamp(), json()),
  level: 'error',
  maxFiles: 16,
  maxsize: 131072, // 128k
  tailable: true,
});
const logger = createLogger({
  level: 'info',
  transports: [accessTransport, errorTransport],
  exceptionHandlers: [errorTransport],
});

// print log to console in dev environment
if (process.env.NODE_ENV !== 'production') {
  logger.configure({ level: 'debug' });
  logger.add(
    new transports.Console({
      format: combine(
        colorize({
          level: true,
          color: { debug: 'blue', info: 'grey', warn: 'yellow', error: 'red' },
        }),
        simple(),
      ),
    }),
  );
}

// Load configuration
const config = JSON.parse(readFileSync(join(rootDir, 'config.json')));
if (process.env.WEBHOOK_SECRET) {
  Object.assign(config, { webhookSecret: process.env.WEBHOOK_SECRET });
} else {
  logger.warn('Webhook secret is not defined.This may raise security issues!');
}
if (process.env.GITHUB_AUTH) {
  const [username, password] = process.env.GITHUB_AUTH.split(':');
  Object.assign(config, { auth: { username, password } });
} else {
  logger.warn(
    'Github authorization is not defined.This may cause a failure to get the resource list!',
  );
}
Object.assign(config, {
  apis: config.apis.map((obj) => {
    const apiConfig = {
      ...config.defaults,
      ...obj,
    };
    const missingFields = requireFields.filter(
      (item) => apiConfig[item] === undefined,
    );
    if (missingFields.length > 0) {
      throw new Error(
        `Incomplete api configuration:${apiConfig.path}, missing:${missingFields}!`,
      );
    }
    return apiConfig;
  }),
});
logger.debug(`Config:\n${JSON.stringify(config, null, 2)}`);

const resources = {};

export { config, logger, rootDir, resources };
