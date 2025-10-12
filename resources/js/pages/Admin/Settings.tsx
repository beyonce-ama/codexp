// resources/js/Pages/Admin/Settings.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Settings, Save, RefreshCw, Shield, Database,
    Clock, Globe, Mail, Server, Code, Users,
    Bell, Lock, Eye, EyeOff, AlertTriangle,
    CheckCircle, Zap, Monitor, Palette, Key
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/dashboard' },
    { title: 'Admin', href: '/dashboard' },
    { title: 'System Settings', href: '/admin/settings' }
];

interface SystemSettings {
    // General Settings
    site_name: string;
    site_description: string;
    site_url: string;
    admin_email: string;
    timezone: string;
    
    // Platform Settings
    registration_enabled: boolean;
    email_verification_required: boolean;
    maintenance_mode: boolean;
    max_users: number;
    
    // Challenge Settings
    default_time_limit: number;
    max_attempts_per_challenge: number;
    supported_languages: string[];
    difficulty_levels: string[];
    
    // Security Settings
    session_timeout: number;
    password_min_length: number;
    two_factor_enabled: boolean;
    api_rate_limit: number;
    
    // Notification Settings
    email_notifications: boolean;
    admin_notifications: boolean;
    welcome_email: boolean;
    
    // System Info
    version: string;
    last_backup: string;
    storage_used: number;
    storage_limit: number;
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<SystemSettings>({
        // General Settings
        site_name: 'CodeChallenge Pro',
        site_description: 'Professional coding challenge platform',
        site_url: 'https://codechallenge.pro',
        admin_email: 'admin@codechallenge.pro',
        timezone: 'UTC',
        
        // Platform Settings
        registration_enabled: true,
        email_verification_required: true,
        maintenance_mode: false,
        max_users: 1000,
        
        // Challenge Settings
        default_time_limit: 60,
        max_attempts_per_challenge: 5,
        supported_languages: ['python', 'java', 'cpp'],
        difficulty_levels: ['easy', 'medium', 'hard'],
        
        // Security Settings
        session_timeout: 120,
        password_min_length: 8,
        two_factor_enabled: false,
        api_rate_limit: 100,
        
        // Notification Settings
        email_notifications: true,
        admin_notifications: true,
        welcome_email: true,
        
        // System Info
        version: '2.1.0',
        last_backup: new Date().toISOString(),
        storage_used: 2.4,
        storage_limit: 10.0
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showApiKeys, setShowApiKeys] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // In a real app, you'd fetch from your settings API
            // For now, we'll use the default values
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            
            // In a real app, you'd save to your settings API
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            
            await Swal.fire({
                icon: 'success',
                title: 'Settings Saved',
                text: 'System settings have been updated successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text: 'An error occurred while saving settings.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            await Swal.fire({
                icon: 'info',
                title: 'Backup Started',
                text: 'System backup has been initiated. You will be notified when complete.',
                timer: 3000,
                showConfirmButton: false
            });
            
            // Update last backup time
            setSettings(prev => ({
                ...prev,
                last_backup: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    };

    const TabButton = ({ tabId, icon: Icon, label, isActive }: {
        tabId: string;
        icon: any;
        label: string;
        isActive: boolean;
    }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </button>
    );

    const SettingCard = ({ title, description, children }: {
        title: string;
        description?: string;
        children: React.ReactNode;
    }) => (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
            </div>
            {children}
        </div>
    );

    const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled = false }: {
        label: string;
        type?: string;
        value: any;
        onChange: (value: any) => void;
        placeholder?: string;
        disabled?: boolean;
    }) => (
        <div>
            <label className="block text-cyan-400 text-sm font-bold mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );

    const ToggleField = ({ label, description, value, onChange, disabled = false }: {
        label: string;
        description?: string;
        value: boolean;
        onChange: (value: boolean) => void;
        disabled?: boolean;
    }) => (
        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-600/50">
            <div>
                <label className="text-white font-medium">{label}</label>
                {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
            </div>
            <button
                onClick={() => !disabled && onChange(!value)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                    value ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <SettingCard title="Site Information" description="Basic information about your platform">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Site Name"
                        value={settings.site_name}
                        onChange={(value) => setSettings(prev => ({ ...prev, site_name: value }))}
                        placeholder="CodeChallenge Pro"
                    />
                    <InputField
                        label="Admin Email"
                        type="email"
                        value={settings.admin_email}
                        onChange={(value) => setSettings(prev => ({ ...prev, admin_email: value }))}
                        placeholder="you@example.com"
                    />
                    <div className="md:col-span-2">
                        <InputField
                            label="Site Description"
                            value={settings.site_description}
                            onChange={(value) => setSettings(prev => ({ ...prev, site_description: value }))}
                            placeholder="Professional coding challenge platform"
                        />
                    </div>
                    <InputField
                        label="Site URL"
                        value={settings.site_url}
                        onChange={(value) => setSettings(prev => ({ ...prev, site_url: value }))}
                        placeholder="https://example.com"
                    />
                    <div>
                        <label className="block text-cyan-400 text-sm font-bold mb-2">Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                    </div>
                </div>
            </SettingCard>

            <SettingCard title="Platform Configuration" description="Control platform behavior and limits">
                <div className="space-y-4">
                    <ToggleField
                        label="User Registration"
                        description="Allow new users to register on the platform"
                        value={settings.registration_enabled}
                        onChange={(value) => setSettings(prev => ({ ...prev, registration_enabled: value }))}
                    />
                    <ToggleField
                        label="Email Verification"
                        description="Require email verification for new accounts"
                        value={settings.email_verification_required}
                        onChange={(value) => setSettings(prev => ({ ...prev, email_verification_required: value }))}
                    />
                    <ToggleField
                        label="Maintenance Mode"
                        description="Put the platform in maintenance mode"
                        value={settings.maintenance_mode}
                        onChange={(value) => setSettings(prev => ({ ...prev, maintenance_mode: value }))}
                    />
                    <InputField
                        label="Maximum Users"
                        type="number"
                        value={settings.max_users}
                        onChange={(value) => setSettings(prev => ({ ...prev, max_users: value }))}
                        placeholder="1000"
                    />
                </div>
            </SettingCard>
        </div>
    );

    const renderChallengeSettings = () => (
        <div className="space-y-6">
            <SettingCard title="Challenge Configuration" description="Set default challenge parameters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Default Time Limit (minutes)"
                        type="number"
                        value={settings.default_time_limit}
                        onChange={(value) => setSettings(prev => ({ ...prev, default_time_limit: value }))}
                        placeholder="60"
                    />
                    <InputField
                        label="Max Attempts per Challenge"
                        type="number"
                        value={settings.max_attempts_per_challenge}
                        onChange={(value) => setSettings(prev => ({ ...prev, max_attempts_per_challenge: value }))}
                        placeholder="5"
                    />
                </div>
            </SettingCard>

            <SettingCard title="Supported Languages" description="Programming languages available on the platform">
                <div className="space-y-4">
                    {['Python', 'Java', 'C++'].map(lang => (
                        <ToggleField
                            key={lang}
                            label={lang}
                            value={settings.supported_languages.includes(lang.toLowerCase())}
                            onChange={(value) => {
                                const langLower = lang.toLowerCase();
                                setSettings(prev => ({
                                    ...prev,
                                    supported_languages: value
                                        ? [...prev.supported_languages, langLower]
                                        : prev.supported_languages.filter(l => l !== langLower)
                                }));
                            }}
                        />
                    ))}
                </div>
            </SettingCard>

            <SettingCard title="Difficulty Levels" description="Available difficulty levels for challenges">
                <div className="space-y-4">
                    {['Easy', 'Medium', 'Hard', 'Expert'].map(level => (
                        <ToggleField
                            key={level}
                            label={level}
                            value={settings.difficulty_levels.includes(level.toLowerCase())}
                            onChange={(value) => {
                                const levelLower = level.toLowerCase();
                                setSettings(prev => ({
                                    ...prev,
                                    difficulty_levels: value
                                        ? [...prev.difficulty_levels, levelLower]
                                        : prev.difficulty_levels.filter(l => l !== levelLower)
                                }));
                            }}
                        />
                    ))}
                </div>
            </SettingCard>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <SettingCard title="Authentication & Security" description="Security and authentication settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Session Timeout (minutes)"
                        type="number"
                        value={settings.session_timeout}
                        onChange={(value) => setSettings(prev => ({ ...prev, session_timeout: value }))}
                        placeholder="120"
                    />
                    <InputField
                        label="Minimum Password Length"
                        type="number"
                        value={settings.password_min_length}
                        onChange={(value) => setSettings(prev => ({ ...prev, password_min_length: value }))}
                        placeholder="8"
                    />
                    <InputField
                        label="API Rate Limit (requests/hour)"
                        type="number"
                        value={settings.api_rate_limit}
                        onChange={(value) => setSettings(prev => ({ ...prev, api_rate_limit: value }))}
                        placeholder="100"
                    />
                </div>
                <div className="mt-4">
                    <ToggleField
                        label="Two-Factor Authentication"
                        description="Enable 2FA for all admin accounts"
                        value={settings.two_factor_enabled}
                        onChange={(value) => setSettings(prev => ({ ...prev, two_factor_enabled: value }))}
                    />
                </div>
            </SettingCard>

            <SettingCard title="API Keys" description="Manage system API keys">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-600/50">
                        <div>
                            <label className="text-white font-medium">Judge Service API Key</label>
                            <p className="text-sm text-gray-400 mt-1">Used for code execution and evaluation</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400 font-mono text-sm">
                                {showApiKeys ? 'sk_live_1234567890abcdef' : '••••••••••••••••'}
                            </span>
                            <button
                                onClick={() => setShowApiKeys(!showApiKeys)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-600/50">
                        <div>
                            <label className="text-white font-medium">Email Service API Key</label>
                            <p className="text-sm text-gray-400 mt-1">Used for sending notification emails</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400 font-mono text-sm">
                                {showApiKeys ? 'sk_email_abcdef1234567890' : '••••••••••••••••'}
                            </span>
                            <button
                                onClick={() => setShowApiKeys(!showApiKeys)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </SettingCard>
        </div>
    );

    const renderSystemSettings = () => (
        <div className="space-y-6">
            <SettingCard title="Notifications" description="Configure system notifications">
                <div className="space-y-4">
                    <ToggleField
                        label="Email Notifications"
                        description="Send email notifications to users"
                        value={settings.email_notifications}
                        onChange={(value) => setSettings(prev => ({ ...prev, email_notifications: value }))}
                    />
                    <ToggleField
                        label="Admin Notifications"
                        description="Send notifications to administrators"
                        value={settings.admin_notifications}
                        onChange={(value) => setSettings(prev => ({ ...prev, admin_notifications: value }))}
                    />
                    <ToggleField
                        label="Welcome Email"
                        description="Send welcome email to new users"
                        value={settings.welcome_email}
                        onChange={(value) => setSettings(prev => ({ ...prev, welcome_email: value }))}
                    />
                </div>
            </SettingCard>

            <SettingCard title="System Information" description="Current system status and information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Platform Version</span>
                                <span className="text-white font-medium">{settings.version}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Last Backup</span>
                                <span className="text-white font-medium">
                                    {new Date(settings.last_backup).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Storage Used</span>
                                <span className="text-white font-medium">
                                    {settings.storage_used}GB / {settings.storage_limit}GB
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">System Status</span>
                                <div className="flex items-center text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span className="font-medium">Operational</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Database Status</span>
                                <div className="flex items-center text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span className="font-medium">Connected</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Cache Status</span>
                                <div className="flex items-center text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span className="font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Storage Usage Bar */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Storage Usage</span>
                        <span className="text-gray-400 text-sm">
                            {Math.round((settings.storage_used / settings.storage_limit) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.round((settings.storage_used / settings.storage_limit) * 100)}%` }}
                        />
                    </div>
                </div>
            </SettingCard>

            <SettingCard title="System Actions" description="Perform system maintenance tasks">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={handleBackup}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                    >
                        <Database className="h-5 w-5" />
                        <span>Create Backup</span>
                    </button>
                    <button
                        onClick={() => {
                            Swal.fire('Cache Cleared', 'System cache has been cleared successfully.', 'success');
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                    >
                        <RefreshCw className="h-5 w-5" />
                        <span>Clear Cache</span>
                    </button>
                    <button
                        onClick={() => {
                            Swal.fire('Logs Exported', 'System logs have been exported successfully.', 'success');
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
                    >
                        <Monitor className="h-5 w-5" />
                        <span>Export Logs</span>
                    </button>
                </div>
            </SettingCard>
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
                <Head title="System Settings" />
                <div className="flex flex-col gap-6 p-4 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Settings className="h-8 w-8 text-cyan-400" />
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    SYSTEM SETTINGS
                                </h1>
                                <p className="text-gray-400 text-sm">Configure platform settings and preferences</p>
                            </div>
                        </div>
                        <form onSubmit={saveSettings} className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={fetchSettings}
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Reset</span>
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap gap-2">
                        <TabButton tabId="general" icon={Globe} label="General" isActive={activeTab === 'general'} />
                        <TabButton tabId="challenges" icon={Code} label="Challenges" isActive={activeTab === 'challenges'} />
                        <TabButton tabId="security" icon={Shield} label="Security" isActive={activeTab === 'security'} />
                        <TabButton tabId="system" icon={Server} label="System" isActive={activeTab === 'system'} />
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[500px]">
                        {activeTab === 'general' && renderGeneralSettings()}
                        {activeTab === 'challenges' && renderChallengeSettings()}
                        {activeTab === 'security' && renderSecuritySettings()}
                        {activeTab === 'system' && renderSystemSettings()}
                    </div>
                </div>
            </AppLayout>
        </div>
    );
}