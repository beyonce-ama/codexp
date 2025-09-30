// imports unchanged, but you can remove Settings if no longer used
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  ChevronDown, Menu, X, User, LogOut, Target, Users, BookOpen, Code,
  Swords, LayoutGrid, Brain, Clock, Zap, Star,
} from 'lucide-react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { audio } from '@/utils/sound';
import { apiClient } from '@/utils/api';

const safeCurrentPath = (pageUrl?: string) => {
  if (pageUrl) return pageUrl.split('?')[0];
  if (typeof window !== 'undefined') return window.location.pathname;
  return '/';
};
const getLevelFromXP = (totalXP?: number) => Math.floor(Number(totalXP || 0) / 10) + 1;

const SafeLink = ({ href, children, ...props }: any) => {
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  // Block while any modal is open
  if ((window as any).__modalOpen) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  // Block opening in new tab / new window behaviors
  if (
    e.button !== 0 ||          // not left click (e.g., middle/right)
    e.ctrlKey || e.metaKey ||  // Ctrl/Cmd click
    e.shiftKey || e.altKey     // Shift/Alt modifiers
  ) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  // Let Inertia handle normal left-click navigation
};


  return (
    <Link
      href={href}
      onClick={handleClick}
      onAuxClick={(e) => { e.preventDefault(); e.stopPropagation(); }} // middle-click
      onMouseDown={(e) => { if (e.button !== 0) { e.preventDefault(); e.stopPropagation(); } }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }} // right-click
      draggable={false}
      {...props}
    >
      {children}
    </Link>
  );
};

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="group relative" title={label}>
    {children}
    <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800/95 text-[10px] text-white px-2 py-1 opacity-0 shadow-lg ring-1 ring-slate-700 transition group-hover:opacity-100 hidden xl:block">
      {label}
    </div>
  </div>
);

export type AppHeaderProps = { hidden?: boolean };

export default function AppHeader({ hidden = false }: AppHeaderProps) {
  const page: any = usePage();
  const { auth } = page.props || {};
  const user = auth?.user as any;
const isAdmin = user?.role === 'admin';

  const clientPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const path = clientPath || page?.url || '';
  const hideForMatch = /^\/play\/m(atch)?\/.+/i.test(path);
  if (hidden || hideForMatch) return null;

  const avatarSrc = user?.avatar_url
    ? (user.avatar_url.startsWith('/') ? user.avatar_url : '/' + user.avatar_url)
    : '/avatars/default.png';
  const totalXP = Number(user?.total_xp ?? 0);
  const level = getLevelFromXP(totalXP);
  const stars = Number(user?.stars ?? 0);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ✅ moved inside component
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!!user?.sound_enabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(!!user?.music_enabled);

  // keep toggles in sync when auth refreshes
  useEffect(() => {
    setSoundEnabled(!!user?.sound_enabled);
    setMusicEnabled(!!user?.music_enabled);
  }, [user?.sound_enabled, user?.music_enabled]);

  const toggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setSoundEnabled(next);
    try {
      // If Ziggy route() exists, keep it. Otherwise: '/me/preferences'
      await apiClient.patch(route?.('me.preferences.update') ?? '/me/preferences', { sound_enabled: next ? 1 : 0 });
      router.reload({ only: ['auth'] });
      audio.play('click');
    } catch {
      setSoundEnabled(!next);
    }
  };

const toggleMusic = async () => {
  const next = !musicEnabled;

  // 👇 optimistic UI
  setMusicEnabled(next);
  audio.setMusicEnabled(next);

  // 👇 tell the layout to start/stop immediately
  try {
    window.dispatchEvent(new CustomEvent('app:music-setting', { detail: { enabled: next } }));
  } catch {}

  try {
    await apiClient.patch(route?.('me.preferences.update') ?? '/me/preferences', {
      music_enabled: next ? 1 : 0,
    });
    router.reload({ only: ['auth'] }); // keeps header badges etc in sync
    audio.play('click');
  } catch {
    // revert if server failed
    setMusicEnabled(!next);
    audio.setMusicEnabled(!next);
    // also revert layout
    try {
      window.dispatchEvent(new CustomEvent('app:music-setting', { detail: { enabled: !next } }));
    } catch {}
  }
};


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unlisten = router.on('success', () => setSidebarOpen(false));
    return () => unlisten();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => router.post('/logout');

  const navItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { title: 'User Management', href: '/admin/users', icon: Users },
        { title: 'Challenge Management', href: '/admin/challenges', icon: Code },
      ];
    }
    return [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
      { title: 'Solo Challenge', href: '/play/solo', icon: Target },
      { title: 'AI Challenges', href: '/play/ai-challenges', icon: Brain },
      { title: 'Practice', href: '/play/practice', icon: BookOpen },
      { title: 'Invite Duel', href: '/play/duel', icon: Swords },
      { title: 'Live Duel', href: '/play/Matchmaking', icon: Clock },
      { title: 'My Profile', href: '/profile', icon: User },
    ];
  }, [user?.role]);

  const currentPath = safeCurrentPath(page?.url);
  const isActive = (href: string) => currentPath === href || (href !== '/' && currentPath?.startsWith(href));

  const QuickShortcutDock = () => (
   <aside className={[
  "fixed left-0 top-0 bottom-0 z-40 hidden lg:flex bg-slate-950/60 backdrop-blur-md border-r border-slate-800/70 shadow-xl w-14 overflow-y-auto overflow-x-hidden overscroll-contain",
  modalOpen ? "pointer-events-none opacity-50" : ""
].join(" ")}>

      <div className="pt-18 pb-3 px-2 flex flex-col items-center gap-2 w-full">
        {navItems.map((item) => {
          const ActiveIcon = item.icon as any;
          const active = isActive(item.href);
          return (
            <Tip key={item.href} label={item.title}>
              <SafeLink
                href={item.href}
                className={[
                  'grid place-items-center w-10 h-10 rounded-xl ring-1 transition',
                  active
                    ? 'bg-slate-800/70 text-orange-300 ring-orange-500/30 shadow-lg shadow-orange-500/10'
                    : 'text-slate-300 hover:text-orange-300 hover:bg-slate-800/50 ring-slate-700/60',
                ].join(' ')}
              >
                <ActiveIcon className="w-5 h-5" />
              </SafeLink>
            </Tip>
          );
        })}
      </div>
    </aside>
  );
