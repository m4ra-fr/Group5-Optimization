'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: verifyError } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice });

    if (verifyError) {
      setLoading(false);
      setError(verifyError.message ?? 'That code was not correct.');
      return;
    }

    const { data: session } = await authClient.getSession();
    setLoading(false);
    router.push(session?.user.role === 'buyer' ? '/buyer-dashboard' : '/farmer-dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-linear-to-br from-emerald-950 via-emerald-900 to-black font-sans text-gray-900">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 space-y-5">
        <h1 className="text-xl font-black text-center">Enter Your Code</h1>
        <p className="text-sm text-gray-700 text-center">
          {useBackup
            ? 'Enter one of your backup codes.'
            : 'Open your authenticator app and enter the 6-digit code.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder={useBackup ? 'Backup code' : '123456'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
          />

          {!useBackup && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs text-gray-700 font-bold">Trust this device for 30 days</span>
            </label>
          )}

          {error && (
            <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ccff00] hover:bg-lime-400 text-emerald-950 font-black text-sm py-3.5 rounded-2xl border border-lime-400 shadow-xl transition-all cursor-pointer disabled:opacity-60"
          >
            Verify
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setUseBackup(!useBackup); setCode(''); setError(''); }}
          className="w-full text-xs font-black text-emerald-800 hover:underline cursor-pointer"
        >
          {useBackup ? 'Use my authenticator app instead' : 'Use a backup code instead'}
        </button>

        <Link href="/login" className="block text-center text-xs font-bold text-gray-600 hover:text-emerald-900">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}