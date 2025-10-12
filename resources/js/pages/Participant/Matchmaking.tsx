import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { apiClient } from '@/utils/api';
import type { BreadcrumbItem } from '@/types';
import {
  Swords, Users, Brain, Loader2, Clock, ShieldCheck, X,
  CheckCircle2, Code2, Trophy, Zap, History, Medal,
} from 'lucide-react';

import AnimatedBackground from '@/components/AnimatedBackground';

type Lang = 'python' | 'java' | 'cpp'; // ← add cpp
type Diff = 'easy' | 'medium' | 'hard';
const LANGUAGE_LABELS: Record<Lang, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};
const displayLanguage = (lang: string) =>
  LANGUAGE_LABELS[(lang as Lang)] ?? lang.toUpperCase();
interface PageProps { auth: { user: { id: number; name: string } } }

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Play', href: '#' },
  { title: '1v1 Matchmaking', href: '/play/matchmaking' },
];

const languages = [
  { value: 'python' as const, label: 'Python' },
  { value: 'java'   as const, label: 'Java'   },
  { value: 'cpp'    as const, label: 'C++'    }, // ← NEW
];

const difficulties = [
  { value: 'easy' as const,   label: 'Easy',   hint: 'Warm-up tasks' },
  { value: 'medium' as const, label: 'Medium', hint: 'Trickier logic' },
  { value: 'hard' as const,   label: 'Hard',   hint: 'Deep problem-solving' },
];

type JoinResponse =
  | { slug: string; token?: string | null }
  | { queued: true }
  | { paired: true }
  | { ticket_id?: number | string };

type PollResponse =
  | { slug: string; token?: string | null }
  | { slug: null };

  type HistoryItem = {
  challenge: any;
  id: number;
  duel_id: number;
  match_id: number;
  match_public_id?: string | null;
  language: string | null;
  difficulty: string | null;
  status: string | null;
  is_winner: boolean;
  time_spent_sec: number | null;
  finished_at: string | null;
  opponent: { id: number | null; name: string };
};

// Point these to your actual files. Easiest: put images in /public/images/lang/
const LANG_IMAGE_SRC: Record<Lang, string> = {
  python: '/images/python.png',
  java:   '/images/java.png',
  cpp:    '/images/cpp.png',
};

