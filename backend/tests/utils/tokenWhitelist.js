import { addToken, removeToken, isTokenValid, printWhitelist } from '../../utils/tokenWhitelist';

describe('tokenWhitelist', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should add and validate a token', () => {
    const token = 'valid_token';
    addToken(token);
    expect(isTokenValid(token)).toBe(true);
  });

  it('should remove a token', () => {
    const token = 'to_be_removed';
    addToken(token);
    removeToken(token);
    expect(isTokenValid(token)).toBe(false);
  });

  it('should invalidate an expired token', () => {
    const token = 'expiring_token';
    addToken(token);
    jest.advanceTimersByTime(3600001); // Just over 1 hour
    expect(isTokenValid(token)).toBe(false);
  });

  it('should print whitelist correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const token = 'test_token';
    addToken(token);
    printWhitelist();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test_token'));
    consoleSpy.mockRestore();
  });
});