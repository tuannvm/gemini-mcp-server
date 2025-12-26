/**
 * Custom error classes for the Gemini MCP Server
 */

export class ToolExecutionError extends Error {
  constructor(
    public readonly toolName: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(`Error executing tool '${toolName}': ${message}`);
    this.name = 'ToolExecutionError';
  }
}

export class CommandExecutionError extends Error {
  constructor(
    public readonly command: string,
    message: string,
    public readonly exitCode?: number
  ) {
    super(`Command '${command}' failed: ${message}`);
    this.name = 'CommandExecutionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class QuotaExceededError extends Error {
  constructor(model: string) {
    super(`Quota exceeded for model: ${model}`);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Handle errors and return a user-friendly message
 */
export function handleError(error: unknown, context: string): string {
  if (error instanceof ToolExecutionError) {
    return `${context}: ${error.message}`;
  }

  if (error instanceof CommandExecutionError) {
    return `${context}: ${error.message}`;
  }

  if (error instanceof ValidationError) {
    return `Validation error in ${context}: ${error.message}`;
  }

  if (error instanceof QuotaExceededError) {
    return `${context}: ${error.message}`;
  }

  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }

  return `${context}: An unknown error occurred`;
}
