import winston from 'winston';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // logs to terminal
    new LokiTransport({                // logs to Grafana Loki
      host: process.env.LOKI_URL!,
      basicAuth: `${process.env.LOKI_USER}:${process.env.LOKI_PASSWORD}`,
      labels: { job: 'intervuex-backend' },
    }),
  ],
});
