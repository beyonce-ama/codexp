import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  Trophy,
  Settings,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Star,
  Crown,
  Target,
  Users,
  BookOpen,
  Code,
  Swords,
  LayoutGrid,
  Brain,
  Clock,
} from 'lucide-react';

interface GameUser {
  id: number;
  name: string;
  username?: string;
  email: string;
  level?: number;
  xp?: number;
  total_xp?: number;
  rank_name?: string;
  rank_stars?: number;
  winrate?: number;
  avatar_url?: string;
  role: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

/* ---------- Helpers ---------- */
const safeCurrentPath = (pageUrl?: string) => {
  if (pageUrl) return pageUrl.split('?')[0];
  if (typeof window !== 'undefined') return window.location.pathname;
  return '/';
};

/* ---------- SafeLink wrapper ---------- */
const SafeLink = ({ href, children, ...props }: any) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      e.preventDefault(); // prevent opening in new tab
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // disable right-click open
  };

  return (
    <Link
      href={href}
      {...props}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {children}
    </Link>
  );
};

const XPProgressBar = ({ currentXP, level }: { currentXP: number; level: number }) => {
  const xpForCurrentLevel = (level - 1) * 50;
  const xpForNextLevel = level * 50;
  const progressXP = Math.max(0, currentXP - xpForCurrentLevel);
  const neededXP = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const progress = Math.min((progressXP / neededXP) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] sm:text-xs text-orange-300 font-semibold tracking-wide">LVL {level}</div>
      <div className="w-24 sm:w-28 h-2 rounded-full bg-slate-800/80 ring-1 ring-slate-700/60 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] sm:text-xs text-gray-300 tabular-nums">
        {progressXP}/{neededXP}
      </div>
    </div>
  );
};

