import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
    email: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 overflow-hidden">
      <Head title="Forgot Password" />

      {/* --- Animated Background --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,161,76,0.18), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(99,102,241,0.18), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden
        className="absolute -inset-1 pointer-events-none animate-[spin_80s_linear_infinite]"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(255,179,79,0.06) 90deg, transparent 180deg, rgba(96,165,250,0.06) 270deg, transparent 360deg)',
        }}
      />

      {/* --- Card --- */}
      <div className="relative w-full max-w-lg z-10">
        <div className="rounded-3xl bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] ring-1 ring-slate-800/70">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300">
              Forgot Password
            </h1>
            <p className="mt-2 text-slate-300 text-sm">
              Enter your email and we’ll send you a link to reset your password.
            </p>
          </div>

          {/* Status */}
          {status && (
            <div className="mb-6 text-center text-sm font-medium text-cyan-300">
              {status}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                autoFocus
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl px-4 py-3 bg-slate-800/60 text-slate-300 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
              <InputError message={errors.email} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="mt-4 w-full rounded-xl py-3 font-extrabold tracking-wide text-slate-900
                         bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300
                         hover:from-orange-300 hover:via-amber-200 hover:to-yellow-200
                         shadow-[0_10px_30px_-10px_rgba(255,161,76,0.45)]
                         hover:scale-[1.01] active:scale-[0.98] transition flex items-center justify-center"
            >
              {processing ? (
                <>
                  <LoaderCircle className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-900" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Remember your password?{' '}
            <a
              href={route('login')}
              className="text-cyan-300 hover:text-cyan-200 transition"
            >
              Log in
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          © 2025 CODEXP AI | GAMIFIED CODING PLATFORM
        </div>
      </div>
    </div>
  );
}
