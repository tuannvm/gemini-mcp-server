# Gemini MCP Server Documentation

MCP server for Google Gemini CLI integration—analyze large codebases, search the web, process images, and brainstorm ideas.

## Getting Started

### Requirements

- **Gemini CLI v0.22.2+**: `npm install -g @google/gemini-cli`
- **Node.js v18+**
- **Claude Code** or compatible MCP client

### Installation

```bash
claude mcp add gemini-cli -- npx -y @tuannvm/gemini-mcp-server
```

See the [README](https://github.com/tuannvm/gemini-mcp-server#readme) for more installation options.

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](api-reference.md) | Complete tool documentation with parameters and examples |
| [Gemini CLI Integration](gemini-cli-integration.md) | Authentication, model configuration, and troubleshooting |

## Available Tools

| Tool | Description | Behavior |
|------|-------------|----------|
| `gemini` | File analysis and questions | May modify files (sandbox mode) |
| `web-search` | Web search with Google grounding | Read-only |
| `analyze-media` | Multimodal analysis (images, PDFs) | Read-only |
| `shell` | Shell command generation/execution | May execute commands |
| `brainstorm` | Creative ideation | Read-only |
| `fetch-chunk` | Retrieve cached response chunks | Read-only, idempotent |
| `ping` | Connection test | Read-only, idempotent |
| `help` | Gemini CLI help | Read-only, idempotent |

## Quick Examples

```
# Analyze entire codebase
Use gemini to analyze @. and explain the architecture

# Web search
Use web-search to find the latest Kubernetes security best practices

# Image analysis
Use analyze-media with filePath "@diagram.png" and prompt "explain this architecture"

# Brainstorming
Use brainstorm with methodology "SCAMPER" to improve the user dashboard
```

## Key Features

- **Large Context Window**: Analyze files that exceed other models' limits
- **@ Syntax**: Reference files directly (`@src/main.js`, `@.` for current directory)
- **Model Fallback**: Auto-fallback to Flash model when quota exceeded
- **Change Mode**: Structured edits for code refactoring
- **Progress Notifications**: Real-time updates for long operations