const RankBadge = ({ rank, stars }: { rank: string; stars: number }) => {
  const color =
    {
      rookie: 'text-gray-400',
      bronze: 'text-orange-500',
      silver: 'text-slate-200',
      gold: 'text-yellow-400',
      platinum: 'text-blue-300',
      diamond: 'text-cyan-300',
    }[rank?.toLowerCase()] || 'text-gray-400';

  return (
    <div className="flex items-center gap-1">
      <Crown className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-bold capitalize ${color}`}>{rank || 'rookie'}</span>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < (stars ?? 0) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
        ))}
      </div>
    </div>
  );
};

type Props = { hidden?: boolean };

export default function AppHeader({ hidden = false }: Props) {
  const page: any = usePage();
  const clientPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const path = clientPath || page?.url || '';

  const hideForMatch = /^\/play\/m(atch)?\/.+/i.test(path);

  if (hidden || hideForMatch) return null;

  const { auth } = page.props || {};
  const user: GameUser = auth?.user;
  const avatarSrc = user?.avatar_url || '/avatars/default.png';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => router.post('/logout');

  const getNavItems = useMemo<NavItem[]>(() => {
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
      { title: 'Live duel', href: '/play/Matchmaking', icon: Clock },
      { title: 'My Profile', href: '/profile', icon: User },
    ];
  }, [user?.role]);

  const currentPath = safeCurrentPath(page?.url);
  const isActive = (href: string) =>
    currentPath === href || (href !== '/' && currentPath?.startsWith(href));

  return (
    <header
      className={[
        'sticky top-0 z-30',
        'backdrop-blur-md bg-gradient-to-r from-slate-950/70 via-slate-900/60 to-slate-950/70',
        'border-b',
        scrolled ? 'border-orange-500/40 shadow-[0_10px_30px_-10px_rgba(255,138,76,0.25)]' : 'border-slate-800/70',
        'transition-all duration-300',
      ].join(' ')}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex p-2 rounded-xl ring-1 ring-slate-700/70 text-slate-200 hover:text-orange-300 hover:bg-slate-800/70 transition"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <SafeLink href="/dashboard" className="flex items-center gap-2 group">
              <div className="flex flex-col leading-tight">
                <span className="text-lg sm:text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
                  CODEXP AI
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 tracking-[0.2em] group-hover:text-slate-300 transition">
                  COMPETITIVE CODING
                </span>
              </div>
            </SafeLink>
          </div>

          {/* Center: Player strip (now with avatar) */}
          {user?.level ? (
            <div
              className={[
                'hidden lg:flex items-center gap-5',
                'rounded-2xl px-4 py-2',
                'bg-slate-900/50 ring-1 ring-slate-700/60',
                'shadow-inner shadow-black/30',
              ].join(' ')}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-700/60 shrink-0">
                <img src={avatarSrc} alt="Me" className="w-full h-full object-cover" />
              </div>
              <XPProgressBar currentXP={user.total_xp || 0} level={user.level || 1} />
              <div className="h-4 w-px bg-slate-700/70" />
              <RankBadge rank={user.rank_name || 'rookie'} stars={user.rank_stars || 0} />
              <div className="h-4 w-px bg-slate-700/70" />
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium tabular-nums">
                  {(user.winrate ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}

          {/* Right: Desktop nav + user */}
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              {getNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SafeLink
                    key={item.href}
                    href={item.href}
                    className={[
                      'group relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                      'transition',
                      active
                        ? 'text-orange-300 bg-slate-800/60 ring-1 ring-orange-500/30'
                        : 'text-slate-300 hover:text-orange-300 hover:bg-slate-800/40 ring-1 ring-transparent hover:ring-slate-700/60',
                    ].join(' ')}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.title}</span>
                    <span
                      className={[
                        'pointer-events-none absolute -bottom-1 left-3 right-3 h-[2px] rounded-full',
                        active ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300' : 'bg-transparent',
                        'transition-all duration-300',
                      ].join(' ')}
                    />
                  </SafeLink>
                );
              })}
            </nav>

            {/* User menu */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 rounded-xl text-slate-200 hover:bg-slate-800/60 ring-1 ring-slate-700/60 transition"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-slate-900 font-bold text-sm overflow-hidden grid place-items-center ring-1 ring-slate-300">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user.username || user.name || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-sm font-semibold text-white truncate max-w-[10rem]">
                      {user.username || user.name}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className={[
                      'absolute right-0 mt-2 w-72',
                      'rounded-2xl overflow-hidden',
                      'bg-slate-900/95 backdrop-blur-md',
                      'ring-1 ring-slate-700/70 shadow-2xl shadow-black/50',
                      'animate-in fade-in slide-in-from-top-2',
                      'z-50',
                    ].join(' ')}
                    role="menu"
                  >
                    <div className="p-4 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white text-slate-900 font-bold overflow-hidden grid place-items-center ring-1 ring-slate-300">
                          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{user.username || user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          {user.rank_name !== undefined && user.rank_stars !== undefined && (
                            <div className="mt-1">
                              <RankBadge rank={user.rank_name || 'rookie'} stars={user.rank_stars || 0} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <SafeLink
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800/70 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </SafeLink>

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
      </div>

      {/* Mobile drawer */}
      <div
        className={[
          'md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
          mobileMenuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
        ref={mobileMenuRef}
      >
        <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80">
          {/* Mobile: profile header with avatar */}
          {user && (
            <div className="p-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-slate-700/60">
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.username || user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {user?.level && (
            <div className="p-4 border-b border-slate-800/80">
              <div className="space-y-3">
                <XPProgressBar currentXP={user.total_xp || 0} level={user.level || 1} />
                <div className="flex items-center justify-between">
                  <RankBadge rank={user.rank_name || 'rookie'} stars={user.rank_stars || 0} />
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium tabular-nums">
                      {(user.winrate ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 space-y-1">
            {getNavItems.map((item) => (
              <SafeLink
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 px-3 py-2 rounded-xl',
                  isActive(item.href)
                    ? 'text-orange-300 bg-slate-800/60 ring-1 ring-orange-500/30'
                    : 'text-slate-200 hover:text-orange-300 hover:bg-slate-800/50',
                ].join(' ')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </SafeLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };
