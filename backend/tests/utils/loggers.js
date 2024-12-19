import { expect, test, mock } from "bun:test";
import logger from '../../utils/logger';
import fs from 'fs';
import path from 'path';

test('logger should format log messages correctly', () => {
  let loggedContent = '';

  // Mock fs.writeFileSync to capture the log content
  mock.module('fs', () => ({
    ...fs,
    writeFileSync: (filePath, content) => {
      if (path.basename(filePath) === 'app.cef.log') {
        loggedContent += content;
      }
    },
    existsSync: () => true, // Pretend the log directory always exists
  }));

  // Mock console.log to prevent console output during test
  const originalConsoleLog = console.log;
  console.log = () => {};

  // Call the logger
  logger.infoWithMeta('Blog post created', 'New post', { postId: 123 });

  // Restore console.log
  console.log = originalConsoleLog;

  // Check the logged message
  expect(loggedContent).toMatch(/CEF:0\|Borelli28\|Blog\|1\.0\|1001\|Blog post created\|Medium\|rt=.+ level=info msg="New post" postId=123/);
});