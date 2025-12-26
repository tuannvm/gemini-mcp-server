import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';
import { CLI, MODELS, STATUS_MESSAGES } from '../constants.js';
import { Logger } from '../utils/logger.js';

const shellArgsSchema = z.object({
  task: z
    .string()
    .min(1)
    .describe(
      'Description of the shell task to perform (e.g., "list all TypeScript files", "find large files over 10MB")'
    ),
  workingDirectory: z
    .string()
    .optional()
    .describe(
      'Working directory for command execution (use @ syntax, e.g., @src/)'
    ),
  dryRun: z
    .boolean()
    .default(true)
    .describe(
      'If true, Gemini will explain the commands without executing. If false, uses sandbox mode for safe execution.'
    ),
  model: z
    .string()
    .optional()
    .describe('Model to use (default: gemini-3-flash-preview)'),
});

export const shellTool: UnifiedTool = {
  name: 'shell',
  description:
    'Generate and optionally execute shell commands using Gemini. By default runs in dry-run mode (explains commands). Set dryRun=false to execute in sandbox.',
  zodSchema: shellArgsSchema,
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description:
          'Description of the shell task to perform (e.g., "list all TypeScript files", "find large files over 10MB")',
      },
      workingDirectory: {
        type: 'string',
        description:
          'Working directory for command execution (use @ syntax, e.g., @src/)',
      },
      dryRun: {
        type: 'boolean',
        default: true,
        description:
          'If true, Gemini will explain the commands without executing. If false, uses sandbox mode for safe execution.',
      },
      model: {
        type: 'string',
        description: 'Model to use (default: gemini-3-flash-preview)',
      },
    },
    required: ['task'],
  },
  prompt: {
    description:
      'Generate shell commands for a task, optionally executing in sandbox mode',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { task, workingDirectory, dryRun, model } = args;

    if (!task?.toString().trim()) {
      throw new Error('Please provide a task description');
    }

    let shellPrompt: string;

    if (dryRun) {
      shellPrompt = `Generate shell commands for the following task. Do NOT execute them, just explain what commands would be needed and what they do:

Task: ${task}
${workingDirectory ? `Working directory: ${workingDirectory}` : ''}

Provide:
1. The exact command(s) to run
2. Explanation of what each command does
3. Any prerequisites or warnings
4. Expected output`;
    } else {
      shellPrompt = `Execute the following task using shell commands in sandbox mode:

Task: ${task}
${workingDirectory ? `Working directory: ${workingDirectory}` : ''}

Execute the necessary commands and provide:
1. Commands executed
2. Output/results
3. Any errors encountered
4. Summary of what was accomplished`;
    }

    const cmdArgs: string[] = [];

    // Use Gemini 3 Flash for speed
    cmdArgs.push(CLI.FLAGS.MODEL, (model as string) || MODELS.FLASH);

    // Use sandbox mode when actually executing commands
    if (!dryRun) {
      cmdArgs.push(CLI.FLAGS.SANDBOX);
    }

    cmdArgs.push(CLI.FLAGS.PROMPT, shellPrompt);

    try {
      Logger.debug(`Shell task (dryRun=${dryRun}): ${task}`);
      const result = await executeCommand(
        CLI.COMMANDS.GEMINI,
        cmdArgs,
        onProgress
      );

      const header = dryRun
        ? 'Shell Commands (Dry Run - Not Executed)'
        : 'Shell Execution Results (Sandbox Mode)';

      return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n\n**${header}**\n\nTask: ${task}\n\n${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Shell task failed: ${errorMessage}`);
    }
  },
};