const formatSecs = (s: number | null | undefined) => {
  if (!s && s !== 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
};

const Matchmaking: React.FC = () => {
  const { props } = usePage<PageProps>();
  const user = props?.auth?.user;

  const [language, setLanguage] = useState<Lang>('python');
  const [difficulty, setDifficulty] = useState<Diff>('easy');
  const [searching, setSearching] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(1);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
const [waitTime, setWaitTime] = useState<number>(0);
const [matchFound, setMatchFound] = useState<boolean>(false);
  const queueChannelName = useMemo(
    () => `presence-queue.${language}.${difficulty}`,
    [language, difficulty]
  );
const [historyOpen, setHistoryOpen] = useState(false);
const [historyLoading, setHistoryLoading] = useState(false);
const [history, setHistory] = useState<HistoryItem[]>([]);
const [historyErr, setHistoryErr] = useState<string | null>(null);
const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
const [showChallengeModal, setShowChallengeModal] = useState(false);

const openChallengeModal = (challenge: any) => {
  setSelectedChallenge(challenge);
  setShowChallengeModal(true);
};

  const goToMatch = (slug: string, token?: string | null) => {
    const url = token ? `/play/m/${slug}?t=${encodeURIComponent(token)}` : `/play/m/${slug}`;
    window.location.href = url;
  };
 // Timer effect
  useEffect(() => {
    if (!searching) return;
    setWaitTime(0);
    const id = setInterval(() => {
      setWaitTime((prev) => {
        if (prev >= 120) {
          // auto cancel after 2 minutes
          clearInterval(id);
          setError("⏳ Seems like no one is online right now. Try again later!");
          cancelQueue();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [searching]);

 // while searching, ping heartbeat; also auto-cancel on close/refresh
useEffect(() => {
  if (!searching) return;

  const hb = setInterval(() => {
    apiClient.post('/api/matchmaking/heartbeat').catch(() => {});
  }, 8000);

  const onUnload = () => {
    try { navigator.sendBeacon('/api/matchmaking/cancel'); } catch {}
  };
  window.addEventListener('beforeunload', onUnload);
  window.addEventListener('pagehide', onUnload);

  return () => {
    clearInterval(hb);
    window.removeEventListener('beforeunload', onUnload);
    window.removeEventListener('pagehide', onUnload);
    apiClient.post('/api/matchmaking/cancel').catch(() => {});
  };
}, [searching]);

  // Cancel queue
  const cancelQueue = async () => {
    setError(null);
    try { await apiClient.post('/api/matchmaking/cancel'); } catch {}
    finally {
      setSearching(false);
      setMatchFound(false);
      setTicketId(null);
      setQueueCount(1);
      setWaitTime(0);
      try { (window as any).Echo?.leave(queueChannelName); } catch {}
    }
  };
  async function postJSON<T = any>(url: string, body?: any): Promise<T> {
    const res: any = body ? await apiClient.post(url, body) : await apiClient.post(url);
    return (res && typeof res === 'object' && 'data' in res) ? res.data : res;
  }
const loadHistory = async () => {
  setHistoryErr(null);
  setHistoryLoading(true);
  try {
    const res: any = await apiClient.get('/api/matchmaking/history', {
      params: { limit: 10 }, 
    });
    const items: HistoryItem[] = res?.data?.items ?? res?.items ?? [];
    setHistory(items);
  } catch (e: any) {
    setHistoryErr(e?.response?.data?.message || 'Failed to load history.');
  } finally {
    setHistoryLoading(false);
  }
};
const openHistory = async () => {
  setHistoryOpen(true);
  await loadHistory();
};
  // Presence + private listeners (nudge; poll is still authoritative)
  useEffect(() => {
    if (!searching) return;
    const Echo = (window as any).Echo;
    if (!Echo) return;

    Echo.join(queueChannelName)
      .here((members: any[]) => setQueueCount(members.length))
      .joining(() => setQueueCount((c: number) => c + 1))
      .leaving(() => setQueueCount((c: number) => Math.max(0, c - 1)))
      .listen('MatchFound', async () => {
        try {
          const data = await postJSON<PollResponse>('/api/matchmaking/poll', { language, difficulty });
          if ('slug' in data && data.slug) goToMatch(data.slug, data.token);
        } catch {}
      });

    Echo.private(`user.${user.id}`).listen('MatchFound', async () => {
      try {
        const data = await postJSON<PollResponse>('/api/matchmaking/poll', { language, difficulty });
        if ('slug' in data && data.slug) goToMatch(data.slug, data.token);
      } catch {}
    });

    return () => {
      try { (window as any).Echo.leave(queueChannelName); } catch {}
      try { (window as any).Echo.leave(`user.${user.id}`); } catch {}
    };
  }, [searching, queueChannelName, user?.id, language, difficulty]);

  // Join queue
  const joinQueue = async () => {
    setError(null);
    setSearching(true);
    setTicketId(null);

    try {
      const data = await postJSON<JoinResponse>('/api/matchmaking/join', {
        language, difficulty, resume: false,
      });

      if ('slug' in data && data.slug) {
        goToMatch(data.slug, (data as any).token);
        return;
      }

      if ('queued' in data && data.queued) {
        setTicketId(String(user.id));
      } else if ('paired' in data && data.paired) {
        setTicketId(String(user.id)); // wait; event/poll will deliver {slug,token}
      } else if ('ticket_id' in data && data.ticket_id) {
        setTicketId(String(data.ticket_id));
      }
    } catch (e: any) {
      console.error('[JOIN ERROR]', e?.response?.data || e);
      setError(e?.response?.data?.message || 'Failed to join matchmaking.');
      setSearching(false);
    }
  };

  // Poll fallback until we get { slug, token }
  useEffect(() => {
    if (!searching) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await postJSON<PollResponse>('/api/matchmaking/poll', { language, difficulty });
        if (!cancelled && 'slug' in data && data.slug) {
          goToMatch(data.slug, data.token);
          return;
        }
      } catch {}
      if (!cancelled) setTimeout(tick, 1200);
    };

    const id = setTimeout(tick, 800);
    return () => { cancelled = true; clearTimeout(id as any); };
  }, [searching, language, difficulty]);



  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <AnimatedBackground />
      </div>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="1v1 Matchmaking" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Swords className="w-7 h-7 text-indigo-400" />
              <Code2  className="w-5 h-5 text-cyan-400" />
              <Brain  className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  1V1 MATCHMAKING
                </h1>
                <p className="text-zinc-400 text-sm">Queue by language & difficulty and get paired instantly.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 shadow-xl">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-sm text-zinc-400">Language</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {languages.map((opt) => {
                    const active = language === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setLanguage(opt.value)}
                        disabled={searching}
                        className={[
                          'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition',
                          active ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-slate-700/60 hover:border-slate-600',
                        ].join(' ')}
                        aria-pressed={active}
                      >
                       <img
                        src={LANG_IMAGE_SRC[opt.value]}
                        alt={`${opt.label} logo`}
                        className="w-5 h-5 object-contain"
                        loading="lazy"
                      />
                      <span className="font-medium">{opt.label}</span>

                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-zinc-400">Difficulty</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {difficulties.map((opt) => {
                    const active = difficulty === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        disabled={searching}
                        className={[
                          'px-3 py-3 rounded-xl border text-sm transition',
                          active ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-slate-700/60 hover:border-slate-600',
                        ].join(' ')}
                        aria-pressed={active}
                        title={opt.hint}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm text-zinc-400 flex items-center gap-2">
                  Mode
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                    <ShieldCheck className="w-3 h-3" /> Token-safe
                  </span>
                </label>
                <div className="mt-2">
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      <span className="font-medium">AI-Generated</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-zinc-400">Same prompt for both</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    A single challenge is generated &amp; frozen server-side so both players get the exact same text &amp; tests.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700/60" />

            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-400">
                 Players waiting in <span className="font-medium text-zinc-200">{displayLanguage(language)}</span> /
                  <span className="font-medium text-zinc-200"> {difficulty}</span>:
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-800 text-zinc-100">
                  {queueCount}
                </span>
              </div>

             <div className="flex items-center gap-3">
                {searching ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/60 bg-slate-900/40 text-zinc-200">
                      {!matchFound ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching… <span className="ml-2 text-xs text-zinc-400">{waitTime}s</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Match found! Preparing challenge…
                        </>
                      )}
                    </div>
                    <button
                      onClick={cancelQueue}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-zinc-200"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={openHistory}
                      className="inline-flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:bg-slate-800 transition text-zinc-200"
                      type="button"
                    >
                      <History className="w-4 h-4" /> History
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={joinQueue}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 active:opacity-100 transition text-white font-medium"
                    >
                      <Swords className="w-4 h-4" /> Find Match
                    </button>
                    <button
                      onClick={openHistory}
                      className="inline-flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:bg-slate-800 transition text-zinc-200"
                      type="button"
                    >
                      <History className="w-4 h-4" /> History
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <TipCard icon={<Clock className="w-4 h-4" />} title="Speed wins"
              text="Winner is the first to submit a correct solution. Ties decided by time to correct." />
            <TipCard icon={<Zap className="w-4 h-4" />} title="No code mirroring"
              text="You only see your own editor. Opponent panel shows status/animations only." />
            <TipCard icon={<Trophy className="w-4 h-4" />} title="XP rules"
              text="Base XP by difficulty; minus 0.5 if you used a hint (server-enforced)." />
          </div>

          {(error || ticketId) && (
            <div className="mt-6 flex flex-col gap-2">
              {error && (
                <div className="flex items-center gap-2 text-red-300 bg-red-900/20 border border-red-900/40 px-3 py-2 rounded-lg">
                  <X className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {ticketId && (
                <div className="flex items-center gap-2 text-emerald-300 bg-emerald-900/20 border border-emerald-900/40 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Queued (ticket #{ticketId}). You’ll auto-join when a match is found.</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* History Modal */}
{/* History Modal */}
{historyOpen && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => setHistoryOpen(false)}
    />
    <div className="relative w-full max-w-3xl mx-4 rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur p-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Recent 1v1 History</h2>
        </div>
        <button
          onClick={() => setHistoryOpen(false)}
          className="p-2 rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable List */}
      <div
        className="mt-3 px-2 max-h-[70vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >

        {historyLoading ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : historyErr ? (
          <div className="text-red-300 bg-red-900/20 border border-red-900/40 px-3 py-2 rounded-lg">
            {historyErr}
          </div>
        ) : history.length === 0 ? (
          <div className="text-zinc-400 py-6 text-center">No recent matches yet.</div>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {history.map((h) => (
              <li
                key={h.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {h.is_winner ? (
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Medal className="w-4 h-4" /> Win
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-300">
                        <X className="w-4 h-4" /> Loss
                      </span>
                    )}
                    <span className="text-zinc-300">
                      vs <span className="font-medium">{h.opponent?.name}</span>
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                      {displayLanguage(h.language || '')}
                    </span>
                    {h.difficulty && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 capitalize">
                        {h.difficulty}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatSecs(h.time_spent_sec)}
                    </span>
                    {h.finished_at && (
                      <span>{new Date(h.finished_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* View Button */}
                <div className="flex items-center gap-2">
                  {h.challenge ? (
                    <button
                      onClick={() => openChallengeModal(h.challenge)}
                      className="text-xs px-3 py-1 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-zinc-200"
                    >
                      View
                    </button>
                  ) : h.match_public_id ? (
                    <a
                      href={`/play/m/${h.match_public_id}`}
                      className="text-xs px-3 py-1 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-zinc-200"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-end gap-2 px-2 border-t border-slate-700/60 pt-3">
        <button
          onClick={() => setHistoryOpen(false)}
          className="px-3 py-2 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-zinc-200"
        >
          Close
        </button>
        {/* <button
          onClick={loadHistory}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-100"
        >
          Refresh
        </button> */}
      </div>
    </div>
  </div>
)}

{/* Challenge Modal */}
{showChallengeModal && selectedChallenge && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => setShowChallengeModal(false)}
    />
   <div
  className="relative w-full max-w-2xl mx-4 rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur p-5 max-h-[80vh] overflow-y-auto scrollbar-hide"
  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-indigo-400">
          {selectedChallenge.title || 'Challenge Info'}
        </h3>
        <button
          onClick={() => setShowChallengeModal(false)}
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 text-sm text-zinc-300 space-y-3">
        {selectedChallenge.description && (
          <p className="text-zinc-400">{selectedChallenge.description}</p>
        )}

        {selectedChallenge.buggy_code && (
          <>
            <h4 className="text-zinc-200 font-medium">Buggy Code:</h4>
            <pre className="p-3 bg-slate-800 rounded-lg text-xs overflow-auto text-zinc-300 whitespace-pre-wrap max-h-[200px]">
              {selectedChallenge.buggy_code}
            </pre>
          </>
        )}

        {selectedChallenge.fixed_code && (
          <>
            <h4 className="text-zinc-200 font-medium mt-2">Fixed Code:</h4>
            <pre className="p-3 bg-slate-800 rounded-lg text-xs overflow-auto text-zinc-300 whitespace-pre-wrap max-h-[200px]">
              {selectedChallenge.fixed_code}
            </pre>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowChallengeModal(false)}
          className="px-4 py-2 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-zinc-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </AppLayout>
    </div>
  );
};

const TipCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
    <div className="flex items-center gap-2 text-zinc-300">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </div>
    <p className="mt-2 text-xs text-zinc-500">{text}</p>
  </div>
);

export default Matchmaking;
const style = document.createElement('style');

document.head.appendChild(style);
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(style);
}
