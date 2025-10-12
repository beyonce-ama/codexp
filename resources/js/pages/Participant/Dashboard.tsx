import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/utils/api';
import {
  Target, Trophy, Star, Zap, Swords,
  TrendingUp, CheckCircle, Loader2, RefreshCw,
  BookOpen, Users, Activity, ArrowRight,
  Crown, Cpu, Brain, Medal, Code
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
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
  // optional source tag from API: 'duel' | 'live'
  source?: 'duel' | 'live';
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
  // legacy flat fields (kept for compatibility)
  solo_attempts: number;
  successful_attempts: number;
  attempts_today: number;
  completed_challenge_ids: number[];
  // classic duels
  duels_played: number;
  duels_won: number;
  duels_as_challenger: number;
  duels_as_opponent: number;
  duels_today: number;
  // OPTIONAL: live matches (any of these may exist)
  live_played?: number;
  live_won?: number;
  matches_played?: number;
  matches_won?: number;

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
type SoloAchievementItem = {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon_key?: string | null;
  threshold: number;
  xp_reward: number;
  stars_reward: number;
  current: number;
  progress: number;
  unlocked: boolean;
  claimed?: boolean;
  can_claim?: boolean;
};


export default function ParticipantDashboard() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [soloAchievements, setSoloAchievements] = useState<SoloAchievementItem[]>([]);
  const [soloCompletedCount, setSoloCompletedCount] = useState<number>(0);
  const [seasonName, setSeasonName] = useState<string>('Current Season');


const scopeChipClass = (scope: string) => {
  switch (scope) {
    case 'Solo':        return 'bg-blue-900/30 border-blue-800 text-blue-300';
    case 'Solo+AI':     return 'bg-indigo-900/30 border-indigo-800 text-indigo-300';
    case 'Invite Duel': return 'bg-rose-900/30 border-rose-800 text-rose-300';
    case 'Live Match':  return 'bg-amber-900/30 border-amber-800 text-amber-300';
    case 'Python':      return 'bg-emerald-900/30 border-emerald-800 text-emerald-300';
    case 'Java':        return 'bg-orange-900/30 border-orange-800 text-orange-300';
     case 'C++':        return 'bg-blue-900/30 border-blue-800 text-blue-300';
    default:            return 'bg-slate-900/30 border-slate-700 text-slate-300';
  }
};
type AnyObj = Record<string, any>;
// replace your current normalizeAvatar with this:
const normalizeAvatar = (v?: string | null) => {
  if (!v) return null;
  const s = String(v).trim();

  // already absolute or data URL → leave it
  if (/^(https?:\/\/|data:)/i.test(s)) return s;

  // already root-relative → leave it
  if (s.startsWith('/')) return s;

  // common relative paths → make root-relative
  if (s.startsWith('avatars/') || s.startsWith('storage/')) return `/${s}`;

  // plain filename (e.g., "girl3.png") → assume lives under /avatars
  return `/avatars/${s}`;
};

const scopeFromCode = (code: string) => {
  if (!code) return 'General';
  if (code.startsWith('SOLO_AI_'))   return 'Solo+AI';
  if (code.startsWith('SOLO_'))      return 'Solo';
  if (code.startsWith('PVP_INVITE_'))return 'Invite Duel';
  if (code.startsWith('PVP_LIVE_'))  return 'Live Match';
  if (code.startsWith('LANG_PY_'))   return 'Python';
  if (code.startsWith('LANG_JAVA_')) return 'Java';
  if (code.startsWith('LANG_CPP_')) return 'C++';
  return 'General';
};

const looksLikeAchievement = (x: any) =>
  x && typeof x === 'object' && (
    'code' in x || 'threshold' in x || 'xp_reward' in x || 'name' in x || 'goal' in x
  );

const coerceAchievement = (x: AnyObj) => {
  const threshold = Number(x.threshold ?? x.goal ?? 0);
  const current   = Number(x.current ?? x.count ?? 0);

  // Prefer backend-provided progress if present
  const progressRaw =
    x.progress != null
      ? Number(x.progress)
      : (threshold > 0 ? Math.min(100, Math.round((current / threshold) * 100)) : 0);
  const progress = Number.isFinite(progressRaw) ? Math.max(0, Math.min(100, progressRaw)) : 0;

  // Treat progress>=100 as completed if backend didn't supply unlocked/can_claim
  const unlockedDerived =
    (threshold > 0 && current >= threshold) || progress >= 100;

  const claimed   = Boolean(x.claimed ?? x.is_claimed ?? false);
  const unlocked  = Boolean(x.unlocked ?? unlockedDerived);
  const can_claim = Boolean(x.can_claim ?? (unlocked && !claimed));

  const codeVal  = (x.code ?? x.key ?? x.name ?? '');
  const nameVal  = (x.name ?? x.title ?? x.code);
  const descVal  = (x.description ?? x.desc);
  const iconVal  = (x.icon_key ?? x.icon);
  const xpVal    = (x.xp_reward ?? x.xp);
  const starVal  = (x.stars_reward ?? x.stars);
  const scopeVal = (x.scope ?? x.category ?? x.group);

  return {
    id: Number.isFinite(Number(x.id)) ? Number(x.id) : undefined,
    code: String(codeVal),
    name: String(nameVal ?? 'Achievement'),
    description: descVal ?? undefined,
    icon_key: iconVal ?? null,
    threshold,
    current,
    progress,
    unlocked,
    claimed,
    can_claim,
    xp_reward: Number(xpVal ?? 0),
    stars_reward: Number(starVal ?? 0),
    __scope: scopeVal ?? scopeFromCode(String(codeVal)),
  } as SoloAchievementItem & { __scope?: string };
};

const flattenAchievements = (root: any): SoloAchievementItem[] => {
  const out: Array<SoloAchievementItem & { __scope?: string }> = [];

  const walk = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;

    if (looksLikeAchievement(node)) {
      out.push(coerceAchievement(node));
      return;
    }

    const candidates = [node.items, node.achievements, node.tasks, node.groups, node.categories, node.data]
      .filter(Boolean);
    if (candidates.length) candidates.forEach(walk);
    else Object.values(node).forEach(walk);
  };

  walk(root);

  // de-dupe: prefer id; else code+scope
  const seen = new Set<string>();
  return out.filter(a => {
    const key = a.id != null ? `id:${a.id}` : `code:${a.code}|scope:${a.__scope ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

  useEffect(() => {
    fetchAll(true);
  }, []);

  const fetchAll = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);

     const [meRes, lbRes, achRes] = await Promise.all([
        apiClient.get('/api/me/stats'),
        apiClient.get('/api/users/participants'),
        apiClient.get('/api/achievements/progress'),
      ]);

        const achRoot =
          achRes?.data?.items ??
          achRes?.data?.data  ??
          achRes?.data        ??
          achRes;

        const flat = flattenAchievements(achRoot);
        setSoloAchievements(flat);
        // Auto-claim any newly earned achievements so they don't linger in Tasks
        if (AUTO_CLAIM_NEWLY_EARNED) {
          const claimables = flat.filter(a => a.can_claim);
          for (const a of claimables) {
            try {
              const res = await apiClient.post('/api/achievements/claim', { achievement_id: a.id });
              const xp = res?.data?.xp_reward ?? a.xp_reward ?? 0;
              const stars = res?.data?.stars_reward ?? a.stars_reward ?? 0;
              pushToast({ name: a.name, xp, stars, icon_key: a.icon_key ?? undefined });
            } catch (e) {
              console.error('Auto-claim failed', a.id, e);
            }
          }
        }
        setSoloCompletedCount(
          Number(
            achRoot?.solo_completed ??
            achRoot?.completed ??
            achRes?.data?.solo_completed ??
            0
          )
        );
      if (meRes?.success && meRes.data) {
        setStats(meRes.data as DashboardData);
        setLastUpdated(new Date());
      }

     if (lbRes?.success) {
  const raw = Array.isArray(lbRes.data)
    ? lbRes.data
    : Array.isArray(lbRes.data?.data)
    ? lbRes.data.data
    : [];

// ✅ Extract and set the current season name from backend
const seasonMeta =
  (lbRes as any)?.season ??
  (lbRes as any)?.data?.season ??
  null;

if (seasonMeta?.name) {
  setSeasonName(seasonMeta.name);
}

  const list = raw
    .map((u) => {
      const sxp   = Number((u as any).total_xp ?? (u as any).season_xp ?? 0);
      const sstar = Number((u as any).stars ?? (u as any).season_stars ?? 0);
      const crowns = Number((u as any).crowns ?? 0);
      const lastRank = (u as any).last_season_rank ?? null;

      const avatar = normalizeAvatar((u as any).avatar ?? u.profile?.avatar ?? null);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar,
        total_xp: sxp,
        stars: sstar,
        level: Math.floor(sxp / 10) + 1,
        crowns,
        last_season_rank: lastRank,
      };
    })
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

  /* ---------------- Derived metrics ---------------- */

  // Prefer USERS.stars, fallback to computed totals.stars
  const myStars =
    (stats as any)?.user?.stars ??
    stats?.totals?.stars ??
    0;

  // Solo success
  const successRate = stats?.solo_stats?.total_attempts
    ? Math.round((stats.solo_stats.successful_attempts / stats.solo_stats.total_attempts) * 100)
    : 0;

  // AI success
  const aiSuccessRate = stats?.ai_stats?.ai_attempts
    ? Math.round((stats.ai_stats.ai_successful_attempts / stats.ai_stats.ai_attempts) * 100)
    : 0;

  // Overall success across solo + AI
  const totalAttempts = (stats?.solo_stats?.total_attempts || 0) + (stats?.ai_stats?.ai_attempts || 0);
  const totalSuccessfulAttempts = (stats?.solo_stats?.successful_attempts || 0) + (stats?.ai_stats?.ai_successful_attempts || 0);
  const overallSuccessRate = totalAttempts > 0 ? Math.round((totalSuccessfulAttempts / totalAttempts) * 100) : 0;

  // ---------- PvP totals (classic duels + live matches) ----------
  // The backend may expose either live_* or matches_* fields; support both.
  const duelsPlayed = stats?.duels_played ?? 0;
  const duelsWon = stats?.duels_won ?? 0;

  const livePlayed = (stats?.live_played ?? stats?.matches_played) ?? 0;
  const liveWon = (stats?.live_won ?? stats?.matches_won) ?? 0;

  const pvpPlayed = duelsPlayed + livePlayed;
  const pvpWon = duelsWon + liveWon;

  // Win Rate across all PvP (classic + live)
  const winRate = pvpPlayed ? Math.round((pvpWon / pvpPlayed) * 100) : 0;
  // My rank (from leaderboard)
const myEntry = leaderboard.find((p) => p.id === user?.id);
const myRank = myEntry?.rank ?? null;

const [claimingId, setClaimingId] = useState<number | null>(null);

// Auto-claim newly earned achievements so they jump to Trophies immediately
const AUTO_CLAIM_NEWLY_EARNED = true;
// NEW: dropdown state (replace/remove showAchModal if you want)
const [achOpen, setAchOpen] = useState(false);

const achBtnRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const onClick = (e: MouseEvent) => {
    if (!achBtnRef.current) return;
    if (!achBtnRef.current.contains(e.target as Node)) setAchOpen(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setAchOpen(false);
  };
  document.addEventListener('mousedown', onClick);
  document.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('mousedown', onClick);
    document.removeEventListener('keydown', onKey);
  };
}, []);

// Minimal toast queue for reward notifications
type RewardToast = { id: string; name: string; xp: number; stars: number; icon_key?: string | null };
const [toasts, setToasts] = useState<RewardToast[]>([]);
const pushToast = (t: Omit<RewardToast, 'id'>) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  setToasts((q) => [...q, { id, ...t }]);
  setTimeout(() => setToasts((q) => q.filter(x => x.id !== id)), 3500);
};


const handleClaim = async (achievementId: number) => {
  try {
    setClaimingId(achievementId);
    const item = soloAchievements.find(a => a.id === achievementId);

    const res = await apiClient.post('/api/achievements/claim', { achievement_id: achievementId });
    const xp = res?.data?.xp_reward ?? item?.xp_reward ?? 0;
    const stars = res?.data?.stars_reward ?? item?.stars_reward ?? 0;

    // theme-consistent toast (no modal)
    pushToast({
      name: item?.name || 'Achievement',
      xp,
      stars,
      icon_key: item?.icon_key ?? undefined
    });

    // refresh so totals & lists update (claimed removed from Tasks, appears in Trophies)
    await fetchAll(false);
  } catch (e) {
    console.error('Claim failed', e);
  } finally {
    setClaimingId(null);
  }
};


  // Level/Progress from total XP
  const myLevel = getLevel(stats?.totals?.xp || 0);
  const myCurrentXP = getCurrentLevelXP(stats?.totals?.xp || 0);
  const myProgress = calculateProgress(stats?.totals?.xp || 0);

  const medalForRank = (rank: number) => {
    if (rank === 1) return { label: 'Gold', className: 'text-yellow-400', chip: 'bg-yellow-500/15 border-yellow-700' };
    if (rank === 2) return { label: 'Silver', className: 'text-slate-200', chip: 'bg-slate-400/10 border-slate-500' };
    if (rank === 3) return { label: 'Bronze', className: 'text-amber-500', chip: 'bg-amber-500/10 border-amber-600' };
    return { label: '', className: 'text-slate-300', chip: 'bg-slate-800 border-slate-700' };
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

  // Trophy icon resolver (shared)
  const TrophyIcon = ({ icon_key }: { icon_key?: string | null }) => {
    if (icon_key) {
      return <img src={`/trophies/${icon_key}.svg`} alt={icon_key || 'trophy'} className="h-5 w-5" />;
    }
    return <Trophy className="h-5 w-5 text-yellow-400" />;
  };

  /* ---------------- Skeleton ---------------- */
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

  /* ---------------- Layout ---------------- */
  return (
    <div className="min-h-screen relative overflow-x-hidden scroll-smooth">
      {/* Background */}
     <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
  <AnimatedBackground />
</div>
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
            {/* === Current Season Stats === */}
<div className="flex flex-col items-start">
  <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{seasonName?.toUpperCase() || 'CURRENT SEASON'}</p>
  <div className="flex items-center gap-3 flex-wrap">
    {myRank != null && <StatPill icon={Medal} label="Rank" value={`#${myRank}`} />}
    <StatPill
      icon={Star}
      label="Season Stars"
      value={leaderboard.find((p) => p.id === user?.id)?.stars ?? 0}
    />
    <StatPill
      icon={Zap}
      label="Season XP"
      value={leaderboard.find((p) => p.id === user?.id)?.total_xp ?? 0}
    />
  </div>
</div>

{/* Achievements dropdown trigger + panel */}
<div ref={achBtnRef} className="relative">
  <button
    onClick={() => setAchOpen((v) => !v)}
    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 text-white hover:bg-slate-700"
    title="View Achievements"
  >
    <Trophy className="h-4 w-4 text-yellow-400" />
    <span>Achievements</span>
  </button>

  <AnimatePresence>
    {achOpen && (
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
        className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] z-[60]"
      >
        <div className="rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h3 className="text-white font-semibold tracking-wide text-sm">Achievements</h3>
            </div>
            <button
              onClick={() => setAchOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 w-7 h-7"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Trophies (claimed) */}
          <div className="mb-4">
            <p className="text-[11px] text-slate-400 mb-2">My Trophies</p>
            <div className="flex flex-wrap gap-2">
              {soloAchievements.filter(a => a.claimed).length === 0 ? (
                <span className="text-slate-500 text-xs">No trophies yet.</span>
              ) : (
                soloAchievements
                    .filter(a => a.claimed)
                    .slice(0, 12)
                    .map(a => (
                    <div key={a.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1">
                      {a.icon_key
                        ? <img src={`/trophies/${a.icon_key}.svg`} alt={a.icon_key || 'trophy'} className="h-4 w-4" />
                        : <Trophy className="h-4 w-4 text-yellow-400" />
                      }
                      <span className="text-[11px] text-white truncate max-w-[180px]" title={a.name}>{a.name}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Tasks (unclaimed) */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Tasks</p>

            {soloAchievements.filter(a => !a.claimed).length === 0 ? (
              <div className="text-slate-400 text-sm">No tasks available.</div>
            ) : (
              (() => {
                const score = (a: SoloAchievementItem) => (a.can_claim ? 3 : a.unlocked ? 2 : a.progress > 0 ? 1 : 0);
                const tasksAll = [...soloAchievements]
                  .filter(a => !a.claimed)
                  .sort((a, b) => {
                    const s = score(b) - score(a);
                    return s !== 0 ? s : (b.progress - a.progress);
                  });

                return (
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                    {tasksAll.slice(0, 8).map(item => {
                      const scope = scopeFromCode(item.code);
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-3 ${item.unlocked ? 'bg-yellow-900/10 border-yellow-800' : 'bg-slate-900/60 border-slate-700'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg border bg-black/20">
                              {item.icon_key
                                ? <img src={`/trophies/${item.icon_key}.svg`} className="h-5 w-5" />
                                : <Trophy className="h-5 w-5 text-yellow-400" />
                              }
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-white font-medium truncate" title={item.name}>{item.name}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${scopeChipClass(scope)}`}>
                                    {scope}
                                  </span>
                                </div>

                                {item.can_claim ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-900/30 border border-amber-800 text-amber-300">
                                    Ready to claim
                                  </span>
                                ) : item.unlocked ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-900/20 border border-yellow-800 text-yellow-300">
                                    Completed
                                  </span>
                                ) : item.progress > 0 ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-900/30 border border-cyan-800 text-cyan-300">
                                    In progress
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-600 text-slate-300">
                                    Locked
                                  </span>
                                )}
                              </div>

                              <div className="mt-2">
                                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${item.unlocked ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                  <span>{Math.min(item.current, item.threshold)} / {item.threshold}</span>
                                  <span>{item.progress}%</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <div className="text-[10px] text-slate-400">
                                    Reward: <span className="text-white font-medium">+{item.xp_reward} XP</span> •{" "}
                                    <span className="inline-flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-400" /> {item.stars_reward}
                                    </span>
                                  </div>

                                  {item.can_claim && (
                                    <button
                                      onClick={() => handleClaim(item.id)}
                                      disabled={claimingId === item.id}
                                      className="text-[11px] inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-yellow-700 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/20 disabled:opacity-60"
                                    >
                                      {claimingId === item.id ? (
                                        <>
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          Claiming…
                                        </>
                                      ) : (
                                        <>
                                          <Trophy className="h-3.5 w-3.5" />
                                          Claim
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

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
                {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                  <StatPill icon={Target} label="Attempts" value={(stats?.solo_stats?.total_attempts || 0) + (stats?.ai_stats?.ai_attempts || 0)} />
                  <StatPill icon={CheckCircle} label="Success" value={`${overallSuccessRate}%`} />
                  <StatPill icon={Swords} label="Duels" value={pvpPlayed} />
                  <StatPill icon={Trophy} label="Wins" value={pvpWon} />
                </div> */}
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
                <StatCard
                  title="Overall Success"
                  value={`${overallSuccessRate}%`}
                  icon={TrendingUp}
                  description={`${totalSuccessfulAttempts} successful attempts`}
                  tone={overallSuccessRate > 70 ? 'green' : overallSuccessRate > 50 ? 'blue' : 'amber'}
                />
                <StatCard
                  title="Solo Success"
                  value={`${successRate}%`}
                  icon={CheckCircle}
                  description={`${stats?.solo_stats?.successful_attempts || 0} successful solo attempts`}
                  tone={successRate > 70 ? 'green' : successRate > 50 ? 'blue' : 'amber'}
                />
                <StatCard
                  title="AI Success"
                  value={`${aiSuccessRate}%`}
                  icon={Brain}
                  description={`${stats?.ai_stats?.ai_successful_attempts || 0} successful AI attempts`}
                  tone={aiSuccessRate > 70 ? 'green' : aiSuccessRate > 50 ? 'blue' : 'amber'}
                />
              </div>
            </Section>

            <Section title="Duel Performance">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Stars Earned" value={myStars} icon={Star} description="Achievement stars" tone="purple" />
                <StatCard title="Duels Played" value={pvpPlayed} icon={Swords} description="Total matches (invite + live)" tone="red" />
                <StatCard title="Duels Won" value={pvpWon} icon={Trophy} description="Victories (invite + live)" tone="green" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols- gap-4">
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

            {/* Recents */}
            {/* {(stats?.recent_solo_attempts?.length || stats?.recent_duels?.length) && (
              <Section title="Recent Activity">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-cyan-300"/>Recent Solo Attempts
                    </p>
                    <ul className="space-y-2">
                      {(stats?.recent_solo_attempts || []).slice(0, 6).map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate" title={a.challenge?.title}>{a.challenge?.title}</p>
                            <p className="text-[11px] text-slate-400">
                              {a.challenge?.difficulty?.toUpperCase()} • {a.challenge?.mode} • {a.is_correct ? '✅' : '❌'} • {Math.round(a.time_spent_sec)}s
                            </p>
                          </div>
                          <div className="text-xs text-cyan-300 whitespace-nowrap">+{a.xp_earned} XP</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      <Swords className="h-4 w-4 text-rose-300"/>Recent Duels
                    </p>
                    <ul className="space-y-2">
                      {(stats?.recent_duels || []).slice(0, 6).map((d) => (
                        <li key={d.id} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate" title={`${d.challenger?.name} vs ${d.opponent?.name}`}>
                              {d.challenger?.name} vs {d.opponent?.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {d.language?.toUpperCase()} • {d.status}{d.winner?.name ? ` • Winner: ${d.winner.name}` : ''}{d.source ? ` • ${d.source}` : ''}
                            </p>
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
            )} */}
          </div>

          {/* RIGHT: Leaderboard */}
        {/* RIGHT COLUMN */}
<div className="xl:col-span-1">

  {/* Leaderboard FIRST (sticky) */}
 <Section
  title={
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <span>Leaderboard</span>
      </div>
      <span className="text-xs text-slate-400 mt-1">{seasonName}</span>
    </div>
  }

    right={<span className="text-xs text-slate-400">XP • Stars</span>}
    className="xl:sticky xl:top-4 xl:self-start"
  >
    {/* Top 3 */}
    {leaderboard.slice(0, 3).length > 0 && (
      <div className="grid grid-cols-3 gap-3 mb-4">
        {leaderboard.slice(0, 3).map((p) => {
          const m = medalForRank(p.rank);
          return (
            <div key={p.id} className={`rounded-xl p-3 border ${m.chip} text-center`}>
              <div className="mt-2 mx-auto w-12 h-12 rounded-full overflow-hidden ring-1 ring-slate-700/60">
                <img
                  src={p.avatar || '/avatars/default.png'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
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
    <div className="divide-y divide-slate-700/70 overflow-y-visible no-scrollbar">
        {leaderboard.slice(3, 15).map((p) => (
        <div key={p.id} className="py-3 flex items-center gap-3">
          <div className="w-8 text-center">
            <span className={`text-sm font-bold ${p.rank <= 3 ? 'text-yellow-400' : 'text-slate-300'}`}>#{p.rank}</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-700/60 shrink-0">
            <img
              src={p.avatar || '/avatars/default.png'}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-white font-medium truncate ${p.id === user?.id ? 'underline decoration-dotted' : ''}`} title={p.name}>
                {p.id === user?.id ? 'You' : p.name}
              </span>
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

    {/* If user is not in top 15, show a pinned row for them */}
    {myRank != null && myRank > 15 && (
      <div className="mt-3 rounded-xl border border-cyan-800 bg-cyan-900/20 p-3">
        <div className="text-xs text-slate-400 mb-1">Your Position</div>
        <div className="flex items-center gap-3">
          <div className="w-8 text-center">
            <span className="text-sm font-bold text-cyan-300">#{myRank}</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-700/60 shrink-0">
            <img
              src={normalizeAvatar(user?.profile?.avatar ?? (user as any)?.avatar ?? null) || '/avatars/default.png'}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">You</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/40 border border-cyan-800 text-cyan-300">
                Lvl {myLevel}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {stats?.totals?.xp ?? 0} XP • <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> {myStars}</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </Section>


</div>

          
        </div>

{/* Reward toasts (bottom-right) */}
<div className="fixed top-4 right-4 z-[60] space-y-2">
  {toasts.map(t => (
    <div
      key={t.id}
      className="flex items-center gap-3 rounded-xl border border-yellow-700 bg-slate-900/90 backdrop-blur px-4 py-3 shadow-lg"
    >
      <div className="p-2 rounded-lg border border-yellow-700 bg-yellow-500/10">
        {t.icon_key
          ? <img src={`/trophies/${t.icon_key}.svg`} className="h-5 w-5" />
          : <Trophy className="h-5 w-5 text-yellow-400" />
        }
      </div>
      <div className="min-w-0">
        <p className="text-sm text-white font-semibold truncate" title={t.name}>Achievement Unlocked: {t.name}</p>
        <p className="text-xs text-slate-300">
          +{t.xp} XP • <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> {t.stars}</span>
        </p>
      </div>
    </div>
  ))}
</div>

      </AppLayout>
             <style>{`
  .no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
    </div>
  );
}
