import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';
import { executeGeminiCLI } from '../utils/geminiExecutor.js';

function buildBrainstormPrompt(config: {
  prompt: string;
  methodology: string;
  domain?: string;
  constraints?: string;
  existingContext?: string;
  ideaCount: number;
  includeAnalysis: boolean;
}): string {
  const {
    prompt,
    methodology,
    domain,
    constraints,
    existingContext,
    ideaCount,
    includeAnalysis,
  } = config;

  // Select methodology framework
  let frameworkInstructions = getMethodologyInstructions(methodology, domain);

  let enhancedPrompt = `# BRAINSTORMING SESSION

## Core Challenge
${prompt}

## Methodology Framework
${frameworkInstructions}

## Context Engineering
*Use the following context to inform your reasoning:*
${domain ? `**Domain Focus:** ${domain} - Apply domain-specific knowledge, terminology, and best practices.` : ''}
${constraints ? `**Constraints & Boundaries:** ${constraints}` : ''}
${existingContext ? `**Background Context:** ${existingContext}` : ''}

## Output Requirements
- Generate ${ideaCount} distinct, creative ideas
- Each idea should be unique and non-obvious
- Focus on actionable, implementable concepts
- Use clear, descriptive naming
- Provide brief explanations for each idea

${
  includeAnalysis
    ? `
## Analysis Framework
For each idea, provide:
- **Feasibility:** Implementation difficulty (1-5 scale)
- **Impact:** Potential value/benefit (1-5 scale)
- **Innovation:** Uniqueness/creativity (1-5 scale)
- **Quick Assessment:** One-sentence evaluation
`
    : ''
}

## Format
Present ideas in a structured format:

### Idea [N]: [Creative Name]
**Description:** [2-3 sentence explanation]
${includeAnalysis ? '**Feasibility:** [1-5] | **Impact:** [1-5] | **Innovation:** [1-5]\n**Assessment:** [Brief evaluation]' : ''}

---

**Before finalizing, review the list: remove near-duplicates and ensure each idea satisfies the constraints.**

Begin brainstorming session:`;

  return enhancedPrompt;
}

/**
 * Returns methodology-specific instructions for structured brainstorming
 */
