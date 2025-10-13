import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import {
  Trophy, Bolt, User, Hourglass, CheckCircle, XCircle, Eye, Timer as TimerIcon,
  Volume2, VolumeX, Radio, Sparkles, Swords, Crown, Target, Zap, Clock, Code2
} from 'lucide-react';
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
type OpponentInfo = { id: number; name?: string; avatar_url?: string | null };

type Mood = 'think' | 'smirk' | 'sad' | 'base';

const removeQuery = (u?: string | null) => (u ? u.split('?')[0] : null);
const getExt = (u?: string | null) => {
  if (!u) return '.png';
  const m = removeQuery(u)!.match(/\.(png|jpg|jpeg|webp|gif)$/i);
  return m ? m[0] : '.png';
};
const stripMood = (u?: string | null) => {
  if (!u) return null;
  const noQ = removeQuery(u)!;
  const noExt = noQ.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');
  return noExt.replace(/_(sad|think|smirk)$/i, '');
};
const normalizeAvatar = (u?: string | null) => {
  if (!u) return null;
  let s = removeQuery(u)!;

  // absolute URLs are fine
  if (/^https?:\/\//i.test(s) || s.startsWith('//')) return s;

  // drop accidental "public/" prefix
  s = s.replace(/^\/?public\//i, '/');

  // ensure it starts at site root
  if (!s.startsWith('/')) s = '/' + s;

  // collapse any accidental double slashes (but keep "http(s)://")
  s = s.replace(/([^:])\/{2,}/g, '$1/');

  return s;
};
/** Build a candidate URL for a given mood (no existence check). */
const buildEmotionUrl = (avatarUrl?: string | null, mood: Mood = 'think') => {
  const normalized = normalizeAvatar(avatarUrl);
  if (!normalized) return null;

  const root = stripMood(normalized);
  if (!root) return normalized;

  const ext = getExt(normalized);
  const emo = mood === 'base' ? '' : `_${mood}`;
  const url = `${root}${emo}${ext}`;
  return `${url}?v=${Date.now()}`;
};

/** Preload an image and resolve true/false. */
const preload = (src: string) =>
  new Promise<boolean>((res) => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = src;
  });

/**
 * Choose the best available mood image:
 * try desired -> think -> base. Keeps current src if all fail.
 */
const chooseMoodSrc = async (
  avatarUrl: string,
  desired: Mood,
  current?: string | null
): Promise<string | null> => {
  const tryList: Mood[] = desired === 'base' ? ['base', 'think'] : [desired, 'think', 'base'];
  for (const m of tryList) {
    const candidate = buildEmotionUrl(avatarUrl, m);
    if (candidate && (await preload(candidate))) return candidate;
  }
  return current ?? (await preload(buildEmotionUrl(avatarUrl, 'base')!)) ? buildEmotionUrl(avatarUrl, 'base')! : null;
};


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

const displayLanguage = (s?: string) =>
  (s?.toLowerCase() === 'cpp' ? 'C++' : (s ?? '').toUpperCase());

// Enhanced Custom Confetti component
const CustomConfetti = ({ active, type = 'win' }: { active: boolean, type?: 'win' | 'celebration' }) => {
  const [particles, setParticles] = useState<Array<{id: number, style: React.CSSProperties}>>([]);
  
  useEffect(() => {
    if (active) {
      const newParticles:any = [];
      const colors = type === 'win' 
        ? ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a", "#ffb347"] 
        : ["#4ade80", "#22d3ee", "#fbbf24", "#f472b6", "#a78bfa", "#60a5fa"];
      for (let i = 0; i < 70; i++) {
        newParticles.push({
          id: i,
          style: {
            left: `50%`,
            top: `50%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0,
            width: `${8 + Math.random() * 8}px`,
            height: `${8 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }
        });
      }
      setParticles(newParticles);
      setTimeout(() => {
        setParticles((prev:any) => prev.map((p:any) => ({
          ...p,
          style: {
            ...p.style,
            left: `${50 + (Math.random() * 100 - 50)}%`,
            top: `${50 + (Math.random() * 100 - 50)}%`,
            opacity: 1,
            transition: `all ${0.8 + Math.random() * 0.7}s ease-out`
          }
        })));
      }, 10);
      setTimeout(() => { setParticles([]); }, 4000);
    }
  }, [active, type]);
  
  if (!active || particles.length === 0) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map(particle => (
        <div key={particle.id} className="absolute" style={particle.style} />
      ))}
    </div>
  );
};

