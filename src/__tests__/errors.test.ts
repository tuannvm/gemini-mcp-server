/**
 * Tests for error handling
 */

import {
  ToolExecutionError,
  CommandExecutionError,
  ValidationError,
  QuotaExceededError,
  handleError,
} from '../errors.js';

describe('Error Classes', () => {
  describe('ToolExecutionError', () => {
    test('should create error with tool name and message', () => {
      const error = new ToolExecutionError('test-tool', 'test error message');

      expect(error.name).toBe('ToolExecutionError');
      expect(error.toolName).toBe('test-tool');
      expect(error.message).toContain('test-tool');
      expect(error.message).toContain('test error message');
    });

    test('should include cause when provided', () => {
      const cause = new Error('original error');
      const error = new ToolExecutionError('test-tool', 'wrapped error', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('CommandExecutionError', () => {
    test('should create error with command and message', () => {
      const error = new CommandExecutionError('gemini', 'command failed');

      expect(error.name).toBe('CommandExecutionError');
      expect(error.command).toBe('gemini');
      expect(error.message).toContain('gemini');
      expect(error.message).toContain('command failed');
    });

    test('should include exit code when provided', () => {
      const error = new CommandExecutionError('gemini', 'failed', 1);

      expect(error.exitCode).toBe(1);
    });
  });

  describe('ValidationError', () => {
    test('should create validation error', () => {
      const error = new ValidationError('invalid input');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('invalid input');
    });
  });

  describe('QuotaExceededError', () => {
    test('should create quota exceeded error', () => {
      const error = new QuotaExceededError('gemini-3-pro-preview');

      expect(error.name).toBe('QuotaExceededError');
      expect(error.message).toContain('gemini-3-pro-preview');
      expect(error.message).toContain('Quota exceeded');
    });
  });
});

describe('handleError', () => {
  test('should handle ToolExecutionError', () => {
    const error = new ToolExecutionError('test-tool', 'test error');
    const result = handleError(error, 'context');

    expect(result).toContain('context');
    expect(result).toContain('test-tool');
  });

  test('should handle CommandExecutionError', () => {
    const error = new CommandExecutionError('gemini', 'failed');
    const result = handleError(error, 'context');

    expect(result).toContain('context');
    expect(result).toContain('gemini');
  });

  test('should handle ValidationError', () => {
    const error = new ValidationError('invalid');
    const result = handleError(error, 'context');

    expect(result).toContain('Validation error');
    expect(result).toContain('context');
  });

  test('should handle QuotaExceededError', () => {
    const error = new QuotaExceededError('gemini-3-pro-preview');
    const result = handleError(error, 'context');

    expect(result).toContain('context');
    expect(result).toContain('Quota exceeded');
  });

  test('should handle generic Error', () => {
    const error = new Error('generic error');
    const result = handleError(error, 'context');

    expect(result).toContain('context');
    expect(result).toContain('generic error');
  });

  test('should handle unknown error', () => {
    const result = handleError('unknown', 'context');

    expect(result).toContain('context');
    expect(result).toContain('unknown error');
  });
});
