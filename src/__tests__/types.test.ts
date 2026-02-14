/**
 * Tests for type definitions
 */

import { TOOLS, MODELS } from '../types.js';
import { CLI } from '../constants.js';
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

  describe('CLI constants', () => {
    test('should define CLI flags', () => {
      expect(CLI.FLAGS.MODEL).toBe('-m');
      expect(CLI.FLAGS.SANDBOX).toBe('-s');
      expect(CLI.FLAGS.PROMPT).toBe('-p');
      expect(CLI.FLAGS.HELP).toBe('-help');
    });

    test('should define YOLO flag for Google Workspace extension', () => {
      expect(CLI.FLAGS.YOLO).toBe('--yolo');
    });

    test('should define CLI commands', () => {
      expect(CLI.COMMANDS.GEMINI).toBe('gemini');
      expect(CLI.COMMANDS.ECHO).toBe('echo');
    });
  });

  describe('ToolArguments interface', () => {
    test('should accept valid tool arguments', () => {
      const args: ToolArguments = {
        prompt: 'test prompt',
        model: 'gemini-3-pro-preview',
        sandbox: true,
        yolo: true,
      };

      expect(args.prompt).toBe('test prompt');
      expect(args.model).toBe('gemini-3-pro-preview');
      expect(args.sandbox).toBe(true);
      expect(args.yolo).toBe(true);
    });

    test('should accept optional arguments', () => {
      const args: ToolArguments = {
        prompt: 'test',
      };

      expect(args.prompt).toBe('test');
      expect(args.model).toBeUndefined();
      expect(args.sandbox).toBeUndefined();
      expect(args.yolo).toBeUndefined();
    });

    test('should accept yolo flag for Google Workspace extension', () => {
      const args: ToolArguments = {
        prompt: 'search my Google Drive',
        yolo: true,
      };

      expect(args.prompt).toBe('search my Google Drive');
      expect(args.yolo).toBe(true);
    });

    test('should accept yolo as string for edge cases', () => {
      const args: ToolArguments = {
        prompt: 'test',
        yolo: 'true',
      };

      expect(args.yolo).toBe('true');
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
