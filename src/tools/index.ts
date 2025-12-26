// Tool Registry Index - Registers all tools
import { toolRegistry } from './registry.js';
import { askGeminiTool } from './ask-gemini.tool.js';
import { pingTool, helpTool } from './simple-tools.js';
import { brainstormTool } from './brainstorm.tool.js';
import { fetchChunkTool } from './fetch-chunk.tool.js';
import { timeoutTestTool } from './timeout-test.tool.js';
import { searchTool } from './search.tool.js';
import { analyzeMediaTool } from './analyze-media.tool.js';
import { shellTool } from './shell.tool.js';

toolRegistry.push(
  // Core Gemini tools
  askGeminiTool,
  searchTool,
  analyzeMediaTool,
  shellTool,
  brainstormTool,

  // Utility tools
  fetchChunkTool,
  pingTool,
  helpTool,

  // Testing tools
  timeoutTestTool
);

export * from './registry.js';
