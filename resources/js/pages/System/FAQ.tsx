// resources/js/Pages/System/FAQ.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    HelpCircle, ChevronDown, ChevronRight, Search, 
    BookOpen, Swords, Target, Star, Code, Users,
    MessageSquare, Settings, RefreshCw
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Help & FAQ', href: '/faq' }
];

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "How do I start a Training Challenge?",
        answer: "Navigate to 'Practice' > 'Training Challenge' from the sidebar. Choose your preferred language, difficulty, and mode (Fix Bugs or Random), then click 'Start Challenge' on any available challenge.",
        category: "Training Challenges"
    },
    {
        id: 2,
        question: "What's the difference between Fix Bugs and Random modes?",
        answer: "Fix Bugs mode presents you with buggy code that you need to debug and fix. Random mode gives you fresh coding problems to solve from scratch. Fix Bugs mode rewards 2.0 XP while Random mode rewards 3.5 XP.",
        category: "Training Challenges"
    },
    {
        id: 3,
        question: "How do I challenge another player to a duel?",
        answer: "Go to 'Practice' > 'Duel Challenge' and click 'Challenge Player'. Select your opponent from the list of available participants, choose the programming language, and send the challenge.",
        category: "Duels"
    },
    {
        id: 4,
        question: "What happens when I win a duel?",
        answer: "When you win a duel, you earn 2.0 XP and 1 star. Your win rate and language statistics are also updated. The duel result is recorded in your profile.",
        category: "Duels"
    },
    {
        id: 5,
        question: "How is XP calculated?",
        answer: "XP is earned based on challenge completion: Fix Bugs mode (2.0 XP), Random mode (3.5 XP), Duel wins (2.0 XP), and Duel participation (1.0 XP). XP accumulates in your profile and tracks your overall progress.",
        category: "Scoring"
    },
    {
        id: 6,
        question: "What programming languages are supported?",
        answer: "Currently, the platform supports Python and Java. More languages may be added in future updates based on user feedback and platform expansion.",
        category: "Technical"
    },
    {
        id: 7,
        question: "How do I view my progress and statistics?",
        answer: "Visit your profile page to see detailed statistics including solo attempts, success rate, total XP, stars earned, duel performance, and language-specific progress.",
        category: "Profile"
    },
    {
        id: 8,
        question: "Can I change my username and preferences?",
        answer: "Yes! Go to your profile page and click 'Edit Profile'. You can update your username, avatar, and preferences like background music and sound effects.",
        category: "Profile"
    },
    {
        id: 9,
        question: "What should I do if I encounter a bug or have feedback?",
        answer: "You can submit feedback through the platform's feedback system. Navigate to the feedback section (available in some interfaces) or contact an administrator.",
        category: "Support"
    },
    {
        id: 10,
        question: "How are challenges rated by difficulty?",
        answer: "Challenges are categorized as Easy, Medium, or Hard based on their complexity, required knowledge level, and typical completion time. Start with Easy challenges if you're new to the platform.",
        category: "Challenges"
    }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQ() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const toggleItem = (id: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    const filteredFAQ = faqData.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Training Challenges': return Target;
            case 'Duels': return Swords;
            case 'Scoring': return Star;
            case 'Technical': return Code;
            case 'Profile': return Users;
            case 'Support': return MessageSquare;
            case 'Challenges': return BookOpen;
            default: return HelpCircle;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Training Challenges': return 'text-cyan-400';
            case 'Duels': return 'text-red-400';
            case 'Scoring': return 'text-yellow-400';
            case 'Technical': return 'text-purple-400';
            case 'Profile': return 'text-blue-400';
            case 'Support': return 'text-green-400';
            case 'Challenges': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & FAQ" />
            <div className="min-h-screen bg-gray-900 text-gray-100">
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <HelpCircle className="h-8 w-8 text-cyan-400" />
                                <h1 className="text-3xl font-bold text-white">HELP & FAQ</h1>
                            </div>
                            <p className="text-gray-400">
                                Find answers to common questions about using the CodeExp Challenge Platform
                            </p>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Total Questions</div>
                                    <div className="text-2xl font-bold text-white">{faqData.length}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Target className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Categories</div>
                                    <div className="text-2xl font-bold text-white">{categories.length}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Search className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Filtered</div>
                                    <div className="text-2xl font-bold text-white">{filteredFAQ.length}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Open Items</div>
                                    <div className="text-2xl font-bold text-white">{openItems.size}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white min-w-[160px]"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* FAQ Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredFAQ.length === 0 ? (
                            <div className="col-span-full">
                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                                    <HelpCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No questions found</h3>
                                    <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                                </div>
                            </div>
                        ) : (
                            filteredFAQ.map((item) => {
                                const CategoryIcon = getCategoryIcon(item.category);
                                const isOpen = openItems.has(item.id);
                                const categoryColor = getCategoryColor(item.category);
                                
                                return (
                                    <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
                                        {/* Card Header */}
                                        <div className="p-4 border-b border-gray-700">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-700 rounded-lg">
                                                        <CategoryIcon className={`h-5 w-5 ${categoryColor}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium bg-gray-700 rounded-full ${categoryColor}`}>
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                                                >
                                                    {isOpen ? (
                                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4">
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className="w-full text-left"
                                            >
                                                <h3 className="text-lg font-semibold text-white mb-3 hover:text-cyan-400 transition-colors">
                                                    {item.question}
                                                </h3>
                                            </button>
                                            
                                            {isOpen && (
                                                <div className="mt-4 pt-4 border-t border-gray-700">
                                                    <p className="text-gray-300 leading-relaxed">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    
                </div>
            </div>
        </AppLayout>
    );
}