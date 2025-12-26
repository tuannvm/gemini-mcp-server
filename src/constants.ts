/**
 * Constants for the Gemini MCP Server
 */

// Re-export types for backward compatibility
export { ToolArguments, MODELS } from './types.js';

// Logging
export const LOG_PREFIX = '[GMCP]';

// Error messages
export const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: "Quota exceeded for quota metric 'Gemini 3 Pro Requests'",
  QUOTA_EXCEEDED_SHORT:
    "Gemini 3 Pro daily quota exceeded. Please retry with model: 'gemini-3-flash-preview'",
  TOOL_NOT_FOUND: 'not found in registry',
  NO_PROMPT_PROVIDED:
    "Please provide a prompt for analysis. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  QUOTA_SWITCHING: 'Gemini 3 Pro quota exceeded, switching to Flash model...',
  FLASH_RETRY: 'Retrying with Gemini 3 Flash...',
  FLASH_SUCCESS: 'Flash model completed successfully',
  SANDBOX_EXECUTING: 'Executing Gemini CLI command in sandbox mode...',
  GEMINI_RESPONSE: 'Gemini response:',
  PROCESSING_START:
    'Starting analysis (may take 5-15 minutes for large codebases)',
  PROCESSING_CONTINUE: 'Still processing... Gemini is working on your request',
  PROCESSING_COMPLETE: 'Analysis completed successfully',
} as const;

// MCP Protocol Constants
export const PROTOCOL = {
  ROLES: {
    USER: 'user',
    ASSISTANT: 'assistant',
  },
  CONTENT_TYPES: {
    TEXT: 'text',
  },
  STATUS: {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
    REPORT: 'report',
  },
  NOTIFICATIONS: {
    PROGRESS: 'notifications/progress',
  },
  KEEPALIVE_INTERVAL: 25000,
} as const;

// CLI Constants
export const CLI = {
  COMMANDS: {
    GEMINI: 'gemini',
    ECHO: 'echo',
  },
  FLAGS: {
    MODEL: '-m',
    SANDBOX: '-s',
    PROMPT: '-p',
    HELP: '-help',
  },
  DEFAULTS: {
    MODEL: 'default',
    BOOLEAN_TRUE: 'true',
    BOOLEAN_FALSE: 'false',
  },
} as const;
