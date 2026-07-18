import type { Metadata } from 'next';

const BASE = 'https://syntheonhub.com';

export const DOC_SEO: Record<string, { title: string; description: string }> = {
  'getting-started': {
    title: 'Getting Started',
    description:
      'Create an account, start a meeting, and turn transcripts into structured tickets with Syntheon Hub.',
  },
  trial: {
    title: 'Free Trial',
    description:
      'How the Syntheon Hub free trial works, what’s included, and what happens after it ends.',
  },
  dashboard: {
    title: 'Dashboard',
    description:
      'Overview of your meetings, tickets, and project activity in the Syntheon Hub dashboard.',
  },
  sidebar: {
    title: 'Sidebar Navigation',
    description: 'Navigate projects, meetings, and settings from the Syntheon Hub sidebar.',
  },
  search: {
    title: 'Global Search',
    description: 'Find tickets, meetings, and projects instantly with Syntheon Hub global search.',
  },
  notifications: {
    title: 'Notifications',
    description:
      'Stay on top of assignments, mentions, and status changes with Syntheon Hub notifications.',
  },
  meetings: {
    title: 'Meetings',
    description:
      'Send the Syntheon Hub bot to Google Meet, Zoom, or Teams and capture action items automatically.',
  },
  'meeting-states': {
    title: 'Meeting States',
    description: 'Understand processing, completed, and failed meeting states in Syntheon Hub.',
  },
  transcripts: {
    title: 'Transcripts',
    description:
      'Review speaker-labeled transcripts and how they feed ticket extraction in Syntheon Hub.',
  },
  'ticket-extraction': {
    title: 'AI Ticket Extraction',
    description: 'How Syntheon Hub AI turns meeting speech into implementation-ready tickets.',
  },
  'ticket-fields': {
    title: 'Ticket Fields',
    description:
      'Priorities, estimates, labels, assignees, and other ticket fields in Syntheon Hub.',
  },
  'ticket-badges': {
    title: 'Ticket Badges',
    description: 'Status, priority, and dependency badges that surface ticket state at a glance.',
  },
  'editing-tickets': {
    title: 'Editing & Rejecting Tickets',
    description: 'Edit, reject, or refine AI-extracted tickets before they hit your board.',
  },
  board: {
    title: 'Kanban Board',
    description: 'Organize backlog, in-progress, blocked, and done work on the Syntheon Hub board.',
  },
  filtering: {
    title: 'Filtering Tickets',
    description: 'Filter the board by assignee, label, priority, status, and more.',
  },
  'bulk-actions': {
    title: 'Bulk Actions',
    description: 'Update, move, or delete many tickets at once with Syntheon Hub bulk actions.',
  },
  'command-palette': {
    title: 'Command Palette',
    description: 'Run searches and actions quickly with the Syntheon Hub command palette.',
  },
  projects: {
    title: 'Projects',
    description: 'Create projects, import meeting tickets, and manage delivery in Syntheon Hub.',
  },
  'project-tabs': {
    title: 'Project Tabs',
    description: 'Switch between board, backlog, analytics, and other project views.',
  },
  importing: {
    title: 'Importing Tickets',
    description: 'Import extracted meeting tickets into a project and keep dependencies intact.',
  },
  'project-settings': {
    title: 'Project Settings',
    description: 'Configure project name, members, repo links, and delivery settings.',
  },
  dependencies: {
    title: 'Dependencies',
    description: 'Link blocking work so tickets can’t move forward until prerequisites are done.',
  },
  'dependency-graph': {
    title: 'Dependency Graph',
    description: 'Visualize how tickets depend on each other across a project.',
  },
  cascading: {
    title: 'Cascading Regressions',
    description: 'See how status changes propagate through dependent tickets.',
  },
  'sprint-stones': {
    title: 'Sprint-stones',
    description: 'Plan short delivery cycles with Syntheon Hub sprint-stones.',
  },
  burndown: {
    title: 'Burndown Chart',
    description: 'Track remaining work through a sprint with the burndown chart.',
  },
  velocity: {
    title: 'Velocity',
    description: 'Measure how much work your team completes across sprints.',
  },
  'cycle-time': {
    title: 'Cycle Time',
    description: 'Understand how long tickets take from start to done.',
  },
  milestones: {
    title: 'Milestones',
    description: 'Group tickets under milestones to track larger delivery goals.',
  },
  analytics: {
    title: 'Analytics',
    description: 'Project health, throughput, and delivery analytics in Syntheon Hub.',
  },
  'future-viz': {
    title: 'Future Viz (Gantt)',
    description: 'Preview upcoming work on a timeline-style Future Viz view.',
  },
  members: {
    title: 'Members',
    description: 'Invite teammates and manage project membership in Syntheon Hub.',
  },
  roles: {
    title: 'Roles & Permissions',
    description: 'Understand admin, member, and project-lead permissions.',
  },
  settings: {
    title: 'Settings Overview',
    description: 'Account, organization, and workspace settings in Syntheon Hub.',
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect GitHub, Google Calendar, and other tools to Syntheon Hub.',
  },
  organizations: {
    title: 'Organizations',
    description: 'Create orgs, invite members, and manage company workspaces.',
  },
  domains: {
    title: 'Domain Verification',
    description: 'Verify your company domain so teammates can join the right organization.',
  },
  preferences: {
    title: 'Preferences',
    description: 'Theme, notification, and personal preference settings.',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    description: 'Speed up common actions with Syntheon Hub keyboard shortcuts.',
  },
  labels: {
    title: 'Label Management',
    description: 'Create and apply labels to organize tickets across projects.',
  },
};

export function docsMetadata(slug?: string): Metadata {
  const entry = slug ? DOC_SEO[slug] : undefined;
  const title = entry?.title ?? 'Docs';
  const description =
    entry?.description ??
    'Syntheon Hub documentation — meetings, tickets, boards, dependencies, sprints, and more.';
  const path = slug ? `/docs/${slug}` : '/docs';
  const url = `${BASE}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Syntheon Hub Docs`,
      description,
      url,
      type: 'article',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      title: `${title} | Syntheon Hub Docs`,
      description,
      images: ['/og-image.png'],
    },
  };
}

/** All doc section slugs that should appear in the sitemap. */
export function getDocSitemapSlugs(): string[] {
  return Object.keys(DOC_SEO);
}
