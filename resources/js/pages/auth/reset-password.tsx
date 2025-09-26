import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';

interface ResetPasswordProps {
  token: string;
  email: string;
}

type ResetPasswordForm = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, setData, post, processing, errors, reset } =
    useForm<Required<ResetPasswordForm>>({
      token,
      email,
      password: '',
      password_confirmation: '',
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 overflow-hidden">
      <Head title="Reset Password" />

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
              Reset Your Password
            </h1>
            <p className="mt-2 text-slate-300 text-sm">
              Enter a new password to regain access to your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Email (readonly) */}
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">
                EMAIL
              </label>
              <input
                type="email"
                value={data.email}
                readOnly
                className="w-full rounded-xl px-4 py-3 bg-slate-800/60 text-slate-300 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
              <InputError message={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-slate-800/60 text-slate-300 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none pr-12"
                  placeholder="Enter new password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <InputError message={errors.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) =>
                    setData('password_confirmation', e.target.value)
                  }
                  className="w-full rounded-xl px-4 py-3 bg-slate-800/60 text-slate-300 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none pr-12"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <InputError message={errors.password_confirmation} />
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
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
