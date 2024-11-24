import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

const logFile = path.join(__dirname, '..', 'logs', 'app.csv');

export const getLogs = (req: Request, res: Response) => {
  try {
    fs.readFile(logFile, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Error reading log file: ${err.message}`);
        res.status(500).json({ error: 'Failed to read logs' });
        return;
      }

      // Parse CSV data
      const logs = data.split('\n').filter(Boolean).map(line => {
        const [timestamp, level, message] = line.split(',');
        return { timestamp, level, message };
      });

      res.json(logs);
    });
  } catch (error) {
    logger.error(`Unexpected error in getLogs: ${error.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const removeLog = (req: Request, res: Response) => {
  try {
    const { timestamp } = req.params;
    fs.readFile(logFile, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Error reading log file: ${err.message}`);
        res.status(500).json({ error: 'Failed to read logs' });
        return;
      }

      const logs = data.split('\n').filter(Boolean);
      const updatedLogs = logs.filter(log => !log.startsWith(timestamp));

      fs.writeFile(logFile, updatedLogs.join('\n') + '\n', (writeErr) => {
        if (writeErr) {
          logger.error(`Error writing updated log file: ${writeErr.message}`);
          res.status(500).json({ error: 'Failed to remove log entry' });
          return;
        }
        res.json({ message: 'Log entry removed successfully' });
      });
    });
  } catch (error) {
    logger.error(`Unexpected error in removeLog: ${error.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};