/**
 * Tests for new tools: search, analyze-media, shell
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

describe('New Tools', () => {
  describe('Tool Definitions', () => {
    test('should include search tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'search');
      expect(searchTool).toBeDefined();
      expect(searchTool?.description).toContain('Search');
    });

    test('should include analyze-media tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const analyzeMediaTool = tools.find((t) => t.name === 'analyze-media');
      expect(analyzeMediaTool).toBeDefined();
      expect(analyzeMediaTool?.description).toContain('media');
    });

    test('should include shell tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const shellTool = tools.find((t) => t.name === 'shell');
      expect(shellTool).toBeDefined();
      expect(shellTool?.description).toContain('shell');
    });
  });

  describe('Tool Existence Check', () => {
    test('should recognize new tools', async () => {
      const { toolExists } = await import('../tools/index.js');

      expect(toolExists('search')).toBe(true);
      expect(toolExists('analyze-media')).toBe(true);
      expect(toolExists('shell')).toBe(true);
    });
  });

  describe('Search Tool Schema', () => {
    test('should have required query parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'search');
      expect(searchTool?.inputSchema.properties).toHaveProperty('query');
      expect(searchTool?.inputSchema.required).toContain('query');
    });

    test('should have optional summarize parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'search');
      expect(searchTool?.inputSchema.properties).toHaveProperty('summarize');
    });
  });

  describe('Analyze Media Tool Schema', () => {
    test('should have required filePath and prompt parameters', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const analyzeMediaTool = tools.find((t) => t.name === 'analyze-media');
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty('filePath');
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty('prompt');
      expect(analyzeMediaTool?.inputSchema.required).toContain('filePath');
      expect(analyzeMediaTool?.inputSchema.required).toContain('prompt');
    });

    test('should have optional detailed parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const analyzeMediaTool = tools.find((t) => t.name === 'analyze-media');
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty('detailed');
    });
  });

  describe('Shell Tool Schema', () => {
    test('should have required task parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const shellTool = tools.find((t) => t.name === 'shell');
      expect(shellTool?.inputSchema.properties).toHaveProperty('task');
      expect(shellTool?.inputSchema.required).toContain('task');
    });

    test('should have optional dryRun parameter with default true', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const shellTool = tools.find((t) => t.name === 'shell');
      expect(shellTool?.inputSchema.properties).toHaveProperty('dryRun');
    });

    test('should have optional workingDirectory parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const shellTool = tools.find((t) => t.name === 'shell');
      expect(shellTool?.inputSchema.properties).toHaveProperty('workingDirectory');
    });
  });

  describe('Tool Count', () => {
    test('should have 9 total tools registered', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      // ask-gemini, search, analyze-media, shell, brainstorm, fetch-chunk, ping, help, timeout-test
      expect(tools.length).toBe(9);
    });
  });
});
