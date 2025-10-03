// resources/js/Pages/Participant/Practice.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Code, ArrowRight, ArrowLeft, RefreshCw,
  Eye, EyeOff, Search, Lightbulb, CheckCircle, X,
  Volume2, VolumeX, Filter, BarChart3
} from 'lucide-react';
import Swal from 'sweetalert2';
import AnimatedBackground from '@/components/AnimatedBackground';
import { audio } from '@/utils/sound';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Practice', href: '#' },
  { title: 'Review Mode', href: '/play/practice' }
];

interface Question {
  id: number;
  category: string;
  question: string;
  choices: string[];
  answer: string;
  explanation_correct: string;
  explanation_wrong: string;
}
type Lang = 'python' | 'java' | 'cpp';
const LANGS: Lang[] = ['python', 'java', 'cpp'];

export default function ParticipantPractice() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

 const [language, setLanguage] = useState<Lang>('python');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [takenIds, setTakenIds] = useState<Set<number>>(new Set());
  const [totalInSet, setTotalInSet] = useState<number>(0);
  const resumeFromLastRef = useRef<number | null>(null);
 const shownErrorKeyRef = useRef<string | null>(null);
  const currentSetRef = useRef<{ id:number; filename:string; total_questions:number; set_index:number; language:string } | null>(null);

  const csrfToken =
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
    (window as any).Laravel?.csrfToken ||
    '';
  // audio
  const [soundEnabled, setSoundEnabled] = useState(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);


  // tiny helper to respect toggle for SFX
  const playSfx = (name: 'click' | 'hover' | 'success' | 'failure') => {
    if (!soundEnabled) return;
    try {
      audio.play(name);
    } catch {
      /* noop */
    }
  };

  const toggleSound = () => {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);

    // bg music control
    const music = bgMusicRef.current;
    if (!music) return;
    if (enabled) {
      // try to play; browsers may block until user gesture—this button is one
      music.play().catch(() => {});
    } else {
      music.pause();
      music.currentTime = 0;
    }
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    filterQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, selectedCategory, searchTerm, takenIds]);


