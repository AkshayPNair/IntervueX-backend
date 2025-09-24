"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_loki_1 = __importDefault(require("winston-loki"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../config/.env') });
const logLevel = process.env.LOG_LEVEL || 'info';
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(), // logs to terminal
        new winston_loki_1.default({
            host: process.env.LOKI_URL,
            basicAuth: `${process.env.LOKI_USER}:${process.env.LOKI_PASSWORD}`,
            labels: { job: 'intervuex-backend' },
        }),
    ],
});
