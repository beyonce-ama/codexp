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

export default function ParticipantPractice() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const [language, setLanguage] = useState<'python' | 'java'>('python');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [takenIds, setTakenIds] = useState<Set<number>>(new Set());

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

  const loadQuestions = async () => {
    const ac = new AbortController();
    try {
      setLoading(true);
      const filename = language === 'python' ? 'python_questions.json' : 'java_questions.json';
      const response = await fetch(`/data/${filename}`, { signal: ac.signal });
      if (!response.ok) throw new Error(`Failed to load ${filename}`);
      const data: Question[] = await response.json();
      setQuestions(data);
      setCategories([...new Set(data.map(q => q.category))]);
      resetPerQuestionState();
      setCurrentQuestionIndex(0);
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error loading questions:', error);
        setQuestions([]);
        Swal.fire({
          icon: 'error',
          title: 'Loading Error',
          text: 'Failed to load questions. Please make sure the JSON files are in the public/data folder.',
        });
      }
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  };

  const filterQuestions = () => {
    let filtered = questions;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const needle = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(needle) ||
        q.category.toLowerCase().includes(needle)
      );
    }
    filtered = filtered.filter(q => !takenIds.has(q.id));
    setFilteredQuestions(filtered);
    setCurrentQuestionIndex(idx => Math.min(idx, Math.max(0, filtered.length - 1)));
  };

  const resetPerQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setShowAnswer(false);
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isCorrect = isAnswered && selectedChoice === currentQuestion?.answer;

  const nextQuestion = () => {
    if (currentQuestion) {
      setTakenIds(prev => new Set(prev).add(currentQuestion.id));
    }
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetPerQuestionState();
    }
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
            {/* <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition ${
                soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
              }`}
              onMouseEnter={() => playSfx('hover')}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button> */}
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
                      onChange={(e) => setLanguage(e.target.value as 'python' | 'java')}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200"
                    >
                      <option value="python">Python</option>
                      <option value="java">Java</option>
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
                    <span className="text-blue-300 font-medium">{filteredQuestions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Progress:</span>
                    <span className="text-purple-300 font-medium">
                      {filteredQuestions.length === 0 ? 0 : (currentQuestionIndex + 1)}/{filteredQuestions.length}
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
                      {filteredQuestions.length > 0
                        ? Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          filteredQuestions.length > 0
                            ? ((currentQuestionIndex + 1) / filteredQuestions.length) * 100
                            : 0
                        }%`
                      }}
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
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
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
                      {currentQuestionIndex + 1} / {filteredQuestions.length}
                    </div>
                    <button
                      onClick={() => { nextQuestion(); playSfx('click'); }}
                      disabled={currentQuestionIndex === filteredQuestions.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      Next <ArrowRight className="h-4 w-4 inline" />
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
