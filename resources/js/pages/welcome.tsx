// resources/js/Pages/Public/CodexpLandingPage.tsx
// CODEXP AI: A GAMIFIED COMPETITIVE CODING WEB-BASED PLATFORM
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Swords, Brain, BookOpen, Trophy, Sparkles, Bolt, ChartBarBig, ShieldCheck
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
  { title: 'Practice Mode', desc: 'Guided drills with hints and explanations.', icon: BookOpen },
  { title: 'Leaderboards', desc: 'Global ladder. Climb and defend your spot.', icon: Trophy },
];

const howItWorks = [
  { step: '1', title: 'Create Your Account', desc: 'Pick your main language (Python/Java) and set goals.' },
  { step: '2', title: 'Train/learn in Practice', desc: 'Warm up with guided practice and hints.' },
  { step: '3', title: 'Battle & Rank Up', desc: 'Enter 1v1s, earn XP, collect stars, and learn!' },
];

const faqs = [
  { q: 'Is this for beginners or advanced?', a: 'Both! Practice scales difficulty, and battles match similar skill.' },
  { q: 'What languages are supported?', a: 'Python and Java to start—more coming soon.' },
  { q: 'How are battles scored?', a: 'Fastest correct solution wins; ties consider quality and tests.' },
];

export default function CodexpLandingPage() {
  const [scrolled, setScrolled] = useState(false);
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
            <span className="text-lg sm:text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
              CODEXP AI
            </span>
            <span className="hidden sm:block text-[10px] sm:text-xs text-slate-400 tracking-[0.18em]">COMPETITIVE CODING</span>
          </div>
          <nav className="hidden md:flex items-center gap-5">
            <a href="#features" className="neo-pill hover:ring-1 hover:ring-slate-600">Features</a>
            <a href="#how" className="neo-pill hover:ring-1 hover:ring-slate-600">How it Works</a>
            <a href="#leaderboard" className="neo-pill hover:ring-1 hover:ring-slate-600">Leaderboard</a>
            <a href="#faq" className="neo-pill hover:ring-1 hover:ring-slate-600">FAQ</a>
            {/* New Login button */}
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
            Python &amp; Java supported.
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
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <a href="#" className="hover:text-orange-300 transition">Privacy Policy</a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a href="#leaderboard" className="hover:text-orange-300 transition">Game Rules</a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a href="#faq" className="hover:text-orange-300 transition">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