// Enhanced Particle component for opponent animations
const Particles = ({ type, active }: { type: 'success' | 'fail', active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            animation: `particle-${type} 1.2s ease-out forwards`,
            animationDelay: `${i * 0.04}s`,
            opacity: 0
          }}
        />
      ))}
      <style>{`
        @keyframes particle-success {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
          20% { opacity: 1; }
          100% { 
            opacity: 0; 
            transform: translate(
              calc(-50% + ${Math.random() * 120 - 60}px), 
              calc(-50% + ${Math.random() * 120 - 60}px)
            ) scale(1.8) rotate(${Math.random() * 360}deg); 
          }
        }
        @keyframes particle-fail {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
          20% { opacity: 1; }
          100% { 
            opacity: 0; 
            transform: translate(
              calc(-50% + ${Math.random() * 100 - 50}px), 
              calc(-50% + ${Math.random() * 100 - 50}px)
            ) scale(1.5) rotate(${Math.random() * 360}deg); 
          }
        }
      `}</style>
    </div>
  );
};
type Lang = 'python' | 'java' | 'cpp';
type Diff = 'easy' | 'medium' | 'hard';

const LANGUAGE_LABELS: Record<Lang, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};


export default function MatchStart() {
  const { props } = usePage<PageProps>();
  const { match, challenge } = props;

  const [code, setCode] = useState<string>(challenge?.buggy_code ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCorrected, setShowCorrected] = useState(false);

  // live feed modal
  const [feedOpen, setFeedOpen] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  // sound fx
  const [sfxOn, setSfxOn] = useState(true);
  const tickSfx = useRef<HTMLAudioElement | null>(null);
  const successSfx = useRef<HTMLAudioElement | null>(null);
  const failSfx = useRef<HTMLAudioElement | null>(null);

  // ---- Count DOWN timer ----
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const warnedRef = useRef(false);
  const totalMsRef = useRef<number | null>(null); // NEW

  // visual tone based on remaining time
  const timeTone = useMemo(() => {
    if (remainingMs == null) return 'muted';        // no data yet
    if (remainingMs <= 10_000) return 'danger';     // <= 10s
    if (remainingMs <= 60_000) return 'warning';    // <= 60s
    return 'ok';
  }, [remainingMs]);

  const fmtMmSs = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Animation states
  const [opponentStatus, setOpponentStatus] = useState<'idle' | 'submitting' | 'correct' | 'wrong'>('idle');
  const [showOpponentParticles, setShowOpponentParticles] = useState(false);
  const [particleType, setParticleType] = useState<'success' | 'fail' | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [lastOpponentAction, setLastOpponentAction] = useState<{text: string, correct: boolean, time: string} | null>(null);
  const [opponent, setOpponent] = useState<OpponentInfo | null>(null);
  const [oppMood, setOppMood] = useState<'idle' | 'think' | 'smirk' | 'sad' | 'base'>('think');

const languages = [
  { value: 'python' as const, label: 'Python' },
  { value: 'java'   as const, label: 'Java'   },
  { value: 'cpp'    as const, label: 'C++'    }, 
];


const enterFullscreen = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  else if ((el as any).msRequestFullscreen) (el as any).msRequestFullscreen();
};

const exitFullscreen = () => {
  if (document.exitFullscreen) document.exitFullscreen();
  else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
  else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
};


useEffect(() => {
  enterFullscreen();
  return () => {
    exitFullscreen();
  };
}, []);

  // ---- Opponent avatar source that only updates after the new image is loaded
const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

// When opponent changes, preload default moods so first swap is instant
useEffect(() => {
  let dead = false;
  (async () => {
    if (!opponent?.avatar_url) {
      setAvatarSrc(null);
      return;
    }
    // Preload think first; if ok set it.
    const think = buildEmotionUrl(opponent.avatar_url, 'think');
    if (think && (await preload(think)) && !dead) setAvatarSrc(think);
    // Warm other moods in background (no state change)
    const sad = buildEmotionUrl(opponent.avatar_url, 'sad'); sad && preload(sad);
    const smirk = buildEmotionUrl(opponent.avatar_url, 'smirk'); smirk && preload(smirk);
    const base = buildEmotionUrl(opponent.avatar_url, 'base'); base && preload(base);
  })();
  return () => { dead = true; };
}, [opponent?.avatar_url]);

