// resources/js/Pages/Public/CodexpLandingPage.tsx
// CODEXP AI: A GAMIFIED COMPETITIVE CODING WEB-BASED PLATFORM
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

import { motion } from 'framer-motion';
import {
  Swords, Brain, BookOpen, Trophy, Sparkles, Bolt, ChartBarBig, ShieldCheck, X
} from 'lucide-react';


const fadeIn = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const featureList = [
  { title: 'Login & Sign Up', desc: 'Secure auth with verification + player profile.', icon: ShieldCheck },
  { title: 'Player Dashboard', desc: 'Level, stars, winrate, and language stats at a glance.', icon: ChartBarBig },
  { title: 'Solo Mode', desc: 'Beat curated or AI-generated problems. Earn XP', icon: Brain },
  { title: '1v1 Battle', desc: 'Invite or live matchmaking with timers and instant scoring.', icon: Swords },
  { title: 'Practice Mode', desc: 'Learn in fill in the blanks code snippets', icon: BookOpen },
  { title: 'Leaderboards', desc: 'Global ladder. Climb and defend your spot.', icon: Trophy },
];

const howItWorks = [
  { step: '1', title: 'Create Your Account', desc: 'Pick your main language (Python/Java) and set goals.' },
  { step: '2', title: 'Train/learn in Practice', desc: 'Warm up with fill in the blanks code snippets' },
  { step: '3', title: 'Battle & Rank Up', desc: 'Enter 1v1s, earn XP, collect stars, and learn!' },
];

const faqs = [
  { 
    q: 'Is this for beginners or advanced?', 
    a: 'It’s mainly designed for beginners, focusing on basic concepts and fundamentals.' 
  },
  { 
    q: 'What languages are supported?', 
    a: 'Python, Java and C++ .' 
  },
  { 
    q: 'How are battles scored?', 
    a: 'Fastest correct solution wins; ties consider quality and tests.' 
  },
  { 
    q: 'Do I need to install anything?', 
    a: 'Nope! Everything runs in the browser with no extra setup.' 
  },
  { 
    q: 'Can I practice solo?', 
    a: 'Yes, there’s a solo mode with practice problems at different difficulty levels.' 
  },
  { 
    q: 'Is there a ranking system?', 
    a: 'Yes, players earn XP, level up, and can see their standings on the leaderboard.' 
  },
  { 
    q: 'Can I invite friends?', 
    a: 'You can challenge anyone by searching their username and sending a duel request.' 
  },
  { 
    q: 'Are live duels supported?', 
    a: 'Absolutely—go head-to-head in real time against other players in coding duels.' 
  },
  { 
    q: 'Why CodeXP AI?', 
    a: 'Because it makes coding practice fun, competitive, and smart—combining challenges, AI, and gamification in one platform.' 
  }
];

// Predefined avatars (files live in /public/avatars)
// Replace with your actual filenames.
const AVATARS = [
  { key: 'default.png', label: 'Neo' },
  { key: 'boy2.png', label: 'Volt' },
  { key: 'girl1.png', label: 'Ivy' },
  { key: 'girl2.png', label: 'Kairo' },
  { key: 'girl3.png', label: 'Nova' },
  { key: 'boy5.png', label: 'Vega' },
];

