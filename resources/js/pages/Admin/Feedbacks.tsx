// resources/js/Pages/Admin/Feedbacks.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    MessageSquare, Filter, Search, Eye, Edit, Trash2,
    CheckCircle, Clock, AlertCircle, RefreshCw, X,
    User, Mail, Calendar, ArrowRight, Save,
    Bug, Lightbulb, HelpCircle, Flag, Zap
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Admin', href: '/dashboard' },
    { title: 'Feedback Management', href: '/admin/feedbacks' }
];

interface FeedbackItem {
    id: number;
    title: string;
    message: string;
    type: 'issue' | 'feedback' | 'feature' | 'report';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface FeedbackStats {
    total_feedbacks: number;
    open_feedbacks: number;
    in_progress_feedbacks: number;
    resolved_feedbacks: number;
    closed_feedbacks: number;
    issues: number;
    features: number;
    reports: number;
    general_feedback: number;
}

interface PaginationInfo {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        status: 'open' as 'open' | 'in_progress' | 'resolved' | 'closed',
        title: '',
        message: '',
        type: 'feedback' as 'issue' | 'feedback' | 'feature' | 'report'
    });

    useEffect(() => {
        fetchFeedbacks();
    }, [searchTerm, statusFilter, typeFilter, currentPage]);

    useEffect(() => {
        fetchStats();
    }, [feedbacks]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const response = await apiClient.get('/api/feedbacks', params);
            
            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    setFeedbacks(response.data);
                    setPagination(null);
                } else {
                    setFeedbacks(response.data.data || []);
                    setPagination(response.data.pagination || null);
                }
            } else {
                setFeedbacks([]);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Calculate stats from current feedbacks
            const total = feedbacks.length;
            const open = feedbacks.filter(f => f.status === 'open').length;
            const inProgress = feedbacks.filter(f => f.status === 'in_progress').length;
            const resolved = feedbacks.filter(f => f.status === 'resolved').length;
            const closed = feedbacks.filter(f => f.status === 'closed').length;
            
            const issues = feedbacks.filter(f => f.type === 'issue').length;
            const features = feedbacks.filter(f => f.type === 'feature').length;
            const reports = feedbacks.filter(f => f.type === 'report').length;
            const generalFeedback = feedbacks.filter(f => f.type === 'feedback').length;

            setStats({
                total_feedbacks: total,
                open_feedbacks: open,
                in_progress_feedbacks: inProgress,
                resolved_feedbacks: resolved,
                closed_feedbacks: closed,
                issues,
                features,
                reports,
                general_feedback: generalFeedback
            });
        } catch (error) {
            console.error('Error calculating stats:', error);
        }
    };

    const handleViewFeedback = (feedback: FeedbackItem) => {
        setSelectedFeedback(feedback);
        setShowViewModal(true);
    };

    const handleEditFeedback = (feedback: FeedbackItem) => {
        setSelectedFeedback(feedback);
        setEditForm({
            status: feedback.status,
            title: feedback.title,
            message: feedback.message,
            type: feedback.type
        });
        setShowEditModal(true);
    };

    const handleUpdateFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFeedback) return;

        try {
            setEditLoading(true);
            const response = await apiClient.put(`/api/feedbacks/${selectedFeedback.id}`, editForm);
            
            if (response.success) {
                setFeedbacks(prevFeedbacks =>
                    prevFeedbacks.map(feedback =>
                        feedback.id === selectedFeedback.id
                            ? { ...feedback, ...editForm, updated_at: new Date().toISOString() }
                            : feedback
                    )
                );
                setShowEditModal(false);
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Feedback Updated',
                    text: 'Feedback has been successfully updated.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: response.message || 'Failed to update feedback.',
                });
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'An error occurred while updating the feedback.',
            });
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: number) => {
        const result = await Swal.fire({
            title: 'Delete Feedback?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await apiClient.delete(`/api/feedbacks/${feedbackId}`);
            
            if (response.success) {
                setFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Feedback has been deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'An error occurred while deleting the feedback.',
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'issue': return Bug;
            case 'feature': return Lightbulb;
            case 'report': return Flag;
            case 'feedback': return MessageSquare;
            default: return HelpCircle;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'issue': return 'bg-red-900/30 text-red-300 border-red-500/50';
            case 'feature': return 'bg-blue-900/30 text-blue-300 border-blue-500/50';
            case 'report': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50';
            case 'feedback': return 'bg-green-900/30 text-green-300 border-green-500/50';
            default: return 'bg-gray-900/30 text-gray-300 border-gray-500/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return Clock;
            case 'in_progress': return Zap;
            case 'resolved': return CheckCircle;
            case 'closed': return X;
            default: return AlertCircle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50';
            case 'in_progress': return 'bg-blue-900/30 text-blue-300 border-blue-500/50';
            case 'resolved': return 'bg-green-900/30 text-green-300 border-green-500/50';
            case 'closed': return 'bg-gray-900/30 text-gray-300 border-gray-500/50';
            default: return 'bg-red-900/30 text-red-300 border-red-500/50';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: {
        title: string;
        value: number;
        icon: any;
        color: string;
    }) => (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
            </div>
            
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Feedback Management" />
                <div className="flex flex-col gap-6 p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MessageSquare className="h-8 w-8 text-cyan-400" />
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    FEEDBACK MANAGEMENT
                                </h1>
                                <p className="text-gray-400 text-sm">User feedback and support requests</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchFeedbacks}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Feedback"
                                value={stats.total_feedbacks}
                                icon={MessageSquare}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Open Items"
                                value={stats.open_feedbacks}
                                icon={Clock}
                                color="bg-yellow-500"
                            />
                            <StatCard
                                title="In Progress"
                                value={stats.in_progress_feedbacks}
                                icon={Zap}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Resolved"
                                value={stats.resolved_feedbacks}
                                icon={CheckCircle}
                                color="bg-green-500"
                            />
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search feedback by title, message, or user..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                                >
                                    <option value="all">All Types</option>
                                    <option value="issue">Issues</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="feature">Features</option>
                                    <option value="report">Reports</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Table */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            FEEDBACK
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            USER
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            TYPE
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            DATE
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
                                                    Loading feedback...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : feedbacks.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                No feedback found
                                            </td>
                                        </tr>
                                    ) : (
                                        feedbacks.map((feedback) => {
                                            const TypeIcon = getTypeIcon(feedback.type);
                                            const StatusIcon = getStatusIcon(feedback.status);
                                            
                                            return (
                                                <tr key={feedback.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-white">
                                                                {feedback.title}
                                                            </div>
                                                            <div className="text-xs text-gray-400 truncate max-w-xs">
                                                                {feedback.message}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 mr-3">
                                                                <User className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">
                                                                    {feedback.user.name}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {feedback.user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getTypeColor(feedback.type)}`}>
                                                            <TypeIcon className="h-3 w-3 mr-1" />
                                                            {feedback.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(feedback.status)}`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {feedback.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">
                                                        {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleViewFeedback(feedback)}
                                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditFeedback(feedback)}
                                                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                                                title="Edit Feedback"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteFeedback(feedback.id)}
                                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                                                title="Delete Feedback"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* View Modal */}
                    {showViewModal && selectedFeedback && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Eye className="h-5 w-5 mr-2" />
                                            FEEDBACK DETAILS
                                        </h3>
                                        <button
                                            onClick={() => setShowViewModal(false)}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2">TYPE</label>
                                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getTypeColor(selectedFeedback.type)}`}>
                                                {React.createElement(getTypeIcon(selectedFeedback.type), { className: 'h-4 w-4 mr-2' })}
                                                {selectedFeedback.type.toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2">STATUS</label>
                                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getStatusColor(selectedFeedback.status)}`}>
                                                {React.createElement(getStatusIcon(selectedFeedback.status), { className: 'h-4 w-4 mr-2' })}
                                                {selectedFeedback.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-cyan-400 text-sm font-bold mb-2">TITLE</label>
                                        <p className="text-white text-lg font-medium">{selectedFeedback.title}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-cyan-400 text-sm font-bold mb-2">MESSAGE</label>
                                        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                                            <p className="text-gray-200 whitespace-pre-wrap">{selectedFeedback.message}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2">SUBMITTED BY</label>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{selectedFeedback.user.name}</p>
                                                    <p className="text-gray-400 text-sm">{selectedFeedback.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2">DATES</label>
                                            <div className="space-y-1">
                                                <p className="text-gray-300 text-sm">
                                                    <Calendar className="h-4 w-4 inline mr-2" />
                                                    Created: {new Date(selectedFeedback.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-300 text-sm">
                                                    <Calendar className="h-4 w-4 inline mr-2" />
                                                    Updated: {new Date(selectedFeedback.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
                                        <button
                                            onClick={() => setShowViewModal(false)}
                                            className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-300 font-medium"
                                        >
                                            CLOSE
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false);
                                                handleEditFeedback(selectedFeedback);
                                            }}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>EDIT</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {showEditModal && selectedFeedback && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Edit className="h-5 w-5 mr-2" />
                                            EDIT FEEDBACK
                                        </h3>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <form onSubmit={handleUpdateFeedback} className="space-y-4">
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                STATUS
                                            </label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                TYPE
                                            </label>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as any }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                            >
                                                <option value="issue">Issue</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="feature">Feature Request</option>
                                                <option value="report">Report</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                TITLE
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                MESSAGE
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={editForm.message}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium"
                                                disabled={editLoading}
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={editLoading}
                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg"
                                            >
                                                {editLoading ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                <span>{editLoading ? 'UPDATING...' : 'UPDATE'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </div>
    );
}