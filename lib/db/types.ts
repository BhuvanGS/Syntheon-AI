// Domain types for lib/db

export interface Meeting {
  id: string;
  user_id?: string;
  org_id?: string;
  projectName: string;
  meetingId: string;
  platform: string;
  transcript: string;
  specsDetected: number;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  date: string;
  filePath: string;
  botId?: string;
  branchName?: string;
  deployUrl?: string;
  projectId?: string;
  meeting_url?: string;
  summary?: string;
}

export interface SpecBlock {
  id: string;
  user_id?: string;
  title: string;
  type: 'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp: string;
  note?: string;
  projectId?: string;
  parentSpecId?: string;
}

export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TicketType = 'bug' | 'task' | 'feature' | 'spike';
export type TicketEstimate = 'quick' | 'standard' | 'deep' | 'epic' | 'none';

export interface Ticket {
  id: string;
  user_id?: string;
  org_id?: string;
  meeting_id: string | null;
  projectId?: string;
  parent_id?: string | null;
  title: string;
  description: string;
  status: string;
  priority?: TicketPriority;
  type?: TicketType;
  estimate?: TicketEstimate;
  labels?: string[];
  assignee?: string | null;
  assignee_user_id?: string | null;
  dependency_ticket_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  deadline_time?: string | null;
  rank?: number | null;
  milestoneId?: string | null;
  isGroup?: boolean;
  sprintId?: string | null;
  timeEstimate?: number | null;
  timeSpent?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  user_id?: string;
  org_id?: string;
  name: string;
  repo: string;
  deployUrl?: string;
  branchBase: string;
  agentTier?: string;
  meetings: string[];
  ticketIds: string[];
  files: string[];
  context: string;
  leadUserId?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  project_id?: string | null;
  user_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  project_id?: string | null;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type DependencyType = 'data' | 'structural' | 'logical' | 'resource';
export type DependencyStrength = 'soft' | 'hard';
export interface TicketDependency {
  id: string;
  project_id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: DependencyType;
  strength: DependencyStrength;
  note?: string | null;
  ignore_count: number;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}
export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
export interface ProjectMember {
  id: string;
  project_id: string;
  org_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
}
export interface Notification {
  id: string;
  user_id: string;
  org_id: string;
  type: 'assigned' | 'mentioned' | 'blocked' | 'due_soon' | 'meeting_ready' | 'meeting_failed';
  title: string;
  message?: string;
  ticket_id?: string;
  read: boolean;
  created_at: string;
}
export interface Label {
  id: string;
  org_id: string;
  name: string;
  color: string;
  created_at: string;
}
export interface Milestone {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  description: string;
  due_date?: string | null;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}
export interface Sprint {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  review?: string | null;
  created_at: string;
  updated_at: string;
}
export interface ConsentRecord {
  id: string;
  userId: string;
  consentVersion: string;
  purposes: string[];
  ipAddress?: string;
  deviceId?: string;
  userAgent?: string;
  givenAt: string;
  withdrawnAt?: string;
  status: 'active' | 'withdrawn';
}
