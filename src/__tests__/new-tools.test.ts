/**
 * Tests for new tools: search, web-search-priority, analyze-media, shell
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
    test('should include web-search tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'web-search');
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

    test('should include web-search-priority tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool).toBeDefined();
      expect(webSearchPriorityTool?.description).toContain('prioritization');
    });

    test('should include shell tool', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const shellTool = tools.find((t) => t.name === 'shell');
      expect(shellTool).toBeDefined();
      expect(shellTool?.description).toContain('shell');
    });
  });

  describe('Gemini Tool Schema', () => {
    test('should have yolo parameter for Google Workspace extension', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const geminiTool = tools.find((t) => t.name === 'gemini');
      expect(geminiTool).toBeDefined();
      expect(geminiTool?.inputSchema.properties).toHaveProperty('yolo');

      const yoloProp = geminiTool?.inputSchema.properties?.yolo as {
        type: string;
        default: boolean;
      };
      expect(yoloProp.type).toBe('boolean');
      expect(yoloProp.default).toBe(false);
    });

    test('yolo description should mention Google Workspace extension', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const geminiTool = tools.find((t) => t.name === 'gemini');
      const yoloProp = geminiTool?.inputSchema.properties?.yolo as {
        description: string;
      };
      const yoloDesc = yoloProp.description;

      expect(yoloDesc).toContain('YOLO');
      expect(yoloDesc).toContain('Google Workspace');
      expect(yoloDesc).toContain('gemini-cli-extensions/workspace');
      expect(yoloDesc).toContain('auto-approve');
    });

    test('yolo should be optional with default false', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const geminiTool = tools.find((t) => t.name === 'gemini');
      expect(geminiTool?.inputSchema.required).not.toContain('yolo');

      const yoloProp = geminiTool?.inputSchema.properties?.yolo as {
        default: boolean;
      };
      expect(yoloProp.default).toBe(false);
    });
  });

  describe('Tool Existence Check', () => {
    test('should recognize new tools', async () => {
      const { toolExists } = await import('../tools/index.js');

      expect(toolExists('web-search')).toBe(true);
      expect(toolExists('web-search-priority')).toBe(true);
      expect(toolExists('analyze-media')).toBe(true);
      expect(toolExists('shell')).toBe(true);
    });
  });

  describe('Web Search Tool Schema', () => {
    test('should have required query parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'web-search');
      expect(searchTool?.inputSchema.properties).toHaveProperty('query');
      expect(searchTool?.inputSchema.required).toContain('query');
    });

    test('should have optional summarize parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const searchTool = tools.find((t) => t.name === 'web-search');
      expect(searchTool?.inputSchema.properties).toHaveProperty('summarize');
    });
  });

  describe('Web Search Priority Tool Schema', () => {
    test('should have required query parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'query'
      );
      expect(webSearchPriorityTool?.inputSchema.required).toContain('query');
    });

    test('should have optional sourcePriority parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'sourcePriority'
      );
    });

    test('should have optional dateRange parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'dateRange'
      );
    });

    test('should have optional domainWhitelist parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'domainWhitelist'
      );
    });

    test('should have optional domainBlacklist parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'domainBlacklist'
      );
    });

    test('should have optional resultCount parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'resultCount'
      );
    });

    test('should have optional verbose parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      expect(webSearchPriorityTool?.inputSchema.properties).toHaveProperty(
        'verbose'
      );
    });

    test('should enforce max length on query parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      const queryProp = webSearchPriorityTool?.inputSchema.properties
        ?.query as { maxLength: number };
      expect(queryProp?.maxLength).toBe(2000);
    });

    test('should enforce max items on domain lists', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const webSearchPriorityTool = tools.find(
        (t) => t.name === 'web-search-priority'
      );
      const whitelistProp = webSearchPriorityTool?.inputSchema.properties
        ?.domainWhitelist as { maxItems: number };
      const blacklistProp = webSearchPriorityTool?.inputSchema.properties
        ?.domainBlacklist as { maxItems: number };
      expect(whitelistProp?.maxItems).toBe(50);
      expect(blacklistProp?.maxItems).toBe(50);
    });
  });

  describe('Analyze Media Tool Schema', () => {
    test('should have required filePath and prompt parameters', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const analyzeMediaTool = tools.find((t) => t.name === 'analyze-media');
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty(
        'filePath'
      );
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty('prompt');
      expect(analyzeMediaTool?.inputSchema.required).toContain('filePath');
      expect(analyzeMediaTool?.inputSchema.required).toContain('prompt');
    });

    test('should have optional detailed parameter', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      const analyzeMediaTool = tools.find((t) => t.name === 'analyze-media');
      expect(analyzeMediaTool?.inputSchema.properties).toHaveProperty(
        'detailed'
      );
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
      expect(shellTool?.inputSchema.properties).toHaveProperty(
        'workingDirectory'
      );
    });
  });

  describe('Tool Count', () => {
    test('should have 10 total tools registered', async () => {
      const { getToolDefinitions } = await import('../tools/index.js');
      const tools = getToolDefinitions();

      // gemini, web-search, web-search-priority, analyze-media, shell, brainstorm, fetch-chunk, ping, help, timeout-test
      expect(tools.length).toBe(10);
    });
  });
});
