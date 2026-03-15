// lib/shipai/linear.ts
import type { DevPlan, LinearSubtask } from './ai';

const LINEAR_API = 'https://api.linear.app/graphql';

async function linearRequest(query: string, variables: any, context: string) {
  const res = await fetch(LINEAR_API, {
    method:  'POST',
    headers: {
      'Authorization': process.env.LINEAR_API_KEY!,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query, variables })
  });

  const data = await res.json();

  if (data.errors?.length > 0) {
    throw new Error(`Linear error during "${context}": ${data.errors.map((e: any) => e.message).join('; ')}`);
  }

  return data.data;
}

function normalizeIssue(issue: any) {
  return {
    id:         issue.id,
    identifier: issue.identifier,
    title:      issue.title,
    url:        issue.url,
    state:      issue.state ? { id: issue.state.id, name: issue.state.name } : null,
  };
}

async function createIssue({ title, description, teamId, parentId, stateId }: {
  title:        string;
  description:  string;
  teamId:       string;
  parentId?:    string;
  stateId?:     string;
}) {
  const input: any = { teamId, title, description };
  if (parentId) input.parentId = parentId;
  if (stateId)  input.stateId  = stateId;

  const data = await linearRequest(
    `mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title url state { id name } }
      }
    }`,
    { input },
    `createIssue(${title})`
  );

  if (!data?.issueCreate?.success) throw new Error(`Linear: issue creation failed for "${title}"`);
  return normalizeIssue(data.issueCreate.issue);
}

async function updateIssueState(issueId: string, stateId: string) {
  const data = await linearRequest(
    `mutation UpdateIssueState($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title url state { id name } }
      }
    }`,
    { id: issueId, input: { stateId } },
    `updateIssueState(${issueId})`
  );

  if (!data?.issueUpdate?.success) throw new Error(`Linear: issue update failed for "${issueId}"`);
  return normalizeIssue(data.issueUpdate.issue);
}

export async function createLinearTicketBundle(plan: DevPlan) {
  const parentIssue = await createIssue({
    title:       plan.issue_title,
    description: plan.issue_body,
    teamId:      process.env.LINEAR_TEAM_ID!,
    stateId:     process.env.LINEAR_INITIAL_STATE_ID,
  });

  const subtaskIssues = [];
  for (const subtask of plan.linear_subtasks) {
    const created = await createIssue({
      title:       subtask.title,
      description: subtask.description,
      teamId:      process.env.LINEAR_TEAM_ID!,
      parentId:    parentIssue.id,
      stateId:     process.env.LINEAR_INITIAL_STATE_ID,
    });
    subtaskIssues.push(created);
  }

  return { parentIssue, subtaskIssues };
}

export async function moveLinearTicketBundleToPrStage(bundle: { parentIssue: any; subtaskIssues: any[] }) {
  const stateId = process.env.LINEAR_PR_CREATED_STATE_ID;
  if (!stateId) return bundle;

  const updatedParent   = await updateIssueState(bundle.parentIssue.id, stateId);
  const updatedSubtasks = [];
  for (const issue of bundle.subtaskIssues) {
    updatedSubtasks.push(await updateIssueState(issue.id, stateId));
  }

  return { parentIssue: updatedParent, subtaskIssues: updatedSubtasks };
}