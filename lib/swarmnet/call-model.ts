// lib/swarmnet/call-model.ts
// Unified model calling layer with tool calling, retry, and graceful fallback

import {
  getModelForPhase,
  type AgentTier,
  type AgentPhase,
  type ModelMeta,
} from './model-registry';

export interface ModelCallResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  modelUsed: string;
  attempts: number;
  tokensUsed?: { prompt: number; completion: number };
  fallbackUsed?: boolean;
}

export interface ToolSchema {
  name: string;
  description?: string;
  parameters: Record<string, any>; // JSON Schema object
}

const MAX_RETRIES = 3;
const FALLBACK_TIER: AgentTier = 'standard';

/**
 * Unified model call with tool-calling for guaranteed structured output.
 *
 * @param phase     — which agent phase (determines model from registry)
 * @param tier      — user-selected tier ('lite' | 'fast' | 'standard' | 'elite')
 * @param schema    — JSON schema for the expected tool response
 * @param prompt    — user/system prompt content
 * @param options   — optional overrides (maxTokens, temperature, systemPrompt)
 */
export async function callModel<T = any>(
  phase: AgentPhase,
  tier: AgentTier | string,
  schema: ToolSchema,
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    fallbackToStandard?: boolean;
  }
): Promise<ModelCallResult<T>> {
  let modelMeta = getModelForPhase(tier, phase);
  let attempts = 0;
  let lastError: string | undefined;
  let fallbackUsed = false;

  // Try primary model + retries
  while (attempts < MAX_RETRIES) {
    attempts++;
    const result = await attemptCall(modelMeta, schema, prompt, options);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data as T,
        modelUsed: modelMeta.id,
        attempts,
        tokensUsed: result.tokensUsed,
        fallbackUsed,
      };
    }

    lastError = result.error;
    console.warn(
      `[callModel] Attempt ${attempts}/${MAX_RETRIES} failed for ${phase} (${modelMeta.id}): ${lastError}`
    );

    // On final attempt, optionally fall back to Standard tier
    if (attempts === MAX_RETRIES && options?.fallbackToStandard !== false && tier !== 'standard') {
      const fallbackMeta = getModelForPhase('standard', phase);
      if (fallbackMeta.id !== modelMeta.id) {
        console.warn(`[callModel] Falling back to Standard tier model: ${fallbackMeta.id}`);
        modelMeta = fallbackMeta;
        fallbackUsed = true;
        attempts = 0; // Reset attempts for fallback model
        continue;
      }
    }
  }

  return {
    success: false,
    error: lastError || `All ${MAX_RETRIES} attempts failed for ${phase}`,
    modelUsed: modelMeta.id,
    attempts,
    fallbackUsed,
  };
}

// ─── Internal: single attempt ────────────────────────────────────

interface AttemptResult {
  success: boolean;
  data?: any;
  error?: string;
  tokensUsed?: { prompt: number; completion: number };
}

async function attemptCall(
  modelMeta: ModelMeta,
  schema: ToolSchema,
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AttemptResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'GROQ_API_KEY not set' };
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const toolDef = {
    type: 'function' as const,
    function: {
      name: schema.name,
      description: schema.description || `Structured response for ${schema.name}`,
      parameters: schema.parameters,
    },
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelMeta.id,
        messages,
        tools: [toolDef],
        tool_choice: {
          type: 'function',
          function: { name: schema.name },
        },
        temperature: options?.temperature ?? modelMeta.temperature,
        max_tokens: options?.maxTokens ?? modelMeta.maxTokens,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        success: false,
        error: `Groq API error ${res.status}: ${JSON.stringify(errBody).slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const toolCall = choice?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function?.name !== schema.name) {
      return {
        success: false,
        error: 'Model did not return expected tool call',
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e: any) {
      return {
        success: false,
        error: `Tool call arguments were invalid JSON: ${e.message}`,
      };
    }

    return {
      success: true,
      data: parsed,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens ?? 0,
        completion: data.usage?.completion_tokens ?? 0,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: `Network or runtime error: ${e.message}`,
    };
  }
}

/**
 * Legacy compatibility: simple text generation without tool calling.
 * Used for free-form code generation (generatePhase, fixPhase) where
 * the output is markdown/code, not structured JSON.
 */
export async function callModelText(
  phase: AgentPhase,
  tier: AgentTier | string,
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<ModelCallResult<string>> {
  const modelMeta = getModelForPhase(tier, phase);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'GROQ_API_KEY not set', modelUsed: modelMeta.id, attempts: 0 };
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelMeta.id,
        messages,
        temperature: options?.temperature ?? modelMeta.temperature,
        max_tokens: options?.maxTokens ?? modelMeta.maxTokens,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        success: false,
        error: `Groq API error ${res.status}: ${JSON.stringify(errBody).slice(0, 200)}`,
        modelUsed: modelMeta.id,
        attempts: 1,
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';

    return {
      success: true,
      data: content,
      modelUsed: modelMeta.id,
      attempts: 1,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens ?? 0,
        completion: data.usage?.completion_tokens ?? 0,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: `Network error: ${e.message}`,
      modelUsed: modelMeta.id,
      attempts: 1,
    };
  }
}