function getMethodologyInstructions(
  methodology: string,
  domain?: string
): string {
  const methodologies: Record<string, string> = {
    divergent: `**Divergent Thinking Approach:**
- Generate maximum quantity of ideas without self-censoring
- Build on wild or seemingly impractical ideas
- Combine unrelated concepts for unexpected solutions
- Use "Yes, and..." thinking to expand each concept
- Postpone evaluation until all ideas are generated`,

    convergent: `**Convergent Thinking Approach:**
- Focus on refining and improving existing concepts
- Synthesize related ideas into stronger solutions
- Apply critical evaluation criteria
- Prioritize based on feasibility and impact
- Develop implementation pathways for top ideas`,

    scamper: `**SCAMPER Creative Triggers:**
- **Substitute:** What can be substituted or replaced?
- **Combine:** What can be combined or merged?
- **Adapt:** What can be adapted from other domains?
- **Modify:** What can be magnified, minimized, or altered?
- **Put to other use:** How else can this be used?
- **Eliminate:** What can be removed or simplified?
- **Reverse:** What can be rearranged or reversed?`,

    'design-thinking': `**Human-Centered Design Thinking:**
- **Empathize:** Consider user needs, pain points, and contexts
- **Define:** Frame problems from user perspective
- **Ideate:** Generate user-focused solutions
- **Consider Journey:** Think through complete user experience
- **Prototype Mindset:** Focus on testable, iterative concepts`,

    lateral: `**Lateral Thinking Approach:**
- Make unexpected connections between unrelated fields
- Challenge fundamental assumptions
- Use random word association to trigger new directions
- Apply metaphors and analogies from other domains
- Reverse conventional thinking patterns`,

    auto: `**AI-Optimized Approach:**
${domain ? `Given the ${domain} domain, I'll apply the most effective combination of:` : "I'll intelligently combine multiple methodologies:"}
- Divergent exploration with domain-specific knowledge
- SCAMPER triggers and lateral thinking
- Human-centered perspective for practical value`,
  };

  return methodologies[methodology] || methodologies['auto'];
}

const brainstormArgsSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe(
      'The brainstorming challenge or question. REQUIRED. Be specific about what you need ideas for (e.g., "ways to reduce API latency", "features for a fitness app", "marketing strategies for B2B SaaS"). More context yields better ideas.'
    ),
  model: z
    .string()
    .optional()
    .describe(
      "Gemini model to use. OPTIONS: 'gemini-3-pro-preview' (default, best for creative thinking), 'gemini-3-flash-preview' (faster). Use Pro for complex brainstorming requiring deep domain knowledge. Omit for default."
    ),
  methodology: z
    .enum([
      'divergent',
      'convergent',
      'scamper',
      'design-thinking',
      'lateral',
      'auto',
    ])
    .default('auto')
    .describe(
      "Brainstorming framework. OPTIONS: 'auto' (default, AI selects best approach), 'divergent' (maximize quantity of ideas), 'convergent' (refine and prioritize existing ideas), 'scamper' (systematic creative triggers: Substitute/Combine/Adapt/Modify/Put to other use/Eliminate/Reverse), 'design-thinking' (human-centered, user-focused solutions), 'lateral' (unexpected connections, challenge assumptions). Use 'auto' unless you have a specific methodology preference."
    ),
  domain: z
    .string()
    .optional()
    .describe(
      "Domain expertise to apply. EXAMPLES: 'software', 'business', 'marketing', 'product', 'research', 'healthcare', 'finance', 'education'. Helps Gemini apply domain-specific knowledge, terminology, and best practices. Include for specialized output."
    ),
  constraints: z
    .string()
    .optional()
    .describe(
      "Limitations and requirements to respect. EXAMPLES: 'budget under $10k', 'must work offline', 'no external APIs', 'launch in 2 weeks'. Helps filter ideas to only feasible options. Include any hard requirements."
    ),
  existingContext: z
    .string()
    .optional()
    .describe(
      "Background information to build upon. EXAMPLES: 'we tried X but it failed because Y', 'current solution uses React', 'team has 3 engineers'. Provides context for more relevant, actionable ideas."
    ),
  ideaCount: z
    .number()
    .int()
    .positive()
    .default(12)
    .describe(
      'Number of ideas to generate. DEFAULT: 12. Use higher numbers (15-20) for divergent exploration, lower numbers (5-8) for focused, detailed ideas.'
    ),
  includeAnalysis: z
    .boolean()
    .default(true)
    .describe(
      'Include feasibility/impact/innovation ratings for each idea. DEFAULT: true. Set to false for faster, simpler output without analysis. Ratings use 1-5 scale.'
    ),
});

export const brainstormTool: UnifiedTool = {
  name: 'brainstorm',
  description:
    'Generate creative ideas using structured frameworks (SCAMPER, Design Thinking, etc.) with domain context, feasibility analysis, and iterative refinement.',
  zodSchema: brainstormArgsSchema,
  annotations: {
    title: 'Brainstorm Ideas',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'The brainstorming challenge or question. REQUIRED. Be specific about what you need ideas for (e.g., "ways to reduce API latency", "features for a fitness app", "marketing strategies for B2B SaaS"). More context yields better ideas.',
      },
      model: {
        type: 'string',
        description:
          "Gemini model to use. OPTIONS: 'gemini-3-pro-preview' (default, best for creative thinking), 'gemini-3-flash-preview' (faster). Use Pro for complex brainstorming requiring deep domain knowledge. Omit for default.",
      },
      methodology: {
        type: 'string',
        enum: [
          'divergent',
          'convergent',
          'scamper',
          'design-thinking',
          'lateral',
          'auto',
        ],
        default: 'auto',
        description:
          "Brainstorming framework. OPTIONS: 'auto' (default, AI selects best approach), 'divergent' (maximize quantity of ideas), 'convergent' (refine and prioritize existing ideas), 'scamper' (systematic creative triggers), 'design-thinking' (human-centered solutions), 'lateral' (unexpected connections). Use 'auto' unless you have a specific preference.",
      },
      domain: {
        type: 'string',
        description:
          "Domain expertise to apply. EXAMPLES: 'software', 'business', 'marketing', 'product', 'research', 'healthcare', 'finance'. Helps Gemini apply domain-specific knowledge. Include for specialized output.",
      },
      constraints: {
        type: 'string',
        description:
          "Limitations and requirements to respect. EXAMPLES: 'budget under $10k', 'must work offline', 'launch in 2 weeks'. Helps filter ideas to only feasible options.",
      },
      existingContext: {
        type: 'string',
        description:
          "Background information to build upon. EXAMPLES: 'we tried X but failed because Y', 'current solution uses React'. Provides context for more relevant ideas.",
      },
      ideaCount: {
        type: 'integer',
        default: 12,
        description:
          'Number of ideas to generate. DEFAULT: 12. Use higher (15-20) for exploration, lower (5-8) for focused detailed ideas.',
      },
      includeAnalysis: {
        type: 'boolean',
        default: true,
        description:
          'Include feasibility/impact/innovation ratings for each idea. DEFAULT: true. Set to false for faster output without analysis.',
      },
    },
    required: ['prompt'],
  },
  prompt: {
    description:
      'Generate creative ideas using structured brainstorming methodologies.',
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const {
      prompt,
      model,
      methodology = 'auto',
      domain,
      constraints,
      existingContext,
      ideaCount = 12,
      includeAnalysis = true,
    } = args;

    if (!prompt?.trim()) {
      throw new Error(
        'You must provide a valid brainstorming challenge or question to explore'
      );
    }

    let enhancedPrompt = buildBrainstormPrompt({
      prompt: prompt.trim() as string,
      methodology: methodology as string,
      domain: domain as string | undefined,
      constraints: constraints as string | undefined,
      existingContext: existingContext as string | undefined,
      ideaCount: ideaCount as number,
      includeAnalysis: includeAnalysis as boolean,
    });

    Logger.debug(
      `Brainstorm: Using methodology '${methodology}' for domain '${domain || 'general'}'`
    );

    // Report progress to user
    onProgress?.(
      `Generating ${ideaCount} ideas via ${methodology} methodology...`
    );

    // Execute with Gemini (yolo not typically needed for brainstorming)
    return await executeGeminiCLI(
      enhancedPrompt,
      model as string | undefined,
      false, // sandbox
      false, // yolo
      false, // changeMode
      onProgress
    );
  },
};
