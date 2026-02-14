import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI, MODELS, ERROR_MESSAGES } from '../constants.js';
import { Logger } from '../utils/logger.js';

const searchArgsSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      'Search query for web search. REQUIRED. Use natural language or keywords (e.g., "latest React 19 features", "TypeScript 5.4 release date", "how to fix CORS error"). Gemini will search and synthesize results.'
    ),
  summarize: z
    .boolean()
    .default(true)
    .describe(
      'Return summarized results vs raw output. DEFAULT: true. Set to false only if you need raw search results without synthesis. Summarized mode provides cleaner, actionable information.'
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Gemini model to use. DEFAULT: 'gemini-3-flash-preview' (optimized for speed). Use 'gemini-3-pro-preview' for complex research requiring deeper analysis. Flash is recommended for most searches."
    ),
});

export const searchTool: UnifiedTool = {
  name: 'web-search',
  description:
    'Search the web using Gemini with Google Search grounding for real-time information.',
  zodSchema: searchArgsSchema,
  annotations: {
    title: 'Web Search',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Search query for web search. REQUIRED. Use natural language or keywords (e.g., "latest React 19 features", "TypeScript 5.4 release date"). Gemini will search and synthesize results.',
      },
      summarize: {
        type: 'boolean',
        default: true,
        description:
          'Return summarized results vs raw output. DEFAULT: true. Set to false only if you need raw search results. Summarized mode provides cleaner, actionable information.',
      },
      model: {
        type: 'string',
        description:
          "Gemini model to use. DEFAULT: 'gemini-3-flash-preview' (optimized for speed). Use 'gemini-3-pro-preview' for complex research requiring deeper analysis.",
      },
    },
    required: ['query'],
  },
  prompt: {
    description:
      'Search the web for real-time information using Google Search grounding.',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { query, summarize, model } = args;

    if (!query?.toString().trim()) {
      throw new Error('Please provide a search query');
    }

    const searchPrompt = summarize
      ? `Search the web for: "${query}". Provide a comprehensive summary of the findings with key facts, dates, and sources.`
      : `Search the web for: "${query}". Return the raw search results with sources.`;

    const cmdArgs: string[] = [];

    // Use Gemini 3 Flash by default for faster search results
    cmdArgs.push(CLI.FLAGS.MODEL, (model as string) || MODELS.FLASH);
    cmdArgs.push(CLI.FLAGS.PROMPT, searchPrompt);

    try {
      Logger.debug(`Executing search: ${query}`);
      const result = await executeCommand(
        CLI.COMMANDS.GEMINI,
        cmdArgs,
        onProgress
      );
      return `Search results for "${query}":\n\n${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Try with pro model if flash fails
      if (errorMessage.includes(ERROR_MESSAGES.QUOTA_EXCEEDED)) {
        Logger.warn('Flash quota exceeded, trying Pro model...');
        const fallbackArgs = [
          CLI.FLAGS.MODEL,
          MODELS.PRO,
          CLI.FLAGS.PROMPT,
          searchPrompt,
        ];

        try {
          const result = await executeCommand(
            CLI.COMMANDS.GEMINI,
            fallbackArgs,
            onProgress
          );
          return `Search results for "${query}":\n\n${result}`;
        } catch (fallbackError) {
          throw new Error(
            `Search failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
          );
        }
      }

      throw new Error(`Search failed: ${errorMessage}`);
    }
  },
};
