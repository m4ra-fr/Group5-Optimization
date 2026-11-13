'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

// Dark mode shows this logo tinted #FED100 
// Light mode shows LOGO_LIGHT as-is. If /images/logo.png is the all-white version,

const LOGO_DARK = '/images/logo.png';
const LOGO_LIGHT = '/images/logo.png';

type BuyerOrder = {
  id: number; crop: string; farmer: string; quantityBought: string; totalCost: string;
  paymentMethod: string; status: string; date: string;
};

// Statuses: 'PAID - IN TRANSIT' | 'OUT FOR DELIVERY' | 'AWAITING FARMER' | 'RECEIVED'
const initialOrders: BuyerOrder[] = [
  { id: 901, crop: 'Scotch Bonnet Pepper', farmer: 'Keneisha Sterling', quantityBought: '500 lbs', totalCost: 'JMD $190,000', paymentMethod: 'Card (Escrow Locked)', status: 'PAID - IN TRANSIT', date: '2026-11-02' },
  { id: 902, crop: 'Sweet Pepper', farmer: 'Marcus Reid', quantityBought: '300 lbs', totalCost: 'JMD $114,000', paymentMethod: 'Cash on Delivery', status: 'OUT FOR DELIVERY', date: '2026-11-05' },
  { id: 903, crop: 'Irish Potato', farmer: 'Devon Campbell', quantityBought: '800 lbs', totalCost: 'JMD $168,000', paymentMethod: 'Card (Escrow Locked)', status: 'AWAITING FARMER', date: '2026-11-10' },
];

