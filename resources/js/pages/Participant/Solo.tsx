// resources/js/Pages/Participant/Solo.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Target, Code, Play, Clock, Star, Trophy, 
    RefreshCw, Filter, Search, AlertTriangle, Zap,
    CheckCircle, X, Send, Lightbulb, BookOpen, Flame,
    Award, TrendingUp, Sparkles, PartyPopper, Crown,
    Rocket, Heart, Shield, Sword, Volume2, VolumeX
} from 'lucide-react';
import { apiClient } from '@/utils/api';
import Swal from 'sweetalert2';
import { withTheme, svgCircle } from "@/utils/swalTheme";
import AnimatedBackground from '@/components/AnimatedBackground';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Practice', href: '#' },
    { title: 'Solo Challenge', href: '/play/solo' }
];
// === Design tokens that map to app.css (with safe fallbacks) ===
const ui = {
  panelClass: 'rounded-xl border',
  panelStyle: {
    background: 'var(--panel-bg, rgba(17,24,39,0.50))',
    borderColor: 'var(--panel-border, rgba(75,85,99,0.50))',
    backdropFilter: 'blur(6px)',
  } as React.CSSProperties,

  chipClass: 'px-2 py-1 text-xs font-semibold rounded-full border',
  chipBlueStyle: {
    background: 'var(--chip-blue-bg, rgba(30,58,138,0.30))',
    borderColor: 'var(--chip-blue-border, rgba(59,130,246,0.50))',
    color: 'var(--chip-blue-text, #93c5fd)',
  } as React.CSSProperties,

  chipEasyStyle: {
    background: 'var(--chip-easy-bg, rgba(6,78,59,0.30))',
    borderColor: 'var(--chip-easy-border, rgba(16,185,129,0.50))',
    color: 'var(--chip-easy-text, #86efac)',
  } as React.CSSProperties,
  chipMedStyle: {
    background: 'var(--chip-med-bg, rgba(113,63,18,0.30))',
    borderColor: 'var(--chip-med-border, rgba(234,179,8,0.50))',
    color: 'var(--chip-med-text, #fde68a)',
  } as React.CSSProperties,
  chipHardStyle: {
    background: 'var(--chip-hard-bg, rgba(127,29,29,0.30))',
    borderColor: 'var(--chip-hard-border, rgba(248,113,113,0.50))',
    color: 'var(--chip-hard-text, #fca5a5)',
  } as React.CSSProperties,

  btnPrimaryClass: 'rounded-lg shadow-lg hover:scale-110 transition-all duration-300',
  btnPrimaryStyle: {
    background: 'var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))',
    color: 'var(--btn-primary-text, #fff)',
  } as React.CSSProperties,

  headerGradStyle: {
    background: 'var(--heading-gradient, linear-gradient(90deg,#06b6d4,#3b82f6))',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  } as React.CSSProperties,

  progressBarStyle: {
    background: 'var(--progress-gradient, linear-gradient(90deg,#06b6d4,#3b82f6,#7c3aed))',
  } as React.CSSProperties,

  textMuted: 'text-[color:var(--text-muted,#9ca3af)]',
};

interface SoloChallenge {
    id: number;
    title: string;
    description: string | null;
    mode: 'fixbugs' | 'random';
    language: 'python' | 'java';
    difficulty: 'easy' | 'medium' | 'hard';
    buggy_code: string | null;
    fixed_code: string | null;
    hint: string | null;
    reward_xp: number;
    created_at: string;
    is_completed?: boolean;
}

interface UserStats {
    solo_attempts: number;
    successful_attempts: number;
    total_xp: number;
    total_stars: number;
    attempts_today: number;
    current_level: number;
    xp_to_next_level: number;
    completed_challenge_ids: number[];
    streak: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: 'success' | 'levelup' | 'streak';
}

