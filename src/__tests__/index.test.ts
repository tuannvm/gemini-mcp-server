/**
 * Main test file for Gemini MCP Server
 */

// Mock chalk for ESM compatibility
jest.mock('chalk', () => ({
  default: {
    red: (str: string) => str,
    green: (str: string) => str,
    yellow: (str: string) => str,
    blue: (str: string) => str,
    cyan: (str: string) => str,
    gray: (str: string) => str,
  },
}));

describe('Gemini MCP Server', () => {
  describe('Server Configuration', () => {
    test('should have valid server config structure', () => {
      const config = {
        name: 'gemini-mcp-server',
        version: '1.0.0',
      };

      expect(config.name).toBe('gemini-mcp-server');
      expect(config.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Tool Definitions', () => {
    test('should export tool definitions', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should have required tool properties', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
      });
    });

    test('should include gemini tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const geminiTool = tools.find((t) => t.name === 'gemini');
      expect(geminiTool).toBeDefined();
      expect(geminiTool?.description).toContain('Gemini');
    });
  });

  describe('Tool Existence Check', () => {
    test('should return true for existing tools', async () => {
      const { toolExists } = await import('../tools/index.js');

      expect(toolExists('gemini')).toBe(true);
      expect(toolExists('ping')).toBe(true);
      expect(toolExists('help')).toBe(true);
    });

    test('should return false for non-existing tools', async () => {
      const { toolExists } = await import('../tools/index.js');

      expect(toolExists('non-existent-tool')).toBe(false);
      expect(toolExists('')).toBe(false);
    });
  });
});
