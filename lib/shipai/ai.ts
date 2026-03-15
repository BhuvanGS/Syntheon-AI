// lib/shipai/ai.ts
import fs from 'fs';
import path from 'path';

const PROMPT_PATH = path.join(process.cwd(), 'prompts/devPrompt.txt');

function loadSystemPrompt(): string {
  return fs.readFileSync(PROMPT_PATH, 'utf-8').trim();
}

export interface LinearSubtask {
  title:       string;
  description: string;
}

export interface PlanFile {
  path:    string;
  content: string;
}

export interface DevPlan {
  issue_title:      string;
  issue_body:       string;
  branch_name:      string;
  pr_title:         string;
  linear_subtasks:  LinearSubtask[];
  files:            PlanFile[];
}

function validatePlan(plan: any): asserts plan is DevPlan {
  const required = ['issue_title', 'issue_body', 'branch_name', 'pr_title', 'linear_subtasks', 'files'];
  for (const key of required) {
    if (!plan[key]) throw new Error(`AI response missing required field: "${key}"`);
  }
  if (!Array.isArray(plan.linear_subtasks) || plan.linear_subtasks.length === 0) {
    throw new Error('linear_subtasks must be a non-empty array');
  }
  for (const subtask of plan.linear_subtasks) {
    if (!subtask.title || !subtask.description) {
      throw new Error(`Each subtask must have title and description. Got: ${JSON.stringify(subtask)}`);
    }
  }
  if (!Array.isArray(plan.files) || plan.files.length === 0) {
    throw new Error('files must be a non-empty array');
  }
  for (const file of plan.files) {
    if (!file.path || typeof file.content !== 'string') {
      throw new Error(`Each file must have path and content. Got: ${JSON.stringify(file)}`);
    }
  }
}

export async function generatePlan(featureRequest: string): Promise<DevPlan> {
  const systemPrompt = loadSystemPrompt();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: featureRequest }
      ],
      temperature: 0.3,
    })
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);

  const data     = await res.json();
  const raw      = data.choices[0].message.content.trim();
  const match    = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr  = match ? match[1].trim() : raw;

  let plan: any;
  try {
    plan = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse AI response as JSON: ${raw}`);
  }

  validatePlan(plan);
  return plan;
}