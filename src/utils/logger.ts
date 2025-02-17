import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import config from '../config';

const logDir = config?.log?.dir
  ? join(__dirname, config.log.dir)
  : join(__dirname, 'logs');

// Ensure the log directory exists
try {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error);
}

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
      handleExceptions: true, // Handle uncaught exceptions
    }),
    new winston.transports.File({
      filename: join(logDir, 'error.log'),
      level: 'error',
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: join(logDir, 'combined.log'),
      handleExceptions: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: join(logDir, 'debug', '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      maxFiles: '30d',
      zippedArchive: true,
      handleExceptions: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: join(logDir, 'info', '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '30d',
      zippedArchive: true,
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // Prevent app crashes
});

// Capture unhandled exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

// Stream for logging HTTP requests
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
