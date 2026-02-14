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
      'Shell task description. REQUIRED. Describe what you want to accomplish in natural language (e.g., "find all TypeScript files modified in the last week", "compress all log files in the logs directory", "set up a new React project with Vite"). Gemini will generate appropriate commands.'
    ),
  workingDirectory: z
    .string()
    .optional()
    .describe(
      'Directory to run commands in. OPTIONAL. Use @ prefix for clarity (e.g., @src/, @/home/user/project). If omitted, uses current working directory. Relative paths are relative to cwd.'
    ),
  dryRun: z
    .boolean()
    .default(true)
    .describe(
      "Command execution mode. DEFAULT: true (safe). When true: Gemini explains commands WITHOUT executing. When false: commands execute in sandbox mode. Set to false only when you want actual execution with safety isolation."
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Gemini model to use. DEFAULT: 'gemini-3-flash-preview' (fast for command generation). Use 'gemini-3-pro-preview' for complex multi-step operations. Flash is usually sufficient for shell tasks."
    ),
});

export const shellTool: UnifiedTool = {
  name: 'shell',
  description:
    'Generate and optionally execute shell commands using Gemini. By default runs in dry-run mode (explains commands). Set dryRun=false to execute in sandbox.',
  zodSchema: shellArgsSchema,
  annotations: {
    title: 'Shell Commands',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description:
          'Shell task description. REQUIRED. Describe what you want to accomplish (e.g., "find TypeScript files modified last week", "compress log files"). Gemini will generate appropriate commands.',
      },
      workingDirectory: {
        type: 'string',
        description:
          'Directory to run commands in. OPTIONAL. Use @ prefix (e.g., @src/). If omitted, uses current working directory.',
      },
      dryRun: {
        type: 'boolean',
        default: true,
        description:
          'Command execution mode. DEFAULT: true (safe, explains without executing). When false: executes in sandbox. Set to false only for actual execution.',
      },
      model: {
        type: 'string',
        description:
          "Gemini model to use. DEFAULT: 'gemini-3-flash-preview' (fast). Use 'gemini-3-pro-preview' for complex operations.",
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