export default function ParticipantSolo() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const [challenges, setChallenges] = useState<SoloChallenge[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    
    // Filters
    const [modeFilter, setModeFilter] = useState<string>('all');
    const [languageFilter, setLanguageFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Challenge Modal
    const [selectedChallenge, setSelectedChallenge] = useState<SoloChallenge | null>(null);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [userCode, setUserCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [lastSubmissionResult, setLastSubmissionResult] = useState<{ isCorrect: boolean; similarity?: number } | null>(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    // Animation states
    const [particles, setParticles] = useState<Particle[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [celebrationActive, setCelebrationActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isGlowing, setIsGlowing] = useState(false);
    const [progressAnimation, setProgressAnimation] = useState(false);
    
    // Audio references
    const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const animationFrameRef = useRef<number>();

    // Initialize sound effects
    useEffect(() => {
        const sounds = {
            success: new Audio('/sounds/success.mp3'),
            failure: new Audio('/sounds/failure.mp3'),
            levelup: new Audio('/sounds/levelup.mp3'),
            click: new Audio('/sounds/click.mp3'),
            hover: new Audio('/sounds/hover.mp3'),
            victory: new Audio('/sounds/victory.mp3'),
            streak: new Audio('/sounds/streak.mp3'),
            typing: new Audio('/sounds/typing.mp3')
        };

        Object.values(sounds).forEach(audio => {
            audio.volume = 0.6;
            audio.preload = 'auto';
        });

        audioRef.current = sounds;

        return () => {
            Object.values(sounds).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    // Play sound effect
    const playSound = (soundName: string) => {
        if (!soundEnabled || !audioRef.current[soundName]) return;
        
        try {
            const audio = audioRef.current[soundName];
            audio.currentTime = 0;
            audio.play().catch(console.error);
        } catch (error) {
            console.warn('Could not play sound:', soundName, error);
        }
    };

    // Updated leveling system: 10 XP per level
    const calculateLevel = (xp: number) => Math.floor(xp / 10) + 1;
    const calculateXPToNextLevel = (xp: number) => 10 - (xp % 10);
    const calculateProgress = (xp: number) => ((xp % 10) / 10) * 100;
    
    // Get current level XP progress for display
    const getCurrentLevelXP = (xp: number) => xp % 10;

    useEffect(() => {
        fetchChallenges();
        fetchUserStats();
    }, [modeFilter, languageFilter, difficultyFilter, searchTerm]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (startTime) {
            interval = setInterval(() => {
                setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime]);

    // Particle animation system
    useEffect(() => {
        if (particles.length > 0) {
            const animate = () => {
                setParticles(prev => prev
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.vx,
                        y: particle.y + particle.vy,
                        vy: particle.vy - 0.15,
                        life: particle.life - 1,
                        size: particle.size * 0.99
                    }))
                    .filter(particle => particle.life > 0)
                );
                if (particles.length > 0) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                }
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particles.length]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (modeFilter !== 'all') params.mode = modeFilter;
            if (languageFilter !== 'all') params.language = languageFilter;
            if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await apiClient.get('/api/challenges/solo', params);
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

    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            const statsResponse = await apiClient.get('/api/me/stats');

            if (statsResponse.success && statsResponse.data) {
                const statsData = statsResponse.data;
                const totalXP = statsData.totals?.xp || 0;
                
                // Try multiple ways to get completed challenge IDs
                let completedIds: number[] = [];
                
                // Method 1: Direct from updated API
                if (statsData.completed_challenge_ids && Array.isArray(statsData.completed_challenge_ids)) {
                    completedIds = statsData.completed_challenge_ids;
                }
                
                // Method 2: Extract from solo_stats if available
                else if (statsData.solo_stats?.completed_challenge_ids) {
                    completedIds = statsData.solo_stats.completed_challenge_ids;
                }
                
                // Method 3: Calculate from successful attempts (if available)
                else if (statsData.attempts) {
                    const successfulAttempts = statsData.attempts.filter((attempt: any) => attempt.is_correct);
                    completedIds = [...new Set(successfulAttempts.map((attempt: any) => attempt.challenge_id))];
                }
                
                // Method 4: Try other possible field names
                else {
                    const possibleFields = [
                        'completed_challenges', 
                        'solo_completed_challenges',
                        'successful_challenge_ids',
                        'completed_solo_challenges'
                    ];
                    
                    for (const field of possibleFields) {
                        if (statsData[field] && Array.isArray(statsData[field])) {
                            completedIds = statsData[field];
                            console.log(`Found completed challenges in field: ${field}`);
                            break;
                        }
                    }
                }

                setUserStats({
                    solo_attempts: statsData.solo_attempts || 0,
                    successful_attempts: statsData.successful_attempts || completedIds.length,
                    total_xp: totalXP,
                    total_stars: statsData.totals?.stars || 0,
                    attempts_today: statsData.attempts_today || 0,
                    current_level: calculateLevel(totalXP),
                    xp_to_next_level: calculateXPToNextLevel(totalXP),
                    completed_challenge_ids: completedIds,
                    streak: statsData.streak || 0
                });

            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
            setUserStats({
                solo_attempts: 0,
                successful_attempts: 0,
                total_xp: 0,
                total_stars: 0,
                attempts_today: 0,
                current_level: 1,
                xp_to_next_level: 10,
                completed_challenge_ids: [],
                streak: 0
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const createParticleExplosion = (x: number, y: number, type: 'success' | 'levelup' | 'streak' = 'success') => {
        const colors = {
            success: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24', '#F59E0B'],
            levelup: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#F59E0B', '#FBBF24'],
            streak: ['#EF4444', '#F87171', '#FCA5A5', '#FBBF24', '#F59E0B']
        };

        const newParticles: Particle[] = [];
        const particleCount = type === 'levelup' ? 25 : 15;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 8 + 4;
            
            newParticles.push({
                id: Date.now() + i,
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 30,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
                vy: Math.sin(angle) * speed - Math.random() * 3,
                life: 80 + Math.random() * 40,
                maxLife: 80,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                size: Math.random() * 6 + 3,
                type
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    const startChallenge = (challenge: SoloChallenge) => {
        playSound('click');
        
        if (userStats?.completed_challenge_ids.includes(challenge.id)) {
            playSound('failure');
            Swal.fire({
                icon: 'info',
                title: 'Challenge Already Completed!',
                text: 'You have already solved this challenge. Try a different one!',
                timer: 2000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#fff'
            });
            return;
        }

        setSelectedChallenge(challenge);
        setUserCode(challenge.buggy_code || '');
        setShowChallengeModal(true);
        setStartTime(new Date());
        setTimeSpent(0);
    };

    // Helper function to calculate string similarity
    const calculateStringSimilarity = (str1: string, str2: string): number => {
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        // Levenshtein distance calculation
        const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                } else {
                    matrix[j][i] = Math.min(
                        matrix[j - 1][i] + 1,     // deletion
                        matrix[j][i - 1] + 1,     // insertion
                        matrix[j - 1][i - 1] + 1  // substitution
                    );
                }
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len2][len1]) / maxLen;
    };

    // Updated validateCode function - requires 100% match with database answer
    const validateCode = (userCode: string, challenge: SoloChallenge): boolean => {
        const code = userCode.trim();
        const fixedCode = challenge.fixed_code?.trim();
        
        if (!code) {
            console.log('Code validation: FAIL - No code provided');
            return false;
        }

        if (!fixedCode) {
            console.log('Code validation: FAIL - No solution available in database');
            return false;
        }

        // Check if user made meaningful changes from buggy code
        if (code === challenge.buggy_code?.trim()) {
            console.log('Code validation: FAIL - No changes made from original buggy code');
            return false;
        }

        // Normalize both codes for comparison (remove extra whitespace, normalize line endings)
        const normalizeCode = (codeStr: string) => {
            return codeStr
                .replace(/\r\n/g, '\n')  // Normalize line endings
                .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
                .replace(/\s*;\s*/g, ';') // Normalize semicolon spacing
                .replace(/\s*\{\s*/g, '{') // Normalize brace spacing
                .replace(/\s*\}\s*/g, '}')
                .replace(/\s*\(\s*/g, '(') // Normalize parentheses spacing
                .replace(/\s*\)\s*/g, ')')
                .replace(/\s*==\s*/g, '==') // Normalize operator spacing
                .replace(/\s*=\s*/g, '=')
                .trim();
        };

        const normalizedUserCode = normalizeCode(code);
        const normalizedFixedCode = normalizeCode(fixedCode);

        // Direct comparison - must match the database solution EXACTLY
        const isExactMatch = normalizedUserCode === normalizedFixedCode;
        
        if (isExactMatch) {
            console.log('Code validation: PASS - Exact match with database solution (100%)');
            return true;
        }

        // Calculate similarity for feedback purposes only
        const similarity = calculateStringSimilarity(normalizedUserCode, normalizedFixedCode);
        const similarityPercentage = Math.round(similarity * 100);
        
        console.log(`Code validation: FAIL - Only ${similarityPercentage}% similarity with database solution (requires 100%)`);
        
        // REQUIRES EXACTLY 100% match (similarity >= 1.0)
        const passed = similarity >= 1.0;
        console.log(`Code validation: ${passed ? 'PASS' : 'FAIL'} (${similarityPercentage}% similarity, requires 100%)`);
        
        return passed;
    };

    const submitAttempt = async () => {
        if (!selectedChallenge || !userCode.trim()) {
            playSound('failure');
            Swal.fire('Error', 'Please write some code before submitting.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            playSound('typing');
            
            if (!selectedChallenge.fixed_code) {
                playSound('failure');
                Swal.fire('Error', 'This challenge does not have a solution stored in the database.', 'error');
                setSubmitting(false);
                return;
            }

            const isCorrect = validateCode(userCode, selectedChallenge);
            const similarity = calculateStringSimilarity(
                userCode.trim().replace(/\s+/g, ' '),
                selectedChallenge.fixed_code.trim().replace(/\s+/g, ' ')
            );
            
            setLastSubmissionResult({ isCorrect, similarity });
            setHasSubmitted(true);
            
            const attemptData = {
                challenge_id: selectedChallenge.id,
                language: selectedChallenge.language,
                mode: selectedChallenge.mode,
                time_spent_sec: timeSpent,
                is_correct: isCorrect,
                code_submitted: userCode,
                judge_feedback: isCorrect 
                    ? `Perfect! Your solution is an exact match with the expected answer from database (100% match).` 
                    : `Incorrect. Your solution has ${Math.round(similarity * 100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`,
            };

            const response = await apiClient.post('/api/solo/attempts', attemptData);
            
            if (response.success) {
                const xpEarned = response.data?.xp_earned || (isCorrect ? selectedChallenge.reward_xp : 0);
                
                if (isCorrect) {
                    const oldTotalXP = userStats?.total_xp || 0;
                    const newTotalXP = oldTotalXP + xpEarned;
                    const oldLevel = calculateLevel(oldTotalXP);
                    const newLevel = calculateLevel(newTotalXP);
                    const leveledUp = newLevel > oldLevel;

                    // Add completed challenge to local state immediately
                    if (userStats && !userStats.completed_challenge_ids.includes(selectedChallenge.id)) {
                        setUserStats(prev => prev ? {
                            ...prev,
                            completed_challenge_ids: [...prev.completed_challenge_ids, selectedChallenge.id],
                            successful_attempts: prev.successful_attempts + 1,
                            total_xp: newTotalXP,
                            current_level: newLevel,
                            xp_to_next_level: calculateXPToNextLevel(newTotalXP)
                        } : null);
                    }

                    playSound('success');
                    setShowSuccess(true);
                    setCelebrationActive(true);
                    setIsGlowing(true);
                    
                    // Trigger progress animation
                    setProgressAnimation(true);
                    setTimeout(() => setProgressAnimation(false), 2000);
                    
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    createParticleExplosion(centerX, centerY, 'success');

                    if (leveledUp) {
                        setTimeout(() => {
                            playSound('levelup');
                            setShowLevelUp(true);
                            createParticleExplosion(centerX, centerY - 100, 'levelup');
                        }, 1000);
                    }

                    setTimeout(() => {
                        playSound('victory');
                    }, 500);

                  await Swal.fire({
    title: 'PERFECT SOLUTION!',
    html: `
      <div class="text-center">
        <div class="text-5xl mb-4">🏆</div>
        <p class="mb-3 text-lg font-semibold text-cyan-200">Outstanding! Your code is a perfect 100% match!</p>
        
        <div class="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4 mb-4">
          <div class="text-2xl font-bold text-green-400">100% Perfect Match</div>
          <div class="text-sm text-gray-200 opacity-80">Exact Database Solution</div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-900/40 rounded-lg p-3">
            <div class="text-lg font-bold text-yellow-300">+${xpEarned ?? 3}</div>
            <div class="text-xs text-gray-300">XP Earned</div>
          </div>
          <div class="bg-gray-900/40 rounded-lg p-3">
            <div class="text-lg font-bold text-purple-300">Level ${newLevel ?? 1}</div>
            <div class="text-xs text-gray-300">Current Level</div>
          </div>
        </div>

        <div class="text-sm text-gray-300">⏱️ Completed in ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s</div>
        ${leveledUp ? `
          <div class="mt-4 text-center">
            <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
            <p class="text-sm text-gray-200">You’ve reached Level ${newLevel}! Next: ${calculateXPToNextLevel(newTotalXP)} XP needed.</p>
          </div>
        ` : ''}
      </div>
    `,
    timer: 6000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: 'Continue Coding!',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
    color: '#fff',
    confirmButtonColor: '#10B981',
  });


                    setTimeout(() => {
                        setShowSuccess(false);
                        setCelebrationActive(false);
                        setShowLevelUp(false);
                        setIsGlowing(false);
                    }, 7000);

                } else {
                    playSound('failure');
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 600);

                    await Swal.fire({
                        title: 'Almost There!',
                        html: `
                            <div class="text-center">
                            <div class="text-5xl mb-4">⚠️</div>
                            <p class="mb-3 text-lg font-semibold text-red-200">Your solution must exactly match the database answer.</p>
                            
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
                                </ul>
                            </div>
                            </div>
                        `,
                        timer: 4500,
                        showConfirmButton: true,
                        confirmButtonText: 'Try Again',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
                        color: '#fff',
                        confirmButtonColor: '#3B82F6',
                        });
                }
                
                // Refresh stats and challenges to ensure UI is up to date
                await Promise.all([
                    fetchUserStats(),
                    fetchChallenges()
                ]);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting attempt:', error);
            playSound('failure');
            
            let errorMessage = 'Failed to submit your attempt. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        playSound('click');
        setShowChallengeModal(false);
        setSelectedChallenge(null);
        setUserCode('');
        setStartTime(null);
        setTimeSpent(0);
        setHasSubmitted(false);
        setLastSubmissionResult(null);
        setShowCorrectAnswer(false);
    };

    const showCorrectAnswerHandler = () => {
        if (selectedChallenge?.fixed_code) {
            playSound('click');
            setShowCorrectAnswer(true);
            
            Swal.fire({
                title: 'Correct Answer',
                html: `
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the exact solution from the database (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${selectedChallenge.fixed_code}</pre>
                        </div>
                        <p class="mt-4 text-sm text-gray-400">Your code must match this exactly to pass the challenge.</p>
                    </div>
                `,
                confirmButtonText: 'Got it!',
                background: '#1f2937',
                color: '#fff',
                confirmButtonColor: '#10B981',
                width: '600px'
            });
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return ui.chipEasyStyle;
            case 'medium': return ui.chipMedStyle;
            case 'hard': return ui.chipHardStyle;
            default: return ui.chipBlueStyle;
        }
    };

    const getModeIcon = (mode: string) => {
        return mode === 'fixbugs' ? AlertTriangle : Zap;
    };

    const getModeColor = (mode: string) => {
        return mode === 'fixbugs' ? 'text-yellow-400' : 'text-purple-400';
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Filter out completed challenges - they should NOT appear in the list
    const availableChallenges = challenges.filter(challenge => {
        const isCompleted = userStats?.completed_challenge_ids.includes(challenge.id);
        return !isCompleted; // Only show challenges that are NOT completed
    });

    const StatCard = ({ title, value, icon: Icon, color, animated = false }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
        animated?: boolean;
    }) => (
        <div 
            className={`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${animated ? 'animate-pulse glow-effect' : ''} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${isGlowing ? 'glow-success' : ''}
                cursor-pointer
            `}
            onMouseEnter={() => playSound('hover')}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color} transition-all duration-300`}>
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
            {/* Enhanced animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
                <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"></div>
                <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"></div>
                
                {/* Success particles */}
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="absolute pointer-events-none particle-effect"
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            backgroundColor: particle.color,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            borderRadius: '50%',
                            opacity: particle.life / particle.maxLife,
                            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                        }}
                    />
                ))}
            </div>

            {/* Level Up Overlay */}
            {showLevelUp && (
                <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn">
                    <div className="text-center text-white animate-bounceIn levelup-container">
                        <div className="crown-animation mb-6">
                            <Crown className="w-24 h-24 mx-auto text-yellow-400 animate-spin-slow" />
                            <div className="crown-glow"></div>
                        </div>
                        <h2 className="text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                            LEVEL UP!
                        </h2>
                        <p className="text-3xl opacity-90 animate-slideInUp">You reached Level {userStats?.current_level}!</p>
                        <div className="mt-6 animate-slideInUp delay-300">
                            <div className="inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="text-lg font-semibold">Only {userStats?.xp_to_next_level} XP to next level!</span>
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Solo Challenge" />
                <div className={`flex flex-col gap-6 p-4 relative z-10 ${isShaking ? 'animate-shake' : ''}`}>
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Target className={`h-8 w-8 text-cyan-400 ${celebrationActive ? 'animate-spin' : ''} transition-all duration-300`} />
                            <div>
                                <h1 className="text-3xl font-bold" style={ui.headerGradStyle}>
                                    SOLO CHALLENGE
                                </h1>
                                <p className="text-gray-400 text-sm">Master coding challenges and level up your skills</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                    soundEnabled 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-600 text-gray-300'
                                }`}
                                onMouseEnter={() => playSound('hover')}
                            >
                                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    playSound('click');
                                    fetchChallenges();
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:scale-105 transition-all duration-300"
                                onMouseEnter={() => playSound('hover')}
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* User Stats */}
                    {userStats && (
                        <div className="space-y-4">
                            {/* Enhanced Level Progress Bar */}
                            <div className={`${ui.panelClass} p-6`} style={ui.panelStyle}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Crown className="h-6 w-6 text-yellow-400" />
                                        <span className="text-xl font-bold text-white">Level {userStats.current_level}</span>
                                        <div className="text-sm text-gray-400">
                                            ({getCurrentLevelXP(userStats.total_xp)}/10 XP)
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-400 text-sm">Next Level</div>
                                        <div className="text-cyan-400 font-bold">{userStats.xp_to_next_level} XP needed</div>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative">
                                    <div 
                                        className={`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${progressAnimation ? 'animate-pulse' : ''}`}
                                        style={{ width: `${calculateProgress(userStats.total_xp)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white drop-shadow-lg">
                                            {Math.round(calculateProgress(userStats.total_xp))}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>Level {userStats.current_level}</span>
                                    <span>{getCurrentLevelXP(userStats.total_xp)} / 10 XP</span>
                                    <span>Level {userStats.current_level + 1}</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             
                                <StatCard title="Level" value={userStats.current_level} icon={Crown} color="bg-orange-500" />
                                <StatCard title="Total XP" value={userStats.total_xp || 0} icon={Trophy} color="bg-yellow-500" />   
                                <StatCard title="Completed" value={userStats.successful_attempts || 0} icon={CheckCircle} color="bg-green-500" animated={showSuccess}
                                /> 
                                <StatCard title="Available" value={availableChallenges.length} icon={Target} color="bg-cyan-500" />
                                
                                {/* <StatCard title="Stars" value={userStats.total_stars || 0} icon={Star} color="bg-purple-500" /> */}
                               
                                
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className={`${ui.panelClass} p-6`} style={ui.panelStyle}>
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
                                {/* <select
                                    value={modeFilter}
                                    onChange={(e) => setModeFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300"
                                >
                                    <option value="all">All Modes</option>
                                    <option value="fixbugs">Fix Bugs</option>
                                    <option value="random">Random</option>
                                </select> */}
                                <select
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300"
                                >
                                    <option value="all">All Languages</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                </select>
                                <select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300"
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
                        ) : availableChallenges.length === 0 ? (
                            <div className="col-span-full text-center py-12 completion-celebration">
                                <div className="trophy-large mb-4">🏆</div>
                                <div className="text-2xl font-bold text-white mb-2">Outstanding Achievement!</div>
                                <div className="text-gray-400">
                                    {challenges.length === 0 
                                        ? 'No challenges match your current filters'
                                        : 'You have conquered all available challenges!'
                                    }
                                </div>
                            </div>
                        ) : (
                            availableChallenges.map((challenge) => {
                                const ModeIcon = getModeIcon(challenge.mode);
                                return (
                                    <div 
                                        key={challenge.id} 
                                        className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card"
                                        onMouseEnter={() => playSound('hover')}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <ModeIcon className={`h-5 w-5 ${getModeColor(challenge.mode)}`} />
                                                <span className={`text-xs font-bold uppercase ${getModeColor(challenge.mode)}`}>
                                                    {challenge.mode === 'fixbugs' ? 'Fix Bugs' : 'Random'}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <span className={ui.chipClass} style={ui.chipBlueStyle}>
                                                    {challenge.language.toUpperCase()}
                                                </span>
                                               <span className={ui.chipClass} style={getDifficultyColor(challenge.difficulty)}>
                                                    {challenge.difficulty.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                                        
                                        {challenge.description && (
                                            <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                                                {challenge.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-1 text-yellow-400">
                                                    <Trophy className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{challenge.reward_xp} XP</span>
                                                </div>
                                                {challenge.hint && (
                                                    <div className="flex items-center space-x-1 text-cyan-400" title="Has hint">
                                                        <Lightbulb className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => startChallenge(challenge)}
                                                className={`flex items-center space-x-2 px-4 py-2 ${ui.btnPrimaryClass}`}
                                                style={ui.btnPrimaryStyle}
                                                >
                                                <Play className="h-4 w-4" />
                                                <span>Start</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Challenge Modal */}
                    {showChallengeModal && selectedChallenge && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp">
                                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Target className="h-5 w-5 mr-2" />
                                            {selectedChallenge.title}
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2 text-white">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
                                            </div>
                                            <button
                                                onClick={closeModal}
                                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Challenge Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Language</div>
                                            <div className="text-lg font-bold text-white">{selectedChallenge.language.toUpperCase()}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Difficulty</div>
                                            <div className="text-lg font-bold text-white capitalize">{selectedChallenge.difficulty}</div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-400">Reward</div>
                                            <div className="text-lg font-bold text-yellow-400">{selectedChallenge.reward_xp} XP</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {selectedChallenge.description && (
                                        <div className="bg-gray-900/30 rounded-lg p-4">
                                            <h4 className="text-cyan-400 font-bold mb-2">Description</h4>
                                            <p className="text-gray-200">{selectedChallenge.description}</p>
                                        </div>
                                    )}

                                    {/* Hint */}
                                    {selectedChallenge.hint && (
                                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                            <h4 className="text-yellow-400 font-bold mb-2 flex items-center">
                                                <Lightbulb className="h-4 w-4 mr-2" />
                                                Hint
                                            </h4>
                                            <p className="text-yellow-200">{selectedChallenge.hint}</p>
                                        </div>
                                    )}

                                    {/* Code Editor */}
                                    <div>
                                        <h4 className="text-cyan-400 font-bold mb-2">Your Code</h4>
                                        <textarea
                                            value={userCode}
                                            onChange={(e) => setUserCode(e.target.value)}
                                            className="w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300"
                                            placeholder="Write your solution here..."
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {hasSubmitted && !lastSubmissionResult?.isCorrect && (
                                                <button
                                                    onClick={showCorrectAnswerHandler}
                                                    disabled={submitting}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>Show Correct Answer</span>
                                                </button>
                                            )}
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
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={closeModal}
                                                disabled={submitting}
                                                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 transition-all duration-300 font-medium"
                                            >
                                                {hasSubmitted && lastSubmissionResult?.isCorrect ? 'Continue' : 'Cancel'}
                                            </button>
                                            {(!hasSubmitted || !lastSubmissionResult?.isCorrect) && (
                                                <button
                                                    onClick={submitAttempt}
                                                    disabled={submitting || !userCode.trim()}
                                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
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

            {/* Enhanced CSS Styles */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-10px); }
                    40% { transform: translateX(10px); }
                    60% { transform: translateX(-8px); }
                    80% { transform: translateX(8px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
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
                
                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
                    }
                }

                @keyframes progress-fill {
                    from {
                        width: 0%;
                    }
                    to {
                        width: var(--progress-width);
                    }
                }

                .animate-shake {
                    animation: shake 0.6s ease-in-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
                
                .animate-bounceIn {
                    animation: bounceIn 1s ease-out;
                }

                .animate-slideInUp {
                    animation: slideInUp 0.8s ease-out;
                }

                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }

                .glow-effect {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                }

                .glow-success {
                    animation: glow-pulse 2s infinite;
                }

                .progress-bar-glow {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                    position: relative;
                }

                .progress-bar-glow::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    animation: progress-shimmer 2s infinite;
                }

                @keyframes progress-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .particle-effect {
                    animation: fadeIn 0.3s ease-out;
                    pointer-events: none;
                    z-index: 1000;
                }

                .challenge-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .challenge-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.2);
                }

                .challenge-start-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .challenge-start-btn:hover {
                    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4);
                    transform: scale(1.05);
                }

                .levelup-container {
                    filter: drop-shadow(0 0 50px rgba(168, 85, 247, 0.8));
                }

                .crown-animation {
                    position: relative;
                }

                .crown-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent);
                    border-radius: 50%;
                    animation: glow-pulse 2s infinite;
                }

                .trophy-large {
                    font-size: 4rem;
                    animation: bounceIn 1.5s ease-out infinite;
                }

                .completion-celebration {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
                    border-radius: 20px;
                    padding: 3rem;
                    border: 2px solid rgba(16, 185, 129, 0.2);
                }

                .delay-300 {
                    animation-delay: 0.3s;
                }

                .challenge-success-modal {
                    text-align: center;
                }

                .trophy-animation {
                    position: relative;
                    margin: 20px 0;
                }

                .trophy-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent);
                    border-radius: 50%;
                    animation: glow-pulse 1.5s infinite;
                }

                .trophy-icon {
                    font-size: 3rem;
                    position: relative;
                    z-index: 1;
                }

                .rewards-container {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }

                .reward-item {
                    text-align: center;
                    padding: 10px;
                    transition: transform 0.3s ease;
                }

                .reward-item:hover {
                    transform: scale(1.1);
                }

                .reward-icon {
                    font-size: 1.5rem;
                    margin-bottom: 5px;
                    animation: bounce 2s infinite;
                }

                .reward-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 5px 0;
                    background: linear-gradient(45deg, #fbbf24, #f59e0b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .reward-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .time-stats {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin: 15px 0;
                    padding: 10px 20px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 20px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .time-icon {
                    font-size: 1.2rem;
                }

                .levelup-celebration {
                    margin-top: 20px;
                    padding: 15px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
                    border-radius: 15px;
                    border: 2px solid rgba(168, 85, 247, 0.3);
                    animation: fadeIn 0.5s ease-out;
                }

                .levelup-sparkles {
                    font-size: 1.2rem;
                    margin-bottom: 8px;
                    animation: pulse 2s infinite;
                }

                .levelup-text {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 8px;
                }

                .xp-progress {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .xp-needed {
                    background: linear-gradient(45deg, #06b6d4, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 600;
                }

                .failure-modal {
                    text-align: center;
                }

                .thinking-animation {
                    margin: 20px 0;
                    position: relative;
                }

                .thinking-icon {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }

                .thinking-dots {
                    position: absolute;
                    top: -15px;
                    right: -25px;
                    animation: pulse 1s ease-out infinite;
                }

                .thinking-dots span {
                    animation: bounce 1.4s ease-in-out infinite both;
                }

                .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
                .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

                .failure-message {
                    font-size: 1.1rem;
                    margin: 15px 0;
                    line-height: 1.5;
                }

                .tips-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                    padding: 15px;
                    background: rgba(251, 191, 36, 0.1);
                    border-radius: 12px;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                }

                .tip-icon {
                    font-size: 1.3rem;
                    animation: pulse 2s infinite;
                }

                .tip-text {
                    font-size: 0.95rem;
                    line-height: 1.4;
                    text-align: left;
                }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1.0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                /* Enhanced progress bar animations */
                .progress-animated {
                    position: relative;
                    overflow: hidden;
                }

                .progress-animated::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
                    animation: progress-sweep 2s infinite;
                }

                @keyframes progress-sweep {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .rewards-container {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .reward-item {
                        padding: 8px;
                    }
                    
                    .trophy-large {
                        font-size: 3rem;
                    }
                    
                    .levelup-container h2 {
                        font-size: 4rem;
                    }
                }
            `}</style>
        </div>
    );
}