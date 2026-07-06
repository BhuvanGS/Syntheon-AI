'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useOrganization, useUser, useAuth } from '@clerk/nextjs';
import { useSse } from '@/components/sse-provider';

const ORG_QUERY_CONFIG = {
  memberships: { infinite: true, pageSize: 50 },
  invitations: { infinite: true, pageSize: 50 },
};
import { stripHtml, cn } from '@/lib/utils';
import { parseISO, isPast, isToday, isTomorrow, isThisWeek, format } from 'date-fns';
import { AssigneePicker, type AssigneeValue } from '@/components/assignee-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { TicketDependencyPanel } from '@/components/ticket-dependency-panel';
import { TicketDependencyGraph } from '@/components/ticket-dependency-graph';
import { TicketAttachmentsPanel } from '@/components/ticket-attachments-panel';
import { TicketCommentsPanel } from '@/components/ticket-comments-panel';
import { TicketActivityPanel } from '@/components/ticket-activity-panel';
import { TicketTimelinePanel } from '@/components/ticket-timeline-panel';
import { DateRangePicker } from '@/components/date-range-picker';
import { DependencyBlockerModal } from '@/components/dependency-blocker-modal';
import { TipTapEditor } from '@/components/tiptap-editor';
import { MentionEditor } from '@/components/mention-editor';
import { useToast } from '@/components/island-toast';
import { ProjectTicketImportDialog } from '@/components/project-ticket-import-dialog';
import { ProjectMeetingDialog } from '@/components/project-meeting-dialog';
import { MeetingCalendar } from '@/components/meeting-calendar';
import {
  TicketBadges,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';
import { EMPTY_FILTERS, type TicketFilters } from '@/components/ticket-filter-bar';
import { FilterDialog } from '@/components/ticket-filter-dialog';
import { TicketMetadataEditor } from '@/components/ticket-metadata-editor';
import { BulkActionBar } from '@/components/ticket-bulk-bar';
import { BacklogView } from '@/components/backlog-view';
import { RoadmapView } from '@/components/roadmap-view';
import { LabelManager } from '@/components/label-manager';
import { onCommand } from '@/lib/command-events';
import {
  FolderKanban,
  Plus,
  Video,
  Ticket,
  ArrowRight,
  Download,
  Pencil,
  Trash2,
  GitBranch,
  Calendar,
  LayoutList,
  KanbanSquare,
  ListOrdered,
  BarChart3,
  Sparkles,
  Layers,
  Milestone,
  Zap,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronLeft,
  SlidersHorizontal,
  PlusCircle,
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  Users,
  UserMinus,
  Settings,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Flame,
  Minus,
  CheckSquare,
  Square,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from 'recharts';

type ProjectTab =
  | 'meetings'
  | 'tickets'
  | 'analytics'
  | 'dependencies'
  | 'members'
  | 'settings'
  | 'roadmap'
  | 'sprint-stones';

type SprintStonesView = 'sprints' | 'milestones' | 'analytics';

type TicketsViewMode = 'board' | 'list' | 'backlog' | 'groups';

interface Project {
  id: string;
  name: string;
  repo: string;
  deployUrl?: string | null;
  branchBase?: string | null;
  agentTier?: string | null;
  meetings: string[];
  ticketIds: string[];
  files: string[];
  context: string;
  leadUserId?: string | null;
  status?: string;
  updatedAt?: string;
}

interface Meeting {
  id: string;
  projectName: string;
  meetingId: string;
  specsDetected: number;
  projectId?: string | null;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  date: string;
  platform: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: TicketPriority;
  type?: TicketType;
  estimate?: TicketEstimate;
  labels?: string[];
  assignee?: string | null;
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
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
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

type StageConfig = {
  id: string;
  label: string;
  color: string;
  status: string;
};

const DEFAULT_STAGES: StageConfig[] = [];

interface ProjectsWorkspaceProps {
  projects: Project[];
  meetings: Meeting[];
  tickets: Ticket[];
  selectedProjectId: string | null;
  preferredTab?: ProjectTab | null;
  onTabChange?: (tab: ProjectTab) => void;
  onSelectProject: (projectId: string) => void;
  onSelectMeeting: (meetingId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
  onProjectsRefresh?: () => Promise<void> | void;
  showHeader?: boolean;
}

export function ProjectsWorkspace({
  projects,
  meetings,
  tickets,
  selectedProjectId,
  preferredTab,
  onTabChange,
  onSelectProject,
  onSelectMeeting,
  onCreateProject,
  onDeleteProject,
  onRefresh,
  onProjectsRefresh,
  showHeader = true,
}: ProjectsWorkspaceProps) {
  const { membership, memberships, invitations } = useOrganization(ORG_QUERY_CONFIG);
  const { user } = useUser();
  const { has } = useAuth();
  const isAdmin = membership?.role === 'org:admin';
  const [kanbanAssigneeFilter, setKanbanAssigneeFilter] = useState<'all' | 'unassigned' | 'mine'>(
    'all'
  );
  const [optimisticTicketOverrides, setOptimisticTicketOverrides] = useState<
    Record<string, Partial<Ticket>>
  >({});
  const [projectTab, setProjectTab] = useState<ProjectTab>('tickets');
  const [meetingsViewMode, setMeetingsViewMode] = useState<'list' | 'calendar'>('list');
  const [ticketsViewMode, setTicketsViewMode] = useState<TicketsViewMode>('board');
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_FILTERS);
  const [labels, setLabels] = useState<Label[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, { name: string; color: string }>>({});
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [metaPriority, setMetaPriority] = useState<TicketPriority>('none');
  const [metaType, setMetaType] = useState<TicketType>('task');
  const [metaEstimate, setMetaEstimate] = useState<TicketEstimate>('none');
  const [metaTimeEstimate, setMetaTimeEstimate] = useState<number | null>(null);
  const [metaTimeSpent, setMetaTimeSpent] = useState<number | null>(null);
  const [metaLabels, setMetaLabels] = useState<string[]>([]);
  const [metaMilestoneId, setMetaMilestoneId] = useState<string | null>(null);
  const [metaSprintId, setMetaSprintId] = useState<string | null>(null);
  const [metaIsGroup, setMetaIsGroup] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneEditForm, setMilestoneEditForm] = useState({
    name: '',
    description: '',
    dueDate: '',
  });
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [sprintEditForm, setSprintEditForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });
  const [sprintStonesView, setSprintStonesView] = useState<SprintStonesView>('analytics');
  const [showCreateSprintForm, setShowCreateSprintForm] = useState(false);
  const [generatingSprints, setGeneratingSprints] = useState(false);
  const [showCreateMilestoneForm, setShowCreateMilestoneForm] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupSelectedIds, setGroupSelectedIds] = useState<Set<string>>(new Set());
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [aiGroupSuggestions, setAiGroupSuggestions] = useState<
    { name: string; ticketIds: string[]; reason: string }[]
  >([]);
  const [aiGroupLoading, setAiGroupLoading] = useState(false);
  const [showAiGroupDialog, setShowAiGroupDialog] = useState(false);
  const [aiGroupAccepted, setAiGroupAccepted] = useState<Set<number>>(new Set());
  const [aiGroupRemovedTickets, setAiGroupRemovedTickets] = useState<Record<number, Set<string>>>(
    {}
  );

  interface ProjectMemberRow {
    id: string;
    project_id: string;
    user_id: string;
    role: 'admin' | 'manager' | 'member';
  }
  const [projectMembers, setProjectMembers] = useState<ProjectMemberRow[]>([]);
  const [projectMembersLoading, setProjectMembersLoading] = useState(false);
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
  const [removingProjectMemberId, setRemovingProjectMemberId] = useState<string | null>(null);

  const fetchProjectMembers = useCallback(async (projectId: string) => {
    setProjectMembersLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) setProjectMembers(await res.json());
    } finally {
      setProjectMembersLoading(false);
    }
  }, []);

  const fetchMilestones = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`);
      if (res.ok) setMilestones(await res.json());
    } catch {}
  }, []);

  const fetchDeletedActivities = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/deleted-activities`);
      if (res.ok) setDeletedActivities(await res.json());
    } catch {}
  }, []);

  const fetchSprints = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`);
      if (res.ok) setSprints(await res.json());
    } catch {}
  }, []);

  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const kanbanScrollRef = useRef<HTMLDivElement>(null);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketStatus, setNewTicketStatus] = useState<string | undefined>(undefined);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRenameProjectOpen, setIsRenameProjectOpen] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState('');
  const [projectContextDraft, setProjectContextDraft] = useState('');
  const [savingProjectSettings, setSavingProjectSettings] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [aiHealthSuggestion, setAiHealthSuggestion] = useState<{
    status: string;
    reason: string;
  } | null>(null);
  const [deletedActivities, setDeletedActivities] = useState<
    {
      id: string;
      ticket_id: string;
      user_id: string;
      action_type: string;
      metadata: Record<string, unknown>;
      created_at: string;
    }[]
  >([]);
  const [milestones, setMilestones] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      due_date?: string | null;
      status: string;
      created_at: string;
    }>
  >([]);
  const [milestoneForm, setMilestoneForm] = useState<{
    name: string;
    description: string;
    dueDate: string;
  }>({
    name: '',
    description: '',
    dueDate: '',
  });
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [sprints, setSprints] = useState<
    Array<{
      id: string;
      name: string;
      goal: string;
      start_date: string;
      end_date: string;
      status: string;
      review?: string | null;
      created_at: string;
    }>
  >([]);
  const [sprintForm, setSprintForm] = useState<{
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });
  const [savingSprint, setSavingSprint] = useState(false);
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);
  const [sprintPulse, setSprintPulse] = useState<string | null>(null);
  const [sprintPulseLoading, setSprintPulseLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectDeleteConfirm, setProjectDeleteConfirm] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [deleteMode, setDeleteMode] = useState<'confirm' | 'reassign' | null>(null);
  const [subtaskReassignTargetId, setSubtaskReassignTargetId] = useState<string>('');
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [ticketEditorHistory, setTicketEditorHistory] = useState<Ticket[]>([]);
  const [ticketEditForm, setTicketEditForm] = useState<{
    title: string;
    description: string;
    assignee: AssigneeValue | null;
    status: Ticket['status'];
    start_date: string;
    due_date: string;
    deadline_time: string;
  }>({
    title: '',
    description: '',
    assignee: null,
    status: 'backlog',
    start_date: '',
    due_date: '',
    deadline_time: '',
  });
  const [ticketStageMap, setTicketStageMap] = useState<Record<string, string>>({});
  const [hydratedProjectId, setHydratedProjectId] = useState<string | null>(null);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isAddingStageInline, setIsAddingStageInline] = useState(false);
  const [stageForm, setStageForm] = useState<{
    id: string | null;
    label: string;
    color: string;
    stageType: 'backlog' | 'in_progress' | 'done' | 'blocked';
  }>({
    id: null,
    label: '',
    color: '#64748b',
    stageType: 'backlog',
  });
  const [stageToDelete, setStageToDelete] = useState<StageConfig | null>(null);
  const [isDeleteStageDialogOpen, setIsDeleteStageDialogOpen] = useState(false);
  const [relocateStageId, setRelocateStageId] = useState<string>('');
  const [isRelocateStageDialogOpen, setIsRelocateStageDialogOpen] = useState(false);
  const [expandedTicketIds, setExpandedTicketIds] = useState<Record<string, boolean>>({});
  const [newChildDraft, setNewChildDraft] = useState({ title: '' });
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(true);
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [subtasksPopupTicket, setSubtasksPopupTicket] = useState<Ticket | null>(null);
  const [ticketEditTab, setTicketEditTab] = useState<
    'details' | 'attachments' | 'comments' | 'activity' | 'timeline'
  >('details');

  // Dependency blocker modal state
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerModalData, setBlockerModalData] = useState<{
    message: string;
    blockers: Array<{ id: string; depends_on: string; type: string; title?: string }>;
    isHardBlock: boolean;
    onRevert: () => void;
    onProceed?: () => void;
  } | null>(null);

  const { showToast } = useToast();

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (selectedProject) {
      setProjectNameDraft(selectedProject.name);
      setProjectContextDraft(selectedProject.context || '');
    }
  }, [selectedProject?.id]);

  const projectMeetings = useMemo(() => {
    if (!selectedProject?.id) return [];
    const linkedMeetingIds = new Set(selectedProject.meetings ?? []);
    return meetings.filter(
      (meeting) => meeting.projectId === selectedProject.id || linkedMeetingIds.has(meeting.id)
    );
  }, [meetings, selectedProject?.id, selectedProject?.meetings]);

  const projectTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.projectId === selectedProject?.id)
        .map((ticket) => ({ ...ticket, ...optimisticTicketOverrides[ticket.id] })),
    [tickets, selectedProject?.id, optimisticTicketOverrides]
  );

  const [stages, setStages] = useState<StageConfig[]>(DEFAULT_STAGES);

  const effectiveStages = useMemo(() => {
    const seen = new Set<string>();
    const result: StageConfig[] = [];
    for (const s of stages) {
      if (seen.has(s.status)) continue;
      seen.add(s.status);
      result.push(s);
    }
    for (const t of projectTickets) {
      if (t.status && !seen.has(t.status)) {
        seen.add(t.status);
        result.push({
          id: `stage-auto-${t.status}`,
          label: t.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          color: '#64748b',
          status: t.status,
        });
      }
    }
    return result;
  }, [stages, projectTickets]);

  useEffect(() => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollLeft = 0;
    }
  }, [effectiveStages]);

  const rootProjectTickets = useMemo(() => {
    const base = projectTickets.filter((ticket) => !ticket.dependency_ticket_id);
    let result = base;
    if (kanbanAssigneeFilter === 'unassigned') result = result.filter((t) => !t.assignee_user_id);
    else if (kanbanAssigneeFilter === 'mine')
      result = result.filter((t) => t.assignee_user_id === user?.id);

    // Apply filter bar
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    if (filters.priority)
      result = result.filter((t) => (t.priority ?? 'none') === filters.priority);
    if (filters.type) result = result.filter((t) => (t.type ?? 'task') === filters.type);
    if (filters.estimate)
      result = result.filter((t) => (t.estimate ?? 'none') === filters.estimate);
    if (filters.labelIds.length > 0) {
      result = result.filter((t) => {
        const tLabels = t.labels ?? [];
        return filters.labelIds.some((id) => tLabels.includes(id));
      });
    }
    if (filters.dueDate !== 'all') {
      result = result.filter((t) => {
        if (!t.due_date) return filters.dueDate === 'none';
        const d = parseISO(t.due_date);
        if (filters.dueDate === 'overdue') return isPast(d) && !isToday(d);
        if (filters.dueDate === 'today') return isToday(d);
        if (filters.dueDate === 'this_week') return isThisWeek(d, { weekStartsOn: 1 });
        if (filters.dueDate === 'none') return false;
        return true;
      });
    }
    return result;
  }, [projectTickets, kanbanAssigneeFilter, user?.id, filters]);

  const totalTickets = projectTickets.length;

  const memoizedMeetings = useMemo(
    () => projectMeetings.map((meeting) => ({ id: meeting.id, projectName: meeting.projectName })),
    [projectMeetings]
  );

  const memoizedStatusOptions = useMemo(
    () => effectiveStages.map((stage) => ({ value: stage.status, label: stage.label })),
    [effectiveStages]
  );

  const childrenByParentId = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};
    for (const ticket of projectTickets) {
      if (!ticket.dependency_ticket_id) continue;
      if (!grouped[ticket.dependency_ticket_id]) grouped[ticket.dependency_ticket_id] = [];
      grouped[ticket.dependency_ticket_id].push(ticket);
    }
    return grouped;
  }, [projectTickets]);

  const findStageByStatus = useCallback(
    (status: Ticket['status']) =>
      effectiveStages.find((stage) => stage.status === status) ?? effectiveStages[0],
    [effectiveStages]
  );

  const resolveTicketStage = useCallback(
    (ticket: Ticket) => {
      const mapped = ticketStageMap[ticket.id];
      if (mapped) {
        const stage = effectiveStages.find((entry) => entry.id === mapped);
        if (stage) return stage;
      }
      return findStageByStatus(ticket.status);
    },
    [findStageByStatus, effectiveStages, ticketStageMap]
  );

  useEffect(() => {
    if (!selectedProject?.id) return;
    if (typeof window === 'undefined') return;
    setHydratedProjectId(null);

    const storedStages = window.localStorage.getItem(`project-stages:${selectedProject.id}`);
    const storedMap = window.localStorage.getItem(`project-stage-map:${selectedProject.id}`);

    if (storedStages) {
      try {
        const parsed = JSON.parse(storedStages) as StageConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStages(parsed);
        } else {
          setStages(DEFAULT_STAGES);
        }
      } catch {
        setStages(DEFAULT_STAGES);
      }
    } else {
      setStages(DEFAULT_STAGES);
    }

    if (storedMap) {
      try {
        const parsed = JSON.parse(storedMap) as Record<string, string>;
        setTicketStageMap(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        setTicketStageMap({});
      }
    } else {
      setTicketStageMap({});
    }

    setHydratedProjectId(selectedProject.id);
  }, [selectedProject?.id]);

  useEffect(() => {
    if (!selectedProject?.id) return;
    if (hydratedProjectId !== selectedProject.id) return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`project-stages:${selectedProject.id}`, JSON.stringify(stages));
  }, [hydratedProjectId, selectedProject?.id, stages]);

  useEffect(() => {
    if (!selectedProject?.id) return;
    if (hydratedProjectId !== selectedProject.id) return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      `project-stage-map:${selectedProject.id}`,
      JSON.stringify(ticketStageMap)
    );
  }, [hydratedProjectId, selectedProject?.id, ticketStageMap]);

  useEffect(() => {
    setTicketStageMap((prev) => {
      const validTicketIds = new Set(projectTickets.map((ticket) => ticket.id));
      const validStageIds = new Set(effectiveStages.map((stage) => stage.id));
      const next: Record<string, string> = {};

      for (const [ticketId, stageId] of Object.entries(prev)) {
        if (!validTicketIds.has(ticketId)) continue;
        if (!validStageIds.has(stageId)) continue;
        next[ticketId] = stageId;
      }

      for (const ticket of projectTickets) {
        if (next[ticket.id]) continue;
        const fallbackStage =
          effectiveStages.find((stage) => stage.status === ticket.status) ?? effectiveStages[0];
        if (fallbackStage) {
          next[ticket.id] = fallbackStage.id;
        }
      }

      const changed =
        Object.keys(next).length !== Object.keys(prev).length ||
        Object.entries(next).some(([ticketId, stageId]) => prev[ticketId] !== stageId);

      return changed ? next : prev;
    });
  }, [projectTickets, effectiveStages]);

  function toggleExpanded(ticketId: string) {
    setExpandedTicketIds((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  }

  async function handleCreateChildTicket() {
    if (!ticketToEdit || !selectedProject) return;
    if (!newChildDraft.title.trim()) return;

    setSavingTicketId(ticketToEdit.id);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChildDraft.title.trim(),
          description: '',
          assignee: null,
          status: effectiveStages[0]?.status ?? 'backlog',
          parentTicketId: ticketToEdit.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create child ticket');
      }

      setNewChildDraft({ title: '' });
      setIsAddingSubtask(false);
      setExpandedTicketIds((prev) => ({ ...prev, [ticketToEdit.id]: true }));
      await onRefresh();
      showToast('Subtask created', 'success');
    } finally {
      setSavingTicketId(null);
    }
  }

  async function handleConfirmRelocateStageDelete() {
    if (!stageToDelete) return;
    if (!relocateStageId) {
      window.alert('Please select a destination stage.');
      return;
    }

    setSavingTicketId(stageToDelete.id);
    try {
      await removeStageKeepTickets(stageToDelete.id, relocateStageId);
      setIsRelocateStageDialogOpen(false);
      setStageToDelete(null);
      setRelocateStageId('');
      showToast('Stage deleted', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete stage';
      window.alert(message);
    } finally {
      setSavingTicketId(null);
    }
  }

  async function moveTicketToStage(
    ticketId: string,
    stage: StageConfig,
    skipRefresh = false
  ): Promise<boolean> {
    const ticket = projectTickets.find((entry) => entry.id === ticketId);
    if (!ticket) return false;

    let moved = true;
    if (ticket.status !== stage.status) {
      let res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: stage.status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 422 && data?.error === 'hard_blocked') {
          // Show blocker modal instead of alert
          const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
            ...b,
            title: projectTickets.find((t) => t.id === b.depends_on)?.title,
          }));
          setBlockerModalData({
            message: data?.message || 'Blocked by unresolved hard dependencies.',
            blockers: blockersWithTitles,
            isHardBlock: true,
            onRevert: () => {
              setBlockerModalOpen(false);
              // Reload to restore original state
              onRefresh?.();
            },
            onProceed: () => {
              setBlockerModalOpen(false);
            },
          });
          setBlockerModalOpen(true);
          moved = false;
        } else if (res.status === 422 && data?.error === 'soft_blocked') {
          const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
            ...b,
            title: projectTickets.find((t) => t.id === b.depends_on)?.title,
          }));
          setBlockerModalData({
            message: data?.message || 'Unresolved soft dependencies.',
            blockers: blockersWithTitles,
            isHardBlock: false,
            onRevert: () => {
              setBlockerModalOpen(false);
              onRefresh?.();
            },
            onProceed: async () => {
              setBlockerModalOpen(false);
              const bypassRes = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: stage.status, bypassGate: true }),
              });
              if (bypassRes.ok) {
                await onRefresh?.();
              } else if (bypassRes.status === 422) {
                const errData = await bypassRes.json().catch(() => ({}));
                const bwt = (errData?.blockers || []).map((b: any) => ({
                  ...b,
                  title: projectTickets.find((t) => t.id === b.depends_on)?.title,
                }));
                setBlockerModalData({
                  message: errData?.message || 'Blocked by unresolved hard dependencies.',
                  blockers: bwt,
                  isHardBlock: true,
                  onRevert: () => {
                    setBlockerModalOpen(false);
                    onRefresh?.();
                  },
                });
                setBlockerModalOpen(true);
              }
            },
          });
          setBlockerModalOpen(true);
          moved = false;
        } else {
          moved = false;
        }
      }
    }

    if (!moved) return false;

    setTicketStageMap((prev) => ({
      ...prev,
      [ticketId]: stage.id,
    }));

    if (!skipRefresh) {
      await onRefresh();
    }
    return true;
  }

  function openAddStageDialog() {
    setStageForm({
      id: null,
      label: '',
      color: '#64748b',
      stageType: 'backlog',
    });
    setIsAddingStageInline(true);
  }

  function openEditStageDialog(stage: StageConfig) {
    const systemStatuses = ['backlog', 'in_progress', 'done', 'blocked'];
    const currentType = systemStatuses.includes(stage.status)
      ? (stage.status as 'backlog' | 'in_progress' | 'done' | 'blocked')
      : 'backlog';
    setStageForm({
      id: stage.id,
      label: stage.label,
      color: stage.color,
      stageType: currentType,
    });
    setIsStageDialogOpen(true);
  }

  function saveStageDetails() {
    const label = stageForm.label.trim();
    if (!label) return;

    if (stageForm.id) {
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === stageForm.id
            ? {
                ...stage,
                label,
                color: stageForm.color,
                status: stageForm.stageType,
              }
            : stage
        )
      );
    } else {
      setStages((prev) => [
        ...prev,
        {
          id: `stage-${Date.now().toString(36)}`,
          label,
          color: stageForm.color,
          status: stageForm.stageType,
        },
      ]);
    }

    setIsStageDialogOpen(false);
    setIsAddingStageInline(false);
  }

  async function promptDeleteStage(stage: StageConfig) {
    const ticketsInStage = projectTickets.filter(
      (ticket) => resolveTicketStage(ticket).id === stage.id
    );

    if (ticketsInStage.length > 0) {
      const ticketIdsInStage = new Set(ticketsInStage.map((t) => t.id));
      try {
        const depRes = await fetch(`/api/projects/${selectedProject?.id}/dependencies`);
        if (depRes.ok) {
          const depData = await depRes.json();
          const deps: {
            id: string;
            ticket_id: string;
            depends_on_ticket_id: string;
            dependency_type: string;
            strength: string;
          }[] = depData.dependencies ?? [];
          const violating = deps.filter(
            (d) => ticketIdsInStage.has(d.ticket_id) || ticketIdsInStage.has(d.depends_on_ticket_id)
          );
          if (violating.length > 0) {
            const ticketTitles = new Map(projectTickets.map((t) => [t.id, t.title]));
            setBlockerModalData({
              message: `Cannot delete "${stage.label}" — ${violating.length} ticket${violating.length === 1 ? '' : 's'} in this column have active dependencies. Remove or reassign dependencies first.`,
              blockers: violating.map((d) => {
                const inStage = ticketIdsInStage.has(d.ticket_id)
                  ? d.ticket_id
                  : d.depends_on_ticket_id;
                const other = inStage === d.ticket_id ? d.depends_on_ticket_id : d.ticket_id;
                return {
                  id: inStage,
                  depends_on: other,
                  type: d.dependency_type,
                  title: ticketTitles.get(other) ?? other,
                };
              }),
              isHardBlock: true,
              onRevert: () => setBlockerModalOpen(false),
              onProceed: () => setBlockerModalOpen(false),
            });
            setBlockerModalOpen(true);
            return;
          }
        }
      } catch {
        // If dependency check fails, fall through to normal flow
      }
    }

    if (ticketsInStage.length === 0) {
      setSavingTicketId(stage.id);
      try {
        await removeStageWithTickets(stage.id);
        showToast('Stage deleted', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete stage';
        setBlockerModalData({
          message,
          blockers: [],
          isHardBlock: false,
          onRevert: () => {
            setBlockerModalOpen(false);
          },
          onProceed: () => {
            setBlockerModalOpen(false);
          },
        });
        setBlockerModalOpen(true);
      } finally {
        setSavingTicketId(null);
      }
      return;
    }

    const fallback = effectiveStages.find((entry) => entry.id !== stage.id);
    setRelocateStageId(fallback?.id ?? '');
    setIsRelocateStageDialogOpen(false);
    setStageToDelete(stage);
    setIsDeleteStageDialogOpen(true);
  }

  async function removeStageKeepTickets(stageId: string, targetStageId: string) {
    const stage = effectiveStages.find((entry) => entry.id === stageId);
    const fallback = effectiveStages.find((entry) => entry.id === targetStageId);
    if (!stage || !fallback || effectiveStages.length <= 1) return;
    if (stage.id === fallback.id) return;

    const ticketsInStage = projectTickets.filter(
      (ticket) => resolveTicketStage(ticket).id === stageId
    );
    for (const ticket of ticketsInStage) {
      await moveTicketToStage(ticket.id, fallback, true);
    }

    setStages((prev) => prev.filter((entry) => entry.id !== stageId));
    setTicketStageMap((prev) => {
      const next = { ...prev };
      for (const [ticketId, mappedStageId] of Object.entries(next)) {
        if (mappedStageId === stageId) next[ticketId] = fallback.id;
      }
      return next;
    });

    await onRefresh();
  }

  async function removeStageWithTickets(stageId: string) {
    const ticketsInStage = projectTickets.filter(
      (ticket) => resolveTicketStage(ticket).id === stageId
    );

    for (const ticket of ticketsInStage) {
      const res = await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete stage tickets');
      }
    }

    setStages((prev) => prev.filter((entry) => entry.id !== stageId));
    setTicketStageMap((prev) => {
      const next = { ...prev };
      for (const ticket of ticketsInStage) {
        delete next[ticket.id];
      }
      return next;
    });

    await onRefresh();
  }

  async function handleDeleteStage(mode: 'keep_tickets' | 'delete_with_tickets') {
    if (!stageToDelete) return;

    if (mode === 'keep_tickets') {
      setIsDeleteStageDialogOpen(false);
      setIsRelocateStageDialogOpen(true);
      return;
    }

    setSavingTicketId(stageToDelete.id);
    try {
      await removeStageWithTickets(stageToDelete.id);
      setIsDeleteStageDialogOpen(false);
      setStageToDelete(null);
      setRelocateStageId('');
      showToast('Stage and tickets deleted', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete stage';
      setBlockerModalData({
        message,
        blockers: [],
        isHardBlock: false,
        onRevert: () => {
          setBlockerModalOpen(false);
        },
        onProceed: () => {
          setBlockerModalOpen(false);
        },
      });
      setBlockerModalOpen(true);
    } finally {
      setSavingTicketId(null);
    }
  }

  function moveStageByDrop(sourceStageId: string, targetStageId: string) {
    setStages((prev) => {
      const sourceIdx = prev.findIndex((stage) => stage.id === sourceStageId);
      const targetIdx = prev.findIndex((stage) => stage.id === targetStageId);
      if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return prev;

      const next = [...prev];
      const [stage] = next.splice(sourceIdx, 1);
      next.splice(targetIdx, 0, stage);
      return next;
    });
  }

  function openTicketEditor(ticket: Ticket, pushCurrent = false) {
    if (pushCurrent && ticketToEdit) {
      setTicketEditorHistory((prev) => [...prev, ticketToEdit]);
    } else {
      setTicketEditorHistory([]);
    }

    setTicketToEdit(ticket);
    setTicketEditForm({
      title: ticket.title,
      description: ticket.description || '',
      assignee:
        ticket.assignee_user_id && ticket.assignee
          ? { userId: ticket.assignee_user_id, displayName: ticket.assignee }
          : null,
      status: ticket.status,
      start_date: ticket.start_date || '',
      due_date: ticket.due_date || '',
      deadline_time: ticket.deadline_time || '',
    });
    setMetaPriority(ticket.priority ?? 'none');
    setMetaType(ticket.type ?? 'task');
    setMetaEstimate(ticket.estimate ?? 'none');
    setMetaTimeEstimate(ticket.timeEstimate ?? null);
    setMetaTimeSpent(ticket.timeSpent ?? null);
    setMetaLabels(ticket.labels ?? []);
    setMetaMilestoneId(ticket.milestoneId ?? null);
    setMetaSprintId(ticket.sprintId ?? null);
    setMetaIsGroup(ticket.isGroup ?? false);
    setNewChildDraft({
      title: '',
    });
    setTicketEditTab('details');
    setIsAddingSubtask(false);
  }

  function goBackTicketEditor() {
    const previous = ticketEditorHistory[ticketEditorHistory.length - 1];
    if (!previous) return;

    setTicketEditorHistory((prev) => prev.slice(0, -1));
    setTicketToEdit(previous);
    setTicketEditForm({
      title: previous.title,
      description: previous.description || '',
      assignee:
        previous.assignee_user_id && previous.assignee
          ? { userId: previous.assignee_user_id, displayName: previous.assignee }
          : null,
      status: previous.status,
      start_date: previous.start_date || '',
      due_date: previous.due_date || '',
      deadline_time: previous.deadline_time || '',
    });
    setMetaPriority(previous.priority ?? 'none');
    setMetaType(previous.type ?? 'task');
    setMetaEstimate(previous.estimate ?? 'none');
    setMetaTimeEstimate(previous.timeEstimate ?? null);
    setMetaTimeSpent(previous.timeSpent ?? null);
    setMetaLabels(previous.labels ?? []);
    setMetaMilestoneId(previous.milestoneId ?? null);
    setMetaSprintId(previous.sprintId ?? null);
    setMetaIsGroup(previous.isGroup ?? false);
    setNewChildDraft({ title: '' });
    setTicketEditTab('details');
    setIsAddingSubtask(false);
  }

  function closeTicketEditor() {
    setTicketToEdit(null);
    setTicketEditorHistory([]);
    setIsAddingSubtask(false);
  }

  async function handleSaveTicketEdit() {
    if (!ticketToEdit) return;

    setSavingTicketId(ticketToEdit.id);
    try {
      let res = await fetch(`/api/tickets/${ticketToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketEditForm.title.trim(),
          description: ticketEditForm.description.trim(),
          assignee: ticketEditForm.assignee?.displayName ?? null,
          assigneeUserId: ticketEditForm.assignee?.userId ?? null,
          status: ticketEditForm.status,
          start_date: ticketEditForm.start_date || null,
          due_date: ticketEditForm.due_date || null,
          deadline_time: ticketEditForm.deadline_time || null,
          priority: metaPriority,
          type: metaType,
          estimate: metaEstimate,
          labels: metaLabels,
          milestoneId: metaMilestoneId,
          sprintId: metaSprintId,
          timeEstimate: metaTimeEstimate,
          timeSpent: metaTimeSpent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 422 && data?.error === 'soft_blocked') {
          const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
            ...b,
            title: projectTickets.find((t) => t.id === b.depends_on)?.title,
          }));
          setBlockerModalData({
            message: data?.message || 'This move has unresolved soft dependencies.',
            blockers: blockersWithTitles,
            isHardBlock: false,
            onRevert: () => {
              setBlockerModalOpen(false);
              setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
            },
            onProceed: async () => {
              setBlockerModalOpen(false);
              const bypassRes = await fetch(`/api/tickets/${ticketToEdit.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: ticketEditForm.title.trim(),
                  description: ticketEditForm.description.trim(),
                  assignee: ticketEditForm.assignee?.displayName ?? null,
                  assigneeUserId: ticketEditForm.assignee?.userId ?? null,
                  status: ticketEditForm.status,
                  start_date: ticketEditForm.start_date || null,
                  due_date: ticketEditForm.due_date || null,
                  deadline_time: ticketEditForm.deadline_time || null,
                  priority: metaPriority,
                  type: metaType,
                  estimate: metaEstimate,
                  labels: metaLabels,
                  milestoneId: metaMilestoneId,
                  sprintId: metaSprintId,
                  bypassGate: true,
                }),
              });
              if (bypassRes.ok) {
                await onRefresh?.();
              } else if (bypassRes.status === 422) {
                const errData = await bypassRes.json().catch(() => ({}));
                const bwt = (errData?.blockers || []).map((b: any) => ({
                  ...b,
                  title: projectTickets.find((t) => t.id === b.depends_on)?.title,
                }));
                setBlockerModalData({
                  message: errData?.message || 'Blocked by unresolved hard dependencies.',
                  blockers: bwt,
                  isHardBlock: true,
                  onRevert: () => {
                    setBlockerModalOpen(false);
                    setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
                  },
                });
                setBlockerModalOpen(true);
              }
            },
          });
          setBlockerModalOpen(true);
          return;
        }

        if (!res.ok) {
          if (res.status === 422 && data?.error === 'hard_blocked') {
            const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
              ...b,
              title: projectTickets.find((t) => t.id === b.depends_on)?.title,
            }));
            setBlockerModalData({
              message: data?.message || 'Blocked by unresolved hard dependencies.',
              blockers: blockersWithTitles,
              isHardBlock: true,
              onRevert: () => {
                setBlockerModalOpen(false);
                setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
              },
            });
            setBlockerModalOpen(true);
            return;
          }
          if (res.status === 422 && data?.error === 'soft_blocked') {
            const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
              ...b,
              title: projectTickets.find((t) => t.id === b.depends_on)?.title,
            }));
            setBlockerModalData({
              message: data?.message || 'Blocked by unresolved soft dependencies.',
              blockers: blockersWithTitles,
              isHardBlock: false,
              onRevert: () => {
                setBlockerModalOpen(false);
                setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
              },
              onProceed: async () => {
                setBlockerModalOpen(false);
                const bypassRes = await fetch(`/api/tickets/${ticketToEdit.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: ticketEditForm.title.trim(),
                    description: ticketEditForm.description.trim(),
                    assignee: ticketEditForm.assignee?.displayName ?? null,
                    assigneeUserId: ticketEditForm.assignee?.userId ?? null,
                    status: ticketEditForm.status,
                    start_date: ticketEditForm.start_date || null,
                    due_date: ticketEditForm.due_date || null,
                    deadline_time: ticketEditForm.deadline_time || null,
                    priority: metaPriority,
                    type: metaType,
                    estimate: metaEstimate,
                    labels: metaLabels,
                    milestoneId: metaMilestoneId,
                    sprintId: metaSprintId,
                    bypassGate: true,
                  }),
                });
                if (bypassRes.ok) {
                  await onRefresh?.();
                } else if (bypassRes.status === 422) {
                  const errData = await bypassRes.json().catch(() => ({}));
                  const bwt = (errData?.blockers || []).map((b: any) => ({
                    ...b,
                    title: projectTickets.find((t) => t.id === b.depends_on)?.title,
                  }));
                  setBlockerModalData({
                    message: errData?.message || 'Blocked by unresolved hard dependencies.',
                    blockers: bwt,
                    isHardBlock: true,
                    onRevert: () => {
                      setBlockerModalOpen(false);
                      setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
                    },
                  });
                  setBlockerModalOpen(true);
                }
              },
            });
            setBlockerModalOpen(true);
            return;
          }
          console.error('Ticket update failed:', data);
          showToast(data?.error || `Save failed (${res.status})`, 'error');
          return;
        }
      }

      const matchingStage =
        effectiveStages.find((stage) => stage.status === ticketEditForm.status) ??
        effectiveStages[0];
      if (matchingStage) {
        setTicketStageMap((prev) => ({
          ...prev,
          [ticketToEdit.id]: matchingStage.id,
        }));
      }

      const isSubtask = Boolean(ticketToEdit.dependency_ticket_id);
      if (!isSubtask) {
        closeTicketEditor();
      }
      await onRefresh();
      showToast('Ticket saved successfully', 'success');
    } finally {
      setSavingTicketId(null);
    }
  }

  function promptDeleteTicket(ticket: Ticket) {
    const subtasks = childrenByParentId[ticket.id] ?? [];
    setTicketToDelete(ticket);
    setDeleteMode(subtasks.length > 0 ? 'confirm' : null);
    setSubtaskReassignTargetId('');
  }

  async function handleDeleteTicket(mode: 'delete_all' | 'reassign' | 'simple') {
    if (!ticketToDelete) return;

    setSavingTicketId(ticketToDelete.id);
    try {
      const subtasks = childrenByParentId[ticketToDelete.id] ?? [];

      if (mode === 'reassign' && subtaskReassignTargetId) {
        // Re-parent all subtasks to the chosen ticket
        await Promise.all(
          subtasks.map((child) =>
            fetch(`/api/tickets/${child.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dependencyTicketId: subtaskReassignTargetId }),
            })
          )
        );
      } else if (mode === 'delete_all') {
        // Delete all subtasks first
        await Promise.all(
          subtasks.map((child) => fetch(`/api/tickets/${child.id}`, { method: 'DELETE' }))
        );
        setTicketStageMap((prev) => {
          const next = { ...prev };
          for (const child of subtasks) delete next[child.id];
          return next;
        });
      }

      // Delete the parent ticket
      const res = await fetch(`/api/tickets/${ticketToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete ticket');
      }

      setTicketStageMap((prev) => {
        const next = { ...prev };
        delete next[ticketToDelete.id];
        return next;
      });
      setTicketToDelete(null);
      setDeleteMode(null);
      setSubtaskReassignTargetId('');
      await onRefresh();
      showToast('Ticket deleted', 'success');
    } finally {
      setSavingTicketId(null);
    }
  }

  async function handleKanbanDrop(ticketId: string, stageId: string) {
    const stage = effectiveStages.find((entry) => entry.id === stageId);
    if (!stage) return;
    const ticket = projectTickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === stage.status) return;

    // Optimistically update local state so the UI feels instant
    setOptimisticTicketOverrides((prev) => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], status: stage.status },
    }));

    const moved = await moveTicketToStage(ticketId, stage, true);

    // Clear optimistic override — onRefresh will bring server truth
    setOptimisticTicketOverrides((prev) => {
      const next = { ...prev };
      delete next[ticketId];
      return next;
    });

    if (moved) {
      await onRefresh?.();
    } else {
      await onRefresh?.();
    }
  }

  async function handleRenameProject() {
    if (!selectedProject) return;
    const nextName = projectNameDraft.trim();
    if (!nextName) return;

    setIsSavingProject(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update project');
      }

      if (onProjectsRefresh) {
        await onProjectsRefresh();
      } else {
        await onRefresh();
      }
      setIsRenameProjectOpen(false);
      showToast('Project updated', 'success');
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleSaveProjectSettings() {
    if (!selectedProject) return;

    setSavingProjectSettings(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectNameDraft.trim(),
          context: projectContextDraft.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update project');
      }

      if (onProjectsRefresh) {
        await onProjectsRefresh();
      } else {
        await onRefresh();
      }
      showToast('Project settings saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingProjectSettings(false);
    }
  }

  const { on, off } = useSse();

  useEffect(() => {
    if (!selectedProject) return;
    setProjectNameDraft(selectedProject.name);
    setProjectContextDraft(selectedProject.context || '');
  }, [selectedProject?.id]);

  useEffect(() => {
    if (selectedProjectId) fetchProjectMembers(selectedProjectId);
    else setProjectMembers([]);
  }, [selectedProjectId, fetchProjectMembers]);

  useEffect(() => {
    if (selectedProjectId) fetchMilestones(selectedProjectId);
    else setMilestones([]);
  }, [selectedProjectId, fetchMilestones]);

  useEffect(() => {
    if (selectedProjectId) fetchDeletedActivities(selectedProjectId);
    else setDeletedActivities([]);
  }, [selectedProjectId, fetchDeletedActivities]);

  useEffect(() => {
    if (selectedProjectId) fetchSprints(selectedProjectId);
    else setSprints([]);
  }, [selectedProjectId, fetchSprints]);

  useEffect(() => {
    if (!preferredTab) return;
    setProjectTab(preferredTab);
  }, [preferredTab]);

  // Fetch labels
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/labels');
        if (res.ok) {
          const data = await res.json();
          const labelArr: Label[] = data.labels ?? [];
          setLabels(labelArr);
          const map: Record<string, { name: string; color: string }> = {};
          for (const l of labelArr) map[l.id] = { name: l.name, color: l.color };
          setLabelMap(map);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Keyboard shortcuts: cmd+B for bulk
  // cmd+K is handled by DynamicIslandSearch globally
  // Listen for command events from the global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        setBulkMode((v) => {
          if (v) setSelectedIds(new Set());
          return !v;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listen for command events from global search
  useEffect(() => {
    const unsubs = [
      onCommand('filter:open-dialog', () => setFilterDialogOpen(true)),
      onCommand('filter:priority', (p) =>
        setFilters((prev) => ({ ...prev, priority: p as TicketPriority }))
      ),
      onCommand('filter:type', (t) => setFilters((prev) => ({ ...prev, type: t as TicketType }))),
      onCommand('filter:status', (s) => setFilters((prev) => ({ ...prev, status: s as string }))),
      onCommand('filter:assignee', (a) =>
        setFilters((prev) => ({ ...prev, assignee: a as 'all' | 'mine' | 'unassigned' }))
      ),
      onCommand('filter:dueDate', (d) =>
        setFilters((prev) => ({
          ...prev,
          dueDate: d as 'all' | 'overdue' | 'today' | 'this_week' | 'none',
        }))
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Real-time refresh via SSE
  useEffect(() => {
    const handleProjectsRefresh = () => {
      void onProjectsRefresh?.();
    };

    const handleWorkspaceRefresh = () => {
      void onRefresh();
    };

    // Project events — refresh project list
    on('project_created', handleProjectsRefresh);
    on('project_updated', handleProjectsRefresh);
    on('project_deleted', handleProjectsRefresh);

    // Meeting events — refresh workspace (meetings + tickets)
    if (selectedProject) {
      on('meeting_status_changed', handleWorkspaceRefresh);
      on('meeting_ready', handleWorkspaceRefresh);
      on('meeting_failed', handleWorkspaceRefresh);
    }

    // Ticket events — refresh workspace if ticket belongs to current project
    const handleTicketUpdated = (data: Record<string, unknown>) => {
      const eventProjectId = data.projectId as string | null | undefined;
      if (!eventProjectId || eventProjectId === selectedProjectId) {
        void onRefresh();
        if (selectedProjectId) {
          void fetchSprints(selectedProjectId);
          void fetchMilestones(selectedProjectId);
        }
      }
    };
    const handleTicketCreated = (data: Record<string, unknown>) => {
      const eventProjectId = data.projectId as string | null | undefined;
      if (!eventProjectId || eventProjectId === selectedProjectId) {
        void onRefresh();
        if (selectedProjectId) {
          void fetchSprints(selectedProjectId);
          void fetchMilestones(selectedProjectId);
        }
      }
    };
    const handleTicketDeleted = (data: Record<string, unknown>) => {
      const eventProjectId = data.projectId as string | null | undefined;
      if (!eventProjectId || eventProjectId === selectedProjectId) {
        void onRefresh();
        if (selectedProjectId) {
          void fetchSprints(selectedProjectId);
          void fetchMilestones(selectedProjectId);
          void fetchDeletedActivities(selectedProjectId);
        }
      }
    };

    on('ticket_updated', handleTicketUpdated);
    on('ticket_created', handleTicketCreated);
    on('ticket_deleted', handleTicketDeleted);

    return () => {
      off('project_created', handleProjectsRefresh);
      off('project_updated', handleProjectsRefresh);
      off('project_deleted', handleProjectsRefresh);
      off('meeting_status_changed', handleWorkspaceRefresh);
      off('meeting_ready', handleWorkspaceRefresh);
      off('meeting_failed', handleWorkspaceRefresh);
      off('ticket_updated', handleTicketUpdated);
      off('ticket_created', handleTicketCreated);
      off('ticket_deleted', handleTicketDeleted);
    };
  }, [on, off, onRefresh, onProjectsRefresh, selectedProject, selectedProjectId]);

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
              </div>
              <h1 className="text-4xl font-playfair font-bold text-foreground">Your projects</h1>
              <p className="text-muted-foreground mt-2">
                Create a workspace, link meetings, and write tickets like Jira.
              </p>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-foreground mb-3">
              You don't have a project
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first project to start organizing meetings and tickets.
            </p>
            {isAdmin && (
              <Button onClick={onCreateProject} className="rounded-full gap-2 px-6">
                <Plus className="h-4 w-4" />
                Create project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectTicketCount = tickets.filter(
                (ticket) => ticket.projectId === project.id
              ).length;
              const projectMeetingCount = meetings.filter(
                (meeting) => meeting.projectId === project.id
              ).length;

              return (
                <Card
                  key={project.id}
                  className="cursor-pointer border-border bg-muted/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                  onClick={() => onSelectProject(project.id)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-playfair text-xl text-foreground">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm text-muted-foreground">
                          {project.repo}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border border-primary/10">
                        {projectMeetingCount} meetings
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.25rem]">
                      {project.context || 'No project context yet.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{projectTicketCount} tickets</span>
                      <span>{project.files.length} files</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      Open project <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const allTabs: { id: ProjectTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = (
    [
      { id: 'tickets', label: 'Tickets', icon: <Ticket className="h-4 w-4" /> },
      { id: 'meetings', label: 'Meetings', icon: <Calendar className="h-4 w-4" /> },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      { id: 'dependencies', label: 'Dependencies', icon: <GitBranch className="h-4 w-4" /> },
      { id: 'roadmap', label: 'Future Viz', icon: <Milestone className="h-4 w-4" /> },
      { id: 'sprint-stones', label: 'Sprint-stones', icon: <Zap className="h-4 w-4" /> },
      { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" />, adminOnly: true },
    ] as { id: ProjectTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[]
  );
  const tabs = allTabs.filter((t) => !t.adminOnly || isAdmin);

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; icon: React.ReactNode }
  > = {
    backlog: {
      label: 'Backlog',
      color: '#8a8a80',
      bg: '#f3f3f0',
      icon: <Circle className="h-3 w-3" />,
    },
    in_progress: {
      label: 'In Progress',
      color: '#3d7abf',
      bg: '#eff5ff',
      icon: <Clock className="h-3 w-3" />,
    },
    done: {
      label: 'Done',
      color: '#3d8a5e',
      bg: '#edf7f1',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    blocked: {
      label: 'Blocked',
      color: '#b84040',
      bg: '#fdf0f0',
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  function getStatusConfig(status: string) {
    return (
      statusConfig[status] ?? {
        label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        color: '#64748b',
        bg: '#f1f5f9',
        icon: <Circle className="h-3 w-3" />,
      }
    );
  }

  function renderChildTicketTree(ticket: Ticket, depth = 0): React.ReactNode {
    const children = childrenByParentId[ticket.id] ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedTicketIds[ticket.id] ?? depth < 1;
    const isDone = ticket.status === 'done';

    return (
      <div key={ticket.id} className="space-y-0">
        <div
          className="group flex items-center gap-2 border-t border-border/60 px-2 py-2"
          style={{ paddingLeft: `${8 + Math.min(depth, 4) * 18}px` }}
        >
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}

          <button
            type="button"
            onClick={() => openTicketEditor(ticket, true)}
            className="min-w-0 flex-1 truncate text-left text-sm text-foreground hover:underline"
          >
            {ticket.title}
          </button>

          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpanded(ticket.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={() => openTicketEditor(ticket, true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
            onClick={() => promptDeleteTicket(ticket)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {hasChildren && isExpanded && (
          <div>{children.map((child) => renderChildTicketTree(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: back + project name + project nav/actions */}
      <div className="border-b border-border bg-background px-6 lg:px-8 flex flex-col gap-0">
        {/* Row 1: back + title */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectProject('')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Projects
            </button>
            <span className="text-muted-foreground/40">/</span>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-4 w-4 text-primary" />
              </div>
              {(() => {
                const statusColors: Record<string, string> = {
                  on_track: 'bg-green-500',
                  at_risk: 'bg-yellow-500',
                  off_track: 'bg-red-500',
                  paused: 'bg-gray-400',
                };
                const statusLabels: Record<string, string> = {
                  on_track: 'On Track',
                  at_risk: 'At Risk',
                  off_track: 'Off Track',
                  paused: 'Paused',
                };
                const s = selectedProject.status ?? 'on_track';
                return (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusColors[s] ?? statusColors.on_track}`}
                    title={statusLabels[s] ?? 'On Track'}
                  />
                );
              })()}
              <h1 className="font-playfair text-xl font-bold text-foreground">
                {selectedProject.name}
              </h1>
              {selectedProject.leadUserId &&
                (() => {
                  const leadMember = projectMembers.find(
                    (pm) => pm.user_id === selectedProject.leadUserId
                  );
                  const orgM = (memberships?.data ?? []).find(
                    (m) => m.publicUserData?.userId === selectedProject.leadUserId
                  );
                  const leadName = orgM
                    ? [orgM.publicUserData?.firstName, orgM.publicUserData?.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      orgM.publicUserData?.identifier ||
                      'Lead'
                    : (leadMember?.user_id ?? 'Lead');
                  const leadImg = orgM?.publicUserData?.imageUrl;
                  return (
                    <div className="flex items-center gap-1.5 ml-1">
                      {leadImg ? (
                        <img
                          src={leadImg}
                          alt={leadName}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                          {leadName[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{leadName}</span>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>

        {/* Row 2: tab bar + actions */}
        <div className="flex items-center gap-3 -mb-px">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setProjectTab(tab.id);
                  onTabChange?.(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  projectTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  <SlidersHorizontal className="h-4 w-4" />
                  Options
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
                <DropdownMenuItem
                  onClick={() => {
                    setProjectNameDraft(selectedProject.name);
                    setIsRenameProjectOpen(true);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil className="h-4 w-4 text-primary" />
                  Change name
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setProjectTab('settings')}
                  className="gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-primary" />
                  Project settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsImportDialogOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-primary" />
                  Import tickets from meeting
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={onCreateProject} className="gap-2 cursor-pointer">
                    <Plus className="h-4 w-4 text-primary" />
                    New project
                  </DropdownMenuItem>
                )}
                {isAdmin && <DropdownMenuSeparator />}
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => setProjectToDelete(selectedProject)}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6 lg:p-8 space-y-6">
        {/* ── MEETINGS tab ── */}
        {projectTab === 'meetings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold text-foreground">Meetings</h2>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5 mr-1">
                  <button
                    onClick={() => setMeetingsViewMode('list')}
                    className={cn(
                      'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
                      meetingsViewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => setMeetingsViewMode('calendar')}
                    className={cn(
                      'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
                      meetingsViewMode === 'calendar'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Calendar
                  </button>
                </div>
                <Button onClick={() => setIsMeetingDialogOpen(true)} className="rounded-full gap-2">
                  <Video className="h-4 w-4" />
                  New meeting
                </Button>
              </div>
            </div>
            {meetingsViewMode === 'calendar' ? (
              <MeetingCalendar
                meetings={projectMeetings.map((m) => ({
                  id: m.id,
                  projectName: m.projectName,
                  date: m.date,
                  status: m.status,
                  platform: m.platform,
                }))}
                onSelectMeeting={onSelectMeeting}
              />
            ) : projectMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-2">No meetings yet</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Start a meeting to begin collecting tickets.
                </p>
                <Button onClick={() => setIsMeetingDialogOpen(true)} className="rounded-full gap-2">
                  <Video className="h-4 w-4" />
                  Start first meeting
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projectMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => onSelectMeeting(meeting.id)}
                    className="text-left rounded-2xl border border-border bg-muted/50 p-5 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-playfair text-lg font-bold text-foreground">
                        {meeting.projectName}
                      </p>
                      <Badge
                        className={
                          meeting.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : meeting.status === 'not_admitted'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-primary/10 text-primary'
                        }
                      >
                        {meeting.status === 'not_admitted' ? '!' : meeting.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {meeting.platform} • {new Date(meeting.date).toLocaleDateString()}
                    </p>
                    <p className="mt-3 text-xs text-primary font-medium">Open meeting →</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TICKETS tab (unified board + list) ── */}
        {projectTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-playfair text-2xl font-bold text-foreground">Tickets</h2>
              <button
                onClick={() => setToolbarOpen((v) => !v)}
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={toolbarOpen ? 'Hide toolbar' : 'Show toolbar'}
              >
                <Plus
                  className={`h-4 w-4 transition-transform duration-300 ${toolbarOpen ? 'rotate-45' : ''}`}
                />
              </button>
              <div
                className={`flex items-center justify-between flex-wrap gap-2 overflow-hidden transition-all duration-300 ${toolbarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
              >
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'mine', label: 'Mine' },
                      { key: 'unassigned', label: 'Unassigned' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setKanbanAssigneeFilter(key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        kanbanAssigneeFilter === key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <div className="w-px h-5 bg-border mx-1" />
                  <button
                    onClick={() => setTicketsViewMode('board')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      ticketsViewMode === 'board'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <KanbanSquare className="h-3.5 w-3.5" />
                    Board
                  </button>
                  <button
                    onClick={() => setTicketsViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      ticketsViewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => setTicketsViewMode('backlog')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      ticketsViewMode === 'backlog'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                    Backlog
                  </button>
                  <button
                    onClick={() => setTicketsViewMode('groups')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      ticketsViewMode === 'groups'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Groups
                  </button>
                  <div className="w-px h-5 bg-border mx-1" />
                  <button
                    onClick={() => setFilterDialogOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filters.status ||
                      filters.priority ||
                      filters.type ||
                      filters.estimate ||
                      filters.labelIds.length > 0 ||
                      filters.assignee !== 'all' ||
                      filters.dueDate !== 'all'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Filter tickets"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filter
                  </button>
                  <button
                    onClick={() => {
                      setBulkMode((v) => {
                        if (v) setSelectedIds(new Set());
                        return !v;
                      });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      bulkMode
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Toggle bulk select (⌘B)"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Bulk
                  </button>
                  <button
                    onClick={() => setLabelManagerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Labels
                  </button>
                  <div className="w-px h-5 bg-border mx-1" />
                  <button
                    onClick={() => {
                      if (effectiveStages.length === 0) return;
                      setNewTicketStatus(undefined);
                      setIsTicketDialogOpen(true);
                    }}
                    disabled={effectiveStages.length === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${effectiveStages.length === 0 ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    New ticket
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk action bar */}
            {bulkMode && (
              <BulkActionBar
                selectedIds={[...selectedIds]}
                totalCount={rootProjectTickets.length}
                onSelectAll={() => setSelectedIds(new Set(rootProjectTickets.map((t) => t.id)))}
                onClear={() => setSelectedIds(new Set())}
                statuses={effectiveStages.map((s) => ({ key: s.status, label: s.label }))}
                onBulkUpdate={async (updates) => {
                  const ids = [...selectedIds];
                  if (ids.length === 0) return;
                  await fetch('/api/tickets/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketIds: ids, ...updates }),
                  });
                  setSelectedIds(new Set());
                  await onRefresh?.();
                }}
                labels={labels}
                onBulkDelete={async () => {
                  const ids = [...selectedIds];
                  if (ids.length === 0) return;
                  await Promise.all(
                    ids.map((id) => fetch(`/api/tickets/${id}`, { method: 'DELETE' }))
                  );
                  setSelectedIds(new Set());
                  await onRefresh?.();
                  if (selectedProjectId) {
                    await Promise.all([
                      fetchSprints(selectedProjectId),
                      fetchMilestones(selectedProjectId),
                    ]);
                  }
                }}
              />
            )}

            <div className="mt-2">
              {effectiveStages.length === 0 &&
              projectTickets.filter((t) => !t.dependency_ticket_id).length === 0 ? (
                isAddingStageInline ? (
                  <div className="rounded-2xl border-2 border-primary/40 bg-muted/40 p-6 max-w-md mx-auto space-y-4">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Create your board</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add columns for your board. Tickets will be organized into these columns.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Column name
                        </label>
                        <Input
                          value={stageForm.label}
                          onChange={(e) =>
                            setStageForm((prev) => ({ ...prev, label: e.target.value }))
                          }
                          placeholder="e.g. To Do, In Progress, Done"
                          className="bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveStageDetails();
                            }
                            if (e.key === 'Escape') {
                              setIsAddingStageInline(false);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Color
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            '#64748b',
                            '#3b82f6',
                            '#22c55e',
                            '#eab308',
                            '#f97316',
                            '#ef4444',
                            '#a855f7',
                            '#ec4899',
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setStageForm((prev) => ({ ...prev, color }))}
                              className={`w-6 h-6 rounded-full transition-transform ${
                                stageForm.color === color
                                  ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                  : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Set stage as
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(
                            [
                              { value: 'backlog', label: 'Backlog', color: '#f59e0b' },
                              { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                              { value: 'done', label: 'Done', color: '#10b981' },
                              { value: 'blocked', label: 'Blocked', color: '#ef4444' },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setStageForm((prev) => ({ ...prev, stageType: opt.value }))
                              }
                              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                                stageForm.stageType === opt.value
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-muted-foreground hover:bg-muted/50'
                              }`}
                            >
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                                style={{ backgroundColor: opt.color }}
                              />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={saveStageDetails}
                        disabled={!stageForm.label.trim()}
                        className="rounded-none"
                      >
                        Create column
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddingStageInline(false)}
                        className="rounded-none"
                      >
                        Cancel
                      </Button>
                    </div>
                    {effectiveStages.length > 0 && (
                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Columns created:</p>
                        <div className="flex flex-wrap gap-2">
                          {effectiveStages.map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs border border-border bg-background"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: s.color }}
                              />
                              {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-12 text-center">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-2">No board yet</p>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                      Create your board with columns before you add tickets. You can add more
                      columns later.
                    </p>
                    <Button
                      type="button"
                      onClick={openAddStageDialog}
                      className="rounded-none gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create board
                    </Button>
                  </div>
                )
              ) : ticketsViewMode === 'list' ? (
                <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                  <div className="grid grid-cols-[1fr_120px_120px_40px] items-center px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border/60 bg-muted/40">
                    <span>Title</span>
                    <span>Status</span>
                    <span>Assignee</span>
                    <span />
                  </div>
                  {rootProjectTickets.map((ticket, i) => {
                    const s = getStatusConfig(ticket.status);
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          if (bulkMode) {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(ticket.id)) next.delete(ticket.id);
                              else next.add(ticket.id);
                              return next;
                            });
                          }
                        }}
                        className={`grid grid-cols-[1fr_120px_120px_40px] items-center px-4 py-3 gap-2 hover:bg-muted/40 transition-colors ${i < rootProjectTickets.length - 1 ? 'border-b border-border/40' : ''} ${bulkMode ? 'cursor-pointer' : ''} ${selectedIds.has(ticket.id) ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {bulkMode && (
                            <span className="shrink-0">
                              {selectedIds.has(ticket.id) ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                          )}
                          <span className="font-medium text-sm text-foreground truncate">
                            {ticket.title}
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium w-fit"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {ticket.assignee ? `@${ticket.assignee}` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            if (bulkMode) return;
                            e.stopPropagation();
                            openTicketEditor(ticket);
                          }}
                          className={`text-xs text-primary hover:underline justify-self-end ${bulkMode ? 'pointer-events-none opacity-0' : ''}`}
                        >
                          Open
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setNewTicketStatus(undefined);
                      setIsTicketDialogOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add ticket
                  </button>
                </div>
              ) : ticketsViewMode === 'backlog' ? (
                <BacklogView
                  tickets={rootProjectTickets}
                  labelMap={labelMap}
                  onReorder={async (rankUpdates) => {
                    await fetch('/api/tickets/ranks', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ rankUpdates }),
                    });
                    await onRefresh?.();
                  }}
                  onTicketClick={(ticket) => {
                    const t = ticket as unknown as Ticket;
                    const hasSubtasks = (childrenByParentId[t.id] ?? []).length > 0;
                    if (hasSubtasks) {
                      setSubtasksPopupTicket(t);
                    } else {
                      openTicketEditor(t);
                    }
                  }}
                  onAddTicket={() => {
                    setNewTicketStatus(effectiveStages[0]?.status);
                    setIsTicketDialogOpen(true);
                  }}
                />
              ) : ticketsViewMode === 'groups' ? (
                (() => {
                  const groupTickets = rootProjectTickets.filter(
                    (t) => t.isGroup || (childrenByParentId[t.id] ?? []).length > 0
                  );
                  const ungrouped = rootProjectTickets.filter(
                    (t) =>
                      !t.isGroup &&
                      (childrenByParentId[t.id] ?? []).length === 0 &&
                      !t.dependency_ticket_id
                  );
                  return (
                    <div className="space-y-4">
                      {/* Toolbar */}
                      <div className="flex items-center justify-between">
                        <h2 className="font-playfair text-2xl font-bold text-foreground">Groups</h2>
                        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                          <button
                            onClick={() => {
                              setNewGroupName('');
                              setGroupSelectedIds(new Set());
                              setShowCreateGroupDialog(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create Group
                          </button>
                          <button
                            disabled={aiGroupLoading || ungrouped.length < 3}
                            onClick={async () => {
                              if (!selectedProjectId) return;
                              setAiGroupLoading(true);
                              setAiGroupSuggestions([]);
                              setAiGroupAccepted(new Set());
                              setAiGroupRemovedTickets({});
                              try {
                                const res = await fetch(
                                  `/api/projects/${selectedProjectId}/suggest-groups`,
                                  {
                                    method: 'POST',
                                  }
                                );
                                if (res.ok) {
                                  const data = await res.json();
                                  if (data.groups?.length > 0) {
                                    setAiGroupSuggestions(data.groups);
                                    setShowAiGroupDialog(true);
                                  } else {
                                    showToast(
                                      data.message ||
                                        'No group suggestions could be generated. Try adding more descriptive ticket titles.',
                                      'error'
                                    );
                                  }
                                } else {
                                  showToast(
                                    'Failed to get AI suggestions. Please try again.',
                                    'error'
                                  );
                                }
                              } catch {
                                showToast(
                                  'Failed to get AI suggestions. Please try again.',
                                  'error'
                                );
                              } finally {
                                setAiGroupLoading(false);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              aiGroupLoading
                                ? 'text-muted-foreground opacity-60'
                                : 'text-muted-foreground hover:text-foreground'
                            } ${ungrouped.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {aiGroupLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            AI Suggest
                          </button>
                        </div>
                      </div>

                      {ungrouped.length < 3 && (
                        <p className="text-xs text-muted-foreground">
                          Need at least 3 ungrouped tickets for AI suggestions ({ungrouped.length}{' '}
                          currently ungrouped)
                        </p>
                      )}

                      {groupTickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <Layers className="h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            No ticket groups yet.
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Create a group and add tickets, or let AI suggest groupings.
                          </p>
                        </div>
                      )}

                      {/* Group cards */}
                      {groupTickets.map((parent) => {
                        const children = childrenByParentId[parent.id] ?? [];
                        const done = children.filter((c) => c.status === 'done').length;
                        const total = children.length;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                          <div
                            key={parent.id}
                            className="rounded-xl border border-border bg-muted/40 overflow-hidden"
                          >
                            <div className="flex items-center justify-between p-4 bg-background">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Layers className="h-4 w-4 text-primary shrink-0" />
                                <span
                                  className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary"
                                  onClick={() => {
                                    if (children.length > 0) {
                                      setSubtasksPopupTicket(parent);
                                    } else {
                                      openTicketEditor(parent);
                                    }
                                  }}
                                >
                                  {parent.title}
                                </span>
                                {parent.isGroup && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                                    Group
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Sprint assignment */}
                                <select
                                  value={parent.sprintId ?? ''}
                                  onChange={async (e) => {
                                    const newSprintId = e.target.value || null;
                                    await fetch(`/api/tickets/${parent.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ sprintId: newSprintId }),
                                    });
                                    if (newSprintId) {
                                      for (const child of children) {
                                        await fetch(`/api/tickets/${child.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ sprintId: newSprintId }),
                                        });
                                      }
                                    }
                                    await onRefresh?.();
                                  }}
                                  className="text-xs rounded-md border border-border bg-background px-2 py-1.5 text-foreground cursor-pointer"
                                >
                                  <option value="">No sprint</option>
                                  {sprints.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                      {sp.name}
                                    </option>
                                  ))}
                                </select>
                                {/* Milestone assignment */}
                                <select
                                  value={parent.milestoneId ?? ''}
                                  onChange={async (e) => {
                                    const newMilestoneId = e.target.value || null;
                                    await fetch(`/api/tickets/${parent.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ milestoneId: newMilestoneId }),
                                    });
                                    if (newMilestoneId) {
                                      for (const child of children) {
                                        await fetch(`/api/tickets/${child.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ milestoneId: newMilestoneId }),
                                        });
                                      }
                                    }
                                    await onRefresh?.();
                                  }}
                                  className="text-xs rounded-md border border-border bg-background px-2 py-1.5 text-foreground cursor-pointer"
                                >
                                  <option value="">No milestone</option>
                                  {milestones.map((ms) => (
                                    <option key={ms.id} value={ms.id}>
                                      {ms.name}
                                    </option>
                                  ))}
                                </select>
                                {total > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {done}/{total} done
                                  </span>
                                )}
                                <button
                                  onClick={async () => {
                                    await fetch(`/api/tickets/${parent.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isGroup: false }),
                                    });
                                    for (const child of children) {
                                      await fetch(`/api/tickets/${child.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ dependencyTicketId: null }),
                                      });
                                    }
                                    await onRefresh?.();
                                    showToast('Group ungrouped', 'success');
                                  }}
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                >
                                  Ungroup
                                </button>
                              </div>
                            </div>
                            {total > 0 && (
                              <div className="px-4 pb-3 pt-1">
                                <Progress value={pct} className="h-1.5" />
                                <div className="mt-2 space-y-1">
                                  {children.map((child) => (
                                    <div
                                      key={child.id}
                                      className="flex items-center gap-2 text-xs py-1 cursor-pointer hover:bg-muted/40 rounded px-2"
                                      onClick={() => openTicketEditor(child)}
                                    >
                                      {child.status === 'done' ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                      ) : child.status === 'blocked' ? (
                                        <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
                                      ) : (
                                        <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                                      )}
                                      <span
                                        className={`truncate ${child.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                                      >
                                        {child.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div ref={kanbanScrollRef} className="flex gap-4 overflow-x-auto pb-4 items-start">
                  {effectiveStages.length === 0 && !isAddingStageInline && (
                    <div className="flex flex-col items-center justify-center w-full py-20 text-center">
                      <LayoutGrid className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-lg font-semibold text-foreground mb-1">No board yet</p>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Create your board with columns to start organizing tickets. You can add more
                        columns later.
                      </p>
                      <Button
                        type="button"
                        onClick={openAddStageDialog}
                        className="rounded-none gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create board
                      </Button>
                    </div>
                  )}
                  {effectiveStages.map((stage) => {
                    const colTickets = rootProjectTickets.filter(
                      (ticket) => resolveTicketStage(ticket).id === stage.id
                    );
                    const isOver = dragOverColumn === stage.id;
                    return (
                      <div
                        key={stage.id}
                        draggable
                        onDragStart={() => {
                          setDraggedStageId(stage.id);
                          setDraggedTicketId(null);
                        }}
                        onDragEnd={() => setDraggedStageId(null)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverColumn(stage.id);
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation();
                          setDragOverColumn(null);
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverColumn(null);
                          if (draggedStageId && draggedStageId !== stage.id) {
                            moveStageByDrop(draggedStageId, stage.id);
                            setDraggedStageId(null);
                            return;
                          }
                          if (draggedTicketId) {
                            await handleKanbanDrop(draggedTicketId, stage.id);
                            setDraggedTicketId(null);
                          }
                        }}
                        className={`group min-w-[280px] w-[280px] rounded-2xl border-2 transition-colors h-fit flex flex-col ${
                          isOver ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/40'
                        } ${draggedStageId === stage.id ? 'opacity-40' : ''}`}
                      >
                        <div className="relative flex items-center px-3 pt-4 pb-2">
                          <button
                            type="button"
                            className="cursor-grab active:cursor-grabbing text-muted-foreground/70 hover:text-foreground shrink-0 absolute left-3"
                            aria-label={`Reorder ${stage.label} stage`}
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className="text-xs font-semibold uppercase tracking-widest text-center w-full"
                            style={{ color: stage.color }}
                          >
                            {stage.label}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 p-3">
                          {colTickets.map((ticket) => (
                            <button
                              key={ticket.id}
                              type="button"
                              draggable={!bulkMode}
                              onClick={() => {
                                if (bulkMode) {
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(ticket.id)) next.delete(ticket.id);
                                    else next.add(ticket.id);
                                    return next;
                                  });
                                  return;
                                }
                                const hasSubtasks =
                                  (childrenByParentId[ticket.id] ?? []).length > 0;
                                if (hasSubtasks) {
                                  setSubtasksPopupTicket(ticket);
                                } else {
                                  openTicketEditor(ticket);
                                }
                              }}
                              onDragStart={(e) => {
                                if (bulkMode) {
                                  e.preventDefault();
                                  return;
                                }
                                e.stopPropagation();
                                setDraggedTicketId(ticket.id);
                                setDraggedStageId(null);
                              }}
                              onDragEnd={(e) => {
                                e.stopPropagation();
                                setDraggedTicketId(null);
                              }}
                              className={`rounded-xl border bg-muted/40 p-3 shadow-sm hover:shadow-md transition-shadow text-left hover:bg-muted/60 ${
                                bulkMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                              } ${draggedTicketId === ticket.id ? 'opacity-50' : ''} ${
                                selectedIds.has(ticket.id)
                                  ? 'border-primary/50 bg-primary/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                {bulkMode && (
                                  <span className="shrink-0">
                                    {selectedIds.has(ticket.id) ? (
                                      <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </span>
                                )}
                                <TicketBadges
                                  priority={ticket.priority ?? 'none'}
                                  type={ticket.type ?? 'task'}
                                  estimate={ticket.estimate ?? 'none'}
                                  labels={ticket.labels ?? []}
                                  labelMap={labelMap}
                                />
                              </div>
                              <p className="text-sm font-medium text-foreground line-clamp-2">
                                {ticket.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {ticket.description
                                  ? stripHtml(ticket.description)
                                  : 'No description'}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {ticket.assignee && (
                                    <p className="text-[11px] text-muted-foreground">
                                      @{ticket.assignee}
                                    </p>
                                  )}
                                  {ticket.due_date && (
                                    <span
                                      className={`text-[11px] flex items-center gap-1 ${(() => {
                                        const d = parseISO(ticket.due_date);
                                        if (isPast(d) && !isToday(d)) return 'text-red-500';
                                        if (isToday(d) || isTomorrow(d)) return 'text-amber-500';
                                        return 'text-muted-foreground';
                                      })()}`}
                                    >
                                      <Calendar className="h-3 w-3" />
                                      {format(parseISO(ticket.due_date), 'MMM d')}
                                    </span>
                                  )}
                                </div>
                                {(childrenByParentId[ticket.id] ?? []).length > 0 && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {
                                      (childrenByParentId[ticket.id] ?? []).filter(
                                        (c) => c.status === 'done'
                                      ).length
                                    }
                                    /{(childrenByParentId[ticket.id] ?? []).length}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                          {colTickets.length === 0 && (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-xs text-muted-foreground/50">Drop tickets here</p>
                            </div>
                          )}
                          <div className="max-h-0 opacity-0 group-hover:max-h-14 group-hover:opacity-100 transition-all duration-300 ease-in-out overflow-hidden">
                            <div className="flex items-center justify-center gap-2 mx-3 mb-3 rounded-lg border border-border bg-background/80 backdrop-blur-sm py-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTicketStatus(stage.status);
                                  setIsTicketDialogOpen(true);
                                }}
                                className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </button>
                              <div className="w-px h-5 bg-border" />
                              <span className="text-xs font-bold text-muted-foreground min-w-[24px] text-center">
                                {colTickets.length}
                              </span>
                              <div className="w-px h-5 bg-border" />
                              <button
                                type="button"
                                onClick={() => openEditStageDialog(stage)}
                                className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteStage(stage)}
                                disabled={effectiveStages.length <= 1}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isAddingStageInline ? (
                    <div className="min-w-[280px] w-[280px] rounded-2xl border-2 border-primary/40 bg-muted/40 p-4 space-y-3">
                      <div className="text-sm font-medium text-foreground">New column</div>
                      <Input
                        value={stageForm.label}
                        onChange={(e) =>
                          setStageForm((prev) => ({ ...prev, label: e.target.value }))
                        }
                        placeholder="Column name (e.g. To Do)"
                        className="bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveStageDetails();
                          }
                          if (e.key === 'Escape') {
                            setIsAddingStageInline(false);
                          }
                        }}
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          '#64748b',
                          '#3b82f6',
                          '#22c55e',
                          '#eab308',
                          '#f97316',
                          '#ef4444',
                          '#a855f7',
                          '#ec4899',
                        ].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setStageForm((prev) => ({ ...prev, color }))}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              stageForm.color === color
                                ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">
                          Set stage as
                        </label>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(
                            [
                              { value: 'backlog', label: 'Backlog', color: '#f59e0b' },
                              { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                              { value: 'done', label: 'Done', color: '#10b981' },
                              { value: 'blocked', label: 'Blocked', color: '#ef4444' },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setStageForm((prev) => ({ ...prev, stageType: opt.value }))
                              }
                              className={`px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors ${
                                stageForm.stageType === opt.value
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-muted-foreground hover:bg-muted/50'
                              }`}
                            >
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                                style={{ backgroundColor: opt.color }}
                              />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveStageDetails}
                          disabled={!stageForm.label.trim()}
                          className="rounded-none"
                        >
                          Create column
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAddingStageInline(false)}
                          className="rounded-none"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openAddStageDialog}
                      className="min-w-[280px] w-[280px] rounded-2xl border border-dashed border-border bg-muted/50 text-left p-4 hover:border-primary/40 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <PlusCircle className="h-4 w-4 text-primary" />
                        Add column
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Create a new column at the end.
                      </p>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS tab ── */}
        {projectTab === 'analytics' &&
          (() => {
            const backlog = projectTickets.filter((t) => t.status === 'backlog').length;
            const inProgress = projectTickets.filter((t) => t.status === 'in_progress').length;
            const done = projectTickets.filter((t) => t.status === 'done').length;
            const blocked = projectTickets.filter((t) => t.status === 'blocked').length;
            const total = projectTickets.length;
            const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
            const overdue = projectTickets.filter(
              (t) => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()
            ).length;
            const unassigned = projectTickets.filter((t) => !t.assignee_user_id).length;
            const STALE_DAYS = 3;
            const stale = projectTickets.filter((t) => {
              if (t.status === 'done') return false;
              const updated = t.updatedAt ? new Date(t.updatedAt) : null;
              if (!updated) return false;
              return (Date.now() - updated.getTime()) / 86400000 >= STALE_DAYS;
            }).length;

            // Throughput data (last 14 days)
            const throughputData = (() => {
              const days: { label: string; completed: number }[] = [];
              for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                const next = new Date(d);
                next.setDate(d.getDate() + 1);
                const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                const completed = projectTickets.filter((t) => {
                  if (!t.updatedAt || t.status !== 'done') return false;
                  const c = new Date(t.updatedAt);
                  return c >= d && c < next;
                }).length;
                days.push({ label, completed });
              }
              return days;
            })();
            const last7Completed = throughputData.slice(7).reduce((s, d) => s + d.completed, 0);
            const prev7Completed = throughputData.slice(0, 7).reduce((s, d) => s + d.completed, 0);
            const throughputTrend =
              last7Completed > prev7Completed
                ? 'up'
                : last7Completed < prev7Completed
                  ? 'down'
                  : 'flat';

            // Status donut data
            const statusData = [
              { name: 'Backlog', value: backlog, fill: '#8a8a80' },
              { name: 'In Progress', value: inProgress, fill: '#3d7abf' },
              { name: 'Done', value: done, fill: '#3d8a5e' },
              { name: 'Blocked', value: blocked, fill: '#b84040' },
            ].filter((s) => s.value > 0);

            const statusChartConfig: ChartConfig = {
              completed: { label: 'Completed' },
            };

            // Assignee workload
            const assigneeMap = new Map<
              string,
              {
                name: string;
                imageUrl?: string;
                open: number;
                done: number;
                blocked: number;
                inProgress: number;
              }
            >();
            for (const t of projectTickets) {
              if (!t.assignee_user_id) continue;
              const key = t.assignee_user_id;
              if (!assigneeMap.has(key)) {
                const member = memberships?.data?.find((m) => m.publicUserData?.userId === key);
                const name = t.assignee || member?.publicUserData?.firstName || 'Unknown';
                const imageUrl = member?.publicUserData?.imageUrl;
                assigneeMap.set(key, {
                  name,
                  imageUrl,
                  open: 0,
                  done: 0,
                  blocked: 0,
                  inProgress: 0,
                });
              }
              const entry = assigneeMap.get(key)!;
              if (t.status === 'done') entry.done++;
              else if (t.status === 'blocked') entry.blocked++;
              else if (t.status === 'in_progress') entry.inProgress++;
              else entry.open++;
            }
            const assigneeWorkload = Array.from(assigneeMap.values()).sort(
              (a, b) => b.open + b.inProgress + b.blocked - (a.open + a.inProgress + a.blocked)
            );

            // Upcoming deadlines
            const upcoming = projectTickets
              .filter((t) => t.due_date && t.status !== 'done')
              .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
              .slice(0, 6);

            // Meeting pipeline
            const totalSpecs = projectMeetings.reduce((sum, m) => sum + (m.specsDetected || 0), 0);

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-foreground">
                      Project Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedProject?.name} — health, throughput, and workload
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const statusColors: Record<string, string> = {
                        on_track: 'bg-green-500',
                        at_risk: 'bg-yellow-500',
                        off_track: 'bg-red-500',
                        paused: 'bg-gray-400',
                      };
                      const currentStatus = selectedProject?.status ?? 'on_track';
                      return (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${statusColors[currentStatus] ?? statusColors.on_track}`}
                          />
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {currentStatus.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={healthLoading}
                      onClick={async () => {
                        if (!selectedProjectId) return;
                        setHealthLoading(true);
                        setAiHealthSuggestion(null);
                        try {
                          const res = await fetch(`/api/projects/${selectedProjectId}/health`, {
                            method: 'POST',
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setAiHealthSuggestion(data);
                          }
                        } finally {
                          setHealthLoading(false);
                        }
                      }}
                      className="rounded-full gap-1.5 text-xs"
                    >
                      {healthLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      AI Suggest
                    </Button>
                  </div>
                </div>

                {aiHealthSuggestion && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          AI suggests: {aiHealthSuggestion.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-7"
                          onClick={() => setAiHealthSuggestion(null)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full text-xs h-7"
                          onClick={async () => {
                            if (!selectedProjectId) return;
                            await fetch(`/api/projects/${selectedProjectId}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: aiHealthSuggestion.status }),
                            });
                            setAiHealthSuggestion(null);
                            await onRefresh?.();
                          }}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{aiHealthSuggestion.reason}</p>
                  </div>
                )}

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                        Total Tickets
                      </p>
                    </div>
                    <p className="text-3xl font-playfair font-bold text-foreground">{total}</p>
                    <p className="text-xs text-muted-foreground">
                      {projectMeetings.length} meetings · {totalSpecs} extracted
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-xs uppercase tracking-wide font-medium text-emerald-600">
                        Completion
                      </p>
                    </div>
                    <p className="text-3xl font-playfair font-bold text-foreground">{pct(done)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {done} of {total} done
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                      <p className="text-xs uppercase tracking-wide font-medium text-red-600">
                        Overdue
                      </p>
                    </div>
                    <p className="text-3xl font-playfair font-bold text-foreground">{overdue}</p>
                    <p className="text-xs text-muted-foreground">{unassigned} unassigned</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {throughputTrend === 'up' ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : throughputTrend === 'down' ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                        Throughput (7d)
                      </p>
                    </div>
                    <p className="text-3xl font-playfair font-bold text-foreground">
                      {last7Completed}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {throughputTrend === 'up' ? '↑' : throughputTrend === 'down' ? '↓' : '→'} vs
                      prev week
                    </p>
                  </div>
                </div>

                {/* Throughput Chart + Status Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Throughput</p>
                      <span className="text-xs text-muted-foreground">
                        Completed per day · last 14d
                      </span>
                    </div>
                    {throughputData.every((d) => d.completed === 0) ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No completed tickets in the last 14 days
                        </p>
                      </div>
                    ) : (
                      <ChartContainer config={statusChartConfig} className="h-[200px] w-full">
                        <BarChart data={throughputData} barCategoryGap={4}>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            interval={1}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="completed"
                            fill="#3d8a5e"
                            radius={[4, 4, 0, 0]}
                            name="Completed"
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Status Distribution</p>
                    {statusData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Circle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No tickets yet</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <ChartContainer config={statusChartConfig} className="h-[160px] w-[160px]">
                          <PieChart>
                            <Pie
                              data={statusData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                            >
                              {statusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                          </PieChart>
                        </ChartContainer>
                        <div className="space-y-1.5 flex-1">
                          {[
                            { label: 'Backlog', count: backlog, color: '#8a8a80' },
                            { label: 'In Progress', count: inProgress, color: '#3d7abf' },
                            { label: 'Done', count: done, color: '#3d8a5e' },
                            { label: 'Blocked', count: blocked, color: '#b84040' },
                          ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2 text-xs">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: s.color }}
                              />
                              <span className="text-muted-foreground flex-1">{s.label}</span>
                              <span className="font-medium text-foreground">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Needs Attention + Upcoming Deadlines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Needs Attention */}
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-foreground">Needs Attention</p>
                    </div>
                    <div className="space-y-2">
                      {overdue > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-foreground">Overdue tickets</span>
                          </div>
                          <span className="text-sm font-bold text-red-600">{overdue}</span>
                        </div>
                      )}
                      {blocked > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-foreground">Blocked tickets</span>
                          </div>
                          <span className="text-sm font-bold text-red-600">{blocked}</span>
                        </div>
                      )}
                      {stale > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-foreground">
                              Stale (3+ days no update)
                            </span>
                          </div>
                          <span className="text-sm font-bold text-amber-600">{stale}</span>
                        </div>
                      )}
                      {unassigned > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-blue-500/10 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-foreground">Unassigned tickets</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{unassigned}</span>
                        </div>
                      )}
                      {overdue === 0 && blocked === 0 && stale === 0 && unassigned === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <CheckCircle2 className="h-7 w-7 text-emerald-500/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            All clear — nothing needs attention
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">Upcoming Deadlines</p>
                    </div>
                    {upcoming.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="h-7 w-7 text-emerald-500/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcoming.map((t) => {
                          const daysLeft = Math.ceil(
                            (new Date(t.due_date!).getTime() - Date.now()) / 86400000
                          );
                          const isOverdue = daysLeft < 0;
                          return (
                            <div
                              key={t.id}
                              className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-background/50"
                            >
                              <div
                                className={cn(
                                  'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold',
                                  isOverdue
                                    ? 'bg-red-500/10 text-red-500'
                                    : daysLeft <= 1
                                      ? 'bg-red-500/10 text-red-500'
                                      : daysLeft <= 3
                                        ? 'bg-amber-500/10 text-amber-500'
                                        : 'bg-blue-500/10 text-blue-500'
                                )}
                              >
                                {isOverdue ? `${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {t.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {t.assignee || 'Unassigned'}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                  t.status === 'blocked'
                                    ? 'bg-red-500/10 text-red-600'
                                    : t.status === 'in_progress'
                                      ? 'bg-blue-500/10 text-blue-600'
                                      : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {t.status === 'in_progress'
                                  ? 'In Progress'
                                  : t.status === 'blocked'
                                    ? 'Blocked'
                                    : 'Backlog'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee Workload */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Assignee Workload</p>
                    <span className="text-xs text-muted-foreground">
                      {assigneeWorkload.length} members
                    </span>
                  </div>
                  {assigneeWorkload.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-7 w-7 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No tickets assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assigneeWorkload.map((a, i) => {
                        const memberTotal = a.open + a.done + a.blocked + a.inProgress;
                        const memberOpen = a.open + a.inProgress + a.blocked;
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {a.imageUrl && <AvatarImage src={a.imageUrl} alt={a.name} />}
                                <AvatarFallback className="text-[10px]">
                                  {a.name[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground flex-1">
                                {a.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                {a.inProgress > 0 && (
                                  <span className="text-blue-600 font-medium">
                                    {a.inProgress} in progress
                                  </span>
                                )}
                                {a.blocked > 0 && (
                                  <span className="text-red-600 font-medium">
                                    {a.blocked} blocked
                                  </span>
                                )}
                                {a.open > 0 && (
                                  <span className="text-muted-foreground">{a.open} backlog</span>
                                )}
                                <span className="text-emerald-600 font-medium">{a.done} done</span>
                              </div>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                              {a.inProgress > 0 && (
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${(a.inProgress / memberTotal) * 100}%`,
                                    background: '#3d7abf',
                                  }}
                                />
                              )}
                              {a.blocked > 0 && (
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${(a.blocked / memberTotal) * 100}%`,
                                    background: '#b84040',
                                  }}
                                />
                              )}
                              {a.open > 0 && (
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${(a.open / memberTotal) * 100}%`,
                                    background: '#8a8a80',
                                  }}
                                />
                              )}
                              {a.done > 0 && (
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${(a.done / memberTotal) * 100}%`,
                                    background: '#3d8a5e',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Meeting-to-Ticket Pipeline */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    Meeting-to-Ticket Pipeline
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Meetings
                        </p>
                      </div>
                      <p className="text-2xl font-playfair font-bold text-foreground">
                        {projectMeetings.length}
                      </p>
                    </div>
                    <div className="text-center border-x border-border/60">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Extracted
                        </p>
                      </div>
                      <p className="text-2xl font-playfair font-bold text-foreground">
                        {totalSpecs}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tracked
                        </p>
                      </div>
                      <p className="text-2xl font-playfair font-bold text-foreground">{total}</p>
                    </div>
                  </div>
                  {projectMeetings.length > 0 && (
                    <div className="pt-3 border-t border-border/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Extraction-to-tracking rate</span>
                        <span className="font-medium text-foreground">
                          {totalSpecs > 0 ? Math.round((total / totalSpecs) * 100) : 0}%
                        </span>
                      </div>
                      <Progress
                        value={totalSpecs > 0 ? (total / totalSpecs) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>

                {/* Deleted Tickets History */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-semibold text-foreground">Deleted Tickets History</p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {deletedActivities.length} deleted
                    </span>
                  </div>
                  {deletedActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Trash2 className="h-7 w-7 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No deleted tickets</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {deletedActivities.map((act) => {
                        const meta = act.metadata as Record<string, unknown>;
                        const title = String(meta.title ?? 'Unknown');
                        const status = String(meta.status ?? '');
                        const assignee = String(meta.assignee ?? 'Unassigned');
                        const member = memberships?.data?.find(
                          (m) => m.publicUserData?.userId === act.user_id
                        );
                        const userName = member
                          ? `${member.publicUserData?.firstName ?? ''} ${member.publicUserData?.lastName ?? ''}`.trim() ||
                            (member.publicUserData?.identifier ?? 'Unknown')
                          : 'Unknown';
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(act.created_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          return `${Math.floor(hrs / 24)}d ago`;
                        })();
                        return (
                          <div
                            key={act.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50"
                          >
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Deleted by {userName} · {timeAgo}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {status && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                                  {status.replace(/_/g, ' ')}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">{assignee}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* ── ROADMAP (Future Viz) tab ── */}
        {projectTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-foreground">Future Viz</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Visual timeline of milestones and ticket groups
                </p>
              </div>
            </div>
            <div className="min-h-[600px]">
              <RoadmapView
                tickets={rootProjectTickets as any}
                milestones={milestones as any}
                onTicketClick={(t) => {
                  const ticket = projectTickets.find((pt) => pt.id === t.id);
                  if (ticket) {
                    const hasSubtasks = (childrenByParentId[ticket.id] ?? []).length > 0;
                    if (hasSubtasks) {
                      setSubtasksPopupTicket(ticket);
                    } else {
                      openTicketEditor(ticket);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ── SPRINT-STONES tab ── */}
        {projectTab === 'sprint-stones' && (
          <div className="space-y-6">
            {/* Segmented toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold text-foreground">Sprint-stones</h2>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                <button
                  onClick={() => setSprintStonesView('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    sprintStonesView === 'analytics'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </button>
                <button
                  onClick={() => setSprintStonesView('milestones')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    sprintStonesView === 'milestones'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Milestone className="h-3.5 w-3.5" />
                  Milestones
                </button>
                <button
                  onClick={() => setSprintStonesView('sprints')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    sprintStonesView === 'sprints'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Sprint
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button
                  onClick={async () => {
                    if (!selectedProjectId) return;
                    setGeneratingSprints(true);
                    try {
                      const res = await fetch(
                        `/api/projects/${selectedProjectId}/generate-sprints`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orgId: membership?.organization?.id ?? '' }),
                        }
                      );
                      const data = await res.json();
                      if (res.ok) {
                        showToast(
                          `Generated ${data.sprints?.length ?? 0} sprints from ${tickets.length} tickets`,
                          'success'
                        );
                        await fetchSprints(selectedProjectId);
                        await onRefresh();
                      } else {
                        showToast(data?.error || 'Failed to generate sprints', 'error');
                      }
                    } catch {
                      showToast('Failed to generate sprints', 'error');
                    } finally {
                      setGeneratingSprints(false);
                    }
                  }}
                  disabled={generatingSprints || tickets.length < 5}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-primary hover:bg-primary/10 disabled:opacity-50"
                  title={
                    tickets.length < 5
                      ? 'Need at least 5 tickets'
                      : 'AI-generate sprints from project tickets'
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {generatingSprints ? 'Generating...' : 'Generate Sprints'}
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button
                  onClick={() => {
                    if (sprintStonesView === 'milestones') {
                      setShowCreateMilestoneForm((v) => !v);
                    } else {
                      setShowCreateSprintForm((v) => !v);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create {sprintStonesView === 'milestones' ? 'Milestone' : 'Sprint'}
                </button>
              </div>
            </div>

            {/* ── SPRINTS sub-view ── */}
            {sprintStonesView === 'sprints' && (
              <div className="space-y-4">
                {/* Create sprint form (collapsible) */}
                {showCreateSprintForm && (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Create Sprint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Sprint name (e.g. Sprint 1)"
                        value={sprintForm.name}
                        onChange={(e) => setSprintForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Sprint goal (optional)"
                        value={sprintForm.goal}
                        onChange={(e) => setSprintForm((p) => ({ ...p, goal: e.target.value }))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                      />
                      <input
                        type="date"
                        value={sprintForm.startDate}
                        onChange={(e) =>
                          setSprintForm((p) => ({ ...p, startDate: e.target.value }))
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                      <input
                        type="date"
                        value={sprintForm.endDate}
                        onChange={(e) => setSprintForm((p) => ({ ...p, endDate: e.target.value }))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={
                          !sprintForm.name ||
                          !sprintForm.startDate ||
                          !sprintForm.endDate ||
                          savingSprint
                        }
                        onClick={async () => {
                          if (!selectedProjectId) return;
                          setSavingSprint(true);
                          try {
                            await fetch(`/api/projects/${selectedProjectId}/sprints`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: sprintForm.name,
                                goal: sprintForm.goal,
                                startDate: sprintForm.startDate,
                                endDate: sprintForm.endDate,
                              }),
                            });
                            setSprintForm({ name: '', goal: '', startDate: '', endDate: '' });
                            setShowCreateSprintForm(false);
                            await fetchSprints(selectedProjectId);
                          } finally {
                            setSavingSprint(false);
                          }
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                      >
                        {savingSprint ? 'Creating...' : 'Create Sprint'}
                      </button>
                      <button
                        onClick={() => setShowCreateSprintForm(false)}
                        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Sprint cards */}
                {sprints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Zap className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">No sprints yet.</p>
                    <p className="text-xs text-muted-foreground/70">
                      Click "Create Sprint" to start planning.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprints.map((sprint) => {
                      const sprintTickets = projectTickets.filter((t) => t.sprintId === sprint.id);
                      const done = sprintTickets.filter((t) => t.status === 'done').length;
                      const total = sprintTickets.length;
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      const isActive = activeSprintId === sprint.id;
                      const now = new Date();
                      const start = new Date(sprint.start_date);
                      const end = new Date(sprint.end_date);
                      const daysRemaining = Math.max(
                        0,
                        Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      );
                      const daysElapsed = Math.max(
                        0,
                        Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                      );
                      const isCompleted = sprint.status === 'completed';
                      const statusColor =
                        sprint.status === 'active'
                          ? 'bg-green-500'
                          : sprint.status === 'completed'
                            ? 'bg-blue-500'
                            : 'bg-gray-400';

                      return (
                        <div
                          key={sprint.id}
                          className={`rounded-xl border overflow-hidden transition-all ${isActive ? 'border-primary shadow-md' : 'border-border'}`}
                        >
                          {/* Sprint edit form */}
                          {editingSprintId === sprint.id && (
                            <div className="p-4 space-y-3 bg-muted/30 border-b border-border">
                              <input
                                type="text"
                                value={sprintEditForm.name}
                                onChange={(e) =>
                                  setSprintEditForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="Sprint name"
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                              />
                              <input
                                type="text"
                                value={sprintEditForm.goal}
                                onChange={(e) =>
                                  setSprintEditForm((prev) => ({ ...prev, goal: e.target.value }))
                                }
                                placeholder="Sprint goal (optional)"
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">
                                    Start date
                                  </label>
                                  <input
                                    type="date"
                                    value={sprintEditForm.startDate}
                                    onChange={(e) =>
                                      setSprintEditForm((prev) => ({
                                        ...prev,
                                        startDate: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">End date</label>
                                  <input
                                    type="date"
                                    value={sprintEditForm.endDate}
                                    onChange={(e) =>
                                      setSprintEditForm((prev) => ({
                                        ...prev,
                                        endDate: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  disabled={
                                    !sprintEditForm.name.trim() ||
                                    !sprintEditForm.startDate ||
                                    !sprintEditForm.endDate
                                  }
                                  onClick={async () => {
                                    if (!selectedProjectId) return;
                                    await fetch(
                                      `/api/projects/${selectedProjectId}/sprints/${sprint.id}`,
                                      {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          name: sprintEditForm.name.trim(),
                                          goal: sprintEditForm.goal.trim(),
                                          startDate: sprintEditForm.startDate,
                                          endDate: sprintEditForm.endDate,
                                        }),
                                      }
                                    );
                                    setEditingSprintId(null);
                                    await fetchSprints(selectedProjectId);
                                  }}
                                  className="rounded-full text-xs h-7"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingSprintId(null)}
                                  className="rounded-full text-xs h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                          {/* Sprint header */}
                          <div
                            className="flex items-center justify-between p-4 bg-background cursor-pointer hover:bg-muted/30"
                            onClick={() => {
                              if (editingSprintId === sprint.id) return;
                              setActiveSprintId(isActive ? null : sprint.id);
                              setSprintPulse(null);
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground truncate">
                                    {sprint.name}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium capitalize shrink-0">
                                    {sprint.status}
                                  </span>
                                </div>
                                {sprint.goal && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {sprint.goal}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {sprint.start_date} → {sprint.end_date}
                              </span>
                              {total > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {done}/{total} done
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSprintId(sprint.id);
                                  setSprintEditForm({
                                    name: sprint.name,
                                    goal: sprint.goal ?? '',
                                    startDate: sprint.start_date ?? '',
                                    endDate: sprint.end_date ?? '',
                                  });
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!selectedProjectId) return;
                                  fetch(`/api/projects/${selectedProjectId}/sprints/${sprint.id}`, {
                                    method: 'DELETE',
                                  }).then(() => fetchSprints(selectedProjectId!));
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Sprint progress bar */}
                          {total > 0 && (
                            <div className="px-4 py-2 bg-muted/20">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Expanded sprint body */}
                          {isActive && (
                            <div className="border-t border-border p-4 space-y-4 bg-muted/10">
                              {/* Sprint controls */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {sprint.status === 'planning' && (
                                  <button
                                    onClick={async () => {
                                      if (!selectedProjectId) return;
                                      await fetch(
                                        `/api/projects/${selectedProjectId}/sprints/${sprint.id}`,
                                        {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: 'active' }),
                                        }
                                      );
                                      await fetchSprints(selectedProjectId);
                                    }}
                                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                                  >
                                    Start Sprint
                                  </button>
                                )}
                                {sprint.status === 'active' && (
                                  <button
                                    onClick={async () => {
                                      if (!selectedProjectId) return;
                                      await fetch(
                                        `/api/projects/${selectedProjectId}/sprints/${sprint.id}`,
                                        {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: 'completed' }),
                                        }
                                      );
                                      await fetchSprints(selectedProjectId);
                                    }}
                                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                                  >
                                    Complete Sprint
                                  </button>
                                )}
                                {/* AI Pulse */}
                                {sprint.status === 'active' && (
                                  <button
                                    disabled={sprintPulseLoading}
                                    onClick={async () => {
                                      if (!selectedProjectId) return;
                                      setSprintPulseLoading(true);
                                      setSprintPulse(null);
                                      try {
                                        const res = await fetch(
                                          `/api/projects/${selectedProjectId}/sprints/${sprint.id}/pulse`,
                                          {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              sprintName: sprint.name,
                                              sprintGoal: sprint.goal,
                                              startDate: sprint.start_date,
                                              endDate: sprint.end_date,
                                              totalTickets: total,
                                              completedTickets: done,
                                              inProgressTickets: sprintTickets.filter(
                                                (t) => t.status === 'in_progress'
                                              ).length,
                                              blockedTickets: sprintTickets.filter(
                                                (t) => t.status === 'blocked'
                                              ).length,
                                              backlogTickets: sprintTickets.filter(
                                                (t) => t.status === 'backlog'
                                              ).length,
                                              daysRemaining,
                                              daysElapsed,
                                            }),
                                          }
                                        );
                                        if (res.ok) {
                                          const data = await res.json();
                                          setSprintPulse(data.pulse);
                                        }
                                      } finally {
                                        setSprintPulseLoading(false);
                                      }
                                    }}
                                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                                  >
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    {sprintPulseLoading ? 'Analyzing...' : 'Sprint Pulse'}
                                  </button>
                                )}
                              </div>

                              {/* AI Pulse output */}
                              {sprintPulse && (
                                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                                  <div className="flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <p className="text-sm text-foreground">{sprintPulse}</p>
                                  </div>
                                </div>
                              )}

                              {/* Sprint tickets list */}
                              <div>
                                <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                                  Tickets in Sprint ({total})
                                </h4>
                                {total === 0 ? (
                                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                                    No tickets in this sprint yet. Add tickets from the Backlog view
                                    using the sprint dropdown.
                                  </p>
                                ) : (
                                  <div className="space-y-1">
                                    {sprintTickets.map((t) => (
                                      <div
                                        key={t.id}
                                        className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 cursor-pointer hover:bg-muted/40"
                                        onClick={() => openTicketEditor(t)}
                                      >
                                        {t.status === 'done' ? (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        ) : t.status === 'blocked' ? (
                                          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                        ) : t.status === 'in_progress' ? (
                                          <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        ) : (
                                          <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        )}
                                        <span
                                          className={`text-sm flex-1 truncate ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                                        >
                                          {t.title}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!selectedProjectId) return;
                                            fetch(`/api/tickets/${t.id}`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ sprintId: null }),
                                            }).then(() => onRefresh?.());
                                          }}
                                          className="text-[10px] text-muted-foreground hover:text-foreground shrink-0"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Backlog tickets to add */}
                              <div>
                                <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                                  Backlog — Add to Sprint
                                </h4>
                                {(() => {
                                  const backlogTickets = projectTickets.filter(
                                    (t) => !t.sprintId && t.status === 'backlog'
                                  );
                                  if (backlogTickets.length === 0) {
                                    return (
                                      <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">
                                        No backlog tickets available.
                                      </p>
                                    );
                                  }
                                  return (
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                      {backlogTickets.slice(0, 20).map((t) => (
                                        <div
                                          key={t.id}
                                          className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                                        >
                                          <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                          <span className="text-sm text-foreground flex-1 truncate">
                                            {t.title}
                                          </span>
                                          <button
                                            onClick={async () => {
                                              if (!selectedProjectId) return;
                                              await fetch(`/api/tickets/${t.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ sprintId: sprint.id }),
                                              });
                                              await onRefresh?.();
                                            }}
                                            className="text-[10px] rounded-md bg-primary/10 text-primary px-2 py-0.5 font-medium hover:bg-primary/20 transition-colors shrink-0"
                                          >
                                            Add
                                          </button>
                                        </div>
                                      ))}
                                      {backlogTickets.length > 20 && (
                                        <p className="text-[10px] text-muted-foreground text-center py-1">
                                          +{backlogTickets.length - 20} more in backlog
                                        </p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Sprint review (completed) */}
                              {isCompleted && (
                                <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                                  <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                                    Sprint Review
                                  </h4>
                                  {sprint.review ? (
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                      {sprint.review}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      Completed: {done}/{total} tickets. Incomplete tickets can be
                                      moved back to backlog or added to the next sprint.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MILESTONES sub-view ── */}
            {sprintStonesView === 'milestones' && (
              <div className="space-y-4">
                {showCreateMilestoneForm && (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Create Milestone</h3>
                    <input
                      type="text"
                      placeholder="Milestone name (e.g. MVP Launch)"
                      value={milestoneForm.name}
                      onChange={(e) => setMilestoneForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={milestoneForm.dueDate}
                        onChange={(e) =>
                          setMilestoneForm((p) => ({ ...p, dueDate: e.target.value }))
                        }
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                      />
                      <button
                        disabled={!milestoneForm.name.trim() || savingMilestone}
                        onClick={async () => {
                          if (!selectedProjectId) return;
                          setSavingMilestone(true);
                          try {
                            await fetch(`/api/projects/${selectedProjectId}/milestones`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: milestoneForm.name.trim(),
                                dueDate: milestoneForm.dueDate || undefined,
                              }),
                            });
                            setMilestoneForm({ name: '', description: '', dueDate: '' });
                            setShowCreateMilestoneForm(false);
                            await fetchMilestones(selectedProjectId);
                          } finally {
                            setSavingMilestone(false);
                          }
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                      >
                        {savingMilestone ? 'Creating...' : 'Add'}
                      </button>
                      <button
                        onClick={() => setShowCreateMilestoneForm(false)}
                        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {milestones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Milestone className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">No milestones yet.</p>
                    <p className="text-xs text-muted-foreground/70">
                      Click "Create Milestone" to track progress.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((ms) => {
                      const msTickets = projectTickets.filter((t) => t.milestoneId === ms.id);
                      const msDone = msTickets.filter((t) => t.status === 'done').length;
                      const msTotal = msTickets.length;
                      const msPct = msTotal > 0 ? Math.round((msDone / msTotal) * 100) : 0;
                      const isOverdue =
                        ms.due_date &&
                        new Date(ms.due_date) < new Date() &&
                        ms.status !== 'completed';
                      const statusColors: Record<string, string> = {
                        planned: 'bg-gray-400',
                        in_progress: 'bg-blue-500',
                        completed: 'bg-green-500',
                      };
                      return (
                        <div
                          key={ms.id}
                          className="rounded-xl border border-border/60 bg-background p-4 space-y-3"
                        >
                          {editingMilestoneId === ms.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={milestoneEditForm.name}
                                onChange={(e) =>
                                  setMilestoneEditForm((p) => ({ ...p, name: e.target.value }))
                                }
                                placeholder="Milestone name"
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                              />
                              <textarea
                                value={milestoneEditForm.description}
                                onChange={(e) =>
                                  setMilestoneEditForm((p) => ({
                                    ...p,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Description (optional)"
                                rows={2}
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                              />
                              <input
                                type="date"
                                value={milestoneEditForm.dueDate}
                                onChange={(e) =>
                                  setMilestoneEditForm((p) => ({ ...p, dueDate: e.target.value }))
                                }
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  disabled={!milestoneEditForm.name.trim()}
                                  onClick={async () => {
                                    if (!selectedProjectId) return;
                                    await fetch(
                                      `/api/projects/${selectedProjectId}/milestones/${ms.id}`,
                                      {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          name: milestoneEditForm.name.trim(),
                                          description: milestoneEditForm.description.trim(),
                                          dueDate: milestoneEditForm.dueDate || null,
                                        }),
                                      }
                                    );
                                    setEditingMilestoneId(null);
                                    await fetchMilestones(selectedProjectId);
                                  }}
                                  className="rounded-full text-xs h-7"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingMilestoneId(null)}
                                  className="rounded-full text-xs h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`h-2 w-2 rounded-full ${statusColors[ms.status] ?? statusColors.planned}`}
                                  />
                                  <span className="text-sm font-medium text-foreground">
                                    {ms.name}
                                  </span>
                                  {ms.due_date && (
                                    <span
                                      className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}
                                    >
                                      {new Date(ms.due_date).toLocaleDateString()}
                                      {isOverdue && ' (overdue)'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={ms.status}
                                    onChange={async (e) => {
                                      if (!selectedProjectId) return;
                                      await fetch(
                                        `/api/projects/${selectedProjectId}/milestones/${ms.id}`,
                                        {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: e.target.value }),
                                        }
                                      );
                                      await fetchMilestones(selectedProjectId);
                                    }}
                                    className="text-xs rounded-md border border-border bg-background px-2 py-1 text-foreground cursor-pointer"
                                  >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      setEditingMilestoneId(ms.id);
                                      setMilestoneEditForm({
                                        name: ms.name,
                                        description: ms.description ?? '',
                                        dueDate: ms.due_date ?? '',
                                      });
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={async () => {
                                      if (!selectedProjectId) return;
                                      await fetch(
                                        `/api/projects/${selectedProjectId}/milestones/${ms.id}`,
                                        { method: 'DELETE' }
                                      );
                                      await fetchMilestones(selectedProjectId);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              {msTotal > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      {msDone}/{msTotal} tickets done
                                    </span>
                                    <span className="font-medium text-foreground">{msPct}%</span>
                                  </div>
                                  <Progress value={msPct} className="h-1.5" />
                                </div>
                              )}
                              {msTotal === 0 && (
                                <p className="text-xs text-muted-foreground">
                                  No tickets assigned to this milestone yet.
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS sub-view ── */}
            {sprintStonesView === 'analytics' && (
              <div className="space-y-6">
                {/* Milestone Progress */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Milestone Progress</p>
                  {(() => {
                    if (milestones.length === 0)
                      return (
                        <div className="flex flex-col items-center py-12">
                          <Milestone className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No milestones yet.</p>
                        </div>
                      );
                    const md = milestones.map((ms) => {
                      const mt = projectTickets.filter((t) => t.milestoneId === ms.id);
                      const done = mt.filter((t) => t.status === 'done').length;
                      return {
                        name: ms.name,
                        done,
                        total: mt.length,
                        pct: mt.length > 0 ? Math.round((done / mt.length) * 100) : 0,
                      };
                    });
                    return (
                      <ChartContainer
                        config={{ done: { label: 'Done' }, total: { label: 'Total' } }}
                        className="h-[200px] w-full"
                      >
                        <BarChart data={md} barCategoryGap={8}>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="total" fill="#8a8a80" radius={[4, 4, 0, 0]} name="Total" />
                          <Bar dataKey="done" fill="#3d8a5e" radius={[4, 4, 0, 0]} name="Done" />
                        </BarChart>
                      </ChartContainer>
                    );
                  })()}
                </div>
                {/* Velocity */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Velocity Report</p>
                  {(() => {
                    const vd = sprints
                      .filter((s) => s.status === 'completed' || s.status === 'active')
                      .map((s) => {
                        const st = projectTickets.filter((t) => t.sprintId === s.id);
                        return {
                          name: s.name,
                          completed: st.filter((t) => t.status === 'done').length,
                          total: st.length,
                        };
                      })
                      .filter((d) => d.total > 0);
                    if (vd.length === 0)
                      return (
                        <div className="flex flex-col items-center py-12">
                          <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No sprint data yet.</p>
                        </div>
                      );
                    const avg = Math.round(vd.reduce((s, d) => s + d.completed, 0) / vd.length);
                    return (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Avg: <b className="text-foreground">{avg}</b> tickets/sprint
                        </p>
                        <ChartContainer
                          config={{ completed: { label: 'Completed' } }}
                          className="h-[200px] w-full"
                        >
                          <BarChart data={vd} barCategoryGap={8}>
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                              allowDecimals={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ReferenceLine y={avg} stroke="#3d7abf" strokeDasharray="5 5" />
                            <Bar dataKey="completed" fill="#3d8a5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </>
                    );
                  })()}
                </div>
                {/* Burndown */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Sprint Burndown</p>
                  {(() => {
                    const as = sprints.find((s) => s.status === 'active');
                    if (!as)
                      return (
                        <div className="flex flex-col items-center py-12">
                          <TrendingDown className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No active sprint.</p>
                        </div>
                      );
                    const st = projectTickets.filter((t) => t.sprintId === as.id);
                    if (st.length === 0)
                      return (
                        <div className="flex flex-col items-center py-12">
                          <TrendingDown className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No tickets in active sprint.
                          </p>
                        </div>
                      );
                    const start = new Date(as.start_date),
                      end = new Date(as.end_date);
                    const days = Math.max(
                      1,
                      Math.ceil((end.getTime() - start.getTime()) / 86400000)
                    );
                    const bd: { day: string; ideal: number; actual: number }[] = [];
                    for (let i = 0; i <= days; i++) {
                      const d = new Date(start);
                      d.setDate(d.getDate() + i);
                      d.setHours(0, 0, 0, 0);
                      const next = new Date(d);
                      next.setDate(d.getDate() + 1);
                      const ideal = Math.max(0, Math.round(st.length * (1 - i / days)));
                      const done = st.filter(
                        (t) => t.updatedAt && t.status === 'done' && new Date(t.updatedAt) <= next
                      ).length;
                      bd.push({
                        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        ideal,
                        actual: Math.max(0, st.length - done),
                      });
                    }
                    return (
                      <ChartContainer
                        config={{ ideal: { label: 'Ideal' }, actual: { label: 'Actual' } }}
                        className="h-[250px] w-full"
                      >
                        <LineChart data={bd}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 9 }}
                            interval={Math.max(1, Math.floor(days / 7))}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line
                            type="monotone"
                            dataKey="ideal"
                            stroke="#8a8a80"
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3d7abf"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    );
                  })()}
                </div>
                {/* Cycle Time */}
                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Cycle Time</p>
                  {(() => {
                    const dt = projectTickets.filter((t) => t.status === 'done' && t.updatedAt);
                    if (dt.length === 0)
                      return (
                        <div className="flex flex-col items-center py-12">
                          <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No completed tickets yet.</p>
                        </div>
                      );
                    const ct = dt.map((t) =>
                      Math.max(
                        0,
                        Math.ceil(
                          (new Date(t.updatedAt!).getTime() -
                            (t.createdAt
                              ? new Date(t.createdAt).getTime()
                              : new Date(t.updatedAt!).getTime())) /
                            86400000
                        )
                      )
                    );
                    const avg = (ct.reduce((s, d) => s + d, 0) / ct.length).toFixed(1);
                    const sorted = [...ct].sort((a, b) => a - b);
                    const med = sorted[Math.floor(sorted.length / 2)];
                    const bins = [0, 1, 3, 7, 14, 30, Infinity],
                      labels = ['0d', '1d', '2-3d', '4-7d', '8-14d', '15-30d', '30d+'];
                    const hd = bins.slice(0, -1).map((_, i) => ({
                      range: labels[i],
                      count: ct.filter((c) => c >= bins[i] && c < bins[i + 1]).length,
                    }));
                    return (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Avg: <b className="text-foreground">{avg}d</b> · Median:{' '}
                          <b className="text-foreground">{med}d</b> · Completed:{' '}
                          <b className="text-foreground">{dt.length}</b>
                        </p>
                        <ChartContainer
                          config={{ count: { label: 'Tickets' } }}
                          className="h-[180px] w-full"
                        >
                          <BarChart data={hd} barCategoryGap={8}>
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="range"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10 }}
                              allowDecimals={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="#3d7abf" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {projectTab === 'members' &&
          (() => {
            const orgMemberList = memberships?.data ?? [];
            const projectMemberUserIds = new Set(projectMembers.map((pm) => pm.user_id));
            const notYetAdded = orgMemberList.filter(
              (m) => !projectMemberUserIds.has(m.publicUserData?.userId ?? '')
            );

            async function handleAddMember(userId: string) {
              if (!selectedProjectId) return;
              setAddingMemberId(userId);
              try {
                await fetch(`/api/projects/${selectedProjectId}/members`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, role: 'member' }),
                });
                await fetchProjectMembers(selectedProjectId);
              } finally {
                setAddingMemberId(null);
              }
            }

            async function handleRemoveProjectMember(userId: string) {
              if (!selectedProjectId) return;
              setRemovingProjectMemberId(userId);
              try {
                await fetch(`/api/projects/${selectedProjectId}/members`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId }),
                });
                await fetchProjectMembers(selectedProjectId);
              } finally {
                setRemovingProjectMemberId(null);
              }
            }

            return (
              <div className="space-y-4">
                <h2 className="font-playfair text-2xl font-bold text-foreground">Members</h2>

                {/* Current project members */}
                <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Project members</p>
                  {projectMembersLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : projectMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No members added to this project yet.
                    </p>
                  ) : (
                    projectMembers.map((pm) => {
                      const orgM = orgMemberList.find(
                        (m) => m.publicUserData?.userId === pm.user_id
                      );
                      const name = orgM
                        ? [orgM.publicUserData?.firstName, orgM.publicUserData?.lastName]
                            .filter(Boolean)
                            .join(' ') ||
                          orgM.publicUserData?.identifier ||
                          'Unknown'
                        : pm.user_id;
                      const email = orgM?.publicUserData?.identifier ?? '';
                      const imageUrl = orgM?.publicUserData?.imageUrl;
                      return (
                        <div
                          key={pm.id}
                          className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 bg-background"
                        >
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                {name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{name}</p>
                              {email && (
                                <p className="text-[11px] text-muted-foreground">{email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin ? (
                              <select
                                value={pm.role}
                                onChange={async (e) => {
                                  const newRole = e.target.value as 'admin' | 'manager' | 'member';
                                  if (!selectedProjectId) return;
                                  await fetch(`/api/projects/${selectedProjectId}/members/role`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      memberUserId: pm.user_id,
                                      role: newRole,
                                    }),
                                  });
                                  await fetchProjectMembers(selectedProjectId);
                                }}
                                className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-muted text-foreground border border-border/40 cursor-pointer hover:bg-muted/80"
                              >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="member">Member</option>
                              </select>
                            ) : (
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                  pm.role === 'admin'
                                    ? 'bg-primary/10 text-primary'
                                    : pm.role === 'manager'
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {pm.role === 'admin'
                                  ? 'Admin'
                                  : pm.role === 'manager'
                                    ? 'Manager'
                                    : 'Member'}
                              </span>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                disabled={
                                  removingProjectMemberId === pm.user_id || pm.user_id === user?.id
                                }
                                title={
                                  pm.user_id === user?.id
                                    ? 'You cannot remove yourself'
                                    : 'Remove member'
                                }
                                onClick={() => handleRemoveProjectMember(pm.user_id)}
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add org members to project — admin only */}
                {isAdmin && notYetAdded.length > 0 && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Add org members to this project
                    </p>
                    {notYetAdded.map((m) => {
                      const name =
                        [m.publicUserData?.firstName, m.publicUserData?.lastName]
                          .filter(Boolean)
                          .join(' ') ||
                        m.publicUserData?.identifier ||
                        'Unknown';
                      const userId = m.publicUserData?.userId ?? '';
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 bg-background"
                        >
                          <div className="flex items-center gap-3">
                            {m.publicUserData?.imageUrl ? (
                              <img
                                src={m.publicUserData.imageUrl}
                                alt={name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                {name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {m.publicUserData?.identifier}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            disabled={addingMemberId === userId}
                            onClick={() => handleAddMember(userId)}
                          >
                            {addingMemberId === userId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            Add
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pending org invitations */}
                {isAdmin && (invitations?.data?.length ?? 0) > 0 && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Pending org invitations
                    </p>
                    {invitations!.data!.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-xl border border-dashed border-border/60 px-4 py-3 bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted/60 border border-dashed border-border flex items-center justify-center">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {inv.emailAddress}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Invited {new Date(inv.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

        {/* ── DEPENDENCIES tab ── */}
        {projectTab === 'dependencies' && (
          <div className="space-y-4">
            <h2 className="font-playfair text-2xl font-bold text-foreground">Dependencies</h2>
            <div className="rounded-2xl border border-border bg-muted/50 p-4">
              <TicketDependencyGraph
                projectId={selectedProject.id}
                subtaskCounts={Object.fromEntries(
                  Object.entries(childrenByParentId).map(([id, children]) => [id, children.length])
                )}
                onTicketClick={(ticketId) => {
                  const ticket = projectTickets.find((t) => t.id === ticketId);
                  if (ticket && (childrenByParentId[ticketId] ?? []).length > 0) {
                    setSubtasksPopupTicket(ticket);
                  } else if (ticket) {
                    openTicketEditor(ticket);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ── SETTINGS tab ── */}
        {projectTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="font-playfair text-2xl font-bold text-foreground">Project Settings</h2>

            <div className="rounded-2xl border border-border bg-muted/50 p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project name</label>
                <Input
                  value={projectNameDraft}
                  onChange={(e) => setProjectNameDraft(e.target.value)}
                  placeholder="Project name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Context</label>
                <Textarea
                  value={projectContextDraft}
                  onChange={(e) => setProjectContextDraft(e.target.value)}
                  placeholder="Project goals, tech stack, constraints..."
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Lead</label>
                <p className="text-xs text-muted-foreground mb-2">
                  The lead is responsible for this project's direction. Shown next to the project
                  name.
                </p>
                <select
                  value={selectedProject.leadUserId ?? ''}
                  onChange={async (e) => {
                    const leadUserId = e.target.value || null;
                    if (!selectedProjectId) return;
                    await fetch(`/api/projects/${selectedProjectId}/lead`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ leadUserId }),
                    });
                    await onRefresh?.();
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-muted/50"
                >
                  <option value="">No lead assigned</option>
                  {projectMembers.map((pm) => {
                    const orgM = (memberships?.data ?? []).find(
                      (m) => m.publicUserData?.userId === pm.user_id
                    );
                    const name = orgM
                      ? [orgM.publicUserData?.firstName, orgM.publicUserData?.lastName]
                          .filter(Boolean)
                          .join(' ') ||
                        orgM.publicUserData?.identifier ||
                        pm.user_id
                      : pm.user_id;
                    return (
                      <option key={pm.user_id} value={pm.user_id}>
                        {name} ({pm.role})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Status</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Health indicator shown next to the project name. Use AI to get a suggestion or set
                  manually.
                </p>
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusColors: Record<string, string> = {
                      on_track: 'bg-green-500',
                      at_risk: 'bg-yellow-500',
                      off_track: 'bg-red-500',
                      paused: 'bg-gray-400',
                    };
                    const statusOptions = [
                      { value: 'on_track', label: 'On Track' },
                      { value: 'at_risk', label: 'At Risk' },
                      { value: 'off_track', label: 'Off Track' },
                      { value: 'paused', label: 'Paused' },
                    ];
                    const currentStatus = selectedProject.status ?? 'on_track';
                    return (
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${statusColors[currentStatus] ?? statusColors.on_track}`}
                        />
                        <select
                          value={currentStatus}
                          onChange={async (e) => {
                            if (!selectedProjectId) return;
                            await fetch(`/api/projects/${selectedProjectId}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: e.target.value }),
                            });
                            await onRefresh?.();
                          }}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground cursor-pointer hover:bg-muted/50"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={healthLoading}
                    onClick={async () => {
                      if (!selectedProjectId) return;
                      setHealthLoading(true);
                      setAiHealthSuggestion(null);
                      try {
                        const res = await fetch(`/api/projects/${selectedProjectId}/health`, {
                          method: 'POST',
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setAiHealthSuggestion(data);
                        }
                      } finally {
                        setHealthLoading(false);
                      }
                    }}
                    className="rounded-full gap-1.5 text-xs"
                  >
                    {healthLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                {aiHealthSuggestion && (
                  <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            aiHealthSuggestion.status === 'on_track'
                              ? 'bg-green-500'
                              : aiHealthSuggestion.status === 'at_risk'
                                ? 'bg-yellow-500'
                                : aiHealthSuggestion.status === 'off_track'
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-sm font-medium text-foreground">
                          AI suggests: {aiHealthSuggestion.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-7"
                          onClick={() => setAiHealthSuggestion(null)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full text-xs h-7"
                          onClick={async () => {
                            if (!selectedProjectId) return;
                            await fetch(`/api/projects/${selectedProjectId}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: aiHealthSuggestion.status }),
                            });
                            setAiHealthSuggestion(null);
                            await onRefresh?.();
                          }}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{aiHealthSuggestion.reason}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={handleSaveProjectSettings}
                  disabled={savingProjectSettings}
                  className="rounded-full gap-2"
                >
                  {savingProjectSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectMeetingDialog
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        projectId={selectedProject.id}
        onCreated={onRefresh}
      />

      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              {stageForm.id ? 'Edit stage' : 'Add new stage'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure stage name, status mapping, and color.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Stage name</label>
              <Input
                value={stageForm.label}
                onChange={(e) =>
                  setStageForm((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                placeholder="e.g. QA Review"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input
                type="color"
                value={stageForm.color}
                onChange={(e) =>
                  setStageForm((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Set stage as</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { value: 'backlog', label: 'Backlog', color: '#f59e0b' },
                    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                    { value: 'done', label: 'Done', color: '#10b981' },
                    { value: 'blocked', label: 'Blocked', color: '#ef4444' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStageForm((prev) => ({ ...prev, stageType: opt.value }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      stageForm.stageType === opt.value
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70">
                This maps your column to a system status for analytics.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveStageDetails}
              disabled={!stageForm.label.trim()}
              className="rounded-full"
            >
              {stageForm.id ? 'Save stage' : 'Create stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRelocateStageDialogOpen}
        onOpenChange={(open) => {
          setIsRelocateStageDialogOpen(open);
          if (!open) {
            setStageToDelete(null);
            setRelocateStageId('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Move tickets before deleting stage
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a destination stage for tickets from &quot;{stageToDelete?.label}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Destination stage</label>
            <Select
              value={relocateStageId}
              onValueChange={(value) => setRelocateStageId(value)}
              disabled={Boolean(savingTicketId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {effectiveStages
                  .filter((stage) => stage.id !== stageToDelete?.id)
                  .map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRelocateStageDialogOpen(false);
                setStageToDelete(null);
                setRelocateStageId('');
              }}
              disabled={Boolean(savingTicketId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRelocateStageDelete}
              disabled={Boolean(savingTicketId) || !relocateStageId}
            >
              Move tickets &amp; delete stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteStageDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteStageDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete stage &quot;{stageToDelete?.label}&quot;?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose whether to keep tickets by moving them to the previous stage, or delete all
              tickets in this stage.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteStageDialogOpen(false);
                setStageToDelete(null);
                setRelocateStageId('');
                setIsRelocateStageDialogOpen(false);
              }}
              disabled={Boolean(savingTicketId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleDeleteStage('keep_tickets')}
              disabled={Boolean(savingTicketId)}
            >
              Keep tickets &amp; delete stage
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDeleteStage('delete_with_tickets')}
              disabled={Boolean(savingTicketId)}
            >
              Delete stage with tickets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameProjectOpen} onOpenChange={setIsRenameProjectOpen}>
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Change project name
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the project name used in your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label className="text-sm font-medium text-foreground">Project name</label>
            <Input
              value={projectNameDraft}
              onChange={(e) => setProjectNameDraft(e.target.value)}
              placeholder="Project name"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenameProjectOpen(false)}
              className="rounded-full"
              disabled={isSavingProject}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenameProject}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSavingProject || projectNameDraft.trim().length === 0}
            >
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManualTicketDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        meetings={memoizedMeetings}
        defaultMeetingId={projectMeetings[0]?.id}
        defaultProjectId={selectedProject.id}
        defaultStatus={newTicketStatus}
        statusOptions={memoizedStatusOptions}
        projectOnly
        onCreated={onRefresh}
      />

      <ProjectTicketImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        projectId={selectedProject.id}
        meetings={meetings}
        tickets={tickets}
        projectTickets={projectTickets}
        onCreated={onRefresh}
      />

      <Sheet
        open={Boolean(ticketToEdit)}
        onOpenChange={(open) => {
          if (!open) closeTicketEditor();
        }}
      >
        <SheetContent
          side="right"
          className="w-[680px] sm:max-w-[680px] p-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        >
          <SheetHeader className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <SheetTitle className="text-lg">
                {ticketToEdit?.dependency_ticket_id ? 'Edit subticket' : 'Edit ticket'}
              </SheetTitle>
              {ticketEditorHistory.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={goBackTicketEditor}>
                  Go back
                </Button>
              )}
            </div>
            <SheetDescription>
              {ticketToEdit?.dependency_ticket_id
                ? 'Describe subticket and update assignee, status, and dependencies.'
                : 'Update ticket fields, manage child tickets, and adjust dependencies.'}
            </SheetDescription>
          </SheetHeader>

          <div className="border-b border-border px-6 pt-2">
            <div className="flex gap-1">
              {(() => {
                // Only parent tickets (not subtickets) get the Activity tab
                const isSubtask = Boolean(ticketToEdit?.dependency_ticket_id);
                const tabs = isSubtask
                  ? ['details', 'attachments', 'comments', 'timeline']
                  : ['details', 'attachments', 'comments', 'activity', 'timeline'];
                return tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setTicketEditTab(
                        tab as 'details' | 'attachments' | 'comments' | 'activity' | 'timeline'
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                      ticketEditTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ));
              })()}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">
            {ticketEditTab === 'details' && (
              <>
                <div className="bg-zinc-100 dark:bg-zinc-800 border border-border px-4 py-3">
                  <input
                    value={ticketEditForm.title}
                    onChange={(e) =>
                      setTicketEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Ticket title"
                    className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 px-0 focus:ring-0"
                  />
                </div>

                <div className="space-y-2 mt-1.5">
                  <label className="text-xs font-medium text-muted-foreground block">
                    Description
                  </label>
                  <MentionEditor
                    content={ticketEditForm.description}
                    onChange={(html) =>
                      setTicketEditForm((prev) => ({
                        ...prev,
                        description: html,
                      }))
                    }
                    placeholder="Describe the ticket..."
                    disabled={Boolean(savingTicketId)}
                    members={(memberships?.data ?? []).map((m) => ({
                      userId: m.publicUserData?.userId ?? '',
                      displayName:
                        [m.publicUserData?.firstName, m.publicUserData?.lastName]
                          .filter(Boolean)
                          .join(' ') ||
                        m.publicUserData?.identifier ||
                        'Unknown',
                      imageUrl: m.publicUserData?.imageUrl,
                    }))}
                    tickets={projectTickets.map((t) => ({
                      id: t.id,
                      title: t.title,
                      status: t.status,
                    }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Assignee
                    </label>
                    <AssigneePicker
                      value={ticketEditForm.assignee}
                      onChange={(val) => setTicketEditForm((prev) => ({ ...prev, assignee: val }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Status
                    </label>
                    <Select
                      value={ticketEditForm.status}
                      onValueChange={(value) =>
                        setTicketEditForm((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-none bg-zinc-100 dark:bg-zinc-800">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {effectiveStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.status}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Due date
                    </label>
                    <DateRangePicker
                      dueDate={ticketEditForm.due_date || undefined}
                      deadlineTime={ticketEditForm.deadline_time || undefined}
                      onDueDateChange={(date) =>
                        setTicketEditForm((prev) => ({
                          ...prev,
                          due_date: date || '',
                        }))
                      }
                      onDeadlineTimeChange={(time) =>
                        setTicketEditForm((prev) => ({
                          ...prev,
                          deadline_time: time || '',
                        }))
                      }
                      disabled={Boolean(savingTicketId)}
                    />
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3 mt-4">
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer select-none list-none">
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                      <p className="text-sm font-medium text-foreground">Properties</p>
                    </summary>
                    <div className="mt-3">
                      <TicketMetadataEditor
                        priority={metaPriority}
                        type={metaType}
                        estimate={metaEstimate}
                        labels={metaLabels}
                        timeEstimate={metaTimeEstimate}
                        timeSpent={metaTimeSpent}
                        onPriorityChange={setMetaPriority}
                        onTypeChange={setMetaType}
                        onEstimateChange={setMetaEstimate}
                        onLabelsChange={setMetaLabels}
                        onTimeEstimateChange={setMetaTimeEstimate}
                        onTimeSpentChange={setMetaTimeSpent}
                        availableLabels={labels}
                        onManageLabels={() => setLabelManagerOpen(true)}
                      />
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Milestone
                          </label>
                          <select
                            value={metaMilestoneId ?? ''}
                            onChange={(e) => setMetaMilestoneId(e.target.value || null)}
                            className="w-full border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
                          >
                            <option value="">None</option>
                            {milestones.map((ms) => (
                              <option key={ms.id} value={ms.id}>
                                {ms.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Sprint
                          </label>
                          <select
                            value={metaSprintId ?? ''}
                            onChange={(e) => setMetaSprintId(e.target.value || null)}
                            className="w-full border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
                          >
                            <option value="">None</option>
                            {sprints.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {ticketToEdit && (
                  <div className="border border-border bg-muted/50 overflow-hidden mt-4">
                    <button
                      type="button"
                      onClick={() => setSubtasksExpanded((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none w-full text-left hover:bg-muted/30 transition-colors"
                    >
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${subtasksExpanded ? 'rotate-90' : ''}`}
                      />
                      <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                      <span className="border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {(childrenByParentId[ticketToEdit.id] ?? []).length}
                      </span>
                    </button>

                    <div
                      className="grid transition-all duration-200 ease-out"
                      style={{
                        gridTemplateRows: subtasksExpanded ? '1fr' : '0fr',
                      }}
                    >
                      <div className="overflow-hidden">
                        <div>
                          {(childrenByParentId[ticketToEdit.id] ?? []).length === 0 ? (
                            <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                              No subtasks yet.
                            </p>
                          ) : (
                            (childrenByParentId[ticketToEdit.id] ?? []).map((child) =>
                              renderChildTicketTree(child, 0)
                            )
                          )}
                        </div>

                        {isAddingSubtask && (
                          <div className="border-t border-border/60 bg-primary/5 px-2 py-2">
                            <div className="flex items-center gap-2">
                              <Circle className="h-4 w-4 text-muted-foreground" />
                              <Input
                                value={newChildDraft.title}
                                onChange={(e) =>
                                  setNewChildDraft((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="flex-1 h-8 rounded-none"
                                placeholder="Subtask name"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    void handleCreateChildTicket();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="icon"
                                onClick={handleCreateChildTicket}
                                disabled={!newChildDraft.title.trim() || Boolean(savingTicketId)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsAddingSubtask(true)}
                          className="w-full border-t border-border/60 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        >
                          Add subtask
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {ticketToEdit && ticketToEdit.projectId && (
                  <div className="border-t border-border/60 pt-4 mt-4">
                    <TicketDependencyPanel
                      ticketId={ticketToEdit.id}
                      projectId={ticketToEdit.projectId}
                      projectTickets={projectTickets.map((t) => ({
                        id: t.id,
                        title: t.title,
                        status: t.status,
                      }))}
                    />
                  </div>
                )}
              </>
            )}

            {ticketEditTab === 'attachments' && ticketToEdit && (
              <TicketAttachmentsPanel ticketId={ticketToEdit.id} />
            )}

            {ticketEditTab === 'comments' && ticketToEdit && (
              <TicketCommentsPanel ticketId={ticketToEdit.id} />
            )}

            {ticketEditTab === 'activity' && ticketToEdit && (
              <TicketActivityPanel ticketId={ticketToEdit.id} />
            )}

            {ticketEditTab === 'timeline' && ticketToEdit && (
              <TicketTimelinePanel
                ticket={ticketToEdit}
                subtasks={childrenByParentId[ticketToEdit.id] ?? []}
              />
            )}
          </div>

          <SheetFooter className="border-t border-border px-6 py-4 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!ticketToEdit) return;
                promptDeleteTicket(ticketToEdit);
                closeTicketEditor();
              }}
              disabled={Boolean(savingTicketId)}
            >
              {ticketToEdit?.dependency_ticket_id ? 'Delete subtask' : 'Delete ticket'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeTicketEditor}
              disabled={Boolean(savingTicketId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTicketEdit}
              disabled={Boolean(savingTicketId) || ticketEditForm.title.trim().length === 0}
            >
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(ticketToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTicketToDelete(null);
            setDeleteMode(null);
            setSubtaskReassignTargetId('');
          }
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              {deleteMode === 'reassign'
                ? 'Move subtasks before deleting'
                : ticketToDelete?.dependency_ticket_id
                  ? 'Delete this subtask?'
                  : 'Delete this ticket?'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {deleteMode === 'reassign'
                ? 'Choose an existing ticket to move the subtasks to before deleting.'
                : deleteMode === 'confirm'
                  ? `"${ticketToDelete?.title}" has ${(childrenByParentId[ticketToDelete?.id ?? ''] ?? []).length} subtask(s). Choose what to do with them.`
                  : `This will permanently remove "${ticketToDelete?.title}" from this project.`}
            </DialogDescription>
          </DialogHeader>

          {/* Subtask list shown in confirm mode */}
          {deleteMode === 'confirm' && (
            <div className="rounded-lg border border-border bg-muted/40 max-h-40 overflow-y-auto">
              {(childrenByParentId[ticketToDelete?.id ?? ''] ?? []).map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-b-0 text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-foreground truncate">{child.title}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground capitalize shrink-0">
                    {child.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reassign dropdown */}
          {deleteMode === 'reassign' && (
            <div className="py-1 space-y-2">
              <label className="text-sm font-medium text-foreground">Move subtasks to</label>
              <Select
                value={subtaskReassignTargetId}
                onValueChange={(value) => setSubtaskReassignTargetId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a ticket…" />
                </SelectTrigger>
                <SelectContent>
                  {projectTickets
                    .filter((t) => t.id !== ticketToDelete?.id && !t.dependency_ticket_id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTicketToDelete(null);
                setDeleteMode(null);
                setSubtaskReassignTargetId('');
              }}
              className="rounded-full"
              disabled={Boolean(savingTicketId)}
            >
              Cancel
            </Button>

            {deleteMode === 'confirm' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteMode('reassign')}
                  className="rounded-full"
                  disabled={Boolean(savingTicketId)}
                >
                  Move subtasks
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteTicket('delete_all')}
                  className="rounded-full gap-2"
                  disabled={Boolean(savingTicketId)}
                >
                  {savingTicketId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Delete all
                </Button>
              </>
            )}

            {deleteMode === 'reassign' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteMode('confirm')}
                  className="rounded-full"
                  disabled={Boolean(savingTicketId)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteTicket('reassign')}
                  className="rounded-full gap-2"
                  disabled={Boolean(savingTicketId) || !subtaskReassignTargetId}
                >
                  {savingTicketId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Move &amp; delete
                </Button>
              </>
            )}

            {!deleteMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteTicket('simple')}
                className="rounded-full gap-2"
                disabled={Boolean(savingTicketId)}
              >
                {savingTicketId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {ticketToDelete?.dependency_ticket_id ? 'Delete subtask' : 'Delete ticket'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToDelete(null);
            setProjectDeleteConfirm('');
          }
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this project?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will remove <strong>{projectToDelete?.name}</strong> from Supabase and unlink its
              meetings and tickets. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Type <strong>{projectToDelete?.name}</strong> to confirm deletion.
            </p>
            <Input
              value={projectDeleteConfirm}
              onChange={(e) => setProjectDeleteConfirm(e.target.value)}
              placeholder={`Type ${projectToDelete?.name} to confirm`}
              className="bg-white"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProjectToDelete(null);
                setProjectDeleteConfirm('');
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={projectDeleteConfirm !== projectToDelete?.name}
              onClick={async () => {
                if (!projectToDelete || projectDeleteConfirm !== projectToDelete.name) return;
                await onDeleteProject(projectToDelete.id);
                setProjectToDelete(null);
                setProjectDeleteConfirm('');
              }}
              className="rounded-full"
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(subtasksPopupTicket)}
        onOpenChange={(open) => {
          if (!open) setSubtasksPopupTicket(null);
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-foreground">
              {subtasksPopupTicket?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Subtasks ({(childrenByParentId[subtasksPopupTicket?.id ?? ''] ?? []).length})
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {(childrenByParentId[subtasksPopupTicket?.id ?? ''] ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subtasks yet.</p>
            ) : (
              <div className="space-y-1 rounded-lg border border-border bg-muted/50">
                {(childrenByParentId[subtasksPopupTicket?.id ?? ''] ?? []).map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 border-b border-border/60 px-3 py-2 last:border-b-0"
                  >
                    {child.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 text-sm text-foreground">{child.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setSubtasksPopupTicket(null);
                        openTicketEditor(child, true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubtasksPopupTicket(null)}
              className="rounded-full"
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (subtasksPopupTicket) {
                    openTicketEditor(subtasksPopupTicket);
                    setSubtasksPopupTicket(null);
                  }
                }}
                className="rounded-full"
              >
                Edit ticket
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (subtasksPopupTicket) {
                    setIsAddingSubtask(true);
                    openTicketEditor(subtasksPopupTicket);
                    setSubtasksPopupTicket(null);
                  }
                }}
                className="rounded-full"
              >
                Add subtask
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dependency Blocker Modal */}
      {blockerModalData && (
        <DependencyBlockerModal
          isOpen={blockerModalOpen}
          onClose={() => setBlockerModalOpen(false)}
          onGoToTicket={(ticketId) => {
            const ticket = projectTickets.find((t) => t.id === ticketId);
            if (ticket) {
              setBlockerModalOpen(false);
              openTicketEditor(ticket);
            }
          }}
          onRevert={blockerModalData.onRevert}
          onProceed={blockerModalData.onProceed}
          message={blockerModalData.message}
          blockers={blockerModalData.blockers}
          isHardBlock={blockerModalData.isHardBlock}
        />
      )}

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onChange={setFilters}
        labels={labels}
        statuses={effectiveStages.map((s) => ({ key: s.status, label: s.label }))}
        tickets={projectTickets
          .filter((t) => !t.dependency_ticket_id)
          .map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            type: t.type,
            estimate: t.estimate,
            labels: t.labels,
            assignee: t.assignee,
            due_date: t.due_date,
          }))}
      />

      {/* Label Manager */}
      <LabelManager
        open={labelManagerOpen}
        onClose={() => setLabelManagerOpen(false)}
        labels={labels}
        onRefresh={() => {
          void (async () => {
            const res = await fetch('/api/labels');
            if (res.ok) {
              const data = await res.json();
              const labelArr: Label[] = data.labels ?? [];
              setLabels(labelArr);
              const map: Record<string, { name: string; color: string }> = {};
              for (const l of labelArr) map[l.id] = { name: l.name, color: l.color };
              setLabelMap(map);
            }
          })();
        }}
      />

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="sm:max-w-lg border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-foreground">
              Create Ticket Group
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select tickets to group together under a parent epic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name (e.g., 'Auth System')"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Select tickets ({groupSelectedIds.size} selected):
              </p>
              {rootProjectTickets
                .filter((t) => !t.isGroup && !t.dependency_ticket_id)
                .map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={groupSelectedIds.has(t.id)}
                      onChange={(e) => {
                        setGroupSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(t.id);
                          else next.delete(t.id);
                          return next;
                        });
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground truncate">{t.title}</span>
                  </label>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateGroupDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !newGroupName.trim() ||
                groupSelectedIds.size < 2 ||
                creatingGroup ||
                !selectedProjectId
              }
              onClick={async () => {
                if (!selectedProjectId) return;
                setCreatingGroup(true);
                try {
                  const res = await fetch(`/api/projects/${selectedProjectId}/tickets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: newGroupName.trim(),
                      description: '',
                      status: effectiveStages[0]?.status ?? 'backlog',
                      isGroup: true,
                    }),
                  });
                  if (res.ok) {
                    const parentTicket = await res.json();
                    const parentId = parentTicket.ticketId;
                    if (parentId) {
                      for (const ticketId of groupSelectedIds) {
                        await fetch(`/api/tickets/${ticketId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dependencyTicketId: parentId }),
                        });
                      }
                    }
                    setShowCreateGroupDialog(false);
                    await onRefresh?.();
                  }
                } finally {
                  setCreatingGroup(false);
                }
              }}
              className="rounded-full"
            >
              {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Group Suggestions Dialog */}
      <Dialog open={showAiGroupDialog} onOpenChange={setShowAiGroupDialog}>
        <DialogContent className="sm:max-w-2xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Suggested Groups
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review the suggested groupings. Toggle tickets on/off, then create the groups you
              want.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {aiGroupSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No suggestions could be generated. Try adding more descriptive ticket titles.
              </p>
            ) : (
              aiGroupSuggestions.map((suggestion, idx) => {
                const isAccepted = aiGroupAccepted.has(idx);
                const removed = aiGroupRemovedTickets[idx] ?? new Set();
                const visibleTickets = suggestion.ticketIds.filter((id) => !removed.has(id));
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      isAccepted ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAccepted}
                            onChange={(e) => {
                              setAiGroupAccepted((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(idx);
                                else next.delete(idx);
                                return next;
                              });
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {suggestion.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {visibleTickets.length} tickets
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {suggestion.reason}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 ml-6">
                      {suggestion.ticketIds.map((ticketId) => {
                        const ticket = projectTickets.find((t) => t.id === ticketId);
                        if (!ticket) return null;
                        const isRemoved = removed.has(ticketId);
                        return (
                          <label
                            key={ticketId}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={!isRemoved}
                              onChange={(e) => {
                                setAiGroupRemovedTickets((prev) => {
                                  const next = { ...prev };
                                  const set = new Set(next[idx] ?? []);
                                  if (e.target.checked) set.delete(ticketId);
                                  else set.add(ticketId);
                                  next[idx] = set;
                                  return next;
                                });
                              }}
                              className="rounded border-border"
                            />
                            <span
                              className={`text-xs truncate ${isRemoved ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                            >
                              {ticket.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAiGroupDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              disabled={aiGroupAccepted.size === 0 || creatingGroup || !selectedProjectId}
              onClick={async () => {
                if (!selectedProjectId) return;
                setCreatingGroup(true);
                try {
                  for (const idx of aiGroupAccepted) {
                    const suggestion = aiGroupSuggestions[idx];
                    const removed = aiGroupRemovedTickets[idx] ?? new Set();
                    const ticketIds = suggestion.ticketIds.filter((id) => !removed.has(id));
                    if (ticketIds.length < 2) continue;

                    const res = await fetch(`/api/projects/${selectedProjectId}/tickets`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: suggestion.name,
                        description: suggestion.reason,
                        status: effectiveStages[0]?.status ?? 'backlog',
                        isGroup: true,
                      }),
                    });
                    if (res.ok) {
                      const parentTicket = await res.json();
                      const parentId = parentTicket.ticketId;
                      if (parentId) {
                        for (const ticketId of ticketIds) {
                          await fetch(`/api/tickets/${ticketId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dependencyTicketId: parentId }),
                          });
                        }
                      }
                    }
                  }
                  setShowAiGroupDialog(false);
                  setAiGroupAccepted(new Set());
                  setAiGroupRemovedTickets({});
                  await onRefresh?.();
                } finally {
                  setCreatingGroup(false);
                }
              }}
              className="rounded-full"
            >
              {creatingGroup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Create ${aiGroupAccepted.size} Group${aiGroupAccepted.size === 1 ? '' : 's'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
