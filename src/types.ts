/**
 * Type definitions and schemas for the Gemini MCP Server
 */

// Tool argument interface
export interface ToolArguments {
  prompt?: string;
  model?: string;
  sandbox?: boolean | string;
  yolo?: boolean | string;
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

// Tool annotations for MCP 2025-11-25 spec
export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
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

// Prioritized Web Search Types
export const SEARCH_SOURCE_TYPES = {
  NEWS: 'news',
  ACADEMIC: 'academic',
  DOCUMENTATION: 'documentation',
  GENERAL: 'general',
} as const;

export type SearchSourceType = (typeof SEARCH_SOURCE_TYPES)[keyof typeof SEARCH_SOURCE_TYPES];

export const DATE_RANGE_OPTIONS = {
  RECENT: 'recent',      // Last 24 hours
  PAST_WEEK: 'past-week',
  PAST_MONTH: 'past-month',
  ALL_TIME: 'all-time',
} as const;

export type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[keyof typeof DATE_RANGE_OPTIONS];

export const RESULT_COUNT_OPTIONS = [5, 10, 20] as const;
export type ResultCountOption = (typeof RESULT_COUNT_OPTIONS)[number];
