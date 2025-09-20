// CODEXP AI: A GAMIFIED COMPETITIVE CODING WEB-BASED PLATFORM
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CodexpLandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Player-facing features only
  const featureList = [
    { title: "Login & Sign Up", desc: "Secure auth with email verification and your player profile.", icon: "🔐" },
    { title: "Player Dashboard", desc: "Level, rank, winrate, and language stats at a glance.", icon: "📊" },
    { title: "Solo Mode", desc: "Beat curated or AI-generated problems. Earn XP and badges.", icon: "🧠" },
    { title: "1v1 Battle", desc: "Matchmaking, live timers, and instant scoring for head-to-head duels.", icon: "⚔️" },
    { title: "Practice Mode", desc: "Fill-in-the-blank code drills with hints and explanations.", icon: "📚" },
    { title: "Leaderboards", desc: "Global and friends leaderboard. Climb tiers and defend your spot.", icon: "🏆" },
  ];

  const howItWorks = [
    { step: "1", title: "Create Your Account", desc: "Sign up, pick your main language (Python/Java), and set your goals." },
    { step: "2", title: "Train in Practice", desc: "Warm up with guided practice and hints before going competitive." },
    { step: "3", title: "Battle & Rank Up", desc: "Enter 1v1s, earn XP and badges, and climb the ladder." },
  ];

  const faqs = [
    { q: "Is this for beginners or advanced?", a: "Both. Practice scales difficulty and battles match you with similar skill levels." },
    { q: "What languages are supported?", a: "Python and Java to start—more coming soon." },
    { q: "How are battles scored?", a: "Fastest correct solution wins; ties use code quality and test coverage." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f1a3f] shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* <img src="/codexp-logo.png" alt="CODEXP AI Logo" className="w-10 h-10" /> */}
            <h1 className="text-xl md:text-2xl font-bold text-cyan-400">CODEXP AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#how" className="hover:text-cyan-400 transition">How it Works</a>
            <a href="#leaderboard" className="hover:text-cyan-400 transition">Leaderboard</a>
            <a href="#faq" className="hover:text-cyan-400 transition">FAQ</a>
            <a href="/login" className="hover:text-cyan-400 transition">Login</a>
            <a href="/register" className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-md font-medium hover:from-cyan-400 hover:to-blue-400">Sign Up</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          variants={fadeIn}
          initial="hidden"
          animate="show"
        >
          Gamified Coding Battles
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto text-lg text-gray-300 mb-10"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          Train with AI-crafted challenges, duel in real time, and level up your coding. Python & Java supported.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <a href="/register" className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105">Get Started</a>
          <a href="#features" className="border border-cyan-500 text-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-500 hover:text-white transition-transform transform hover:scale-105">Explore Features</a>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="py-20 bg-[#0f1a3f] px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-10">Core Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
            {featureList.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-[#151f3b] rounded-xl p-6 border border-cyan-700 hover:shadow-cyan-500/40 shadow transition-all duration-300 hover:scale-105"
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-cyan-300 mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 bg-[#0a0a1f] px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 text-center mb-10">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                className="bg-[#151f3b] rounded-xl p-6 border border-cyan-700"
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                  <h4 className="text-lg font-semibold text-cyan-300">{item.title}</h4>
                </div>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="py-20 bg-[#0f1a3f] px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 text-center mb-10">Leaderboard</h3>
          <div className="bg-[#151f3b] rounded-xl p-6 border border-cyan-700 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-cyan-300 text-sm">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">Player</th>
                  <th className="py-3 px-2">Level</th>
                  <th className="py-3 px-2">Rank</th>
                  <th className="py-3 px-2">Winrate</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[1,2,3,4,5].map((n) => (
                  <tr key={n} className="border-t border-cyan-900/40">
                    <td className="py-3 px-2">{n}</td>
                    <td className="py-3 px-2">Player{n}</td>
                    <td className="py-3 px-2">{10 + n}</td>
                    <td className="py-3 px-2">Gold {n}</td>
                    <td className="py-3 px-2">{(70 + n)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">* Preview data. Connect to your API to populate live rankings.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#0a0a1f] px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 text-center mb-10">FAQ</h3>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-[#151f3b] rounded-lg p-5 border border-cyan-700">
                <p className="font-semibold text-cyan-300">{f.q}</p>
                <p className="text-gray-300 text-sm mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a1f] text-gray-400 text-center py-6 mt-10 border-t border-cyan-900">
        <p>&copy; 2025 CODEXP AI. All rights reserved.</p>
        <div className="mt-2 flex flex-col sm:flex-row justify-center space-x-0 sm:space-x-4 text-sm">
          <a href="#" className="hover:text-cyan-400 mb-1 sm:mb-0">Privacy Policy</a>
          <a href="#leaderboard" className="hover:text-cyan-400 mb-1 sm:mb-0">Game Rules</a>
          <a href="#faq" className="hover:text-cyan-400">Feedback</a>
        </div>
      </footer>
    </div>
  );
};

export default CodexpLandingPage;
