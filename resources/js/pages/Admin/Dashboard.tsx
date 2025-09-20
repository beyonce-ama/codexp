// resources/js/Pages/Admin/Dashboard.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    LayoutGrid, Users, Code, Trophy, Target, 
    TrendingUp, Star, AlertTriangle, Loader2,
    ArrowUpRight, Activity, RefreshCw, Eye, 
    MessageSquare, GamepadIcon, CheckCircle,
    Clock, Zap, BookOpen, Swords, UserPlus
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Admin Dashboard', href: '/dashboard' }
];

interface AdminStats {
    total_users: number;
    admin_users: number;
    participant_users: number;
    new_users_today: number;
    total_solo_challenges: number;
    total_1v1_challenges: number;
    fixbugs_challenges: number;
    random_challenges: number;
    total_solo_attempts: number;
    successful_solo_attempts: number;
    total_duels: number;
    completed_duels: number;
    pending_duels: number;
    solo_attempts_today: number;
    duels_today: number;
    total_feedbacks: number;
    open_feedbacks: number;
    resolved_feedbacks: number;
    python_attempts: number;
    java_attempts: number;
    total_characters: number;
}

export default function AdminDashboard() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async (isRefresh = false) => {
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
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const StatCard = ({ title, value, icon: Icon, change, description, color = 'blue' }: {
        title: string;
        value: string | number;
        icon: any;
        change?: string;
        description?: string;
        color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    }) => {
        const colorClasses = {
            blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
            green: 'bg-green-900/30 text-green-400 border-green-800',
            yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
            red: 'bg-red-900/30 text-red-400 border-red-800',
            purple: 'bg-purple-900/30 text-purple-400 border-purple-800',
            indigo: 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
        };

        return (
            <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-all backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300">{title}</p>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            {description && (
                                <p className="text-sm text-gray-400">{description}</p>
                            )}
                        </div>
                    </div>
                    {change && (
                        <div className="text-right">
                            <div className="flex items-center text-green-400">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-sm font-medium">{change}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
                </div>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Admin Dashboard" />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-400" />
                            <div className="text-gray-300">Loading admin dashboard...</div>
                        </div>
                    </div>
                </AppLayout>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-20"></div>
                <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-15"></div>
            </div>
            
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-gray-300">
                                Welcome back, {user?.name}! 
                                {lastUpdated && (
                                    <span className="text-sm text-gray-400 ml-2">
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                            <Link
                                href="/admin/users"
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Manage Users</span>
                            </Link>
                        </div>
                    </div>

                    {/* User Management Stats */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-4">User Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats?.total_users || 0}
                                icon={Users}
                                description="All registered users"
                                color="blue"
                            />
                            <StatCard
                                title="Participants"
                                value={stats?.participant_users || 0}
                                icon={Target}
                                description="Active challengers"
                                color="green"
                            />
                            <StatCard
                                title="Admins"
                                value={stats?.admin_users || 0}
                                icon={Eye}
                                description="System administrators"
                                color="purple"
                            />
                            <StatCard
                                title="New Today"
                                value={stats?.new_users_today || 0}
                                icon={TrendingUp}
                                description="Users joined today"
                                color="indigo"
                            />
                        </div>
                    </div>

                    {/* Challenge Management Stats */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-4">Challenge Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Solo Challenges"
                                value={stats?.total_solo_challenges || 0}
                                icon={BookOpen}
                                description="Individual challenges"
                                color="blue"
                            />
                            <StatCard
                                title="1v1 Challenges"
                                value={stats?.total_1v1_challenges || 0}
                                icon={Swords}
                                description="Duel challenges"
                                color="red"
                            />
                            <StatCard
                                title="Fix Bugs Mode"
                                value={stats?.fixbugs_challenges || 0}
                                icon={AlertTriangle}
                                description="Debug challenges"
                                color="yellow"
                            />
                            <StatCard
                                title="Random Mode"
                                value={stats?.random_challenges || 0}
                                icon={Zap}
                                description="Random challenges"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Platform Activity Stats */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-200 mb-4">Platform Activity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Solo Attempts"
                                value={stats?.total_solo_attempts || 0}
                                icon={Target}
                                description="Total individual attempts"
                                color="blue"
                            />
                            <StatCard
                                title="Success Rate"
                                value={`${Math.round(((stats?.successful_solo_attempts || 0) / (stats?.total_solo_attempts || 1)) * 100)}%`}
                                icon={CheckCircle}
                                description="Successful attempts"
                                color="green"
                            />
                            <StatCard
                                title="Active Duels"
                                value={stats?.pending_duels || 0}
                                icon={GamepadIcon}
                                description="Ongoing duels"
                                color="red"
                            />
                            <StatCard
                                title="Open Feedback"
                                value={stats?.open_feedbacks || 0}
                                icon={MessageSquare}
                                description="Pending feedback"
                                color="yellow"
                            />
                        </div>
                    </div>

                    {/* Today's Activity & Language Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Today's Activity */}
                        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800">
                                            <Target className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">Solo Attempts</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{stats?.solo_attempts_today || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-900/30 rounded-lg border border-red-800">
                                            <Swords className="h-5 w-5 text-red-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">New Duels</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{stats?.duels_today || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Language Popularity */}
                        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">Language Popularity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-900/30 rounded-lg border border-green-800">
                                            <Code className="h-5 w-5 text-green-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">Python Attempts</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{stats?.python_attempts || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-orange-900/30 rounded-lg border border-orange-800">
                                            <Code className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">Java Attempts</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{stats?.java_attempts || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </div>
    );
}