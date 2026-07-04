'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import {
  Video,
  Ticket,
  LayoutGrid,
  GitBranch,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  Command,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';

const tabs = [
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const stages = [
  { id: 'backlog', label: 'Backlog', color: '#a8a29e' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'done', label: 'Done', color: '#22c55e' },
  { id: 'blocked', label: 'Blocked', color: '#ef4444' },
];

const tickets = [
  {
    id: '1',
    title: 'Update user auth flow',
    status: 'backlog',
    description: 'The user authentication flow has been...',
  },
  {
    id: '2',
    title: 'Add unit tests for API routes',
    status: 'backlog',
    description: 'Write unit tests for the API routes...',
  },
  {
    id: '3',
    title: 'Implement Cloud auth',
    status: 'done',
    description: 'Implement the user authentication flow...',
  },
  {
    id: '4',
    title: 'Set up PostgreSQL schema',
    status: 'done',
    description: 'Set up the PostgreSQL database schema...',
  },
  {
    id: '5',
    title: 'Design dashboard layout',
    status: 'blocked',
    description: 'Design the dashboard layout with the...',
  },
];

const meetings = [
  { id: '1', title: 'Auth Dashboard — Follow-up Jun 26', status: 'processing', date: '6/26/2026' },
  { id: '2', title: 'Auth Update Meeting', status: 'completed', date: '6/25/2026' },
  { id: '3', title: 'Auth Dashboard', status: 'completed', date: '6/25/2026' },
];

const graphTickets = [
  { id: '1', title: 'Add unit tests fo...', status: 'backlog', x: 0, y: 0 },
  { id: '2', title: 'Update user auth...', status: 'backlog', x: 0, y: 80 },
  { id: '3', title: 'Implement Cloud a...', status: 'done', x: 260, y: 0 },
  { id: '4', title: 'Set up PostgreSQL...', status: 'done', x: 260, y: 80 },
  { id: '5', title: 'Design dashboard...', status: 'blocked', x: 260, y: 160 },
];

const deps = [
  { from: '1', to: '3', hard: false },
  { from: '2', to: '3', hard: false },
  { from: '2', to: '4', hard: false },
  { from: '5', to: '4', hard: true },
];

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  done: { bg: '#052e16', border: '#166534', text: '#86efac', dot: '#22c55e' },
  backlog: { bg: '#1c1917', border: '#44403c', text: '#a8a29e', dot: '#78716c' },
  blocked: { bg: '#2a0a0a', border: '#991b1b', text: '#fca5a5', dot: '#ef4444' },
  in_progress: { bg: '#0c1a3d', border: '#1e40af', text: '#93c5fd', dot: '#3b82f6' },
};

