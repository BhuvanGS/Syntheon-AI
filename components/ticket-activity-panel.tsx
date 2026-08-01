'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Activity,
  GitCommit,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Circle,
  Link2,
  Plus,
  Trash2,
  User,
  Clock,
  Edit3,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface Activity {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  imageUrl?: string;
}

interface TicketActivityPanelProps {
  ticketId: string;
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  created: Plus,
  updated: Edit3,
  status_changed: GitCommit,
  assigned: User,
  comment_added: MessageSquare,
  attachment_added: Paperclip,
  attachment_deleted: Trash2,
  dependency_added: Link2,
  dependency_removed: Trash2,
  subtask_created: Plus,
  subtask_completed: CheckCircle,
  subtask_deleted: Trash2,
  deleted: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  status_changed: 'bg-purple-100 text-purple-700',
  assigned: 'bg-orange-100 text-orange-700',
  comment_added: 'bg-cyan-100 text-cyan-700',
  attachment_added: 'bg-pink-100 text-pink-700',
  attachment_deleted: 'bg-red-100 text-red-700',
  dependency_added: 'bg-indigo-100 text-indigo-700',
  dependency_removed: 'bg-red-100 text-red-700',
  subtask_created: 'bg-emerald-100 text-emerald-700',
  subtask_completed: 'bg-green-100 text-green-700',
  subtask_deleted: 'bg-red-100 text-red-700',
  deleted: 'bg-red-100 text-red-700',
};

const ACTION_LABELS: Record<string, string> = {
  created: 'created this ticket',
  updated: 'updated ticket',
  status_changed: 'changed status',
  assigned: 'assigned',
  comment_added: 'added a comment',
  attachment_added: 'uploaded a file',
  attachment_deleted: 'deleted a file',
  dependency_added: 'added a dependency',
  dependency_removed: 'removed a dependency',
  subtask_created: 'created a subtask',
  subtask_completed: 'completed a subtask',
  subtask_deleted: 'deleted a subtask',
  deleted: 'deleted this ticket',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ActivityItem({
  activity,
  userMap,
}: {
  activity: Activity;
  userMap: Map<string, UserInfo>;
}) {
  const Icon = ACTION_ICONS[activity.action_type] || Activity;
  const colorClass = ACTION_COLORS[activity.action_type] || 'bg-gray-100 text-gray-700';
  const label = ACTION_LABELS[activity.action_type] || activity.action_type;
  const userInfo = userMap.get(activity.user_id);
  const userName = userInfo
    ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() ||
      userInfo.username ||
      userInfo.email?.split('@')[0] ||
      'Unknown'
    : 'Unknown';
  const userAvatar = userInfo?.imageUrl;

  const renderMetadata = () => {
    const meta = activity.metadata;
    if (!meta || typeof meta !== 'object') return null;

    const { from, to, field, title, filename, content, fields } = meta as Record<string, unknown>;

    // New: summarised field list e.g. "start date, due date"
    if (fields && typeof fields === 'string') {
      return (
        <span className="text-sm text-muted-foreground">
          updated <span className="font-medium text-foreground">{fields}</span>
        </span>
      );
    }

    // Per-field change with from → to
    if (
      field &&
      typeof field === 'string' &&
      from !== undefined &&
      to !== undefined &&
      typeof from !== 'object' &&
      typeof to !== 'object'
    ) {
      return (
        <span className="text-sm text-muted-foreground">
          changed <span className="font-medium text-foreground">{String(field)}</span> from{' '}
          <span className="font-medium text-foreground">{String(from)}</span>
          {' → '}
          <span className="font-medium text-foreground">{String(to)}</span>
        </span>
      );
    }

    // Scalar from → to only
    if (
      from !== undefined &&
      to !== undefined &&
      typeof from !== 'object' &&
      typeof to !== 'object'
    ) {
      return (
        <span className="text-sm text-muted-foreground">
          from <span className="font-medium text-foreground">{String(from)}</span>
          {' → '}
          <span className="font-medium text-foreground">{String(to)}</span>
        </span>
      );
    }

    if (field && typeof field === 'string') {
      return <span className="text-sm text-muted-foreground">changed {field}</span>;
    }

    if (title && typeof title === 'string') {
      return <span className="text-sm text-muted-foreground">"{title}"</span>;
    }

    if (filename && typeof filename === 'string') {
      return <span className="text-sm text-muted-foreground">{filename}</span>;
    }

    if (content && typeof content === 'string') {
      return (
        <span className="text-sm text-muted-foreground">
          "{content.length > 50 ? content.slice(0, 50) + '…' : content}"
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{userName}</span>{' '}
          <span className="text-muted-foreground">{label}</span>
        </p>
        {renderMetadata()}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

export function TicketActivityPanel({ ticketId }: TicketActivityPanelProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Map<string, UserInfo>>(new Map());
  const { user } = useUser();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}/activities`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      setActivities(data);

      // Collect unique user IDs
      const userIds = [...new Set<string>(data.map((a: Activity) => a.user_id))];
      const newUserMap = new Map<string, UserInfo>();

      // Add current user info if present
      if (user) {
        newUserMap.set(user.id, {
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          username: user.username || undefined,
          email: user.primaryEmailAddress?.emailAddress || undefined,
          imageUrl: user.imageUrl || undefined,
        });
      }

      // Fetch other users' info from the users API
      const otherUserIds = userIds.filter((id) => id !== user?.id);
      if (otherUserIds.length > 0) {
        try {
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            const orgUsers = usersData.users || [];
            for (const u of orgUsers) {
              if (otherUserIds.includes(u.id)) {
                newUserMap.set(u.id, {
                  firstName: u.name?.split(' ')[0] || undefined,
                  lastName: u.name?.split(' ').slice(1).join(' ') || undefined,
                  username: u.username || undefined,
                  email: u.email || undefined,
                  imageUrl: u.imageUrl || undefined,
                });
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch user info:', e);
        }
      }
      setUserMap(newUserMap);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId, user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Changes to this ticket will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <div key={activity.id}>
          <ActivityItem activity={activity} userMap={userMap} />
          {index < activities.length - 1 && (
            <div className="ml-4 border-l-2 border-border pl-7 my-1" />
          )}
        </div>
      ))}
    </div>
  );
}
