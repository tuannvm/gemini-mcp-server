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
      'Path to the media file to analyze. REQUIRED. Use @ prefix for file reference (e.g., @screenshot.png, @diagram.pdf, @photo.jpg). Supports: PNG, JPG, JPEG, GIF, WebP, PDF. Relative paths work from current working directory.'
    ),
  prompt: z
    .string()
    .min(1)
    .describe(
      'What to analyze or extract from the media. REQUIRED. Be specific (e.g., "extract all text from this screenshot", "describe the UI components", "summarize this PDF document", "identify objects and their positions").'
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Gemini model to use. DEFAULT: 'gemini-3-pro-preview' (best multimodal understanding). Use 'gemini-3-flash-preview' for faster but less detailed analysis. Pro recommended for complex images or documents."
    ),
  detailed: z
    .boolean()
    .default(false)
    .describe(
      'Enable comprehensive analysis mode. DEFAULT: false. Set to true for structured output with overview, key elements, technical details, observations, and recommendations. Use for complex analysis tasks.'
    ),
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
          'Path to the media file to analyze. REQUIRED. Use @ prefix (e.g., @screenshot.png, @diagram.pdf). Supports: PNG, JPG, JPEG, GIF, WebP, PDF.',
      },
      prompt: {
        type: 'string',
        description:
          'What to analyze or extract from the media. REQUIRED. Be specific (e.g., "extract all text", "describe UI components", "summarize document").',
      },
      model: {
        type: 'string',
        description:
          "Gemini model to use. DEFAULT: 'gemini-3-pro-preview' (best multimodal). Use 'gemini-3-flash-preview' for faster but less detailed analysis.",
      },
      detailed: {
        type: 'boolean',
        default: false,
        description:
          'Enable comprehensive analysis mode. DEFAULT: false. Set to true for structured output with overview, key elements, and recommendations.',
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
