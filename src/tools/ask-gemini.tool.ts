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
      "Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions"
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Optional model to use (e.g., 'gemini-3-flash-preview'). If not specified, uses the default model (gemini-3-pro-preview)."
    ),
  sandbox: z
    .boolean()
    .default(false)
    .describe(
      'Use sandbox mode (-s flag) to safely test code changes, execute scripts, or run potentially risky operations in an isolated environment'
    ),
  changeMode: z
    .boolean()
    .default(false)
    .describe(
      'Enable structured change mode - formats prompts to prevent tool errors and returns structured edit suggestions that Claude can apply directly'
    ),
  chunkIndex: z
    .union([z.number(), z.string()])
    .optional()
    .describe('Which chunk to return (1-based)'),
  chunkCacheKey: z
    .string()
    .optional()
    .describe('Optional cache key for continuation'),
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
          "Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
      },
      model: {
        type: 'string',
        description:
          "Optional model to use (e.g., 'gemini-3-flash-preview'). If not specified, uses the default model (gemini-3-pro-preview).",
      },
      sandbox: {
        type: 'boolean',
        default: false,
        description:
          'Use sandbox mode (-s flag) to safely test code changes, execute scripts, or run potentially risky operations in an isolated environment',
      },
      changeMode: {
        type: 'boolean',
        default: false,
        description:
          'Enable structured change mode - formats prompts to prevent tool errors and returns structured edit suggestions that Claude can apply directly',
      },
      chunkIndex: {
        type: ['number', 'string'],
        description: 'Which chunk to return (1-based)',
      },
      chunkCacheKey: {
        type: 'string',
        description: 'Optional cache key for continuation',
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
    const { prompt, model, sandbox, changeMode, chunkIndex, chunkCacheKey } =
      args;
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
