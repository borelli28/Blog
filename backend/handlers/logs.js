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

// FORMAT OF LOGS:
//
// CEF Version: 0
// Device Vendor: Borelli28
// Device Product: Blog
// Device Version: 1.0
// Signature ID: 4001
// Name: Logs retrieved
// Severity: 1
// Extension: rt=yyyy-12-06T21:35:00.650-05:00 level=info username="admin"
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
        // Split the line into parts
        const parts = line.split('|');
        // Destructure the first 7 parts of the CEF log
        const [cefVersion, vendor, product, productVersion, signatureId, name, severity] = parts;
        // The extension is the 8th part (index 7)
        const extension = parts[7];
        const extensionObjects = {};

        if (extension) {
          // Split the extension by spaces and process each part
          extension.trim().split(' ').forEach(part => {
            // Split each part into key value pars
            const [key, value] = part.split('=');
            if (value) {
              if (value.startsWith('"') && value.endsWith('"')) { // Remove surrounding quotes from value
                  extensionObjects[key] = value.slice(1, -1);
              } else {
                  extensionObjects[key] = value;
              }
            }
          });
        }

        return {
          timestamp: extensionObjects.rt || '',
          level: extensionObjects.level || '',
          name: name || '',
          signatureId: signatureId || '',
          severity: severity || '',
          username: extensionObjects.username || 'None'
        };
      });

      logger.infoWithMeta('Logs retrieved', '', { username: req.username });
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