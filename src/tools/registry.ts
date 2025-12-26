import { Tool, Prompt } from '@modelcontextprotocol/sdk/types.js';
import { ToolArguments } from '../constants.js';
import { ZodTypeAny, ZodError } from 'zod';

export interface UnifiedTool {
  name: string;
  description: string;
  zodSchema: ZodTypeAny;
  inputSchema: Tool['inputSchema'];

  prompt?: {
    description: string;
    arguments?: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  };

  execute: (
    args: ToolArguments,
    onProgress?: (newOutput: string) => void
  ) => Promise<string>;
  category?: 'simple' | 'gemini' | 'utility';
}

export const toolRegistry: UnifiedTool[] = [];

export function toolExists(toolName: string): boolean {
  return toolRegistry.some((t) => t.name === toolName);
}

export function getToolDefinitions(): Tool[] {
  return toolRegistry.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}

function extractPromptArguments(
  inputSchema: Tool['inputSchema']
): Array<{ name: string; description: string; required: boolean }> {
  const properties = (inputSchema.properties || {}) as Record<
    string,
    { description?: string }
  >;
  const required = (inputSchema.required || []) as string[];

  return Object.entries(properties).map(([name, prop]) => ({
    name,
    description: prop.description || `${name} parameter`,
    required: required.includes(name),
  }));
}

export function getPromptDefinitions(): Prompt[] {
  return toolRegistry
    .filter(
      (
        tool
      ): tool is UnifiedTool & { prompt: NonNullable<UnifiedTool['prompt']> } =>
        !!tool.prompt
    )
    .map((tool) => ({
      name: tool.name,
      description: tool.prompt.description,
      arguments:
        tool.prompt.arguments || extractPromptArguments(tool.inputSchema),
    }));
}

export async function executeTool(
  toolName: string,
  args: ToolArguments,
  onProgress?: (newOutput: string) => void
): Promise<string> {
  const tool = toolRegistry.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  try {
    const validatedArgs = tool.zodSchema.parse(args) as ToolArguments;
    return tool.execute(validatedArgs, onProgress);
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Invalid arguments for ${toolName}: ${issues}`);
    }
    throw error;
  }
}

export function getPromptMessage(
  toolName: string,
  args: Record<string, unknown>
): string {
  const tool = toolRegistry.find((t) => t.name === toolName);
  if (!tool?.prompt) {
    throw new Error(`No prompt defined for tool: ${toolName}`);
  }
  const paramStrings: string[] = [];

  if (args.prompt) {
    paramStrings.push(String(args.prompt));
  }

  Object.entries(args).forEach(([key, value]) => {
    if (
      key !== 'prompt' &&
      value !== undefined &&
      value !== null &&
      value !== false
    ) {
      if (typeof value === 'boolean' && value) {
        paramStrings.push(`[${key}]`);
      } else if (typeof value !== 'boolean') {
        paramStrings.push(`(${key}: ${value})`);
      }
    }
  });

  return `Use the ${toolName} tool${paramStrings.length > 0 ? ': ' + paramStrings.join(' ') : ''}`;
}
