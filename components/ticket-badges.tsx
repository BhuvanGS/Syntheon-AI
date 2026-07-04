'use client';

import { Bug, Circle, Zap, FlaskConical, CheckCircle2 } from 'lucide-react';

export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TicketType = 'bug' | 'task' | 'feature' | 'spike';
export type TicketEstimate = 'quick' | 'standard' | 'deep' | 'epic' | 'none';

export const PRIORITY_CONFIG: Record<TicketPriority, { color: string; label: string }> = {
  urgent: { color: '#ef4444', label: 'Urgent' },
  high: { color: '#f97316', label: 'High' },
  medium: { color: '#eab308', label: 'Medium' },
  low: { color: '#3b82f6', label: 'Low' },
  none: { color: '#9ca3af', label: 'No priority' },
};

export const TYPE_CONFIG: Record<TicketType, { icon: typeof Bug; label: string; color: string }> = {
  bug: { icon: Bug, label: 'Bug', color: '#ef4444' },
  task: { icon: CheckCircle2, label: 'Task', color: '#6b7280' },
  feature: { icon: Zap, label: 'Feature', color: '#8b5cf6' },
  spike: { icon: FlaskConical, label: 'Spike', color: '#06b6d4' },
};

export const ESTIMATE_CONFIG: Record<
  TicketEstimate,
  { label: string; color: string; symbol: string }
> = {
  quick: { label: 'Quick', color: '#22c55e', symbol: '●' },
  standard: { label: 'Standard', color: '#3b82f6', symbol: '●●' },
  deep: { label: 'Deep', color: '#f97316', symbol: '●●●' },
  epic: { label: 'Epic', color: '#a855f7', symbol: '●●●●' },
  none: { label: 'No estimate', color: '#9ca3af', symbol: '' },
};

export function PriorityDot({
  priority,
  size = 8,
  showLabel = false,
}: {
  priority: TicketPriority;
  size?: number;
  showLabel?: boolean;
}) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.none;
  if (showLabel && priority !== 'none') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        style={{ background: `${config.color}15`, color: config.color }}
        title={config.label}
      >
        <span
          className="inline-block rounded-full shrink-0"
          style={{ width: size, height: size, backgroundColor: config.color }}
        />
        {config.label}
      </span>
    );
  }
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: config.color,
        boxShadow: priority === 'urgent' ? `0 0 6px ${config.color}80` : undefined,
      }}
      title={config.label}
    />
  );
}

export function TypeIcon({ type, size = 14 }: { type: TicketType; size?: number }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.task;
  const Icon = config.icon;
  return <Icon style={{ width: size, height: size, color: config.color }} />;
}

export function EstimateChip({ estimate }: { estimate: TicketEstimate }) {
  if (!estimate || estimate === 'none') return null;
  const config = ESTIMATE_CONFIG[estimate] ?? ESTIMATE_CONFIG.none;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: `${config.color}15`, color: config.color }}
      title={config.label}
    >
      <span className="text-[8px] leading-none tracking-tighter">{config.symbol}</span>
      {config.label}
    </span>
  );
}

export function LabelChip({
  name,
  color,
  size = 'sm',
}: {
  name: string;
  color: string;
  size?: 'sm' | 'xs';
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'xs' ? 'px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}

export function TicketBadges({
  priority,
  type,
  estimate,
  labels,
  labelMap,
}: {
  priority?: TicketPriority;
  type?: TicketType;
  estimate?: TicketEstimate;
  labels?: string[];
  labelMap?: Record<string, { name: string; color: string }>;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {priority && priority !== 'none' && <PriorityDot priority={priority} showLabel />}
      {type && type !== 'task' && (
        <span className="inline-flex items-center gap-1">
          <TypeIcon type={type} size={12} />
        </span>
      )}
      {estimate && estimate !== 'none' && <EstimateChip estimate={estimate} />}
      {labels &&
        labels.length > 0 &&
        labelMap &&
        labels.slice(0, 3).map((labelId) => {
          const label = labelMap[labelId];
          if (!label) return null;
          return <LabelChip key={labelId} name={label.name} color={label.color} size="xs" />;
        })}
      {labels && labels.length > 3 && (
        <span className="text-[9px] text-muted-foreground">+{labels.length - 3}</span>
      )}
    </div>
  );
}
