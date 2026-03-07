---
active: true
iteration: 1
max_iterations: 15
completion_promise: "SIMPLIFIED_WEB_SEARCH_COMPLETE"
started_at: "2026-03-07T16:35:29Z"
---

Refactor the web-search-priority tool to stick closely with gemini CLI's web search capabilities instead of reinventing the wheel.

Current Issue:
The current implementation tries to implement complex search features (source priority, domain filtering, date ranges, result counts) that are NOT native to gemini CLI. Gemini CLI uses Google Search grounding through the model's natural language understanding - the model decides when and how to search based on the prompt.

Refactoring Requirements:
1. Simplify the tool to leverage gemini CLI's native web search capabilities
2. Remove artificial constraints like sourcePriority enum, domainWhitelist/Blacklist arrays, dateRange enum
3. Keep it simple like the existing web-search tool - just pass natural language prompts to gemini
4. Let users express their search requirements naturally in the query itself
5. Consider a simple 'searchContext' or 'instructions' parameter for additional guidance

The tool should:
- Use gemini CLI's Google Search grounding (built-in)
- Allow natural language search queries
- Support optional search instructions/context
- Keep the same model selection and quota fallback patterns
- Maintain security (input sanitization, validation)

Follow the existing patterns from search.tool.ts - simple, effective, leveraging the model's capabilities rather than trying to control them artificially.
