# API Reference

## Overview

Complete reference for the Gemini MCP Server tools and interfaces.

This server implements the **MCP 2025-11-25 specification**, including tool annotations and progress notifications.

## MCP Protocol Features

### Tool Annotations

All tools include annotations that provide hints to MCP clients about tool behavior:

| Annotation | Type | Description |
|------------|------|-------------|
| `title` | string | Human-readable tool name |
| `readOnlyHint` | boolean | Tool doesn't modify state |
| `destructiveHint` | boolean | Tool may modify files or external state |
| `idempotentHint` | boolean | Multiple calls produce same result |
| `openWorldHint` | boolean | Tool interacts with external services |

#### Tool Annotation Matrix

| Tool | `readOnlyHint` | `destructiveHint` | `idempotentHint` | `openWorldHint` |
|------|---------------|-------------------|------------------|-----------------|
| `ask-gemini` | `false` | `false` | `false` | `true` |
| `search` | `true` | `false` | `true` | `true` |
| `analyze-media` | `true` | `false` | `true` | `true` |
| `shell` | `false` | `true` | `false` | `true` |
| `brainstorm` | `true` | `false` | `false` | `true` |
| `fetch-chunk` | `true` | `false` | `true` | `false` |
| `ping` | `true` | `false` | `true` | `false` |
| `help` | `true` | `false` | `true` | `false` |

### Progress Notifications

For long-running operations, the server sends `notifications/progress` messages when the client includes a `progressToken` in the request `_meta`.

**Supported Tools:** `ask-gemini`, `search`, `analyze-media`, `shell`, `brainstorm`

---

## Tools

### `ask-gemini` - File Analysis & Questions

Analyze files and codebases using Gemini's large context window with the `@` syntax.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Your question or analysis request. Use `@` syntax for file references |
| `model` | string | No | `gemini-3-pro-preview` | Model to use |
| `sandbox` | boolean | No | `false` | Enable sandbox mode for safe execution |
| `changeMode` | boolean | No | `false` | Enable structured edit mode |

#### Model Options

- `gemini-3-pro-preview` (default) - Most capable, complex reasoning
- `gemini-3-flash-preview` - Fast responses, good quality
- `gemini-2.5-flash-lite` - Fastest, lightweight

#### Examples

**Basic Usage:**
```json
{
  "prompt": "Analyze @src/main.js and explain what it does"
}
```

**With Model Selection:**
```json
{
  "prompt": "Quickly summarize @package.json",
  "model": "gemini-3-flash-preview"
}
```

**Change Mode:**
```json
{
  "prompt": "Refactor @src/utils.ts for better error handling",
  "changeMode": true
}
```

---

### `search` - Web Search

Search the web using Gemini with Google Search grounding for real-time information.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query |
| `summarize` | boolean | No | `true` | Summarize results |
| `model` | string | No | `gemini-3-flash-preview` | Model to use |

#### Examples

**Basic Usage:**
```json
{
  "query": "latest React 19 features"
}
```

**Raw Results:**
```json
{
  "query": "kubernetes security best practices 2025",
  "summarize": false
}
```

---

### `analyze-media` - Multimodal Analysis

Analyze images, PDFs, screenshots, and diagrams using Gemini's multimodal capabilities.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePath` | string | Yes | - | Path to media file (use `@` syntax) |
| `prompt` | string | Yes | - | What to analyze or extract |
| `model` | string | No | `gemini-3-pro-preview` | Model to use |
| `detailed` | boolean | No | `false` | Provide detailed analysis |

#### Supported Formats

- Images: PNG, JPG, GIF, WebP
- Documents: PDF
- Screenshots: Any image format

#### Examples

**Basic Usage:**
```json
{
  "filePath": "@screenshot.png",
  "prompt": "describe this UI"
}
```

**Detailed Analysis:**
```json
{
  "filePath": "@architecture.pdf",
  "prompt": "explain the system design",
  "detailed": true
}
```

---

### `shell` - Shell Command Generation

Generate and optionally execute shell commands using Gemini.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `task` | string | Yes | - | Description of the shell task |
| `dryRun` | boolean | No | `true` | Explain commands without executing |
| `workingDirectory` | string | No | - | Working directory for execution |
| `model` | string | No | `gemini-3-flash-preview` | Model to use |

#### Examples

**Dry Run (default):**
```json
{
  "task": "find all TypeScript files larger than 100KB"
}
```

**Execute:**
```json
{
  "task": "run the test suite",
  "dryRun": false
}
```

---

### `brainstorm` - Creative Ideation

Generate ideas using various brainstorming methodologies.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | The brainstorming topic |
| `methodology` | string | No | `auto` | Framework to use |
| `domain` | string | No | - | Domain context for specialized ideas |
| `constraints` | string | No | - | Known limitations or requirements |
| `ideaCount` | number | No | - | Target number of ideas |
| `includeAnalysis` | boolean | No | `false` | Include feasibility analysis |

#### Methodology Options

- `auto` - Automatically select best methodology
- `divergent` - Generate many diverse ideas
- `convergent` - Focus and refine ideas
- `SCAMPER` - Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
- `design-thinking` - Empathize, Define, Ideate, Prototype, Test
- `lateral` - Lateral thinking techniques

#### Examples

**Basic Usage:**
```json
{
  "prompt": "ideas for improving user onboarding"
}
```

**With Methodology:**
```json
{
  "prompt": "improve the checkout flow",
  "methodology": "SCAMPER",
  "includeAnalysis": true
}
```

---

### `fetch-chunk` - Retrieve Cached Chunks

Retrieve cached chunks from large changeMode responses.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cacheKey` | string | Yes | - | Cache key from previous response |
| `chunkIndex` | number | Yes | - | Chunk index to retrieve (1-based) |

#### Notes

- Cache TTL: 10 minutes
- Used for retrieving large structured edit responses

---

### `ping` - Connection Test

Test if the MCP server is working properly.

#### Parameters

None.

#### Response

Returns server status and version information.

---

### `help` - Gemini CLI Help

Get information about Gemini CLI capabilities and commands.

#### Parameters

None.

#### Response

Returns Gemini CLI help output.

---

## Advanced Features

### Large File Handling

- Gemini's massive context window handles large files exceeding other models' limits
- Use `@` syntax: `@src/main.js`, `@.` (current directory)
- Automatic chunking for very large responses

### Change Mode (Structured Edits)

When `changeMode` is enabled:
- Responses formatted as structured edits
- Parses `**FILE: path:line**` format with `OLD/NEW` blocks
- Chunks large responses for manageable processing
- 10-minute cache TTL for chunk retrieval

### Model Fallback

- Automatic fallback from `gemini-3-pro-preview` to `gemini-3-flash-preview` on quota exceeded
- Transparent retry with status notification
