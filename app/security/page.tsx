'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { authClient } from '@/lib/auth-client';

export default function SecurityPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const dashboardHref =
    session?.user.role === 'buyer' ? '/buyer-dashboard' : '/farmer-dashboard';

  const [step, setStep] = useState<'start' | 'scan' | 'done'>('start');
  const [password, setPassword] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: enableError } = await authClient.twoFactor.enable({ password });
    setLoading(false);
    if (enableError || !data) {
      setError(enableError?.message ?? 'Could not start setup.');
      return;
    }

    if (data.method !== 'totp') {
      setError('Authenticator app setup is not available right now.');
      return;
    }

    setTotpURI(data.totpURI);
    setBackupCodes(data.backupCodes);
    setStep('scan');
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: verifyError } = await authClient.twoFactor.verifyTotp({ code });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message ?? 'That code was not correct.');
      return;
    }
    setStep('done');
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700';
  const buttonClass =
    'w-full bg-[#ccff00] hover:bg-lime-400 text-emerald-950 font-black text-sm py-3.5 rounded-2xl border border-lime-400 shadow-xl transition-all cursor-pointer disabled:opacity-60';

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-linear-to-br from-emerald-950 via-emerald-900 to-black font-sans text-gray-900">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 space-y-5">
        <h1 className="text-xl font-black text-center">Two-Factor Authentication</h1>

        {isPending ? (
          <p className="text-sm text-center text-gray-600">Loading…</p>
        ) : !session ? (
          <p className="text-sm text-center text-gray-700">
            Please <Link href="/login" className="font-black text-emerald-800 underline">sign in</Link> first.
          </p>
        ) : (
          <>
            {session.user.twoFactorEnabled && step === 'start' && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  Two-factor authentication is already turned on for this account.
                </p>
                <button
                  type="button"
                  onClick={() => { window.location.href = dashboardHref; }}
                  className={buttonClass}
                >
                  Continue to dashboard →
                </button>
              </div>
            )}

            {step === 'start' && !session.user.twoFactorEnabled && (
              <form onSubmit={startSetup} className="space-y-4">
                <p className="text-sm text-gray-700">
                  Confirm your password to begin. You will need an authenticator app such as Google Authenticator or Authy.
                </p>
                <input
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  Turn on 2FA
                </button>
              </form>
            )}

            {step === 'scan' && (
              <form onSubmit={confirmCode} className="space-y-4">
                <p className="text-sm text-gray-700">
                  Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
                </p>
                <div className="flex justify-center bg-white p-3 rounded-xl border border-gray-200">
                  <QRCode value={totpURI} size={176} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  Verify and finish
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  Two-factor authentication is now on.
                </p>
                <p className="text-sm text-gray-700">
                  Save these backup codes somewhere safe. Each one works once if you lose your phone. They will not be shown again.
                </p>

                <button
                  type="button"
                  onClick={() => { window.location.href = dashboardHref; }}
                  className={buttonClass}
                >
                  I've saved my codes, continue to dashboard →
                </button>

                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-3 rounded-xl font-mono text-sm font-bold">
                  {backupCodes.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button type="button" onClick={handleSignOut} className="w-full text-xs font-black text-gray-600 hover:text-emerald-900 cursor-pointer">
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}