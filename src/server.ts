import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app'
import path from 'path';
import http from 'http'
import { Server } from 'socket.io'
import { registerSignaling } from './interfaces/socket/signaling.socket'
import { registerChat } from './interfaces/socket/chat.socket'
import { registerNotifications } from './interfaces/socket/notification.socket'
import { bootstrapSchedulers } from './infrastructure/scheduler/scheduler.bootstarp';
import { logger } from './utils/logger';

dotenv.config({ path: path.resolve(__dirname, './config/.env') });

let schedulerInstance = null
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000','https://dbacb5b29269.ngrok-free.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  },
})

registerSignaling(io)
registerChat(io)
registerNotifications(io)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    schedulerInstance = bootstrapSchedulers()
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB', { error });
  });