// When mood changes, only switch src after target mood image is confirmed loaded
useEffect(() => {
  let dead = false;
  (async () => {
    if (!opponent?.avatar_url) return;
    const next = await chooseMoodSrc(opponent.avatar_url, oppMood === 'idle' ? 'think' : oppMood, avatarSrc);
    if (!dead && next && next !== avatarSrc) setAvatarSrc(next);
  })();
  return () => { dead = true; };
}, [oppMood, opponent?.avatar_url]); // avatarSrc purposely NOT a dep to avoid loops


  // hide app header while mounted (no beforeunload dialog)
  useEffect(() => {
    document.body.classList.add('hide-app-header');
    return () => document.body.classList.remove('hide-app-header');
  }, []);

  const title = challenge?.title ?? 'Fix the Bug';
  const description = challenge?.description ?? 'Repair the function to satisfy all tests.';
 const lang = displayLanguage(challenge?.language ?? match.language ?? '');
  const diff = (challenge?.difficulty ?? match.difficulty ?? '').toUpperCase();
  const testsCount = Array.isArray(challenge?.tests) ? challenge!.tests!.length : 0;
  const correctedCode = challenge?.corrected_code ?? challenge?.fixed_code ?? null;

  // ---- Refs for polling/dedupe/awards ----
  const seenSubmissionsRef = useRef<Set<string>>(new Set());
  const lastServerUpdatedRef = useRef<number>(0);
  const lastOpponentSubIdRef = useRef<string | null>(null);
  const awardedRef = useRef(false);
  const endedRef = useRef(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const fadeTo = (audio: HTMLAudioElement, target: number, ms: number) => {
  const start = audio.volume;
  const end = clamp(target);
  const dur = Math.max(1, ms);
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = clamp((t - t0) / dur);
    audio.volume = start + (end - start) * k;
    if (k < 1) requestAnimationFrame(tick);
    else if (end === 0) { audio.pause(); audio.currentTime = 0; }
  };
  requestAnimationFrame(tick);
};

  
// sounds (page-local only)
useEffect(() => {
  const mk = (src: string) => {
    const a = new Audio(src);
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    return a;
  };

  try { tickSfx.current    = mk('/sounds/tick.wav');          tickSfx.current!.volume    = 0.9; } catch {}
  try { successSfx.current = mk('/sounds/correct.mp3');       successSfx.current!.volume = 0.95; } catch {}
  try { failSfx.current    = mk('/sounds/defeat.wav');        failSfx.current!.volume    = 0.95; } catch {}

  // BGM – low volume, loop
  try {
    if (!bgmRef.current) {
      bgmRef.current = mk('/audio/bgm.mp3'); // <-- put your track here
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0; // we'll fade in if enabled
    }
  } catch {}

  // Apply toggle immediately
  if (!sfxOn) {
    tickSfx.current?.pause();
    successSfx.current?.pause();
    failSfx.current?.pause();
    if (bgmRef.current) fadeTo(bgmRef.current, 0, 250); // gentle fade out
  } else {
    // start or resume bgm quietly, then fade in
    if (bgmRef.current) {
      bgmRef.current.play().catch(() => {});
      // small delay to avoid clicks on first frame
      setTimeout(() => { if (bgmRef.current) fadeTo(bgmRef.current, 0.22, 600); }, 60);
    }
  }

  return () => {
    // cleanup on unmount
    bgmRef.current?.pause();
  };
}, [sfxOn]);

