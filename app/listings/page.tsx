'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

// Dark mode shows this logo tinted #FED100 (CSS mask, needs a transparent background).
// Light mode shows LOGO_LIGHT as-is; point it at your full-colour logo if logo.png is the white one.
const LOGO_DARK = '/images/logo.png';
const LOGO_LIGHT = '/images/logo.png';

// Where the "Back to Dashboard" link goes for each role. Adjust to your real routes.
const DASHBOARD_BY_ROLE: Record<string, string> = {
  buyer: '/buyer-dashboard',
  farmer: '/farmer-dashboard',
};

const PARISHES = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann', 'Trelawny',
  'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine',
];

type Listing = {
  id: number; farmer: string; radaId: string; parish: string; crop: string;
  totalAvailableLbs: number; price: number; grade: 'Grade A' | 'Grade B'; delivery: string;
  emoji: string; tint: [string, string]; photo?: string;
};

// Mock data: replace with a fetch from your database.
const LISTINGS: Listing[] = [
  { id: 101, farmer: 'Marcus Reid', radaId: '#84920', parish: 'St. Elizabeth', crop: 'Sweet Pepper', totalAvailableLbs: 1500, price: 380, grade: 'Grade A', delivery: 'Farm Gate Pickup', emoji: '🫑', tint: ['#2f4a1a', '#5b8a2e'], photo: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=60' },
  { id: 102, farmer: 'Devon Campbell', radaId: '#39201', parish: 'Manchester', crop: 'Irish Potato', totalAvailableLbs: 3000, price: 210, grade: 'Grade A', delivery: 'Refrigerated Truck', emoji: '🥔', tint: ['#5a4a22', '#a58a45'], photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60' },
  { id: 103, farmer: 'Oraine Thompson', radaId: '#58392', parish: 'Trelawny', crop: 'Yellow Yam', totalAvailableLbs: 1200, price: 195, grade: 'Grade B', delivery: 'Wholesale Dropoff', emoji: '🍠', tint: ['#6b4a1a', '#c28a2c'], photo: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&auto=format&fit=crop&q=60' },
  { id: 104, farmer: 'Keneisha Sterling', radaId: '#47218', parish: 'St. Ann', crop: 'Scotch Bonnet Pepper', totalAvailableLbs: 800, price: 380, grade: 'Grade A', delivery: 'Refrigerated Truck', emoji: '🌶️', tint: ['#6b1f14', '#c2452c'] },
  { id: 105, farmer: 'Shanice Brown', radaId: '#61743', parish: 'Clarendon', crop: 'Callaloo', totalAvailableLbs: 600, price: 150, grade: 'Grade A', delivery: 'Farm Gate Pickup', emoji: '🌿', tint: ['#1f4a2a', '#3f8f4f'] },
  { id: 106, farmer: 'Rohan Clarke', radaId: '#72085', parish: 'St. Catherine', crop: 'Tomato', totalAvailableLbs: 2000, price: 260, grade: 'Grade B', delivery: 'Wholesale Dropoff', emoji: '🍅', tint: ['#6b1f1f', '#d1493c'] },
  { id: 107, farmer: 'Andrea Francis', radaId: '#33914', parish: 'Manchester', crop: 'Carrot', totalAvailableLbs: 1800, price: 180, grade: 'Grade A', delivery: 'Refrigerated Truck', emoji: '🥕', tint: ['#7a3f10', '#e08a2c'] },
  { id: 108, farmer: 'Leon Williams', radaId: '#50627', parish: 'St. Thomas', crop: 'Pumpkin', totalAvailableLbs: 2500, price: 120, grade: 'Grade A', delivery: 'Farm Gate Pickup', emoji: '🎃', tint: ['#6b4a10', '#d19a2c'] },
  { id: 109, farmer: 'Tanya Grant', radaId: '#18462', parish: 'Portland', crop: 'Green Banana', totalAvailableLbs: 4000, price: 95, grade: 'Grade B', delivery: 'Wholesale Dropoff', emoji: '🍌', tint: ['#4a5a1a', '#9ab83c'] },
  { id: 110, farmer: 'Michael Dixon', radaId: '#90376', parish: 'St. Mary', crop: 'Cabbage', totalAvailableLbs: 1600, price: 140, grade: 'Grade A', delivery: 'Refrigerated Truck', emoji: '🥬', tint: ['#2f5a3a', '#6fb08a'] },
];

type PayMethod = 'card' | 'cash' | 'lynkbiz';
const PAY_OPTIONS: { id: PayMethod; label: string }[] = [
  { id: 'card', label: 'Card (Escrow Hold)' },
  { id: 'cash', label: 'Cash on Delivery' },
  { id: 'lynkbiz', label: 'LynkBiz' },
];

export type OrderRequest = {
  listingId: number;
  quantityLbs: number;
  paymentMethod: PayMethod;
  deliveryDate: string; // YYYY-MM-DD
  deliveryLocation: string;
};

const money = (amount: number) => `JMD $${amount.toLocaleString('en-JM')}`;
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function ListingsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isBuyer = role === 'buyer';
  const dashboardHref = (role && DASHBOARD_BY_ROLE[role]) || '/';

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedParish, setSelectedParish] = useState('All 14 Parishes');
  const [selected, setSelected] = useState<Listing | null>(null);

  // Share the theme choice with the dashboard.
  useEffect(() => {
    const saved = localStorage.getItem('agri-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);
  const chooseTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    localStorage.setItem('agri-theme', t);
  };

  const filtered = useMemo(() => LISTINGS.filter(l =>
    l.crop.toLowerCase().includes(searchCrop.toLowerCase()) &&
    (selectedParish === 'All 14 Parishes' || l.parish === selectedParish)
  ), [searchCrop, selectedParish]);

  const handlePlaceOrder = (order: OrderRequest) => {
    // TODO: persist the order (API route or server action), reduce the listing's available lbs,
    // and start the chosen payment flow (escrow hold, COD record, or LynkBiz).
    console.log('Order request', order);
    setSelected(null);
    router.push(dashboardHref);
  };

  return (
    <div className={`ls-root min-h-screen font-sans ${theme === 'light' ? 'ls-light' : ''}`}>
      <header className="ls-header">
        <Link href="/" aria-label="Agri-Connect JA home" className="ls-logo-wrap">
          <img src={theme === 'light' ? LOGO_LIGHT : LOGO_DARK} alt="Agri-Connect JA Logo" className="ls-logo" />
        </Link>
        <div className="ls-header-actions">
          <button type="button" className="ls-cog" aria-label="Settings" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {role && (
            <span className={`ls-role ${isBuyer ? 'is-buyer' : 'is-farmer'}`}>
              <span className="ls-role-dot" />{isBuyer ? 'BUYER ACCESS' : 'FARMER ACCESS'}
            </span>
          )}
          {menuOpen && <>
            <button type="button" className="ls-scrim" aria-hidden="true" tabIndex={-1} onClick={() => setMenuOpen(false)} />
            <div className="ls-menu">
              <div className="ls-menu-label">Theme</div>
              <div className="ls-theme-options">
                {(['light', 'dark'] as const).map(t => (
                  <button key={t} type="button" className={`ls-opt ${theme === t ? 'is-on' : ''}`} aria-pressed={theme === t} onClick={() => chooseTheme(t)}>
                    {t === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
            </div>
          </>}
        </div>
      </header>

      <main className="ls-main">
        <div>
          <Link href={dashboardHref} className="ls-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            Back to Dashboard
          </Link>
        </div>

        <section className="ls-card ls-filters">
          <h1>Live Farmer Produce Feed <span className="ls-ac">({filtered.length})</span></h1>
          <p>Choose a quantity and place an order using card escrow, cash on delivery or LynkBiz.</p>
          <div className="ls-filter-grid">
            <input value={searchCrop} onChange={e => setSearchCrop(e.target.value)} placeholder="Search by crop name…" aria-label="Search by crop name" className="ls-field" />
            <div className="ls-select-wrap">
              <select value={selectedParish} onChange={e => setSelectedParish(e.target.value)} aria-label="Parish" className="ls-field ls-select">
                {['All 14 Parishes', ...PARISHES].map(p => <option key={p}>{p}</option>)}
              </select>
              <svg className="ls-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
        </section>

        {filtered.length === 0 && <div className="ls-card ls-empty">No listings match those filters.</div>}

        <section className="ls-grid">
          {filtered.map(l => (
            <article key={l.id} className="ls-card ls-listing">
              <div className="ls-tile" style={l.photo ? undefined : { background: `linear-gradient(135deg, ${l.tint[0]}, ${l.tint[1]})` }}>
                {l.photo ? <img src={l.photo} alt={l.crop} /> : <span className="ls-emoji" aria-hidden="true">{l.emoji}</span>}
                <span className="ls-badge ls-badge-loc">📍 {l.parish}</span>
                <span className={`ls-badge ls-badge-grade ${l.grade === 'Grade A' ? 'is-a' : 'is-b'}`}>{l.grade}</span>
              </div>
              <div className="ls-body">
                <div>
                  <h3>{l.crop}</h3>
                  <p className="ls-mu">Farmer: <strong className="ls-tx">{l.farmer}</strong> ({l.radaId})</p>
                </div>
                <div className="ls-well">
                  <div><span className="ls-mu">Available</span><strong>{l.totalAvailableLbs.toLocaleString()} lbs</strong></div>
                  <div><span className="ls-mu">Price per lb</span><strong className="ls-ac">{money(l.price)}</strong></div>
                  <small className="ls-mu">{l.delivery}</small>
                </div>
                {isBuyer
                  ? <button type="button" className="ls-gold ls-cta" onClick={() => setSelected(l)}>Select Quantity &amp; Order →</button>
                  : <button type="button" className="ls-cta ls-view-only" disabled>View only</button>}
              </div>
            </article>
          ))}
        </section>
      </main>

      {selected && isBuyer && (
        <CheckoutModal key={selected.id} listing={selected} onClose={() => setSelected(null)} onPlaceOrder={handlePlaceOrder} />
      )}

      <style jsx global>{`
        .ls-root {
          --bg: radial-gradient(900px 500px at 85% -5%, rgba(254,209,0,.16), transparent 60%), linear-gradient(160deg, #0B1207 0%, #14210C 55%, #1E2A08 100%);
          --tx:#F4F6EE; --mu:#B9C4A6; --sub:#D3DCC3; --ac:#FED100;
          --card:rgba(255,255,255,.07); --bd:rgba(255,255,255,.13); --well:rgba(0,0,0,.2); --field:rgba(0,0,0,.28);
          --menu:#14210C; --modalbg: linear-gradient(180deg, rgba(254,209,0,.18) 0, rgba(254,209,0,0) 170px), #14210C;
          --th:rgba(254,209,0,.16); --thtx:#FED100;
          --buyer-bg:rgba(254,209,0,.16); --buyer-tx:#FED100; --farmer-bg:rgba(120,220,150,.16); --farmer-tx:#8FE3AA;
          color: var(--tx); background: var(--bg);
        }
        .ls-light {
          --bg: radial-gradient(900px 500px at 85% -5%, rgba(254,209,0,.28), transparent 60%), linear-gradient(160deg, #FFFCEB 0%, #F6F7EE 55%, #EBF0DC 100%);
          --tx:#17210F; --mu:#566244; --sub:#3A462B; --ac:#7A6000;
          --card:rgba(255,255,255,.9); --bd:rgba(23,33,15,.14); --well:rgba(23,33,15,.05); --field:#FFFFFF;
          --menu:#FFFFFF; --modalbg: linear-gradient(180deg, rgba(254,209,0,.32) 0, rgba(254,209,0,0) 170px), #FFFFFF;
          --th:rgba(254,209,0,.4); --thtx:#3D3000;
          --buyer-bg:rgba(254,209,0,.4); --buyer-tx:#5E4900; --farmer-bg:rgba(30,140,70,.14); --farmer-tx:#166534;
        }
        .ls-mu { color: var(--mu); } .ls-tx { color: var(--tx); } .ls-ac { color: var(--ac); }

        /* Header: transparent, logo left, cog + role pill right */
        .ls-header { display:flex; align-items:center; justify-content:space-between; padding:22px 56px; background:transparent; }
        .ls-logo-wrap { position:relative; display:inline-block; line-height:0; }
        .ls-logo { height:50px; width:auto; display:block; }
        .ls-root:not(.ls-light) .ls-logo { opacity:0; }
        .ls-root:not(.ls-light) .ls-logo-wrap::after { content:''; position:absolute; inset:0; background:#FED100; -webkit-mask:url(${LOGO_DARK}) center / contain no-repeat; mask:url(${LOGO_DARK}) center / contain no-repeat; }
        .ls-header-actions { position:relative; display:flex; align-items:center; gap:12px; }
        .ls-cog { width:52px; height:52px; display:flex; align-items:center; justify-content:center; border:1px solid var(--bd); border-radius:16px; background:var(--card); color:var(--tx); cursor:pointer; }
        .ls-role { display:inline-flex; align-items:center; gap:8px; padding:14px 20px; border-radius:999px; font-size:13px; font-weight:800; letter-spacing:.06em; }
        .ls-role.is-buyer { background:var(--buyer-bg); color:var(--buyer-tx); }
        .ls-role.is-farmer { background:var(--farmer-bg); color:var(--farmer-tx); }
        .ls-role-dot { width:8px; height:8px; border-radius:50%; background:currentColor; }
        .ls-scrim { position:fixed; inset:0; background:transparent; border:0; cursor:default; }
        .ls-menu { position:absolute; z-index:1; top:64px; right:0; width:300px; padding:20px; border-radius:22px; background:var(--menu); border:1px solid var(--bd); box-shadow:0 20px 50px rgba(0,0,0,.3); }
        .ls-menu-label { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--mu); margin-bottom:10px; }
        .ls-theme-options { display:flex; gap:10px; }

        .ls-main { width:100%; max-width:1280px; margin:0 auto; padding:8px 32px 56px; display:flex; flex-direction:column; gap:24px; box-sizing:border-box; }
        .ls-back { display:inline-flex; align-items:center; gap:8px; padding:10px 18px 10px 12px; border-radius:999px; border:1px solid var(--bd); background:var(--card); color:var(--tx); font-size:14px; font-weight:600; text-decoration:none; }
        .ls-card { border:1px solid var(--bd); background:var(--card); border-radius:22px; overflow:hidden; }
        .ls-filters { padding:30px; overflow:visible; }
        .ls-filters h1 { margin:0; font-size:34px; font-weight:800; letter-spacing:-.02em; }
        .ls-filters p { margin:8px 0 22px; color:var(--mu); font-size:16px; }
        .ls-filter-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:16px; }
        .ls-field { width:100%; box-sizing:border-box; border:1px solid var(--bd); border-radius:14px; background:var(--field); color:var(--tx); padding:13px 16px; font-size:15px; font-family:inherit; outline:none; }
        .ls-field::placeholder { color:var(--mu); }
        .ls-field:focus { border-color:#FED100; box-shadow:0 0 0 2px rgba(254,209,0,.25); }
        .ls-select-wrap { position:relative; }
        .ls-select { appearance:none; -webkit-appearance:none; padding-right:52px; }
        .ls-select option { background:var(--menu); color:var(--tx); }
        /* Custom arrow, inset from the edge instead of the native one hugging the margin */
        .ls-chevron { position:absolute; right:20px; top:50%; margin-top:-9px; pointer-events:none; color:var(--tx); }
        .ls-empty { padding:48px; text-align:center; color:var(--mu); }

        .ls-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; }
        .ls-listing { display:flex; flex-direction:column; }
        .ls-tile { position:relative; height:150px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .ls-tile img { width:100%; height:100%; object-fit:cover; }
        .ls-emoji { font-size:64px; }
        .ls-badge { position:absolute; top:14px; padding:6px 12px; font-size:12px; font-weight:700; color:#fff; }
        .ls-badge-loc { left:14px; border-radius:999px; background:rgba(8,12,5,.72); }
        .ls-badge-grade { right:14px; border-radius:8px; padding:6px 10px; }
        .ls-badge-grade.is-a { background:#15803d; } .ls-badge-grade.is-b { background:#a16207; }
        .ls-body { padding:20px; display:flex; flex-direction:column; gap:14px; flex:1; }
        .ls-body h3 { margin:0; font-size:22px; font-weight:800; }
        .ls-body p { margin:4px 0 0; font-size:14px; }
        .ls-well { padding:12px 14px; border-radius:14px; background:var(--well); display:flex; flex-direction:column; gap:8px; font-size:14px; }
        .ls-well > div { display:flex; justify-content:space-between; }
        .ls-cta { margin-top:auto; width:100%; padding:14px; font-size:15px; }
        .ls-view-only { font-weight:600; border-radius:12px; border:1px solid var(--bd); background:transparent; color:var(--mu); cursor:not-allowed; }
        .ls-gold { border:none; background:linear-gradient(135deg, #FED100, #F2B705); color:#1A1500; font-weight:800; border-radius:12px; cursor:pointer; transition:filter .15s; }
        .ls-gold:hover { filter:brightness(1.06); }
        .ls-opt { flex:1; padding:12px 6px; border-radius:12px; border:1px solid var(--bd); background:var(--well); color:var(--tx); font-size:13px; font-weight:700; cursor:pointer; }
        .ls-opt.is-on { background:var(--th); color:var(--thtx); border-color:#FED100; }
        .ls-theme-options .ls-opt.is-on { background:#FED100; color:#1A1500; }

        /* Checkout modal */
        .ls-overlay { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.72); overflow-y:auto; padding:40px 16px; box-sizing:border-box; display:flex; justify-content:center; align-items:flex-start; }
        .ls-modal { width:100%; max-width:580px; box-sizing:border-box; padding:32px; border-radius:28px; background:var(--modalbg); border:1px solid var(--bd); color:var(--tx); display:flex; flex-direction:column; gap:22px; box-shadow:0 30px 80px rgba(0,0,0,.4); }
        .ls-modal-head { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:14px; border-bottom:1px solid var(--bd); }
        .ls-eyebrow { font-size:12px; font-weight:800; letter-spacing:.1em; color:var(--ac); text-transform:uppercase; }
        .ls-modal h3 { margin:0; font-size:30px; font-weight:800; }
        .ls-close { border:0; background:transparent; color:var(--mu); font-size:30px; line-height:1; cursor:pointer; }
        .ls-panel { padding:18px; border-radius:18px; background:var(--well); display:flex; flex-direction:column; gap:14px; }
        .ls-row { display:flex; justify-content:space-between; font-size:15px; }
        .ls-total { padding-top:14px; border-top:1px solid var(--bd); font-size:18px; font-weight:800; }
        .ls-label { display:block; font-size:12px; font-weight:700; margin-bottom:6px; }
        .ls-pay-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; }
        .ls-two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .ls-cal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .ls-cal-nav { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:10px; border:1px solid var(--bd); background:transparent; color:var(--tx); cursor:pointer; }
        .ls-cal-nav:disabled { opacity:.35; cursor:not-allowed; }
        .ls-cal-grid { display:grid; grid-template-columns:repeat(7, minmax(0, 1fr)); gap:6px; }
        .ls-cal-dow { text-align:center; font-size:12px; font-weight:700; color:var(--mu); margin-bottom:6px; }
        .ls-day { height:38px; border-radius:10px; font-size:14px; font-weight:600; border:1px solid var(--bd); background:transparent; color:var(--tx); cursor:pointer; font-family:inherit; }
        .ls-day:disabled { opacity:.4; border-color:transparent; cursor:not-allowed; color:var(--mu); }
        .ls-day.is-sel { background:#FED100; color:#1A1500; border-color:#FED100; font-weight:800; }
        .ls-error { font-size:13px; font-weight:600; color:#f87171; }
        .ls-light .ls-error { color:#b91c1c; }
        .ls-place { width:100%; padding:16px; font-size:16px; box-shadow:0 8px 28px rgba(254,209,0,.3); }
        @media (max-width:640px) { .ls-header { padding:16px 20px; } .ls-logo { height:40px; } .ls-role { padding:10px 14px; } .ls-main { padding:8px 16px 40px; } }
      `}</style>
    </div>
  );
}

function CheckoutModal({ listing, onClose, onPlaceOrder }: {
  listing: Listing; onClose: () => void; onPlaceOrder: (order: OrderRequest) => void;
}) {
  const [qty, setQty] = useState(Math.min(100, listing.totalAvailableLbs));
  const [pay, setPay] = useState<PayMethod>('card');
  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '' });
  const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const total = qty * listing.price;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || qty > listing.totalAvailableLbs) return;
    if (!date) { setError('Please choose a delivery date.'); return; }
    onPlaceOrder({
      listingId: listing.id, quantityLbs: qty, paymentMethod: pay,
      deliveryDate: toISODate(date), deliveryLocation: location.trim(),
    });
  };

  return (
    <div className="ls-overlay" role="dialog" aria-modal="true" aria-label={`Checkout ${listing.crop}`}>
      <form className="ls-modal" onSubmit={submit}>
        <div className="ls-modal-head">
          <div><div className="ls-eyebrow">Checkout Produce</div><h3>{listing.crop}</h3></div>
          <button type="button" className="ls-close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="ls-panel">
          <div className="ls-row"><span>Max available</span><strong className="ls-ac">{listing.totalAvailableLbs.toLocaleString()} lbs</strong></div>
          <div>
            <label className="ls-label" htmlFor="qty">Enter needed quantity (lbs)</label>
            <input id="qty" type="number" min={1} max={listing.totalAvailableLbs} value={qty} className="ls-field"
              onChange={e => setQty(Math.min(listing.totalAvailableLbs, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
          <div className="ls-row ls-total"><span>Calculated total</span><span className="ls-ac">{money(total)}</span></div>
        </div>

        <div>
          <span className="ls-label">Payment option</span>
          <div className="ls-pay-grid">
            {PAY_OPTIONS.map(o => (
              <button key={o.id} type="button" className={`ls-opt ${pay === o.id ? 'is-on' : ''}`} aria-pressed={pay === o.id} onClick={() => setPay(o.id)}>{o.label}</button>
            ))}
          </div>
        </div>

        {pay === 'card' && (
          <div className="ls-panel">
            <div><label className="ls-label">Cardholder name</label><input required value={card.holder} onChange={e => setCard({ ...card, holder: e.target.value })} placeholder="e.g. Sandals Procurement Ltd" className="ls-field" /></div>
            <div><label className="ls-label">Card number</label><input required inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4111 •••• •••• 8841" className="ls-field" /></div>
            <div className="ls-two">
              <div><label className="ls-label">Expiry (MM/YY)</label><input required value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="08/28" className="ls-field" /></div>
              <div><label className="ls-label">CVV</label><input required type="password" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} placeholder="•••" className="ls-field" /></div>
            </div>
          </div>
        )}
        {pay === 'lynkbiz' && (
          <div className="ls-panel" style={{ fontSize: 14, color: 'var(--sub)' }}>
            Pay with your LynkBiz account. You will confirm the payment in LynkBiz after placing the order.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="ls-label" style={{ margin: 0 }}>Request delivery date</span>
          <DeliveryCalendar value={date} onChange={d => { setDate(d); setError(''); }} />
          <div style={{ fontSize: 14, color: 'var(--sub)' }}>
            {date
              ? `Requested: ${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Select a delivery date (from tomorrow onward)'}
          </div>
          {error && <div className="ls-error" role="alert">{error}</div>}
          <div>
            <label className="ls-label" htmlFor="loc">Delivery location</label>
            <input id="loc" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Street, town and parish" className="ls-field" />
          </div>
        </div>

        <button type="submit" className="ls-gold ls-place">Place Order · {money(total)} →</button>
      </form>
    </div>
  );
}

function DeliveryCalendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const atCurrentMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
  const shift = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div className="ls-panel">
      <div className="ls-cal-head">
        <button type="button" className="ls-cal-nav" aria-label="Previous month" disabled={atCurrentMonth} onClick={() => shift(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <strong>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="ls-cal-nav" aria-label="Next month" onClick={() => shift(1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div className="ls-cal-grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="ls-cal-dow">{d}</span>)}
        {Array.from({ length: cursor.getDay() }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = new Date(cursor.getFullYear(), cursor.getMonth(), i + 1);
          const selected = value?.getTime() === day.getTime();
          return (
            <button key={i} type="button" disabled={day <= today} className={`ls-day ${selected ? 'is-sel' : ''}`} aria-pressed={selected} onClick={() => onChange(day)}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}