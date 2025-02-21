import { Server } from 'socket.io';
import express, { Express, Request, Response, NextFunction } from 'express';

import http from 'http';

const app: Express = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const onlineUsers = new Map();

export function createIOServer() {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('register', (employeeId: number) => {
      console.log(employeeId, 'Registration was successful');
      onlineUsers.set(employeeId, socket.id);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) onlineUsers.delete(key);
      });
    });
  });
  return { server, app };
}

export { io, onlineUsers };
