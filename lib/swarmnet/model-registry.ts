// lib/swarmnet/model-registry.ts
// Tier × phase → model ID mapping + cost metadata

export type AgentTier = 'lite' | 'fast' | 'standard' | 'elite';
export type AgentPhase = 'plan' | 'generate' | 'validate' | 'fix';

export interface ModelMeta {
  id: string;
  maxTokens: number;
  temperature: number;
  costPer1kTokens: number; // approximate USD
  speedLabel: string;
  description: string;
}

const REGISTRY: Record<AgentTier, Record<AgentPhase, ModelMeta>> = {
  lite: {
    plan: {
      id: 'mixtral-8x7b-32768',
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kTokens: 0.00024,
      speedLabel: 'Fast',
      description: 'Mixtral 8x7B — fastest, cheapest planning',
    },
    generate: {
      id: 'llama-3.1-8b-instant',
      maxTokens: 8000,
      temperature: 0.3,
      costPer1kTokens: 0.00005,
      speedLabel: 'Fast',
      description: 'Llama 3.1 8B — lightweight code generation',
    },
    validate: {
      id: 'llama-3.1-8b-instant',
      maxTokens: 2000,
      temperature: 0.1,
      costPer1kTokens: 0.00005,
      speedLabel: 'Fast',
      description: 'Llama 3.1 8B — quick syntax check',
    },
    fix: {
      id: 'llama-3.1-8b-instant',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0.00005,
      speedLabel: 'Fast',
      description: 'Llama 3.1 8B — lightweight error fixes',
    },
  },
  fast: {
    plan: {
      id: 'llama-3.1-8b-instant',
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kTokens: 0.00005,
      speedLabel: 'Very Fast',
      description: 'Llama 3.1 8B — rapid planning',
    },
    generate: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 8000,
      temperature: 0.3,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — solid code quality',
    },
    validate: {
      id: 'llama-3.1-8b-instant',
      maxTokens: 2000,
      temperature: 0.1,
      costPer1kTokens: 0.00005,
      speedLabel: 'Very Fast',
      description: 'Llama 3.1 8B — fast validation',
    },
    fix: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — reliable fixes',
    },
  },
  standard: {
    plan: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — default planning',
    },
    generate: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 8000,
      temperature: 0.3,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — default generation',
    },
    validate: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 2000,
      temperature: 0.1,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — thorough validation',
    },
    fix: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — default fixes',
    },
  },
  elite: {
    plan: {
      id: 'llama-3.3-70b-versatile',
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kTokens: 0.00059,
      speedLabel: 'Balanced',
      description: 'Llama 3.3 70B — deep planning',
    },
    generate: {
      id: 'mixtral-8x22b-3840',
      maxTokens: 8000,
      temperature: 0.3,
      costPer1kTokens: 0.0009,
      speedLabel: 'Powerful',
      description: 'Mixtral 8x22B — highest quality code',
    },
    validate: {
      id: 'deepseek-r1-distill-llama-70b',
      maxTokens: 2000,
      temperature: 0.1,
      costPer1kTokens: 0.0007,
      speedLabel: 'Reasoning',
      description: 'DeepSeek R1 — step-by-step reasoning for bugs',
    },
    fix: {
      id: 'mixtral-8x22b-3840',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0.0009,
      speedLabel: 'Powerful',
      description: 'Mixtral 8x22B — best-in-class fixes',
    },
  },
};

/**
 * Look up the model configuration for a given tier and phase.
 * Falls back to 'standard' tier if the requested tier is invalid.
 */
export function getModelForPhase(tier: AgentTier | string, phase: AgentPhase): ModelMeta {
  const t = (REGISTRY[tier as AgentTier] ? tier : 'standard') as AgentTier;
  return REGISTRY[t][phase];
}

/**
 * Get all available tiers with metadata for UI rendering.
 */
export function getTierOptions(): {
  value: AgentTier;
  label: string;
  description: string;
  badge: string;
}[] {
  return [
    {
      value: 'lite',
      label: 'Lite',
      description: 'Fastest & cheapest. Good for simple, well-defined tasks.',
      badge: 'Budget',
    },
    {
      value: 'fast',
      label: 'Fast',
      description: 'Speed-optimized. Smaller models for plan/validate, 70B for code.',
      badge: 'Balanced',
    },
    {
      value: 'standard',
      label: 'Standard',
      description: 'Llama 70B across all phases. The default reliable choice.',
      badge: 'Default',
    },
    {
      value: 'elite',
      label: 'Elite',
      description: 'Mixtral 8x22B + DeepSeek R1. Maximum quality, higher cost.',
      badge: 'Premium',
    },
  ];
}

/**
 * Estimate cost for a full build run based on token usage heuristics.
 */
export function estimateBuildCost(
  tier: AgentTier,
  estimatedTokens: number = 5000
): { low: number; high: number } {
  // Average cost per 1k tokens across all phases for the tier
  const tierCosts = Object.values(REGISTRY[tier]).map((m) => m.costPer1kTokens);
  const avgCost = tierCosts.reduce((a, b) => a + b, 0) / tierCosts.length;
  return {
    low: +(avgCost * estimatedTokens * 0.001 * 0.7).toFixed(4),
    high: +(avgCost * estimatedTokens * 0.001 * 1.3).toFixed(4),
  };
}

/** Valid tiers for runtime validation */
export const VALID_TIERS: AgentTier[] = ['lite', 'fast', 'standard', 'elite'];

/** Default tier for new projects */
export const DEFAULT_TIER: AgentTier = 'standard';
