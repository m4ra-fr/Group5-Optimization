'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function FarmerDashboardPage() {

  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  // Navigation & Interactive Tabs
  const [activeTab, setActiveTab] = useState<'harvest' | 'loss' | 'marketplace'>('harvest');

  // Single Sensor Real-Time Telemetry State
  const [sensorData, setSensorData] = useState({
    id: 'SENSOR-001',
    location: 'Block A - Sweet Pepper Field',
    moisture: 32, // Triggering "Needs Water" alert mockup
    temp: 31,     // High temperature
    humidity: 64,
    ph: 6.5,
    lastUpdated: 'Just now',
  });

  // Historical Chart Data Points
  const chartPoints = [
    { time: '6 AM', moisture: 48 },
    { time: '8 AM', moisture: 42 },
    { time: '10 AM', moisture: 38 },
    { time: '12 PM', moisture: 35 },
    { time: '2 PM', moisture: 32 },
  ];

  // 1. Farmer Payout Settings State
  const [payoutSettings, setPayoutSettings] = useState({
    bankName: 'National Commercial Bank (NCB)',
    accountNumber: '••••••••8492',
    accountType: 'Savings',
  });

  // 2. Produce Photo Uploader State & Handler
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoUrl(URL.createObjectURL(file));
    }
  };

  // 3. Log Harvest State & Logs (Single Declaration)
  const [harvestForm, setHarvestForm] = useState({
    crop: '',
    amount: '',
    grade: 'Grade A',
    date: '',
  });

  useEffect(() => {
    setHarvestForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const [harvestLogs, setHarvestLogs] = useState([
    { id: 1, crop: 'Sweet Pepper', amount: '850 lbs', grade: 'Grade A', date: '2026-11-01' },
    { id: 2, crop: 'Yellow Yam', amount: '1,200 lbs', grade: 'Grade B', date: '2026-10-28' },
  ]);

  // 4. Report Loss State & Logs
  const [lossForm, setLossForm] = useState({
    crop: '',
    reason: 'Pest Infestation',
    action: 'Chemical Spraying',
    lbsLost: '',
    notes: '',
  });

  const [lossLogs, setLossLogs] = useState([
    { id: 1, crop: 'Scotch Bonnet', reason: 'Pest Infestation', action: 'Sprayed Organic Pesticide', lbsLost: '120 lbs', date: '2026-10-25' },
  ]);

  // 5. Produce Marketplace State & Activity Logs
  const [marketForm, setMarketForm] = useState({
    crop: '',
    quantity: '',
    price: '',
    grade: 'Grade A',
    delivery: 'Farm Gate Pickup',
    parish: 'St. Elizabeth',
    phone: '876-555-0192',
  });

  const [marketActivity, setMarketActivity] = useState([
    { id: 1, crop: 'Sweet Pepper', quantity: '500 lbs', price: '$380 JMD/lb', status: 'PAID & DELIVERED', buyer: 'Sandals Whitehouse' },
    { id: 2, crop: 'Yellow Yam', quantity: '1,000 lbs', price: '$195 JMD/lb', status: 'OFFER PENDING', buyer: 'Hi-Lo Supermarket' },
  ]);

  // Handlers
  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestForm.crop || !harvestForm.amount) return;
    setHarvestLogs([
      { id: Date.now(), crop: harvestForm.crop, amount: `${harvestForm.amount} lbs`, grade: harvestForm.grade, date: harvestForm.date },
      ...harvestLogs,
    ]);
    setHarvestForm({ crop: '', amount: '', grade: 'Grade A', date: new Date().toISOString().split('T')[0] });
  };

  const handleLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossForm.crop || !lossForm.lbsLost) return;
    setLossLogs([
      { id: Date.now(), crop: lossForm.crop, reason: lossForm.reason, action: lossForm.action, lbsLost: `${lossForm.lbsLost} lbs`, date: new Date().toISOString().split('T')[0] },
      ...lossLogs,
    ]);
    setLossForm({ crop: '', reason: 'Pest Infestation', action: 'Chemical Spraying', lbsLost: '', notes: '' });
  };

  const handleMarketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketForm.crop || !marketForm.quantity || !marketForm.price) return;
    setMarketActivity([
      { id: Date.now(), crop: marketForm.crop, quantity: `${marketForm.quantity} lbs`, price: `$${marketForm.price} JMD/lb`, status: 'LISTED ACTIVE', buyer: 'Open to Bids' },
      ...marketActivity,
    ]);
    setMarketForm({ crop: '', quantity: '', price: '', grade: 'Grade A', delivery: 'Farm Gate Pickup', parish: 'St. Elizabeth', phone: '876-555-0192' });
    setNewPhotoUrl('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-gray-900">
      
      {/* FULL-BLEED BACKGROUND WITH EMERALD OVERLAY */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url("/images/Farmer's-Dashboard-Background.jfif")` }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-emerald-950/40 via-emerald-900/30 to-black/50 backdrop-blur-[1px]"></div>
      </div>

      {/* HEADER */}
      <header className="bg-white/95 border-b border-white/20 px-6 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md shadow-lg h-20">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center shrink-0 cursor-pointer">
            <img 
              src="/images/logo.png" 
              alt="Agri-Connect JA Logo" 
              className="h-14 w-auto object-contain drop-shadow-xs" 
            />
          </Link>
          
          <div className="h-8 w-px bg-gray-300 hidden sm:block" />
          
          <span className="font-black text-emerald-950 text-base sm:text-lg tracking-wide whitespace-nowrap">
            Farmer Field Control
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-300">
             RADA Farmer ID: #84920
          </span>
          <Link
            href="/security"
            className="text-xs sm:text-sm font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-1.5 rounded-full border border-emerald-300 transition-all"
          >
          🔒 Security
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs sm:text-sm font-black text-gray-800 hover:text-emerald-800 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8 z-10">
        
        {/* TOP ALERT BANNER */}
        {(sensorData.moisture < 35 || sensorData.temp > 30) && (
          <div className="bg-amber-400/95 text-slate-950 p-5 rounded-3xl shadow-xl border-2 border-amber-300 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl"> </span>
              <div>
                <h3 className="font-black text-base sm:text-lg uppercase tracking-wider">Field Alert: Action Required</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {sensorData.moisture < 35 && `• Soil Moisture Low (${sensorData.moisture}%): Irrigation recommended. `}
                  {sensorData.temp > 30 && `• High Soil Temp (${sensorData.temp}°C): Heat stress risk.`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSensorData({ ...sensorData, moisture: 55 })}
              className="bg-emerald-950 text-[#ccff00] hover:bg-emerald-900 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md cursor-pointer shrink-0"
            >
              Trigger Drip Valve (Quick Hydrate)
            </button>
          </div>
        )}

        {/* SECTION 1: TELEMETRY + WEATHER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white/65 border border-white/50 p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-black px-3 py-1 rounded-md uppercase tracking-wider">
                    {sensorData.id}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-gray-600">Updated {sensorData.lastUpdated}</span>
                </div>
                <h2 className="text-2xl font-black text-emerald-950 mt-1.5">{sensorData.location}</h2>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-xl border border-emerald-300">
                ● Live Probing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/60 p-4 rounded-2xl border border-white/70 space-y-1.5">
                <span className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-wide">Moisture</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-700">{sensorData.moisture}%</p>
                <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-md ${sensorData.moisture < 35 ? 'bg-amber-200 text-amber-950' : 'bg-emerald-100 text-emerald-900'}`}>
                  {sensorData.moisture < 35 ? 'Needs Water' : 'Optimal'}
                </span>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-white/70 space-y-1.5">
                <span className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-wide">Temp</span>
                <p className="text-3xl sm:text-4xl font-black text-amber-600">{sensorData.temp}°C</p>
                <span className="inline-block text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-md">
                  Warm
                </span>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-white/70 space-y-1.5">
                <span className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-wide">Humidity</span>
                <p className="text-3xl sm:text-4xl font-black text-sky-600">{sensorData.humidity}%</p>
                <span className="inline-block text-xs font-black bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md">
                  Good
                </span>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-white/70 space-y-1.5">
                <span className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-wide">Soil pH</span>
                <p className="text-3xl sm:text-4xl font-black text-purple-600">{sensorData.ph}</p>
                <span className="inline-block text-xs font-black bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md">
                  Balanced
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-black">
                <span className="text-gray-800">Today's Soil Moisture Trend (% over 8 hours)</span>
                <span className="text-emerald-800">Target Level: 50%</span>
              </div>
              
              <div className="bg-white/60 p-5 rounded-2xl border border-white/70 flex items-end justify-between gap-3 h-40 pt-8">
                {chartPoints.map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs sm:text-sm font-black text-emerald-950">{pt.moisture}%</span>
                    <div 
                      className="w-full bg-emerald-700 hover:bg-emerald-600 rounded-t-lg transition-all"
                      style={{ height: `${pt.moisture}%` }}
                    />
                    <span className="text-xs sm:text-sm font-extrabold text-gray-700">{pt.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-linear-to-br from-emerald-900/90 via-emerald-950/90 to-black/90 text-white p-6 sm:p-8 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="bg-[#ccff00] text-emerald-950 text-xs font-black uppercase px-3 py-1 rounded-full">
                  St. Elizabeth Forecast
                </span>
                <span className="text-3xl">☀️</span>
              </div>

              <div>
                <p className="text-5xl sm:text-6xl font-black text-white">29°C</p>
                <p className="text-sm sm:text-base font-extrabold text-emerald-200 mt-1">Optimal Spraying Weather</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold pt-3 border-t border-emerald-800">
                <div>
                  <span className="text-emerald-300 block text-xs uppercase font-extrabold">Wind Speed</span>
                  <span className="font-black text-white">12 km/h SSW</span>
                </div>
                <div>
                  <span className="text-emerald-300 block text-xs uppercase font-extrabold">Rain Chance</span>
                  <span className="font-black text-white">15% Humidity</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800/80 space-y-2">
              <span className="text-xs font-black uppercase text-emerald-300 tracking-wider block">3-Day Parish Outlook</span>
              <div className="flex justify-between text-xs sm:text-sm font-extrabold pt-1">
                <span>Wed: 30°C ☀️</span>
                <span>Thu: 28°C 🌧️</span>
                <span>Fri: 29°C ⛅</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: FARMER FIELD HUB (3 TAB SYSTEM) */}
        <div className="bg-white/65 border border-white/50 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-wrap gap-2 border-b border-gray-200/80 pb-4">
            <button
              onClick={() => setActiveTab('harvest')}
              className={`px-5 py-3.5 rounded-2xl text-xs sm:text-base font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'harvest'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-white/70 text-gray-800 hover:bg-white'
              }`}
            >
               Log Harvest Calendar
            </button>
            <button
              onClick={() => setActiveTab('loss')}
              className={`px-5 py-3.5 rounded-2xl text-xs sm:text-base font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'loss'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-white/70 text-gray-800 hover:bg-white'
              }`}
            >
               Report Crop Loss
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-5 py-3.5 rounded-2xl text-xs sm:text-base font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'marketplace'
                  ? 'bg-indigo-900 text-white shadow-md'
                  : 'bg-white/70 text-gray-800 hover:bg-white'
              }`}
            >
               Produce Marketplace
            </button>
          </div>

          {/* TAB 1: LOG HARVEST */}
          {activeTab === 'harvest' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form onSubmit={handleHarvestSubmit} className="lg:col-span-5 space-y-4 bg-white/50 p-6 rounded-2xl border border-white/60">
                <h3 className="font-black text-emerald-950 text-lg">Record New Harvest</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-gray-800">Crop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sweet Pepper, Yellow Yam"
                    value={harvestForm.crop}
                    onChange={(e) => setHarvestForm({ ...harvestForm, crop: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Amount (lbs)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={harvestForm.amount}
                      onChange={(e) => setHarvestForm({ ...harvestForm, amount: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Product Grade</label>
                    <select
                      value={harvestForm.grade}
                      onChange={(e) => setHarvestForm({ ...harvestForm, grade: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    >
                      <option value="Grade A">Grade A (Premium)</option>
                      <option value="Grade B">Grade B (Standard)</option>
                      <option value="Grade C">Grade C (Processing)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ccff00] hover:bg-lime-400 text-emerald-950 font-black text-sm sm:text-base py-3.5 rounded-xl border border-lime-400 cursor-pointer shadow-md transition-transform active:scale-95 mt-2"
                >
                  + Save to Harvest Calendar
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-black text-emerald-950 text-lg">Recent Harvest Logs</h3>
                <div className="overflow-x-auto border border-gray-200/80 rounded-2xl bg-white/70">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-emerald-900 text-white font-black">
                      <tr>
                        <th className="p-3.5">Crop</th>
                        <th className="p-3.5">Harvested</th>
                        <th className="p-3.5">Grade</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                      {harvestLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/50">
                          <td className="p-3.5 text-emerald-950 font-black">{log.crop}</td>
                          <td className="p-3.5">{log.amount}</td>
                          <td className="p-3.5"><span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md text-xs font-black">{log.grade}</span></td>
                          <td className="p-3.5 text-gray-600">{log.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORT LOSS */}
          {activeTab === 'loss' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form onSubmit={handleLossSubmit} className="lg:col-span-5 space-y-4 bg-red-50/60 p-6 rounded-2xl border border-red-200">
                <h3 className="font-black text-red-950 text-lg">Report Crop Loss Event</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-gray-800">Crop Affected</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scotch Bonnet"
                    value={lossForm.crop}
                    onChange={(e) => setLossForm({ ...lossForm, crop: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Primary Cause</label>
                    <select
                      value={lossForm.reason}
                      onChange={(e) => setLossForm({ ...lossForm, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    >
                      <option value="Pest Infestation">Pest Infestation</option>
                      <option value="Flood & Heavy Rain">Flood & Heavy Rain</option>
                      <option value="Drought & Heat">Drought & Heat</option>
                      <option value="Crop Disease">Crop Disease</option>
                      <option value="Praedial Larceny (Theft)">Praedial Larceny (Theft)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Loss Weight (lbs)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={lossForm.lbsLost}
                      onChange={(e) => setLossForm({ ...lossForm, lbsLost: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-gray-800">Action Taken</label>
                  <select
                    value={lossForm.action}
                    onChange={(e) => setLossForm({ ...lossForm, action: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                  >
                    <option value="Chemical Spraying">Chemical Spraying</option>
                    <option value="Crop Cleared">Crop Cleared & Burned</option>
                    <option value="Re-fertilized Soil">Re-fertilized Soil</option>
                    <option value="Requested Gov/RADA Assistance">Requested Gov/RADA Assistance</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-black text-sm sm:text-base py-3.5 rounded-xl cursor-pointer shadow-md transition-transform active:scale-95 mt-2"
                >
                  ⚠️ Submit Loss Report
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-black text-red-950 text-lg">Recent Loss Incident Logs</h3>
                <div className="overflow-x-auto border border-gray-200/80 rounded-2xl bg-white/70">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-red-900 text-white font-black">
                      <tr>
                        <th className="p-3.5">Crop</th>
                        <th className="p-3.5">Cause</th>
                        <th className="p-3.5">Weight Lost</th>
                        <th className="p-3.5">Action Taken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                      {lossLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-red-50/40">
                          <td className="p-3.5 text-red-950 font-black">{log.crop}</td>
                          <td className="p-3.5 text-red-800">{log.reason}</td>
                          <td className="p-3.5 font-black">{log.lbsLost}</td>
                          <td className="p-3.5 text-gray-700">{log.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCE MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <form onSubmit={handleMarketSubmit} className="lg:col-span-5 space-y-4 bg-indigo-50/60 p-6 rounded-2xl border border-indigo-200">
                <h3 className="font-black text-indigo-950 text-lg">List Crop for Sale</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-gray-800">Crop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yellow Yam, Sweet Pepper"
                    value={marketForm.crop}
                    onChange={(e) => setMarketForm({ ...marketForm, crop: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Quantity (lbs)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1000"
                      value={marketForm.quantity}
                      onChange={(e) => setMarketForm({ ...marketForm, quantity: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-gray-800">Price (JMD / lb)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 195"
                      value={marketForm.price}
                      onChange={(e) => setMarketForm({ ...marketForm, price: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                    />
                  </div>
                </div>

                {/* PHOTO UPLOAD FIELD */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-gray-800 block">Upload Produce Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs font-bold text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-900 file:text-white hover:file:bg-indigo-950 cursor-pointer"
                  />
                  {newPhotoUrl && (
                    <div className="mt-2 relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-md">
                      <img src={newPhotoUrl} alt="Crop Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base py-3.5 rounded-xl cursor-pointer shadow-md transition-transform active:scale-95 mt-2"
                >
                   List Produce on Marketplace
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-black text-indigo-950 text-lg">Live Marketplace Activity Log</h3>
                <div className="overflow-x-auto border border-indigo-200/80 rounded-2xl bg-white/70">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-indigo-900 text-white font-black">
                      <tr>
                        <th className="p-3.5">Crop</th>
                        <th className="p-3.5">Quantity</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Buyer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                      {marketActivity.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/40">
                          <td className="p-3.5 text-indigo-950 font-black">{item.crop}</td>
                          <td className="p-3.5">{item.quantity}</td>
                          <td className="p-3.5 text-blue-800 font-black">{item.price}</td>
                          <td className="p-3.5">
                            <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md text-xs font-black">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-700">{item.buyer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm font-bold text-emerald-100/80 z-10 gap-2">
        <span>© 2026 Agri-Connect JA. All Rights Reserved.</span>
      </footer>

    </div>
  );
}