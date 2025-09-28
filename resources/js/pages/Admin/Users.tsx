// resources/js/Pages/Admin/Users.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, Eye,
  UserPlus, Shield, User, CheckCircle, XCircle,
  AlertCircle, RefreshCw, X, Save, Code,
  Grid as GridIcon, Table as TableIcon
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Admin', href: '/dashboard' },
  { title: 'User Management', href: '/admin/users' }
];

interface UserRow {
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
  data: UserRow[];
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

/* ---------------- Small UI helpers ---------------- */
const RoleBadge = ({ role }: { role: 'admin' | 'participant' }) => (
  <span
    className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border ${
      role === 'admin'
        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    }`}
  >
    {role === 'admin' ? 'ADMIN' : 'PLAYER'}
  </span>
);

const StatusBadge = ({ verified, status }: { verified: boolean; status: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
      verified
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    }`}
    title={verified ? status.toUpperCase() : 'UNVERIFIED'}
  >
    {verified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {verified ? (status === 'active' ? 'ACTIVE' : status.toUpperCase()) : 'UNVERIFIED'}
  </span>
);

const Avatar = ({ name, url }: { name: string; url?: string | null }) => {
  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  return url ? (
    <img
      className="h-10 w-10 rounded-full object-cover border-2 border-cyan-400/40"
      src={url}
      alt={name}
    />
  ) : (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-cyan-400/40 text-white text-xs font-bold">
      {getInitials(name)}
    </div>
  );
};

export default function AdminUsers() {
  // data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // layout toggle (NEW)
  const [layout, setLayout] = useState<'cards' | 'table'>('cards');

  // modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // forms
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'participant' as 'admin' | 'participant',
    status: 'active',
  });

  const [addForm, setAddForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'participant',
    status: 'active',
  });

  const [addFormErrors, setAddFormErrors] = useState<Partial<CreateUserForm>>({});

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, currentPage]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err) {
      console.error('Error fetching users:', err);
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
        // fallback stats from current users (best-effort)
        const total = users.length;
        const admins = users.filter((u) => u.role === 'admin').length;
        const participants = users.filter((u) => u.role === 'participant').length;
        setStats({
          users_total: total,
          total_users: total,
          admins,
          admin_users: admins,
          participants,
          participant_users: participants,
        });
      }
    } catch (err) {
      console.warn('Stats error, deriving from list:', err);
      const total = users.length;
      const admins = users.filter((u) => u.role === 'admin').length;
      const participants = users.filter((u) => u.role === 'participant').length;
      setStats({
        users_total: total,
        total_users: total,
        admins,
        admin_users: admins,
        participants,
        participant_users: participants,
      });
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  // add modal
  const openAddModal = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'participant',
      status: 'active',
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
      status: 'active',
    });
    setAddFormErrors({});
  };

  // edit modal
  const openEditModal = (user: UserRow) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
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
      status: 'active',
    });
  };

  // delete modal
  const openDeleteModal = (user: UserRow) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // add validations
  const validateAddForm = (): boolean => {
    const errors: Partial<CreateUserForm> = {};
    if (!addForm.name.trim()) errors.name = 'Name is required';
    else if (addForm.name.length < 2) errors.name = 'Name must be at least 2 characters';
    if (!addForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) errors.email = 'Please enter a valid email address';
    if (!addForm.password) errors.password = 'Password is required';
    else if (addForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!addForm.password_confirmation) errors.password_confirmation = 'Password confirmation is required';
    else if (addForm.password !== addForm.password_confirmation)
      errors.password_confirmation = 'Passwords do not match';
    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;
    try {
      setAddLoading(true);
      const response = await apiClient.post('/api/users', addForm);
      if (response.success) {
        if (response.data) setUsers((prev) => [response.data, ...prev]);
        closeAddModal();
        fetchStats();
        await Swal.fire({
          icon: 'success',
          title: 'Player Created',
          text: 'New player has been successfully created.',
          timer: 1800,
          showConfirmButton: false,
        });
        fetchUsers();
      } else {
        if (response.errors) setAddFormErrors(response.errors);
        else {
          await Swal.fire({ icon: 'error', title: 'Creation Failed', text: response.message || 'Failed to create user.' });
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
      await Swal.fire({ icon: 'error', title: 'Network Error', text: 'An error occurred while creating the user.' });
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
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u)));
        closeEditModal();
        fetchStats();
        await Swal.fire({
          icon: 'success',
          title: 'User Updated',
          text: 'Player details have been successfully updated.',
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({ icon: 'error', title: 'Update Failed', text: response.message || 'Failed to update user.' });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      await Swal.fire({ icon: 'error', title: 'Network Error', text: 'An error occurred while updating the user.' });
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
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        closeDeleteModal();
        fetchStats();
        await Swal.fire({
          icon: 'success',
          title: 'User Deleted',
          text: 'The player has been successfully deleted.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({ icon: 'error', title: 'Delete Failed', text: response.message || 'Failed to delete user.' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      await Swal.fire({ icon: 'error', title: 'Network Error', text: 'An error occurred while deleting the user.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  /* -------- Stats tile (same data, new look) -------- */
  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number;
    icon: any;
  }) => (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 ring-1 ring-white/10 hover:ring-white/20 transition">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/10 border border-white/10">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/60">{title}</p>
          <p className="text-2xl font-bold text-white leading-none">{value || 0}</p>
        </div>
      </div>
    </div>
  );

  const Pagination = ({ pagination }: { pagination: PaginationInfo }) => {
    const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
    return (
      <div className="px-6 py-4 flex items-center justify-between border-t border-white/10 bg-white/5">
        <div className="hidden sm:block text-sm text-white/70">
          Showing{' '}
          <span className="font-semibold text-cyan-300">
            {(pagination.current_page - 1) * pagination.per_page + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-cyan-300">
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
          </span>{' '}
          of <span className="font-semibold text-cyan-300">{pagination.total}</span>
        </div>
        <div className="inline-flex rounded-md border border-white/10 overflow-hidden">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
            className="px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:bg-white/10"
          >
            Prev
          </button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-2 text-sm ${
                p === pagination.current_page
                  ? 'bg-cyan-500/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page}
            className="px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // derived
  const visibleCount = useMemo(() => (loading ? '—' : users.length), [loading, users.length]);

  /* -------- Cards view (NEW) -------- */
  const CardGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {users.map((u) => {
        const verified = !!u.email_verified_at;
        return (
          <div key={u.id} className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} url={u.profile?.avatar_url ?? null} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                    <div className="text-xs text-white/70 truncate">{u.email}</div>
                    {u.profile?.username && (
                      <div className="text-[11px] text-cyan-300 truncate">@{u.profile.username}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-white/60 whitespace-nowrap">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={u.role} />
                <StatusBadge verified={verified} status={u.status} />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1.5 rounded-md text-blue-300 hover:text-white hover:bg-blue-500/20 transition inline-flex items-center gap-1"
                    title="View"
                    onClick={() => Swal.fire({ icon: 'info', title: 'View', text: 'Hook up view route/action if needed.' })}
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button
                    className="px-2 py-1.5 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition inline-flex items-center gap-1"
                    title="Edit"
                    onClick={() => openEditModal(u)}
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-2 rounded-md text-rose-300 hover:text-white hover:bg-rose-500/20 transition"
                    title="Delete"
                    onClick={() => openDeleteModal(u)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* -------- Table view (kept, polished) -------- */
  const TableView = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-950/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Player</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/70">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                    Loading players…
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/60">
                  {error ? 'Failed to load players' : 'No players found'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const verified = !!u.email_verified_at;
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} url={u.profile?.avatar_url ?? null} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                          <div className="text-xs text-white/70 truncate">{u.email}</div>
                          {u.profile?.username && (
                            <div className="text-[11px] text-cyan-300 truncate">@{u.profile.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4"><StatusBadge verified={verified} status={u.status} /></td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {new Date(u.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          title="View Player"
                          className="p-2 text-blue-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition"
                          onClick={() => Swal.fire({ icon: 'info', title: 'View', text: 'Hook up view route/action if needed.' })}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit Player"
                          onClick={() => openEditModal(u)}
                          className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-500/20 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete Player"
                          onClick={() => openDeleteModal(u)}
                          className="p-2 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-lg transition"
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
      {pagination && pagination.last_page > 1 && <Pagination pagination={pagination} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="User Management" />
        <div className="p-4 space-y-6">
          {/* Hero header */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 p-4 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">User Management</h1>
                  <p className="text-white/80 text-sm">Manage players and administrators</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <span className="px-2.5 py-1 text-[11px] rounded-md border bg-white/5 border-white/10 text-white/80">
                  {visibleCount} visible
                </span>
                {stats && (
                  <>
                    <span className="px-2.5 py-1 text-[11px] rounded-md border bg-blue-500/10 border-blue-500/30 text-blue-300">
                      {(stats.users_total ?? stats.total_users) || 0} total
                    </span>
                    <span className="px-2.5 py-1 text-[11px] rounded-md border bg-purple-500/10 border-purple-500/30 text-purple-300">
                      {(stats.admins ?? stats.admin_users) || 0} admins
                    </span>
                    <span className="px-2.5 py-1 text-[11px] rounded-md border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
                      {(stats.participants ?? stats.participant_users) || 0} players
                    </span>
                  </>
                )} */}
               
                {/* Layout toggle */}
                <div className="inline-flex rounded-lg border border-white/10 overflow-hidden bg-white/5">
                  <button
                    onClick={() => setLayout('cards')}
                    className={`px-3 py-2 flex items-center gap-1 ${
                      layout === 'cards' ? 'bg-cyan-500/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Card Grid"
                  >
                    <GridIcon className="h-4 w-4" /> Cards
                  </button>
                  <button
                    onClick={() => setLayout('table')}
                    className={`px-3 py-2 flex items-center gap-1 ${
                      layout === 'table' ? 'bg-cyan-500/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Table"
                  >
                    <TableIcon className="h-4 w-4" /> Table
                  </button>
                </div> 
                <div className="mx-2 h-6 w-px bg-white/15" />
                {/* <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button> */}
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Player
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard title="Total Players" value={stats.users_total || stats.total_users || 0} icon={Users} />
              <StatCard title="Administrators" value={stats.admins || stats.admin_users || 0} icon={Shield} />
              <StatCard title="Participants" value={stats.participants || stats.participant_users || 0} icon={User} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search players by name or email…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-white/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="participant">Participants</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {layout === 'cards' ? <CardGrid /> : <TableView />}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto z-50 flex items-center justify-center p-4">
              <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-md rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      ADD NEW PLAYER
                    </h3>
                    <button
                      onClick={closeAddModal}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1"
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
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">USER NAME</label>
                      <input
                        type="text"
                        value={addForm.name}
                        onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                          addFormErrors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-cyan-500'
                        }`}
                        placeholder="Enter player's username"
                        required
                        autoCapitalize="words"
                        spellCheck={false}
                      />
                      {addFormErrors.name && <p className="mt-1 text-sm text-red-400">{addFormErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                          addFormErrors.email
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-cyan-500'
                        }`}
                        placeholder="Enter player's email"
                        required
                        autoCorrect="off"
                        autoCapitalize="none"
                        inputMode="email"
                        spellCheck={false}
                      />
                      {addFormErrors.email && <p className="mt-1 text-sm text-red-400">{addFormErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">PASSWORD</label>
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                          addFormErrors.password
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-cyan-500'
                        }`}
                        placeholder="Minimum 8 characters"
                        required
                        autoComplete="new-password"
                        spellCheck={false}
                      />
                      {addFormErrors.password && <p className="mt-1 text-sm text-red-400">{addFormErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">CONFIRM PASSWORD</label>
                      <input
                        type="password"
                        value={addForm.password_confirmation}
                        onChange={(e) => setAddForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 text-gray-200 ${
                          addFormErrors.password_confirmation
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-cyan-500'
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
                        <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">ROLE</label>
                        <select
                          value={addForm.role}
                          onChange={(e) =>
                            setAddForm((p) => ({ ...p, role: e.target.value as 'admin' | 'participant' }))
                          }
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                        >
                          <option value="participant">PARTICIPANT</option>
                          <option value="admin">ADMINISTRATOR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">STATUS</label>
                        <select
                          value={addForm.status}
                          onChange={(e) => setAddForm((p) => ({ ...p, status: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                        >
                          <option value="active">ACTIVE</option>
                          <option value="inactive">INACTIVE</option>
                          <option value="suspended">SUSPENDED</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeAddModal}
                        className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50"
                        disabled={addLoading}
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={addLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                      >
                        {addLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        <span>{addLoading ? 'CREATING…' : 'CREATE PLAYER'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto z-50 flex items-center justify-center p-4">
              <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-md rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Edit className="h-5 w-5 mr-2" />
                      EDIT PLAYER
                    </h3>
                    <button
                      onClick={closeEditModal}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">NAME</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">EMAIL</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">ROLE</label>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, role: e.target.value as 'admin' | 'participant' }))
                        }
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                      >
                        <option value="participant">PARTICIPANT</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase">STATUS</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200"
                      >
                        <option value="active">ACTIVE</option>
                        <option value="inactive">INACTIVE</option>
                        <option value="suspended">SUSPENDED</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50"
                        disabled={editLoading}
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                      >
                        {editLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>{editLoading ? 'UPDATING…' : 'UPDATE'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto z-50 flex items-center justify-center p-4">
              <div className="relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-md rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      CONFIRM DELETE
                    </h3>
                    <button
                      onClick={closeDeleteModal}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <Avatar name={selectedUser.name} url={selectedUser.profile?.avatar_url ?? null} />
                      <div className="ml-3">
                        <p className="text-white font-medium">{selectedUser.name}</p>
                        <p className="text-white/70 text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    <p className="text-white/90 mb-2">Are you sure you want to delete this player?</p>
                    <p className="text-sm text-white/70 mb-4">
                      This action cannot be undone. All player data and associated records will be permanently removed.
                    </p>
                    {selectedUser.role === 'admin' && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-200 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span><strong>Warning:</strong> You are about to delete an administrator account.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50"
                      disabled={deleteLoading}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={deleteLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 disabled:opacity-50"
                    >
                      {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span>{deleteLoading ? 'DELETING…' : 'DELETE'}</span>
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
