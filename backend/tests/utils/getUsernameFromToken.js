import { expect, test, mock } from "bun:test";
import { getUsernameFromToken } from '../../utils/getUsernameFromToken';
import { db } from '../../models/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Mock jwt
mock.module('jsonwebtoken', () => ({
  verify: (token, secret, callback) => {
    if (token === 'invalid_token') {
      callback(new Error('Invalid token'), null);
    } else if (token === 'valid_token_no_user') {
      callback(null, { userId: 999, username: 'nonexistent' });
    } else {
      // Simulate a valid token scenario
      callback(null, { userId: 1 });
    }
  },
}));

// Mock db
mock.module('../../models/db.js', () => ({
  db: {
    get: (query, params, callback) => {
      if (params[0] === 1) {
        callback(null, { username: 'testuser' });
      } else {
        callback(null, null); // No user found for other IDs
      }
    },
  },
}));

test('getUsernameFromToken', async () => {
  // Test: should reject if no token is provided
  await expect(getUsernameFromToken()).rejects.toEqual('Authentication required');

  // Test: should reject if token is invalid
  await expect(getUsernameFromToken('invalid_token')).rejects.toEqual('Invalid or expired token');

  // Test: should reject if user is not found in database
  await expect(getUsernameFromToken('valid_token_no_user')).rejects.toEqual('User not found');

  // Test: should resolve with username if token is valid and user is found
  const validToken = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });
  await expect(getUsernameFromToken(validToken)).resolves.toEqual('testuser');
});