const [modalOpen, setModalOpen] = useState<boolean>(false);
useEffect(() => {
  const onModal = (e: any) => setModalOpen(!!e?.detail?.open);
  window.addEventListener('app:modal', onModal);
  return () => window.removeEventListener('app:modal', onModal);
}, []);

  return (
    <>
    <header
        className={[
          "bg-slate-950/70 backdrop-blur-md border-b border-slate-800/70 sticky top-0 z-40",
          modalOpen ? "pointer-events-none opacity-50" : ""
        ].join(" ")}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >

        <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex p-2 rounded-xl ring-1 ring-slate-700/70 text-slate-200 hover:text-orange-300 hover:bg-slate-800/70 transition"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <SafeLink href="/dashboard" className="flex items-center gap-2 group">
                <span className="text-lg sm:text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
                  CODEXP AI
                </span>
              </SafeLink>
            </div>

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-3 p-1.5 rounded-xl text-slate-200 hover:bg-slate-800/60 ring-1 ring-slate-700/60 transition"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-orange-400 shadow-md bg-white">
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-sm sm:text-base text-white">
                      {user.username || user.name}
                    </span>
                    {!isAdmin && (
  <span className="text-xs font-semibold text-orange-300">LVL {level}</span>
)}

                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden bg-slate-900/95 backdrop-blur-md ring-1 ring-slate-700/70 shadow-2xl z-50">
                    <div className="p-4 border-b border-slate-800/80">
                      <p className="font-semibold text-white truncate">{user.username || user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                     {!isAdmin && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30">
                              Level {level}
                            </span>
                            <span className="text-[11px] text-slate-400">XP {totalXP}</span>
                            {stars >= 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-yellow-400">
                                <Star className="w-3 h-3" />
                                <span>{stars}</span>
                              </span>
                            )}
                          </div>
                        )}

                    </div>  </div>

                    {/* ▼ Replaced Settings with Music/Sound controls */}
                    <div className="p-3 flex items-center justify-between gap-2">
                      <span className="text-m text-slate-400">Audio Settings</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSound}
                          className={[
                            'p-2 rounded-xl border transition',
                            soundEnabled
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white/10 text-white border-white/20',
                          ].join(' ')}
                          title={soundEnabled ? 'Sound: On' : 'Sound: Off'}
                        >
                          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={toggleMusic}
                          className={[
                            'p-2 rounded-xl border transition',
                            musicEnabled
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white/10 text-white border-white/20',
                          ].join(' ')}
                          title={musicEnabled ? 'Music: On' : 'Music: Off'}
                        >
                          <Music className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <QuickShortcutDock />

      {/* Backdrop */}
    
<div
  className={[
    'fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity lg:hidden',
    sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
    modalOpen ? 'pointer-events-none' : ''
  ].join(' ')}
  onClick={() => { if (!modalOpen) setSidebarOpen(false); }}
  aria-hidden
/>


      {/* Panel */}
<div
  className={[
    'fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out',
    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
    'bg-slate-900/95 backdrop-blur-md border-r border-slate-800/80 shadow-xl',
    'flex flex-col overflow-x-hidden',
    modalOpen ? 'pointer-events-none opacity-50' : ''
  ].join(' ')}
  role="dialog"
  aria-modal="true"
  aria-label="Navigation"
  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
>



{/* Close button only (sticky top) */}
<div className="sticky top-0 z-10 flex justify-end px-3 py-2 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80">
  <button
    onClick={() => setSidebarOpen(false)}
    className="inline-flex items-center justify-center h-10 w-10 rounded-xl ring-1 ring-slate-700/60 text-slate-300 hover:text-orange-300 hover:bg-slate-800/40 transition focus:outline-none focus:ring-2 focus:ring-orange-400/40"
    aria-label="Close sidebar"
  >
    <X className="w-5 h-5" />
    <span className="sr-only">Close</span>
  </button>
</div>




        {/* User card in sidebar (requested) */}
        {user && (
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-orange-400 shadow-md bg-white">
                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold truncate">{user.username || user.name}</div>
               {!isAdmin && (
  <div className="flex items-center gap-2 mt-0.5">
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30">
      Level {level}
    </span>
    <span className="text-[11px] text-slate-400">XP {totalXP}</span>
    {stars >= 0 && (
      <span className="flex items-center gap-1 text-[11px] text-yellow-400">
        <Star className="w-3 h-3" />
        <span>{stars}</span>
      </span>
    )}
  </div>
)}



              </div>
            </div>
          </div>
        )}

        {/* Nav list */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => (
            <SafeLink
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                isActive(item.href)
                  ? 'bg-slate-800/60 text-orange-300 ring-1 ring-orange-500/30'
                  : 'text-slate-200 hover:text-orange-300 hover:bg-slate-800/40',
              ].join(' ')}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </SafeLink>
          ))}
        </div>

        {/* Footer quick actions */}
        <div className="mt-auto p-3 border-t border-slate-800/80">
         
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export { AppHeader };
