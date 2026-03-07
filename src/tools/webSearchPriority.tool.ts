/**
 * Web Search Priority Tool
 *
 * Provides web search using Gemini's Google Search grounding.
 * Leverages the model's natural language understanding for search queries
 * and optional search context/instructions.
 */

import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI, MODELS } from '../constants.js';
import { Logger } from '../utils/logger.js';

/**
 * Zod schema for web-search-priority tool arguments
 */
const webSearchPriorityArgsSchema = z
  .object({
    query: z
      .string()
      .min(1)
      .max(2000)
      .describe(
        'Search query for web search. REQUIRED. Use natural language. You can include search preferences directly in your query (e.g., "search GitHub for recent React hooks documentation", "find academic papers about machine learning interpretability from the past month"). Maximum 2000 characters.'
      ),
    searchContext: z
      .string()
      .max(1000)
      .optional()
      .describe(
        'Additional search instructions or context (e.g., "prioritize official documentation", "focus on recent news from the past week", "exclude results from spam domains"). Maximum 1000 characters.'
      ),
    model: z
      .string()
      .optional()
      .describe(
        `Gemini model to use. DEFAULT: '${MODELS.FLASH}' (optimized for speed). Use '${MODELS.PRO}' for complex research requiring deeper analysis.`
      ),
  })
  .strict();

/**
 * Check if error indicates quota/rate limit exceeded
 * Provides robust detection across various error message formats
 */
function isQuotaError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return (
    lowerMessage.includes('quota') ||
    lowerMessage.includes('rate limit') ||
    errorMessage.includes('429') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('limit exceeded')
  );
}

/**
 * Build the search prompt
 */
function buildSearchPrompt(
  args: z.infer<typeof webSearchPriorityArgsSchema>
): string {
  const { query, searchContext } = args;

  // Build prompt with optional context
  if (searchContext) {
    return `Search the web for: "${query}"

${searchContext}

Provide a comprehensive summary of your findings with key facts, dates, and sources.`;
  }

  return `Search the web for: "${query}". Provide a comprehensive summary of your findings with key facts, dates, and sources.`;
}

/**
 * Web Search Priority Tool
 *
 * Web search using Gemini's Google Search grounding.
 * Leverages natural language queries with optional search context.
 */
export const webSearchPriorityTool: UnifiedTool = {
  name: 'web-search-priority',
  description:
    'Search the web using Gemini with Google Search grounding. Express search preferences naturally in your query or use searchContext for additional instructions.',
  zodSchema: webSearchPriorityArgsSchema,
  annotations: {
    title: 'Web Search Priority',
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
          'Search query for web search. REQUIRED. Use natural language. Include search preferences directly in your query (e.g., "search GitHub for recent React hooks documentation", "find academic papers about ML from the past month"). Maximum 2000 characters.',
        minLength: 1,
        maxLength: 2000,
      },
      searchContext: {
        type: 'string',
        description:
          'Additional search instructions or context (e.g., "prioritize official documentation", "focus on recent news", "exclude spam domains"). Maximum 1000 characters.',
        maxLength: 1000,
      },
      model: {
        type: 'string',
        description: `Gemini model. DEFAULT: '${MODELS.FLASH}' (speed). Use '${MODELS.PRO}' for deep analysis.`,
      },
    },
    required: ['query'],
  },
  prompt: {
    description:
      'Enhanced web search with natural language queries and optional search context.',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    // Validate and parse arguments
    const validatedArgs = webSearchPriorityArgsSchema.parse(args);

    const { query, model } = validatedArgs;

    // Build the search prompt
    const searchPrompt = buildSearchPrompt(validatedArgs);

    const cmdArgs: string[] = [];

    // Use specified model or Flash by default for speed
    cmdArgs.push(CLI.FLAGS.MODEL, model || MODELS.FLASH);
    cmdArgs.push(CLI.FLAGS.PROMPT, searchPrompt);

    try {
      Logger.debug(`Executing priority search: ${query}`);
      if (validatedArgs.searchContext) {
        Logger.debug(`Search context: ${validatedArgs.searchContext}`);
      }

      const result = await executeCommand(
        CLI.COMMANDS.GEMINI,
        cmdArgs,
        onProgress
      );

      return `Search results for "${query}":\n\n${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Try with Pro model if Flash fails (quota exceeded)
      if (isQuotaError(errorMessage) && model !== MODELS.PRO) {
        Logger.warn(
          'Flash quota exceeded for priority search, trying Pro model...'
        );

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
            `Priority search failed: ${
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError)
            }`
          );
        }
      }

      throw new Error(`Priority search failed: ${errorMessage}`);
    }
  },
};
