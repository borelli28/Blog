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

export const removeLog = async (req: Request, res: Response) => {
  const { timestamp } = req.params;
  try {
    const data = await fs.readFile(logFile, 'utf8');
    const logs = data.split('\n').filter(Boolean);
    const updatedLogs = logs.filter(log => !log.startsWith(timestamp));
    await fs.writeFile(logFile, updatedLogs.join('\n') + '\n');
    res.json({ message: 'Log entry removed successfully' });

  } catch (err) {
    logger.error(`Error removing log entry: ${err.message}`);
    res.status(500).json({ error: 'Failed to remove log entry' });
  }
};