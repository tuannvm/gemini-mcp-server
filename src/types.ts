/**
 * Type definitions and schemas for the Gemini MCP Server
 */

// Tool argument interface
export interface ToolArguments {
  prompt?: string;
  model?: string;
  sandbox?: boolean | string;
  changeMode?: boolean | string;
  chunkIndex?: number | string;
  chunkCacheKey?: string;
  message?: string;

  // Brainstorm tool arguments
  methodology?: string;
  domain?: string;
  constraints?: string;
  existingContext?: string;
  ideaCount?: number;
  includeAnalysis?: boolean;

  [key: string]: string | boolean | number | undefined;
}

// Server configuration
export interface ServerConfig {
  name: string;
  version: string;
}

// Progress callback type
export type ProgressCallback = (newOutput: string) => void;

// Tool constants
export const TOOLS = {
  GEMINI: 'gemini',
  WEB_SEARCH: 'web-search',
  ANALYZE_MEDIA: 'analyze-media',
  SHELL: 'shell',
  BRAINSTORM: 'brainstorm',
  FETCH_CHUNK: 'fetch-chunk',
  PING: 'ping',
  HELP: 'help',
  TIMEOUT_TEST: 'timeout-test',
} as const;

export type ToolName = (typeof TOOLS)[keyof typeof TOOLS];

// Model constants - Using Gemini 3 as defaults
export const MODELS = {
  PRO: 'gemini-3-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  FLASH_LITE: 'gemini-2.5-flash-lite', // No Gemini 3 lite yet
} as const;

export type ModelName = (typeof MODELS)[keyof typeof MODELS];
