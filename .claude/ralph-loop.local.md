---
active: true
iteration: 1
max_iterations: 15
completion_promise: "SEARCH_UNIFICATION_COMPLETE"
started_at: "2026-03-07T16:46:00Z"
---

Remove the web-search-priority tool and merge any enhancements into the original web-search tool.

Context:
Having two separate web search tools is redundant. The original web-search tool is simpler and well-established. Any enhancements from web-search-priority should be merged into web-search instead.

Requirements:
1. Delete webSearchPriority.tool.ts completely
2. Remove web-search-priority from tools/index.ts registry
3. Remove WEB_SEARCH_PRIORITY from types.ts TOOLS constant
4. Remove all web-search-priority tests from __tests__/new-tools.test.ts
5. Update test count from 10 tools back to 9
6. Consider if the original web-search tool needs the searchContext parameter for additional flexibility
7. Update README.md to remove web-search-priority references
8. Update docs/api-reference.md to remove web-search-priority section
9. Run all tests to ensure nothing is broken
10. Verify the implementation is clean and consistent

The goal is to have a single, clean web-search tool that leverages gemini CLI's native capabilities without redundancy.
