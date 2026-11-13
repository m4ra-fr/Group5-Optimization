'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

// =========================================================================
// TESTIMONIAL DATASET ACROSS JAMAICAN PARISHES
// =========================================================================
const farmerTestimonials = [
  {
    id: 1,
    quote: "Agri-Connect sensors reduced my water usage by 30% in St. Elizabeth.",
    name: "Marcus Reid",
    role: "Pepper & Yam Farmer",
    parish: "St. Elizabeth",
    avatar: "",
  },
  {
    id: 2,
    quote: "Sold 2,000 lbs of Irish potatoes straight to a Montego Bay hotel in 2 days!",
    name: "Devon Campbell",
    role: "Irish Potato Cultivator",
    parish: "Manchester",
    avatar: "",
  },
  {
    id: 3,
    quote: "The microclimate weather warnings saved my sweet pepper crop before the heavy rains.",
    name: "Keneisha Sterling",
    role: "Greenhouse Operator",
    parish: "Clarendon",
    avatar: "",
  },
  {
    id: 4,
    quote: "RADA verification built instant trust with commercial buyers in Kingston.",
    name: "Oraine Thompson",
    role: "Yellow Yam Supplier",
    parish: "Trelawny",
    avatar: "",
  },
  {
    id: 5,
    quote: "Remote drip valve control saved me 4 hours of daily walking across my field blocks.",
    name: "Alphonso Wright",
    role: "Vegetable Farmer",
    parish: "St. Ann",
    avatar: "",
  },
  {
    id: 6,
    quote: "Booking refrigerated crop haulage right from the platform keeps my produce fresh.",
    name: "Samantha Morgan",
    role: "Organic Produce Grower",
    parish: "Portland",
    avatar: "",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Testimonial Deck State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % farmerTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % farmerTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + farmerTestimonials.length) % farmerTestimonials.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? 'Could not sign you in.');
      return;
    }

    // Accounts with 2FA on are redirected to /two-factor automatically
    if (!data || 'twoFactorRedirect' in data) return;

    router.push(data.user.role === 'buyer' ? '/buyer-dashboard' : '/farmer-dashboard');
  };

  const activeReview = farmerTestimonials[currentSlide];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden font-sans text-gray-900">
      
      {/* ========================================================================= */}
      {/* FULL-BLEED BACKGROUND IMAGE WITH GRADIENT OVERLAY                        */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 transition-all duration-700"
        style={{ backgroundImage: `url('/images/farm-background.jpg')` }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-emerald-950/85 via-emerald-900/60 to-black/75 backdrop-blur-[2px]"></div>
      </div>

      {/* ========================================================================= */}
      {/* TOP MINIMAL BAR                                                          */}
      {/* ========================================================================= */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-end items-center z-10">
        <Link 
          href="/" 
          className="text-sm font-black text-white bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl backdrop-blur-md transition-all border border-white/20 shadow-md"
        >
          ← Return to Home
        </Link>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center flex-1 z-10">
        
        {/* LEFT COLUMN: HERO HEADLINE + INTERACTIVE TESTIMONIAL DECK (6 COLS) */}
        <div className="lg:col-span-6 space-y-8 text-white hidden lg:block">
          
          <div className="space-y-4">
            <span className="bg-[#ccff00] text-emerald-950 text-xs font-black uppercase px-4 py-1.5 rounded-full shadow-lg border border-lime-400 inline-block">
              🇯🇲 Empowering 14 Parishes
            </span>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
              Real-Time Field Telemetry & B2B Crop Sourcing.
            </h1>
            <p className="text-emerald-100 text-base font-medium leading-relaxed">
              Log in to manage live soil moisture sensors, trigger automated drip irrigation valves, or list harvests directly for commercial buyer procurement.
            </p>
          </div>

          {/* LIVE STATS BADGES */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md">
              <span className="text-2xl xl:text-3xl font-black text-[#ccff00] block">3,850+</span>
              <span className="text-xs font-bold text-emerald-100 uppercase">RADA Farmers</span>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md">
              <span className="text-2xl xl:text-3xl font-black text-white block">1,240</span>
              <span className="text-xs font-bold text-emerald-100 uppercase">Active Probes</span>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md">
              <span className="text-2xl xl:text-3xl font-black text-[#ccff00] block">14</span>
              <span className="text-xs font-bold text-emerald-100 uppercase">Parishes</span>
            </div>
          </div>

          {/* INTERACTIVE FARMER TESTIMONIAL DECK */}
          <div className="bg-emerald-900/60 border border-emerald-500/40 p-6 rounded-3xl backdrop-blur-md space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-[#ccff00] bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-700">
                📍 {activeReview.parish} Farmer Voice
              </span>

              {/* MANUAL NAVIGATION ARROWS */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevSlide}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Previous Review"
                >
                  ◀
                </button>
                <span className="text-xs font-bold text-emerald-200 px-1">
                  {currentSlide + 1} / {farmerTestimonials.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Next Review"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* TESTIMONIAL CARD BODY */}
            <div className="flex items-start gap-4 min-h-18 transition-all duration-300">
              <div className="w-14 h-14 bg-[#ccff00] text-emerald-950 rounded-full font-black flex items-center justify-center text-2xl shrink-0 shadow-md">
                {activeReview.avatar}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white italic text-base leading-snug">
                  "{activeReview.quote}"
                </p>
                <p className="text-emerald-300 font-black text-xs sm:text-sm">
                  — {activeReview.name}, <span className="text-emerald-100 font-medium">{activeReview.role}</span>
                </p>
              </div>
            </div>

            {/* PAGINATION DOTS */}
            <div className="flex justify-center items-center gap-2 pt-1">
              {farmerTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-8 bg-[#ccff00]' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: WIDER & LARGER AGRICOLUS-STYLE LOGIN CARD (6 COLS) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white/95 border border-white/50 rounded-3xl shadow-2xl backdrop-blur-xl p-8 sm:p-10 space-y-7">
            
            {/* EMBEDDED LOGO & SLOGAN HEADER */}
            <div className="flex flex-col items-center text-center space-y-2 pt-1 pb-1">
              <Link href="/" className="cursor-pointer">
                <img 
                  src="/images/logo.png" 
                  alt="Agri-Connect JA Logo" 
                  style={{ height: '105px', width: 'auto', transform: 'scale(1.2)' }}
                  className="object-contain" 
                />
              </Link>
              <span className="text-sm sm:text-base font-black text-emerald-900 uppercase tracking-wider pt-3">
                Empowering Agriculture, Growing Jamaica
              </span>
              <p className="text-sm text-gray-600 font-semibold pt-1">
                Sign in to access your farm telemetry portal
              </p>
            </div>

            {/* USER ROLE SELECTOR */}
            <div className="grid grid-cols-2 gap-3 bg-gray-100 p-2 rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-3 text-sm sm:text-base font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === 'farmer'
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-gray-600 hover:text-emerald-950'
                }`}
              >
                 Farmer Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-3 text-sm sm:text-base font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === 'buyer'
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-gray-600 hover:text-emerald-950'
                }`}
              >
                Commercial Buyer
              </button>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-800 block">
                  {role === 'farmer' ? 'Email Address' : 'Company Procurement Email'}
                </label>
                <input
                  type="email"
                  required
                  placeholder={role === 'farmer' ? 'farmer@gmail.com' : 'procurement@resort.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-sm sm:text-base font-semibold text-gray-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-gray-800">Password</label>
                  <a href="#" className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-sm sm:text-base font-semibold text-gray-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-gray-300"
                  />
                  <span className="text-xs sm:text-sm text-gray-700 font-bold">Remember this device</span>
                </label>
              </div>

              {error && (
                <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ccff00] hover:bg-lime-400 text-emerald-950 font-black text-base py-4.5 rounded-2xl border border-lime-400 shadow-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] mt-3"
              >
                Sign In to {role === 'farmer' ? 'Field Control' : 'Marketplace'} →
              </button>

            </form>

            {/* FOOTER REGISTRATION LINK */}
            <div className="text-center border-t border-gray-100 pt-5 text-sm font-semibold text-gray-600">
              Don't have an account yet?{' '}
              <Link href="/signup" className="font-extrabold text-emerald-800 hover:underline">
                Register your Farm
              </Link>
            </div>

          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* FOOTER BAR                                                                */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm font-bold text-emerald-100/80 z-10 gap-2">
        <span>© 2026 Agri-Connect JA. All Rights Reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">RADA Verification</a>
        </div>
      </footer>

    </div>
  );
}