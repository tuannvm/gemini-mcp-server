/**
 * Web Search Priority Tool
 *
 * Provides enhanced web search with prioritization and filtering capabilities.
 * Leverages Gemini's Google Search grounding with additional customization
 * for source prioritization, domain filtering, and result control.
 */

import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI, MODELS, ERROR_MESSAGES } from '../constants.js';
import { Logger } from '../utils/logger.js';
import {
  SEARCH_SOURCE_TYPES,
  DATE_RANGE_OPTIONS,
  RESULT_COUNT_OPTIONS,
} from '../types.js';

/**
 * Domain validation regex
 * Validates standard domain format (e.g., example.com, sub.example.co.uk)
 * Prevents injection of shell metacharacters and invalid domains
 */
const DOMAIN_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/**
 * Zod schema for web-search-priority tool arguments
 * Includes security validations to prevent injection attacks
 */
const webSearchPriorityArgsSchema = z
  .object({
    query: z
      .string()
      .min(1)
      .max(2000)
      .describe(
        'Search query for web search. REQUIRED. Use natural language or keywords. Maximum 2000 characters.'
      ),
    sourcePriority: z
      .enum([
        SEARCH_SOURCE_TYPES.NEWS,
        SEARCH_SOURCE_TYPES.ACADEMIC,
        SEARCH_SOURCE_TYPES.DOCUMENTATION,
        SEARCH_SOURCE_TYPES.GENERAL,
      ])
      .optional()
      .describe(
        'Prioritize specific source types: news (recent articles, press releases), academic (research papers, journals), documentation (API docs, guides), general (default balanced results)'
      ),
    dateRange: z
      .enum([
        DATE_RANGE_OPTIONS.RECENT,
        DATE_RANGE_OPTIONS.PAST_WEEK,
        DATE_RANGE_OPTIONS.PAST_MONTH,
        DATE_RANGE_OPTIONS.ALL_TIME,
      ])
      .optional()
      .describe(
        'Filter results by date: recent (last 24 hours), past-week, past-month, all-time (default)'
      ),
    domainWhitelist: z
      .array(
        z.string().refine((val) => DOMAIN_REGEX.test(val), {
          message:
            'Invalid domain format. Must be a valid domain (e.g., example.com)',
        })
      )
      .max(50)
      .optional()
      .describe(
        'Limit search to specific domains (e.g., ["github.com", "docs.example.com"]). Results only from whitelisted domains. Maximum 50 domains.'
      ),
    domainBlacklist: z
      .array(
        z.string().refine((val) => DOMAIN_REGEX.test(val), {
          message:
            'Invalid domain format. Must be a valid domain (e.g., example.com)',
        })
      )
      .max(50)
      .optional()
      .describe(
        'Exclude specific domains from results (e.g., ["spam.com", "ads.example.net"]). Results exclude blacklisted domains. Maximum 50 domains.'
      ),
    resultCount: z
      .union([z.literal(5), z.literal(10), z.literal(20)])
      .optional()
      .describe(
        'Number of results to return: 5 (fastest), 10 (default), 20 (comprehensive)'
      ),
    model: z
      .string()
      .optional()
      .describe(
        `Gemini model to use. DEFAULT: '${MODELS.FLASH}' (optimized for speed). Use '${MODELS.PRO}' for complex research requiring deeper analysis.`
      ),
    verbose: z
      .boolean()
      .default(false)
      .describe(
        'Return detailed results with sources and metadata vs concise summary. DEFAULT: false'
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
 * Sanitize user input to prevent command injection
 * Removes or escapes dangerous shell metacharacters
 */
function sanitizeInput(input: string): string {
  // Remove dangerous shell metacharacters
  return input
    .replace(/[\n\r]/g, ' ') // Newlines to spaces
    .replace(/[;&|`$()]/g, '') // Remove shell metacharacters
    .trim();
}

/**
 * Validate and sanitize domain list
 */
function sanitizeDomainList(domains: string[]): string[] {
  return domains
    .map((d) => d.trim().toLowerCase())
    .filter((d) => DOMAIN_REGEX.test(d));
}

/**
 * Build the search prompt with priority filters
 */
function buildSearchPrompt(
  args: z.infer<typeof webSearchPriorityArgsSchema>
): string {
  const {
    query,
    sourcePriority,
    dateRange,
    domainWhitelist,
    domainBlacklist,
    resultCount,
    verbose,
  } = args;

  // Sanitize query to prevent injection
  const sanitizedQuery = sanitizeInput(query);

  // Sanitize domain lists
  const sanitizedWhitelist = domainWhitelist
    ? sanitizeDomainList(domainWhitelist)
    : [];
  const sanitizedBlacklist = domainBlacklist
    ? sanitizeDomainList(domainBlacklist)
    : [];

  const instructions: string[] = [];
  const resultCountValue = resultCount || 10;

  // Source priority instructions
  if (sourcePriority) {
    switch (sourcePriority) {
      case SEARCH_SOURCE_TYPES.NEWS:
        instructions.push(
          'PRIORITIZE recent news articles, press releases, and current events from major news outlets.'
        );
        break;
      case SEARCH_SOURCE_TYPES.ACADEMIC:
        instructions.push(
          'PRIORITIZE academic research papers, journals, scientific publications, and scholarly articles.'
        );
        break;
      case SEARCH_SOURCE_TYPES.DOCUMENTATION:
        instructions.push(
          'PRIORITIZE official documentation, API references, technical guides, and developer resources.'
        );
        break;
      case SEARCH_SOURCE_TYPES.GENERAL:
      default:
        instructions.push(
          'Use balanced search results from diverse, authoritative sources.'
        );
        break;
    }
  }

  // Date range instructions
  if (dateRange) {
    switch (dateRange) {
      case DATE_RANGE_OPTIONS.RECENT:
        instructions.push(
          'Filter: ONLY results from the last 24 hours (very recent).'
        );
        break;
      case DATE_RANGE_OPTIONS.PAST_WEEK:
        instructions.push('Filter: ONLY results from the past 7 days.');
        break;
      case DATE_RANGE_OPTIONS.PAST_MONTH:
        instructions.push('Filter: ONLY results from the past 30 days.');
        break;
      case DATE_RANGE_OPTIONS.ALL_TIME:
      default:
        // No date filter
        break;
    }
  }

  // Domain filtering instructions
  if (sanitizedWhitelist.length > 0) {
    instructions.push(
      `Filter: ONLY results from domains: ${sanitizedWhitelist.join(', ')}`
    );
  }

  if (sanitizedBlacklist.length > 0) {
    instructions.push(
      `Filter: EXCLUDE results from domains: ${sanitizedBlacklist.join(', ')}`
    );
  }

  // Result count
  instructions.push(
    `Return the top ${resultCountValue} most relevant results.`
  );

  // Verbose output
  if (verbose) {
    instructions.push(
      'Provide detailed results including: source URLs, publication dates when available, and key quotes or excerpts.'
    );
  } else {
    instructions.push(
      'Provide a concise summary of findings with key facts, dates, and source references.'
    );
  }

  return `Search the web and apply these filters:

${instructions.map((inst) => `- ${inst}`).join('\n')}

QUERY: "${sanitizedQuery}"

Execute the search with these priorities and provide a structured response matching the requested format.`;
}

/**
 * Web Search Priority Tool
 *
 * Enhanced web search with source prioritization, domain filtering,
 * date range filtering, and result count control.
 */
export const webSearchPriorityTool: UnifiedTool = {
  name: 'web-search-priority',
  description:
    'Enhanced web search with source prioritization, domain filtering, date range filtering, and result count control. Uses Gemini with Google Search grounding.',
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
          'Search query for web search. REQUIRED. Use natural language or keywords. Maximum 2000 characters.',
        minLength: 1,
        maxLength: 2000,
      },
      sourcePriority: {
        type: 'string',
        enum: [
          SEARCH_SOURCE_TYPES.NEWS,
          SEARCH_SOURCE_TYPES.ACADEMIC,
          SEARCH_SOURCE_TYPES.DOCUMENTATION,
          SEARCH_SOURCE_TYPES.GENERAL,
        ],
        description:
          'Prioritize specific source types: news (recent articles), academic (research papers), documentation (API docs), general (balanced)',
      },
      dateRange: {
        type: 'string',
        enum: [
          DATE_RANGE_OPTIONS.RECENT,
          DATE_RANGE_OPTIONS.PAST_WEEK,
          DATE_RANGE_OPTIONS.PAST_MONTH,
          DATE_RANGE_OPTIONS.ALL_TIME,
        ],
        description:
          'Filter results by date: recent (24h), past-week, past-month, all-time (default)',
      },
      domainWhitelist: {
        type: 'array',
        items: {
          type: 'string',
        },
        maxItems: 50,
        description:
          "Limit search to specific domains (e.g., ['github.com', 'docs.example.com']). Must be valid domain formats. Maximum 50 domains.",
      },
      domainBlacklist: {
        type: 'array',
        items: {
          type: 'string',
        },
        maxItems: 50,
        description:
          "Exclude specific domains from results (e.g., ['spam.com', 'ads.example.net']). Must be valid domain formats. Maximum 50 domains.",
      },
      resultCount: {
        type: 'number',
        enum: [5, 10, 20],
        description:
          'Number of results: 5 (fastest), 10 (default), 20 (comprehensive)',
      },
      model: {
        type: 'string',
        description: `Gemini model. DEFAULT: '${MODELS.FLASH}' (speed). Use '${MODELS.PRO}' for deep analysis.`,
      },
      verbose: {
        type: 'boolean',
        description:
          'Return detailed results with sources vs concise summary. DEFAULT: false',
      },
    },
    required: ['query'],
  },
  prompt: {
    description:
      'Enhanced web search with filters and prioritization for real-time information.',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    // Validate and parse arguments
    const validatedArgs = webSearchPriorityArgsSchema.parse(args);

    const { query, model } = validatedArgs;

    // Build the enhanced search prompt
    const searchPrompt = buildSearchPrompt(validatedArgs);

    const cmdArgs: string[] = [];

    // Use specified model or Flash by default for speed
    cmdArgs.push(CLI.FLAGS.MODEL, model || MODELS.FLASH);
    cmdArgs.push(CLI.FLAGS.PROMPT, searchPrompt);

    try {
      Logger.debug(`Executing priority search: ${query}`);
      Logger.debug(
        `Filters: source=${validatedArgs.sourcePriority || 'none'}, ` +
          `dateRange=${validatedArgs.dateRange || 'all-time'}, ` +
          `resultCount=${validatedArgs.resultCount || 10}`
      );

      const result = await executeCommand(
        CLI.COMMANDS.GEMINI,
        cmdArgs,
        onProgress
      );

      return `Priority Search Results for "${query}":

${buildResultHeader(validatedArgs)}

${result}`;
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

          return `Priority Search Results for "${query}":

${buildResultHeader(validatedArgs)}

${result}`;
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

/**
 * Build a header showing the active filters
 */
function buildResultHeader(
  args: z.infer<typeof webSearchPriorityArgsSchema>
): string {
  const parts: string[] = [];

  if (args.sourcePriority) {
    parts.push(`Source: ${args.sourcePriority}`);
  }

  if (args.dateRange) {
    parts.push(`Date Range: ${args.dateRange}`);
  }

  if (args.domainWhitelist && args.domainWhitelist.length > 0) {
    parts.push(`Domains: ${args.domainWhitelist.join(', ')}`);
  }

  if (args.domainBlacklist && args.domainBlacklist.length > 0) {
    parts.push(`Excluded: ${args.domainBlacklist.join(', ')}`);
  }

  parts.push(`Results: ${args.resultCount || 10}`);

  return parts.length > 0 ? `Active Filters: ${parts.join(' | ')}` : '';
}
