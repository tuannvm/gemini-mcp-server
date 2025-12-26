/**
 * Tests for type definitions
 */

import { TOOLS, MODELS } from '../types.js';
import type { ToolArguments, ServerConfig } from '../types.js';

describe('Type Definitions', () => {
  describe('TOOLS constant', () => {
    test('should define tool names', () => {
      expect(TOOLS.GEMINI).toBe('gemini');
      expect(TOOLS.PING).toBe('ping');
      expect(TOOLS.HELP).toBe('help');
      expect(TOOLS.BRAINSTORM).toBe('brainstorm');
      expect(TOOLS.FETCH_CHUNK).toBe('fetch-chunk');
    });
  });

  describe('MODELS constant', () => {
    test('should define model names', () => {
      expect(MODELS.PRO).toBe('gemini-3-pro-preview');
      expect(MODELS.FLASH).toBe('gemini-3-flash-preview');
    });
  });

  describe('ToolArguments interface', () => {
    test('should accept valid tool arguments', () => {
      const args: ToolArguments = {
        prompt: 'test prompt',
        model: 'gemini-3-pro-preview',
        sandbox: true,
      };

      expect(args.prompt).toBe('test prompt');
      expect(args.model).toBe('gemini-3-pro-preview');
      expect(args.sandbox).toBe(true);
    });

    test('should accept optional arguments', () => {
      const args: ToolArguments = {
        prompt: 'test',
      };

      expect(args.prompt).toBe('test');
      expect(args.model).toBeUndefined();
      expect(args.sandbox).toBeUndefined();
    });

    test('should accept brainstorm arguments', () => {
      const args: ToolArguments = {
        prompt: 'brainstorm ideas',
        methodology: 'divergent',
        domain: 'software',
        ideaCount: 5,
        includeAnalysis: true,
      };

      expect(args.methodology).toBe('divergent');
      expect(args.domain).toBe('software');
      expect(args.ideaCount).toBe(5);
      expect(args.includeAnalysis).toBe(true);
    });
  });

  describe('ServerConfig interface', () => {
    test('should accept valid server config', () => {
      const config: ServerConfig = {
        name: 'test-server',
        version: '1.0.0',
      };

      expect(config.name).toBe('test-server');
      expect(config.version).toBe('1.0.0');
    });
  });
});
