// resources/js/Pages/Admin/Challenges.tsx
import AppLayout from '@/layouts/app-layout';
import Swal from 'sweetalert2';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import {
  Code, Plus, Upload, Edit, Trash2, Eye, Download,
  AlertTriangle, Zap, Target, Swords, RefreshCw, X, Search, Filter, BarChart3
} from 'lucide-react';
import { apiClient } from '@/utils/api';
import { withTheme, svgCircle } from '@/utils/swalTheme';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/dashboard' },
  { title: 'Admin', href: '/dashboard' },
  { title: 'Challenge Management', href: '/admin/challenges' }
];

interface Challenge {
  id: number;
  title: string;
  language: 'python' | 'java' | 'cpp';
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

  // NEW: per-language
solo_python_challenges: number;
solo_java_challenges: number;
solo_cpp_challenges?: number;   // NEW (optional)
duel_python_challenges: number;
duel_java_challenges: number;
duel_cpp_challenges?: number;   // NEW (optional)


  // NEW: difficulty splits
  solo_easy: number;
  solo_medium: number;
  solo_hard: number;
  duel_easy: number;
  duel_medium: number;
  duel_hard: number;

  // Modes (from step 1)
  fixbugs_challenges: number;
  random_challenges: number;
}

/* ---------------- UI helpers to match user side ---------------- */
const chip = (text: string, tone: 'blue'|'green'|'yellow'|'red'|'purple'|'slate'='slate') => {
  const toneMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    green:'bg-green-500/10 text-green-300 border-green-500/30',
    yellow:'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    red:  'bg-red-500/10 text-red-300 border-red-500/30',
    purple:'bg-purple-500/10 text-purple-300 border-purple-500/30',
    slate:'bg-white/5 text-slate-300 border-white/10',
  };
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded-md border ${toneMap[tone]} inline-flex items-center gap-1`}>
      {text}
    </span>
  );
};

function Section({
  title, right, children, className = '',
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="sticky top-6 z-10 mb-3">
        <div className="flex items-center justify-between bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
          <div className="flex items-center gap-2">{title}</div>
          <div className="flex items-center gap-2">{right}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, tone = 'slate', hint,
}: {
  icon: any; label: string; value: string|number; tone?: 'blue'|'green'|'yellow'|'red'|'purple'|'slate'; hint?: string;
}) {
  const ring: Record<string, string> = {
    blue: 'ring-blue-500/20 hover:ring-blue-500/40',
    green:'ring-green-500/20 hover:ring-green-500/40',
    yellow:'ring-yellow-500/20 hover:ring-yellow-500/40',
    red:  'ring-red-500/20 hover:ring-red-500/40',
    purple:'ring-purple-500/20 hover:ring-purple-500/40',
    slate:'ring-white/10 hover:ring-white/20',
  };
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition ring-1 ${ring[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-white/10 bg-white/5">
            <Icon className="h-5 w-5 text-white/90" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
          </div>
        </div>
        {hint ? chip(hint, tone) : null}
      </div>
    </div>
  );
}
type BreakdownTotals = {
  solo: { python: number; java: number; cpp: number; total: number };
  v1:   { python: number; java: number; cpp: number; total: number };
  soloDiff: { easy: number; medium: number; hard: number };
  v1Diff:   { easy: number; medium: number; hard: number };
};

const zeroTotals: BreakdownTotals = {
  solo:     { python: 0, java: 0, cpp: 0, total: 0 },
  v1:       { python: 0, java: 0, cpp: 0, total: 0 },
  soloDiff: { easy: 0,  medium: 0, hard: 0 },
  v1Diff:   { easy: 0,  medium: 0, hard: 0 },
};

/* ---------------- Component ---------------- */
export default function AdminChallenges() {
  const { props }: any = usePage();
const serverActiveType: 'solo' | '1v1' | undefined = props?.activeType;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'solo' | '1v1'>('solo');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [totals, setTotals] = useState<BreakdownTotals>(zeroTotals);
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'fixbugs' | 'random'>('fixbugs');
  const [importLanguage, setImportLanguage] = useState<'python' | 'java' | 'cpp'>('python');
  const [importDifficulty, setImportDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [importItems, setImportItems] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
const displayLanguage = (s: string) => (s === 'cpp' ? 'C++' : (s ?? '').toUpperCase());

  const visibleCount = useMemo(
    () => (loading ? '—' : challenges.length),
    [loading, challenges.length]
  );

  // UI toggles (like user side)
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    fetchChallenges();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } else {
        setChallenges([]);
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
      const d = response.data;

      // keep raw stats for the top tiles
      setStats({
        total_solo_challenges: d.total_solo_challenges || 0,
        total_1v1_challenges:  d.total_1v1_challenges  || 0,
        fixbugs_challenges:    d.fixbugs_challenges    ?? 0,
        random_challenges:     d.random_challenges     ?? 0,

        // include fields so TS is happy even if you don't render all of them
        solo_python_challenges: d.solo_python_challenges ?? 0,
solo_java_challenges:   d.solo_java_challenges   ?? 0,
solo_cpp_challenges:    d.solo_cpp_challenges    ?? 0, // NEW
duel_python_challenges: d.duel_python_challenges ?? 0,
duel_java_challenges:   d.duel_java_challenges   ?? 0,
duel_cpp_challenges:    d.duel_cpp_challenges    ?? 0, // NEW

        solo_easy:   d.solo_easy   ?? 0,
        solo_medium: d.solo_medium ?? 0,
        solo_hard:   d.solo_hard   ?? 0,
        duel_easy:   d.duel_easy   ?? 0,
        duel_medium: d.duel_medium ?? 0,
        duel_hard:   d.duel_hard   ?? 0,
      } as ChallengeStats);

      // derive the “breakdown” tiles once, from the same payload
      setTotals({
solo: {
  python: d.solo_python_challenges ?? 0,
  java:   d.solo_java_challenges   ?? 0,
  cpp:    d.solo_cpp_challenges    ?? 0, // NEW
  total:  d.total_solo_challenges  ?? 0,
},
v1: {
  python: d.duel_python_challenges ?? 0,
  java:   d.duel_java_challenges   ?? 0,
  cpp:    d.duel_cpp_challenges    ?? 0, // NEW
  total:  d.total_1v1_challenges   ?? 0,
},

  // difficulty separated by mode (no sum)
  soloDiff: {
    easy:   d.solo_easy   ?? 0,
    medium: d.solo_medium ?? 0,
    hard:   d.solo_hard   ?? 0,
  },
  v1Diff: {
    easy:   d.duel_easy   ?? 0,
    medium: d.duel_medium ?? 0,
    hard:   d.duel_hard   ?? 0,
  },
});

    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    // leave totals as zeros; page still renders
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
    if (!file.name.endsWith('.json')) {
      Swal.fire('Invalid File Type', 'Please select a JSON file (.json)', 'error');
      return;
    }
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
    reader.onerror = () => Swal.fire('File Read Error', 'Unable to read the file.', 'error');
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

      const response = await apiClient.post(endpoint, payload);
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

  // Routing helpers (keep behavior)
  const adminBase = activeTab === 'solo' ? '/admin/challenges/solo' : '/admin/challenges/1v1';
 // NEW – open SweetAlert modals instead of routing
const handleCreate = () => openCreateModal(activeTab);
const handleView = (c: Challenge) => openViewModal(c);
const handleEdit = (c: Challenge) => openEditModal(c, activeTab);

  const handleDownload = (id: number) => {
    const endpoint = activeTab === 'solo'
      ? `/admin/challenges/solo/${id}/export`
      : `/admin/challenges/1v1/${id}/export`;
    window.open(endpoint, '_blank');
  };

  // Colors/icons for table pills
  const getDifficultyColor = (d: string) =>
    d === 'easy' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
    d === 'medium' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' :
    d === 'hard' ? 'bg-red-500/10 text-red-300 border-red-500/30' :
    'bg-white/5 text-slate-300 border-white/10';

  const getModeIcon = (mode: string) => mode === 'fixbugs' ? AlertTriangle : mode === 'random' ? Zap : Code;

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

// Compact pill used inside modals
const pill = (label: string, value: string) => `
  <span class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-200">
    <span class="text-[10px] uppercase tracking-wide opacity-70">${esc(label)}</span>
    <span class="font-semibold">${esc(value)}</span>
  </span>`;

// Pretty code block with copy button
const codeBlock = (label: string, code: string) => {
  const id = `code_${Math.random().toString(36).slice(2)}`;
  return `
    <div class="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] uppercase tracking-wide opacity-70">${esc(label)}</div>
        <button type="button" class="neo-copy px-2 py-1 text-xs rounded-md border border-cyan-500/30 hover:bg-cyan-500/10 transition" data-target="${id}">
          Copy
        </button>
      </div>
      <pre id="${id}" class="text-[12px] overflow-auto max-h-72 leading-[1.35]"><code>${esc(code)}</code></pre>
    </div>`;
};

// Generic shell for SweetAlert2 HTML content
const modalShell = (opts: {
  icon?: string;             // emoji/string
  title: string;             // heading
  subtitle?: string;         // small muted line
  right?: string;            // optional HTML on header right
  bodyHTML: string;          // main body html
}) => `
  <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900/80">
    <div class="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        ${opts.icon ? `<div class="text-white/90 text-xl">${esc(opts.icon)}</div>` : ''}
        <div>
          <div class="text-white font-semibold">${esc(opts.title)}</div>
          ${opts.subtitle ? `<div class="text-white/80 text-xs">${esc(opts.subtitle)}</div>` : ''}
        </div>
      </div>
      ${opts.right ?? ''}
    </div>
    <div class="p-4 md:p-5 space-y-4">${opts.bodyHTML}</div>
  </div>`;

 

 const openViewModal = (c: any) => {
  const meta = [
   c.language ? pill('Language', displayLanguage(String(c.language))) : '',
    c.difficulty ? pill('Difficulty', String(c.difficulty).toUpperCase()) : '',
    c.mode ? pill('Mode', String(c.mode)) : '',
    c.reward_xp != null ? pill('Reward', String(c.reward_xp)) : '',
  ].filter(Boolean).join(' ');

  const body = `
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">${meta}</div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div class="md:col-span-5">
          <div class="rounded-lg border border-white/10 bg-white/5 p-3 h-full">
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
  `;

  Swal.fire(withTheme({
    width: 960,
    html: modalShell({
      icon: '👀',
      title: c.title || 'View Challenge',
      subtitle: `Created ${new Date(c.created_at ?? Date.now()).toLocaleString()}`,
      bodyHTML: body,
    }),
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl !p-0 backdrop-blur-sm',
      confirmButton: 'swal2-confirm !bg-cyan-600 hover:!bg-cyan-500 !rounded-lg !px-4 !py-2',
    },
    didOpen: () => {
      document.querySelectorAll<HTMLButtonElement>('.neo-copy').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-target')!;
          const txt = (document.getElementById(id)?.innerText ?? '');
          navigator.clipboard.writeText(txt);
          const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = old), 900);
        });
      });
    }
  }));
};


const openEditModal = (c: any, type: 'solo' | '1v1') => {
  const modeSolo = type === 'solo';

  const body = `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div class="md:col-span-7 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
          <input id="f_title" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" value="${esc(c.title)}" />
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
          <textarea id="f_desc" rows="3" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">${esc(c.description ?? '')}</textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="f_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
              <select id="f_lang" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="python" ${c.language==='python'?'selected':''}>Python</option>
                <option value="java" ${c.language==='java'?'selected':''}>Java</option>
                <option value="cpp"    ${c.language==='cpp'   ?'selected':''}>C++</option>
              </select>
            </div>
            <div>
              <label for="f_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
              <select id="f_diff" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="easy" ${c.difficulty==='easy'?'selected':''}>Easy</option>
                <option value="medium" ${c.difficulty==='medium'?'selected':''}>Medium</option>
                <option value="hard" ${c.difficulty==='hard'?'selected':''}>Hard</option>
              </select>
            </div>
            ${modeSolo ? `
            <div>
              <label for="f_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
              <select id="f_mode" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="fixbugs" ${c.mode==='fixbugs'?'selected':''}>Fix Bugs</option>
              </select>
            </div>
            <div>
              <label for="f_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
              <input id="f_reward" type="number" step="1" min="0" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" value="${esc(c.reward_xp ?? 0)}" />
            </div>` : ''}
          </div>
        </div>
      </div>

      <div class="md:col-span-5 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
          <textarea id="f_bug" rows="7" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]">${esc(c.buggy_code ?? '')}</textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
          <textarea id="f_fix" rows="7" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]">${esc(c.fixed_code ?? '')}</textarea>

          ${modeSolo ? `
          <label for="f_hint" class="block text-[10px] uppercase tracking-wide mt-3 mb-1 opacity-70">Hint</label>
          <textarea id="f_hint" rows="2" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">${esc(c.hint ?? '')}</textarea>` : ''}
        </div>
      </div>
    </div>
  `;

  Swal.fire(withTheme({
    width: 960,
    html: modalShell({
      icon: '✏️',
      title: 'Edit Challenge',
      subtitle: (c.title ? `Editing “${c.title}”` : 'Update fields below'),
      bodyHTML: body,
    }),
    showCancelButton: true,
    confirmButtonText: 'Save',
    customClass: {
      popup: 'rounded-2xl !p-0 backdrop-blur-sm',
      confirmButton: 'swal2-confirm !bg-emerald-600 hover:!bg-emerald-500 !rounded-lg !px-4 !py-2',
      cancelButton: 'swal2-cancel !bg-white/10 hover:!bg-white/20 !text-white !rounded-lg !px-4 !py-2',
      actions: '!px-5 !pb-4',
    },
    focusConfirm: false,
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
      if (!payload.title) { Swal.showValidationMessage('Title is required'); return false as any; }
      return payload;
    }
  })).then(r => {
  if (r.isConfirmed) submitEdit(c.id, r.value, serverActiveType || type);
});
};

const openCreateModal = (type: 'solo' | '1v1') => {
  const modeSolo = type === 'solo';

  const body = `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div class="md:col-span-7 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
          <input id="c_title" placeholder="Awesome challenge name" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" />
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
          <textarea id="c_desc" rows="3" placeholder="Short description..." class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2"></textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="c_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
              <select id="c_lang" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              <label for="c_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
              <select id="c_diff" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            ${modeSolo ? `
            <div>
              <label for="c_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
              <select id="c_mode" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="fixbugs">Fix Bugs</option>
              </select>
            </div>
            <div>
              <label for="c_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
              <input id="c_reward" type="number" step="1" min="0" value="0" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" />
            </div>` : ''}
          </div>
        </div>
      </div>

      <div class="md:col-span-5 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
          <textarea id="c_bug" rows="7" placeholder="// buggy snippet here" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]"></textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
          <textarea id="c_fix" rows="7" placeholder="// fixed snippet here" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]"></textarea>

          ${modeSolo ? `
          <label for="c_hint" class="block text-[10px] uppercase tracking-wide mt-3 mb-1 opacity-70">Hint</label>
          <textarea id="c_hint" rows="2" placeholder="Small hint (optional)" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2"></textarea>` : ''}
        </div>
      </div>
    </div>
  `;

  Swal.fire(withTheme({
    width: 960,
    html: modalShell({
      icon: '✨',
      title: `Create ${modeSolo ? 'Solo' : '1v1'} Challenge`,
      bodyHTML: body,
    }),
    showCancelButton: true,
    confirmButtonText: 'Create',
    customClass: {
      popup: 'rounded-2xl !p-0 backdrop-blur-sm',
      confirmButton: 'swal2-confirm !bg-emerald-600 hover:!bg-emerald-500 !rounded-lg !px-4 !py-2',
      cancelButton: 'swal2-cancel !bg-white/10 hover:!bg-white/20 !text-white !rounded-lg !px-4 !py-2',
      actions: '!px-5 !pb-4',
    },
    focusConfirm: false,
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
      if (!payload.title) { Swal.showValidationMessage('Title is required'); return false as any; }
      return payload;
    }
  })).then(r => { if (r.isConfirmed) submitCreate(r.value, serverActiveType || type); });

};


  const submitEdit = async (id: number, payload: any, type: 'solo' | '1v1') => {
    const base = type === 'solo' ? '/api/challenges/solo' : '/api/challenges/1v1';
    const res = await apiClient.put(`${base}/${id}`, payload);
    if (res?.success) { Swal.fire('Saved!', 'Challenge updated.', 'success'); fetchChallenges(); }
    else { Swal.fire('Error', res?.message || 'Update failed', 'error'); }
  };
  const submitCreate = async (payload: any, type: 'solo' | '1v1') => {
    const base = type === 'solo'
  ? '/admin/challenges/api/challenges/solo'
  : '/admin/challenges/api/challenges/1v1';

    const res = await apiClient.post(base, payload);
    if (res?.success) { Swal.fire('Created!', 'Challenge created.', 'success'); fetchChallenges();}
    else { Swal.fire('Error', res?.message || 'Create failed', 'error'); }
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Challenge Management" />

        <div className="p-4 space-y-6">
          {/* Hero header */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 p-4 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">Challenge Management</h1>
                  <p className="text-white/80 text-sm">Create, curate, and manage coding challenges</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('solo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === 'solo'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-200 hover:bg-white/10'
                }`}
              >
                <Target className="h-5 w-5" />
                <span className="font-medium">Solo</span>
                {stats && <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">{stats.total_solo_challenges}</span>}
              </button>
              <button
                onClick={() => setActiveTab('1v1')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === '1v1'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-200 hover:bg-white/10'
                }`}
              >
                <Swords className="h-5 w-5" />
                <span className="font-medium">1v1</span>
                {stats && <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">{stats.total_1v1_challenges}</span>}
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <Section
            title={<><BarChart3 className="h-5 w-5 text-green-300" /><span className="text-white font-semibold">Overview</span></>}
            right={
              <button
                onClick={() => setShowStats(s => !s)}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
              >
                {showStats ? 'Hide' : 'Show'}
              </button>
            }
          >
            {showStats && (
  <>
    {/* existing high-level tiles */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
      <StatTile icon={Target} label="Solo" value={stats?.total_solo_challenges ?? 0} tone="blue" hint="All time" />
      <StatTile icon={Swords} label="1v1" value={stats?.total_1v1_challenges ?? 0} tone="purple" hint="All time" />
  
    </div>

    {/* NEW: mode × language breakdown */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mt-3">
      <StatTile icon={Target} label="Solo • Python" value={totals.solo.python} tone="blue" />
      <StatTile icon={Target} label="Solo • Java"   value={totals.solo.java}   tone="blue" />
      <StatTile icon={Target} label="Solo • C++"    value={totals.solo.cpp}    tone="blue" />
      <StatTile icon={Swords} label="1v1 • Python"  value={totals.v1.python}   tone="purple" />
      <StatTile icon={Swords} label="1v1 • Java"    value={totals.v1.java}     tone="purple" />
        <StatTile icon={Swords} label="1v1 • C++"     value={totals.v1.cpp}      tone="purple" />
    </div>

    {/* NEW: difficulty breakdown (all challenges) */}
{/* SOLO difficulty breakdown */}
<div className="mt-4">
  <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Solo difficulty</div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <StatTile icon={Zap} label="Solo • Easy"   value={totals.soloDiff.easy}   tone="green" />
    <StatTile icon={Zap} label="Solo • Medium" value={totals.soloDiff.medium} tone="yellow" />
    <StatTile icon={Zap} label="Solo • Hard"   value={totals.soloDiff.hard}   tone="red" />
  </div>
</div>

{/* 1v1 difficulty breakdown */}
<div className="mt-4">
  <div className="text-xs uppercase tracking-wide text-white/60 mb-2">1v1 difficulty</div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <StatTile icon={Zap} label="1v1 • Easy"   value={totals.v1Diff.easy}   tone="green" />
    <StatTile icon={Zap} label="1v1 • Medium" value={totals.v1Diff.medium} tone="yellow" />
    <StatTile icon={Zap} label="1v1 • Hard"   value={totals.v1Diff.hard}   tone="red" />
  </div>
</div>

  </>
)}

          </Section>

          {/* Filters */}
          <Section
            title={<><Filter className="h-5 w-5 text-cyan-300" /><span className="text-white font-semibold">Filters</span></>}
            right={
              <button
                onClick={() => setShowFilters(s => !s)}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
              >
                {showFilters ? 'Hide' : 'Show'}
              </button>
            }
          >
            {showFilters && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search challenges by title or description…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                          aria-label="Clear search"
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
                      className="px-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                    >
                      <option value="all">All Languages</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* List/Table */}
          <Section
            title={<><Code className="h-5 w-5 text-pink-300" /><span className="text-white font-semibold">Challenges</span></>}
            right={
              <button
                onClick={() => setShowList(s => !s)}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
              >
                {showList ? 'Hide' : 'Show'}
              </button>
            }
          >
            {showList && (
              <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <table className="w-full">
                  <thead className="bg-slate-950/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Challenge</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Language</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Difficulty</th>
                      {activeTab === 'solo' && <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Mode</th>}
                      <th className="px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-cyan-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
                            Loading challenges…
                          </div>
                        </td>
                      </tr>
                    ) : challenges.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          {searchTerm ? `No challenges found matching “${searchTerm}”` : 'No challenges found'}
                        </td>
                      </tr>
                    ) : (
                      challenges.map((challenge) => {
                        const ModeIcon = getModeIcon(challenge.mode || '');
                        return (
                          <tr key={challenge.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="max-w-xl">
                                <div className="text-sm font-semibold text-white">{challenge.title}</div>
                                {challenge.description && (
                                  <div className="text-xs text-gray-400 truncate">{challenge.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full border bg-blue-500/10 text-blue-300 border-blue-500/30">
                                {displayLanguage(challenge.language)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty.toUpperCase()}
                              </span>
                            </td>
                            {activeTab === 'solo' && (
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-sm text-gray-300">
                                  <ModeIcon className="h-4 w-4 text-gray-400" />
                                  <span className="capitalize">{challenge.mode}</span>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(challenge.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1">
                               <button
  onClick={() => handleView(challenge)}
  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition"
  title="View"
>
                                  <Eye className="h-4 w-4" />
                                </button>
                              <button
  onClick={() => handleEdit(challenge)}
  className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 rounded-lg transition"
  title="Edit"
>
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDownload(challenge.id)}
                                  className="p-2 text-gray-300 hover:text-gray-100 hover:bg-gray-900/30 rounded-lg transition"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChallenge(challenge.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
                                  title="Delete"
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
            )}
          </Section>

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800/90 border border-gray-700/50 rounded-xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Import {activeTab === 'solo' ? 'Solo' : '1v1'} Challenges
                  </h3>
                  <button onClick={() => { setShowImportModal(false); setImportItems([]); }} className="text-white hover:text-gray-200">
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
                        <option value="cpp">C++</option>
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
                    <p className="text-xs text-gray-400 mt-1">Upload a JSON file containing an array of challenge objects</p>
                  </div>

                 {/* JSON format guide (replaces paste area) */}
<div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
  <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
    <Code className="h-4 w-4" /> Expected JSON Format
  </h4>
  <p className="text-xs text-gray-300 mb-3">
    Each JSON file should contain an <strong>array of challenge objects</strong>.
    Every object must include the following fields:
  </p>
  <pre className="text-xs bg-black/40 border border-gray-700 rounded-lg p-3 text-gray-200 font-mono overflow-x-auto">
{`[
  {
    "difficulty": "easy",
    "language": "python",
    "title": "Sum of Two Numbers",
    "description": "The program should take two integers as input and print their sum.",
    "buggy_code": "a = 5\\nb = 7\\nprint('Sum is:', a + b",
    "fixed_code": "a = 5\\nb = 7\\nprint('Sum is:', a + b)",
    "hint": "Check the missing parenthesis in print statement"
  }
]`}
  </pre>
  <p className="text-xs text-gray-400 mt-2">
    You can export an existing challenge to see the full structure.
  </p>

  {importItems.length > 0 && (
    <div className="mt-3">
      <p className="text-xs text-green-400">
        ✅ Loaded <strong>{importItems.length}</strong> challenges from file.
      </p>
    </div>
  )}
</div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowImportModal(false); setImportItems([]); }}
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={importLoading || importItems.length === 0}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                    >
                      {importLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span>{importLoading ? 'Importing…' : 'Import Challenges'}</span>
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

/* --- tiny swal css tokens (optional; use your global css if you already have) ---
.neo-card{background:rgba(2,6,23,.7);border:1px solid rgba(34,211,238,.3);border-radius:.75rem;padding:.75rem}
.neo-pill{display:inline-flex;gap:.35rem;align-items:center;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#cbd5e1;border-radius:.5rem;padding:.15rem .5rem}
.swal2-html-container .neo-card pre{white-space:pre-wrap}
*/
