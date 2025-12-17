import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { WinstonModule } from 'nest-winston';

const winstonLogger = ({ dirName = 'logs' }) => {
  const logDir = join(process.cwd(), dirName);

  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

  const { combine, timestamp, printf } = format;

  const logFormat = printf(({ timestamp, level, message }) => {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return `${timestamp as string} [${level}]: ${msg}`;
  });

  const consoleLogger = new transports.Console({ level: 'info' });

  const info_transport = new transports.DailyRotateFile({
    level: 'info',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    dirname: join(logDir, 'info'),
    zippedArchive: true,
    maxFiles: '30d',
    handleExceptions: true,
  });

  const error_transport = new transports.DailyRotateFile({
    level: 'error',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    dirname: join(logDir, 'error'),
    zippedArchive: true,
    maxFiles: '30d',
    handleExceptions: true,
  });

  return WinstonModule.createLogger({
    instance: createLogger({
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat,
      ),
      transports: [consoleLogger, info_transport, error_transport],
    }),
  });
};

export { winstonLogger };
