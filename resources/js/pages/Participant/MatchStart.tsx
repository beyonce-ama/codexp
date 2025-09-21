import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Trophy, Bolt, User, Hourglass, CheckCircle, XCircle, Eye } from 'lucide-react';
import { apiClient } from '@/utils/api';
import Swal from 'sweetalert2';

type Challenge = {
  title?: string;
  description?: string;
  language?: string;
  difficulty?: string;
  buggy_code?: string | null;
  fixed_code?: string | null;
  corrected_code?: string | null;
  tests?: any[];
};

type PageProps = {
  match: { id: string; language: string; difficulty: string; mode: string; me: number; opponent: number };
  challenge?: Challenge | null;
  ui: { showOpponentAsAnimation: boolean };
};

type FeedItem = { id: string; byMe: boolean; correct: boolean; text: string; ts: number };

type ServerSubmission = {
  id?: string | number;
  submission_id?: string | number;
  user_id?: number;
  by_me?: boolean;
  byMe?: boolean;
  correct?: boolean | number;
  is_correct?: boolean | number;
  at?: string;
  created_at?: string;
  timestamp?: string;
  message?: string;
};

export default function MatchStart() {
  const { props } = usePage<PageProps>();
  const { match, challenge } = props;

  const [code, setCode] = useState<string>(challenge?.buggy_code ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCorrected, setShowCorrected] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const title = challenge?.title ?? 'Fix the Bug';
  const description = challenge?.description ?? 'Repair the function to satisfy all tests.';
  const lang = (challenge?.language ?? match.language ?? '').toUpperCase();
  const diff = (challenge?.difficulty ?? match.difficulty ?? '').toUpperCase();
  const testsCount = Array.isArray(challenge?.tests) ? challenge!.tests!.length : 0;
  const correctedCode = challenge?.corrected_code ?? challenge?.fixed_code ?? null;

  // ---- Refs for polling and dedupe ----
  const seenSubmissionsRef = useRef<Set<string>>(new Set());        // dedupe feed by submission id
  const lastServerUpdatedRef = useRef<number>(0);                    // like Duel: only update if fresher
  const lastOpponentSubIdRef = useRef<string | null>(null);          // one-time toast per opponent submission

  // ---- Normalizer for server submissions ----
  const normalizeSubmission = (s: ServerSubmission): FeedItem => {
    const idRaw = s.id ?? s.submission_id ?? `${s.user_id}-${s.at ?? s.created_at ?? s.timestamp ?? ''}`;
    const id = String(idRaw);

    const correctRaw = (s as any).is_correct ?? s.correct ?? 0;
    const correct = typeof correctRaw === 'boolean' ? correctRaw : Number(correctRaw) === 1;

    const when = (s as any).at ?? s.created_at ?? s.timestamp ?? new Date().toISOString();
    const parsed = new Date(when);
    const ts = Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();

    const byMe = (typeof (s as any).by_me === 'boolean')
      ? (s as any).by_me
      : (typeof (s as any).byMe === 'boolean')
        ? (s as any).byMe
        : (Number(s.user_id) === Number(match.me));

    const text = byMe
      ? (correct ? 'You submitted: Correct!' : 'You submitted: Wrong.')
      : (correct ? 'Opponent submitted: Correct!' : 'Opponent submitted: Wrong.');

    return { id, byMe, correct, text, ts };
  };

  // ---- Duel-style fetch function ----
  const fetchMatchStatus = async (matchId: string | number) => {
    try {
      const res = await apiClient.get(`/api/match/${matchId}/status`);
      const data = (res as any)?.data ?? res;

      // Determine "freshness" like Duel.tsx
      const subMax = Array.isArray(data?.submissions) && data.submissions.length > 0
        ? Math.max(
            ...data.submissions.map((s: any) => {
              const when = s.at ?? s.created_at ?? s.timestamp ?? null;
              const t = when ? new Date(when).getTime() : 0;
              return Number.isFinite(t) ? t : 0;
            })
          )
        : 0;

      const lastAt = data?.last?.at ?? data?.last?.created_at ?? null;
      const lastTs = lastAt ? new Date(lastAt).getTime() : 0;

      const serverUpdated = Math.max(subMax, lastTs);
      if (serverUpdated && serverUpdated < lastServerUpdatedRef.current) {
        // Local view is already fresher
        return;
      }

      // Merge submissions into feed (id-based dedupe)
      if (Array.isArray(data?.submissions)) {
        const incoming: FeedItem[] = (data.submissions as ServerSubmission[])
          .map(normalizeSubmission)
          .sort((a, b) => a.ts - b.ts); // oldest → newest

        const toAppend: FeedItem[] = [];
        for (const item of incoming) {
          if (!seenSubmissionsRef.current.has(item.id)) {
            seenSubmissionsRef.current.add(item.id);
            toAppend.push(item);
          }
        }

        if (toAppend.length > 0) {
          setFeed(prev => {
            const next = [...prev, ...toAppend];
            return next.slice(Math.max(0, next.length - 20));
          });
        }

        // One-time toast for a new opponent submission (like Duel)
        const latestOpp = [...incoming].filter(i => !i.byMe).sort((a, b) => b.ts - a.ts)[0];
        if (latestOpp && latestOpp.id !== lastOpponentSubIdRef.current) {
          lastOpponentSubIdRef.current = latestOpp.id;

          Swal.fire({
            icon: latestOpp.correct ? 'success' : 'info',
            title: 'Opponent Submitted!',
            text: latestOpp.correct ? 'They got it right!' : 'Their solution needs work.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#1f2937',
            color: '#fff',
          });
        }
      }

      // Finished / surrender handling (server is authoritative)
      if (data?.finished) {
        const youWon = Number(data?.winner_user_id) === Number(match.me);
        setMessage(
          youWon
            ? { type: 'success', text: '✅ Correct! You win. Redirecting…' }
            : { type: 'error', text: 'Opponent solved it first.' }
        );
        setTimeout(() => (window.location.href = youWon ? '/dashboard' : '/play/matchmaking'), youWon ? 1500 : 2000);
      } else if (data?.last?.message && String(data.last.message).toLowerCase() === 'surrendered') {
        const byMe = Number(data.last.user_id) === Number(match.me);
        setMessage(
          byMe
            ? { type: 'error', text: 'You surrendered. Redirecting…' }
            : { type: 'success', text: 'Opponent surrendered — you win! Redirecting…' }
        );
        setTimeout(() => (window.location.href = byMe ? '/play/matchmaking' : '/dashboard'), 1500);
      }

      if (serverUpdated) {
        lastServerUpdatedRef.current = serverUpdated;
      }
    } catch (err) {
      console.error('Error fetching match status:', err);
    }
  };

  // ---- Polling interval (like Duel) ----
  useEffect(() => {
    let mounted = true;

    // initial
    fetchMatchStatus(match.id);

    // interval
    const it = setInterval(() => {
      if (mounted) fetchMatchStatus(match.id);
    }, 1500);

    return () => {
      mounted = false;
      clearInterval(it);
    };
  }, [match.id, match.me]);

  // ---- Submit handler ----
  const submitSolution = async () => {
    try {
      const { data } = await apiClient.post(`/api/match/${match.id}/submit`, { code });
      if (data?.correct) {
        setMessage({ type: 'success', text: '✅ Correct! You win. Redirecting…' });
      } else {
        setMessage({ type: 'error', text: '❌ Wrong — keep trying!' });
      }
    } catch (e: any) {
      console.error('[SUBMIT ERROR]', e?.response?.data || e);
      setMessage({ type: 'error', text: e?.response?.data?.message || 'Submit failed.' });
    }
  };

  // ---- Surrender handler ----
  const [isSurrendering, setIsSurrendering] = useState(false);
  const surrender = async () => {
    if (isSurrendering) return;
    setIsSurrendering(true);
    try {
      await apiClient.post(`/api/match/${match.id}/surrender`, {});
      setMessage({ type: 'error', text: 'You surrendered. Redirecting…' });
      setTimeout(() => (window.location.href = '/play/matchmaking'), 1500);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.message || 'Failed to surrender.' });
    } finally {
      setIsSurrendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <AppLayout breadcrumbs={[{ title: 'Home', href: '/dashboard' }, { title: 'Match', href: `/play/match/${match.id}` }]}>
        <Head title={`Match ${match.id}`} />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                1v1 Duel — {match.language.toUpperCase()} / {match.difficulty.toUpperCase()}
              </h1>
              <p className="text-zinc-400 text-sm">Both players received the same AI-generated challenge.</p>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <User className="w-5 h-5" /><span>you #{match.me}</span>
              <span className="opacity-40">vs</span>
              <User className="w-5 h-5" /><span>opponent #{match.opponent}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={surrender}
              disabled={isSurrendering}
              className="text-sm px-3 py-2 rounded-lg border border-slate-700/60 disabled:opacity-50"
            >
              {isSurrendering ? 'Surrendering…' : 'Surrender'}
            </button>
          </div>

          {/* Inline message */}
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg ${
                message.type === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
              }`}
            >
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Live attempts feed (both players) */}
          {feed.length > 0 && (
            <div className="mb-4 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
              <div className="text-xs text-zinc-400 mb-2">Live attempts</div>
              <ul className="space-y-1">
                {[...feed].sort((a, b) => b.ts - a.ts).map((f) => (
                  <li key={f.id} className="text-xs">
                    <span className={f.correct ? 'text-green-300' : 'text-red-300'}>
                      {f.correct ? '✔' : '✖'}
                    </span>{' '}
                    {f.text} <span className="opacity-50">({new Date(f.ts).toLocaleTimeString()})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: YOUR board */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Bolt className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-semibold text-zinc-100">{title}</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{description}</p>
              </div>

              <div className="p-4 space-y-3">
                <label className="text-xs text-zinc-400">Your Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[380px] md:h-[520px] rounded-lg bg-slate-950 border border-slate-700/60 p-3 text-sm text-zinc-100 font-mono"
                  spellCheck={false}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Tests: {testsCount} • Language: {lang} • Difficulty: {diff}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitSolution}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-95"
                    >
                      Submit Solution
                    </button>
                    {correctedCode && (
                      <button
                        onClick={() => setShowCorrected(!showCorrected)}
                        className="px-3 py-2 rounded-lg border border-slate-700/60 text-xs flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {showCorrected ? 'Hide Solution' : 'Show Solution'}
                      </button>
                    )}
                  </div>
                </div>

                {showCorrected && correctedCode && (
                  <pre className="mt-3 p-3 rounded-lg bg-black/40 text-green-300 text-xs overflow-x-auto">
                    {correctedCode}
                  </pre>
                )}
              </div>
            </div>

            {/* Right: OPPONENT PANEL */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 overflow-hidden relative">
              <div className="p-4 border-b border-slate-700/60 flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-300" />
                <h2 className="font-semibold text-zinc-100">Opponent</h2>
                <span className="ml-auto text-xs text-zinc-500">live status</span>
              </div>

              <div className="p-4 h-[460px] md:h-[560px] flex items-center justify-center">
                {(() => {
                  const lastOpp = [...feed].filter(f => !f.byMe).sort((a, b) => b.ts - a.ts)[0];
                  if (!lastOpp) {
                    return (
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-indigo-600/20 animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-indigo-500/30 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-indigo-300" />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-center space-y-2">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          lastOpp.correct
                            ? 'border-green-500/40 bg-green-900/30 text-green-300'
                            : 'border-red-500/40 bg-red-900/30 text-red-300'
                        }`}
                      >
                        {lastOpp.correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium">{lastOpp.text}</span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {new Date(lastOpp.ts).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 border-t border-slate-700/60">
                <p className="text-xs text-zinc-400">
                  Live feed shows when you or your opponent submit and whether it's correct or wrong.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
