import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { AppDataSource } from './database';
import { ErrorMiddleware } from './middlewares';
import { logger, stream } from './utils';
import config from './config';
import { StatusCodes } from 'http-status-codes';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { seedDatabase } from './database/seeds';
import { Routes } from './routes/v1';
import multer from 'multer';
import path from 'path';

const { app: server, log } = config;
console.log('Initializing database connection...');

AppDataSource.initialize()
  .then(async () => {
    const app: Express = express();
    logger.on('error', (err) => {
      console.error('Logger error:', err);
    });

    process.on('uncaughtException', (error, origin) => {
      logger.error('<<<<<<<<<<<<<<<< Uncaught exception >>>>>>>>>>>>>>>>');
      logger.error(error);
      logger.error('>>>>>>>>>> Exception origin <<<<<<<<<<');
      logger.error(origin);
      logger.error('<<<<<<<<<<<<<<<< ------------------ >>>>>>>>>>>>>>>>');
      process.exit();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('<<<<<<<<<<<<<<<< Unhandled Rejection at >>>>>>>>>>>>>>>>');
      logger.error(promise);
      logger.error('>>>>>>>>>> Reason <<<<<<<<<<');
      logger.error(reason);
      logger.error('<<<<<<<<<<<<<<<< ---------------------- >>>>>>>>>>>>>>>>');
      process.exit();
    });

    await seedDatabase(AppDataSource);

    app.use(express.json());
    app.use(cors());

    app.use(morgan(log.format, { stream }));

    const message = `🚀 ${server.name} ${server.env} running at ${server.url}:${server.port}`;

    app.listen(server.port, () => {
      logger.info(`=========================================================`);
      logger.info(message);
      logger.info(`=========================================================`);
    });

    // startJobs();

    app.use('/api/v1', Routes);

    app.use('/server-test', (req: Request, res: Response) => {
      res.json({ message });
    });

    app.use((req, res) => {
      res.status(StatusCodes.NOT_FOUND).json();
    });

    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      ErrorMiddleware.handleError(error, req, res);
    });
  })
  .catch((error: any) => console.log({ error }));
