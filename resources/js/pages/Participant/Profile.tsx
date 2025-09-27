// resources/js/Pages/Participant/profile.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  User, Camera, Trophy, Target, Star, Zap, Code, Calendar, Mail, Shield,
  RefreshCw, Award, TrendingUp, Swords, CheckCircle, X, Activity, BarChart3
} from 'lucide-react';
import { apiClient } from '@/utils/api';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Link } from '@inertiajs/react';
import { Settings } from 'lucide-react';

/* ---------- Breadcrumbs ---------- */
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'My Profile', href: '/profile' }
];

/* ---------- Types (aligned with Dashboard.tsx) ---------- */
interface LanguageStat {
  id?: number;
  language: string;
  games_played: number;
  wins: number;
  losses?: number;
  winrate: number;          // already in 0..100 (as in dashboard)
  solo_completed: number;
}

interface DashboardDataLike {
  user?: { stars?: number };
  totals?: { xp: number; stars?: number };
  ai_stats?: { ai_attempts: number; ai_successful_attempts: number };
  solo_stats?: {
    total_attempts: number;
    successful_attempts: number;
    attempts_today?: number;
    completed_challenge_ids?: number[];
  };

  // classic duels (invite)
  duels_played?: number;
  duels_won?: number;
  duels_today?: number;

  // live matches (optional keys; dashboard supports both)
  live_played?: number;
  live_won?: number;
  matches_played?: number;
  matches_won?: number;

  language_stats?: LanguageStat[];
}

interface UserProfile {
  username: string;
  avatar_url: string | null;
  music_enabled: boolean;
  sound_enabled: boolean;
}

/* ---------- Helpers (same idea as dashboard) ---------- */
const getLevel = (totalXP: number) => Math.floor(totalXP / 10) + 1; // Level 1 for 0–9 XP
const getCurrentLevelXP = (totalXP: number) => totalXP % 10;
const calculateProgress = (totalXP: number) => (getCurrentLevelXP(totalXP) / 10) * 100;

