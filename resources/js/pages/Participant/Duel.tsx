// resources/js/Pages/Participant/Duel.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Swords, Users, Play, Clock, Trophy, Star,
    RefreshCw, Plus, Search, Send, X, Flag,
    CheckCircle, XCircle, Timer, Award,
    User, Crown, Target, Code, AlertTriangle, ArrowRight,
    Lightbulb, Eye, Zap, Volume2, VolumeX, UserCheck, BookOpen
} from 'lucide-react';
import { apiClient } from '@/utils/api';
import Swal from 'sweetalert2';
import AnimatedBackground from '@/components/AnimatedBackground';
import { audio } from '@/utils/sound';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Practice', href: '#' },
    { title: 'Duel Challenge', href: '/play/duel' }
];
type Language = 'python' | 'java' | 'cpp';
interface Challenge1v1 {
    id: number;
    title: string;
    description: string | null;
    language: Language; 
    difficulty: 'easy' | 'medium' | 'hard';
    buggy_code: string | null;
    fixed_code: string | null;
    created_at: string;
}

// --- Add/replace your User interface to mirror the API ---
interface User {
  id: number;
  name: string;
  email: string;
  stars?: number;     // from API
  total_xp?: number; 
  avatar?: string | null;  // from API
  level?: number;     // computed on client
  profile?: {
    username?: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
  };
  is_online?: boolean;  // UI-only
  last_seen?: string;   // UI-only
}
const resolveAvatar = (u: User | null | undefined) => {
  const raw =
    (u as any)?.avatar ??
    u?.profile?.avatar ??
    u?.profile?.avatar_url ??
    null;

  if (!raw) return '/avatars/default.png';

  const s = String(raw);
  if (s.startsWith('http://') || s.startsWith('https://')) return s; // absolute
  if (s.startsWith('/')) return s;                                    // rooted
  return `/${s}`;                                                     // relative -> rooted
};
const xpToLevel = (xp?: number) => Math.max(1, Math.floor((xp ?? 0) / 10));



interface DuelSubmission {
    id: number;
    user_id: number;
    code_submitted: string;
    is_correct: boolean;
    judge_feedback: string;
    time_spent_sec: number;
    created_at: string;
    user: User;
    similarity?: number;
}

interface Duel {
    id: number;
    challenger: User;
    opponent: User;
    challenge: Challenge1v1 | null;
    language: string;
    status: 'pending' | 'active' | 'finished' | 'surrendered';
    started_at: string | null;
    ended_at: string | null;
    winner: User | null;
    winner_id: number | null;
    winner_xp: number | null;
    winner_stars: number | null;
    created_at: string;
    submissions?: DuelSubmission[];
    session_duration_minutes?: number;
    challenger_finished_at?: string | null;
    opponent_finished_at?: string | null;
    challenger_started_at?: string | null;
    opponent_started_at?: string | null;
    last_updated?: string;
}

interface DuelStats {
    duels_played: number;
    duels_won: number;
    duels_as_challenger: number;
    duels_as_opponent: number;
    duels_today: number;
}

