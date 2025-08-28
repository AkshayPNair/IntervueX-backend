import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app'
import path from 'path';
import http from 'http'
import { Server } from 'socket.io'
import { registerSignaling } from './interfaces/socket/signaling.socket';

dotenv.config({ path: path.resolve(__dirname, './config/.env') });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  },
})

registerSignaling(io)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(' Failed to connect to MongoDB:', error);
  });


