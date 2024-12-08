import winston from 'winston';
import fs from 'fs';
import path from 'path';

const CEF_VERSION = '0';
const DEVICE_VENDOR = 'Borelli28';
const DEVICE_PRODUCT = 'Blog';
const DEVICE_VERSION = '1.0';

const EVENT_SIGNATURES = {
  'Blog post created': { signatureId: '1001', severity: '3' },
  'User logged in': { signatureId: '1002', severity: '5' },
  'User logged out': { signatureId: '1003', severity: '3' },
  'Authentication attempt with no token': { signatureId: '1004', severity: '4' },
};

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom CEF log formatter
const cefFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  // Extract event name and optional detail
  const [eventName, detail] = message.split(':').map(part => part.trim());

  const signature = EVENT_SIGNATURES[eventName] || { signatureId: '9999', severity: '5' };

  const cefHeader = `CEF:${CEF_VERSION}|${DEVICE_VENDOR}|${DEVICE_PRODUCT}|${DEVICE_VERSION}|${signature.signatureId}|${eventName}|${signature.severity}`;

  // Construct the CEF extension as key-value pairs
  const cefExtension = [];
  cefExtension.push(`rt=${timestamp}`);
  cefExtension.push(`level=${level}`);

  // Event-specific details
  if (detail) cefExtension.push(`msg=${JSON.stringify(detail)}`);
  for (const [key, value] of Object.entries(meta)) {
    cefExtension.push(`${key}=${JSON.stringify(value)}`);
  }

  return `${cefHeader}|${cefExtension.join(' ')}`;
});

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'yyyy-MM-ddTHH:mm:ss.SSSZ' }),
    cefFormat
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.cef.log') }),
    new winston.transports.Console()
  ],
});

// Custom helper method for logging with metadata
logger.infoWithMeta = (eventName, detail = '', meta = {}) => {
  const message = detail ? `${eventName}: ${detail}` : eventName;
  logger.info(message, meta);
};

export default logger;