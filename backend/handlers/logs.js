import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';

const logFile = path.join(__dirname, '..', 'logs', 'app.cef.log');

const getUsername = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    req.username = await getUsernameFromToken(token);
  } catch (error) {
    req.username = 'anonymous';
  }
  next();
};

export const getLogs = [getUsername, (req, res) => {
  try {
    fs.readFile(logFile, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Failed to read log file`, {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: 'Failed to read logs' });
      }

      // Parse CEF log data
      const logs = data.split('\n').filter(Boolean).map(line => {
        const [header, extension] = line.split('|');
        const [, , , , signatureId, name, severity] = header.split(':')[1].split('|');
        
        const extensionParts = extension.split(' ');
        const extensionObj = {};
        extensionParts.forEach(part => {
          const [key, value] = part.split('=');
          extensionObj[key] = value;
        });

        return {
          timestamp: extensionObj.rt,
          level: extensionObj.level,
          name,
          signatureId,
          severity,
          ...extensionObj
        };
      });

      res.json(logs);
    });
  } catch (error) {
    logger.error(`Unexpected error in getLogs`, {
      error: error.message,
      stack: error.stack,
      username: req.username,
    });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}];

export const removeLog = [getUsername, (req, res) => {
  try {
    const { timestamp } = req.params;
    fs.readFile(logFile, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Failed to read log file`, {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: 'Failed to read logs' });
      }

      const logs = data.split('\n').filter(Boolean);
      const updatedLogs = logs.filter(log => !log.includes(`rt=${timestamp}`));

      fs.writeFile(logFile, updatedLogs.join('\n') + '\n', (writeErr) => {
        if (writeErr) {
          logger.error(`Failed to write updated log file`, {
            error: writeErr.message,
            stack: writeErr.stack,
            username: req.username,
          });
          return res.status(500).json({ error: 'Failed to remove log entry' });
        }
        logger.infoWithMeta('Log entry removed', timestamp, { username: req.username });
        res.json({ message: 'Log entry removed successfully' });
      });
    });
  } catch (error) {
    logger.error(`Unexpected error in removeLog`, {
      error: error.message,
      stack: error.stack,
      username: req.username,
    });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}];