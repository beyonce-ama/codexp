// resources/js/Pages/Admin/Reports.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    BarChart3, Users, Code, Target, Swords,
    BookOpen, Trophy, RefreshCw, MessageSquare,
    TrendingUp, Award, AlertTriangle, Zap
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Admin', href: '/dashboard' },
    { title: 'Reports & Analytics', href: '/admin/reports' }
];

interface DatabaseStats {
    // User Statistics
    total_users: number;
    admin_users: number;
    participant_users: number;
    new_users_today: number;
    
    // Challenge Statistics
    total_solo_challenges: number;
    total_1v1_challenges: number;
    fixbugs_challenges: number;
    random_challenges: number;
    
    // Activity Statistics
    total_solo_attempts: number;
    successful_solo_attempts: number;
    total_duels: number;
    completed_duels: number;
    pending_duels: number;
    solo_attempts_today: number;
    duels_today: number;
    
    // Feedback Statistics
    total_feedbacks: number;
    open_feedbacks: number;
    resolved_feedbacks: number;
    
    // Language Statistics
    python_attempts: number;
    java_attempts: number;
    
    // Character Statistics
    total_characters: number;
}

export default function AdminReports() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchDatabaseStats();
    }, []);

    const fetchDatabaseStats = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await apiClient.get('/dashboard/stats');
            
            if (response.success && response.data) {
                setStats(response.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching database stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchDatabaseStats(true);
    };

    const StatCard = ({ 
        title, 
        value, 
        icon: Icon, 
        color = 'blue',
        description
    }: {
        title: string;
        value: string | number;
        icon: any;
        color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
        description?: string;
    }) => {
        const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600',
            purple: 'bg-purple-100 text-purple-600',
            indigo: 'bg-indigo-100 text-indigo-600',
        };

        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-300">{title}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                        {description && (
                            <p className="text-xs text-gray-400">{description}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Reports & Analytics" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400" />
                        <div className="text-gray-300">Loading database statistics...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Calculate success rate from real data
    const successRate = stats && stats.total_solo_attempts > 0 
        ? Math.round((stats.successful_solo_attempts / stats.total_solo_attempts) * 100)
        : 0;

    // Calculate total today's activity
    const todayActivity = stats ? (stats.solo_attempts_today + stats.duels_today) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
            </div>
            
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Reports & Analytics" />
                <div className="flex flex-col gap-6 p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="h-8 w-8 text-cyan-400" />
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    REPORTS & ANALYTICS
                                </h1>
                                <p className="text-gray-400 text-sm">Real-time platform statistics from database</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                            {lastUpdated && (
                                <div className="text-sm text-gray-400">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Database Statistics */}
                    {stats && (
                        <>
                            {/* User Management Statistics */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-200 mb-4">User Management</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Total Users"
                                        value={stats.total_users}
                                        icon={Users}
                                        color="blue"
                                        description="All registered users"
                                    />
                                    <StatCard
                                        title="Participants"
                                        value={stats.participant_users}
                                        icon={Target}
                                        color="green"
                                        description="Active challengers"
                                    />
                                    <StatCard
                                        title="Administrators"
                                        value={stats.admin_users}
                                        icon={Award}
                                        color="purple"
                                        description="System admins"
                                    />
                                    <StatCard
                                        title="New Today"
                                        value={stats.new_users_today}
                                        icon={TrendingUp}
                                        color="indigo"
                                        description="Users joined today"
                                    />
                                </div>
                            </div>

                            {/* Challenge Management Statistics */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-200 mb-4">Challenge Management</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Training Challenges"
                                        value={stats.total_solo_challenges}
                                        icon={BookOpen}
                                        color="blue"
                                        description="Individual challenges"
                                    />
                                    <StatCard
                                        title="1v1 Challenges"
                                        value={stats.total_1v1_challenges}
                                        icon={Swords}
                                        color="red"
                                        description="Duel challenges"
                                    />
                                    <StatCard
                                        title="Fix Bugs Mode"
                                        value={stats.fixbugs_challenges}
                                        icon={AlertTriangle}
                                        color="yellow"
                                        description="Debug challenges"
                                    />
                                    <StatCard
                                        title="Random Mode"
                                        value={stats.random_challenges}
                                        icon={Zap}
                                        color="purple"
                                        description="Random challenges"
                                    />
                                </div>
                            </div>

                            {/* Platform Activity Statistics */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-200 mb-4">Platform Activity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Solo Attempts"
                                        value={stats.total_solo_attempts}
                                        icon={Target}
                                        color="blue"
                                        description="Total individual attempts"
                                    />
                                    <StatCard
                                        title="Success Rate"
                                        value={`${successRate}%`}
                                        icon={Trophy}
                                        color="green"
                                        description={`${stats.successful_solo_attempts} successful attempts`}
                                    />
                                    <StatCard
                                        title="Total Duels"
                                        value={stats.total_duels}
                                        icon={Swords}
                                        color="red"
                                        description={`${stats.completed_duels} completed, ${stats.pending_duels} pending`}
                                    />
                                    <StatCard
                                        title="Today's Activity"
                                        value={todayActivity}
                                        icon={TrendingUp}
                                        color="indigo"
                                        description={`${stats.solo_attempts_today} attempts, ${stats.duels_today} duels`}
                                    />
                                </div>
                            </div>

                            {/* Language and Content Statistics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Language Usage */}
                                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Programming Languages</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Code className="h-5 w-5 text-green-600" />
                                                </div>
                                                <span className="text-gray-300 font-medium">Python Attempts</span>
                                            </div>
                                            <span className="text-lg font-bold text-white">{stats.python_attempts}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-red-100 rounded-lg">
                                                    <Code className="h-5 w-5 text-red-600" />
                                                </div>
                                                <span className="text-gray-300 font-medium">Java Attempts</span>
                                            </div>
                                            <span className="text-lg font-bold text-white">{stats.java_attempts}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Total Language Attempts</span>
                                                <span className="text-cyan-400 font-medium">
                                                    {stats.python_attempts + stats.java_attempts}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback and Support */}
                                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Feedback & Support</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span className="text-gray-300 font-medium">Total Feedback</span>
                                            </div>
                                            <span className="text-lg font-bold text-white">{stats.total_feedbacks}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-yellow-100 rounded-lg">
                                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                </div>
                                                <span className="text-gray-300 font-medium">Open Issues</span>
                                            </div>
                                            <span className="text-lg font-bold text-white">{stats.open_feedbacks}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Trophy className="h-5 w-5 text-green-600" />
                                                </div>
                                                <span className="text-gray-300 font-medium">Resolved</span>
                                            </div>
                                            <span className="text-lg font-bold text-white">{stats.resolved_feedbacks}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Resolution Rate</span>
                                                <span className="text-cyan-400 font-medium">
                                                    {stats.total_feedbacks > 0 
                                                        ? Math.round((stats.resolved_feedbacks / stats.total_feedbacks) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Database Summary */}
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-200 mb-4">Database Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-400">{stats.total_users}</div>
                                        <div className="text-sm text-gray-400">Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {stats.total_solo_challenges + stats.total_1v1_challenges}
                                        </div>
                                        <div className="text-sm text-gray-400">Challenges</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{stats.total_solo_attempts}</div>
                                        <div className="text-sm text-gray-400">Attempts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{stats.total_duels}</div>
                                        <div className="text-sm text-gray-400">Duels</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </AppLayout>
        </div>
    );
}