useEffect(() => {
  if (!currentSetRef.current) return;
  if (totalInSet > 0 && takenIds.size >= totalInSet) {
    const { id, set_index, language } = currentSetRef.current;

    // 1) Mark finished on the server
    fetch('/practice/finish', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({ question_set_id: id }),
    })
    .catch(() => {})
    .finally(async () => {
      try {
        // 2) Check if there's a next set
        const setsResp = await fetch(`/practice/sets?language=${language}`, { credentials: 'same-origin' });
        const setsJson = await setsResp.json();
        const sets = Array.isArray(setsJson?.sets) ? setsJson.sets : [];
        const next = sets.find((s: any) => s.set_index > set_index); // sets are returned ordered by set_index

        if (next) {
          try { audio.play('success'); } catch {}
         const res =  await Swal.fire({
            icon: 'success',
            title: '🎉 Congratulations!',
            html: `<div class="text-left">
              <p>You’ve finished <b>Set #${set_index}</b> (${language}).</p>
              <p class="mt-2">The next set <b>#${next.set_index}</b> is available. Ready to continue?</p>
            </div>`,
            confirmButtonText: `Start Set #${next.set_index}`,
            showCancelButton: true,
            cancelButtonText: 'Later',
            customClass: { popup: 'bg-gray-900 text-gray-100' },
          });
          if (res.isConfirmed) {  
            loadQuestions();
          }
        } else {
          try { audio.play('success'); } catch {}
          await Swal.fire({
            icon: 'success',
            title: '🎉 Great job!',
            html: `<div class="text-left">
              <p>You’ve finished <b>Set #${set_index}</b> (${language}).</p>
              <p class="mt-2">No next set is uploaded yet. <b>Stay tuned</b> for more questions!</p>
            </div>`,
            confirmButtonText: 'Okay',
            customClass: { popup: 'bg-gray-900 text-gray-100' },
          });
        }
      } catch {
        // If the check fails, just refresh to whatever current() resolves to
        loadQuestions();
      }
    });
  }
}, [takenIds, totalInSet]); // eslint-disable-line react-hooks/exhaustive-deps


  const loadQuestions = async () => {
    const ac = new AbortController();
try {
  setLoading(true);

  const metaResp = await fetch(`/practice/current?language=${language}`, {
    signal: ac.signal,
    credentials: 'same-origin',
  });
  if (!metaResp.ok) {
  if (metaResp.status === 404) throw { code: 'NO_SET' };              // no sets registered yet
  if (metaResp.status === 401 || metaResp.status === 419) throw { code: 'SESSION' }; // auth/csrf
  throw { code: 'GENERIC' };
}
 const meta = await metaResp.json();  
  const { set, progress } = meta;

 currentSetRef.current = {
  id: set.id,
  filename: set.filename,
  total_questions: set.total_questions,
  set_index: set.set_index,
  language: set.language,
};

  setTotalInSet(set.total_questions || 0);

  // stash last taken so we can jump to the next one after filters apply
  resumeFromLastRef.current = progress?.last_question_id ?? null;

  const response = await fetch(`/data/${set.filename}`, {
    signal: ac.signal,
    credentials: 'same-origin',
  });
  if (!response.ok) {
  if (response.status === 404) {
    throw { code: 'FILE_MISSING', filename: set.filename, setIndex: set.set_index, lang: set.language };
  }
  throw { code: 'GENERIC' };
}
  const data: Question[] = await response.json();
  setQuestions(data);
  setCategories([...new Set(data.map(q => q.category))]);

  // --- Sanity checks for IDs vs file vs DB ---
const uniqueIds = new Set(data.map(q => q.id));
if (uniqueIds.size !== data.length) {
  // There are duplicates or missing IDs in the file
  const seen = new Set<number>();
  const dups: number[] = [];
  data.forEach(q => {
    if (seen.has(q.id)) dups.push(q.id);
    else seen.add(q.id);
  });
  console.warn('[Practice] Duplicate or missing IDs detected', {
    file: currentSetRef.current?.filename,
    totalRows: data.length,
    uniqueIds: uniqueIds.size,
    duplicates: Array.from(new Set(dups)),
  });
}

  const takenFromServer = Array.isArray(progress?.taken_ids) ? (progress.taken_ids as number[]) : [];
  setTakenIds(new Set(takenFromServer));

  resetPerQuestionState();
  // NOTE: don't force index here; filterQuestions will position us correctly
} catch (error: any) {
  if (error?.name === 'AbortError') return;

  console.error('Error loading questions:', error);
  setQuestions([]);

  // build a unique key for “same error again”
  const key =
    (error?.code ?? 'GENERIC') +
    ':' + (error?.setIndex ?? '') +
    ':' + (error?.lang ?? '');

  const alreadyShown = shownErrorKeyRef.current === key;
  if (!alreadyShown) shownErrorKeyRef.current = key;

  // choose a fallback language label for the deny button
  const idx = LANGS.indexOf(language);
  const nextLang = LANGS[(idx + 1) % LANGS.length];

  let title = 'Can’t load questions';
  let html  = 'We ran into a hiccup loading this practice set. Please try again.';
  let confirmText = 'Retry';
  let showDeny = false;
  let denyText = '';
  let action: (() => Promise<void> | void) | null = () => loadQuestions();

  switch (error?.code) {
    case 'NO_SET':
      title = 'Practice set coming soon';
      html  = `We’re preparing the next <b>${language}</b> question set. Check back soon!`;
      confirmText = 'Got it';
      action = null;
      showDeny = true;
      denyText = `Try ${nextLang.toUpperCase()}`;
      break;

    case 'FILE_MISSING':
      title = 'Updating questions';
      html  = `We’re updating <b>Set #${error.setIndex}</b> (${error.lang}). Please try again a little later.`;
      confirmText = 'Retry';
      action = () => loadQuestions();
      break;

    case 'SESSION':
      title = 'Session expired';
      html  = 'Please refresh the page and sign in again.';
      confirmText = 'Refresh';
      action = () => window.location.reload();
      break;

    default:
      title = 'Can’t load questions';
      html  = 'Looks like a network hiccup. Please try again.';
      confirmText = 'Retry';
      action = () => loadQuestions();
      break;
  }

  if (!alreadyShown) {
    // First time for this specific error → show blocking modal
    const res = await Swal.fire({
      icon: 'info',
      title,
      html,
      confirmButtonText: confirmText,
      showDenyButton: showDeny,
      denyButtonText: denyText,
      customClass: { popup: 'bg-gray-900 text-gray-100' },
    });

    if (res.isConfirmed && action) await action();
    if (res.isDenied) setLanguage(nextLang);
  } else {
    // Same error happening again → lightweight toast only
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: error?.code === 'FILE_MISSING'
        ? 'Still updating — please check back later.'
        : 'Still can’t load — try again soon.',
      showConfirmButton: false,
      timer: 2000,
    });
  }
}
 finally {
  setLoading(false);
}

  };
