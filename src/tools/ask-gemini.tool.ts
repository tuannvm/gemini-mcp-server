import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import {
  executeGeminiCLI,
  processChangeModeOutput,
} from '../utils/geminiExecutor.js';
import { ERROR_MESSAGES, STATUS_MESSAGES } from '../constants.js';

const askGeminiArgsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe(
      "The question or task for Gemini. REQUIRED. Use @ prefix to include files (e.g., '@src/app.ts explain the auth flow', '@package.json suggest improvements'). For code analysis, include relevant file paths. For general questions, just ask directly."
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Gemini model to use. OPTIONS: 'gemini-3-pro-preview' (default, best quality), 'gemini-3-flash-preview' (faster, good for simple tasks). Use Flash for quick lookups or when Pro quota is exceeded. Omit to use default Pro model."
    ),
  sandbox: z
    .boolean()
    .default(false)
    .describe(
      'Enable sandboxed code execution (-s flag). Use when Gemini needs to run code, execute scripts, or test changes in isolation. Sandbox prevents modifications to your actual filesystem. Set to true for code execution tasks.'
    ),
  yolo: z
    .boolean()
    .default(false)
    .describe(
      'Enable YOLO mode (--yolo flag) to auto-approve ALL tool executions without confirmation prompts. REQUIRED when using Google Workspace extension (gemini-cli-extensions/workspace) to access Gmail, Google Drive, Sheets, Docs, Calendar, or Chat. Without this flag, Workspace extension tools will hang waiting for user approval. Set to true for any request involving Google Workspace data or actions.'
    ),
  changeMode: z
    .boolean()
    .default(false)
    .describe(
      'Enable structured edit mode for code modifications. Returns edits in OLD/NEW format that can be applied programmatically. Use when requesting code changes that need to be applied to files. The response will include exact line numbers and replacement blocks.'
    ),
  chunkIndex: z
    .union([z.number(), z.string()])
    .optional()
    .describe(
      'Chunk number to retrieve (1-based). Use ONLY when a previous changeMode response indicated multiple chunks. Combine with chunkCacheKey from the original response to get subsequent chunks.'
    ),
  chunkCacheKey: z
    .string()
    .optional()
    .describe(
      'Cache key from a previous chunked response. REQUIRED when fetching subsequent chunks. Copy the cacheKey from the original changeMode response that contained "Chunk 1 of N".'
    ),
});

export const askGeminiTool: UnifiedTool = {
  name: 'gemini',
  description:
    'Query Gemini AI. Supports model selection, sandbox mode for safe code execution, and structured change mode for applying edits.',
  zodSchema: askGeminiArgsSchema,
  annotations: {
    title: 'Query Gemini AI',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          "The question or task for Gemini. REQUIRED. Use @ prefix to include files (e.g., '@src/app.ts explain the auth flow', '@package.json suggest improvements'). For code analysis, include relevant file paths. For general questions, just ask directly.",
      },
      model: {
        type: 'string',
        description:
          "Gemini model to use. OPTIONS: 'gemini-3-pro-preview' (default, best quality), 'gemini-3-flash-preview' (faster, good for simple tasks). Use Flash for quick lookups or when Pro quota is exceeded. Omit to use default Pro model.",
      },
      sandbox: {
        type: 'boolean',
        default: false,
        description:
          'Enable sandboxed code execution (-s flag). Use when Gemini needs to run code, execute scripts, or test changes in isolation. Sandbox prevents modifications to your actual filesystem. Set to true for code execution tasks.',
      },
      yolo: {
        type: 'boolean',
        default: false,
        description:
          'Enable YOLO mode (--yolo flag) to auto-approve ALL tool executions without confirmation prompts. REQUIRED when using Google Workspace extension (gemini-cli-extensions/workspace) to access Gmail, Google Drive, Sheets, Docs, Calendar, or Chat. Without this flag, Workspace extension tools will hang waiting for user approval. Set to true for any request involving Google Workspace data or actions.',
      },
      changeMode: {
        type: 'boolean',
        default: false,
        description:
          'Enable structured edit mode for code modifications. Returns edits in OLD/NEW format that can be applied programmatically. Use when requesting code changes that need to be applied to files. The response will include exact line numbers and replacement blocks.',
      },
      chunkIndex: {
        type: ['number', 'string'],
        description:
          'Chunk number to retrieve (1-based). Use ONLY when a previous changeMode response indicated multiple chunks. Combine with chunkCacheKey from the original response to get subsequent chunks.',
      },
      chunkCacheKey: {
        type: 'string',
        description:
          'Cache key from a previous chunked response. REQUIRED when fetching subsequent chunks. Copy the cacheKey from the original changeMode response that contained "Chunk 1 of N".',
      },
    },
    required: ['prompt'],
  },
  prompt: {
    description:
      'Query Gemini AI with optional sandbox execution and structured change mode.',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const {
      prompt,
      model,
      sandbox,
      yolo,
      changeMode,
      chunkIndex,
      chunkCacheKey,
    } = args;
    if (!prompt?.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    if (changeMode && chunkIndex && chunkCacheKey) {
      return processChangeModeOutput(
        '', // empty for cache...
        chunkIndex as number,
        chunkCacheKey as string,
        prompt as string
      );
    }

    const result = await executeGeminiCLI(
      prompt as string,
      model as string | undefined,
      !!sandbox,
      !!yolo,
      !!changeMode,
      onProgress
    );

    if (changeMode) {
      return processChangeModeOutput(
        result,
        args.chunkIndex as number | undefined,
        undefined,
        prompt as string
      );
    }
    return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n${result}`; // changeMode false
  },
};
