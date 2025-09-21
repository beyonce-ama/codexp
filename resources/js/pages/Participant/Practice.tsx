// resources/js/Pages/Participant/Practice.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    BookOpen, Code, ArrowRight, ArrowLeft, RefreshCw,
    Eye, EyeOff, Filter, Search, Lightbulb, CheckCircle, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import AnimatedBackground from '@/components/AnimatedBackground';

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

    // NEW: selection/feedback states
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Controls reveal; auto-enabled after selecting, but still usable to reveal without selecting
    const [showAnswer, setShowAnswer] = useState(false);

    // Filter settings
    const [language, setLanguage] = useState<'python' | 'java'>('python');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadQuestions();
    }, [language]);

    useEffect(() => {
        filterQuestions();
    }, [questions, selectedCategory, searchTerm]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const filename = language === 'python' ? 'python_questions.json' : 'java_questions.json';

            const response = await fetch(`/data/${filename}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);

            const data: Question[] = await response.json();
            setQuestions(data);

            const uniqueCategories = [...new Set(data.map(q => q.category))];
            setCategories(uniqueCategories);

            resetPerQuestionState();
            setCurrentQuestionIndex(0);
        } catch (error) {
            console.error('Error loading questions:', error);
            setQuestions([]);
            Swal.fire({
                icon: 'error',
                title: 'Loading Error',
                text: 'Failed to load questions. Please make sure the JSON files are in the public/data folder.',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = questions;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(q => q.category === selectedCategory);
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(q =>
                q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredQuestions(filtered);
        setCurrentQuestionIndex(0);
        resetPerQuestionState();
    };

    const resetPerQuestionState = () => {
        setSelectedChoice(null);
        setIsAnswered(false);
        setShowAnswer(false);
    };

    const nextQuestion = () => {
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

    const toggleAnswer = () => {
        // If revealing without selecting, keep isAnswered=false
        setShowAnswer(prev => !prev);
    };

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const isCorrect = isAnswered && selectedChoice === currentQuestion?.answer;

    const handleChoiceClick = (choice: string) => {
        if (isAnswered) return; // lock after first click
        setSelectedChoice(choice);
        setIsAnswered(true);
        setShowAnswer(true); // auto-reveal so feedback is immediate
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
                             {/* Background */}
            <AnimatedBackground />
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-10"></div>
            </div>

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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                PRACTICE REVIEW
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Review programming questions and learn from explanations
                            </p>
                            </div>
                        </div>
                        </div>


                    {/* Filters */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Language Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'python' | 'java')}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-200"
                                >
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-200"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Search Questions
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by keyword..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-300 text-sm">Total Questions</p>
                                    <p className="text-2xl font-bold text-white">{filteredQuestions.length}</p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-300 text-sm">Current Question</p>
                                    <p className="text-2xl font-bold text-white">
                                        {filteredQuestions.length > 0 ? currentQuestionIndex + 1 : 0}
                                    </p>
                                </div>
                                <Code className="h-8 w-8 text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-300 text-sm">Categories</p>
                                    <p className="text-2xl font-bold text-white">{categories.length}</p>
                                </div>
                                <Filter className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                    </div> */}

                    {/* Question Display */}
                    {filteredQuestions.length === 0 ? (
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
                            <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl text-gray-300 mb-2">No Questions Found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? `No questions match "${searchTerm}"` : 'No questions available for the selected criteria'}
                            </p>
                        </div>
                    ) : currentQuestion && (
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                            {/* Question Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        {/* <h2 className="text-xl font-bold text-white mb-1">
                                            Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                                        </h2> */}
                                        <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium inline-block">
                                            {currentQuestion.category}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            onClick={toggleAnswer}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                                        >
                                            {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            <span>{showAnswer ? 'Hide Answer' : 'Show Answer'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-8">
                                {/* Prompt */}
                                <div className="mb-6">
                                    <h3 className="text-lg text-white mb-2 font-medium leading-relaxed whitespace-pre-line">
                                        {currentQuestion.question}
                                    </h3>

                                    {/* Result pill (only after selecting) */}
                                    {isAnswered && (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                            isCorrect ? 'bg-green-900/40 text-green-200 border border-green-500/40'
                                                      : 'bg-rose-900/40 text-rose-200 border border-rose-500/40'
                                        }`}>
                                            {isCorrect ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </div>
                                    )}
                                </div>

                                {/* Answer Choices */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {currentQuestion.choices.map((choice, index) => {
                                        const isChoiceCorrect = choice === currentQuestion.answer;
                                        const isSelected = choice === selectedChoice;

                                        // Visual state logic
                                        let cardClasses =
                                            'p-4 rounded-lg border transition-all duration-500 transform cursor-pointer ';
                                        if (showAnswer) {
                                            if (isChoiceCorrect) {
                                                cardClasses += 'bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-400 text-green-100 shadow-lg shadow-green-500/20 scale-105';
                                            } else if (isAnswered && isSelected && !isChoiceCorrect) {
                                                cardClasses += 'bg-gradient-to-r from-rose-900/50 to-rose-800/50 border-rose-400 text-rose-100 shadow-lg shadow-rose-500/20';
                                            } else {
                                                cardClasses += 'bg-gray-900/20 border-gray-700 text-gray-400 opacity-80';
                                            }
                                        } else {
                                            cardClasses += 'bg-gray-900/30 border-gray-600 text-gray-300 hover:border-gray-500';
                                        }

                                        const bubbleClasses =
                                            'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ';
                                        const bubbleState = showAnswer
                                            ? (isChoiceCorrect
                                                ? 'border-green-300 bg-green-400 text-green-900 shadow-lg'
                                                : (isAnswered && isSelected ? 'border-rose-300 bg-rose-400 text-rose-900 shadow-lg' : 'border-gray-600 text-gray-500'))
                                            : 'border-gray-500 text-gray-400';

                                        const textStrong = showAnswer && isChoiceCorrect ? 'text-green-100 font-bold' : '';

                                        return (
                                            <div
                                                key={index}
                                                className={cardClasses}
                                                onClick={() => handleChoiceClick(choice)}
                                                role="button"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={bubbleClasses + bubbleState}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className={`font-mono font-medium ${textStrong}`}>
                                                        {choice}
                                                    </span>

                                                    {/* Right-side icons */}
                                                    {showAnswer && isChoiceCorrect && (
                                                        <div className="ml-auto flex items-center space-x-2">
                                                            <span className="text-xs text-green-300 font-semibold">CORRECT</span>
                                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                                        </div>
                                                    )}
                                                    {showAnswer && isAnswered && isSelected && !isChoiceCorrect && (
                                                        <div className="ml-auto flex items-center space-x-2">
                                                            <span className="text-xs text-rose-300 font-semibold">YOUR PICK</span>
                                                            <X className="h-5 w-5 text-rose-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Explanation */}
                            {(showAnswer) && (
                                <div className={`mx-8 mb-6 rounded-lg p-6 border ${
                                    isAnswered
                                        ? (isCorrect
                                            ? 'bg-green-900/20 border-green-500/30'
                                            : 'bg-rose-900/20 border-rose-500/30')
                                        : 'bg-green-900/20 border-green-500/30'
                                }`}>
                                    <h4 className={`font-bold mb-2 flex items-center ${
                                        isAnswered && !isCorrect ? 'text-rose-300' : 'text-green-400'
                                    }`}>
                                        <Lightbulb className="h-5 w-5 mr-2" />
                                        Explanation
                                    </h4>
                                    <p className={`${isAnswered && !isCorrect ? 'text-rose-100' : 'text-green-200'} leading-relaxed`}>
                                        {isAnswered
                                            ? (isCorrect ? currentQuestion.explanation_correct : currentQuestion.explanation_wrong)
                                            : currentQuestion.explanation_correct}
                                    </p>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="bg-gray-900/30 px-8 py-4 flex items-center justify-between">
                                <button
                                    onClick={previousQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </button>

                                <div className="text-gray-400 text-sm">
                                    {currentQuestionIndex + 1} / {filteredQuestions.length}
                                </div>

                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </div>
    );
}
