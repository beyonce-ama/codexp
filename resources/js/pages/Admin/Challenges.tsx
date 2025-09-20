// resources/js/Pages/Admin/Challenges.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
  Code, Plus, Upload, Edit, Trash2,
  Eye, Download, AlertTriangle, Zap, Target, Swords,
  RefreshCw, X, Search
} from 'lucide-react';
import { apiClient } from '@/utils/api';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Admin', href: '/dashboard' },
  { title: 'Challenge Management', href: '/admin/challenges' }
];
import { withTheme, svgCircle } from '@/utils/swalTheme';

interface Challenge {
  id: number;
  title: string;
  language: 'python' | 'java';
  difficulty: 'easy' | 'medium' | 'hard';
  mode?: 'fixbugs' | 'random';
  type: 'solo' | '1v1';
  description: string | null;
  source_file: string | null;
  created_at: string;
}

interface ChallengeStats {
  total_solo_challenges: number;
  total_1v1_challenges: number;
  fixbugs_challenges: number;
  random_challenges: number;
}

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'solo' | '1v1'>('solo');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'fixbugs' | 'random'>('fixbugs');
  const [importLanguage, setImportLanguage] = useState<'python' | 'java'>('python');
  const [importDifficulty, setImportDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [importItems, setImportItems] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchChallenges();
    fetchStats();
  }, [activeTab, searchTerm, languageFilter, difficultyFilter]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'solo' ? '/api/challenges/solo' : '/api/challenges/1v1';
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (languageFilter !== 'all') params.language = languageFilter;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;

      const response = await apiClient.get(endpoint, params);
      if (response.success) {
        const challengeData = response.data.data || response.data || [];
        setChallenges(challengeData.map((c: any) => ({ ...c, type: activeTab })));
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      if (response.success) {
        setStats({
          total_solo_challenges: response.data.total_solo_challenges || 0,
          total_1v1_challenges: response.data.total_1v1_challenges || 0,
          fixbugs_challenges: response.data.fixbugs_challenges || 0,
          random_challenges: response.data.random_challenges || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteChallenge = async (challengeId: number) => {
    const result = await Swal.fire({
      title: 'Delete Challenge?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const endpoint = activeTab === 'solo'
        ? `/api/challenges/solo/${challengeId}`
        : `/api/challenges/1v1/${challengeId}`;

      const response = await apiClient.delete(endpoint);
      if (response.success) {
        setChallenges(challenges.filter(c => c.id !== challengeId));
        fetchStats();
        Swal.fire('Deleted!', 'Challenge has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.json')) {
      Swal.fire('Invalid File Type', 'Please select a JSON file (.json)', 'error');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('File Too Large', 'File size must be less than 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          if (json.length === 0) {
            Swal.fire('Empty File', 'The JSON file contains no challenges.', 'warning');
            return;
          }
          if (json.length > 1000) {
            Swal.fire('Too Many Items', 'Maximum 1000 challenges can be imported at once.', 'error');
            return;
          }
          setImportItems(json);
          Swal.fire({
            icon: 'success',
            title: 'File Loaded',
            text: `Successfully loaded ${json.length} challenges from ${file.name}`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire('Invalid Format', 'File must contain an array of challenges.', 'error');
        }
      } catch (err) {
        console.error('JSON parse error:', err);
        Swal.fire('Invalid JSON', 'Unable to parse JSON file. Please check the file format.', 'error');
      }
    };
    reader.onerror = () => {
      Swal.fire('File Read Error', 'Unable to read the file.', 'error');
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (importItems.length === 0) {
      Swal.fire('No Data', 'Please upload a JSON file or paste valid challenge array.', 'error');
      return;
    }
    try {
      setImportLoading(true);
      const endpoint = activeTab === 'solo'
        ? '/api/challenges/solo/import'
        : '/api/challenges/1v1/import';

      const payload = activeTab === 'solo' ? {
        mode: importMode,
        language: importLanguage,
        difficulty: importDifficulty,
        items: importItems,
        source_file: 'manual_import'
      } : {
        language: importLanguage,
        difficulty: importDifficulty,
        items: importItems,
        source_file: 'manual_import'
      };

      console.log('Importing to:', endpoint, 'with payload:', payload);

      const response = await apiClient.post(endpoint, payload);
      console.log('Import response:', response);
      
      if (response.success) {
        setShowImportModal(false);
        setImportItems([]);
        fetchChallenges();
        fetchStats();
        Swal.fire({
          icon: 'success',
          title: 'Import Successful!',
          text: `Successfully imported ${response.count || importItems.length} challenges.`,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: response.message || 'Unknown error occurred during import.',
          footer: response.errors ? `Details: ${JSON.stringify(response.errors)}` : ''
        });
      }
    } catch (error) {
      console.error('Error importing challenges:', error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'An error occurred while importing challenges. Please check your connection and try again.',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const openImportModal = () => {
    setImportItems([]);
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportItems([]);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/30 text-green-300 border border-green-500/50';
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50';
      case 'hard': return 'bg-red-900/30 text-red-300 border border-red-500/50';
      default: return 'bg-gray-700/30 text-gray-300 border border-gray-500/50';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'fixbugs': return AlertTriangle;
      case 'random': return Zap;
      default: return Code;
    }
  };
// 2) Add these helpers & handlers inside the component
const adminBase = activeTab === 'solo' ? '/admin/challenges/solo' : '/admin/challenges/1v1';

const handleCreate = () => {
  router.visit(`${adminBase}/create`);
};

const handleView = (challengeId: number) => {
  router.visit(`${adminBase}/${challengeId}`);
};

const handleEdit = (challengeId: number) => {
  router.visit(`${adminBase}/${challengeId}/edit`);
};

const handleDownload = (challengeId: number) => {
  // simplest approach: hit an export route that returns a file
  const endpoint = activeTab === 'solo'
    ? `/admin/challenges/solo/${challengeId}/export`
    : `/admin/challenges/1v1/${challengeId}/export`;
  window.open(endpoint, '_blank');
};
// Which type is active? Prefer the server-provided `activeType` if present
const { props }: any = usePage();
const serverActiveType: 'solo' | '1v1' | undefined = props?.activeType;
// Safer esc (also escapes quotes used inside attributes)
const esc = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ---- VIEW MODAL ------------------------------------------------------------
const openViewModal = (c: any) => {
  const chip = (label: string, value: string) => `
    <span class="neo-pill">
      <span class="text-[10px] uppercase tracking-wide opacity-70">${esc(label)}</span>
      <span class="font-semibold">${esc(value)}</span>
    </span>`;

  const codeBlock = (label: string, code: string) => {
    const id = `code_${Math.random().toString(36).slice(2)}`;
    return `
      <div class="neo-card">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] uppercase tracking-wide opacity-70">${esc(label)}</div>
          <button type="button" class="neo-copy px-2 py-1 text-xs rounded-md border border-cyan-500/30 hover:bg-cyan-500/10 transition" data-target="${id}">
            Copy
          </button>
        </div>
        <pre id="${id}" class="text-[12px] overflow-auto rounded-lg bg-slate-950/70 border border-cyan-500/30 p-3 max-h-72 leading-[1.35]"><code>${esc(code)}</code></pre>
      </div>`;
  };

  Swal.fire(withTheme({
    title: '',
    width: 900,
    html: `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="swal-title-neo text-xl md:text-2xl">${esc(c.title)}</h2>
            <div class="text-xs opacity-70">Created ${new Date(c.created_at ?? Date.now()).toLocaleString()}</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          ${c.language ? chip('Language', (c.language+'').toUpperCase()) : ''}
          ${c.difficulty ? chip('Difficulty', (c.difficulty+'').toUpperCase()) : ''}
          ${c.mode ? chip('Mode', c.mode) : ''}
          ${c.reward_xp !== undefined ? chip('XP', String(c.reward_xp)) : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div class="md:col-span-5">
            <div class="neo-card h-full">
              <div class="text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</div>
              <div class="text-sm leading-relaxed">${esc(c.description ?? '—')}</div>
            </div>
          </div>

          <div class="md:col-span-7 space-y-3">
            ${c.buggy_code ? codeBlock('Buggy Code', c.buggy_code) : ''}
            ${c.fixed_code ? codeBlock('Fixed Code', c.fixed_code) : ''}
            ${c.hint ? codeBlock('Hint', c.hint) : ''}
          </div>
        </div>
      </div>
    `,
    confirmButtonText: 'Close',
    didOpen: () => {
      // Copy buttons
      document.querySelectorAll<HTMLButtonElement>('.neo-copy').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-target')!;
          const txt = (document.getElementById(id)?.innerText ?? '');
          navigator.clipboard.writeText(txt);
          const old = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(() => (btn.textContent = old), 900);
        });
      });
    }
  }));
};

// ---- EDIT MODAL ------------------------------------------------------------
const openEditModal = (c: any, type: 'solo' | '1v1') => {
  const modeSolo = type === 'solo';

  Swal.fire(withTheme({
    title: 'Edit Challenge',
    width: 900,
    showCancelButton: true,
    confirmButtonText: 'Save',
    html: `
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Left column -->
        <div class="md:col-span-7 space-y-3">
          <div class="neo-card">
            <label for="f_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
            <input id="f_title" class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                   value="${esc(c.title)}" />
          </div>

          <div class="neo-card">
            <label for="f_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
            <textarea id="f_desc" rows="3"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              placeholder="Short description...">${esc(c.description ?? '')}</textarea>
          </div>

          <div class="neo-card">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="f_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
                <select id="f_lang"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="python" ${c.language==='python'?'selected':''}>Python</option>
                  <option value="java" ${c.language==='java'?'selected':''}>Java</option>
                </select>
              </div>
              <div>
                <label for="f_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
                <select id="f_diff"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="easy" ${c.difficulty==='easy'?'selected':''}>Easy</option>
                  <option value="medium" ${c.difficulty==='medium'?'selected':''}>Medium</option>
                  <option value="hard" ${c.difficulty==='hard'?'selected':''}>Hard</option>
                </select>
              </div>

              ${modeSolo ? `
              <div>
                <label for="f_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
                <select id="f_mode"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="fixbugs" ${c.mode==='fixbugs'?'selected':''}>Fix Bugs</option>
                </select>
              </div>
              <div>
                <label for="f_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
                <input id="f_reward" type="number" step="1" min="0"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  value="${esc(c.reward_xp ?? 0)}" />
              </div>` : ''}
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="md:col-span-5 space-y-3">
          <div class="neo-card">
            <label for="f_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
            <textarea id="f_bug" rows="7"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              placeholder="// buggy snippet here">${esc(c.buggy_code ?? '')}</textarea>
          </div>

          <div class="neo-card">
            <label for="f_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
            <textarea id="f_fix" rows="7"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              placeholder="// fixed snippet here">${esc(c.fixed_code ?? '')}</textarea>

            ${modeSolo ? `
              <label for="f_hint" class="block text-[10px] uppercase tracking-wide opacity-70 mt-3 mb-1">Hint</label>
              <textarea id="f_hint" rows="2"
                class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Small hint (optional)">${esc(c.hint ?? '')}</textarea>
            ` : ''}
          </div>
        </div>
      </div>
    `,
    preConfirm: () => {
      const val = (id: string) =>
        (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value?.trim() ?? '';

      const payload: any = {
        title: val('f_title'),
        description: val('f_desc'),
        language: val('f_lang'),
        difficulty: val('f_diff'),
        buggy_code: val('f_bug'),
        fixed_code: val('f_fix'),
      };

      if (modeSolo) {
        payload.mode = val('f_mode') || 'fixbugs';
        payload.hint = val('f_hint');
        const xp = Number((document.getElementById('f_reward') as HTMLInputElement)?.value || '0');
        payload.reward_xp = Number.isFinite(xp) && xp >= 0 ? Math.floor(xp) : 0;
      }

      if (!payload.title) {
        Swal.showValidationMessage('Title is required');
        return false as any;
      }
      return payload;
    }
  })).then(r => {
    if (r.isConfirmed) submitEdit(c.id, r.value, type);
  });
};

// ---- CREATE MODAL ----------------------------------------------------------
const openCreateModal = (type: 'solo' | '1v1') => {
  const modeSolo = type === 'solo';

  Swal.fire(withTheme({
    title: `Create ${modeSolo ? 'Solo' : '1v1'} Challenge`,
    width: 900,
    showCancelButton: true,
    confirmButtonText: 'Create',
    html: `
      ${svgCircle('✨')}

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Left column -->
        <div class="md:col-span-7 space-y-3">
          <div class="neo-card">
            <label for="c_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
            <input id="c_title" placeholder="Awesome challenge name"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60" />
          </div>

          <div class="neo-card">
            <label for="c_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
            <textarea id="c_desc" rows="3" placeholder="Short description..."
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"></textarea>
          </div>

          <div class="neo-card">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="c_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
                <select id="c_lang"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div>
                <label for="c_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
                <select id="c_diff"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              ${modeSolo ? `
              <div>
                <label for="c_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
                <select id="c_mode"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <option value="fixbugs">Fix Bugs</option>
                </select>
              </div>
              <div>
                <label for="c_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
                <input id="c_reward" type="number" step="1" min="0" value="0"
                  class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60" />
              </div>` : ''}
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="md:col-span-5 space-y-3">
          <div class="neo-card">
            <label for="c_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
            <textarea id="c_bug" rows="7" placeholder="// buggy snippet here"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35] focus:outline-none focus:ring-2 focus:ring-blue-500/60"></textarea>
          </div>

          <div class="neo-card">
            <label for="c_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
            <textarea id="c_fix" rows="7" placeholder="// fixed snippet here"
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35] focus:outline-none focus:ring-2 focus:ring-blue-500/60"></textarea>

            ${modeSolo ? `
              <label for="c_hint" class="block text-[10px] uppercase tracking-wide opacity-70 mt-3 mb-1">Hint</label>
              <textarea id="c_hint" rows="2" placeholder="Small hint (optional)"
                class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60"></textarea>
            ` : ''}
          </div>
        </div>
      </div>
    `,
    preConfirm: () => {
      const val = (id: string) =>
        (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value?.trim() ?? '';

      const payload: any = {
        title: val('c_title'),
        description: val('c_desc'),
        language: val('c_lang'),
        difficulty: val('c_diff'),
        buggy_code: val('c_bug'),
        fixed_code: val('c_fix'),
      };

      if (modeSolo) {
        payload.mode = val('c_mode') || 'fixbugs';
        payload.hint = val('c_hint');
        const xp = Number((document.getElementById('c_reward') as HTMLInputElement)?.value || '0');
        payload.reward_xp = Number.isFinite(xp) && xp >= 0 ? Math.floor(xp) : 0;
      }

      if (!payload.title) {
        Swal.showValidationMessage('Title is required');
        return false as any;
      }
      return payload;
    }
  })).then(r => {
    if (r.isConfirmed) submitCreate(r.value, type);
  });
};

const submitEdit = async (id: number, payload: any, type: 'solo' | '1v1') => {
  const base = type === 'solo' ? '/api/challenges/solo' : '/api/challenges/1v1';
  const res = await apiClient.put(`${base}/${id}`, payload);
  if (res?.success) {
    Swal.fire('Saved!', 'Challenge updated.', 'success');
    fetchChallenges();
  } else {
    Swal.fire('Error', res?.message || 'Update failed', 'error');
  }
};
const submitCreate = async (payload: any, type: 'solo' | '1v1') => {
  const base = type === 'solo' ? '/api/challenges/solo' : '/api/challenges/1v1';
  const res = await apiClient.post(base, payload);
  if (res?.success) {
    Swal.fire('Created!', 'Challenge created.', 'success');
    fetchChallenges();
  } else {
    Swal.fire('Error', res?.message || 'Create failed', 'error');
  }
};
useEffect(() => {
  const mode = props?.adminMode as ('view'|'edit'|'create'|undefined);
  const type: 'solo' | '1v1' = (serverActiveType || activeTab) as any;
  if (!mode) return;

  if (mode === 'view' && props?.challenge) {
    openViewModal(props.challenge);
  } else if (mode === 'edit' && props?.challenge) {
    openEditModal(props.challenge, type);
  } else if (mode === 'create') {
    openCreateModal(type);
  }
  // optional: clear the mode so back/refresh doesn’t re-open automatically
  // router.replace('/admin/challenges');
}, [props?.adminMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"></div>
      </div>
      
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Challenge Management" />
        <div className="flex flex-col gap-6 p-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  CHALLENGE MANAGEMENT
                </h1>
                <p className="text-gray-400 text-sm">Manage coding challenges and problem sets</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchChallenges()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={openImportModal}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Solo Challenges" value={stats.total_solo_challenges} icon={Target} color="bg-blue-500" />
              <StatCard title="1v1 Challenges" value={stats.total_1v1_challenges} icon={Swords} color="bg-red-500" />
              
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('solo')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'solo' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Target className="h-5 w-5" />
                <span className="font-medium">Solo Challenges</span>
                {stats && <span className="bg-black/20 px-2 py-1 rounded-full text-xs">{stats.total_solo_challenges}</span>}
              </button>
              <button
                onClick={() => setActiveTab('1v1')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === '1v1' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Swords className="h-5 w-5" />
                <span className="font-medium">1v1 Challenges</span>
                {stats && <span className="bg-black/20 px-2 py-1 rounded-full text-xs">{stats.total_1v1_challenges}</span>}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challenges by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                >
                  <option value="all">All Languages</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Challenges Table */}
          <div className="overflow-x-auto bg-gray-800/30 border border-gray-700/50 rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Challenge</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Difficulty</th>
                  {activeTab === 'solo' && <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Mode</th>}
                  <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-cyan-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
                        Loading challenges...
                      </div>
                    </td>
                  </tr>
                ) : challenges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      {searchTerm ? `No challenges found matching "${searchTerm}"` : 'No challenges found'}
                    </td>
                  </tr>
                ) : (
                  challenges.map((challenge) => {
                    const ModeIcon = getModeIcon(challenge.mode || '');
                    return (
                      <tr key={challenge.id} className="hover:bg-gray-700/20 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {challenge.title}
                            </div>
                            {challenge.description && (
                              <div className="text-xs text-gray-400 truncate max-w-xs">
                                {challenge.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/50">
                            {challenge.language.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty.toUpperCase()}
                          </span>
                        </td>
                        {activeTab === 'solo' && (
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <ModeIcon className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-300 capitalize">{challenge.mode}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(challenge.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(challenge.id)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="View Challenge"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleEdit(challenge.id)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all duration-200"
                              title="Edit Challenge"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDownload(challenge.id)}
                              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded-lg transition-all duration-200"
                              title="Download Challenge"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Delete Challenge"
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

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800/90 border border-gray-700/50 rounded-xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Import {activeTab === 'solo' ? 'Solo' : '1v1'} Challenges
                  </h3>
                  <button onClick={closeImportModal} className="text-white hover:text-gray-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleImportSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeTab === 'solo' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mode</label>
                        <select 
                          value={importMode} 
                          onChange={(e) => setImportMode(e.target.value as any)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="fixbugs">Fix Bugs</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <select 
                        value={importLanguage} 
                        onChange={(e) => setImportLanguage(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                      <select 
                        value={importDifficulty} 
                        onChange={(e) => setImportDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload JSON File</label>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                      className="w-full text-gray-200 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Upload a JSON file containing an array of challenge objects
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Or Paste JSON</label>
                    <textarea 
                      rows={8} 
                      value={importItems.length > 0 ? JSON.stringify(importItems, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          if (e.target.value.trim() === '') {
                            setImportItems([]);
                            return;
                          }
                          const parsed = JSON.parse(e.target.value);
                          if (Array.isArray(parsed)) {
                            setImportItems(parsed);
                          } else {
                            console.warn('Parsed data is not an array');
                          }
                        } catch (err) {
                          // ignore until valid JSON
                          console.warn('Invalid JSON:', err);
                        }
                      }}
                      placeholder={`Paste your challenge array here... Example:
                        [
                        {
                            "title": "Fix the Loop",
                            "description": "Fix the infinite loop in this code",
                            "buggy_code": "for i in range(10):\\n    print(i)\\n    i = 0",
                            "fixed_code": "for i in range(10):\\n    print(i)",
                            "hint": "Look at the variable assignment inside the loop"
                        }
                        ]`}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      {importItems.length > 0 ? `${importItems.length} challenges ready to import` : 'Upload a JSON file or paste challenge data above'}
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button" 
                      onClick={closeImportModal}
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={importLoading || importItems.length === 0}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
                    >
                      {importLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{importLoading ? 'Importing...' : 'Import Challenges'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  );
}