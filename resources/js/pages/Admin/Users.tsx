// resources/js/Pages/Admin/Users.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Users, Plus, Search, Filter, Edit, Trash2, 
    Eye, MoreHorizontal, UserPlus, Shield, 
    User, Mail, Calendar, CheckCircle, XCircle,
    AlertCircle, RefreshCw, X, Save, Code
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Admin', href: '/dashboard' },
    { title: 'User Management', href: '/admin/users' }
];

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'participant';
    status: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string | null;
    profile?: {
        username?: string;
        avatar_url?: string | null;
    } | null;
}

interface PaginationInfo {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface UsersResponse {
    data: User[];
    pagination: PaginationInfo;
}

interface UserStats {
    users_total?: number;
    admins?: number;
    participants?: number;
    total_users?: number;
    admin_users?: number;
    participant_users?: number;
}

interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'participant';
    status: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    
    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'participant' as 'admin' | 'participant',
        status: 'active'
    });

    // Add form state
    const [addForm, setAddForm] = useState<CreateUserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'participant',
        status: 'active'
    });

    // Form validation errors
    const [addFormErrors, setAddFormErrors] = useState<Partial<CreateUserForm>>({});

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, currentPage]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params: any = { page: currentPage };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (roleFilter !== 'all') params.role = roleFilter;

            const response = await apiClient.get<UsersResponse>('/api/users', params);
            
            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                    setPagination(null);
                } else {
                    setUsers(response.data.data || []);
                    setPagination(response.data.pagination || null);
                }
            } else {
                setError(response.message || 'Failed to fetch users');
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Network error occurred while fetching users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get<UserStats>('/api/users/stats/system');
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                console.warn('Stats endpoint not available:', response.message);
                const totalUsers = users.length;
                const admins = users.filter(u => u.role === 'admin').length;
                const participants = users.filter(u => u.role === 'participant').length;
                
                setStats({
                    users_total: totalUsers,
                    total_users: totalUsers,
                    admins: admins,
                    admin_users: admins,
                    participants: participants,
                    participant_users: participants
                });
            }
        } catch (error) {
            console.warn('Error fetching stats, will calculate from user data:', error);
            if (users.length > 0) {
                const totalUsers = users.length;
                const admins = users.filter(u => u.role === 'admin').length;
                const participants = users.filter(u => u.role === 'participant').length;
                
                setStats({
                    users_total: totalUsers,
                    total_users: totalUsers,
                    admins: admins,
                    admin_users: admins,
                    participants: participants,
                    participant_users: participants
                });
            }
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchUsers();
        fetchStats();
    };

    // Add modal handlers
    const openAddModal = () => {
        setAddForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'participant',
            status: 'active'
        });
        setAddFormErrors({});
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setAddForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'participant',
            status: 'active'
        });
        setAddFormErrors({});
    };

    // Edit modal handlers
    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditForm({
            name: '',
            email: '',
            role: 'participant',
            status: 'active'
        });
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    // Validation function
    const validateAddForm = (): boolean => {
        const errors: Partial<CreateUserForm> = {};

        if (!addForm.name.trim()) {
            errors.name = 'Name is required';
        } else if (addForm.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!addForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!addForm.password) {
            errors.password = 'Password is required';
        } else if (addForm.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!addForm.password_confirmation) {
            errors.password_confirmation = 'Password confirmation is required';
        } else if (addForm.password !== addForm.password_confirmation) {
            errors.password_confirmation = 'Passwords do not match';
        }

        setAddFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateAddForm()) {
            return;
        }

        try {
            setAddLoading(true);
            const response = await apiClient.post('/api/users', addForm);
            
            if (response.success) {
                // Add the new user to the list
                if (response.data) {
                    setUsers(prevUsers => [response.data, ...prevUsers]);
                }
                
                closeAddModal();
                fetchStats(); // Refresh stats
                
                // Show success notification
                await Swal.fire({
                    icon: 'success',
                    title: 'Player Created',
                    text: 'New player has been successfully created.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Optionally refresh the entire list to ensure consistency
                fetchUsers();
            } else {
                // Handle server validation errors
                if (response.errors) {
                    setAddFormErrors(response.errors);
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Creation Failed',
                        text: response.message || 'Failed to create user.',
                    });
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'An error occurred while creating the user.',
            });
        } finally {
            setAddLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            setEditLoading(true);
            const response = await apiClient.put(`/api/users/${selectedUser.id}`, editForm);
            
            if (response.success) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === selectedUser.id
                            ? { ...user, ...editForm }
                            : user
                    )
                );
                closeEditModal();
                fetchStats();

                // ✅ Show success notification
                await Swal.fire({
                    icon: 'success',
                    title: 'User Updated',
                    text: 'Player details have been successfully updated.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                // ❌ Show error message
                await Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: response.message || 'Failed to update user.',
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'An error occurred while updating the user.',
            });
        } finally {
            setEditLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        try {
            setDeleteLoading(true);
            const response = await apiClient.delete(`/api/users/${selectedUser.id}`);
            
            if (response.success) {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
                closeDeleteModal();
                fetchStats();

                // ✅ Show success notification
                await Swal.fire({
                    icon: 'success',
                    title: 'User Deleted',
                    text: 'The player has been successfully deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                // ❌ Show error message
                await Swal.fire({
                    icon: 'error',
                    title: 'Delete Failed',
                    text: response.message || 'Failed to delete user.',
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'An error occurred while deleting the user.',
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: {
        title: string;
        value: number;
        icon: any;
        color: string;
    }) => (
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${color} transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{title}</p>
                    <p className="text-2xl font-bold text-white">{value || 0}</p>
                </div>
            </div>
        </div>
    );

    const Pagination = ({ pagination }: { pagination: PaginationInfo }) => {
        const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
        
        return (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700/50 bg-gray-800/30">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.last_page}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-400">
                            Showing <span className="font-medium text-cyan-400">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
                            <span className="font-medium text-cyan-400">
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                            </span> of{' '}
                            <span className="font-medium text-cyan-400">{pagination.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-600 bg-gray-800/50 text-sm font-medium text-gray-300 hover:bg-gray-700/50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {pages.map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === pagination.current_page
                                            ? 'z-10 bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-500 text-white shadow-lg'
                                            : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-600 bg-gray-800/50 text-sm font-medium text-gray-300 hover:bg-gray-700/50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse opacity-15"></div>
            </div>
            
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3">
                                <Code className="h-8 w-8 text-cyan-400" />
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                        USER MANAGEMENT
                                    </h1>
                                    <p className="text-gray-400 text-sm">Manage coding competition participants</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 backdrop-blur-sm"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>REFRESH</span>
                            </button>
                            <button 
                                onClick={openAddModal}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>ADD PLAYER</span>
                            </button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <p className="text-red-300">{error}</p>
                                <button 
                                    onClick={handleRefresh}
                                    className="ml-auto text-red-400 hover:text-red-300"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="TOTAL PLAYERS"
                                value={stats.users_total || stats.total_users || 0}
                                icon={Users}
                                color="hover:shadow-blue-500/20"
                            />
                            <StatCard
                                title="ADMINISTRATORS"
                                value={stats.admins || stats.admin_users || 0}
                                icon={Shield}
                                color="hover:shadow-purple-500/20"
                            />
                            <StatCard
                                title="PARTICIPANTS"
                                value={stats.participants || stats.participant_users || 0}
                                icon={User}
                                color="hover:shadow-green-500/20"
                            />
                        </div>
                    )}

                    {/* Filters and Search */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search players by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 backdrop-blur-sm"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins</option>
                                    <option value="participant">Participants</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            PLAYER
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            ROLE
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            JOINED
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
                                                    Loading players...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                {error ? 'Failed to load players' : 'No players found'}
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {user.profile?.avatar_url ? (
                                                                <img 
                                                                    className="h-10 w-10 rounded-full object-cover border-2 border-cyan-400/50"
                                                                    src={user.profile.avatar_url}
                                                                    alt={user.name}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-cyan-400/50">
                                                                    <User className="h-5 w-5 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {user.email}
                                                            </div>
                                                            {user.profile?.username && (
                                                                <div className="text-xs text-cyan-400">
                                                                    @{user.profile.username}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-900/30 text-purple-300 border-purple-500/50' 
                                                            : 'bg-green-900/30 text-green-300 border-green-500/50'
                                                    }`}>
                                                        {user.role === 'admin' ? 'ADMIN' : 'PLAYER'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {user.email_verified_at ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                                                                <span className="text-sm text-green-300 font-medium">
                                                                    {user.status === 'active' ? 'ACTIVE' : user.status.toUpperCase()}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 text-red-400 mr-2" />
                                                                <span className="text-sm text-red-300 font-medium">UNVERIFIED</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button 
                                                            title="View Player"
                                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            title="Edit Player"
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            title="Delete Player"
                                                            onClick={() => openDeleteModal(user)}
                                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <Pagination pagination={pagination} />
                        )}
                    </div>

                    {/* Add User Modal */}
                    {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w/full max-w-md shadow-2xl rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <UserPlus className="h-5 w-5 mr-2" />
                                ADD NEW PLAYER
                            </h3>
                            <button
                                onClick={closeAddModal}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddSubmit} className="space-y-4" autoComplete="off">
                            <input type="text" name="fake-username" className="sr-only" tabIndex={-1} aria-hidden="true" />
                            <input type="password" name="fake-password" className="sr-only" tabIndex={-1} aria-hidden="true" />

                            <div>
                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                USER NAME
                                </label>
                                <input
                                type="text"
                                value={addForm.name}
                                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                                    addFormErrors.name 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
                                }`}
                                placeholder="Enter player's username"
                                required
                                autoComplete="off"
                                autoCapitalize="words"
                                spellCheck={false}
                                />
                                {addFormErrors.name && <p className="mt-1 text-sm text-red-400">{addFormErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                EMAIL ADDRESS
                                </label>
                                <input
                                type="email"
                                name="email_new"            
                                value={addForm.email}
                                onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                                    addFormErrors.email 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
                                }`}
                                placeholder="Enter player's email"
                                required
                                autoComplete="off"           
                                autoCorrect="off"
                                autoCapitalize="none"
                                inputMode="email"
                                spellCheck={false}
                                />
                                {addFormErrors.email && <p className="mt-1 text-sm text-red-400">{addFormErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                PASSWORD
                                </label>
                                <input
                                type="password"
                                name="new-password"           
                                value={addForm.password}
                                onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                                    addFormErrors.password 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
                                }`}
                                placeholder="Minimum 8 characters"
                                required
                                autoComplete="new-password"   
                                spellCheck={false}
                                />
                                {addFormErrors.password && <p className="mt-1 text-sm text-red-400">{addFormErrors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                CONFIRM PASSWORD
                                </label>
                                <input
                                type="password"
                                name="new-password-confirm"
                                value={addForm.password_confirmation}
                                onChange={(e) => setAddForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                                    addFormErrors.password_confirmation 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
                                }`}
                                placeholder="Re-enter password"
                                required
                                autoComplete="new-password"
                                spellCheck={false}
                                />
                                {addFormErrors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-400">{addFormErrors.password_confirmation}</p>
                                )}
                            </div>

                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                    ROLE
                                                </label>
                                                <select
                                                    value={addForm.role}
                                                    onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'participant' }))}
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                >
                                                    <option value="participant">PARTICIPANT</option>
                                                    <option value="admin">ADMINISTRATOR</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                    STATUS
                                                </label>
                                                <select
                                                    value={addForm.status}
                                                    onChange={(e) => setAddForm(prev => ({ ...prev, status: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                >
                                                    <option value="active">ACTIVE</option>
                                                    <option value="inactive">INACTIVE</option>
                                                    <option value="suspended">SUSPENDED</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={closeAddModal}
                                                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium"
                                                disabled={addLoading}
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={addLoading}
                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg"
                                            >
                                                {addLoading ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <UserPlus className="h-4 w-4" />
                                                )}
                                                <span>{addLoading ? 'CREATING...' : 'CREATE PLAYER'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit User Modal */}
                    {showEditModal && selectedUser && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Edit className="h-5 w-5 mr-2" />
                                            EDIT PLAYER
                                        </h3>
                                        <button
                                            onClick={closeEditModal}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                NAME
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                EMAIL
                                            </label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                ROLE
                                            </label>
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'participant' }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                            >
                                                <option value="participant">PARTICIPANT</option>
                                                <option value="admin">ADMINISTRATOR</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">
                                                STATUS
                                            </label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                                            >
                                                <option value="active">ACTIVE</option>
                                                <option value="inactive">INACTIVE</option>
                                                <option value="suspended">SUSPENDED</option>
                                            </select>
                                        </div>
                                        
                                        <div className="flex items-center justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={closeEditModal}
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

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && selectedUser && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                            <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <AlertCircle className="h-5 w-5 mr-2" />
                                            CONFIRM DELETE
                                        </h3>
                                        <button
                                            onClick={closeDeleteModal}
                                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center mb-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-cyan-400/50 mr-4">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{selectedUser.name}</p>
                                                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-300 mb-3">
                                            Are you sure you want to delete this player?
                                        </p>
                                        <p className="text-sm text-gray-400 mb-4">
                                            This action cannot be undone. All player data and associated records will be permanently removed.
                                        </p>
                                        
                                        {selectedUser.role === 'admin' && (
                                            <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg backdrop-blur-sm">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                                                    <p className="text-sm text-yellow-300">
                                                        <strong>Warning:</strong> You are about to delete an administrator account.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeDeleteModal}
                                            className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium"
                                            disabled={deleteLoading}
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={handleConfirmDelete}
                                            disabled={deleteLoading}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg"
                                        >
                                            {deleteLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                            <span>{deleteLoading ? 'DELETING...' : 'DELETE'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </div>
    );
}