export function MockApp() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeTab, setActiveTab] = useState('meetings');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorTarget, setCursorTarget] = useState({ x: 0, y: 0 });

  // Auto-play demo
  useEffect(() => {
    if (!isInView) return;

    const sequence = async () => {
      setShowCursor(true);

      // Click on Kanban tab
      await wait(1000);
      const kanbanTab = document.getElementById('promo-tab-kanban');
      if (kanbanTab) {
        const rect = kanbanTab.getBoundingClientRect();
        const container = ref.current?.getBoundingClientRect();
        if (container) {
          setCursorTarget({
            x: rect.left - container.left + rect.width / 2,
            y: rect.top - container.top + rect.height / 2,
          });
        }
      }
      await wait(1500);
      setActiveTab('kanban');

      // Click on Dependencies tab
      await wait(1200);
      const depsTab = document.getElementById('promo-tab-dependencies');
      if (depsTab) {
        const rect = depsTab.getBoundingClientRect();
        const container = ref.current?.getBoundingClientRect();
        if (container) {
          setCursorTarget({
            x: rect.left - container.left + rect.width / 2,
            y: rect.top - container.top + rect.height / 2,
          });
        }
      }
      await wait(1500);
      setActiveTab('dependencies');

      // Hide cursor
      await wait(2000);
      setShowCursor(false);
    };

    sequence();
  }, [isInView]);

  // Animate cursor position
  useEffect(() => {
    if (!showCursor) return;
    const duration = 800;
    const start = { x: cursorPos.x, y: cursorPos.y };
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCursorPos({
        x: start.x + (cursorTarget.x - start.x) * eased,
        y: start.y + (cursorTarget.y - start.y) * eased,
      });
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [cursorTarget, showCursor]);

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[16/10] rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/50"
    >
      {/* Fake cursor */}
      {showCursor && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-50 pointer-events-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.44 0 .66-.53.35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      )}

      {/* App header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="font-semibold text-white">Syntheon Hub</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <ChevronLeft className="w-4 h-4" />
            <span>Projects</span>
            <span className="text-white/30">/</span>
            <span className="text-white">Auth Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white/60">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <span className="text-xs text-white/30">⌘K</span>
          </div>
          <Bell className="w-5 h-5 text-white/50" />
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-400 font-medium">
            B
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-56px)]">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/10 bg-[#0a0a0a] p-4 flex flex-col gap-1">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">Menu</div>
          {['Dashboard', 'Meetings', 'Members', 'Calendar', 'Tickets', 'Settings'].map((item) => (
            <div
              key={item}
              className={`px-3 py-2 rounded-lg text-sm ${item === 'Meetings' ? 'bg-white/10 text-white' : 'text-white/50'}`}
            >
              {item}
            </div>
          ))}
          <div className="mt-6 text-xs text-white/40 uppercase tracking-wider mb-2 px-3">
            Projects
          </div>
          <div className="px-3 py-2 rounded-lg bg-white/10 text-sm text-white flex items-center justify-between">
            <span>Auth Dashboard</span>
            <Plus className="w-3.5 h-3.5 text-white/50" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 py-4 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`promo-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6 overflow-hidden">
            {activeTab === 'meetings' && <MeetingsView />}
            {activeTab === 'kanban' && <KanbanView />}
            {activeTab === 'dependencies' && <DependenciesView />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] text-white">Meetings</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white/80">
            <Video className="w-4 h-4" />
            New meeting
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {meetings.map((meeting, i) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium text-sm">{meeting.title}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                  meeting.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {meeting.status}
              </span>
            </div>
            <p className="text-white/40 text-xs mb-3">google-meet · {meeting.date}</p>
            <button className="text-xs text-white/60 flex items-center gap-1 hover:text-white transition-colors">
              Open meeting <ChevronLeft className="w-3 h-3 rotate-180" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function KanbanView() {
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] text-white">Kanban</h2>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5 bg-white/5">
          {['All', 'Mine', 'Unassigned'].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1 rounded-md text-xs text-white/60 hover:text-white"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {stages.map((stage) => {
          const stageTickets = tickets.filter((t) => t.status === stage.id);
          return (
            <div
              key={stage.id}
              className="min-w-[260px] w-[260px] rounded-xl border border-white/10 bg-white/[0.02] flex flex-col"
            >
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: stage.color }}
                >
                  {stage.label}
                </span>
                <span className="text-xs text-white/40">{stageTickets.length}</span>
              </div>
              <div className="p-2 flex flex-col gap-2">
                {stageTickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="p-3 rounded-lg border border-white/10 bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[ticket.status]?.dot }}
                      />
                      <span className="text-sm text-white/90 font-medium">{ticket.title}</span>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2">{ticket.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DependenciesView() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <GitBranch className="w-4 h-4 text-green-500" />
          Dependency Graph
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/60">
            5 tickets · 2 links
          </span>
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <marker
              id="arrowhead-soft-promo"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#a8a29e" />
            </marker>
            <marker
              id="arrowhead-hard-promo"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
          <g transform="translate(60, 80)">
            {deps.map((dep, i) => {
              const from = graphTickets.find((t) => t.id === dep.from);
              const to = graphTickets.find((t) => t.id === dep.to);
              if (!from || !to) return null;
              const x1 = from.x + 180;
              const y1 = from.y + 28;
              const x2 = to.x;
              const y2 = to.y + 28;
              const mx = (x1 + x2) / 2;
              return (
                <motion.path
                  key={i}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.3 }}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={dep.hard ? '#ef4444' : '#a8a29e'}
                  strokeWidth={dep.hard ? 2 : 1.5}
                  strokeDasharray={dep.hard ? undefined : '5,4'}
                  markerEnd={`url(#arrowhead-${dep.hard ? 'hard' : 'soft'}-promo)`}
                />
              );
            })}
            {graphTickets.map((ticket, i) => {
              const colors = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.backlog;
              return (
                <motion.g
                  key={ticket.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  transform={`translate(${ticket.x}, ${ticket.y})`}
                >
                  <rect
                    width="180"
                    height="56"
                    rx="10"
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth="1.5"
                  />
                  <circle cx="16" cy="28" r="5" fill={colors.dot} />
                  <text x="28" y="24" fontSize="11" fontWeight="600" fill={colors.text}>
                    {ticket.title}
                  </text>
                  <text x="28" y="40" fontSize="9.5" fill={colors.text} opacity="0.7">
                    {ticket.status}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="h-full flex items-center justify-center text-white/40">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <p>Analytics view</p>
      </div>
    </div>
  );
}
