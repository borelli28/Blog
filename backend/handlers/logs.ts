import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export const getLogs = (req: Request, res: Response) => {
  const logFile = path.join(__dirname, '..', 'logs', 'app.csv');

  fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
      logger.error(`Error reading log file: ${err.message}`);
      res.status(500).json({ error: 'Failed to read logs' });
      return;
    }

    // Parse CSV data
    const logs = data.split('\n').map(line => {
      const [timestamp, level, message] = line.split(',');
      return { timestamp, level, message };
    });

    res.json(logs);
  });
};