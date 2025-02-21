import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { AppDataSource } from './database';
import { ErrorMiddleware } from './middlewares';
import { logger, stream } from './utils';
import config from './config';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import { seedDatabase } from './database/seeds';
import { Routes } from './routes/v1';
import { createIOServer } from './services/io.service';

const { app: serverConfig, log } = config;
console.log('Initializing database connection...');

AppDataSource.initialize()
  .then(async () => {
    const { server, app } = createIOServer();

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

    const message = `🚀 ${serverConfig.name} ${serverConfig.env} running at ${serverConfig.url}:${serverConfig.port}`;
    // Create HTTP server and WebSocket server

    server.listen(serverConfig.port, () => {
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
