"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const signaling_socket_1 = require("./interfaces/socket/signaling.socket");
const chat_socket_1 = require("./interfaces/socket/chat.socket");
const notification_socket_1 = require("./interfaces/socket/notification.socket");
const scheduler_bootstarp_1 = require("./infrastructure/scheduler/scheduler.bootstarp");
const logger_1 = require("./utils/logger");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, './config/.env') });
let schedulerInstance = null;
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://dbacb5b29269.ngrok-free.app'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    },
});
(0, signaling_socket_1.registerSignaling)(io);
(0, chat_socket_1.registerChat)(io);
(0, notification_socket_1.registerNotifications)(io);
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    logger_1.logger.info('Connected to MongoDB');
    schedulerInstance = (0, scheduler_bootstarp_1.bootstrapSchedulers)();
    server.listen(PORT, () => {
        logger_1.logger.info(`Server running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    logger_1.logger.error('Failed to connect to MongoDB', { error });
});
