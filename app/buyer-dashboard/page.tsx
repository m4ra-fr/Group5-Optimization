'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type Listing = {
  id: number; farmer: string; radaId: string; parish: string; crop: string;
  totalAvailableLbs: number; price: number; grade: string; delivery: string; photo: string;
};
type BuyerOrder = {
  id: number; crop: string; farmer: string; quantityBought: string; totalCost: string;
  paymentMethod: string; status: string; date: string;
};

const initialListings: Listing[] = [
  { id: 101, farmer: 'Marcus Reid', radaId: '#84920', parish: 'St. Elizabeth', crop: 'Sweet Pepper', totalAvailableLbs: 1500, price: 380, grade: 'Grade A', delivery: 'Farm Gate Pickup', photo: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=60' },
  { id: 102, farmer: 'Devon Campbell', radaId: '#39201', parish: 'Manchester', crop: 'Irish Potato', totalAvailableLbs: 3000, price: 210, grade: 'Grade A', delivery: 'Refrigerated Truck', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60' },
  { id: 103, farmer: 'Oraine Thompson', radaId: '#58392', parish: 'Trelawny', crop: 'Yellow Yam', totalAvailableLbs: 1200, price: 195, grade: 'Grade B', delivery: 'Wholesale Dropoff', photo: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&auto=format&fit=crop&q=60' },
];

const initialOrders: BuyerOrder[] = [
  { id: 901, crop: 'Scotch Bonnet Pepper', farmer: 'Keneisha Sterling', quantityBought: '500 lbs', totalCost: 'JMD $190,000', paymentMethod: 'Card (Escrow Locked)', status: 'RECEIVED', date: '2026-11-02' },
  { id: 902, crop: 'Sweet Pepper', farmer: 'Marcus Reid', quantityBought: '300 lbs', totalCost: 'JMD $114,000', paymentMethod: 'Cash on Delivery', status: 'RECEIVED', date: '2026-11-05' },
  { id: 903, crop: 'Irish Potato', farmer: 'Devon Campbell', quantityBought: '800 lbs', totalCost: 'JMD $168,000', paymentMethod: 'Card (Escrow Locked)', status: 'AWAITING FARMER', date: '2026-11-10' },
];

const money = (amount: number) => `JMD $${amount.toLocaleString('en-JM')}`;

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedParish, setSelectedParish] = useState('All Parishes');
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [myOrders, setMyOrders] = useState<BuyerOrder[]>(initialOrders);
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [orderQty, setOrderQty] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
  const [showListings, setShowListings] = useState(false);

  const filteredListings = useMemo(() => listings.filter(item =>
    item.crop.toLowerCase().includes(searchCrop.toLowerCase()) &&
    (selectedParish === 'All Parishes' || item.parish === selectedParish)
  ), [listings, searchCrop, selectedParish]);

  const pendingOrders = myOrders.filter(order => order.status !== 'RECEIVED');
  const pendingValue = pendingOrders.reduce((sum, order) => {
    const amount = Number(order.totalCost.replace(/[^\d]/g, ''));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const handleOpenCheckout = (item: Listing) => {
    setSelectedItem(item);
    setOrderQty(Math.min(100, item.totalAvailableLbs));
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || orderQty <= 0 || orderQty > selectedItem.totalAvailableLbs) return;
    const totalJMD = orderQty * selectedItem.price;
    const newOrder: BuyerOrder = {
      id: Date.now(), crop: selectedItem.crop, farmer: selectedItem.farmer,
      quantityBought: `${orderQty.toLocaleString()} lbs`, totalCost: money(totalJMD),
      paymentMethod: paymentMethod === 'card' ? 'Card (Escrow Locked)' : 'Cash on Delivery',
      status: paymentMethod === 'card' ? 'IN TRANSIT' : 'AWAITING FARMER',
      date: new Date().toISOString().split('T')[0],
    };
    setMyOrders(prev => [newOrder, ...prev]);
    setListings(prev => prev.map(item => item.id === selectedItem.id
      ? { ...item, totalAvailableLbs: item.totalAvailableLbs - orderQty } : item
    ).filter(item => item.totalAvailableLbs > 0));
    setSelectedItem(null);
    setShowListings(false);
  };

  const markReceived = (id: number) => {
    setMyOrders(prev => prev.map(order => order.id === id ? { ...order, status: 'RECEIVED' } : order));
  };

  return (
    <div className={`buyer-root min-h-screen font-sans ${theme === "light" ? "buyer-light" : ""}`}>
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,_#263313_0%,_#101807_48%,_#0b1206_100%)]" />
      <header className="buyer-header">
        <div className="buyer-header-brand">
          <Link href="/" aria-label="Agri-Connect JA home"><img src="/images/logo.png" alt="Agri-Connect JA Logo" className="buyer-logo" /></Link>
          <span className="buyer-header-divider" />
          <b className="buyer-header-title">Commercial Buyer Portal</b>
        </div>
        <div className="buyer-header-actions">
          <span className="buyer-chip">Commercial Buyer</span>
          <button type="button" className="buyer-settings" aria-label="Settings" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {menuOpen && <div className="buyer-menu">
            <div className="buyer-menu-label">Theme</div>
            <div className="buyer-theme-options">
              {(['light', 'dark'] as const).map(t => <button key={t} type="button" className={`buyer-theme-btn ${theme === t ? 'is-active' : ''}`} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t === 'light' ? 'Light' : 'Dark'}</button>)}
            </div>
            <div className="buyer-menu-divider" />
            <Link href="/security" className="buyer-menuitem">Security</Link>
            <button type="button" className="buyer-menuitem" onClick={handleSignOut}>Sign out</button>
          </div>}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#b9c5a5]">Friday, 13 November</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Welcome back, <span className="text-[#ffca05]">Andre Brown</span></h1>
            <p className="mt-2 text-sm text-[#c3ccb5] sm:text-base">Track what is on its way and confirm deliveries as they arrive.</p>
          </div>
          <button onClick={() => setShowListings(v => !v)} className="rounded-xl bg-[#ffca05] px-6 py-3.5 text-sm font-extrabold text-[#151907] shadow-[0_8px_28px_rgba(255,202,5,.16)] transition hover:bg-yellow-300">
            {showListings ? 'Back to Dashboard ↑' : 'View Listings →'}
          </button>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Pending orders" value={pendingOrders.length.toString()} />
          <StatCard label="Held in escrow" value={money(pendingOrders.filter(o => o.paymentMethod.toLowerCase().includes('escrow')).reduce((sum, o) => sum + Number(o.totalCost.replace(/[^\d]/g, '')), 0))} accent />
          <StatCard label="Total pending value" value={money(pendingValue)} />
        </section>

        {showListings ? (
          <section className="panel space-y-5">
            <div>
              <h2 className="text-xl font-extrabold">Live Farmer Produce Feed ({filteredListings.length})</h2>
              <p className="mt-1 text-sm text-[#bdc7ad]">Choose a quantity and place an order using card escrow or cash on delivery.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={searchCrop} onChange={e => setSearchCrop(e.target.value)} placeholder="Search by crop name…" className="field" />
              <select value={selectedParish} onChange={e => setSelectedParish(e.target.value)} className="field">
                {['All Parishes','St. Elizabeth','Manchester','Trelawny'].map(parish => <option key={parish}>{parish}</option>)}
              </select>
            </div>
            {filteredListings.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map(item => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#202b18]">
                <div className="relative h-44"><img src={item.photo} alt={item.crop} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold">📍 {item.parish}</span>
                  <span className="absolute right-3 top-3 rounded-md bg-emerald-700 px-2 py-1 text-xs font-bold">{item.grade}</span>
                </div>
                <div className="space-y-4 p-5">
                  <div><h3 className="text-xl font-extrabold">{item.crop}</h3><p className="mt-1 text-sm text-[#c0c9b3]">Farmer: <strong className="text-white">{item.farmer}</strong> ({item.radaId})</p></div>
                  <div className="space-y-2 rounded-xl bg-black/15 p-3 text-sm"><div className="flex justify-between"><span className="text-[#c0c9b3]">Available</span><strong>{item.totalAvailableLbs.toLocaleString()} lbs</strong></div><div className="flex justify-between"><span className="text-[#c0c9b3]">Price per lb</span><strong className="text-[#ffca05]">{money(item.price)}</strong></div><div className="text-xs text-[#c0c9b3]">{item.delivery}</div></div>
                  <button onClick={() => handleOpenCheckout(item)} className="w-full rounded-xl bg-[#ffca05] py-3 text-sm font-extrabold text-[#151907] hover:bg-yellow-300">Select Quantity & Order →</button>
                </div>
              </article>)}
            </div> : <p className="rounded-xl border border-white/10 p-8 text-center text-[#bdc7ad]">No listings match those filters.</p>}
          </section>
        ) : (
          <>
            <section className="panel space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">Pending Orders</h2>
                <p className="text-xs text-[#bdc7ad]">Mark an order received once it arrives</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#42451e] text-[#ffca05]"><tr>{['Crop','Farmer','Quantity','Total','Payment','Status','Action'].map(label => <th key={label} className="px-4 py-3 font-bold">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-white/10">
                    {myOrders.map(order => <tr key={order.id} className="hover:bg-white/[.025]">
                      <td className="px-4 py-3.5 font-bold">{order.crop}</td><td className="px-4 py-3.5">{order.farmer}</td><td className="px-4 py-3.5">{order.quantityBought}</td><td className="px-4 py-3.5 font-extrabold text-[#ffca05]">{order.totalCost.replace('JMD ', '')}</td><td className="px-4 py-3.5 text-[#d0d8c5]">{order.paymentMethod}</td>
                      <td className="px-4 py-3.5"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold ${order.status === 'RECEIVED' ? 'bg-emerald-900/70 text-emerald-300' : order.status === 'AWAITING FARMER' ? 'bg-[#424b35] text-[#d4ddc6]' : 'bg-blue-950/70 text-blue-300'}`}>{order.status}</span></td>
                      <td className="px-4 py-3.5">{order.status === 'RECEIVED' ? <span className="font-bold text-emerald-300">Received ✓</span> : order.status === 'AWAITING FARMER' ? <span className="text-[#bdc7ad]">Not yet shipped</span> : <button onClick={() => markReceived(order.id)} className="whitespace-nowrap font-bold text-emerald-300 hover:text-emerald-200">Mark received ✓</button>}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="grid gap-5 lg:grid-cols-2">
              <div className="panel">
                <h2 className="text-xl font-extrabold">Frequently Purchased From</h2><p className="mb-5 text-xs text-[#bdc7ad]">Orders placed per farmer · sample data</p>
                <FarmerBar name="Keneisha Sterling" crop="Scotch Bonnet" count={14} width="100%" />
                <FarmerBar name="Marcus Reid" crop="Sweet Pepper" count={9} width="64%" />
                <FarmerBar name="Devon Campbell" crop="Irish Potato" count={7} width="50%" />
                <FarmerBar name="Oraine Thompson" crop="Yellow Yam" count={4} width="29%" />
              </div>
              <div className="panel">
                <h2 className="text-xl font-extrabold">Purchase Patterns</h2><p className="mb-5 text-xs text-[#bdc7ad]">Quantity purchased per month (lbs) · sample data</p>
                <div className="flex h-56 items-end justify-around gap-3 border-b border-white/10 px-2">
                  {[['Jun',1200],['Jul',1800],['Aug',1500],['Sep',2400],['Oct',2100],['Nov',2800]].map(([month,value]) => <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[11px] text-[#d2dac8]">{Number(value).toLocaleString()}</span><div className="w-full max-w-11 rounded-t-xl bg-gradient-to-t from-[#b99400] to-[#ffcf05]" style={{height:`${Number(value)/2800*68}%`,minHeight:12}}/><span className="pb-2 text-xs text-[#bdc7ad]">{month}</span></div>)}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 pb-6 text-xs text-[#9eaa8d] sm:flex-row sm:justify-between sm:px-8"><span>© 2026 Agri-Connect JA. All Rights Reserved.</span><span>Commercial Procurement</span></footer>

      {selectedItem && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border border-white/10 bg-[#1b2613] p-6 shadow-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3"><div><span className="text-xs font-extrabold uppercase text-[#ffca05]">Checkout Produce</span><h3 className="text-2xl font-black">{selectedItem.crop}</h3></div><button onClick={() => setSelectedItem(null)} className="text-2xl text-[#bdc7ad] hover:text-white">×</button></div>
          <div className="space-y-3 rounded-2xl bg-black/15 p-4 text-sm"><div className="flex justify-between"><span>Max available</span><strong>{selectedItem.totalAvailableLbs.toLocaleString()} lbs</strong></div><label className="block text-xs font-bold">Enter quantity (lbs)<input type="number" min={1} max={selectedItem.totalAvailableLbs} value={orderQty} onChange={e => setOrderQty(Math.min(selectedItem.totalAvailableLbs, Math.max(1, Number(e.target.value) || 1)))} className="field mt-2" /></label><div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold"><span>Calculated total</span><span className="text-[#ffca05]">{money(orderQty * selectedItem.price)}</span></div></div>
          <form onSubmit={handleConfirmPayment} className="space-y-4"><div><label className="mb-2 block text-xs font-bold">Payment option</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setPaymentMethod('card')} className={`rounded-xl border p-3 text-xs font-bold ${paymentMethod === 'card' ? 'border-[#ffca05] bg-[#42451e] text-[#ffca05]' : 'border-white/10 bg-white/5'}`}>Card (Escrow Hold)</button><button type="button" onClick={() => setPaymentMethod('cash')} className={`rounded-xl border p-3 text-xs font-bold ${paymentMethod === 'cash' ? 'border-[#ffca05] bg-[#42451e] text-[#ffca05]' : 'border-white/10 bg-white/5'}`}>Cash on Delivery</button></div></div>
            {paymentMethod === 'card' && <div className="space-y-3 rounded-xl border border-white/10 bg-black/15 p-4 text-xs"><label className="block">Cardholder name<input required value={cardDetails.cardHolder} onChange={e => setCardDetails({...cardDetails,cardHolder:e.target.value})} placeholder="e.g. Procurement Ltd" className="field mt-1" /></label><label className="block">Card number<input required value={cardDetails.cardNumber} onChange={e => setCardDetails({...cardDetails,cardNumber:e.target.value})} placeholder="4111 •••• •••• 8841" className="field mt-1" /></label><div className="grid grid-cols-2 gap-3"><label>Expiry<input required value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails,expiry:e.target.value})} placeholder="08/28" className="field mt-1" /></label><label>CVV<input required maxLength={4} type="password" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails,cvv:e.target.value})} placeholder="•••" className="field mt-1" /></label></div></div>}
            <button type="submit" className="w-full rounded-xl bg-[#ffca05] py-3.5 text-sm font-extrabold text-[#151907] hover:bg-yellow-300">Confirm {paymentMethod === 'card' ? 'Payment' : 'Order'} · {money(orderQty * selectedItem.price)} →</button>
          </form>
        </div>
      </div>}
      <style jsx global>{`
        .panel { border: 1px solid rgba(255,255,255,.12); background: rgba(35,47,27,.88); border-radius: 24px; padding: 24px; }
        .field { width: 100%; border: 1px solid rgba(255,255,255,.13); border-radius: 12px; background: #121a0d; color: #f5f5e9; padding: 11px 13px; outline: none; }
        .field:focus { border-color: #ffca05; box-shadow: 0 0 0 2px rgba(255,202,5,.12); }
        .field::placeholder { color: #87927a; }
        select.field option { background: #121a0d; }

        .buyer-root { color:#f5f5e9;background:radial-gradient(ellipse at top,#263313 0%,#101807 48%,#0b1206 100%); }
        .buyer-header {position:sticky;top:0;z-index:1000;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid rgba(255,255,255,.13);background:rgba(10,26,17,1);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .buyer-header-brand,.buyer-header-actions{display:flex;align-items:center;gap:14px}
        .buyer-logo{height:44px;width:auto;display:block}
        .buyer-header-divider{width:1px;height:28px;background:rgba(255,255,255,.2)}
        .buyer-header-title{font-size:18px}
        .buyer-chip{display:inline-flex;align-items:center;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);color:#D6FF3F;font-size:13px;font-weight:700}
        .buyer-settings{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(255,255,255,.08);color:inherit;cursor:pointer}
        .buyer-settings:hover{background:rgba(255,255,255,.14)}
        .buyer-header-actions{position:relative}
        .buyer-menu{position:absolute;top:56px;right:0;width:260px;padding:10px;border-radius:18px;background:#12251a;border:1px solid rgba(255,255,255,.13);box-shadow:0 18px 40px rgba(0,0,0,.35)}
        .buyer-menu-label{padding:8px 14px 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A9BDB0}
        .buyer-theme-options{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 6px 10px}
        .buyer-theme-btn{min-height:42px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.08);color:inherit;font-weight:700;cursor:pointer}
        .buyer-theme-btn.is-active{background:#D6FF3F;color:#0B2316;border-color:#D6FF3F}
        .buyer-menu-divider{height:1px;background:rgba(255,255,255,.13);margin:2px 6px 6px}
        .buyer-menuitem{display:block;width:100%;text-align:left;font-size:14px;font-weight:600;min-height:44px;padding:0 14px;border:0;border-radius:10px;background:transparent;color:inherit;cursor:pointer;text-decoration:none;line-height:44px}
        .buyer-menuitem:hover{background:rgba(255,255,255,.14)}
        .buyer-light{color:#10281A!important;background:radial-gradient(ellipse at top,#e4efc9 0%,#F4F8F0 48%,#E4EEDF 100%)!important}
        .buyer-light .buyer-header{background:rgba(244,248,240,1);color:#10281A;border-color:rgba(16,40,26,.15)}
        .buyer-light .buyer-header-divider{background:rgba(16,40,26,.22)}
        .buyer-light .buyer-chip{background:rgba(16,40,26,.07);color:#1F6B43}
        .buyer-light .buyer-settings,.buyer-light .buyer-theme-btn{border-color:rgba(16,40,26,.2);background:rgba(16,40,26,.06)}
        .buyer-light .buyer-menu{background:#fff;color:#10281A;border-color:rgba(16,40,26,.15)}
        .buyer-light .buyer-menu-label{color:#4A6354}
        .buyer-light .buyer-theme-btn.is-active{background:#1F6B43;color:white}
        .buyer-light .buyer-menu-divider{background:rgba(16,40,26,.15)}
        .buyer-light .buyer-menuitem:hover{background:rgba(16,40,26,.08)}
        .buyer-light .panel{background:rgba(255,255,255,.72);border-color:rgba(16,40,26,.15);color:#10281A}
        .buyer-light .field{background:#fff;color:#10281A;border-color:rgba(16,40,26,.22)}
        @media(max-width:640px){.buyer-header{padding:16px 20px}.buyer-chip{display:none}.buyer-header-title{font-size:15px}}
      `}</style>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-[20px] border border-white/10 bg-[#232d1b]/90 px-5 py-5"><p className="text-xs font-semibold text-[#b9c5a5]">{label}</p><p className={`mt-2 text-3xl font-black tracking-tight ${accent ? 'text-[#ffca05]' : 'text-[#f5f5e9]'}`}>{value}</p></div>;
}
function FarmerBar({ name, crop, count, width }: { name: string; crop: string; count: number; width: string }) {
  return <div className="mb-4"><div className="mb-1.5 flex justify-between gap-3 text-sm"><span><strong>{name}</strong><span className="text-[#b9c5a5]"> · {crop}</span></span><strong className="text-[#ffca05]">{count}</strong></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffca05]" style={{width}}/></div></div>;
}
