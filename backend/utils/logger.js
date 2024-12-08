import winston from 'winston';
import fs from 'fs';
import path from 'path';

const CEF_VERSION = '0';
const DEVICE_VENDOR = 'Borelli28';
const DEVICE_PRODUCT = 'Blog';
const DEVICE_VERSION = '1.0';

const EVENT_SIGNATURES = {
  'Blog post created': { signatureId: '1001', severity: '3' },
  'Blog post recovered': { signatureId: '1002', severity: '3' },
  'Blog post deleted': { signatureId: '1003', severity: '3' },
  'User logged in': { signatureId: '1004', severity: '5' },
  'User logged out': { signatureId: '1005', severity: '3' },
  'Authentication attempt with no token': { signatureId: '1006', severity: '4' },
  'Blog post updated': { signatureId: '1007', severity: '3' },
  'Blog post status updated': { signatureId: '1008', severity: '3' },
  'Blog post permanently deleted': { signatureId: '1009', severity: '4' },
  'Blog post retrieved': { signatureId: '1010', severity: '1' },
  'All blog posts retrieved': { signatureId: '1011', severity: '1' },
  'Post images retrieved': { signatureId: '1012', severity: '1' },
  'Featured posts retrieved': { signatureId: '1013', severity: '1' },
  'Published posts retrieved': { signatureId: '1014', severity: '1' },
  'All posts including deleted retrieved': { signatureId: '1015', severity: '2' },
  'Article image uploaded': { signatureId: '2001', severity: '3' },
  'Image uploaded': { signatureId: '2002', severity: '3' },
  'Image alt text updated': { signatureId: '2003', severity: '2' },
  'Image deleted': { signatureId: '2004', severity: '3' },
  'Article image upload failed': { signatureId: '2005', severity: '4' },
  'Image upload failed': { signatureId: '2006', severity: '4' },
  'Image not found for deletion': { signatureId: '2007', severity: '4' },
  'User registered': { signatureId: '3001', severity: '3' },
  'User logged in': { signatureId: '3002', severity: '3' },
  'User logged out': { signatureId: '3003', severity: '3' },
  'Password updated': { signatureId: '3004', severity: '3' },
  'Username fetched': { signatureId: '3005', severity: '1' },
  'Login failed': { signatureId: '3006', severity: '4' },
  'Authentication failed': { signatureId: '3007', severity: '4' },
  'Password update failed': { signatureId: '3008', severity: '4' },
  'Username fetch failed': { signatureId: '3009', severity: '4' },
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