export default function ParticipantDuel() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState<'browse' | 'my-duels'>('my-duels');
    const [challenges, setChallenges] = useState<Challenge1v1[]>([]);
    const [duels, setDuels] = useState<Duel[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const [duelStats, setDuelStats] = useState<DuelStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [languageFilter, setLanguageFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Create Duel Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge1v1 | null>(null);
    const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [opponentSearch, setOpponentSearch] = useState('');
    const [sessionTimeLimit, setSessionTimeLimit] = useState<number>(15);

    // Active Duel Modal
    const [showDuelModal, setShowDuelModal] = useState(false);
    const [activeDuel, setActiveDuel] = useState<Duel | null>(null);
    const [userCode, setUserCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [duelEnded, setDuelEnded] = useState(false);
    const [opponentSubmission, setOpponentSubmission] = useState<DuelSubmission | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [lastSubmissionResult, setLastSubmissionResult] = useState<{ isCorrect: boolean; similarity?: number } | null>(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    // Add near other useStates
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
const [waitingDuels, setWaitingDuels] = useState<number[]>([]);
const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const displayLanguage = (s: string) => (s === 'cpp' ? 'C++' : (s ?? '').toUpperCase());

// New, independent review modal state

const stopAllTimers = () => {
  if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
  sessionTimerRef.current = null;
  refreshIntervalRef.current = null;
};
const [showReviewModal, setShowReviewModal] = useState(false);
const [reviewDuel, setReviewDuel] = useState<Duel | null>(null);
const [comparison, setComparison] = useState<{
  challenger: { name: string; isCorrect: boolean; time: number };
  opponent: { name: string; isCorrect: boolean; time: number };
} | null>(null);


    const resultShownRef = useRef(false);
   
// One switch to control global UI when ANY duel modal is open
useEffect(() => {
  const isOpen = showDuelModal || showCreateModal || showReviewModal;

  // let other components (header / quick-dock / SafeLink) know
  try {
    (window as any).__modalOpen = isOpen;
    window.dispatchEvent(new CustomEvent('app:modal', { detail: { open: isOpen } }));
  } catch {}

  // lock/unlock background scroll
  const root = document.documentElement;
  if (isOpen) root.classList.add('overflow-hidden');
  else root.classList.remove('overflow-hidden');

  // toggle a body flag for CSS-based header/quick-dock hiding
  if (isOpen) document.body.classList.add('duel-open');
  else document.body.classList.remove('duel-open');

  return () => {
    root.classList.remove('overflow-hidden');
    document.body.classList.remove('duel-open');
  };
}, [showDuelModal, showCreateModal, showReviewModal]);

// Fullscreen helpers
const enterFullscreen = () => {
  const el = document.documentElement; // full window
  if (el.requestFullscreen) el.requestFullscreen();
  else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  else if ((el as any).msRequestFullscreen) (el as any).msRequestFullscreen();
};

const exitFullscreen = () => {
  if (document.exitFullscreen) document.exitFullscreen();
  else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
  else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
};


    // >>> NEW: helper to hydrate winner when only winner_id is present
    const hydrateWinner = (d: Duel): Duel => {
        if (d?.winner_id && !d?.winner) {
            const w = d.challenger?.id === d.winner_id ? d.challenger : d.opponent;
            return { ...d, winner: w || null };
        }
        return d;
    };

    useEffect(() => {
        if (activeTab === 'browse') {
            fetchChallenges();
            fetchParticipants();
        }
        if (activeTab === 'my-duels') {
            fetchMyDuels();
        }
        fetchDuelStats();
    }, [activeTab, languageFilter, difficultyFilter, searchTerm]);


    // Handle fullscreen when duel modal opens/closes
useEffect(() => {
  if (showDuelModal) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}, [showDuelModal]);

    // Session timer for active duels
    useEffect(() => {
        if (showDuelModal && activeDuel && activeDuel.status === 'active' && !duelEnded && startTime) {
            const sessionDuration = (activeDuel.session_duration_minutes || 15) * 60 * 1000;
            
            const updateTimer = () => {
                const now = Date.now();
                const elapsed = now - startTime.getTime();
                const remaining = Math.max(0, sessionDuration - elapsed);
                
                setSessionTimeLeft(Math.floor(remaining / 1000));
                setTimeSpent(Math.floor(elapsed / 1000));
                
                if (remaining <= 60000 && remaining > 59000) {
                    audio.play('warning');
                }
                
                if (remaining <= 0) {
                    handleTimeUp();
                    return;
                }
            };

            updateTimer();
            sessionTimerRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (sessionTimerRef.current) {
                    clearInterval(sessionTimerRef.current);
                }
            };
        }
    }, [showDuelModal, activeDuel, duelEnded, startTime]);


    // Auto-refresh active duels with conflict resolution
    useEffect(() => {
        if (showDuelModal && activeDuel && !duelEnded) {
            refreshIntervalRef.current = setInterval(() => {
                fetchDuelStatus(activeDuel.id);
            }, 2000); // Check every 2 seconds for real-time sync

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [showDuelModal, activeDuel, duelEnded]);

    const handleTimeUp = async () => {
        if (!activeDuel || duelEnded) return;

        setDuelEnded(true);
        audio.play('warning');

        if (userCode.trim() && !hasSubmitted) {
            await submitDuelCode(true);
        } else {
            Swal.fire({
                  icon: 'warning',
                  title: "Time's Up!",
                  text: 'The duel has ended. Results will be determined based on submissions.',
                  timer: 3000,
                  showConfirmButton: false,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
                  color: '#fff'
                });

            // Try to finalize if both have already submitted (server will be authoritative)
            if (activeDuel?.id) {
              fetchDuelStatus(activeDuel.id);
            }

            setShowDuelModal(false);
            fetchMyDuels();
        }
    };

    // Helper function to calculate string similarity (Levenshtein distance)
    const calculateStringSimilarity = (str1: string, str2: string): number => {
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                } else {
                    matrix[j][i] = Math.min(
                        matrix[j - 1][i] + 1,
                        matrix[j][i - 1] + 1,
                        matrix[j - 1][i - 1] + 1
                    );
                }
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len2][len1]) / maxLen;
    };

    // Enhanced validation - requires 100% match with database fixed_code
    const validateCode = (userCode: string, challenge: Challenge1v1): { isValid: boolean; similarity: number } => {
        const code = userCode.trim();
        const fixedCode = challenge.fixed_code?.trim();
        
        if (!code) {
            console.log('Duel validation: FAIL - No code provided');
            return { isValid: false, similarity: 0 };
        }

        if (!fixedCode) {
            console.log('Duel validation: FAIL - No solution available in database');
            return { isValid: false, similarity: 0 };
        }

        // Check minimum requirements
        if (code.length < 20) {
            console.log('Duel validation: FAIL - Code too short (minimum 20 characters)');
            return { isValid: false, similarity: 0 };
        }

        // Check if user made meaningful changes from buggy code
        if (code === challenge.buggy_code?.trim()) {
            console.log('Duel validation: FAIL - No changes made from original buggy code');
            return { isValid: false, similarity: 0 };
        }

        // Normalize both codes for comparison
        const normalizeCode = (codeStr: string) => {
            return codeStr
                .replace(/\r\n/g, '\n')
                .replace(/\s+/g, ' ')
                .replace(/\s*;\s*/g, ';')
                .replace(/\s*\{\s*/g, '{')
                .replace(/\s*\}\s*/g, '}')
                .replace(/\s*\(\s*/g, '(')
                .replace(/\s*\)\s*/g, ')')
                .replace(/\s*==\s*/g, '==')
                .replace(/\s*=\s*/g, '=')
                .trim();
        };

        const normalizedUserCode = normalizeCode(code);
        const normalizedFixedCode = normalizeCode(fixedCode);

        // Calculate similarity
        const similarity = calculateStringSimilarity(normalizedUserCode, normalizedFixedCode);
        const similarityPercentage = Math.round(similarity * 100);

        // Direct comparison - must match the database solution EXACTLY
        const isExactMatch = normalizedUserCode === normalizedFixedCode;
        
        if (isExactMatch) {
            console.log('Duel validation: PASS - Exact match with database solution (100%)');
            return { isValid: true, similarity };
        }

        console.log(`Duel validation: FAIL - Only ${similarityPercentage}% similarity with database solution (requires 100%)`);
        
        // REQUIRES EXACTLY 100% match (similarity >= 1.0)
        const passed = similarity >= 1.0;
        console.log(`Duel validation: ${passed ? 'PASS' : 'FAIL'} (${similarityPercentage}% similarity, requires 100%)`);
        
        return { isValid: passed, similarity };
    };

    type SideSummary = { userId: number; is_correct: boolean; time_spent_sec: number; submission: DuelSubmission };

    const decideWinnerFromSubmissions = (duel: Duel): {
      winner_id: number | null;
      loser_id: number | null;
      reason: string;
      challenger?: SideSummary;
      opponent?: SideSummary;
    } => {
      if (!duel || !duel.submissions || !duel.challenger || !duel.opponent) {
        return { winner_id: null, loser_id: null, reason: 'insufficient_data' };
      }

      // Use the latest submission per player (or earliest—choose latest here)
      const byUser: Record<number, DuelSubmission[]> = {};
      for (const s of duel.submissions) {
        if (!byUser[s.user_id]) byUser[s.user_id] = [];
        byUser[s.user_id].push(s);
      }
      const pickLatest = (arr: DuelSubmission[]) =>
        arr.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      const chUserId = duel.challenger.id;
      const opUserId = duel.opponent.id;

      if (!byUser[chUserId] || !byUser[opUserId]) {
        return { winner_id: null, loser_id: null, reason: 'awaiting_opponent' };
      }

      const ch = pickLatest(byUser[chUserId]);
      const op = pickLatest(byUser[opUserId]);

      const challenger: SideSummary = { userId: chUserId, is_correct: ch.is_correct, time_spent_sec: ch.time_spent_sec, submission: ch };
      const opponent:   SideSummary = { userId: opUserId, is_correct: op.is_correct, time_spent_sec: op.time_spent_sec, submission: op };

      // Decision:
      // 1) Both correct -> faster time wins
      if (challenger.is_correct && opponent.is_correct) {
        const winner = challenger.time_spent_sec <= opponent.time_spent_sec ? challenger : opponent;
        const loser  = winner.userId === challenger.userId ? opponent : challenger;
        return { winner_id: winner.userId, loser_id: loser.userId, reason: 'both_correct_fastest_time', challenger, opponent };
      }

      // 2) Only one correct -> that one wins
      if (challenger.is_correct && !opponent.is_correct) {
        return { winner_id: challenger.userId, loser_id: opponent.userId, reason: 'only_challenger_correct', challenger, opponent };
      }
      if (!challenger.is_correct && opponent.is_correct) {
        return { winner_id: opponent.userId, loser_id: challenger.userId, reason: 'only_opponent_correct', challenger, opponent };
      }

     // 3) None correct -> wait for time limit before deciding
        if (!challenger.is_correct && !opponent.is_correct) {
        return { winner_id: null, loser_id: null, reason: 'both_incorrect_wait_for_timeout', challenger, opponent };
        }


      return { winner_id: null, loser_id: null, reason: 'undecided' };
    };
// util you can keep locally if you want to keep the html string approach:
const putCodeIntoSwal = (preId: string, code: string) => {
  const el = Swal.getHtmlContainer()?.querySelector<HTMLElement>(`#${preId}`);
  if (el) el.textContent = code; // ← TEXT, not HTML
};

  // At component level
useEffect(() => {
  return () => {
    stopAllTimers();
    setShowReviewModal(false);
    setReviewDuel(null);
    setComparison(null);
  };
}, []);

const buildComparisonForModal = (duel: Duel) => {
  if (!duel?.submissions || !duel.challenger || !duel.opponent) return null;

  const lastByUser = (uid: number) =>
    duel.submissions!
      .filter(s => s.user_id === uid)
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const ch = lastByUser(duel.challenger.id);
  const op = lastByUser(duel.opponent.id);
  if (!ch || !op) return null;

  return {
    challenger: {
      name: duel.challenger.name,
      isCorrect: !!ch.is_correct,          // ✅ normalized
      time: Number(ch.time_spent_sec ?? 0) // ✅ normalized
    },
    opponent: {
      name: duel.opponent.name,
      isCorrect: !!op.is_correct,
      time: Number(op.time_spent_sec ?? 0)
    },
  };
};

    const finalizeDuelIfReady = async (duelData: Duel) => {
      setWaitingForOpponent(false); 
      if (!duelData || !duelData.submissions) return;

      const decision = decideWinnerFromSubmissions(duelData);
      if (!decision.winner_id) {
        // still waiting
        setWaitingForOpponent(true);
        return;
      }

      // We have a winner — try to persist to backend
      try {
        setFinalizing(true);
        const payload = {
          winner_id: decision.winner_id,
          reason: decision.reason,
          challenger_time: decision.challenger?.time_spent_sec,
          opponent_time: decision.opponent?.time_spent_sec,
        };

        const res = await apiClient.post(`/api/duels/${duelData.id}/finalize`, payload);

        // If backend succeeds, it should return the finished duel object
        if (res?.success && res?.data) {
          await handleDuelFinished(res.data as Duel);
        } else {
          // Fallback: close locally with computed winner
          const localWinner = decision.winner_id === duelData.challenger.id ? duelData.challenger : duelData.opponent;
          const closed: Duel = {
            ...duelData,
            status: 'finished',
            winner: localWinner,
            winner_id: decision.winner_id,
            winner_xp: duelData.winner_xp ?? 3,      // default rewards
            winner_stars: duelData.winner_stars ?? 1,
            ended_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          } as Duel;

          await handleDuelFinished(closed);
        }
      } catch (e) {
        console.warn('Finalize failed, showing local result:', e);
        const decision2 = decideWinnerFromSubmissions(duelData);
        const localWinner = decision2.winner_id === duelData.challenger.id ? duelData.challenger : duelData.opponent;
        const closed: Duel = {
          ...duelData,
          status: 'finished',
          winner: localWinner,
          winner_id: decision2.winner_id!,
          winner_xp: duelData.winner_xp ?? 3,        // default rewards
          winner_stars: duelData.winner_stars ?? 1,
          ended_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as Duel;
        await handleDuelFinished(closed);
      } finally {
        setFinalizing(false);
        setWaitingForOpponent(false);
      }
    };

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (languageFilter !== 'all') params.language = languageFilter;
            if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
            if (searchTerm.trim()) params.search = searchTerm.trim();
            params.exclude_taken = true;
            if (selectedOpponent?.id) params.opponent_id = selectedOpponent.id;

            const response = await apiClient.get('/api/challenges/1v1', { params });
            if (response.success) {
                const challengeData = response.data.data || response.data || [];
                setChallenges(challengeData);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyDuels = async (silent: boolean = false) => {
        try {
            if (!silent) setLoading(true);

            const response = await apiClient.get('/api/duels/my');
            if (response.success) {
                const duelsData = response.data || [];
                const validDuels = duelsData.filter((duel: any) => 
                    duel && 
                    duel.id && 
                    duel.challenger && 
                    duel.opponent && 
                    duel.challenge
                );
                
                // Sort duels by last_updated to ensure consistent winner display
                const sortedDuels = validDuels.sort((a: Duel, b: Duel) => {
                    const aUpdated = new Date(a.last_updated || a.created_at).getTime();
                    const bUpdated = new Date(b.last_updated || b.created_at).getTime();
                    return bUpdated - aUpdated;
                });
                
                // >>> UPDATED: hydrate winner for each duel
                const hydrated = sortedDuels.map(hydrateWinner);
                setDuels(hydrated);
                // <<<
                console.log('📊 Duels loaded:', sortedDuels.length);
            } else {
                throw new Error(response.message || 'Failed to fetch duels');
            }
        } catch (error) {
            console.error('Error fetching duels:', error);
            
            if (!silent) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Load',
                    text: 'Could not load your duels. Please try again.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#1f2937',
                    color: '#fff'
                });
            }
            
            if (!silent) {
                setDuels([]);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };
// Expects: { success: boolean, data: Array<User-like> }
const fetchParticipants = async () => {
  try {
    const response = await apiClient.get('/api/users/participants');
    if (response.success) {
      const participantData = response.data
        .filter((p: User) => p.id !== user.id)
        .map((p: User) => {
          const totalXp = Number(p.total_xp ?? 0);
          const stars = Number.isFinite(Number(p.stars)) ? Number(p.stars) : 0;

          return {
            ...p,
            avatar: resolveAvatar(p), 
            total_xp: totalXp,
            stars,
            level: xpToLevel(totalXp),           
            is_online: Math.random() > 0.3,
            last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          };
        });

      setParticipants(participantData);
      console.log('👥 Participants loaded:', participantData.length);
    }
  } catch (error) {
    console.error('Error fetching participants:', error);
    setParticipants([]);
  }
};



    const fetchDuelStatus = async (duelId: number) => {
        try {
            const response = await apiClient.get(`/api/duels/${duelId}`);
            if (response.success && response.data) {
                // >>> UPDATED: hydrate the incoming duel
                const duelData: Duel = hydrateWinner(response.data);
                // <<<
             // Update local duel state with latest from server (authoritative source)
                setActiveDuel(prevDuel => {
                    if (!prevDuel || prevDuel.id !== duelData.id) return prevDuel;
                    
                    // Only update if server data is newer
                    const serverUpdated = new Date(duelData.last_updated || duelData.created_at).getTime();
                    const localUpdated = new Date(prevDuel.last_updated || prevDuel.created_at).getTime();
                    
                    if (serverUpdated >= localUpdated) {
                        return { ...duelData };
                    }
                    
                    return prevDuel;
                });
                if (duelData.status === 'finished') {
                      setActiveDuel(duelData);
                      if (!resultShownRef.current) {
                        resultShownRef.current = true;
                        await handleDuelFinished(duelData);
                      }
                      return;
                    }
   
                if (duelData.submissions && duelData.submissions.length > 0) {
                    const opponentSub = duelData.submissions.find((sub: DuelSubmission) => 
                        sub.user_id !== user.id
                    );
                    
                    // if (opponentSub && (!opponentSubmission || opponentSub.id !== opponentSubmission.id)) {
                    //     setOpponentSubmission(opponentSub);
                    //     audio.play('tick');
                        
                    //     Swal.fire({
                    //         icon: 'info',
                    //         title: 'Opponent Submitted!',
                    //         text: `Your opponent has submitted their solution. ${opponentSub.is_correct ? 'They got it right!' : 'Their solution needs work.'}`,
                    //         toast: true,
                    //         position: 'top-end',
                    //         showConfirmButton: false,
                    //         timer: 3000,
                    //         background: '#1f2937',
                    //         color: '#fff'
                    //     });
                    // }
                }

                // Decide & finalize when both sides have submitted
                if (duelData.submissions && duelData.submissions.length >= 2) {
                    const hasChallenger = duelData.submissions.some((s: DuelSubmission) => s.user_id === duelData.challenger.id);
                    const hasOpponent   = duelData.submissions.some((s: DuelSubmission) => s.user_id === duelData.opponent.id);

                   if (hasChallenger && hasOpponent && duelData.status !== 'finished' && !finalizing) {
                    
                    const allSubmitted = duelData.submissions.length >= 2;

                    // finalize only if both correct or duel expired
                    const duelExpired = duelData.ended_at && new Date(duelData.ended_at).getTime() <= Date.now();

                    const bothSubmitted = duelData.submissions.length >= 2;
                    const bothCorrect = duelData.submissions.filter(s => s.is_correct).length === 2;

                    if (bothCorrect) {
                    await finalizeDuelIfReady(duelData);
                    } else if (bothSubmitted) {
                    // Both have submitted but not both correct yet
                    setWaitingForOpponent(true);
                    } else {
                    // Only one submitted
                    setWaitingForOpponent(true);
                    }



                    }

                }
            }
        } catch (error) {
            console.error('Error fetching duel status:', error);
        }
    };

    const handleDuelFinished = async (duelData: Duel) => {

    if (resultShownRef.current) return;
resultShownRef.current = true;


        // >>> UPDATED: hydrate and use safe defaults for rewards
        const hydrated = hydrateWinner(duelData);
        const isWinner = hydrated.winner_id === user.id;
        const winnerName = hydrated.winner?.name || 'Unknown';
        const xp = hydrated.winner_xp ?? 3;
        const stars = hydrated.winner_stars ?? 1;
        // <<<
const cmp = buildComparisonForModal(hydrated);
const cmpHtml = cmp ? `
  <div class="mt-4 text-sm">
    <div class="font-semibold mb-2">Result Comparison</div>
    <table class="w-full text-left border-collapse">
      <thead>
        <tr>
          <th class="border-b border-gray-700 py-2 pr-2">Player</th>
          <th class="border-b border-gray-700 py-2 pr-2">Correct</th>
          <th class="border-b border-gray-700 py-2">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="py-2 pr-2">${cmp.challenger.name}</td>
          <td class="py-2 pr-2 ${cmp.challenger.isCorrect ? 'text-green-400' : 'text-red-400'}">
            ${cmp.challenger.isCorrect ? '✔' : '✘'}
          </td>
          <td class="py-2">${Math.floor(cmp.challenger.time/60)}m ${cmp.challenger.time%60}s</td>
        </tr>
        <tr>
          <td class="py-2 pr-2">${cmp.opponent.name}</td>
          <td class="py-2 pr-2 ${cmp.opponent.isCorrect ? 'text-green-400' : 'text-red-400'}">
            ${cmp.opponent.isCorrect ? '✔' : '✘'}
          </td>
          <td class="py-2">${Math.floor(cmp.opponent.time/60)}m ${cmp.opponent.time%60}s</td>
        </tr>
      </tbody>
    </table>
  </div>
` : '';


        if (isWinner) {
            audio.play('victory');
        } else {
            audio.play('defeat');
        }
        
      await Swal.fire({
  icon: isWinner ? 'success' : 'info',
  title: isWinner ? 'Victory!' : 'Duel Complete',
  html: `
    <div class="text-center">
      <div class="text-4xl mb-4">${isWinner ? '🏆' : '🤝'}</div>
      <p class="mb-4 text-lg">
        ${isWinner ? 'Congratulations! You won the duel!' : `The duel has ended. Winner: ${winnerName}`}
      </p>
      ${isWinner ? `
        <div class="flex justify-center space-x-4 mt-4">
          <div class="font-bold text-xl">+${xp} XP</div>
          <div class="font-bold text-xl">+${stars} ⭐</div>
        </div>
      ` : ' <div class="mt-2 font-semibold text-rose-300">-1 ⭐</div>'}
      <p class="text-sm text-gray-400 mt-4">
        Your time: ${Math.floor(timeSpent/60)}m ${timeSpent%60}s
      </p>
      ${cmpHtml}
    </div>
  `,
  timer: 8000,
  showConfirmButton: true,
  confirmButtonText: 'Continue',
  background: '#1f2937',
  color: '#fff'
});

        
        // Update local duels list with server data (hydrated)
        setDuels(prevDuels => 
            prevDuels.map(d => d.id === hydrated.id ? hydrated : d)
        );
        
        fetchMyDuels();
        setWaitingDuels((prev) => prev.filter((id) => id !== duelData.id));
        fetchDuelStats();
    };

    const fetchDuelStats = async () => {
        try {
            const response = await apiClient.get('/api/me/stats');
            if (response.success && response.data) {
                // Only use actual data from database - no fake values
                const data = response.data;
                
                // Calculate real duel stats from language stats if available
                let realDuelsPlayed = 0;
                let realDuelsWon = 0;
                let realDuelsAsChallenger = 0;
                let realDuelsAsOpponent = 0;
                let realDuelsToday = 0;
                
                // Check if user has language stats with actual duel data
                if (data.language_stats && Array.isArray(data.language_stats)) {
                    const languageStats = data.language_stats.filter((stat: any) => 
                        stat && (stat.games_played > 0 || stat.wins > 0)
                    );
                    
                    if (languageStats.length > 0) {
                        realDuelsPlayed = languageStats.reduce((sum: number, stat: any) => sum + (stat.games_played || 0), 0);
                        realDuelsWon = languageStats.reduce((sum: number, stat: any) => sum + (stat.wins || 0), 0);
                    }
                }
                
                // Use direct API data if available, otherwise 0
                realDuelsAsChallenger = data.duels_as_challenger || 0;
                realDuelsAsOpponent = data.duels_as_opponent || 0;
                realDuelsToday = data.duels_today || 0;
                
                setDuelStats({
                    duels_played: realDuelsPlayed,
                    duels_won: realDuelsWon,
                    duels_as_challenger: realDuelsAsChallenger,
                    duels_as_opponent: realDuelsAsOpponent,
                    duels_today: realDuelsToday
                });
            } else {
                // Set all zeros for new users with no data
                setDuelStats({
                    duels_played: 0,
                    duels_won: 0,
                    duels_as_challenger: 0,
                    duels_as_opponent: 0,
                    duels_today: 0
                });
            }
        } catch (error) {
            console.error('Error fetching duel stats:', error);
            // Set all zeros on error
            setDuelStats({
                duels_played: 0,
                duels_won: 0,
                duels_as_challenger: 0,
                duels_as_opponent: 0,
                duels_today: 0
            });
        }
    };

    const declineDuel = async (duel: Duel) => {
        try {
            audio.play('click');
            const response = await apiClient.post(`/api/duels/${duel.id}/decline`);
            
            if (response.success) {
                audio.play('success');
                await Swal.fire({
                    icon: 'info',
                    title: 'Duel Declined',
                    text: 'You have declined the duel challenge.',
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#1f2937',
                    color: '#fff'
                });
                
                fetchMyDuels();
            } else {
                throw new Error(response.message || 'Failed to decline duel');
            }
        } catch (error: any) {
            console.error('Error declining duel:', error);
            
            // For demo purposes, simulate decline
            audio.play('success');
            await Swal.fire({
                icon: 'info',
                title: 'Duel Declined',
                text: 'You have declined the duel challenge.',
                timer: 3000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#fff'
            });
            
            // Update local state
            setDuels(prevDuels => 
                prevDuels.map(d => d.id === duel.id
              ? { ...d, status: 'declined' as const, ended_at: new Date().toISOString(), last_updated: new Date().toISOString() }
              : d
            )
            );
        }
    };

    const createDuel = async () => {
        if (!selectedChallenge || !selectedOpponent) {
            Swal.fire('Error', 'Please select both a challenge and an opponent.', 'error');
            return;
        }
            
          try {
            setCreateLoading(true);
            audio.play('click');

            const duelData = {
                opponent_id: selectedOpponent.id,
                challenge_id: selectedChallenge.id,
                language: selectedChallenge.language,
                session_duration_minutes: sessionTimeLimit,
            };

            console.log('Creating duel:', duelData);

            const response = await apiClient.post('/api/duels', duelData);
            if (!response.success) throw new Error(response.message || 'Failed');

            // ✅ success path
            audio.play('success');
            setShowCreateModal(false);
            setSelectedChallenge(null);
            setSelectedOpponent(null);

            await Swal.fire({
                icon: 'success',
                title: 'Duel Created!',
                text: `Your duel challenge has been sent to ${selectedOpponent.name}. Session time: ${sessionTimeLimit} minutes.`,
                timer: 3000,
                showConfirmButton: false,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
                color: '#fff'
            });

            setActiveTab('my-duels');
            fetchMyDuels();

            } catch (err: any) {
            // 🔒 server-side rule: either player already took the challenge
            if (String(err?.response?.status) === '422') {
                await Swal.fire({
                icon: 'warning',
                title: 'Challenge Unavailable',
                text: 'That challenge was already taken by one of you. Please pick another.',
                background: '#1f2937',
                color: '#fff'
                });
                // refresh list using opponent_id + exclude_taken
                await fetchChallenges();
                return;
            }

            console.error('Error creating duel:', err);
            await Swal.fire({
                icon: 'error',
                title: 'Failed to create duel',
                text: err?.message ?? 'Please try again.',
                background: '#1f2937',
                color: '#fff'
            });

            } finally {
            setCreateLoading(false);
            }

    };
    const startDuel = async (duel: Duel) => {
        resultShownRef.current = false;

        if (!duel.challenge) {
            Swal.fire('Error', 'Challenge data is not available for this duel.', 'error');
            return;
        }
        
        // If duel is pending and user is opponent, accept it first
        if (duel.status === 'pending' && duel.opponent?.id === user?.id) {
            await acceptDuel(duel);
            return;
        }
        
        // If duel is active, start the user's individual timer
        if (duel.status === 'active') {
            try {
                // Call the start API to begin the user's individual session
                const response = await apiClient.post(`/api/duels/${duel.id}/start-user-session`);
                if (response.success) {
                    // Update duel with individual start time
                    duel = response.data;
                }
            } catch (error) {
                console.warn('Could not start user session on backend, continuing locally:', error);
            }
            
            audio.play('start');
            setActiveDuel(duel);
            if (duel.submissions?.some((s: DuelSubmission) => s.user_id !== user.id)) {
              setWaitingForOpponent(false);
            } else {
              // you haven't submitted yet, so no waiting banner yet
              setWaitingForOpponent(false);
            }

            setUserCode(duel.challenge.buggy_code || '');
            if (waitingDuels.includes(duel.id)) {
                Swal.fire({
                    icon: 'info',
                    title: 'Waiting for Opponent',
                    text: 'You’ve already submitted your correct solution. Please wait for your opponent to finish.',
                    timer: 3000,
                    background: '#1f2937',
                    color: '#fff',
                });
                return;
                }

            setShowDuelModal(true);
            resultShownRef.current = false; 
            setTimeSpent(0);
            
            // >>> UPDATED: fix challenger check (no challenger_id in type)
            const userStartTime = user?.id === duel.challenger.id 
                ? duel.challenger_started_at 
                : duel.opponent_started_at;
            // <<<
                
            const sessionDuration = (duel.session_duration_minutes || 15) * 60;
            setSessionTimeLeft(sessionDuration);
            setDuelEnded(false);
            setOpponentSubmission(null);
            setHasSubmitted(false);
            setLastSubmissionResult(null);
            setShowCorrectAnswer(false);
            
            // Use individual start time if available, otherwise current time
            if (userStartTime) {
                setStartTime(new Date(userStartTime));
            } else {
                setStartTime(new Date());
            }
        }
        
        // If duel is finished, just show review
       // If duel is finished, just show review
if (duel.status === 'finished') {
  setActiveDuel(duel);
  setShowDuelModal(true);
  setDuelEnded(true);

  // Load user's submission if available
  if (duel.submissions) {
    const userSub = duel.submissions.find(
      (sub: DuelSubmission) => sub.user_id === user.id
    );
    if (userSub) {
      setUserCode(userSub.code_submitted);
      setHasSubmitted(true);
      setLastSubmissionResult({
        isCorrect: userSub.is_correct,
        similarity: userSub.similarity,
      });
    }

    const opponentSub = duel.submissions.find(
      (sub: DuelSubmission) => sub.user_id !== user.id
    );
    if (opponentSub) {
      setOpponentSubmission(opponentSub);
    }

    // 🔹 NEW: Build a comparison object
    const challengerSub = duel.submissions.find(
      (s: DuelSubmission) => s.user_id === duel.challenger.id
    );
    const opponentRealSub = duel.submissions.find(
      (s: DuelSubmission) => s.user_id === duel.opponent.id
    );

    if (challengerSub && opponentRealSub) {
      setComparison({
        challenger: {
          name: duel.challenger.name,
          isCorrect: challengerSub.is_correct,
          time: challengerSub.time_spent_sec,
        },
        opponent: {
          name: duel.opponent.name,
          isCorrect: opponentRealSub.is_correct,
          time: opponentRealSub.time_spent_sec,
        },
      });
    }
  }
}

    };

    const submitDuelCode = async (autoSubmit: boolean = false) => {
        if (!activeDuel || !activeDuel.challenge || (!userCode.trim() && !autoSubmit)) {
            if (!autoSubmit) {
                audio.play('failure');
                Swal.fire('Error', 'Please write some code before submitting.', 'error');
            }
            return;
        }

        try {
            setSubmitting(true);
            audio.play('click');
            
            // Enhanced validation with exact match requirement
            const validation = validateCode(userCode || '// No solution submitted', activeDuel.challenge);
            const isCorrect = validation.isValid;
            const similarity = validation.similarity;
            
            setLastSubmissionResult({ isCorrect, similarity });
            setHasSubmitted(true);
            
            const submissionData = {
                duel_id: activeDuel.id,
                code_submitted: userCode || '// No solution submitted',
                is_correct: isCorrect,
                time_spent_sec: timeSpent,
                judge_feedback: isCorrect 
                    ? `Perfect! Your solution is an exact match with the database answer (100% match).` 
                    : `Incorrect. Your solution has ${Math.round(similarity * 100)}% similarity with the database answer. You need 100% match to pass.`,
            };

            console.log('Submitting duel code:', submissionData);

            // Submit to backend
            const response = await apiClient.post(`/api/duels/${activeDuel.id}/submit`, submissionData);
            
            if (response.success) {
                console.log('Duel submission successful:', response.data);
                
                if (isCorrect) {
                    audio.play('success');
                    
                    await Swal.fire({
                        icon: 'success',
                        title: 'Perfect Solution!',
                        html: `
                            <div class="text-center">
                                <p class="mb-4 text-lg">Your solution is a perfect 100% match!</p>
                                <div class="accuracy-display mb-4">
                                    <div class="text-2xl font-bold text-green-400">100% Perfect Match</div>
                                    <div class="text-gray-400">Exact Database Solution</div>
                                </div>
                                <div class="text-lg font-bold text-green-600 mb-2">
                                    Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s
                                </div>
                                <p class="text-sm text-gray-600">Waiting for opponent or final results...</p>
                            </div>
                        `,
                          timer: 6000,
                          timerProgressBar: true,
                          showConfirmButton: true,
                          confirmButtonText: 'Continue',
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
                          color: '#fff',
                          confirmButtonColor: '#10B981'
                    });
                    
                    stopAllTimers();
                    setShowDuelModal(false);
                    setWaitingForOpponent(true);
                    fetchMyDuels(true);
                    fetchDuelStatus(activeDuel.id);
                    setWaitingDuels((prev) => [...new Set([...prev, activeDuel.id])]);

                } else {
                    if (!autoSubmit) {
                        audio.play('failure');
                      await Swal.fire({
                        title: 'Almost There!',
                        html: `
                            <div class="text-center">
                            <div class="text-5xl mb-4">⚠️</div>
                            <p class="mb-3 text-lg font-semibold text-red-200">
                                Your solution must exactly match the database answer.
                            </p>

                            <div class="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                                <div class="text-lg font-bold text-yellow-300">${Math.round(similarity * 100)}% Match</div>
                                <div class="text-sm text-gray-200 opacity-80">Need 100% for Success</div>
                            </div>

                            <div class="bg-gray-900/40 rounded-lg p-3 text-left text-sm text-gray-200">
                                <div class="font-medium text-yellow-400 mb-1">💡 Tips:</div>
                                <ul class="list-disc list-inside space-y-1">
                                <li>Ensure your code is at least 20 characters long</li>
                                <li>Don’t just copy the buggy version</li>
                                <li>Whitespace, symbols & punctuation matter</li>
                                <li>⚠️ Don’t remove or add unnecessary comments — they are also compared in the database</li>
                                </ul>
                            </div>
                            </div>
                        `,
                        timer: 4500,
                        showConfirmButton: true,
                        confirmButtonText: 'Try Again',
                        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #111827 100%)', 
                        color: '#e5e7eb',
                        confirmButtonColor: '#3B82F6',
                        backdrop: 'rgba(0,0,0,0.6)', 
                        });

                    }
                }
                // If both haven't finished yet, show waiting state
                setWaitingForOpponent(true);

                // Proactively re-fetch to see if opponent already submitted and to trigger finalize
                fetchDuelStatus(activeDuel.id);

                fetchDuelStats();
            } else {
                throw new Error(response.message || 'Failed to submit code');
            }
        } catch (error) {
            console.error('Error submitting duel code:', error);
            if (!autoSubmit) {
                audio.play('failure');
                Swal.fire('Error', 'Failed to submit your code. Please try again.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };
const showCodeModal = (title: string, code: string) => {
  Swal.fire({
    title,
    html: `
      <div>
        <p class="mb-3 text-gray-300">100% match required:</p>
        <div class="bg-gray-900 rounded-lg p-4 text-left">
          <pre id="swal-code"
               class="text-green-400 text-sm overflow-auto"
               style="
                 font-family:'Courier New',monospace;
                 white-space: pre;      /* keep indentation and angle brackets */
                 max-height: 70vh;      /* taller */
                 max-width: 90vw;       /* responsive */
               "></pre>
        </div>
      </div>
    `,
    width: 900,
    background: '#1f2937',
    color: '#fff',
    confirmButtonText: 'Got it!',
    confirmButtonColor: '#10B981',
    didOpen: () => {
      const el = Swal.getHtmlContainer()?.querySelector<HTMLElement>('#swal-code');
      if (el) el.textContent = code; // <-- TEXT, not HTML
    }
  });
};

    const showCorrectAnswerHandler = () => {
        if (activeDuel?.challenge?.fixed_code) {
            audio.play('click');
            setShowCorrectAnswer(true);
            
            showCodeModal('Database Solution', activeDuel!.challenge!.fixed_code || '');
        }
    };

    const surrenderDuel = async () => {
        if (!activeDuel) return;

        const result = await Swal.fire({
            title: 'Surrender Duel?',
            text: 'Are you sure you want to surrender? This will end the duel.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, surrender',
            background: '#1f2937',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        try {
            setDuelEnded(true);
            audio.play('defeat');
            
            // Try to submit surrender to backend
            try {
                await apiClient.post(`/api/duels/${activeDuel.id}/surrender`);
            } catch (backendError) {
                console.warn('Backend surrender failed:', backendError);
            }
            
            setShowDuelModal(false);
            
            // Update duel status optimistically
            const opponent = activeDuel.challenger.id === user.id ? activeDuel.opponent : activeDuel.challenger;
            setDuels(prevDuels => 
                prevDuels.map(d => 
                    d.id === activeDuel.id 
                        ? { ...d, status: 'finished' as const, winner: opponent, winner_id: opponent.id, last_updated: new Date().toISOString() }
                        : d
                )
            );
            
            await Swal.fire({
                icon: 'info',
                title: 'Surrendered',
                text: 'You have surrendered the duel.',
                html: `<div class="text-zinc-300 text-sm">
                       <div class="mt-2 font-semibold text-rose-300">-1 ⭐</div>
                     </div>`,
                background: '#1f2937',
                color: '#fff'
            });
            fetchDuelStats();
        } catch (error) {
            console.error('Error surrendering:', error);
            Swal.fire('Error', 'Failed to surrender. Please try again.', 'error');
        }
    };

    const acceptDuel = async (duel: Duel) => {
        try {
            audio.play('start');
            const response = await apiClient.post(`/api/duels/${duel.id}/accept`);
            
            if (response.success) {
                audio.play('success');
                await Swal.fire({
                    icon: 'success',
                    title: 'Duel Accepted!',
                    text: `The duel is now active. Session time: ${duel.session_duration_minutes || 15} minutes. Click "Start Duel" to begin!`,
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#1f2937',
                    color: '#fff'
                });
                
                fetchMyDuels();
                fetchDuelStats();
            } else {
                throw new Error(response.message || 'Failed to accept duel');
            }
        } catch (error: any) {
            console.error('Error accepting duel:', error);
            
            // For demo purposes, simulate acceptance
            audio.play('success');
            await Swal.fire({
                icon: 'success',
                title: 'Duel Accepted!',
                text: `The duel is now active. Session time: ${duel.session_duration_minutes || 15} minutes. Click "Start Duel" to begin!`,
                timer: 3000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#fff'
            });
            
            // Update local state
            setDuels(prevDuels => 
                prevDuels.map(d => 
                    d.id === duel.id 
                        ? { ...d, status: 'active' as const, started_at: new Date().toISOString(), last_updated: new Date().toISOString() }
                        : d
                )
            );
            
            fetchDuelStats();
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-900/30 text-green-300 border border-green-500/50';
            case 'medium': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50';
            case 'hard': return 'bg-red-900/30 text-red-300 border border-red-500/50';
            default: return 'bg-gray-900/30 text-gray-300 border border-gray-500/50';
        }
    };

    const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50';
        case 'active':
        return 'bg-blue-900/30 text-blue-300 border border-blue-500/50';
        case 'finished':
        return 'bg-gray-900/30 text-gray-300 border border-gray-500/50';
        case 'declined':
        return 'bg-red-900/30 text-red-300 border border-red-500/50';
        case 'surrendered':
        return 'bg-orange-900/30 text-orange-300 border border-orange-500/50';
        default:
        return 'bg-gray-900/30 text-gray-300 border border-gray-500/50';
    }
    };



    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = (timeLeft: number, totalTime: number) => {
        const percentage = (timeLeft / totalTime) * 100;
        if (percentage > 50) return 'text-green-400';
        if (percentage > 20) return 'text-yellow-400';
        return 'text-red-400';
    };

    // Filter active participants for opponent selection
   const q = opponentSearch.toLowerCase().trim();
  const activeParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(q)
  );

const showOpponentList = opponentSearch.trim().length >= 2;

    // Sort participants by online status
    const sortedParticipants = activeParticipants.sort((a, b) => {
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        return a.name.localeCompare(b.name);
    });
// Auto-select if there's exactly one candidate while typing
useEffect(() => {
  if (!showOpponentList) return;
  if (sortedParticipants.length === 1) {
    setSelectedOpponent(sortedParticipants[0]);
  }
}, [showOpponentList, sortedParticipants]);

const handleOpponentSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key !== 'Enter') return;
  const q = opponentSearch.trim().toLowerCase();
  if (!q) return;

  // Exact NAME match first
  const exact = sortedParticipants.find(p => p.name.toLowerCase() === q);
  if (exact) {
    setSelectedOpponent(exact);
    return;
  }

  // Otherwise top result
  if (sortedParticipants.length > 0) {
    setSelectedOpponent(sortedParticipants[0]);
  }
};


    const StatCard = ({ title, value, icon: Icon, color }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
    }) => (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-400">{title}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden">
              {/* Background */}
        <AnimatedBackground />
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
            </div>

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Duel Challenge" />
                <div className="flex flex-col gap-6 p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Swords className="h-8 w-8 text-cyan-400" />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    DUEL CHALLENGE
                                </h1>
                                <p className="text-gray-400 text-sm">Challenge other participants in timed coding duels</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                    soundEnabled 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-600 text-gray-300'
                                }`}
                                onMouseEnter={() => audio.play('hover')}
                            >
                                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button> */}
                            <button
                                onClick={() => {
                                    audio.play('click');
                                    setActiveTab('browse');
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 hover:scale-105 transition-all duration-300"
                                onMouseEnter={() => audio.play('hover')}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Duel</span>
                            </button>
                        </div>
                    </div>

                    {/* Duel Stats */}
                    {duelStats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            
                            <StatCard title="Victories" value={duelStats.duels_won} icon={Crown} color="bg-yellow-500" />
                            <StatCard title="As Challenger" value={duelStats.duels_as_challenger} icon={Target} color="bg-red-500" />
                            <StatCard title="As Opponent" value={duelStats.duels_as_opponent} icon={User} color="bg-green-500" />
                            <StatCard title="Today" value={duelStats.duels_today} icon={Clock} color="bg-purple-500" />
                            <StatCard title="Duels Played" value={duelStats.duels_played} icon={Swords} color="bg-blue-500" />
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    audio.play('click');
                                    setActiveTab('my-duels');
                                }}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                                    activeTab === 'my-duels' 
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                                onMouseEnter={() => audio.play('hover')}
                            >
                                <Swords className="h-5 w-5" />
                                <span className="font-medium">My Duels</span>
                                {duels.length > 0 && (
                                    <span className="bg-black/20 px-2 py-1 rounded-full text-xs">{duels.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    audio.play('click');
                                    setActiveTab('browse');
                                }}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                                    activeTab === 'browse' 
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                                onMouseEnter={() => audio.play('hover')}
                            >
                                <Target className="h-5 w-5" />
                                <span className="font-medium">Browse Challenges</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'my-duels' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400" />
                                        <div className="text-gray-300">Loading your duels...</div>
                                    </div>
                                </div>
                            ) : duels.length === 0 ? (
                                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                    <div className="text-center py-12 text-gray-400">
                                        <Swords className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No Duels Yet</h3>
                                        <p className="mb-4">You haven't participated in any duels yet.</p>
                                        <button
                                            onClick={() => {
                                                audio.play('click');
                                                setActiveTab('browse');
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700"
                                            onMouseEnter={() => audio.play('hover')}
                                        >
                                            Browse Challenges
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {duels.map((duel) => {
                                        if (!duel.challenge) {
                                            return (
                                                <div key={duel.id} className="bg-gray-800/30 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
                                                    <div className="text-center text-red-400">
                                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                                        <p>Challenge data unavailable</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        
                                        const sessionMinutes = duel.session_duration_minutes || 15;
                                        const isCurrentUserWinner = duel.winner_id === user.id;
                                        
                                        return (
                                            <div key={duel.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-300">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white mb-1">{duel.challenge.title}</h3>
                                                        <p className="text-sm text-gray-400">{duel.challenge.language} • {duel.challenge.difficulty}</p>
                                                        <p className="text-xs text-cyan-400 mt-1">⏱️ {sessionMinutes} min session</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(duel.status)}`}>
                                                        {duel.status.toUpperCase()}
                                                    </span>
                                                 {duel.status === 'active' && (() => {
                                                    const myCorrect = duel.submissions?.some(
                                                        (s) => s.user_id === user.id && s.is_correct
                                                    );
                                                    const opponentHasSubmitted = duel.submissions?.some(
                                                        (s) => s.user_id !== user.id
                                                    );
                                                    const opponentCorrect = duel.submissions?.some(
                                                        (s) => s.user_id !== user.id && s.is_correct
                                                    );

                                                    // ✅ also use local waitingDuels array (duel you just submitted)
                                                    const locallyWaiting = waitingDuels.includes(duel.id);

                                                    if ((myCorrect || locallyWaiting) && !opponentHasSubmitted) {
                                                        return (
                                                        <span className="text-xs text-blue-400 font-medium ml-2">
                                                            ⏳ Waiting for opponent to submit.
                                                        </span>
                                                        );
                                                    }
                                                    if ((myCorrect || locallyWaiting) && opponentHasSubmitted && !opponentCorrect) {
                                                        return (
                                                        <span className="text-xs text-blue-400 font-medium ml-2">
                                                            ⏳ Opponent submitted but not correct yet.
                                                        </span>
                                                        );
                                                    }
                                                    return null;
                                                    })()}


                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400">Challenger:</span>
                                                        <span className="text-white font-medium">{duel.challenger?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400">Opponent:</span>
                                                        <span className="text-white font-medium">{duel.opponent?.name || 'Unknown'}</span>
                                                    </div>
                                                    {duel.winner && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-400">Winner:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <Crown className="h-4 w-4 text-yellow-400" />
                                                                <span className={`font-medium ${isCurrentUserWinner ? 'text-green-400' : 'text-yellow-400'}`}>
                                                                    {duel.winner.name}
                                                                    {isCurrentUserWinner && ' (You!)'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {duel.last_updated && (
                                                        <div className="text-xs text-gray-500">
                                                            Last updated: {new Date(duel.last_updated).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">
                                                        Created: {new Date(duel.created_at).toLocaleDateString()}
                                                        {duel.started_at && (
                                                            <div className="mt-1">
                                                                Started: {new Date(duel.started_at).toLocaleTimeString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {duel.status === 'pending' && duel.opponent?.id === user?.id && (
                                                          <div className="flex space-x-2">
                                                              <button
                                                                  onClick={() => acceptDuel(duel)}
                                                                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm hover:scale-105 transition-all duration-300"
                                                                  onMouseEnter={() => audio.play('hover')}
                                                              >
                                                                  Accept
                                                              </button>
                                                              <button
                                                                  onClick={() => declineDuel(duel)}
                                                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm hover:scale-105 transition-all duration-300"
                                                                  onMouseEnter={() => audio.play('hover')}
                                                              >
                                                                  Decline
                                                              </button>
                                                          </div>
                                                      )}

                                                    {duel.status === 'active' && (() => {
                                                       const myCorrect = duel.submissions?.some((s) => s.user_id === user.id && s.is_correct);
                                                        const mySubmitted = duel.submissions?.some((s) => s.user_id === user.id);
                                                        const opponentCorrect = duel.submissions?.some((s) => s.user_id !== user.id && s.is_correct);
                                                        const locallyWaiting = waitingDuels.includes(duel.id);

                                                        const disabled =
                                                        mySubmitted ||
                                                        myCorrect ||
                                                        opponentCorrect ||   
                                                        locallyWaiting ||
                                                        finalizing ||
                                                        duel.status === 'finished' ||
                                                        duelEnded;


                                                        return (
                                                            <button
                                                            onClick={() => !disabled && startDuel(duel)}
                                                            disabled={disabled}
                                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 font-medium shadow-md
                                                                ${
                                                                disabled
                                                                    ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed opacity-50'
                                                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-105'
                                                                }`}
                                                            onMouseEnter={() => !disabled && audio.play('hover')}
                                                            >
                                                            <Play className="h-4 w-4" />
                                                            <span>
                                                                {myCorrect || locallyWaiting
                                                                    ? 'Waiting for opponent...'
                                                                    : opponentCorrect
                                                                    ? 'Opponent already submitted'
                                                                    : duelEnded || duel.status === 'finished'
                                                                    ? 'Completed'
                                                                    : 'Start Duel'}
                                                                </span>


                                                            </button>
                                                        );
                                                        })()}

                                                     {duel.status === 'finished' && (
                                                        <button
                                                         onClick={async () => {
                                                        try {
                                                          const res = await apiClient.get(`/api/duels/${duel.id}`);
                                                          if (res.success) {                      // ✅ use res.success (not res.data.success)
                                                            const fresh: Duel = res.data;
                                                            setReviewDuel(fresh);
                                                            setComparison(buildComparisonForModal(fresh)); // ✅ normalized shape
                                                            setShowReviewModal(true);
                                                          }
                                                        } catch (err) {
                                                          console.error('Failed to load duel for review', err);
                                                        }
                                                      }}

                                                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        >
                                                          Review
                                                        </button>
                                                      )}

                                                    </div>
                                                </div>
                                                

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
{showReviewModal && reviewDuel && (
  
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => {
        setShowReviewModal(false);
        setReviewDuel(null);
        setComparison(null);
      }}
    />
    {/* modal */}
    <div className="relative z-[101] w-full max-w-3xl rounded-2xl bg-gray-900 text-white shadow-xl border border-white/10">
      <div className="flex items-center justify-between p-4 rounded-t-2xl bg-blue-800 text-white">
        <div className="font-semibold">
          Duel Review — {reviewDuel.challenge?.title ?? `#${reviewDuel.id}`} • {displayLanguage(reviewDuel.language as string) ?? ''}

        </div>
        <button
          onClick={() => {
            setShowReviewModal(false);
            setReviewDuel(null);
            setComparison(null);
          }}
          className="px-3 py-1 rounded-md bg-blue-800 hover:bg-blue-600"
        >
          Close
        </button>
      </div>
<div className="p-4 space-y-4">
  {/* Winner banner */}
  {(() => {
    const surrendered = reviewDuel.status === 'surrendered' ||
      (reviewDuel.status === 'finished' &&
       reviewDuel.submissions?.filter(s => s.is_correct || s.code_submitted)?.length === 1);

    return (
      <div className="rounded-lg bg-gray-800/70 p-3 border border-white/10">
        <div className="text-sm opacity-75 mb-1">Result</div>
        <div className="text-lg">
          {surrendered ? (
            reviewDuel.winner?.id === user.id
              ? 'Opponent surrendered — you win!'
              : 'You surrendered this duel.'
          ) : reviewDuel.winner ? (
            <>Winner: <span className="font-semibold">{reviewDuel.winner.name}</span></>
          ) : (
            'Completed'
          )}
        </div>
      </div>
    );
  })()}

        {/* Comparison table */}
       {/* Comparison table */}
{comparison ? (
  <div className="rounded-lg bg-gray-800/50 p-3 border border-white/10">
    <div className="font-semibold mb-2">Result Comparison</div>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th className="text-left border-b border-white/10 py-2 pr-2">Player</th>
          <th className="text-center border-b border-white/10 py-2 pr-2">Correct</th>
          <th className="text-center border-b border-white/10 py-2">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-2 pr-2">{comparison.challenger.name}</td>
          <td className={`text-center ${comparison.challenger.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {comparison.challenger.isCorrect ? '✔' : '✘'}
          </td>
          <td className="text-center">
            {Math.floor(comparison.challenger.time / 60)}m {comparison.challenger.time % 60}s
          </td>
        </tr>
        <tr>
          <td className="py-2 pr-2">{comparison.opponent.name}</td>
          <td className={`text-center ${comparison.opponent.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {comparison.opponent.isCorrect ? '✔' : '✘'}
          </td>
          <td className="text-center">
            {Math.floor(comparison.opponent.time / 60)}m {comparison.opponent.time % 60}s
          </td>
        </tr>
      </tbody>
    </table>
  </div>
) : (
  <div className="text-sm text-gray-300">No submissions to compare.</div>
)}

{/* Code blocks */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  {/* Your submission */}
  {reviewDuel.submissions?.find(s => s.user_id === user.id) && (
    <div className="rounded-lg bg-gray-800/50 p-3 border border-white/10">
      <div className="font-semibold mb-2">Your Submission</div>
      <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">
        {reviewDuel.submissions.find(s => s.user_id === user.id)!.code_submitted}
      </pre>
    </div>
  )}

  {/* Opponent submission */}
  {reviewDuel.submissions?.find(s => s.user_id !== user.id) && (
    <div className="rounded-lg bg-gray-800/50 p-3 border border-white/10">
      <div className="font-semibold mb-2">Opponent Submission</div>
      <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">
        {reviewDuel.submissions.find(s => s.user_id !== user.id)!.code_submitted}
      </pre>
    </div>
  )}
</div>

      </div>
    </div>
  </div>
)}

                    {activeTab === 'browse' && (
                        <>
                            {/* Filters */}
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search challenges by title..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={languageFilter}
                                            onChange={(e) => setLanguageFilter(e.target.value)}
                                            className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300"
                                            onMouseEnter={() => audio.play('hover')}
                                        >
                                            <option value="all">All Languages</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                             <option value="cpp">C++</option>
                                        </select>
                                        <select
                                            value={difficultyFilter}
                                            onChange={(e) => setDifficultyFilter(e.target.value)}
                                            className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300"
                                            onMouseEnter={() => audio.play('hover')}
                                        >
                                            <option value="all">All Difficulties</option>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Challenges Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    <div className="col-span-full flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400" />
                                            <div className="text-gray-300">Loading challenges...</div>
                                        </div>
                                    </div>
                                ) : challenges.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-gray-400">
                                        {searchTerm ? `No challenges found matching "${searchTerm}"` : 'No challenges available'}
                                    </div>
                                ) : (
                                    challenges.map((challenge) => (
                                        <div key={challenge.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:border-cyan-500/50">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                                                <div className="flex space-x-2">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/50">
                                                        {displayLanguage(challenge.language)}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                                                        {challenge.difficulty.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {challenge.description && (
                                                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                                                    {challenge.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center space-x-1 text-yellow-400">
                                                    <Trophy className="h-4 w-4" />
                                                    <span className="text-sm font-medium">3 XP</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        audio.play('click');
                                                        setSelectedChallenge(challenge);
                                                        setShowCreateModal(true);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    <Swords className="h-4 w-4" />
                                                    <span>Challenge</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* Create Duel Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[10000] pointer-events-auto flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp">
                                <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Swords className="h-5 w-5 mr-2" />
                                            Create Duel Challenge
                                        </h3>
                                        <button
                                            onClick={() => {
                                                audio.play('click');
                                                setShowCreateModal(false);
                                                setSelectedChallenge(null);
                                                setSelectedOpponent(null);
                                                setOpponentSearch('');
                                            }}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Session Time Setting */}
                                    <div className="bg-gray-900/30 rounded-lg p-4">
                                        <h4 className="text-cyan-400 font-bold mb-4 flex items-center">
                                            <Timer className="h-4 w-4 mr-2" />
                                            Session Time Limit
                                        </h4>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="5"
                                                max="30"
                                                step="5"
                                                value={sessionTimeLimit}
                                                onChange={(e) => setSessionTimeLimit(Number(e.target.value))}
                                                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="text-white font-bold text-lg min-w-[80px]">
                                                {sessionTimeLimit} min
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Both players will have {sessionTimeLimit} minutes to complete the challenge
                                        </p>
                                    </div>

                                    {/* Select Challenge */}
                                    {!selectedChallenge && (
                                        <div>
                                            <h4 className="text-cyan-400 font-bold mb-4">Select Challenge</h4>
                                            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                                                {challenges.map((challenge) => (
                                                    <div
                                                        key={challenge.id}
                                                        onClick={() => {
                                                            audio.play('click');
                                                            setSelectedChallenge(challenge);
                                                        }}
                                                        className="flex items-center justify-between p-3 bg-gray-900/30 hover:bg-gray-700/30 border border-gray-600/50 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                                                        onMouseEnter={() => audio.play('hover')}
                                                    >
                                                        <div>
                                                            <p className="text-white font-medium">{challenge.title}</p>
                                                            <p className="text-sm text-gray-400">{displayLanguage(challenge.language)}• {challenge.difficulty}</p>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Challenge */}
                                    {selectedChallenge && (
                                        <div className="bg-gray-900/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-cyan-400 font-bold">Selected Challenge</h4>
                                                <button
                                                    onClick={() => {
                                                        audio.play('click');
                                                        setSelectedChallenge(null);
                                                    }}
                                                    className="text-gray-400 hover:text-white transition-all duration-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{selectedChallenge.title}</p>
                                                <p className="text-sm text-gray-400">{selectedChallenge.language} • {selectedChallenge.difficulty}</p>
                                                {selectedChallenge.description && (
                                                    <p className="text-sm text-gray-400 mt-2">{selectedChallenge.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Select Opponent */}
                                    {selectedChallenge && (
                                        <div>
                                            <h4 className="text-cyan-400 font-bold mb-4 flex items-center">
                                                <Users className="h-4 w-4 mr-2" />
                                                Select Opponent ({sortedParticipants.length} active)
                                            </h4>
                                            
                                            {/* Opponent Search */}
                                            <div className="relative mb-4">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                  type="text"
                                                  placeholder="Search opponent by username"
                                                  value={opponentSearch}
                                                  onChange={(e) => setOpponentSearch(e.target.value)}
                                                  onKeyDown={handleOpponentSearchKeyDown}
                                                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                                                {/* Selected opponent pill (always visible if selected) */}
{selectedOpponent && (
  <div className="mt-2 flex items-center gap-3 bg-gray-900/40 border border-gray-700/50 rounded-lg px-3 py-2">
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
       <img
        src={resolveAvatar(selectedOpponent)}
        onError={(e) => (e.currentTarget.src = '/avatars/default.png')}
        alt={selectedOpponent.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  <div className="text-sm">
  <div className="text-white font-medium">{selectedOpponent.name}</div>
  <div className="text-gray-400 flex items-center gap-2">
    <span>Lv { (selectedOpponent?.level ?? xpToLevel(selectedOpponent?.total_xp)) ?? '—' }</span>
    <span className="inline-flex items-center gap-1">
      <Star className="h-3 w-3 text-yellow-400" />
      {selectedOpponent.stars ?? selectedOpponent.profile?.stars ?? 0}
    </span>
  </div>
</div>

    <button
      type="button"
      onClick={() => setSelectedOpponent(null)}
      className="ml-auto text-gray-400 hover:text-white"
      title="Clear"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
)}

{/* Opponent results — only when searching */}
{showOpponentList && (
  <div className="mt-3 grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
    {sortedParticipants.length === 0 ? (
      <div className="text-sm text-gray-400 italic">No users found.</div>
    ) : (
      sortedParticipants.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setSelectedOpponent(p)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition
            ${selectedOpponent?.id === p.id
              ? 'bg-cyan-900/30 border-cyan-600 text-white'
              : 'bg-gray-900/30 border-gray-700/50 text-gray-200 hover:bg-gray-800/40'}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
                <img
                src={resolveAvatar(p)}
                onError={(e) => (e.currentTarget.src = '/avatars/default.png')}
                alt={p.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-700/60"
                loading="lazy"
                />
                <span
                className={`absolute -bottom-0 -right-0 block h-2 w-2 rounded-full ring-2 ring-gray-900 ${
                    p.is_online ? 'bg-green-400' : 'bg-gray-500'
                }`}
                />
            </div>
            <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Lv { (p.level ?? xpToLevel(p.total_xp)) ?? '—' }</span>
                    <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    {p.stars ?? p.profile?.stars ?? 0}
                    </span>
                </div>
                </div>

          </div>
          {selectedOpponent?.id === p.id ? (
            <CheckCircle className="h-4 w-4 text-cyan-400" />
          ) : (
            <UserCheck className="h-4 w-4 opacity-70" />
          )}
        </button>
      ))
    )}
  </div>
)}
                                                  
                                                
                                                {sortedParticipants.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400">
                                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        <p>No participants found</p>
                                                        {opponentSearch && (
                                                            <p className="text-sm mt-1">Try adjusting your search</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                audio.play('click');
                                                setShowCreateModal(false);
                                                setSelectedChallenge(null);
                                                setSelectedOpponent(null);
                                                setOpponentSearch('');
                                            }}
                                            disabled={createLoading}
                                            className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 transition-all duration-300 font-medium"
                                            onMouseEnter={() => audio.play('hover')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={createDuel}
                                            disabled={createLoading || !selectedChallenge || !selectedOpponent}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                            onMouseEnter={() => audio.play('hover')}
                                        >
                                            {createLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Swords className="h-4 w-4" />
                                            )}
                                            <span>{createLoading ? 'Creating...' : 'Create Duel'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Duel Modal */}
                    {showDuelModal && activeDuel && activeDuel.challenge && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="relative z-[10001] bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Swords className="h-5 w-5 mr-2" />
                                            {activeDuel.challenge.title}
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            {/* Session Timer */}
                                            {activeDuel.status === 'active' && !duelEnded && (
                                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-black/20 ${getTimerColor(sessionTimeLeft, (activeDuel.session_duration_minutes || 15) * 60)}`}>
                                                    <Timer className="h-4 w-4" />
                                                    <span className="text-sm font-mono font-bold">
                                                        {formatTime(sessionTimeLeft)}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Personal Timer */}
                                            <div className="flex items-center space-x-2 text-white">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
                                            </div>
                                            {/* <button
                                                onClick={() => {
                                                    audio.play('click');
                                                    setShowDuelModal(false);
                                                }}
                                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                            >
                                                <X className="h-6 w-6" />
                                            </button> */}
                                        </div>
                                    </div>
                                    
                                    {/* Progress bar for session time */}
                                    {activeDuel.status === 'active' && !duelEnded && (
                                        <div className="mt-2">
                                            <div className="w-full bg-black/20 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-1000 ${
                                                        sessionTimeLeft / ((activeDuel.session_duration_minutes || 15) * 60) > 0.5 
                                                            ? 'bg-green-400' 
                                                            : sessionTimeLeft / ((activeDuel.session_duration_minutes || 15) * 60) > 0.2 
                                                                ? 'bg-yellow-400' 
                                                                : 'bg-red-400'
                                                    }`}
                                                    style={{ 
                                                        width: `${Math.max(0, (sessionTimeLeft / ((activeDuel.session_duration_minutes || 15) * 60)) * 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Duel Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Challenger</div>
                                            <div className="text-lg font-bold text-white">{activeDuel.challenger?.name || 'Unknown'}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Opponent</div>
                                            <div className="text-lg font-bold text-white">{activeDuel.opponent?.name || 'Unknown'}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Language</div>
                                            <div className="text-lg font-bold text-white">{displayLanguage(activeDuel.challenge.language)}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Status</div>
                                            <div className="flex items-center space-x-2">
                                                {opponentSubmission && (
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                )}
                                                <span className="text-lg font-bold text-white">
                                                    {duelEnded ? 'Ended' : activeDuel.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                   
{finalizing && (
  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
    <div className="flex items-center space-x-2">
      <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
      <span className="text-purple-300 font-medium">
        Finalizing results and rewards…
      </span>
    </div>
  </div>
)}

                                    {/* Challenge Description */}
                                    {activeDuel.challenge.description && (
                                        <div className="bg-gray-900/30 rounded-lg p-4">
                                            <h4 className="text-cyan-400 font-bold mb-2">Challenge Description</h4>
                                            <p className="text-gray-200">{activeDuel.challenge.description}</p>
                                        </div>
                                    )}

                                    {/* Code Editor */}
                                    <div>
                                        <h4 className="text-cyan-400 font-bold mb-2">Your Code</h4>
                                        <textarea
                                            value={userCode}
                                            onChange={(e) => setUserCode(e.target.value)}
                                            disabled={duelEnded}
                                            className={`w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300 ${
                                                duelEnded ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            placeholder="Write your solution here..."
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={surrenderDuel}
                                                disabled={submitting || duelEnded}
                                                className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-300 font-medium"
                                                onMouseEnter={() => audio.play('hover')}
                                            >
                                                <Flag className="h-4 w-4" />
                                                <span>Surrender</span>
                                            </button>
                                            
                                            {hasSubmitted && !lastSubmissionResult?.isCorrect && activeDuel.challenge.fixed_code && (
                                                <button
                                                    onClick={showCorrectAnswerHandler}
                                                    disabled={submitting}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>Show Correct Answer</span>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            {hasSubmitted && lastSubmissionResult && (
                                                <div className="text-sm text-gray-400">
                                                    {lastSubmissionResult.isCorrect ? (
                                                        <span className="text-green-400 font-medium">
                                                            ✅ Perfect 100% match!
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-400 font-medium">
                                                            📊 {Math.round(lastSubmissionResult.similarity! * 100)}% similarity (need 100%)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* <button
                                                onClick={() => {
                                                    audio.play('click');
                                                    setShowDuelModal(false);
                                                }}
                                                disabled={submitting}
                                                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 transition-all duration-300 font-medium"
                                                onMouseEnter={() => audio.play('hover')}
                                            >
                                                Close
                                            </button> */}
                                            
                                            {(!hasSubmitted || !lastSubmissionResult?.isCorrect) && (
                                                <button
                                                    onClick={() => submitDuelCode()}
                                                    disabled={submitting || !userCode.trim() || duelEnded}
                                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    {submitting ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Send className="h-4 w-4" />
                                                    )}
                                                    <span>{submitting ? 'Submitting...' : hasSubmitted ? 'Try Again' : 'Submit Solution'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>

            {/* CSS Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(50px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }

                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .correct-answer-modal {
                    text-align: center;
                }

                .accuracy-display {
                    margin: 20px 0;
                    padding: 15px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 12px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .accuracy-score {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .accuracy-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}