const money = (amount: number) => `JMD $${amount.toLocaleString('en-JM')}`;
const amountOf = (order: BuyerOrder) => Number(order.totalCost.replace(/[^\d]/g, '')) || 0;
const pillClass = (status: string) =>
  status === 'RECEIVED' || status === 'PAID - IN TRANSIT' ? 'pill pill-green'
    : status === 'OUT FOR DELIVERY' ? 'pill pill-gold' : 'pill pill-gray';

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const buyerName = session?.user?.name ?? 'Buyer';

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [today, setToday] = useState('');
  const [myOrders, setMyOrders] = useState<BuyerOrder[]>(initialOrders);

  // Set after mount so server and client markup match.
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-JM', { weekday: 'long', day: 'numeric', month: 'long' }));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('agri-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);
  const chooseTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    localStorage.setItem('agri-theme', t);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const pendingOrders = myOrders.filter(order => order.status !== 'RECEIVED');
  const pendingValue = pendingOrders.reduce((sum, order) => sum + amountOf(order), 0);
  const escrowValue = pendingOrders
    .filter(order => order.paymentMethod.toLowerCase().includes('escrow'))
    .reduce((sum, order) => sum + amountOf(order), 0);

  const markReceived = (id: number) => {
    setMyOrders(prev => prev.map(order => order.id === id ? { ...order, status: 'RECEIVED' } : order));
  };

  return (
    <div className={`buyer-root min-h-screen font-sans ${theme === 'light' ? 'buyer-light' : ''}`}>
      <header className="buyer-header">
        <div className="buyer-header-brand">
          <Link href="/" aria-label="Agri-Connect JA home" className="buyer-logo-wrap">
            <img src={theme === 'light' ? LOGO_LIGHT : LOGO_DARK} alt="Agri-Connect JA Logo" className="buyer-logo" />
          </Link>
          <span className="buyer-header-divider" />
          <b className="buyer-header-title">Commercial Buyer Portal</b>
        </div>
        <div className="buyer-header-actions">
          <button type="button" className="buyer-settings" aria-label="Settings" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {menuOpen && <>
            <button type="button" className="buyer-scrim" aria-hidden="true" tabIndex={-1} onClick={() => setMenuOpen(false)} />
            <div className="buyer-menu">
              <div className="buyer-menu-label">Theme</div>
              <div className="buyer-theme-options">
                {(['light', 'dark'] as const).map(t => (
                  <button key={t} type="button" className={`buyer-theme-btn ${theme === t ? 'is-active' : ''}`} aria-pressed={theme === t} onClick={() => chooseTheme(t)}>
                    {t === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
              <div className="buyer-menu-divider" />
              <Link href="/security" className="buyer-menuitem" onClick={() => setMenuOpen(false)}>Security</Link>
              <button type="button" className="buyer-menuitem" onClick={handleSignOut}>Sign out</button>
            </div>
          </>}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 min-h-4 text-xs font-bold uppercase tracking-wide t-mu">{today}</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Welcome back, <span className="t-ac">{buyerName}</span></h1>
            <p className="mt-2 text-sm t-mu sm:text-base">Track what is on its way and confirm deliveries as they arrive.</p>
          </div>
          <Link href="/listings" className="btn-gold inline-block px-6 py-3.5 text-center text-sm shadow-[0_8px_28px_rgba(254,209,0,.3)]">View Listings →</Link>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Pending orders" value={pendingOrders.length.toString()} />
          <StatCard label="Held in escrow" value={money(escrowValue)} accent />
          <StatCard label="Total pending value" value={money(pendingValue)} />
        </section>

            <section className="panel space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">Pending Orders</h2>
                <p className="text-xs t-mu">Mark an order received once it arrives</p>
              </div>
              <div className="tbl-wrap overflow-x-auto rounded-xl">
                <table className="tbl w-full min-w-[820px] text-left text-sm">
                  <thead><tr>{['Crop', 'Farmer', 'Quantity', 'Total', 'Payment', 'Status', 'Action'].map(label => <th key={label} className="px-4 py-3.5 font-bold">{label}</th>)}</tr></thead>
                  <tbody>
                    {myOrders.map(order => {
                      const received = order.status === 'RECEIVED';
                      const waiting = order.status === 'AWAITING FARMER';
                      return (
                        <tr key={order.id}>
                          <td className="px-4 py-4 font-bold">{order.crop}</td>
                          <td className="px-4 py-4">{order.farmer}</td>
                          <td className="px-4 py-4">{order.quantityBought}</td>
                          <td className="px-4 py-4 font-extrabold t-ac">{order.totalCost.replace('JMD ', '')}</td>
                          <td className="px-4 py-4 t-sub">{order.paymentMethod}</td>
                          <td className="px-4 py-4"><span className={pillClass(order.status)}>{order.status}</span></td>
                          <td className="px-4 py-4">
                            {received ? (
                              <span className="font-bold t-ok">Received ✓</span>
                            ) : waiting ? (
                              <button type="button" disabled className="btn-ghost-disabled">Not yet shipped</button>
                            ) : (
                              <button type="button" onClick={() => markReceived(order.id)} className="btn-gold whitespace-nowrap px-4 py-2.5 text-sm">Mark as Received</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="panel">
                <h2 className="text-xl font-extrabold">Frequently Purchased From</h2>
                <p className="mb-5 text-xs t-mu">Orders placed per farmer · sample data</p>
                <FarmerBar name="Keneisha Sterling" crop="Scotch Bonnet" count={14} width="100%" />
                <FarmerBar name="Marcus Reid" crop="Sweet Pepper" count={9} width="64%" />
                <FarmerBar name="Devon Campbell" crop="Irish Potato" count={7} width="50%" />
                <FarmerBar name="Oraine Thompson" crop="Yellow Yam" count={4} width="29%" />
              </div>
              <div className="panel">
                <h2 className="text-xl font-extrabold">Purchase Patterns</h2>
                <p className="mb-5 text-xs t-mu">Quantity purchased per month (lbs) · sample data</p>
                <div className="chart-base flex h-56 items-end justify-around gap-3 px-2">
                  {([['Jun', 1200], ['Jul', 1800], ['Aug', 1500], ['Sep', 2400], ['Oct', 2100], ['Nov', 2800]] as const).map(([month, value]) => (
                    <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[11px] t-sub">{value.toLocaleString()}</span>
                      <div className="bar-v w-full max-w-11 rounded-t-xl" style={{ height: `${(value / 2800) * 68}%`, minHeight: 12 }} />
                      <span className="pb-2 text-xs t-mu">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
      </main>

      <footer className="relative mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 pb-6 text-xs t-mu sm:flex-row sm:justify-between sm:px-8">
        <span>© 2026 Agri-Connect JA. All Rights Reserved.</span>
        <span>Commercial Procurement</span>
      </footer>

      <style jsx global>{`
        /* ---------- Theme tokens: every colour below comes from these ---------- */
        .buyer-root {
          --bg: radial-gradient(ellipse at top, #263313 0%, #101807 48%, #0b1206 100%);
          --tx: #f5f5e9; --mu: #b9c5a5; --sub: #d0d8c5;
          --ac: #FED100; --ok: #8fe3aa;
          --panel: rgba(35,47,27,.88); --inner: #202b18; --well: rgba(0,0,0,.18);
          --bd: rgba(255,255,255,.12); --hdr: #0a1a11; --menu: #12251a; --modal: #1b2613;
          --th: #42451e; --thtx: #FED100; --field: #121a0d; --track: rgba(255,255,255,.1);
          --bar: linear-gradient(to top, #b58f00, #FED100); --hover: rgba(255,255,255,.04);
          --p1bg: rgba(120,220,150,.16); --p1tx: #8fe3aa;
          --p2bg: rgba(254,209,0,.16); --p2tx: #FED100;
          --p3bg: rgba(255,255,255,.1); --p3tx: #d0d8c5;
          color: var(--tx); background: var(--bg);
        }
        .buyer-light {
          --bg: radial-gradient(ellipse at top, #FFF4B8 0%, #F6F7EE 48%, #E8EFDB 100%);
          --tx: #17210f; --mu: #566244; --sub: #3a462b;
          --ac: #7a6000; --ok: #166534;
          --panel: rgba(255,255,255,.88); --inner: #ffffff; --well: rgba(23,33,15,.05);
          --bd: rgba(23,33,15,.14); --hdr: #ffffff; --menu: #ffffff; --modal: #ffffff;
          --th: rgba(254,209,0,.4); --thtx: #3d3000; --field: #ffffff; --track: rgba(23,33,15,.09);
          --bar: linear-gradient(to top, #d9ac00, #FED100); --hover: rgba(23,33,15,.04);
          --p1bg: rgba(30,140,70,.14); --p1tx: #166534;
          --p2bg: rgba(254,209,0,.38); --p2tx: #5e4900;
          --p3bg: rgba(23,33,15,.08); --p3tx: #3a462b;
        }

        /* ---------- Text helpers ---------- */
        .t-mu { color: var(--mu); } .t-sub { color: var(--sub); } .t-ac { color: var(--ac); }
        .t-tx { color: var(--tx); } .t-ok { color: var(--ok); }

        /* ---------- Surfaces ---------- */
        .panel { border: 1px solid var(--bd); background: var(--panel); border-radius: 24px; padding: 24px; }
        .stat { border: 1px solid var(--bd); background: var(--panel); border-radius: 20px; padding: 20px 22px; }
        .inner-card { border: 1px solid var(--bd); background: var(--inner); }
        .well { background: var(--well); }
        .modal { background: var(--modal); border: 1px solid var(--bd); color: var(--tx); }
        .hr-b { border-bottom: 1px solid var(--bd); } .hr-t { border-top: 1px solid var(--bd); }
        .field { width: 100%; border: 1px solid var(--bd); border-radius: 12px; background: var(--field); color: var(--tx); padding: 11px 13px; outline: none; }
        .field:focus { border-color: #FED100; box-shadow: 0 0 0 2px rgba(254,209,0,.25); }
        .field::placeholder { color: var(--mu); opacity: .8; }
        select.field option { background: var(--field); color: var(--tx); }

        /* ---------- Buttons ---------- */
        .btn-gold { background: linear-gradient(135deg, #FED100, #F2B705); color: #1a1500; font-weight: 800; border-radius: 12px; border: 0; cursor: pointer; transition: filter .15s; }
        .btn-gold:hover { filter: brightness(1.06); }
        .btn-ghost-disabled { padding: 10px 16px; border-radius: 10px; border: 1px solid var(--bd); background: transparent; color: var(--mu); font-size: 14px; font-weight: 600; cursor: not-allowed; white-space: nowrap; }
        .opt { border: 1px solid var(--bd); background: var(--well); color: var(--tx); border-radius: 12px; padding: 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .opt.is-on { border-color: #FED100; background: var(--th); color: var(--thtx); }

        /* ---------- Status pills ---------- */
        .pill { display: inline-block; white-space: nowrap; border-radius: 999px; padding: 6px 12px; font-size: 11px; font-weight: 800; letter-spacing: .04em; }
        .pill-green { background: var(--p1bg); color: var(--p1tx); }
        .pill-gold { background: var(--p2bg); color: var(--p2tx); }
        .pill-gray { background: var(--p3bg); color: var(--p3tx); }

        /* ---------- Table ---------- */
        .tbl-wrap { border: 1px solid var(--bd); }
        .tbl thead tr { background: var(--th); color: var(--thtx); }
        .tbl tbody tr { border-top: 1px solid var(--bd); }
        .tbl tbody tr:hover { background: var(--hover); }

        /* ---------- Charts ---------- */
        .chart-base { border-bottom: 1px solid var(--bd); }
        .bar-v { background: var(--bar); }
        .bar-track { height: 12px; border-radius: 999px; background: var(--track); overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #F2B705, #FED100); }

        /* ---------- Header ---------- */
        .buyer-header { position: sticky; top: 0; z-index: 1000; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; padding: 18px 48px; border-bottom: 1px solid var(--bd); background: var(--hdr); }
        .buyer-header-brand, .buyer-header-actions { display: flex; align-items: center; gap: 16px; }
        .buyer-header-actions { position: relative; }
        .buyer-logo-wrap { position: relative; display: inline-block; line-height: 0; }
        .buyer-logo { height: 46px; width: auto; display: block; }
        /* Dark mode: hide the img and paint the same shape in #FED100 through a mask */
        .buyer-root:not(.buyer-light) .buyer-logo { opacity: 0; }
        .buyer-root:not(.buyer-light) .buyer-logo-wrap::after { content: ''; position: absolute; inset: 0; background: #FED100; -webkit-mask: url(${LOGO_DARK}) center / contain no-repeat; mask: url(${LOGO_DARK}) center / contain no-repeat; }
        .buyer-header-divider { width: 1px; height: 32px; background: var(--bd); }
        .buyer-header-title { font-size: 20px; }
        .buyer-settings { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--bd); border-radius: 14px; background: var(--panel); color: var(--tx); cursor: pointer; }
        .buyer-settings:hover { background: var(--hover); }
        .buyer-scrim { position: fixed; inset: 0; background: transparent; border: 0; cursor: default; }
        .buyer-menu { position: absolute; z-index: 1; top: 60px; right: 0; width: 280px; padding: 12px; border-radius: 20px; background: var(--menu); color: var(--tx); border: 1px solid var(--bd); box-shadow: 0 18px 40px rgba(0,0,0,.3); }
        .buyer-menu-label { padding: 8px 12px 8px; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--mu); }
        .buyer-theme-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 4px 12px; }
        .buyer-theme-btn { min-height: 42px; border: 1px solid var(--bd); border-radius: 12px; background: var(--well); color: var(--tx); font-weight: 700; cursor: pointer; }
        .buyer-theme-btn.is-active { background: #FED100; color: #1a1500; border-color: #FED100; }
        .buyer-menu-divider { height: 1px; background: var(--bd); margin: 2px 4px 6px; }
        .buyer-menuitem { display: block; width: 100%; text-align: left; font-size: 15px; font-weight: 600; min-height: 46px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: var(--tx); cursor: pointer; text-decoration: none; line-height: 46px; }
        .buyer-menuitem-row { display: flex; align-items: center; justify-content: space-between; }
        .buyer-menuitem:hover { background: var(--hover); }
        @media (max-width: 640px) { .buyer-header { padding: 14px 20px; } .buyer-header-title { font-size: 15px; } .buyer-logo { height: 38px; } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat">
      <p className="text-xs font-semibold t-mu">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-tight ${accent ? 't-ac' : ''}`}>{value}</p>
    </div>
  );
}

function FarmerBar({ name, crop, count, width }: { name: string; crop: string; count: number; width: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex justify-between gap-3 text-sm">
        <span><strong>{name}</strong><span className="t-mu"> · {crop}</span></span>
        <strong className="t-ac">{count}</strong>
      </div>
      <div className="bar-track"><div className="bar-fill" style={{ width }} /></div>
    </div>
  );
}