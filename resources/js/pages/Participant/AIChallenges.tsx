// resources/js/Pages/Participant/AIChallenges.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Sparkles, Code, Play, Clock, Star, Trophy, 
    RefreshCw, Send, Lightbulb, Brain, Zap,
    CheckCircle, X, AlertTriangle, Cpu, Target,
    Crown, BookOpen, Volume2, VolumeX
} from 'lucide-react';
import { apiClient } from '@/utils/api';
import Swal from 'sweetalert2';
import AnimatedBackground from '@/components/AnimatedBackground';
import { audio } from '@/utils/sound';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Practice', href: '#' },
    { title: 'AI Challenges', href: '/play/ai-challenges' }
];

interface AIChallenge {
    title: string;
    description: string;
    buggy_code: string;
    fixed_code: string;
    hint: string;
    language?: string;
    difficulty?: string;
}

interface UserStats {
    ai_attempts: number;
    ai_successful_attempts: number;
    total_xp: number;
    total_stars: number;
    current_level: number;
    xp_to_next_level: number;
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

export default function ParticipantAIChallenges() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);

    // Generation settings
    const [language, setLanguage] = useState<string>('python');
    const [difficulty, setDifficulty] = useState<string>('easy');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);

    // Challenge state
    const [currentChallenge, setCurrentChallenge] = useState<AIChallenge | null>(null);
    const [userCode, setUserCode] = useState('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [lastSubmissionResult, setLastSubmissionResult] = useState<{ isCorrect: boolean; similarity?: number } | null>(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    // User stats and progress
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    
    // Animation states
    const [particles, setParticles] = useState<Particle[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [celebrationActive, setCelebrationActive] = useState(false);
    const [isGlowing, setIsGlowing] = useState(false);
    const [progressAnimation, setProgressAnimation] = useState(false);
    
    const [hasForfeited, setHasForfeited] = useState(false);

    // NEW: Modal state
    const [showChallengeModal, setShowChallengeModal] = useState(false);
useEffect(() => {
  if (showChallengeModal) {
    document.body.classList.add('solo-open');
  } else {
    document.body.classList.remove('solo-open');
  }
  return () => document.body.classList.remove('solo-open');
}, [showChallengeModal]);

    // Treat various API shapes as "ok"
    const isApiOk = (res: any) => {
        const d = (res && res.data) ? res.data : res;
        return res && res.data && res.data.success === true;
    };

    // NEW: XP constants
    const BASE_XP_NO_HINT = 3.5;
    const BASE_XP_WITH_HINT = 2.5;
    
    // Audio references
    const animationFrameRef = useRef<number>();
        
    const applyRewards = async () => {
        try {
            const payload = {
                difficulty: currentChallenge?.difficulty,
                language,
                topic: selectedTopic || undefined,
                is_correct: true,
                hint_used: showHint,
                time_spent_sec: Math.max(0, parseInt(String(timeSpent), 10) || 0),
                code_submitted: userCode,
            };

            console.log('Sending rewards payload:', payload);

            const res = await apiClient.post('/api/ai-challenges/submit-attempt', payload);
            
            console.log('Rewards API response:', res);

            // Handle the ApiResponse format correctly
            if (res.success && res.data) {
                const backendData = res.data;
                console.log('Backend data received:', backendData);
                
                // Update stats with backend-calculated values
                setUserStats(prev => prev ? {
                    ...prev,
                    total_xp: backendData.total_xp || prev.total_xp,
                    ai_successful_attempts: backendData.ai_successful_attempts || prev.ai_successful_attempts,
                    ai_attempts: backendData.ai_attempts || prev.ai_attempts,
                } : prev);
                
                return backendData.xp_earned || 0;
            } else {
                console.warn('Backend response indicates failure:', res);
                throw new Error(res.message || 'Backend response was not successful');
            }
        } catch (err) {
            console.error('Failed to apply rewards - full error:', err);
            throw err;
        }
    };

    // Updated leveling system: 10 XP per level
    const calculateLevel = (xp: number) => Math.floor(xp / 10) + 1;
    const calculateXPToNextLevel = (xp: number) => 10 - (xp % 10);
    const calculateProgress = (xp: number) => ((xp % 10) / 10) * 100;
    
    // Get current level XP progress for display
    const getCurrentLevelXP = (xp: number) => xp % 10;

    useEffect(() => {
        fetchTopics();
        fetchUserStats();
    }, [language]);

    useEffect(() => {
        // Timer for tracking time spent
        let interval: NodeJS.Timeout;
        if (startTime && currentChallenge) {
            interval = setInterval(() => {
                setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime, currentChallenge]);

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

    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            const statsResponse = await apiClient.get('/api/me/stats');

            // Handle the ApiResponse format
            if (statsResponse.success && statsResponse.data) {
                const statsData = statsResponse.data;
                const totalXP = statsData.totals?.xp || 0;
                const aiStats = statsData.ai_stats || {};
                
                setUserStats({
                    ai_attempts: aiStats.ai_attempts || statsData.ai_attempts || 0,
                    ai_successful_attempts: aiStats.ai_successful_attempts || statsData.ai_successful_attempts || 0,
                    total_xp: totalXP,
                    total_stars: statsData.totals?.stars || 0,
                    current_level: calculateLevel(totalXP),
                    xp_to_next_level: calculateXPToNextLevel(totalXP),
                    streak: statsData.streak || 0
                });
            } else {
                console.warn('Failed to fetch stats:', statsResponse.message);
                // Fallback to user table data
                setUserStats({
                    ai_attempts: user?.ai_attempts || 0,
                    ai_successful_attempts: user?.ai_successful_attempts || 0,
                    total_xp: user?.total_xp || 0,
                    total_stars: 0,
                    current_level: calculateLevel(user?.total_xp || 0),
                    xp_to_next_level: calculateXPToNextLevel(user?.total_xp || 0),
                    streak: 0
                });
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
            // Fallback to user table data if available
            setUserStats({
                ai_attempts: user?.ai_attempts || 0,
                ai_successful_attempts: user?.ai_successful_attempts || 0,
                total_xp: user?.total_xp || 0,
                total_stars: 0,
                current_level: calculateLevel(user?.total_xp || 0),
                xp_to_next_level: calculateXPToNextLevel(user?.total_xp || 0),
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

    const fetchTopics = async () => {
        try {
            const response = await apiClient.get('/api/ai-challenges/topics', { language });
            
            // Handle ApiResponse format
            if (response.success && response.data) {
                setAvailableTopics(response.data);
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    const generateChallenge = async () => {
        try {
            setGenerating(true);
            audio.play('click');
            
            const params: any = { language, difficulty };
            if (selectedTopic) params.topic = selectedTopic;

            const response = await apiClient.post('/api/ai-challenges/generate', params);
            
            // Handle ApiResponse format
            if (response.success && response.data) {
                const challenge = {
                    ...response.data,
                    language,
                    difficulty
                };
                setCurrentChallenge(challenge);
                setUserCode(response.data.buggy_code || '');
                setStartTime(new Date());
                setTimeSpent(0);
                setShowHint(false);
                setHasSubmitted(false);
                setLastSubmissionResult(null);
                setShowCorrectAnswer(false);
                setHasForfeited(false);
                
                audio.play('success');
                
                // NEW: Show modal instead of setting challenge directly
                setShowChallengeModal(true);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Challenge Generated!',
                    text: 'Your AI-generated challenge is ready. Good luck!',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1f2937',
                    color: '#fff'
                });
            } else {
                throw new Error(response.message || 'Failed to generate challenge');
            }
        } catch (error) {
            console.error('Error generating challenge:', error);
            audio.play('failure');
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: error instanceof Error ? error.message : 'Unable to generate challenge. Please try again.',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setGenerating(false);
        }
    };

    // NEW: Close modal and reset challenge
    const closeChallengeModal = () => {
        setShowChallengeModal(false);
        resetChallenge();
    };

    // NEW: forfeit flow that shows solution and clears the board
    const surrenderAndShowAnswer = async () => {
        if (!currentChallenge?.fixed_code) return;

        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Surrender & Show Answer?',
            html: `<p class="text-gray-200">You will NOT receive any rewards for this challenge.</p>`,
            showCancelButton: true,
            confirmButtonText: 'Yes, show the answer',
            cancelButtonText: 'Cancel',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#ef4444',
        });

        if (!confirm.isConfirmed) return;

        setHasForfeited(true);
        audio.play('click');

        await Swal.fire({
            title: 'AI Generated Solution',
            html: `
                <div class="correct-answer-modal">
                    <p class="mb-4 text-gray-300">No rewards granted for surrendered challenges.</p>
                    <div class="bg-gray-900 rounded-lg p-4 text-left">
                        <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${currentChallenge.fixed_code}</pre>
                    </div>
                </div>
            `,
            confirmButtonText: 'Close',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#10B981',
            width: '600px'
        });

        // clear board after surrender
        closeChallengeModal();
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

    // Enhanced validation function - requires 100% match with fixed_code
    const validateCode = (userCode: string, challenge: AIChallenge): boolean => {
        const code = userCode.trim();
        const fixedCode = challenge.fixed_code?.trim();
        
        if (!code) {
            console.log('AI Challenge validation: FAIL - No code provided');
            return false;
        }

        if (!fixedCode) {
            console.log('AI Challenge validation: FAIL - No solution available');
            return false;
        }

        // Check if user made meaningful changes from buggy code
        if (code === challenge.buggy_code?.trim()) {
            console.log('AI Challenge validation: FAIL - No changes made from original buggy code');
            return false;
        }

        // Check minimum code length requirement
        if (code.length < 20) {
            console.log('AI Challenge validation: FAIL - Code too short (minimum 20 characters)');
            return false;
        }

        // Normalize both codes for comparison
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

        // Direct comparison - must match the AI solution EXACTLY
        const isExactMatch = normalizedUserCode === normalizedFixedCode;
        
        if (isExactMatch) {
            console.log('AI Challenge validation: PASS - Exact match with AI solution (100%)');
            return true;
        }

        // Calculate similarity for feedback purposes only
        const similarity = calculateStringSimilarity(normalizedUserCode, normalizedFixedCode);
        const similarityPercentage = Math.round(similarity * 100);
        
        console.log(`AI Challenge validation: FAIL - Only ${similarityPercentage}% similarity with AI solution (requires 100%)`);
        
        // REQUIRES EXACTLY 100% match (similarity >= 1.0)
        const passed = similarity >= 1.0;
        console.log(`AI Challenge validation: ${passed ? 'PASS' : 'FAIL'} (${similarityPercentage}% similarity, requires 100%)`);
        
        return passed;
    };

    const submitSolution = async () => {
        if (!currentChallenge || !userCode.trim()) {
            audio.play('failure');
            Swal.fire('Error', 'Please write some code before submitting.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            audio.play('typing');

            // Enhanced validation
            const isCorrect = validateCode(userCode, currentChallenge);
            const similarity = calculateStringSimilarity(
                userCode.trim().replace(/\s+/g, ' '),
                currentChallenge.fixed_code.trim().replace(/\s+/g, ' ')
            );

            setLastSubmissionResult({ isCorrect, similarity });
            setHasSubmitted(true);

            if (isCorrect) {
                try {
                    // Apply rewards through backend and get the actual XP earned
                    const xpEarned = await applyRewards();

                    const oldTotalXP = userStats?.total_xp || 0;
                    const newTotalXP = oldTotalXP + xpEarned;
                    const oldLevel = calculateLevel(oldTotalXP);
                    const newLevel = calculateLevel(newTotalXP);
                    const leveledUp = newLevel > oldLevel;

                    audio.play('success');
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
                            audio.play('levelup');
                            setShowLevelUp(true);
                            createParticleExplosion(centerX, centerY - 100, 'levelup');
                        }, 1000);
                    }

                    setTimeout(() => {
                        audio.play('victory');
                    }, 500);

                    await Swal.fire({
                        title: 'AI CHALLENGE MASTERED!',
                        html: `
                            <div class="text-center">
                            <div class="text-5xl mb-4">🤖🏆</div>
                            <p class="mb-3 text-lg font-semibold text-cyan-200">
                                Exceptional! You've conquered this AI-generated challenge!
                            </p>
                            
                            <div class="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4 mb-4">
                                <div class="text-2xl font-bold text-green-400">100% Perfect Match</div>
                                <div class="text-sm text-gray-200 opacity-80">AI Solution Mastery!</div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="bg-gray-900/40 rounded-lg p-3">
                                <div class="text-lg font-bold text-yellow-300">+${xpEarned.toFixed(1)}</div>
                                <div class="text-xs text-gray-300">XP Earned</div>
                                </div>
                                <div class="bg-gray-900/40 rounded-lg p-3">
                                <div class="text-lg font-bold text-purple-300">Level ${newLevel}</div>
                                <div class="text-xs text-gray-300">Current Level</div>
                                </div>
                            </div>

                            <div class="text-sm text-gray-300">
                                ⏱️ Completed in ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s
                            </div>

                            ${leveledUp ? `
                                <div class="mt-4 text-center">
                                <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
                                <p class="text-sm text-gray-200">
                                    You've reached Level ${newLevel}! 
                                    Next: ${calculateXPToNextLevel(newTotalXP)} XP needed.
                                </p>
                                </div>
                            ` : ''}
                            </div>
                        `,
                        timer: 6000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Generate New Challenge!',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
                        color: '#fff',
                        confirmButtonColor: '#10B981'
                    });
                    
                    // Close modal after successful submission
                    closeChallengeModal();

                    setTimeout(() => {
                        setShowSuccess(false);
                        setCelebrationActive(false);
                        setShowLevelUp(false);
                        setIsGlowing(false);
                    }, 7000);

                } catch (rewardError) {
                    // Handle reward application error
                    console.error('Reward application failed:', rewardError);
                    audio.play('failure');
                    
                    Swal.fire({
                        icon: 'warning',
                        title: 'Completed but rewards failed',
                        text: 'Challenge completed but there was an issue applying rewards. Please check your connection and try again.',
                        background: '#1f2937',
                        color: '#fff'
                    });
                }
            } else {
                audio.play('failure');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 600);

                await Swal.fire({
                    title: 'Almost There!',
                    html: `
                        <div class="text-center">
                        <div class="text-5xl mb-4">⚠️</div>
                        <p class="mb-3 text-lg font-semibold text-red-200">
                            Your solution must exactly match the AI-generated answer.
                        </p>
                        
                        <div class="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                            <div class="text-lg font-bold text-yellow-300">${Math.round(similarity * 100)}% Match</div>
                            <div class="text-sm text-gray-200 opacity-80">Need 100% for Success</div>
                        </div>

                        <div class="bg-gray-900/40 rounded-lg p-3 text-left text-sm text-gray-200">
                            <div class="font-medium text-yellow-400 mb-1">💡 Tips:</div>
                            <ul class="list-disc list-inside space-y-1">
                            <li>Ensure your code is at least 20 characters long</li>
                            <li>Don't just copy the buggy version</li>
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
                    confirmButtonColor: '#3B82F6'
                });
            }
        } catch (error) {
            console.error('Error submitting solution:', error);
            audio.play('failure');
            
            let errorMessage = 'Failed to submit your solution. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const showCorrectAnswerHandler = () => {
        if (currentChallenge?.fixed_code) {
            audio.play('click');
            setShowCorrectAnswer(true);
            
            Swal.fire({
                title: 'AI Generated Solution',
                html: `
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the AI-generated solution (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${currentChallenge.fixed_code}</pre>
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
    
    const resetChallenge = () => {
        audio.play('click');
        setCurrentChallenge(null);
        setUserCode('');
        setStartTime(null);
        setTimeSpent(0);
        setShowHint(false);
        setHasSubmitted(false);
        setLastSubmissionResult(null);
        setShowCorrectAnswer(false);
        setHasForfeited(false);
        setShowChallengeModal(false);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-400 bg-green-900/30';
            case 'medium': return 'text-yellow-400 bg-yellow-900/30';
            case 'hard': return 'text-red-400 bg-red-900/30';
            default: return 'text-gray-400 bg-gray-900/30';
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

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
            onMouseEnter={() => audio.play('hover')}
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
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-10"></div>
                
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
                                <Sparkles className="w-5 w-5 text-yellow-400" />
                                <span className="text-lg font-semibold">Only {userStats?.xp_to_next_level} XP to next level!</span>
                                <Sparkles className="w-5 w-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenge Modal */}
            {showChallengeModal && currentChallenge && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gray-900/95 border border-gray-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white flex items-center">
                                    <Target className="h-6 w-6 mr-2" />
                                    {currentChallenge.title}
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Clock className="h-5 w-5" />
                                        <span className="font-medium">{formatTime(timeSpent)}</span>
                                    </div>
                                    {/* <button
                                        onClick={closeChallengeModal}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                                        onMouseEnter={() => audio.play('hover')}
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Close</span>
                                    </button> */}
                                    <button
                                        onClick={surrenderAndShowAnswer}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        onMouseEnter={() => audio.play('hover')}
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Surrender & Show Answer</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/20 rounded-lg p-3">
                                    <div className="text-sm text-white/80">Language</div>
                                    <div className="text-lg font-bold text-white">{language.toUpperCase()}</div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <div className="text-sm text-white/80">Difficulty</div>
                                    <div className={`text-lg font-bold capitalize`}>
                                        {difficulty}
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <div className="text-sm text-white/80">Reward</div>
                                    <div className="text-xs text-white/80">
                                        {showHint ? 'Hint used (-0.5 XP)' : 'No hint bonus'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Challenge Details */}
                                <div className="space-y-6">
                                    {/* Description */}
                                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                        <h3 className="text-cyan-400 font-bold mb-3 flex items-center">
                                            <Code className="h-5 w-5 mr-2" />
                                            Challenge Description
                                        </h3>
                                        <p className="text-gray-200 leading-relaxed">{currentChallenge.description}</p>
                                    </div>

                                    {/* Hint */}
                                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-yellow-400 font-bold flex items-center">
                                                <Lightbulb className="h-5 w-5 mr-2" />
                                                Hint
                                            </h3>
                                            {!showHint && (
                                                <button
                                                    onClick={() => {
                                                        setShowHint(true);
                                                        audio.play('click');
                                                    }}
                                                    className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-600/30 transition-colors"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    Show Hint
                                                </button>
                                            )}
                                        </div>
                                        {showHint ? (
                                            <p className="text-yellow-200">{currentChallenge.hint}</p>
                                        ) : (
                                            <p className="text-gray-400 italic">Click "Show Hint" if you need help but it will less your xp rewards</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Code Editor */}
                                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                    <h3 className="text-cyan-400 font-bold mb-3">Your Solution</h3>
                                    <textarea
                                        value={userCode}
                                        onChange={(e) => setUserCode(e.target.value)}
                                        className="w-full h-96 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 font-mono text-sm resize-none transition-all duration-300"
                                        placeholder="Fix the bugs in this code..."
                                    />
                                    
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center space-x-2">
                                            {hasSubmitted && !lastSubmissionResult?.isCorrect && (
                                                <button
                                                    onClick={showCorrectAnswerHandler}
                                                    disabled={submitting}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>Show AI Solution</span>
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
                                            {(!hasSubmitted || !lastSubmissionResult?.isCorrect) && (
                                                <button
                                                    onClick={submitSolution}
                                                    disabled={submitting || !userCode.trim()}
                                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105"
                                                    onMouseEnter={() => audio.play('hover')}
                                                >
                                                    {submitting ? (
                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Send className="h-5 w-5" />
                                                    )}
                                                    <span>{submitting ? 'Submitting...' : hasSubmitted ? 'Try Again' : 'Submit Solution'}</span>
                                                </button>
                                            )}
                                        </div>  
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="AI Generated Challenges" />
                <div className={`flex flex-col gap-6 p-4 relative z-10 ${isShaking ? 'animate-shake' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <Brain className={`h-8 w-8 text-purple-400 ${celebrationActive ? 'animate-spin' : ''} transition-all duration-300`} />
                                <Sparkles className="h-6 w-6 text-yellow-400" />
                                <Cpu className="h-8 w-8 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    AI CHALLENGES
                                </h1>
                                <p className="text-gray-400 text-sm">Unique coding challenges created by artificial intelligence</p>
                            </div>
                        </div>
                    </div>

                    {/* User Stats */}
                    {userStats && (
                        <div className="space-y-4">
                            {/* Enhanced Level Progress Bar */}
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
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
                                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden relative">
                                    <div 
                                        className={`bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${progressAnimation ? 'animate-pulse' : ''}`}
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
                                <StatCard 
                                    title="AI Completed" 
                                    value={userStats.ai_successful_attempts || 0} 
                                    icon={CheckCircle} 
                                    color="bg-purple-500" 
                                    animated={showSuccess}
                                />
                                <StatCard title="Streak" value={userStats.streak || 0} icon={Zap} color="bg-cyan-500" />
                            </div>
                        </div>
                    )}

                    {/* Challenge Generation Interface - Always visible */}
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                            <div className="text-center mb-8">
                                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Generate Your AI Challenge</h2>
                                <p className="text-gray-400">Configure your preferences and let AI create a unique coding challenge</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Language Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Programming Language
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-200 transition-all duration-300"
                                        onMouseEnter={() => audio.play('hover')}
                                    >
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                    </select>
                                </div>

                                {/* Difficulty Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-200 transition-all duration-300"
                                        onMouseEnter={() => audio.play('hover')}
                                    >
                                        <option value="easy">Easy (3.0 XP)</option>
                                        <option value="medium">Medium (4.0 XP)</option>
                                        <option value="hard">Hard (6.0 XP)</option>
                                    </select>
                                </div>

                                {/* Topic Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Topic (Optional)
                                    </label>
                                    <select
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-200 transition-all duration-300"
                                        onMouseEnter={() => audio.play('hover')}
                                    >
                                        <option value="">Random Topic</option>
                                        {availableTopics.map((topic) => (
                                            <option key={topic} value={topic}>{topic}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="text-center">
                                <button
                                    onClick={generateChallenge}
                                    disabled={generating}
                                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 font-bold text-lg shadow-lg hover:scale-105"
                                    onMouseEnter={() => audio.play('hover')}
                                >
                                    {generating ? (
                                        <>
                                            <RefreshCw className="h-6 w-6 animate-spin" />
                                            <span>Generating Challenge...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-6 w-6" />
                                            <span>Generate AI Challenge</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
              {/* Enhanced CSS Styles */}
            <style>{`
            /* When the Solo challenge modal is open, completely hide the header */
body.solo-open header {
  opacity: 0 !important;
  pointer-events: none !important;
}


            `}</style>
        </div>
    );
}