const filterQuestions = () => {
  // build filtered list
  const needle = searchTerm.trim().toLowerCase();
  let filtered = questions.filter(q => !takenIds.has(q.id));
  if (selectedCategory !== 'all') filtered = filtered.filter(q => q.category === selectedCategory);
  if (needle) filtered = filtered.filter(q =>
    q.question.toLowerCase().includes(needle) || q.category.toLowerCase().includes(needle)
  );

  setFilteredQuestions(filtered);

  // decide where to place the pointer
  if (filtered.length === 0) {
    setCurrentQuestionIndex(0);
    return;
  }

  // If we have a last taken id, try to jump to the very next available question in the original order
  if (resumeFromLastRef.current != null) {
    const lastId = resumeFromLastRef.current;
    // find the next un-taken question after lastId by original order
    let targetId: number | null = null;
    const idToIdx: Record<number, number> = {};
    questions.forEach((q, i) => (idToIdx[q.id] = i));

    const lastIdxInAll = idToIdx[lastId] ?? -1;
    for (let i = lastIdxInAll + 1; i < questions.length; i++) {
      const q = questions[i];
      const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesSearch = !needle || q.question.toLowerCase().includes(needle) || q.category.toLowerCase().includes(needle);
      if (!takenIds.has(q.id) && matchesCat && matchesSearch) {
        targetId = q.id;
        break;
      }
    }
    if (targetId == null) targetId = filtered[0].id; // fallback: first available

    const idxInFiltered = filtered.findIndex(q => q.id === targetId);
    setCurrentQuestionIndex(idxInFiltered >= 0 ? idxInFiltered : 0);

    // consume once
    resumeFromLastRef.current = null;
  } else {
    // normal clamp on list changes
    setCurrentQuestionIndex(idx => Math.min(idx, Math.max(0, filtered.length - 1)));
  }
};


  const resetPerQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setShowAnswer(false);
  };

const currentQuestion = filteredQuestions[currentQuestionIndex];
const isCorrect = isAnswered && selectedChoice === currentQuestion?.answer;
const isLastQuestion = filteredQuestions.length === 1 || currentQuestionIndex === filteredQuestions.length - 1; // NEW

