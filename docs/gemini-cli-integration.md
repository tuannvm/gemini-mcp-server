# Gemini CLI Integration Guide

## Overview

This document outlines the integration with Google Gemini CLI, including version requirements, authentication, and feature implementation.

## Version Compatibility

### Recommended Version: v0.22.2+

This MCP server is optimized for **Gemini CLI v0.22.2 or later**.

**Check your version:**
```bash
gemini --version
```

**Upgrade if needed:**
```bash
npm update -g @google/gemini-cli
```

## Authentication

### Method 1: Google Account (Recommended)

```bash
gemini
# Follow prompts to login with Google account
```

**Free tier limits:**
- 60 requests/minute
- 1000 requests/day

### Method 2: API Key

```bash
export GEMINI_API_KEY="your-api-key"
```

Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Model Configuration

### Setting Default Model

**1. Environment Variable (Recommended):**
```bash
export GEMINI_MODEL="gemini-3-pro-preview"
```

**2. Settings File:**
```bash
mkdir -p ~/.gemini
echo '{"model": {"name": "gemini-3-pro-preview"}}' > ~/.gemini/settings.json
```

**3. Project Settings:**
```bash
echo '{"model": {"name": "gemini-3-pro-preview"}}' > .gemini/settings.json
```

### Configuration Precedence

Settings applied in order (highest priority last):
1. Default values
2. User settings (`~/.gemini/settings.json`)
3. Project settings (`.gemini/settings.json`)
4. Environment variables (`GEMINI_MODEL`)
5. Command-line arguments (`-m`)
6. MCP tool `model` parameter

### Available Models

| Model | ID | Best For |
|-------|-----|----------|
| **Gemini 3 Pro** | `gemini-3-pro-preview` | Most capable, complex reasoning |
| **Gemini 3 Flash** | `gemini-3-flash-preview` | Fast responses, good quality |
| Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Fastest, lightweight |

## Features Implementation

### File Analysis with @ Syntax

The MCP server passes file references directly to Gemini CLI:

```bash
# MCP tool call
{ "prompt": "Analyze @src/main.js" }

# Translates to
gemini "Analyze @src/main.js"
```

**Supported patterns:**
- `@file.js` - Single file
- `@src/*.ts` - Glob pattern
- `@.` - Current directory

### Sandbox Mode

When `sandbox: true` is passed to `ask-gemini`:

```bash
gemini --sandbox "your prompt"
```

Enables safe code execution in isolated environment.

### Change Mode

When `changeMode: true` is passed:

```bash
gemini --change-mode "your prompt"
```

Returns structured edits in `**FILE: path:line**` format with `OLD/NEW` blocks.

### Web Search Grounding

The `search` tool uses Gemini's built-in Google Search grounding:

```bash
gemini --search "your query"
```

Returns real-time information with source attribution.

### Multimodal Analysis

The `analyze-media` tool handles various file types:

```bash
gemini "Analyze this image" < image.png
```

Supports images, PDFs, and other media formats.

## Error Handling

### Model Fallback

When quota is exceeded on `gemini-3-pro-preview`:
1. Server detects quota error
2. Automatically retries with `gemini-3-flash-preview`
3. Returns result with fallback notification

### Timeout Handling

For long-running operations:
1. Server sends progress notifications
2. Keeps connection alive during processing
3. Returns result when complete

## Troubleshooting

### "Command not found: gemini"

```bash
npm install -g @google/gemini-cli
```

### "Not authenticated"

```bash
gemini  # Login with Google
# OR
export GEMINI_API_KEY="your-key"
```

### "Quota exceeded"

- Wait for quota reset (typically 1 minute)
- Or use `gemini-3-flash-preview` model
- Or upgrade to paid API tier

### "File not found" with @ syntax

- Use absolute paths when possible
- Verify file exists: `ls -la path/to/file`
- Check working directory

## CLI Flags Reference

| Flag | Description | MCP Parameter |
|------|-------------|---------------|
| `-m <model>` | Select model | `model` |
| `--sandbox` | Enable sandbox mode | `sandbox` |
| `--change-mode` | Structured edit output | `changeMode` |
| `--search` | Enable web search | (used by `search` tool) |

## Links

- [Gemini CLI Repository](https://github.com/google-gemini/gemini-cli)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