// One-time unlock on first user interaction (required by autoplay policies)
useEffect(() => {
  const unlock = () => {
     enterFullscreen(); 
    const list = [tickSfx.current, successSfx.current, failSfx.current, bgmRef.current]
      .filter(Boolean) as HTMLAudioElement[];

    for (const a of list) {
      try {
        const p = a.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            a.pause();
            a.currentTime = 0;
          }).catch(() => {});
        }
      } catch {}
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
}, []);

  const playSfx = (kind: 'tick' | 'success' | 'fail') => {
    if (!sfxOn) return;
    const el = kind === 'tick' ? tickSfx.current : kind === 'success' ? successSfx.current : failSfx.current;
    if (el) { try { el.currentTime = 0; el.play?.(); } catch {} }
  };

  // Fallback: set a deadline from difficulty while waiting for server status
  useEffect(() => {
    const already = deadlineMs != null;
    if (already) return;
    const d = (match.difficulty || '').toLowerCase();
    const mins = d === 'hard' ? 20 : d === 'medium' ? 15 : 10;
    const total = mins * 60 * 1000;
    totalMsRef.current = total;
    warnedRef.current = false;
    const now = Date.now();
    setDeadlineMs(now + total);
    setRemainingMs(total);
  }, [match.difficulty, deadlineMs]);

  // countdown tick — updates remainingMs every 250ms
  useEffect(() => {
    const it = setInterval(() => {
      if (deadlineMs == null) return;
      const now = Date.now();
      const rem = Math.max(0, deadlineMs - now);
      setRemainingMs(rem);
      if (rem <= 10_000 && !warnedRef.current) {
        warnedRef.current = true;
        playSfx('tick');
      }
      if (rem === 0 && !endedRef.current) {
        endedRef.current = true;
        apiClient.post(`/api/match/${match.id}/timeout`).catch(() => {});
        Swal.fire({
          title: "Time's up!",
          text: 'This match ended with no rewards.',
          icon: 'info',
          background: '#0f172a',
          color: '#e5e7eb',
          confirmButtonText: 'Back',
          confirmButtonColor: '#64748b',
        }).then(() => window.location.href = '/play/matchmaking');
      }
    }, 250);
    return () => clearInterval(it);
  }, [deadlineMs]);

  // formatted time (falls back to 00:00 if unknown)
  const hhmmss = useMemo(() => {
    if (remainingMs == null) return '—:—';
    return fmtMmSs(remainingMs);
  }, [remainingMs]);

  // submission normalizer
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

  const xpFor = (d: string) => d === 'hard' ? 6 : d === 'medium' ? 4 : 3;

  // polling
  const fetchMatchStatus = async (matchId: string | number) => {
    try {
      const res = await apiClient.get(`/api/match/${matchId}/status`);
      const data = (res as any)?.data ?? res;

      // pick up opponent basic info (id/name/avatar_url) from server
      if (data?.opponent) {
        setOpponent({
          id: Number(data.opponent.id),
          name: data.opponent.name,
          avatar_url: data.opponent.avatar_url,
        });
      }

      // ---- timer bootstrap from server ----
      if (data?.ends_at) {
        const serverNow = data?.server_now ? new Date(data.server_now).getTime() : Date.now();
        const serverEnds = new Date(data.ends_at).getTime();
        const total = Math.max(0, serverEnds - serverNow);
        totalMsRef.current = total;
        warnedRef.current = false;
        setDeadlineMs(Date.now() + total);
        setRemainingMs(total);
      } else if (typeof data?.remaining_seconds === 'number') {
        const total = Math.max(0, data.remaining_seconds * 1000);
        totalMsRef.current = total;
        warnedRef.current = false;
        setDeadlineMs(Date.now() + total);
        setRemainingMs(total);
      }

      // freshness calc
      const subMax = Array.isArray(data?.submissions) && data.submissions.length > 0
        ? Math.max(...data.submissions.map((s: any) => {
            const when = s.at ?? s.created_at ?? s.timestamp ?? null;
            const t = when ? new Date(when).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
          }))
        : 0;
      const lastAt = data?.last?.at ?? data?.last?.created_at ?? null;
      const lastTs = lastAt ? new Date(lastAt).getTime() : 0;
      const serverUpdated = Math.max(subMax, lastTs);
      if (serverUpdated && serverUpdated < lastServerUpdatedRef.current) return;

      // feed merge
      if (Array.isArray(data?.submissions)) {
        const incoming: FeedItem[] = (data.submissions as ServerSubmission[])
          .map(normalizeSubmission)
          .sort((a, b) => a.ts - b.ts);
        const toAppend: FeedItem[] = [];
        for (const item of incoming) {
          if (!seenSubmissionsRef.current.has(item.id)) {
            seenSubmissionsRef.current.add(item.id);
            toAppend.push(item);
            
            // Handle opponent animation states + avatar mood
            if (!item.byMe) {
             const correct = !!item.correct; // handles true/1/"1"

              // particles + status badge
              setOpponentStatus(correct ? 'correct' : 'wrong');
              setParticleType(correct ? 'success' : 'fail');
              setShowOpponentParticles(true);
              setLastOpponentAction({
                text: correct ? 'Correct Solution!' : 'Wrong Solution',
                correct,
                time: new Date(item.ts).toLocaleTimeString()
              });

              if (correct) {
                // Correct: smirk → base (no suffix)
                setOppMood('smirk');
                playSfx('success');
                // shockwave ripple
                ripple();
                setTimeout(() => setOppMood('base'), 1200);
                setTimeout(() => setShowOpponentParticles(false), 1600);
              } else {
                // Wrong: sad → think
                setOppMood('sad');
                playSfx('fail');
                setTimeout(() => setOppMood('think'), 1200);
                setTimeout(() => setShowOpponentParticles(false), 1500);
              }

              // Reset status light
              setTimeout(() => setOpponentStatus('idle'), 2000);
            }
          }
        }
        if (toAppend.length > 0) {
          setFeed(prev => {
            const next = [...prev, ...toAppend];
            return next.slice(Math.max(0, next.length - 40));
          });
        }
        const latestOpp = [...incoming].filter(i => !i.byMe).sort((a, b) => b.ts - a.ts)[0];
        if (latestOpp && latestOpp.id !== lastOpponentSubIdRef.current) {
          lastOpponentSubIdRef.current = latestOpp.id;
          // toast
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

      // finished / surrendered
      if (!endedRef.current) {
        if (data?.finished) {
          endedRef.current = true;
          const youWon = Number(data?.winner_user_id) === Number(match.me);
          if (youWon) {
            playSfx('success');
            if (!awardedRef.current) {
              awardedRef.current = true;
              try {
                await apiClient.post(`/api/match/${match.id}/award`, {
                  language: match.language,
                  difficulty: match.difficulty,
                });
              } catch {}
            }
            const xp = xpFor(match.difficulty);
            setConfettiActive(true);
            await Swal.fire({
              title: 'You win! 🎉',
              html: `<div class="text-zinc-300 text-sm">Great job — your solution passed the tests first.<br/>
                     <div class="mt-2 font-semibold text-emerald-300">XP awarded: ${xp} • +1 ⭐</div></div>`,
              icon: 'success',
              background: '#0f172a',
              color: '#e5e7eb',
              confirmButtonText: 'Continue',
              confirmButtonColor: '#14b8a6',
            });
            window.location.href = '/dashboard';
          } else {
            playSfx('fail');
            setConfettiActive(true);
            setTimeout(() => setConfettiActive(false), 4000);
            await Swal.fire({
              title: 'Opponent won',
              html: `<div class="text-zinc-300 text-sm">They solved it first — good try!<br/>
                     <div class="mt-2 font-semibold text-rose-300">-1 ⭐</div></div>`,
              icon: 'info',
              background: '#0f172a',
              color: '#e5e7eb',
              confirmButtonText: 'Back to queue',
              confirmButtonColor: '#64748b',
            });
            window.location.href = '/play/matchmaking';
          }
        } else if (data?.last?.message && String(data.last.message).toLowerCase() === 'surrendered') {
          endedRef.current = true;
          const byMe = Number(data.last.user_id) === Number(match.me);
          if (byMe) {
            await Swal.fire({
              title: 'You surrendered',
              icon: 'warning',
              background: '#0f172a',
              color: '#e5e7eb',
              confirmButtonText: 'OK',
              confirmButtonColor: '#64748b',
            });
            window.location.href = '/play/matchmaking';
          } else {
            playSfx('success');
            if (!awardedRef.current) {
              awardedRef.current = true;
              try { await apiClient.post(`/api/match/${match.id}/award`, {}); } catch {}
            }
            const xp = xpFor(match.difficulty);
            setConfettiActive(true);
            await Swal.fire({
              title: 'Opponent surrendered 🏆',
              html: `<div class="text-zinc-300 text-sm">Victory by surrender.<br/>
                     <div class="mt-2 font-semibold text-emerald-300">XP awarded: ${xp} • +1 ⭐</div></div>`,
              icon: 'success',
              background: '#0f172a',
              color: '#e5e7eb',
              confirmButtonText: 'Continue',
              confirmButtonColor: '#14b8a6',
            });
            window.location.href = '/dashboard';
          }
        }
      }

      if (serverUpdated) lastServerUpdatedRef.current = serverUpdated;
    } catch (err) {
      console.error('Error fetching match status:', err);
    }
  };

  // small ripple helper (shockwave on correct)
  const ripple = () => {
    const el = document.querySelector('.opp-avatar-wrap');
    if (!el) return;
    el.classList.remove('avatar-ripple');
    void (el as HTMLElement).offsetWidth; // reflow
    el.classList.add('avatar-ripple');
    setTimeout(() => el.classList.remove('avatar-ripple'), 900);
  };

  useEffect(() => {
    let mounted = true;
    fetchMatchStatus(match.id);
    const it = setInterval(() => { if (mounted) fetchMatchStatus(match.id); }, 1300);
    return () => { mounted = false; clearInterval(it); };
  }, [match.id, match.me]);

  // submit
  const submitSolution = async () => {
    try {
      const { data } = await apiClient.post(`/api/match/${match.id}/submit`, { code });
      if (data?.correct) {
        setMessage({ type: 'success', text: '✅ Correct! Finalizing…' });
      } else {
        playSfx('tick');
        setMessage({ type: 'error', text: '❌ Wrong — keep trying!' });
      }
    } catch (e: any) {
      console.error('[SUBMIT ERROR]', e?.response?.data || e);
      setMessage({ type: 'error', text: e?.response?.data?.message || 'Submit failed.' });
    }
  };

  // surrender
  const [isSurrendering, setIsSurrendering] = useState(false);
  const surrender = async () => {
    if (isSurrendering) return;
    setIsSurrendering(true);
    try {
      await apiClient.post(`/api/match/${match.id}/surrender`, {});
      setMessage({ type: 'error', text: 'You surrendered.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.message || 'Failed to surrender.' });
    } finally {
      setIsSurrendering(false);
    }
  };

  // opponent pulse (kept for your modal list, not used for avatar)
  const lastOpp = [...feed].filter(f => !f.byMe).sort((a, b) => b.ts - a.ts)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* local css to hide header when body has class */}
      <style>{`
        .hide-app-header #app-header,
        .hide-app-header .app-header,
        .hide-app-header header[role="banner"] { display: none !important; }
      `}</style>

      <AppLayout
        breadcrumbs={[
          { title: 'Home', href: '/dashboard' },
          { title: 'Match', href: `/play/m/${match.id}` },
        ]}
      >
        <Head title={`Match ${match.id}`} />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Confetti for wins */}
          <CustomConfetti active={confettiActive} type="win" />
          
          {/* Header */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                1v1 Duel — {displayLanguage(match.language)} / {match.difficulty.toUpperCase()}
              </h1>
              <span className="text-zinc-400 text-sm hidden md:inline">Both players received the same AI-generated challenge.</span>
            </div>

            <div className="flex items-center gap-2">
              {/* timer */}
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border text-zinc-300",
                  timeTone === 'ok' ? "border-slate-700/60" : "",
                  timeTone === 'warning' ? "border-amber-500/60 bg-amber-500/10" : "",
                  timeTone === 'danger' ? "border-rose-500/60 bg-rose-500/10 animate-pulse" : "",
                  timeTone === 'muted' ? "border-slate-700/60 opacity-70" : "",
                ].join(' ')}
                title="Match timer"
              >
                <TimerIcon className={["w-4 h-4",
                  timeTone === 'danger' ? "text-rose-400" :
                  timeTone === 'warning' ? "text-amber-400" : "text-cyan-400"
                ].join(' ')} />
                <span className="tabular-nums">{hhmmss}</span>
              </div>

              {/* time progress bar */}
              {deadlineMs && remainingMs != null && (
                <div className="w-40 h-1.5 bg-slate-800/60 rounded-full overflow-hidden ml-3">
                  <div
                    className="h-full bg-cyan-500 transition-[width] duration-300"
                    style={{
                      width:
                        totalMsRef.current && remainingMs != null && totalMsRef.current > 0
                          ? `${Math.max(0, Math.min(100, (remainingMs / totalMsRef.current) * 100))}%`
                          : '0%',
                    }}
                  />
                </div>
              )}

              {/* sfx toggle */}
              <button
                onClick={() => setSfxOn(s => !s)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 px-3 py-1.5 text-zinc-300 hover:bg-slate-900/40"
                title="Toggle sounds"
              >
                {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-xs">{sfxOn ? 'SFX on' : 'SFX off'}</span>
              </button>

              {/* live feed modal button */}
              <button
                onClick={() => setFeedOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 px-3 py-1.5 text-zinc-300 hover:bg-slate-900/40"
              >
                <Radio className="w-4 h-4" />
                <span className="text-xs">Live feed</span>
              </button>

              {/* surrender */}
              <button
                onClick={surrender}
                disabled={isSurrendering || (remainingMs != null && remainingMs <= 0)}
                className="text-sm px-3 py-2 rounded-lg border border-slate-700/60 disabled:opacity-50 hover:bg-rose-900/20 transition-colors"
              >
                {isSurrendering ? 'Surrendering…' : 'Surrender'}
              </button>

              {/* ids */}
              <div className="ml-2 hidden md:flex items-center gap-3 text-zinc-300">
                <User className="w-5 h-5" /><span>you #{match.me}</span>
                <span className="opacity-40">vs</span>
                <User className="w-5 h-5" /><span>opponent #{match.opponent}</span>
              </div>
            </div>
          </div>

          {/* Inline message */}
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg ${
                message.type === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
              } animate-bounceIn`}
            >
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm">{message.text}</span>
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
                  className="w-full h-[380px] md:h-[520px] rounded-lg bg-slate-950 border border-slate-700/60 p-3 text-sm text-zinc-100 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                  spellCheck={false}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Code2 className="w-3 h-3" /> {testsCount} Tests
                    <span className="mx-1">•</span>
                    <Zap className="w-3 h-3" /> {lang}
                    <span className="mx-1">•</span>
                    <Trophy className="w-3 h-3" /> {diff}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitSolution}
                      disabled={remainingMs != null && remainingMs <= 0}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                      Submit Solution
                    </button>

                    {/* {correctedCode && (
                      <button
                        onClick={() => setShowCorrected(!showCorrected)}
                        className="px-3 py-2 rounded-lg border border-slate-700/60 text-xs flex items-center gap-1 hover:bg-slate-800/40 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {showCorrected ? 'Hide Solution' : 'FOR DEMO ONLY'}
                      </button>
                    )} */}
                  </div>
                </div>

                {showCorrected && correctedCode && (
                 <pre
                    className="mt-3 p-3 rounded-lg bg-black/40 text-green-300 text-xs
                              overflow-auto max-h-[70vh] whitespace-pre border border-emerald-500/20"
                    style={{ fontFamily: '"Courier New", ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  >
                    {correctedCode}
                  </pre>
                )}
              </div>
            </div>

            {/* Right: OPPONENT PANEL - Enhanced design */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 overflow-hidden relative">
              <div className="p-4 border-b border-slate-700/60 flex items-center gap-2">
                <div className="relative">
                  <Hourglass className="w-4 h-4 text-amber-300" />
                  {opponentStatus !== 'idle' && (
                    <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                      opponentStatus === 'correct' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400 animate-ping'
                    }`} />
                  )}
                </div>
                <h2 className="font-semibold text-zinc-100">Opponent Activity</h2>
                <span className="ml-auto text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Live
                </span>
              </div>

              <div className="p-4 h-[460px] md:h-[560px] flex items-center justify-center relative">
                {/* Particles animation */}
                {particleType && <Particles type={particleType} active={showOpponentParticles} />}

                {/* Shockwave on success */}
                <div className="opp-avatar-wrap absolute">
                  <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-transparent" />
                </div>

                {!lastOpponentAction ? (
                  <div className="text-center space-y-6">
                    <div className="relative mx-auto w-44 h-44 opp-avatar-wrap">
                      {/* Pulsing rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping-slow" />
                      <div className="absolute inset-3 rounded-full border-2 border-indigo-500/10 animate-pulse-slow" />
                      {/* Avatar */}
                   {opponent?.avatar_url ? (
                          <img
                            src={avatarSrc || buildEmotionUrl(opponent.avatar_url, 'base') || opponent?.avatar_url || ''}
                            alt="Opponent avatar"
                            draggable={false}
                            loading="eager"
                            className={`w-44 h-44 object-contain select-none
                              ${oppMood === 'think' ? 'animate-opp-breathe' : ''}
                              ${oppMood === 'smirk' ? 'animate-opp-bounce avatar-glow-green' : ''}
                              ${oppMood === 'sad' ? 'animate-opp-shake avatar-glow-red' : ''}`}
                          />
                        ) : (


                        <div className="w-44 h-44 rounded-full bg-indigo-600/20 grid place-items-center border-2 border-slate-700/60">
                          <Target className="w-12 h-12 text-indigo-300 animate-bounce-slow" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-zinc-200">
                        {opponent?.name ? `${opponent.name}'s turn…` : 'Waiting for opponent'}
                      </h3>
                      <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                        Your opponent hasn’t made a submission yet. Stay focused on your solution!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 w-full">
                    {/* Status indicator */}
                    <div className="relative mx-auto w-44 h-44 opp-avatar-wrap">
                      {/* Animated rings */}
                      <div className={`absolute inset-0 rounded-full ${
                        lastOpponentAction.correct 
                          ? 'border-4 border-emerald-500/30 bg-emerald-900/10 animate-ping-slow' 
                          : 'border-4 border-rose-500/30 bg-rose-900/10 animate-pulse'
                      }`} />
                      <div className="absolute inset-4 rounded-full border-2 border-slate-700/60" />
                      
                      {/* Avatar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                       {opponent?.avatar_url ? (
                            <img
                              src={avatarSrc || buildEmotionUrl(opponent.avatar_url, 'base') || opponent?.avatar_url || ''}

                              alt="Opponent avatar"
                              draggable={false}
                              loading="eager"
                              className={`w-40 h-40 object-contain select-none
                                ${oppMood === 'think' ? 'animate-opp-breathe' : ''}
                                ${oppMood === 'smirk' ? 'animate-opp-bounce avatar-glow-green' : ''}
                                ${oppMood === 'sad' ? 'animate-opp-shake avatar-glow-red' : ''}`}
                            />


                        ) : lastOpponentAction.correct ? (
                          <Crown className="w-12 h-12 text-yellow-300 animate-bounce" />
                        ) : (
                          <XCircle className="w-12 h-12 text-rose-300 animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    {/* Status message */}
                    <div className="space-y-3">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        lastOpponentAction.correct
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-900/40 text-rose-300 border border-rose-500/40'
                      } animate-bounceIn`}>
                        {lastOpponentAction.correct ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{lastOpponentAction.text}</span>
                      </div>
                      
                      <div className="text-xs text-zinc-400 flex items-center justify-center gap-2">
                        <Clock className="w-3 h-3" />
                        {lastOpponentAction.time}
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="w-full max-w-xs mx-auto bg-slate-800/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          lastOpponentAction.correct ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: lastOpponentAction.correct ? '100%' : '65%' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-700/60">
                <p className="text-xs text-zinc-400 text-center">
                  The panel updates in real-time when your opponent submits a solution.
                  {lastOpponentAction && lastOpponentAction.correct && (
                    <span className="block mt-1 text-emerald-300 font-medium">
                      They solved it correctly! Hurry up!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>

      {/* Live feed modal */}
      {feedOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFeedOpen(false)} />
          <div className="relative w-full md:w-[640px] max-h-[80vh] overflow-hidden rounded-t-2xl md:rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur">
            <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
              <div className="text-zinc-200 font-medium flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Live attempts
              </div>
              <button onClick={() => setFeedOpen(false)} className="px-3 py-1.5 rounded-lg text-sm border border-slate-700/60">
                Close
              </button>
            </div>
            <div className="p-4 max-h-[65vh] overflow-y-auto">
              {feed.length === 0 ? (
                <div className="text-xs text-zinc-500">No attempts yet.</div>
              ) : (
                <ul className="space-y-1">
                  {[...feed].sort((a, b) => b.ts - a.ts).map((f) => (
                    <li key={f.id} className="text-xs">
                      <span className={f.correct ? 'text-green-300' : 'text-red-300'}>
                        {f.correct ? '✔' : '✖'}
                      </span>{' '}
                      {f.text}{' '}
                      <span className="opacity-50">({new Date(f.ts).toLocaleTimeString()})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional CSS animations */}
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        
        @keyframes ping-slow { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

        /* Avatar motions */
        @keyframes opp-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .animate-opp-breathe { animation: opp-breathe 3.2s ease-in-out infinite; }

        @keyframes opp-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px) rotate(-1deg); }
          30% { transform: translateX(10px) rotate(1deg); }
          45% { transform: translateX(-6px) rotate(-1deg); }
          60% { transform: translateX(6px) rotate(1deg); }
          75% { transform: translateX(-3px) rotate(-1deg); }
        }
        .animate-opp-shake { animation: opp-shake 0.8s ease-in-out; }

        @keyframes opp-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px) scale(1.02); } }
        .animate-opp-bounce { animation: opp-bounce 0.8s ease-in-out; }

        /* Glow halos */
        .avatar-glow-green { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); animation: glow-green 1.2s ease-out; border-radius: 16px; }
        .avatar-glow-red { box-shadow: 0 0 0 0 rgba(244,63,94,0.45); animation: glow-red 1.0s ease-out; border-radius: 16px; }
        @keyframes glow-green { 0%{ box-shadow: 0 0 0 0 rgba(16,185,129,0.55);} 100%{ box-shadow: 0 0 40px 10px rgba(16,185,129,0);} }
        @keyframes glow-red { 0%{ box-shadow: 0 0 0 0 rgba(244,63,94,0.55);} 100%{ box-shadow: 0 0 36px 8px rgba(244,63,94,0);} }

        /* Shockwave ripple (correct) */
        .avatar-ripple::after {
          content: '';
          position: absolute; inset: -8px;
          border: 3px solid rgba(16,185,129,0.45);
          border-radius: 9999px;
          animation: ripple 0.9s ease-out forwards;
        }
        @keyframes ripple { 0%{ transform: scale(0.7); opacity: 1;} 100%{ transform: scale(1.4); opacity: 0;} }

        /* Existing slow bounce for fallback */
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
