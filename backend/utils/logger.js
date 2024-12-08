import winston from 'winston';
import fs from 'fs';
import path from 'path';

const CEF_VERSION = '0';
const DEVICE_VENDOR = 'Borelli28';
const DEVICE_PRODUCT = 'Blog';
const DEVICE_VERSION = '1.0';

const EVENT_SIGNATURES = {
  'Blog post created': { signatureId: '1001', severity: 'Medium' },
  'Blog post recovered': { signatureId: '1002', severity: 'Medium' },
  'Blog post deleted': { signatureId: '1003', severity: 'Medium' },
  'User logged in': { signatureId: '1004', severity: 'High' },
  'User logged out': { signatureId: '1005', severity: 'Medium' },
  'Authentication attempt with no token': { signatureId: '1006', severity: 'Medium' },
  'Blog post updated': { signatureId: '1007', severity: 'Medium' },
  'Blog post status updated': { signatureId: '1008', severity: 'Medium' },
  'Blog post permanently deleted': { signatureId: '1009', severity: 'Medium' },
  'Blog post retrieved': { signatureId: '1010', severity: 'Low' },
  'All blog posts retrieved': { signatureId: '1011', severity: 'Low' },
  'Post images retrieved': { signatureId: '1012', severity: 'Low' },
  'Featured posts retrieved': { signatureId: '1013', severity: 'Low' },
  'Published posts retrieved': { signatureId: '1014', severity: 'Low' },
  'All posts including deleted retrieved': { signatureId: '1015', severity: 'Low' },
  'Article image uploaded': { signatureId: '2001', severity: 'Medium' },
  'Image uploaded': { signatureId: '2002', severity: 'Medium' },
  'Image alt text updated': { signatureId: '2003', severity: 'Low' },
  'Image deleted': { signatureId: '2004', severity: 'Medium' },
  'Article image upload failed': { signatureId: '2005', severity: 'Medium' },
  'Image upload failed': { signatureId: '2006', severity: 'Medium' },
  'Image not found for deletion': { signatureId: '2007', severity: 'Medium' },
  'User registered': { signatureId: '3001', severity: 'Medium' },
  'User logged in': { signatureId: '3002', severity: 'Medium' },
  'User logged out': { signatureId: '3003', severity: 'Medium' },
  'Password updated': { signatureId: '3004', severity: 'Medium' },
  'Username fetched': { signatureId: '3005', severity: 'Low' },
  'Login failed': { signatureId: '3006', severity: 'Medium' },
  'Authentication failed': { signatureId: '3007', severity: 'Medium' },
  'Password update failed': { signatureId: '3008', severity: 'Medium' },
  'Username fetch failed': { signatureId: '3009', severity: 'Medium' },
  'Logs retrieved': { signatureId: '4001', severity: 'Low' },
  'Log entry removed': { signatureId: '4002', severity: 'Medium' },
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
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
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