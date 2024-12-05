import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp},${level},${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.csv') }),
    new winston.transports.Console()
  ],
});

export default logger;