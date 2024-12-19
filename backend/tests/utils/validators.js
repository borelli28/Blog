import { userRegisterValidator, userLoginValidator, passwordValidator } from '../../utils/validators';
import { db } from '../../models/db';

jest.mock('../models/db');

describe('validators', () => {
  describe('userRegisterValidator', () => {
    it('should validate a correct user registration', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const postData = {
        username: 'validuser',
        password: 'validpassword123',
        confirm_password: 'validpassword123'
      };

      const errors = await userRegisterValidator(postData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid registration data', async () => {
      const postData = {
        username: 'a',
        password: 'short',
        confirm_password: 'notmatch'
      };

      const errors = await userRegisterValidator(postData);
      expect(errors.username).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });

  describe('userLoginValidator', () => {
    it('should validate correct login data', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, { username: 'existinguser' });
      });

      const postData = {
        username: 'existinguser',
        password: 'validpassword123'
      };

      const errors = await userLoginValidator(postData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid login data', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const postData = {
        username: 'nonexistentuser',
        password: 'short'
      };

      const errors = await userLoginValidator(postData);
      expect(errors.username).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });

  describe('passwordValidator', () => {
    it('should validate a correct password', () => {
      const postData = {
        password: 'validpassword123'
      };

      const errors = passwordValidator(postData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for an invalid password', () => {
      const postData = {
        password: 'short<>'
      };

      const errors = passwordValidator(postData);
      expect(errors.password).toBeDefined();
    });
  });
});