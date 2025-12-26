# Gemini MCP Server Documentation

## Overview

MCP server for Google Gemini CLI integration with large file analysis, web search, multimodal analysis, shell commands, and brainstorming support.

## Quick Links

- [API Reference](api-reference.md) - Complete tool documentation
- [Gemini CLI Integration](gemini-cli-integration.md) - Version compatibility and features

## Available Tools

| Tool | Description | Annotations |
|------|-------------|-------------|
| `ask-gemini` | File analysis and questions using Gemini | `destructiveHint: false`, `openWorldHint: true` |
| `search` | Web search with Google grounding | `readOnlyHint: true`, `openWorldHint: true` |
| `analyze-media` | Multimodal analysis (images, PDFs) | `readOnlyHint: true`, `openWorldHint: true` |
| `shell` | Shell command generation/execution | `destructiveHint: true`, `openWorldHint: true` |
| `brainstorm` | Creative ideation | `readOnlyHint: true`, `openWorldHint: true` |
| `fetch-chunk` | Retrieve cached response chunks | `readOnlyHint: true`, `openWorldHint: false` |
| `ping` | Connection test | `readOnlyHint: true`, `openWorldHint: false` |
| `help` | Gemini CLI help | `readOnlyHint: true`, `openWorldHint: false` |

## Requirements

- **Gemini CLI v0.22.2+** - `npm install -g @google/gemini-cli`
- **Node.js v18+**
- **Claude Code** or compatible MCP client

## Installation

```bash
# Claude Code
claude mcp add gemini-cli -- npx -y @tuannvm/gemini-mcp-server
```

See the [README](https://github.com/tuannvm/gemini-mcp-server#readme) for complete installation options.
