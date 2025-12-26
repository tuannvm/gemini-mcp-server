import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI, MODELS, ERROR_MESSAGES, STATUS_MESSAGES } from '../constants.js';
import { Logger } from '../utils/logger.js';

const analyzeMediaArgsSchema = z.object({
  filePath: z
    .string()
    .min(1)
    .describe(
      'Path to the image or PDF file to analyze. Use @ syntax (e.g., @image.png, @document.pdf)'
    ),
  prompt: z
    .string()
    .min(1)
    .describe('What to analyze or extract from the media file'),
  model: z
    .string()
    .optional()
    .describe('Model to use (default: gemini-3-pro-preview for multimodal)'),
  detailed: z
    .boolean()
    .default(false)
    .describe('Provide detailed analysis with more context'),
});

export const analyzeMediaTool: UnifiedTool = {
  name: 'analyze-media',
  description:
    'Analyze images, PDFs, or other media files using Gemini multimodal capabilities. Supports screenshots, diagrams, documents, and more.',
  zodSchema: analyzeMediaArgsSchema,
  annotations: {
    title: 'Analyze Media',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description:
          'Path to the image or PDF file to analyze. Use @ syntax (e.g., @image.png, @document.pdf)',
      },
      prompt: {
        type: 'string',
        description: 'What to analyze or extract from the media file',
      },
      model: {
        type: 'string',
        description:
          'Model to use (default: gemini-3-pro-preview for multimodal)',
      },
      detailed: {
        type: 'boolean',
        default: false,
        description: 'Provide detailed analysis with more context',
      },
    },
    required: ['filePath', 'prompt'],
  },
  prompt: {
    description:
      'Analyze media files (images, PDFs) using Gemini multimodal AI',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { filePath, prompt, model, detailed } = args;

    if (!filePath?.toString().trim()) {
      throw new Error('Please provide a file path to analyze');
    }

    if (!prompt?.toString().trim()) {
      throw new Error('Please provide a prompt describing what to analyze');
    }

    // Ensure @ prefix for file reference
    const fileRef = (filePath as string).startsWith('@')
      ? filePath
      : `@${filePath}`;

    const analysisPrompt = detailed
      ? `Analyze this file in detail: ${fileRef}\n\nProvide a comprehensive analysis including:\n1. Overview/Summary\n2. Key elements and their significance\n3. Technical details (if applicable)\n4. Notable observations\n5. Recommendations or insights\n\nUser request: ${prompt}`
      : `Analyze: ${fileRef}\n\n${prompt}`;

    const cmdArgs: string[] = [];

    // Use Gemini 3 Pro by default for better multimodal understanding
    cmdArgs.push(CLI.FLAGS.MODEL, (model as string) || MODELS.PRO);
    cmdArgs.push(CLI.FLAGS.PROMPT, analysisPrompt);

    try {
      Logger.debug(`Analyzing media: ${fileRef}`);
      const result = await executeCommand(
        CLI.COMMANDS.GEMINI,
        cmdArgs,
        onProgress
      );
      return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n\n**File:** ${fileRef}\n\n${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Fallback to flash if pro quota exceeded
      if (
        errorMessage.includes(ERROR_MESSAGES.QUOTA_EXCEEDED) &&
        (model as string) !== MODELS.FLASH
      ) {
        Logger.warn('Pro quota exceeded, trying Flash model...');
        const fallbackArgs = [
          CLI.FLAGS.MODEL,
          MODELS.FLASH,
          CLI.FLAGS.PROMPT,
          analysisPrompt,
        ];

        try {
          const result = await executeCommand(
            CLI.COMMANDS.GEMINI,
            fallbackArgs,
            onProgress
          );
          return `${STATUS_MESSAGES.GEMINI_RESPONSE} (using Flash model)\n\n**File:** ${fileRef}\n\n${result}`;
        } catch (fallbackError) {
          throw new Error(
            `Media analysis failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
          );
        }
      }

      throw new Error(`Media analysis failed: ${errorMessage}`);
    }
  },
};