const nextQuestion = async () => {
  if (currentQuestion && currentSetRef.current) {
    // Optimistic: mark as taken
    setTakenIds(prev => {
      const next = new Set(prev);
      next.add(currentQuestion.id);
      return next;
    });

    // Persist to DB (send cookies + CSRF)
    try {
      await fetch('/practice/taken', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          question_set_id: currentSetRef.current.id,
          question_id: currentQuestion.id,
        }),
      });
      // Remember this as last taken so if the page reloads instantly, we still resume
      resumeFromLastRef.current = currentQuestion.id;
    } catch (e) {
      console.error('Failed to mark taken', e);
    }
  }

  // IMPORTANT: do NOT increment index here.
  // The filtered list shrinks by 1, so the next item slides into the same index.
  resetPerQuestionState();
};


  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetPerQuestionState();
    }
  };

  const toggleAnswer = () => setShowAnswer(prev => !prev);

  const handleChoiceClick = (choice: string) => {
    if (isAnswered || !currentQuestion) return; // guard
    playSfx('click');
    setSelectedChoice(choice);
    setIsAnswered(true);
    setShowAnswer(true);
    if (choice === currentQuestion.answer) {
      playSfx('success');
    } else {
      playSfx('failure');
    }
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Practice Review" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-400" />
            <div className="text-gray-300">Loading questions...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Practice Review" />

        <div className="flex flex-col gap-6 p-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <Code className="h-6 w-6 text-purple-400" />
              <Lightbulb className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold">PRACTICE REVIEW</h1>
                <p className="text-gray-400 text-sm">Review programming questions and learn from explanations</p>
              </div>
            </div>
          </div>

          {/* Split Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Controls & Stats (1/3) */}
            <div className="lg:w-1/3 flex flex-col gap-6">
              {/* Filters Card */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Question Filters</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                   <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Lang)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200"
                    >
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Session Stats</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Questions:</span>
                    <span className="text-blue-300 font-medium">{totalInSet}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Progress:</span>
                    <span className="text-purple-300 font-medium">
                      {takenIds.size}/{totalInSet}
                    </span>

                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Language:</span>
                    <span className="text-green-300 font-medium capitalize">{language}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-yellow-300 font-medium">
                      {selectedCategory === 'all' ? 'All' : selectedCategory}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Completion</span>
                    <span>
                      {totalInSet > 0 ? Math.round((takenIds.size / totalInSet) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalInSet > 0 ? Math.round((takenIds.size / totalInSet) * 100) : 0}%` }}

                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Question Area (2/3) */}
            <div className="lg:w-2/3">
              {filteredQuestions.length === 0 ? (
                <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                  <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-300 mb-2">No Questions Found</h3>
                  <p className="text-gray-500 mb-4">You may have completed all questions for this set/filter.</p>
                  <button
                    onClick={() => {
                      setTakenIds(new Set()); // soft reset for current filter; server will still remember overall progress
                      setCurrentQuestionIndex(0);
                      resetPerQuestionState();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Revisit Questions in This Set
                  </button>
                </div>
              ) : currentQuestion && (
                <div className="bg-gray-900/60 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md">
                      {currentQuestion.category}
                    </div>
                    <button
                      onClick={() => { toggleAnswer(); playSfx('hover'); }}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg shadow transition"
                    >
                      {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showAnswer ? 'Hide Answer' : 'Show Answer'}</span>
                    </button>
                  </div>

                  {/* Question Body */}
                  <div className="p-8">
                    <div className="mb-6 p-4 bg-gray-800/40 border border-gray-700 rounded-lg">
                      <p className="text-xl text-white font-semibold leading-relaxed whitespace-pre-line">
                        {currentQuestion.question.split(/(`[^`]+`)/g).map((part, i) =>
                          part.startsWith('`') ? (
                            <code
                              key={i}
                              className="bg-gray-700 px-2 py-1 rounded text-purple-300 font-mono text-base"
                            >
                              {part.replace(/`/g, '')}
                            </code>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>

                    {/* Answer State */}
                    {isAnswered && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        isCorrect ? 'bg-green-900/40 text-green-200' : 'bg-rose-900/40 text-rose-200'
                      }`}>
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    )}

                    {/* Choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                      {currentQuestion.choices.map((choice, index) => {
                        const isChoiceCorrect = choice === currentQuestion.answer;
                        const isSelected = choice === selectedChoice;

                        let cardClasses = 'p-4 rounded-lg border cursor-pointer transition-all ';
                        if (showAnswer) {
                          if (isChoiceCorrect) {
                            cardClasses += 'bg-green-900/50 border-green-400 text-green-100';
                          } else if (isAnswered && isSelected && !isChoiceCorrect) {
                            cardClasses += 'bg-rose-900/50 border-rose-400 text-rose-100';
                          } else {
                            cardClasses += 'bg-gray-900/20 border-gray-700 text-gray-400';
                          }
                        } else {
                          cardClasses += 'bg-gray-900/30 border-gray-600 text-gray-300 hover:border-gray-400';
                        }

                        return (
                          <div
                            key={index}
                            className={cardClasses}
                            onClick={() => handleChoiceClick(choice)}
                            onMouseEnter={() => playSfx('hover')}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 rounded-full border flex items-center justify-center">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="font-mono">{choice}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  {showAnswer && (
                    <div className={`mx-8 mb-6 rounded-lg p-6 border ${
                      isAnswered
                        ? (isCorrect ? 'bg-green-900/20 border-green-500/30' : 'bg-rose-900/20 border-rose-500/30')
                        : 'bg-blue-900/20 border-blue-500/30'
                    }`}>
                      <h4 className={`font-bold mb-2 flex items-center ${
                        isAnswered && !isCorrect ? 'text-rose-300' : 'text-green-400'
                      }`}>
                        <Lightbulb className="h-5 w-5 mr-2" /> Explanation
                      </h4>
                      <p className={`${isAnswered && !isCorrect ? 'text-rose-100' : 'text-green-200'}`}>
                        {isAnswered
                          ? (isCorrect ? currentQuestion.explanation_correct : currentQuestion.explanation_wrong)
                          : currentQuestion.explanation_correct}
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="bg-gray-900/30 px-8 py-4 flex justify-between">
                    <button
                      onClick={() => { previousQuestion(); playSfx('click'); }}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4 inline" /> Previous
                    </button>
                    <div className="text-gray-400 text-sm">
                    Answered {takenIds.size} / {totalInSet}
                    </div>
                 <button
                    onClick={() => { nextQuestion(); playSfx('click'); }}
                    disabled={!currentQuestion} // allow pressing on the last question too
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isLastQuestion ? 'Finish Question' : 'Next'} <ArrowRight className="h-4 w-4 inline" />
                  </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
