// resources/js/Pages/Admin/Dashboard.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, Users, Code, Trophy, Target,
  TrendingUp, AlertTriangle, Loader2,
  ArrowUpRight, RefreshCw, Eye,
  MessageSquare, GamepadIcon, CheckCircle,
  Zap, BookOpen, Swords, UserPlus, BarChart3, Shield
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Admin', href: '/dashboard' },
];

/* ---------------- Types ---------------- */
/* ---------------- Types ---------------- */
type AdminStats = {
  total_users: number;
  admin_users: number;
  participant_users: number;
  new_users_today: number;

  // Challenges
  total_solo_challenges: number;
  solo_python_challenges: number;
  solo_java_challenges: number;
  solo_cpp_challenges?: number;
  solo_easy: number;
  solo_medium: number;
  solo_hard: number;
  duel_cpp_challenges?: number; 

  total_1v1_challenges: number;
  duel_python_challenges: number;
  duel_java_challenges: number;
  duel_easy: number;
  duel_medium: number;
  duel_hard: number;

  // Activity
  total_solo_attempts: number;
  successful_solo_attempts: number;
  total_duels: number;
  completed_duels: number;
  pending_duels: number;

  // Today
  solo_attempts_today: number;
  duels_today: number;

  // Feedback
  total_feedbacks: number;
  open_feedbacks: number;
  resolved_feedbacks: number;

  // Lang attempts
  python_attempts: number;
  java_attempts: number;
  cpp_attempts?: number; 

  total_characters: number;
};

/* ---------------- Tiny UI helpers (same feel as user side) ---------------- */
const chip = (text: string, tone: 'blue'|'green'|'yellow'|'red'|'purple'|'slate'='slate') => {
  const toneMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/10 text-green-300 border-green-500/30',
    yellow:'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    red:  'bg-red-500/10 text-red-300 border-red-500/30',
    purple:'bg-purple-500/10 text-purple-300 border-purple-500/30',
    slate:'bg-white/5 text-slate-300 border-white/10',
  };
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded-md border ${toneMap[tone]} inline-flex items-center gap-1`}>
      {text}
    </span>
  );
};

function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'slate',
  hint,
}: {
  icon: any; label: string; value: string|number; tone?: 'blue'|'green'|'yellow'|'red'|'purple'|'slate'; hint?: string;
}) {
  const ring: Record<string, string> = {
    blue: 'ring-blue-500/20 hover:ring-blue-500/40',
    green:'ring-green-500/20 hover:ring-green-500/40',
    yellow:'ring-yellow-500/20 hover:ring-yellow-500/40',
    red:  'ring-red-500/20 hover:ring-red-500/40',
    purple:'ring-purple-500/20 hover:ring-purple-500/40',
    slate:'ring-white/10 hover:ring-white/20',
  };
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition ring-1 ${ring[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border border-white/10 bg-white/5`}>
            <Icon className="h-5 w-5 text-white/90" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
          </div>
        </div>
        {hint ? chip(hint, tone) : null}
      </div>
    </div>
  );
}

/* Sticky Section like the user side (title on left, Show/Hide button on right) */
function Section({
  title,
  right,
  children,
  className = '',
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="sticky top-6 z-10 mb-3">
        <div className="flex items-center justify-between bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
          <div className="flex items-center gap-2">
            {title}
          </div>
          <div className="flex items-center gap-2">
            {right}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // show/hide per section (like user side)
  const [showUsers, setShowUsers] = useState(true);
  const [showChallenges, setShowChallenges] = useState(true);
  const [showPlatform, setShowPlatform] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [showLang, setShowLang] = useState(true);
  const [showQuick, setShowQuick] = useState(true);

  const successRate = useMemo(() => {
    if (!stats) return '0%';
    const total = Number(stats.total_solo_attempts || 0);
    const success = Number(stats.successful_solo_attempts || 0);
    if (total <= 0) return '0%';
    return `${Math.round((success / total) * 100)}%`;
  }, [stats]);

  async function fetchDashboardData(isRefresh = false) {
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await apiClient.get('/dashboard/stats');
      if (res?.success && res?.data) {
        setStats(res.data as AdminStats);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load dashboard stats.');
      }
    } catch (e: any) {
      console.error(e);
      setError('Unable to fetch data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Admin" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-300" />
              <div className="text-gray-300">Loading admin dashboard…</div>
            </div>
          </div>
        </AppLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Admin" />

        <div className="p-4 space-y-6">
          {/* Hero header bar (thin, like user side) */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 p-4 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                  <LayoutGrid className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">Admin Dashboard</h1>
                  <p className="text-white/80 text-sm">
                    Welcome back, {user?.name || 'Admin'}.
                    {lastUpdated && <span className="ml-2 text-white/60">Updated {lastUpdated.toLocaleTimeString()}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chip(`Success ${successRate}`, 'green')}
                {chip(`${stats?.pending_duels ?? 0} Active Duels`, 'purple')}
                <button
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </div>
            </div>
          </div>

          {/* USERS */}
          <Section
            className="mb-4"
            title={
              <>
                <Users className="h-5 w-5 text-blue-300" />
                <span className="text-white font-semibold">User Management</span>
              </>
            }
            right={
              <button
                onClick={() => setShowUsers(s => !s)}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
              >
                {showUsers ? 'Hide' : 'Show'}
              </button>
            }
          >
            {showUsers && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile icon={Users} label="Total Users" value={stats?.total_users ?? 0} tone="blue" hint="All time" />
                <StatTile icon={Target} label="Participants" value={stats?.participant_users ?? 0} tone="green" hint="Active" />
                <StatTile icon={Eye} label="Admins" value={stats?.admin_users ?? 0} tone="purple" hint="Privileged" />
                <StatTile icon={TrendingUp} label="New Today" value={stats?.new_users_today ?? 0} tone="yellow" hint="24h" />
              </div>
            )}
          </Section>
          
          {/* PLATFORM ACTIVITY */}
          <Section
            title={
              <>
                <BarChart3 className="h-5 w-5 text-green-300" />
                <span className="text-white font-semibold">Platform Activity</span>
              </>
            }
            right={
              <button
                onClick={() => setShowPlatform(s => !s)}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
              >
                {showPlatform ? 'Hide' : 'Show'}
              </button>
            }
          >
            {showPlatform && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile icon={Target} label="Solo Attempts" value={stats?.total_solo_attempts ?? 0} tone="blue" />
                <StatTile icon={CheckCircle} label="Success Rate" value={successRate} tone="green" />
                <StatTile icon={GamepadIcon} label="Active Duels" value={stats?.pending_duels ?? 0} tone="purple" />
                <StatTile icon={MessageSquare} label="Open Feedback" value={stats?.open_feedbacks ?? 0} tone="yellow" />
              </div>
            )}
          </Section>

         {/* TODAY’S ACTIVITY */}
<Section
  title={
    <>
      <Shield className="h-5 w-5 text-cyan-300" />
      <span className="text-white font-semibold">Today&apos;s Activity</span>
    </>
  }
  right={
    <button
      onClick={() => setShowToday(s => !s)}
      className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
    >
      {showToday ? 'Hide' : 'Show'}
    </button>
  }
>
  {showToday && (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 grid gap-4 md:grid-cols-2">
      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-white/10 bg-white/10">
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-white/90">Solo Attempts</span>
        </div>
        <span className="text-lg font-bold text-white">{stats?.solo_attempts_today ?? 0}</span>
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-white/10 bg-white/10">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-white/90">New Duels</span>
        </div>
        <span className="text-lg font-bold text-white">{stats?.duels_today ?? 0}</span>
      </div>
    </div>
  )}
</Section>

{/* CHALLENGE MANAGEMENT */}
<Section
  title={
    <>
      <Trophy className="h-5 w-5 text-yellow-300" />
      <span className="text-white font-semibold">Challenge Management</span>
    </>
  }
  right={
    <button
      onClick={() => setShowChallenges(s => !s)}
      className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
    >
      {showChallenges ? 'Hide' : 'Show'}
    </button>
  }
>
  {showChallenges && (
    <div className="space-y-8">
      {/* SOLO */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">Solo Challenges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatTile icon={BookOpen} label="Total Solo" value={stats?.total_solo_challenges ?? 0} tone="slate" />
          <StatTile icon={Code} label="Python" value={stats?.solo_python_challenges ?? 0} tone="blue" />
          <StatTile icon={Code} label="Java" value={stats?.solo_java_challenges ?? 0} tone="red" />
          <StatTile icon={Code} label="C++" value={stats?.solo_cpp_challenges ?? 0} tone="purple" />
          <StatTile icon={Target} label="Easy" value={stats?.solo_easy ?? 0} tone="green" />
          <StatTile icon={Target} label="Medium" value={stats?.solo_medium ?? 0} tone="yellow" />
          <StatTile icon={Target} label="Hard" value={stats?.solo_hard ?? 0} tone="purple" />
        </div>
      </div>

      {/* 1v1 */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">1v1 Challenges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatTile icon={Swords} label="Total 1v1" value={stats?.total_1v1_challenges ?? 0} tone="slate" />
          <StatTile icon={Code} label="Python" value={stats?.duel_python_challenges ?? 0} tone="blue" />
          <StatTile icon={Code} label="Java" value={stats?.duel_java_challenges ?? 0} tone="red" />
          <StatTile icon={Code} label="C++" value={stats?.duel_cpp_challenges ?? 0} tone="purple" />
          <StatTile icon={Target} label="Easy" value={stats?.duel_easy ?? 0} tone="green" />
          <StatTile icon={Target} label="Medium" value={stats?.duel_medium ?? 0} tone="yellow" />
          <StatTile icon={Target} label="Hard" value={stats?.duel_hard ?? 0} tone="purple" />
        </div>
      </div>
    </div>
  )}
</Section>

{/* LANGUAGE POPULARITY */}
<Section
  title={
    <>
      <Code className="h-5 w-5 text-emerald-300" />
      <span className="text-white font-semibold">Language Popularity</span>
    </>
  }
  right={
    <button
      onClick={() => setShowLang(s => !s)}
      className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
    >
      {showLang ? 'Hide' : 'Show'}
    </button>
  }
>
  {showLang && (
    <div className="grid md:grid-cols-3 gap-4">
      <StatTile icon={Code} label="Python Attempts" value={stats?.python_attempts ?? 0} tone="blue" />
      <StatTile icon={Code} label="Java Attempts" value={stats?.java_attempts ?? 0} tone="red" />
      <StatTile icon={Code} label="C++ Attempts" value={stats?.cpp_attempts ?? 0} tone="purple" />
    </div>
  )}
</Section>



          {/* Footer tiny stat */}
          {/* <div className="text-xs text-white/50">
            {typeof stats?.total_characters === 'number' && (
              <span>Total Characters Generated: {stats.total_characters}</span>
            )}
            {error && <span className="ml-3 text-red-300">{error}</span>}
          </div> */}
        </div>
      </AppLayout>
    </div>
  );
}
