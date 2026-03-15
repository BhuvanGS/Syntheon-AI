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
  issue_title:     string;
  issue_body:      string;
  branch_name:     string;
  pr_title:        string;
  linear_subtasks: LinearSubtask[];
  files:           PlanFile[];
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
      throw new Error(`Each subtask must have title and description`);
    }
  }
  if (!Array.isArray(plan.files) || plan.files.length === 0) {
    throw new Error('files must be a non-empty array');
  }
  for (const file of plan.files) {
    if (!file.path || typeof file.content !== 'string') {
      throw new Error(`Each file must have path and content`);
    }
  }
}

const GITHUB_PAGES_WORKFLOW = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4`;

export async function generatePlan(featureRequest: string): Promise<DevPlan> {
  const systemPrompt = loadSystemPrompt();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: featureRequest }
      ],
      temperature: 0.3,
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Groq API error: ${res.status} — ${JSON.stringify(err)}`);
  }

  const data    = await res.json();
  const raw     = data.choices[0].message.content.trim();
  const match   = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : raw;

  let plan: any;
  try {
    plan = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse response as JSON: ${raw.slice(0, 300)}`);
  }

  validatePlan(plan);

  // Inject GitHub Pages workflow into every generated plan
  plan.files.push({
    path:    '.github/workflows/deploy.yml',
    content: GITHUB_PAGES_WORKFLOW
  });

  return plan;
}