export default function ParticipantProfile() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  /* --- Local profile (username/avatar) --- */
  const [profile, setProfile] = useState<UserProfile>({
    username: user?.name || '',
    avatar_url: null,
    music_enabled: true,
    sound_enabled: true,
  });

  /* --- Stats pulled EXACTLY like dashboard (/api/me/stats) --- */
  const [stats, setStats] = useState<DashboardDataLike | null>(null);

  /* --- UI state --- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* --- Avatar modal state --- */
  const AVATARS = [
    'default.png',
    'girl1.png','girl2.png','girl3.png','girl4.png','girl5.png',
    'boy1.png','boy2.png','boy3.png','boy4.png','boy5.png','boy6.png',
  ];
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
    green: 'bg-green-900/30 text-green-400 border-green-800',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    red: 'bg-red-900/30 text-red-400 border-red-800',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-800',
    indigo: 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
    cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-800',
  } as const;

  useEffect(() => {
    // align with dashboard: fetch stats from the same endpoint and shape
    fetchProfile();
    fetchStatsLikeDashboard(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Profile (username/avatar) ---------- */
  const fetchProfile = async () => {
    try {
      const resp = await apiClient.get('/api/me/profile');
      const data = (resp?.data ?? resp) as any;
      const envelope = data?.data ?? data;
      const p = envelope?.profile ?? envelope;
      if (p?.username) {
        setProfile((prev) => ({
          ...prev,
          username: p.username,
          avatar_url: p.avatar_url ?? null,
          music_enabled: Boolean(p.music_enabled ?? prev.music_enabled),
          sound_enabled: Boolean(p.sound_enabled ?? prev.sound_enabled),
        }));
      } else {
        setProfile((prev) => ({ ...prev, username: user?.name || '' }));
      }
    } catch {
      setProfile((prev) => ({ ...prev, username: user?.name || '' }));
    }
  };

  /* ---------- Stats (same source/shape as Dashboard) ---------- */
  const fetchStatsLikeDashboard = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);
      setRefreshing(true);

      // EXACT endpoint used by Dashboard.tsx
      const meRes = await apiClient.get('/api/me/stats');

      // Dashboard expects the payload directly in meRes.data
      if (meRes?.success && meRes.data) {
        setStats(meRes.data as DashboardDataLike);
      } else {
        // Some backends wrap inside data.data—support gracefully
        const alt = (meRes as any)?.data?.data ?? (meRes as any)?.data ?? meRes;
        setStats(alt as DashboardDataLike);
      }
    } catch (e) {
      console.error('Error fetching /api/me/stats:', e);
      setStats({
        user: { stars: 0 },
        totals: { xp: 0, stars: 0 },
        ai_stats: { ai_attempts: 0, ai_successful_attempts: 0 },
        solo_stats: { total_attempts: 0, successful_attempts: 0 },
        duels_played: 0, duels_won: 0, duels_today: 0,
        live_played: 0, live_won: 0, matches_played: 0, matches_won: 0,
        language_stats: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ---------- Save profile ---------- */
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const resp = await apiClient.put('/api/me/profile', profile);
      const ok = (resp?.data?.success ?? resp?.success ?? resp?.status === 200) as boolean;
      setEditing(false);
      setMessage({
        type: ok ? 'success' : 'error',
        text: ok ? 'Profile updated successfully!' : 'Failed to update profile.',
      });
      if (ok) fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Save avatar only ---------- */
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    try {
      setSaving(true);
      setMessage(null);
      const newUrl = `/avatars/${selectedAvatar}`;
      const resp = await apiClient.put('/api/me/profile', { ...profile, avatar_url: newUrl });
      const ok = (resp?.data?.success ?? resp?.success ?? resp?.status === 200) as boolean;
      if (ok) {
        setAvatarModalOpen(false);
        setSelectedAvatar(null);
        setMessage({ type: 'success', text: 'Avatar updated!' });
        await fetchProfile();
      } else {
        setMessage({ type: 'error', text: 'Failed to update avatar.' });
      }
    } catch (e) {
      console.error('Error saving avatar:', e);
      setMessage({ type: 'error', text: 'Failed to update avatar. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Refresh (same endpoint as dashboard) ---------- */
  const handleRefresh = async () => {
    await fetchStatsLikeDashboard(false);
    setMessage({ type: 'success', text: 'Stats refreshed!' });
  };

  /* ---------- Toast timer ---------- */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /* ---------- Derived metrics (copied from dashboard logic) ---------- */
  const totalXP = stats?.totals?.xp ?? 0;

  // Prefer USERS.stars, fallback to totals.stars
  const myStars = (stats as any)?.user?.stars ?? stats?.totals?.stars ?? 0;

  // Level/progress (same math as dashboard)
  const myLevel = getLevel(totalXP);
  const myCurrentXP = getCurrentLevelXP(totalXP);
  const myProgress = Math.round(calculateProgress(totalXP));

  // Success rates
  const soloAttempts = stats?.solo_stats?.total_attempts ?? 0;
  const soloSuccess = stats?.solo_stats?.successful_attempts ?? 0;
  const soloSuccessRate = soloAttempts ? Math.round((soloSuccess / soloAttempts) * 100) : 0;

  const aiAttempts = stats?.ai_stats?.ai_attempts ?? 0;
  const aiSuccess = stats?.ai_stats?.ai_successful_attempts ?? 0;
  const aiSuccessRate = aiAttempts ? Math.round((aiSuccess / aiAttempts) * 100) : 0;

  const totalAttempts = soloAttempts + aiAttempts;
  const totalSuccessful = soloSuccess + aiSuccess;
  const overallSuccessRate = totalAttempts ? Math.round((totalSuccessful / totalAttempts) * 100) : 0;

  // PvP totals (classic duels + live matches) — same merge as dashboard
  const duelsPlayed = stats?.duels_played ?? 0;
  const duelsWon = stats?.duels_won ?? 0;
  const livePlayed = (stats?.live_played ?? stats?.matches_played) ?? 0;
  const liveWon = (stats?.live_won ?? stats?.matches_won) ?? 0;
  const pvpPlayed = duelsPlayed + livePlayed;
  const pvpWon = duelsWon + liveWon;
  const pvpWinRate = pvpPlayed ? Math.round((pvpWon / pvpPlayed) * 100) : 0;

  /* ---------- Small stat card ---------- */
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    suffix = '',
    trend,
    description,
  }: {
    title: string;
    value: number | string;
    icon: any;
    color: keyof typeof colorClasses;
    suffix?: string;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
  }) => (
    <div
      className={`rounded-lg shadow-lg p-6 border hover:border-gray-500 transition-all backdrop-blur-sm ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-black/10">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">
              {value}
              {suffix}
            </p>
            {description && <p className="text-xs opacity-70 mt-1">{description}</p>}
          </div>
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );

  /* ---------- Skeleton ---------- */
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="My Profile" />
          <div className="p-6">
            <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-700/50 rounded-lg backdrop-blur-sm"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <AnimatedBackground />
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="My Profile" />

        <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-6">
          {/* Message Notification */}
          {message && (
            <div
              className={`flex items-center justify-between p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-900/50 border-green-700 text-green-300'
                  : 'bg-red-900/50 border-red-700 text-red-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span>{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                <User className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">MY PROFILE</h1>
                <p className="text-gray-400">Manage your account and view your progress</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 transition-colors backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
          <div className="lg:col-span-1">
              <div className="bg-gray-800/60 rounded-2xl shadow-xl p-8 border border-gray-700/70 hover:border-gray-600 transition-all backdrop-blur-md">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative">
                    {/* Avatar with gradient ring */}
                    <div className="h-28 w-28 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 shadow-lg mx-auto">
                      <img
                        src={profile.avatar_url || "/avatars/default.png"}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover border-4 border-gray-900"
                      />
                    </div>
                    <button
                        className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 border-2 border-gray-900"
                        onClick={() => {
                          setSelectedAvatar(null);
                          setAvatarModalOpen(true);
                        }}
                        title="Change Avatar"
                      >
                        <RefreshCw className="h-4 w-4 text-white" />
                      </button>
                  </div>

                  {/* Username / Email */}
                  <h3 className="mt-4 text-2xl font-extrabold text-white">
                    {profile.username || user?.name}
                  </h3>
                  <p className="text-gray-400 flex items-center mt-1 text-sm">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </p>

                  {/* Editable Username */}
                  <div className="w-full mt-6 text-left">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white backdrop-blur-sm"
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="text-white py-2 px-3 bg-gray-700/40 rounded-lg backdrop-blur-sm">
                        {profile.username || "Not set"}
                      </p>
                    )}
                  </div>

                  {/* Info Rows */}
                  <div className="mt-5 w-full space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-700/40 rounded-lg backdrop-blur-sm">
                      <span className="text-sm font-medium text-gray-300">Member Since</span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Settings Button */}
                  <Link
                    href="/settings"
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md transition"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>

                  {/* Save Button (when editing) */}
                  {editing && (
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            </div>


            {/* Stats (derived exactly like dashboard) */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Overall Stats */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                      title="Total XP"
                      value={totalXP}
                      icon={Zap}
                      color="yellow"
                      trend="up"
                      description="Experience points earned"
                    />
                    <StatCard
                      title="Stars Earned"
                      value={myStars}
                      icon={Star}
                      color="purple"
                      trend="neutral"
                      description="Achievement stars"
                    />
                    <StatCard
                      title="Total Attempts"
                      value={totalAttempts}
                      icon={Target}
                      color="blue"
                      trend="up"
                      description="Solo + AI"
                    />
                    <StatCard
                      title="Overall Success"
                      value={overallSuccessRate}
                      icon={Trophy}
                      color="green"
                      suffix="%"
                      trend="up"
                      description={`${totalSuccessful} successful attempts`}
                    />
                  </div>
                </div>

                {/* Duel Stats (merged PvP) */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Swords className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Duel Performance</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      title="Matches Played"
                      value={pvpPlayed}
                      icon={Activity}
                      color="red"
                      description="Classic + Live"
                    />
                    <StatCard
                      title="Matches Won"
                      value={pvpWon}
                      icon={Award}
                      color="indigo"
                      description="All PvP victories"
                    />
                    <StatCard
                      title="Win Rate"
                      value={pvpWinRate}
                      icon={TrendingUp}
                      color="cyan"
                      suffix="%"
                      description="Overall PvP success"
                    />
                  </div>
                </div>

                {/* Language Stats */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Code className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Language Progress</h3>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm">
                    {stats?.language_stats?.length ? (
                      <div className="space-y-4">
                        {stats.language_stats!.map((langStat, index) => {
                          const colors = Object.keys(colorClasses) as Array<keyof typeof colorClasses>;
                          const colorKey = colors[index % colors.length];
                          const pct = Math.max(0, Math.min(100, Math.round(langStat.winrate)));
                          return (
                            <div
                              key={`${langStat.language}-${index}`}
                              className={`rounded-lg shadow-lg p-4 border hover:border-gray-500 transition-all backdrop-blur-sm ${colorClasses[colorKey]}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="p-2 rounded-lg bg-black/10">
                                    <Code className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg capitalize">
                                      {langStat.language}
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm opacity-80">
                                      <span className="flex items-center">
                                        <Target className="h-4 w-4 mr-1" />
                                        {langStat.solo_completed} solo
                                      </span>
                                      <span className="flex items-center">
                                        <Swords className="h-4 w-4 mr-1" />
                                        {langStat.games_played} duels
                                      </span>
                                      <span className="flex items-center">
                                        <Trophy className="h-4 w-4 mr-1" />
                                        {langStat.wins} wins
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{pct}%</p>
                                  <p className="text-sm opacity-80">win rate</p>
                                  <div className="mt-2 w-24 h-2 bg-gray-600/40 rounded-full overflow-hidden">
                                    <div
                                      className="h-2 rounded-full"
                                      style={{ width: `${pct}%`, background: 'currentColor' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-700/50 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
                          <Code className="h-12 w-12 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-lg mb-2">No language statistics yet</p>
                        <p className="text-gray-500">Complete challenges to see your progress</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level & Progress quick strip (optional nice touch) */}
                {/* <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-semibold">Level & Progress</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-400">Next Level</div>
                      <div className="font-semibold text-cyan-300">{10 - myCurrentXP} XP needed</div>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${myProgress}%`, background: 'linear-gradient(90deg,#22d3ee,#3b82f6,#a855f7)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Level {myLevel}</span>
                    <span>{myCurrentXP} / 10 XP</span>
                    <span>Level {myLevel + 1}</span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* --- Avatar Selection Modal --- */}
          {avatarModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" onClick={() => setAvatarModalOpen(false)} />
              {/* Modal */}
              <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-gray-900 text-gray-100 border border-gray-700 shadow-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold">Select an Avatar</h3>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setAvatarModalOpen(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {AVATARS.map((file) => {
                      const isActive = selectedAvatar === file;
                      return (
                        <button
                          key={file}
                          type="button"
                          onClick={() => setSelectedAvatar(file)}
                          className={`rounded-xl p-1 border transition
                            ${isActive ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-700 hover:border-gray-500'}`}
                          title={file.replace('.png', '').replace('_', ' ')}
                        >
                          <img
                            src={`/avatars/${file}`}
                            alt={file}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                      onClick={() => setAvatarModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      disabled={!selectedAvatar || saving}
                      onClick={handleSaveAvatar}
                    >
                      {saving ? 'Saving…' : 'Save Avatar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* --- /Avatar Selection Modal --- */}
        </div>
      </AppLayout>
    </div>
  );
}
