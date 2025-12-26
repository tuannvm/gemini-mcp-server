#!/usr/bin/env node

/**
 * Gemini MCP Server - Entry Point
 *
 * MCP server for Gemini CLI integration
 */

import chalk from 'chalk';
import { GeminiMcpServer } from './server.js';

const SERVER_CONFIG = {
  name: 'gemini-mcp-server',
  version: '1.1.4',
};

async function main(): Promise<void> {
  try {
    const server = new GeminiMcpServer(SERVER_CONFIG);
    await server.start();
  } catch (error) {
    console.error(chalk.red('Failed to start server:'), error);
    process.exit(1);
  }
}

main();
