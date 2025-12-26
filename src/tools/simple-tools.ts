import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeCommand } from '../utils/commandExecutor.js';

const pingArgsSchema = z.object({
  prompt: z.string().default('').describe('Message to echo '),
});

export const pingTool: UnifiedTool = {
  name: 'ping',
  description: 'Test connectivity by echoing a message back.',
  zodSchema: pingArgsSchema,
  annotations: {
    title: 'Ping Server',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        default: '',
        description: 'Message to echo',
      },
    },
    required: [],
  },
  prompt: {
    description: 'Echo a test message to verify connectivity.',
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    const message = args.prompt || args.message || 'Pong!';
    return executeCommand('echo', [message as string], onProgress);
  },
};

const helpArgsSchema = z.object({});

export const helpTool: UnifiedTool = {
  name: 'help',
  description: 'Display Gemini CLI help and available options.',
  zodSchema: helpArgsSchema,
  annotations: {
    title: 'Get Help',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  prompt: {
    description: 'Display Gemini CLI help information.',
  },
  category: 'simple',
  execute: async (_args, onProgress) => {
    return executeCommand('gemini', ['-help'], onProgress);
  },
};
