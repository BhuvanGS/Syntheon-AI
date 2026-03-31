// lib/shipai/linear.ts
import type { DevPlan } from './ai';

const LINEAR_API = 'https://api.linear.app/graphql';

type LinearRequestOptions = {
  accessToken?: string;
};

async function linearRequest(
  query: string,
  variables: any,
  context: string,
  options: LinearRequestOptions = {}
) {
  const accessToken = options.accessToken || process.env.LINEAR_API_KEY;
  if (!accessToken) {
    throw new Error('Linear access token not configured');
  }

  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();

  if (data.errors?.length > 0) {
    throw new Error(
      `Linear error during "${context}": ${data.errors.map((e: any) => e.message).join('; ')}`
    );
  }

  return data.data;
}

function normalizeIssue(issue: any) {
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    url: issue.url,
    state: issue.state ? { id: issue.state.id, name: issue.state.name } : null,
  };
}

async function createIssue(
  {
    title,
    description,
    teamId,
    parentId,
    stateId,
  }: {
    title: string;
    description: string;
    teamId: string;
    parentId?: string;
    stateId?: string;
  },
  options: LinearRequestOptions = {}
) {
  const input: any = { teamId, title, description };
  if (parentId) input.parentId = parentId;
  if (stateId) input.stateId = stateId;

  const data = await linearRequest(
    `mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title url state { id name } }
      }
    }`,
    { input },
    `createIssue(${title})`,
    options
  );

  if (!data?.issueCreate?.success) throw new Error(`Linear: issue creation failed for "${title}"`);
  return normalizeIssue(data.issueCreate.issue);
}

async function updateIssueState(
  issueId: string,
  stateId: string,
  options: LinearRequestOptions = {}
) {
  const data = await linearRequest(
    `mutation UpdateIssueState($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title url state { id name } }
      }
    }`,
    { id: issueId, input: { stateId } },
    `updateIssueState(${issueId})`,
    options
  );

  if (!data?.issueUpdate?.success) throw new Error(`Linear: issue update failed for "${issueId}"`);
  return normalizeIssue(data.issueUpdate.issue);
}

export async function createLinearTicketBundle(plan: DevPlan) {
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!teamId) {
    throw new Error('LINEAR_TEAM_ID is not configured');
  }

  const parentIssue = await createIssue({
    title: plan.issue_title,
    description: plan.issue_body,
    teamId,
    stateId: process.env.LINEAR_INITIAL_STATE_ID,
  });

  const subtaskIssues = [];
  for (const subtask of plan.linear_subtasks) {
    const created = await createIssue({
      title: subtask.title,
      description: subtask.description,
      teamId,
      parentId: parentIssue.id,
      stateId: process.env.LINEAR_INITIAL_STATE_ID,
    });
    subtaskIssues.push(created);
  }

  return { parentIssue, subtaskIssues };
}

export async function getLinearViewerContext(accessToken: string) {
  const data = await linearRequest(
    `query ViewerContext {
      viewer {
        id
        name
        email
      }
      teams {
        nodes {
          id
          name
          key
        }
      }
    }`,
    {},
    'viewerContext',
    { accessToken }
  );

  const teams = data?.teams?.nodes ?? [];
  return {
    viewer: data?.viewer,
    teams,
    defaultTeamId: teams[0]?.id ?? null,
    defaultTeamName: teams[0]?.name ?? null,
  };
}

export async function createLinearTicketBundleWithAccessToken(
  plan: DevPlan,
  accessToken: string,
  teamId: string
) {
  const options = { accessToken };

  const parentIssue = await createIssue(
    {
      title: plan.issue_title,
      description: plan.issue_body,
      teamId,
      stateId: process.env.LINEAR_INITIAL_STATE_ID,
    },
    options
  );

  const subtaskIssues = [];
  for (const subtask of plan.linear_subtasks) {
    const created = await createIssue(
      {
        title: subtask.title,
        description: subtask.description,
        teamId,
        parentId: parentIssue.id,
        stateId: process.env.LINEAR_INITIAL_STATE_ID,
      },
      options
    );
    subtaskIssues.push(created);
  }

  return { parentIssue, subtaskIssues };
}

export async function moveLinearTicketBundleToPrStage(
  bundle: { parentIssue: any; subtaskIssues: any[] },
  options: LinearRequestOptions = {}
) {
  const stateId = process.env.LINEAR_PR_CREATED_STATE_ID;
  if (!stateId) return bundle;

  const updatedParent = await updateIssueState(bundle.parentIssue.id, stateId, options);
  const updatedSubtasks = [];
  for (const issue of bundle.subtaskIssues) {
    updatedSubtasks.push(await updateIssueState(issue.id, stateId, options));
  }

  return { parentIssue: updatedParent, subtaskIssues: updatedSubtasks };
}
