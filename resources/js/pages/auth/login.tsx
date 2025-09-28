import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Users, Code, Star, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, FormEventHandler } from 'react';

export default function Login({ status, canResetPassword = false }: { status?: string; canResetPassword?: boolean }) {

  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  useEffect(() => setIsLoaded(true), []);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 text-white">
      <Head title="CODEXP AI: Login" />

      {/* ---- Animated Background (matches welcome) ---- */}
      {/* Moving blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-[40rem] w-[40rem] rounded-full blur-3xl bg-orange-500/10 animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl bg-indigo-500/10 animate-[pulse_18s_ease-in-out_infinite]" />
      {/* Subtle dot mesh */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Slow conic sweep */}
      <div
        aria-hidden
        className="absolute -inset-1 pointer-events-none animate-[spin_80s_linear_infinite]"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(255,179,79,0.06) 90deg, transparent 180deg, rgba(96,165,250,0.06) 270deg, transparent 360deg)',
        }}
      />

      {/* Back to Home */}
    <div className="absolute top-6 left-6 z-10">
    <button
        type="button"
        onClick={() => (window.location.href = route('home'))}
        className="flex items-center gap-2 hover:scale-105 transition-all text-sm font-semibold"
    >
        {/* Visible solid-colored icon */}
        <ArrowLeft className="w-4 h-4 text-yellow-300" />

        {/* Gradient text only */}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
        Back to Home
        </span>
    </button>
    </div>



      {/* ---- Login Card ---- */}
      <div
        className={[
          'w-full max-w-lg z-10 transition-all duration-700 ease-out',
          isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95',
        ].join(' ')}
      >
        {/* Outer glow frame */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-200/10 via-slate-200/5 to-transparent shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]">
          {/* Accent ring */}
          <div className="absolute -inset-[1px] rounded-3xl pointer-events-none ring-1 ring-slate-700/50" />

          <form
            onSubmit={submit}
            className="relative rounded-3xl bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10"
          >
            {/* Top glow divider */}
            <div className="absolute left-6 right-6 -top-[1px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            {/* Title */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="mr-2 grid place-items-center rounded-lg w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-slate-700/60">
                  <Code className="w-4 h-4 text-cyan-300" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300">
                  PLAYER LOGIN
                </h1>
              </div>
              <p className="text-sm text-slate-300/90">Access your competitive dashboard</p>
            </div>

            {/* Email */}
            <div className="space-y-2 mb-4">
              <label className="block text-cyan-300 font-semibold text-xs tracking-[0.12em]">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="peer w-full rounded-xl px-4 py-3 bg-slate-50 text-slate-900 border-2 border-transparent focus:border-cyan-500/70 outline-none transition"
                />
                <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 peer-focus:text-cyan-500 transition" />
                <div className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-0 peer-focus:opacity-100 transition bg-gradient-to-r from-cyan-300/10 via-violet-300/10 to-transparent" />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-cyan-300 font-semibold text-xs tracking-[0.12em]">
                  PASSWORD
                </label>
                {canResetPassword && (
                  <a
                    href={route('password.request')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="peer w-full rounded-xl px-4 py-3 bg-slate-50 text-slate-900 border-2 border-transparent focus:border-cyan-500/70 outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-500 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-0 peer-focus:opacity-100 transition bg-gradient-to-r from-cyan-300/10 via-violet-300/10 to-transparent" />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 mt-3 mb-1">
              <input
                id="remember"
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-400 border-slate-600 rounded bg-black/60"
              />
              <label htmlFor="remember" className="text-slate-300 text-sm">
                REMEMBER ME
              </label>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={processing}
              className={[
                'mt-3 w-full rounded-xl py-3 font-extrabold tracking-wide',
                'text-white shadow-lg transition-all duration-300',
                'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500',
                'hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 hover:shadow-cyan-500/35',
                'active:scale-[0.98] disabled:opacity-70',
                'relative overflow-hidden',
              ].join(' ')}
            >
              <span className="relative z-10">{processing ? 'CONNECTING...' : 'LOGIN'}</span>
              {/* soft sheen */}
              <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition duration-500"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 20%, transparent 40%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </button>

            {/* Status */}
            {status && (
              <div className="mt-3 text-center text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-md p-3 animate-pulse">
                {status}
              </div>
            )}

            {/* Divider */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent" />

            {/* Create Account */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">Don&apos;t have an account?</p>
              <button
                type="button"
                onClick={() => (window.location.href = route('register'))}
                className="w-full neo-pill justify-center hover:ring-1 hover:ring-slate-600 transition"
              >
                <Users className="w-5 h-5" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>CODEXP AI | GAMIFIED CODING PLATFORM v2.0</p>
          <p className="mt-1">© 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