export default function CodexpLandingPage() {
   const [scrolled, setScrolled] = useState(false);

  // Inertia page props (expects auth user passed by your Laravel/Inertia share)
  const { props } = usePage<any>();
  const user = (props?.auth as any)?.user;

  const avatarName: string = user?.name || 'Guest';
  // Use backend-provided avatar_key if available; otherwise show first preset.
  const selectedAvatarKey = (user && user.avatar_key) ? user.avatar_key : AVATARS[0].key;
  const effectiveAvatar = `/avatars/${selectedAvatarKey}`;


  // Modals
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRules, setShowRules] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-orange-500/20 selection:text-orange-100">
      {/* --- Animated Background (GPU-friendly) --- */}
      {/* 1) Soft moving blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,161,76,0.18), transparent 70%)',
        }}
        animate={{ x: [0, 40, -10, 0], y: [0, -20, 30, 0], rotate: [0, 10, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(99,102,241,0.18), transparent 70%)',
        }}
        animate={{ x: [0, -30, 10, 0], y: [0, 25, -25, 0], rotate: [0, -12, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 2) Subtle dot grid mesh */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse at 50% 30%, black 60%, transparent 85%)',
        }}
      />
      {/* 3) Angular sweep highlight */}
      <motion.div
        aria-hidden
        className="absolute -inset-1 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(255,179,79,0.06) 90deg, transparent 180deg, rgba(96,165,250,0.06) 270deg, transparent 360deg)',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      {/* --- Minimal Landing Header (no AppHeader) --- */}
      <header
        className={[
          'fixed top-0 left-0 w-full z-50 transition-all duration-300',
          scrolled
            ? 'backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img
                  src="/images/logo.png"
                  alt="CODEXP AI Logo"
                  className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_4px_rgba(255,200,0,0.6)] transition-transform group-hover:scale-110"
                />
            <span className="text-lg sm:text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
              CODEXP AI
            </span>
            <span className="hidden sm:block text-[10px] sm:text-xs text-slate-400 tracking-[0.18em]">COMPETITIVE CODING</span>
          </div>
         <nav className="hidden md:flex items-center gap-5">
  <a href="#features" className="neo-pill hover:ring-1 hover:ring-slate-600">Features</a>
  <a href="#how" className="neo-pill hover:ring-1 hover:ring-slate-600">How it Works</a>
  {/* <a href="#leaderboard" className="neo-pill hover:ring-1 hover:ring-slate-600">Leaderboard</a> */}
  <a href="#faq" className="neo-pill hover:ring-1 hover:ring-slate-600">FAQ</a>

 <div className="flex items-center gap-2 pr-2">
  <img
    src={effectiveAvatar}
    alt={avatarName}
    className="h-8 w-8 rounded-full ring-1 ring-slate-700 object-cover"
    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/bot1.png'; }}
  />
  <span className="text-xs text-slate-300 hidden lg:inline">{avatarName}</span>
</div>


  <a
    href="/login"
    className="rounded-2xl px-4 py-2 font-semibold text-slate-900
               bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-200
               shadow-[0_10px_30px_-10px_rgba(255,161,76,0.45)] hover:scale-[1.02] active:scale-[0.99] transition"
  >
    Login
  </a>
  <a
    href="/register"
    className="rounded-2xl px-4 py-2 font-semibold text-slate-900
               bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300
               shadow-[0_10px_30px_-10px_rgba(255,161,76,0.45)] hover:scale-[1.02] active:scale-[0.99] transition"
  >
    Sign Up
  </a>
</nav>

        </div>
      </header>

      {/* --- Hero --- */}
      <main className="relative z-10 pt-28 sm:pt-36 pb-16 px-6 text-center">
        <motion.h1
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="text-4xl md:text-6xl font-extrabold tracking-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-300 to-cyan-300">
            Gamified Coding Battles
          </span>
        </motion.h1>

        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.12 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-slate-300"
        >
          Train with AI-crafted challenges, duel in real time, and level up your code skills.
          <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300">
            Python, Java &amp; C++ supported.
          </span>
        </motion.p>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.22 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold
                       text-slate-900 bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300
                       shadow-[0_10px_30px_-10px_rgba(255,161,76,0.45)] hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <Bolt className="w-4 h-4" />
            Get Started
          </a>
          <a href="#features" className="neo-pill hover:ring-1 hover:ring-slate-600">
            <Sparkles className="w-4 h-4" />
            Explore Features
          </a>
        </motion.div>
{/* Choose Your Avatar (predefined) */}
{/* Avatar Showcase (view-only) */}
<div className="max-w-5xl mx-auto mt-10">
  <div className="neo-card">
    <div className="flex items-center gap-4">
      <img
        src={effectiveAvatar}
        alt="Current Avatar"
        className="h-20 w-20 rounded-full ring-1 ring-slate-700 object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/bot1.png'; }}
      />
      <div>
        <h4 className="text-cyan-200 font-semibold">Your Match Avatar</h4>
        <p className="text-sm text-slate-300">
          This is the avatar other players will see in <span className="text-amber-300 font-semibold">live 1v1 battles</span> and on the leaderboards.
          Avatars are preset—no uploads. Set your avatar in your profile once logged in.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Below are the available avatars used across the platform.
        </p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
      {AVATARS.map(a => {
        const isCurrent = selectedAvatarKey === a.key;
        return (
          <div
            key={a.key}
            className={[
              'relative rounded-2xl p-1 ring-1',
              isCurrent ? 'ring-amber-300 bg-slate-800/60' : 'ring-slate-700'
            ].join(' ')}
          >
            <img
              src={`/avatars/${a.key}`}
              alt={a.label}
              className="h-16 w-16 mx-auto rounded-xl object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/bot1.png'; }}
            />
            <span className="mt-1 block text-center text-[11px] text-slate-300">{a.label}</span>
            {isCurrent && (
              <span className="absolute -top-2 -right-2 text-[10px] rounded-full px-2 py-0.5 bg-amber-300 text-slate-900 font-bold">
                In Use
              </span>
            )}
          </div>
        );
      })}
    </div>

    <p className="mt-3 text-xs text-slate-400">
      Preview only. Your active avatar is configured in your account once you’re logged in.
    </p>
  </div>
</div>

        {/* floating callouts */}
        <div className="relative mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            ['Fair Matchmaking', 'Balanced, skill-aware pairings'],
            ['XP & stars', 'Progress that feels rewarding'],
            ['Fast Results', 'Instant judge & feedback'],
          ].map(([t, s], i) => (
            <motion.div
              key={t}
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-10% 0px' }}
              className="neo-card text-center"
            >
              <p className="font-semibold text-cyan-200">{t}</p>
              <p className="text-sm text-slate-300">{s}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- Features --- */}
      <section id="features" className="relative z-10 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300">
              Core Features
            </span>
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="neo-card hover:-translate-y-0.5 hover:shadow-[0_14px_44px_-14px_rgba(0,0,0,0.6)] transition"
              >
                <div className="neo-circle">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-cyan-200 text-center">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300 text-center">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How it Works --- */}
      <section id="how" className="relative z-10 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-cyan-200">How it Works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((h) => (
              <motion.div
                key={h.step}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="neo-card"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full grid place-items-center text-cyan-300 bg-slate-800/70 border border-slate-700/60 font-bold">
                    {h.step}
                  </span>
                  <h4 className="text-cyan-200 font-semibold">{h.title}</h4>
                </div>
                <p className="mt-3 text-sm text-slate-300">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Leaderboard Preview 
      <section id="leaderboard" className="relative z-10 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-cyan-200">Leaderboard</h2>

          <div className="mt-8 rounded-2xl bg-slate-900/60 ring-1 ring-slate-800/70 backdrop-blur-md overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-cyan-300/90 text-sm">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Stars</th>
                  <th className="py-3 px-4">Winrate</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[1,2,3,4,5].map((n) => (
                  <tr key={n} className="border-t border-slate-800/60">
                    <td className="py-3 px-4">{n}</td>
                    <td className="py-3 px-4">Player{n}</td>
                    <td className="py-3 px-4">{10+n}</td>
                    <td className="py-3 px-4">Gold {n}</td>
                    <td className="py-3 px-4">{70+n}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pb-4">
              <p className="mt-3 text-xs text-slate-400">* Preview data. Connect your API for live rankings.</p>
            </div>
          </div>
        </div>
      </section>--- */}

      {/* --- FAQ --- */}
      <section id="faq" className="relative z-10 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-cyan-200">FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl ring-1 ring-slate-800/70 bg-slate-900/60 backdrop-blur-md p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <p className="font-semibold text-cyan-200">{f.q}</p>
                  <span className="neo-pill">Read</span>
                </summary>
                <p className="mt-3 text-sm text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 border-t border-slate-800/70 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p className="text-sm text-slate-400">&copy; 2025 CODEXP AI. All rights reserved.</p>
          {/* <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
           <button
  onClick={() => setShowPrivacy(true)}
  className="hover:text-orange-300 transition"
>
  Privacy Policy
</button>
<span className="hidden sm:inline text-slate-600">•</span>
<button
  onClick={() => setShowRules(true)}
  className="hover:text-orange-300 transition"
>
  Game Rules
</button>
<span className="hidden sm:inline text-slate-600">•</span>
<a href="#faq" className="hover:text-orange-300 transition">Feedback</a>

          </div> */}
        </div>
      </footer>
      {/* ---------- Reusable Modal ---------- */}
{(showPrivacy || showRules) && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => { setShowPrivacy(false); setShowRules(false); }}
    />
    {/* panel */}
    <div className="relative z-[61] max-w-3xl w-[92%] md:w-[48rem] rounded-2xl ring-1 ring-slate-800 bg-slate-900/90 text-slate-200 shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-cyan-200">
          {showPrivacy ? 'Privacy Policy' : 'Game Rules'}
        </h3>
        <button
          onClick={() => { setShowPrivacy(false); setShowRules(false); }}
          className="neo-pill"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 max-h-[70vh] overflow-y-auto text-sm leading-relaxed">
        {showPrivacy && (
          <div className="space-y-4">
            <p>
              <strong>Data we collect.</strong> When you create an account, we collect your name, email,
              and gameplay activity (e.g., attempts, wins, XP). Optional profile images are stored to personalize your experience.
            </p>
            <p>
              <strong>How we use data.</strong> We provide matchmaking, scoring, leaderboards, and insights to improve your skills.
              We may use aggregated, anonymized data for analytics and platform improvements.
            </p>
            <p>
              <strong>Sharing.</strong> We do not sell your personal data. Public elements like usernames and ranks appear on leaderboards.
            </p>
            <p>
              <strong>Security.</strong> We apply standard safeguards and encourage strong passwords and email verification.
            </p>
            <p>
              <strong>Your controls.</strong> You can update or delete your account. Contact support if you need export or deletion assistance.
            </p>
            <p className="text-xs text-slate-400">
              *This is a starter policy. Replace with your legal copy when ready.
            </p>
          </div>
        )}

        {showRules && (
          <div className="space-y-4">
            <p>
              <strong>Fair Play.</strong> No cheating, collusion, or unauthorized tools during live matches.
              Respect time limits and problem constraints.
            </p>
            <p>
              <strong>Scoring.</strong> Fastest correct solution wins. Ties may use additional criteria like test coverage or code correctness.
            </p>
            <p>
              <strong>Conduct.</strong> Keep chat and usernames respectful. Offensive behavior can lead to penalties or suspensions.
            </p>
            <p>
              <strong>Appeals.</strong> Disputes can be reviewed by moderators. Their decision is final.
            </p>
            <p className="text-xs text-slate-400">
              *These are baseline rules. Customize to match your official Game Rules document.
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={() => { setShowPrivacy(false); setShowRules(false); }}
          className="rounded-2xl px-4 py-2 font-semibold text-slate-900 bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
