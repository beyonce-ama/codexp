import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import {
  Target, Trophy, Star, Zap, Swords, Clock,
  TrendingUp, CheckCircle, Loader2, RefreshCw,
  BookOpen, GamepadIcon, Users, Activity,
  Calendar, Award, Code, ArrowRight,
  Crown, Cpu, Brain, Medal
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Dashboard', href: '/dashboard' }
];

/* ---------- XP helpers (start at Level 1) ---------- */
const getLevel = (totalXP: number) => Math.floor(totalXP / 10) + 1; // Level 1 for 0–9 XP
const getCurrentLevelXP = (totalXP: number) => totalXP % 10;        // per-level XP (out of 10)
const calculateProgress = (totalXP: number) => (getCurrentLevelXP(totalXP) / 10) * 100;

/* ---------- Types ---------- */
interface LanguageStat {
  id: number;
  language: string;
  games_played: number;
  wins: number;
  losses: number;
  winrate: number;
  solo_completed: number;
}

interface RecentAttempt {
  id: number;
  is_correct: boolean;
  time_spent_sec: number;
  xp_earned: number;
  stars_earned: number;
  created_at: string;
  challenge: {
    title: string;
    mode: string;
    difficulty: string;
  };
}

interface RecentDuel {
  id: number;
  status: string;
  language: string;
  created_at: string;
  challenger: { name: string };
  opponent: { name: string };
  winner?: { name: string };
}

interface DashboardData {
  user: any;
  ai_stats: {
    ai_attempts: number;
    ai_successful_attempts: number;
  };
  totals: {
    xp: number;
    stars: number;
  };
  solo_stats: {
    total_attempts: number;
    successful_attempts: number;
    attempts_today: number;
    completed_challenge_ids: number[];
  };
  solo_attempts: number;
  successful_attempts: number;
  attempts_today: number;
  completed_challenge_ids: number[];
  duels_played: number;
  duels_won: number;
  duels_as_challenger: number;
  duels_as_opponent: number;
  duels_today: number;
  language_stats: LanguageStat[];
  recent_solo_attempts: RecentAttempt[];
  recent_duels: RecentDuel[];
}

interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  stars: number;
  total_xp: number;
  level: number;
}

export default function ParticipantDashboard() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAll(true);
  }, []);

  const fetchAll = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);

      const [meRes, lbRes] = await Promise.all([
        apiClient.get('/api/me/stats'),
        apiClient.get('/api/users/participants'), // ← server route unchanged
      ]);

      if (meRes?.success && meRes.data) {
        setStats(meRes.data);
        setLastUpdated(new Date());
      }

      // Map participants → leaderboard (compute level + rank)
      if (lbRes?.success && Array.isArray(lbRes.data)) {
        const raw = lbRes.data as Array<{
          id: number;
          name: string;
          email: string;
          stars?: number;
          total_xp?: number;
          profile?: { username?: string; avatar_url?: string | null };
          avatar?: string | null;
        }>;

        const list = raw
          .map((u) => {
            const xp = Number(u.total_xp ?? 0);
            const stars = Number(u.stars ?? 0);
            return {
              id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.profile?.avatar_url ?? u.avatar ?? null,
              total_xp: xp,
              stars,
              level: Math.floor(xp / 10) + 1, // start at Level 1
            };
          })
          // backend already sorted, but keep this for safety:
          .sort((a, b) => (b.total_xp - a.total_xp) || (b.stars - a.stars))
          .map((u, i) => ({ ...u, rank: i + 1 }));

        setLeaderboard(list);
      }
    } catch (err) {
      console.error('Error fetching dashboard/leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAll(false);
    } finally {
      setRefreshing(false);
    }
  };

  /* ---------------- UI Helpers ---------------- */
  const Section = ({ title, right, children, className = '' }: any) => (
    <section className={`bg-slate-800/50 border border-slate-700 rounded-2xl p-5 ${className}`}>
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold tracking-wide">{title}</h3>
        {right}
      </header>
      {children}
    </section>
  );

  const StatPill = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number; }) => (
    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3">
      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-base font-semibold text-white">{value}</p>
      </div>
    </div>
  );

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500" style={{ width: `${value}%` }} />
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, description, tone = 'slate' }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    tone?: 'slate' | 'green' | 'indigo' | 'amber' | 'rose' | 'purple' | 'cyan' | 'blue' | 'yellow' | 'red';
  }) => {
    const tones: Record<string, string> = {
      slate: 'bg-slate-900/60 border-slate-700 text-slate-200',
      green: 'bg-emerald-900/30 border-emerald-800 text-emerald-300',
      indigo: 'bg-indigo-900/30 border-indigo-800 text-indigo-300',
      amber: 'bg-amber-900/30 border-amber-800 text-amber-300',
      rose: 'bg-rose-900/30 border-rose-800 text-rose-300',
      purple: 'bg-purple-900/30 border-purple-800 text-purple-300',
      cyan: 'bg-cyan-900/30 border-cyan-800 text-cyan-300',
      blue: 'bg-blue-900/30 border-blue-800 text-blue-300',
      yellow: 'bg-yellow-900/30 border-yellow-800 text-yellow-300',
      red: 'bg-red-900/30 border-red-800 text-red-300',
    };

    return (
      <div className={`rounded-xl border p-4 ${tones[tone]}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg border bg-black/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- Derived metrics ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Dashboard" />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-cyan-400" />
              <div className="text-slate-300">Loading your dashboard…</div>
            </div>
          </div>
        </AppLayout>
      </div>
    );
  }

  const successRate = stats?.solo_stats?.total_attempts ? Math.round((stats.solo_stats.successful_attempts / stats.solo_stats.total_attempts) * 100) : 0;
  const winRate = stats?.duels_played ? Math.round((stats.duels_won / stats.duels_played) * 100) : 0;
  const aiSuccessRate = stats?.ai_stats?.ai_attempts ? Math.round((stats.ai_stats.ai_successful_attempts / stats.ai_stats.ai_attempts) * 100) : 0;

  const totalAttempts = (stats?.solo_stats?.total_attempts || 0) + (stats?.ai_stats?.ai_attempts || 0);
  const totalSuccessfulAttempts = (stats?.solo_stats?.successful_attempts || 0) + (stats?.ai_stats?.ai_successful_attempts || 0);
  const overallSuccessRate = totalAttempts > 0 ? Math.round((totalSuccessfulAttempts / totalAttempts) * 100) : 0;

  const myLevel = getLevel(stats?.totals?.xp || 0);
  const myCurrentXP = getCurrentLevelXP(stats?.totals?.xp || 0);
  const myProgress = calculateProgress(stats?.totals?.xp || 0);

  const medalForRank = (rank: number) => {
    if (rank === 1) return { label: 'Gold', className: 'text-yellow-400', chip: 'bg-yellow-500/15 border-yellow-700' };
    if (rank === 2) return { label: 'Silver', className: 'text-slate-200', chip: 'bg-slate-400/10 border-slate-500' };
    if (rank === 3) return { label: 'Bronze', className: 'text-amber-500', chip: 'bg-amber-500/10 border-amber-600' };
    return { label: '', className: 'text-slate-300', chip: 'bg-slate-800 border-slate-700' };
  };

  /* ---------------- Layout ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />

        {/* HERO */}
        <div className="px-6 pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Activity className="h-7 w-7 text-cyan-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
              </div>
              <p className="text-slate-400">
                Ready for your next coding challenge?
                {lastUpdated && (
                  <span className="text-xs text-slate-500 ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatPill icon={Star} label="Stars" value={stats?.totals?.stars ?? 0} />
              <StatPill icon={Zap} label="Total XP" value={stats?.totals?.xp ?? 0} />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Progress & KPIs */}
          <div className="xl:col-span-2 space-y-6">
            <Section
              title={<div className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-400"/><span>Level & Progress</span></div>}
              right={<div className="text-right text-sm">
                <div className="text-slate-400">Next Level</div>
                <div className="font-semibold text-cyan-300">{10 - myCurrentXP} XP needed</div>
              </div>}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white text-lg font-semibold">Level {myLevel}</span>
                  <span className="text-xs text-slate-400">({myCurrentXP}/10 XP)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                  <StatPill icon={Target} label="Attempts" value={ (stats?.solo_stats?.total_attempts || 0) + (stats?.ai_stats?.ai_attempts || 0) } />
                  <StatPill icon={CheckCircle} label="Success" value={`${overallSuccessRate}%`} />
                  <StatPill icon={Swords} label="Duels" value={stats?.duels_played || 0} />
                  <StatPill icon={Trophy} label="Wins" value={stats?.duels_won || 0} />
                </div>
              </div>
              <ProgressBar value={Math.round(myProgress)} />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Level {myLevel}</span>
                <span>{myCurrentXP} / 10 XP</span>
                <span>Level {myLevel + 1}</span>
              </div>
            </Section>

            <Section title="Your KPIs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total XP" value={stats?.totals?.xp || 0} icon={Zap} tone="yellow" />
                <StatCard title="Total Attempts" value={(stats?.solo_stats?.total_attempts || 0) + (stats?.ai_stats?.ai_attempts || 0)} icon={Target} tone="blue" />
                <StatCard title="Solo Attempts" value={stats?.solo_stats?.total_attempts || 0} icon={Users} tone="indigo" />
                <StatCard title="AI Attempts" value={stats?.ai_stats?.ai_attempts || 0} icon={Cpu} tone="cyan" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <StatCard title="Overall Success" value={`${overallSuccessRate}%`} icon={TrendingUp} description={`${totalSuccessfulAttempts} successful attempts`} tone={overallSuccessRate > 70 ? 'green' : overallSuccessRate > 50 ? 'blue' : 'amber'} />
                <StatCard title="Solo Success" value={`${successRate}%`} icon={CheckCircle} description={`${stats?.solo_stats?.successful_attempts || 0} successful solo attempts`} tone={successRate > 70 ? 'green' : successRate > 50 ? 'blue' : 'amber'} />
                <StatCard title="AI Success" value={`${aiSuccessRate}%`} icon={Brain} description={`${stats?.ai_stats?.ai_successful_attempts || 0} successful AI attempts`} tone={aiSuccessRate > 70 ? 'green' : aiSuccessRate > 50 ? 'blue' : 'amber'} />
              </div>
            </Section>

            <Section title="Duel Performance">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Stars Earned" value={stats?.totals?.stars || 0} icon={Star} description="Achievement stars" tone="purple" />
                <StatCard title="Duels Played" value={stats?.duels_played || 0} icon={Swords} description="Total matches" tone="red" />
                <StatCard title="Duels Won" value={stats?.duels_won || 0} icon={Trophy} description="Victories" tone="green" />
                <StatCard title="Win Rate" value={`${winRate}%`} icon={TrendingUp} description="Success percentage" tone="indigo" />
              </div>
            </Section>

            <Section title="Today's Activity">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-xl bg-blue-900/30 border border-blue-800 mb-2"><Target className="h-6 w-6 text-blue-300" /></div>
                  <p className="text-2xl font-bold text-white">{stats?.solo_stats?.attempts_today || 0}</p>
                  <p className="text-sm text-slate-400">Solo Attempts Today</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-xl bg-rose-900/30 border border-rose-800 mb-2"><Swords className="h-6 w-6 text-rose-300" /></div>
                  <p className="text-2xl font-bold text-white">{stats?.duels_today || 0}</p>
                  <p className="text-sm text-slate-400">Duels Started Today</p>
                </div>
              </div>
            </Section>

            {/* Language Stats */}
            {stats?.language_stats && stats.language_stats.length > 0 && (
              <Section title="Language Proficiency">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.language_stats.map((lang) => (
                    <StatCard
                      key={lang.id}
                      title={lang.language}
                      value={`${lang.winrate}%`}
                      icon={Code}
                      description={`${lang.games_played} games played`}
                      tone={lang.winrate > 70 ? 'green' : lang.winrate > 50 ? 'blue' : 'amber'}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Recents (optional visual candy, pure client-side render from existing data) */}
            {(stats?.recent_solo_attempts?.length || stats?.recent_duels?.length) && (
              <Section title="Recent Activity">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white flex items-center gap-2"><BookOpen className="h-4 w-4 text-cyan-300"/>Recent Solo Attempts</p>
                    <ul className="space-y-2">
                      {(stats?.recent_solo_attempts || []).slice(0, 6).map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate" title={a.challenge?.title}>{a.challenge?.title}</p>
                            <p className="text-[11px] text-slate-400">{a.challenge?.difficulty?.toUpperCase()} • {a.challenge?.mode} • {a.is_correct ? '✅' : '❌'} • {Math.round(a.time_spent_sec)}s</p>
                          </div>
                          <div className="text-xs text-cyan-300 whitespace-nowrap">+{a.xp_earned} XP</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white flex items-center gap-2"><Swords className="h-4 w-4 text-rose-300"/>Recent Duels</p>
                    <ul className="space-y-2">
                      {(stats?.recent_duels || []).slice(0, 6).map((d) => (
                        <li key={d.id} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate" title={`${d.challenger?.name} vs ${d.opponent?.name}`}>{d.challenger?.name} vs {d.opponent?.name}</p>
                            <p className="text-[11px] text-slate-400">{d.language?.toUpperCase()} • {d.status}{d.winner?.name ? ` • Winner: ${d.winner.name}` : ''}</p>
                          </div>
                          <Link href={`/play/duel/${d.id}`} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800">
                            View <ArrowRight className="h-3 w-3"/>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT: Leaderboard */}
          <div className="xl:col-span-1">
            <Section
              title={<div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-400"/><span>Leaderboard</span></div>}
              right={<span className="text-xs text-slate-400">XP • Stars</span>}
              className="sticky top-6"
            >
              {/* Top 3 */}
              {leaderboard.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {leaderboard.slice(0, 3).map((p) => {
                    const m = medalForRank(p.rank);
                    return (
                      <div key={p.id} className={`rounded-xl p-3 border ${m.chip} text-center`}>
                        <div className="flex items-center justify-center gap-1">
                          <Medal className={`h-5 w-5 ${m.className}`} />
                          <span className={`text-sm font-semibold ${m.className}`}>#{p.rank}</span>
                        </div>
                        <div className="mt-1 text-white text-sm font-bold truncate" title={p.name}>{p.name}</div>
                        <div className="text-[11px] text-slate-400">Lvl {p.level}</div>
                        <div className="mt-1 text-xs text-cyan-300">{p.total_xp} XP</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <div className="divide-y divide-slate-700/70">
                {leaderboard.slice(0, 15).map((p) => (
                  <div key={p.id} className="py-3 flex items-center gap-3">
                    <div className="w-8 text-center">
                      <span className={`text-sm font-bold ${p.rank <= 3 ? 'text-yellow-400' : 'text-slate-300'}`}>#{p.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate" title={p.name}>{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/40 border border-cyan-800 text-cyan-300">Lvl {p.level}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.total_xp} XP • <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> {p.stars}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {leaderboard.length === 0 && (
                  <div className="py-8 text-center text-slate-400">No participants yet.</div>
                )}
              </div>
            </Section>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
