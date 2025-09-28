import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({});
  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex items-center justify-center p-6">
      <Head title="Verify Email" />

      {/* --- Animated Background (same as welcome) --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,161,76,0.18), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(99,102,241,0.18), transparent 70%)',
        }}
      />
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
              Verify Your Email
            </h1>
            <p className="mt-2 text-slate-300 text-sm">
              We’ve sent a verification link to your email. Please check your inbox
              and confirm to continue.
            </p>
          </div>

          {/* Status */}
          {status === 'verification-link-sent' && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-slate-800/70 border border-cyan-400/40 p-3 text-sm text-cyan-300">
              <CheckCircle className="w-5 h-5 text-cyan-300" />
              A new verification link has been sent to your email address.
            </div>
          )}

          {/* Email Instruction */}
          <div className="mb-6 rounded-xl bg-slate-800/40 border border-slate-700/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-cyan-300" />
              <h3 className="text-sm font-semibold text-cyan-200">Check your email</h3>
            </div>
            <p className="text-sm text-slate-400">
              Click the link we sent to verify your account. Didn’t get it? You can resend below.
            </p>
          </div>

          {/* Resend Form */}
          <form onSubmit={submit} className="space-y-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-xl py-3 font-bold tracking-wide text-slate-900
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
                'Resend Verification Email'
              )}
            </button>
          </form>

       {/* Logout (Inertia POST) */}
{/* Logout (form with CSRF) */}
<form method="post" action={route('logout')} className="mt-6 text-center inline">
  <input
    type="hidden"
    name="_token"
    value={(document.querySelector('meta[name="csrf-token]') as HTMLMetaElement)?.content
      || (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
      || ''}
  />
  <button type="submit" className="text-sm text-slate-400 hover:text-cyan-300 transition">
    Log out
  </button>
</form>


        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          © 2025 CODEXP AI | GAMIFIED CODING PLATFORM
        </div>
      </div>
    </div>
  );
}
