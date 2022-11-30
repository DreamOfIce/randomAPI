import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger, format, transports } from 'winston';

const { combine, colorize, json, simple, timestamp } = format;

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function initLogger(config) {
  const {
    _environment,
    settings: { accessLog, errorLog, printLog },
  } = config;
  const accessTransport = new transports.File({
    filename: isAbsolute(accessLog) ? accessLog : join(root, accessLog),
    format: combine(timestamp(), json()),
    level: 'info',
    maxFiles: 16,
    maxsize: 131072, // 128k
    tailable: true,
  });
  const errorTransport = new transports.File({
    filename: isAbsolute(errorLog) ? errorLog : join(root, errorLog),
    format: combine(timestamp(), json()),
    level: 'error',
    maxFiles: 16,
    maxsize: 131072, // 128k
    tailable: true,
  });
  const logger = createLogger({
    level: _environment === 'development' ? 'debug' : 'info',
    transports: [accessTransport, errorTransport],
    exceptionHandlers: [errorTransport],
  });

  // Print log to console in dev environment
  if (printLog || _environment === 'development') {
    logger.add(
      new transports.Console({
        format: combine(
          colorize({
            level: true,
            color: {
              debug: 'blue',
              info: 'grey',
              warn: 'yellow',
              error: 'red',
            },
          }),
          simple(),
        ),
      }),
    );
  }
  return logger;
}

function reqLogger(logger) {
  return [
    (req, res, next) => {
      logger.info(
        `[server] ${req.method} ${req.baseUrl}${req.url} ${res.statusCode}`,
      );
      next();
    },
    // eslint-disable-next-line no-unused-vars
    (err, req, res, _next) => {
      logger.error(
        `[server] ${req.method} ${req.baseUrl}${req.url} ${res.statusCode} Error info: ${err}`,
      );
      res.send(err);
    },
  ];
}

export { initLogger, reqLogger };
