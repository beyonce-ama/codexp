import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Trophy, Bolt, User, Hourglass } from 'lucide-react';
import { apiClient } from '@/utils/api';

type PageProps = {
  match: { id: string; language: string; difficulty: string; mode: string; me: number; opponent: number; };
  challenge: { title: string; description: string; language: string; difficulty: string; buggy_code?: string | null; tests: any[]; };
  ui: { showOpponentAsAnimation: boolean; };
};

export default function MatchStart() {
  const { props } = usePage<PageProps>();
  const { match, challenge, ui } = props;
  const [code, setCode] = useState<string>(challenge.buggy_code ?? '');

 const submitSolution = async () => {
  try {
    const { data } = await apiClient.post(`/api/match/${match.id}/submit`, { code });
    if (data?.correct) {
      alert('✅ Correct! You win. Redirecting to dashboard…');
      window.location.href = '/dashboard';
    } else {
      alert('❌ Wrong — keep trying!');
    }
  } catch (e:any) {
    alert(e?.response?.data?.message || 'Submit failed.');
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

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: YOUR board (editor + details) */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Bolt className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-semibold text-zinc-100">{challenge.title}</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{challenge.description}</p>
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
                    Tests: {challenge.tests?.length ?? 0} • Language: {challenge.language.toUpperCase()}
                  </div>
                  <button
                    onClick={submitSolution}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-95"
                  >
                    Submit Solution
                  </button>
                </div>
              </div>
            </div>

            {/* Right: OPPONENT PANEL — animations/status only */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 overflow-hidden relative">
              <div className="p-4 border-b border-slate-700/60 flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-300" />
                <h2 className="font-semibold text-zinc-100">Opponent</h2>
                <span className="ml-auto text-xs text-zinc-500">live status</span>
              </div>

              <div className="p-4 h-[460px] md:h-[560px] flex items-center justify-center">
                {/* Simple “live” animation / status placeholder */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-indigo-600/20 animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/30 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-indigo-300" />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/60">
                <p className="text-xs text-zinc-400">
                  You won’t see opponent code. This panel only shows status & celebration when someone finishes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
