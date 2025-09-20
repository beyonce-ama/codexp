import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  User, Camera, Trophy, Target, Star, Zap, Code, Calendar, Mail, Shield,
  RefreshCw, Award, TrendingUp, Swords, CheckCircle, X, Activity, BarChart3
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'My Profile', href: '/profile' }
];

interface UserProfile {
  username: string;
  avatar_url: string | null;
  music_enabled: boolean;
  sound_enabled: boolean;
}

interface LanguageStat {
  language: string;
  solo_completed: number;
  games_played: number;
  wins: number;
  winrate: number; // 0..1
}

interface UserStats {
  solo_attempts: number;
  successful_attempts: number;
  total_xp: number;
  total_stars: number;
  duels_played: number;
  duels_won: number;
  language_stats: LanguageStat[];
}

export default function ParticipantProfile() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [profile, setProfile] = useState<UserProfile>({
    username: user?.name || '',
    avatar_url: null,
    music_enabled: true,
    sound_enabled: true,
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    fetchProfile();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await apiClient.get('/api/me/profile');
      // Accept {success,data:{profile}}, {data:{profile}}, or {profile}
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
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile((prev) => ({ ...prev, username: user?.name || '' }));
    }
  };

// keep this helper near the top of the file
const normalizeNumber = (v: any, fallback = 0) =>
  v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? fallback : Number(v);

const fetchStats = async () => {
  setRefreshing(true);
  try {
    const resp = await apiClient.get(`/api/me/stats?t=${Date.now()}`);
    const root = (resp?.data?.data ?? resp?.data ?? resp) as any;

    // xp & stars are in totals
    const totals = root?.totals ?? {};
    const total_xp = normalizeNumber(totals?.xp);
    const total_stars = normalizeNumber(totals?.stars);

    // solo numbers are at root or in solo_stats
    const solo_attempts = normalizeNumber(
      root?.solo_attempts ?? root?.solo_stats?.total_attempts
    );
    const successful_attempts = normalizeNumber(
      root?.successful_attempts ?? root?.solo_stats?.successful_attempts
    );

    // duels are not in this endpoint (default 0)
    const duels_played = normalizeNumber(root?.duels_played, 0);
    const duels_won = normalizeNumber(root?.duels_won, 0);

    // language stats (collection from DB) - map flexibly
    const language_stats_raw: any[] = Array.isArray(root?.language_stats) ? root.language_stats : [];
    const language_stats = language_stats_raw.map((ls) => {
      const games = normalizeNumber(ls?.games_played ?? (ls?.wins ?? 0) + (ls?.losses ?? 0));
      const wins = normalizeNumber(ls?.wins);
      let winrate = ls?.winrate;
      if (winrate !== null && winrate !== undefined) {
        winrate = Number(winrate);
        winrate = winrate > 1 ? winrate / 100 : winrate; // percent or fraction
      } else {
        winrate = games > 0 ? wins / games : 0;
      }
      return {
        language: String(ls?.language ?? ls?.lang ?? 'Unknown'),
        solo_completed: normalizeNumber(ls?.solo_completed ?? 0),
        games_played: games,
        wins,
        winrate: Math.max(0, Math.min(1, winrate)),
      };
    });

    setStats({
      solo_attempts,
      successful_attempts,
      total_xp,
      total_stars,
      duels_played,
      duels_won,
      language_stats,
    });
  } catch (e) {
    console.error('Error fetching stats:', e);
    setStats({
      solo_attempts: 0,
      successful_attempts: 0,
      total_xp: 0,
      total_stars: 0,
      duels_played: 0,
      duels_won: 0,
      language_stats: [],
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


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

  const handleRefresh = async () => {
    await fetchStats();
    setMessage({ type: 'success', text: 'Stats refreshed!' });
  };

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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Profile" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-20"></div>
          <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-15"></div>
        </div>

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
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-all backdrop-blur-sm">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 border-4 border-gray-700/50">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                    {editing && (
                      <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 border-2 border-gray-800/50">
                        <Camera className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">{profile.username || user?.name}</h3>
                  <p className="text-gray-400 flex items-center justify-center mt-2">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
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
                        <p className="text-white py-2 px-3 bg-gray-700/50 rounded-lg backdrop-blur-sm">
                          {profile.username || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-3 px-3 bg-gray-700/50 rounded-lg backdrop-blur-sm">
                      <span className="text-sm font-medium text-gray-300">Role</span>
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Participant
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 px-3 bg-gray-700/50 rounded-lg backdrop-blur-sm">
                      <span className="text-sm font-medium text-gray-300">Member Since</span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-2">
              {loading ? (
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
              ) : (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatCard
                        title="Solo Attempts"
                        value={stats?.solo_attempts ?? 0}
                        icon={Target}
                        color="blue"
                        trend="up"
                        description="Total challenges attempted"
                      />
                      <StatCard
                        title="Success Rate"
                        value={
                          stats?.solo_attempts
                            ? Math.round(
                                ((stats?.successful_attempts ?? 0) / stats.solo_attempts) * 100,
                              )
                            : 0
                        }
                        icon={Trophy}
                        color="green"
                        suffix="%"
                        trend="up"
                        description="Challenges completed successfully"
                      />
                      <StatCard
                        title="Total XP"
                        value={stats?.total_xp ?? 0}
                        icon={Zap}
                        color="yellow"
                        trend="up"
                        description="Experience points earned"
                      />
                      <StatCard
                        title="Stars Earned"
                        value={stats?.total_stars ?? 0}
                        icon={Star}
                        color="purple"
                        trend="neutral"
                        description="Achievement stars"
                      />
                    </div>
                  </div>

                  {/* Duel Stats */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Swords className="h-5 w-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-white">Duel Performance</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatCard
                        title="Duels Played"
                        value={stats?.duels_played ?? 0}
                        icon={Activity}
                        color="red"
                        description="Total duels participated"
                      />
                      <StatCard
                        title="Duels Won"
                        value={stats?.duels_won ?? 0}
                        icon={Award}
                        color="indigo"
                        description="Victories achieved"
                      />
                      <StatCard
                        title="Win Rate"
                        value={
                          stats?.duels_played
                            ? Math.round(((stats?.duels_won ?? 0) / stats.duels_played) * 100)
                            : 0
                        }
                        icon={TrendingUp}
                        color="cyan"
                        suffix="%"
                        description="Overall duel success"
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
                          {stats.language_stats.map((langStat, index) => {
                            const colors = Object.keys(colorClasses) as Array<
                              keyof typeof colorClasses
                            >;
                            const colorKey = colors[index % colors.length];
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
                                    <p className="text-2xl font-bold">
                                      {Math.round(langStat.winrate * 100)}%
                                    </p>
                                    <p className="text-sm opacity-80">win rate</p>
                                    <div className="mt-2 w-24 h-2 bg-gray-600/40 rounded-full overflow-hidden">
                                      <div
                                        className="h-2 rounded-full"
                                        style={{
                                          width: `${Math.round(langStat.winrate * 100)}%`,
                                          // use current text color so it always matches card color
                                          background: 'currentColor',
                                        }}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
