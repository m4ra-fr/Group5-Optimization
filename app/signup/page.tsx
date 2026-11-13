'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Farmer Specific Fields
  const [farmName, setFarmName] = useState('');
  const [radaId, setRadaId] = useState('');
  const [parish, setParish] = useState('St. Elizabeth');
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'lynk'>('bank');
  const [bankName, setBankName] = useState('National Commercial Bank (NCB)');
  const [accountNumber, setAccountNumber] = useState('');
  const [lynkId, setLynkId] = useState('');

  // Buyer Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Hotel & Resort');
  const [trnNumber, setTrnNumber] = useState('');
  const [buyerPaymentPref, setBuyerPaymentPref] = useState<'card' | 'cash' | 'lynk'>('card');

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      name: fullName,
      email,
      password,
      role,
      phone,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? 'Could not create your account.');
      return;
    }

    router.push('/security');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans text-gray-900 py-4">
      
      {/* BACKGROUND OVERLAY */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url("/images/Farmer's-Dashboard-Background.jfif")` }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-emerald-950/90 via-emerald-900/80 to-black/85 backdrop-blur-[2px]"></div>
      </div>

      {/* TOP HEADER BAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-3 flex justify-between items-center z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg h-16 my-2">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img src="/images/logo.png" alt="Agri-Connect JA Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
          <span className="font-black text-emerald-950 text-sm sm:text-base tracking-wide">
            AGRI-CONNECT <span className="text-amber-600">JA</span>
          </span>
        </Link>
        <Link 
          href="/login" 
          className="text-xs sm:text-sm font-black text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-all border border-emerald-300 shadow-sm"
        >
          Already registered? Sign In →
        </Link>
      </header>

      {/* MAIN REGISTRATION CONTAINER */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 z-10">
        <div className="bg-white/95 border border-white/60 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          
          {/* BRANDING CARD HEADER */}
          <div className="flex flex-col items-center text-center space-y-2 border-b border-gray-200/80 pb-5">
            <img 
              src="/images/logo.png" 
              alt="Agri-Connect JA Logo" 
              className="h-20 w-auto object-contain drop-shadow-sm" 
            />
            <p className="text-xs sm:text-sm font-black text-emerald-900 uppercase tracking-widest">
              Empowering Agriculture, Growing Jamaica
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 pt-1">Create Your Account</h1>
          </div>

          {/* ROLE TOGGLE */}
          <div className="grid grid-cols-2 gap-3 bg-gray-100 p-2 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                role === 'farmer'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-gray-600 hover:text-emerald-950'
              }`}
            >
               Registered Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                role === 'buyer'
                  ? 'bg-indigo-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-950'
              }`}
            >
               Commercial Buyer
            </button>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            
            {/* COMMON FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-800 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Reid"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-800 block">Phone Contact (JA 876)</label>
                <input
                  type="tel"
                  required
                  placeholder="876-555-0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-800 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-800 block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* FARMER SECTION */}
            {role === 'farmer' && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Farm & Payout Information</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-md">Verified Trust</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-800 block">Farm / Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reid's Organic Valley Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-800 block">RADA Registration ID #</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. #84920"
                      value={radaId}
                      onChange={(e) => setRadaId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-black text-emerald-950 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-800 block">Primary Farm Parish</label>
                    <select
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    >
                      <option value="St. Elizabeth">St. Elizabeth</option>
                      <option value="Manchester">Manchester</option>
                      <option value="Trelawny">Trelawny</option>
                      <option value="Clarendon">Clarendon</option>
                      <option value="Portland">Portland</option>
                      <option value="St. Ann">St. Ann</option>
                      <option value="St. Catherine">St. Catherine</option>
                      <option value="Westmoreland">Westmoreland</option>
                    </select>
                  </div>
                </div>

                {/* FARMER PAYOUT SELECTION */}
                <div className="space-y-2 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <label className="text-xs font-black text-emerald-950 block">Payout Deposit Preference</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        payoutMethod === 'bank' ? 'bg-emerald-900 text-white border-emerald-900 shadow-md' : 'bg-white text-gray-700'
                      }`}
                    >
                       Jamaican Bank Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('lynk')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        payoutMethod === 'lynk' ? 'bg-emerald-900 text-white border-emerald-900 shadow-md' : 'bg-white text-gray-700'
                      }`}
                    >
                       Lynk Wallet / JAM-DEX
                    </button>
                  </div>

                  {payoutMethod === 'bank' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                      >
                        <option value="National Commercial Bank (NCB)">NCB</option>
                        <option value="Scotiabank Jamaica">Scotiabank</option>
                        <option value="Sagicor Bank">Sagicor Bank</option>
                        <option value="JN Bank">JN Bank</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <div className="pt-2">
                      <input
                        type="text"
                        required
                        placeholder="Lynk ID or Registered Mobile #"
                        value={lynkId}
                        onChange={(e) => setLynkId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* BUYER SECTION */}
            {role === 'buyer' && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">Commercial Procurement Details</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-900 font-black px-2.5 py-0.5 rounded-md">B2B Account</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-800 block">Company / Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandals Resorts Procurement"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-800 block">Business Category</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    >
                      <option value="Hotel & Resort">Hotel & Resort</option>
                      <option value="Supermarket Chain">Supermarket Chain</option>
                      <option value="Restaurant / Food Service">Restaurant / Food Service</option>
                      <option value="Produce Exporter">Produce Exporter</option>
                      <option value="Wholesale Distributor">Wholesale Distributor</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-800 block">Business TRN #</label>
                    <input
                      type="text"
                      required
                      placeholder="9-digit TRN Number"
                      value={trnNumber}
                      onChange={(e) => setTrnNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* BUYER PAYMENT PREFERENCE */}
                <div className="space-y-2 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
                  <label className="text-xs font-black text-indigo-950 block">Preferred Checkout Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBuyerPaymentPref('card')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                        buyerPaymentPref === 'card' ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' : 'bg-white text-gray-700'
                      }`}
                    >
                       Card Escrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyerPaymentPref('lynk')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                        buyerPaymentPref === 'lynk' ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' : 'bg-white text-gray-700'
                      }`}
                    >
                       LynkBiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyerPaymentPref('cash')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                        buyerPaymentPref === 'cash' ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' : 'bg-white text-gray-700'
                      }`}
                    >
                       Cash/COD
                    </button>
                  </div>
                </div>

              </div>
            )}

            {error && (
              <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccff00] hover:bg-lime-400 text-emerald-950 font-black text-sm sm:text-base py-4 rounded-2xl border border-lime-400 shadow-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] mt-3"
            >
              Create Account & Set Up Security → {role === 'farmer' ? 'Field Control' : 'Marketplace'} →
            </button>

          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-2 flex justify-center text-xs font-bold text-emerald-100/80 z-10">
        <span>© 2026 Agri-Connect JA. All Rights Reserved.</span>
      </footer>

    </div>
  );
}