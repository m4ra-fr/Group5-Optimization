'use client';

import './dashboard.css';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useDashboard } from './useDashboard';
import { GATEWAYS, METRIC_LABELS, TREND_TIMES } from './data';

type Grade = 'A' | 'B' | 'C';

type Sensor = {
  id: string;
  name: string;
  m: [string, string][];
  t: (number | null)[];
};

type HarvestRow = {
  id: number;
  crop: string;
  lbs: number;
  grade: Grade;
  date: string;
};

function Field({ label, children, className = '', style }: { label: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <label className={`fd-field ${className}`} style={style}><span className="fd-lbl">{label}</span>{children}</label>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return (
    <div className="fd-table">
      <table>
        <thead><tr>{cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function FarmerDashboardPage() {
  const router = useRouter();
  const d = useDashboard();
  const { data: session } = authClient.useSession();
  const name = session?.user?.name ?? 'Farmer';
  const sensor = d.sensor as Sensor;
  const { about, pending } = d;
  const pendingLog = pending?.kind === 'log' ? d.rows.find((r) => r.id === pending.id) : null;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const [activeTab, setActiveTab] = useState<'harvest' | 'loss' | 'marketplace'>('harvest');

  const moisture = parseInt(sensor.m[0][0]);
  const temp = parseInt(sensor.m[1][0]);
  const alertNeeded = moisture < 35 || temp > 30;

  // Farmer Payout Settings State (kept from your original page)
  const [payoutSettings, setPayoutSettings] = useState({ bankName: 'National Commercial Bank (NCB)', accountNumber: '••••••••8492', accountType: 'Savings' });

  // Produce Photo Uploader
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setNewPhotoUrl(URL.createObjectURL(e.target.files[0]));
  };

  // Report Loss
  const [lossForm, setLossForm] = useState({ crop: '', reason: 'Pest Infestation', action: 'Chemical Spraying', lbsLost: '', notes: '' });
  const [lossLogs, setLossLogs] = useState([
    { id: 1, crop: 'Scotch Bonnet', reason: 'Pest Infestation', action: 'Sprayed Organic Pesticide', lbsLost: '120 lbs', date: '2026-10-25' },
  ]);
  const handleLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossForm.crop || !lossForm.lbsLost) return;
    setLossLogs([{ id: Date.now(), crop: lossForm.crop, reason: lossForm.reason, action: lossForm.action, lbsLost: `${lossForm.lbsLost} lbs`, date: new Date().toISOString().split('T')[0] }, ...lossLogs]);
    setLossForm({ crop: '', reason: 'Pest Infestation', action: 'Chemical Spraying', lbsLost: '', notes: '' });
  };

  // Produce Marketplace
  const emptyMarket = { crop: '', quantity: '', price: '', grade: 'Grade A', delivery: 'Farm Gate Pickup', parish: 'St. Elizabeth', phone: '876-555-0192' };
  const [marketForm, setMarketForm] = useState(emptyMarket);
  const [marketActivity, setMarketActivity] = useState([
    { id: 1, crop: 'Sweet Pepper', quantity: '500 lbs', price: '$380 JMD/lb', status: 'PAID & DELIVERED', buyer: 'Sandals Whitehouse' },
    { id: 2, crop: 'Yellow Yam', quantity: '1,000 lbs', price: '$195 JMD/lb', status: 'OFFER PENDING', buyer: 'Hi-Lo Supermarket' },
  ]);
  const handleMarketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketForm.crop || !marketForm.quantity || !marketForm.price) return;
    setMarketActivity([{ id: Date.now(), crop: marketForm.crop, quantity: `${marketForm.quantity} lbs`, price: `$${marketForm.price} JMD/lb`, status: 'LISTED ACTIVE', buyer: 'Open to Bids' }, ...marketActivity]);
    setMarketForm(emptyMarket);
    setNewPhotoUrl('');
  };

  return (
    <div className="fd" data-theme={d.theme}>
      {/* HEADER */}
      <header className="fd-header">
        <div className="fd-flex">
          <Link href="/" aria-label="Agri-Connect JA home"><img src="/images/logo.png" alt="Agri-Connect JA Logo" className="fd-logo" /></Link>
          <span style={{ width: 1, height: 28, background: 'var(--bbd)' }} />
          <b style={{ fontSize: 18 }}>Farmer Field Control</b>
        </div>
        <div className="fd-flex" style={{ position: 'relative' }}>
          <span className="fd-chip fd-ac" style={{ background: 'var(--abg)', fontSize: 14 }}>RADA Farmer ID: #84920</span>
          <button type="button" className="fd-btn fd-icon" aria-label="Settings" aria-haspopup="true" aria-expanded={d.menuOpen} onClick={() => d.setMenuOpen(!d.menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {d.menuOpen && (
            <div className="fd-menu">
              <div className="fd-lbl" style={{ padding: '8px 14px 6px' }}>Theme</div>
              <div className="fd-grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 6px 10px' }}>
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} type="button" className={'fd-btn' + (d.theme === t ? ' fd-lime' : '')} aria-pressed={d.theme === t} onClick={() => d.setTheme(t)}>
                    {t === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: 'var(--bd)', margin: '2px 6px 6px' }} />
              <Link href="/security" className="fd-menuitem">Security</Link>
              <button type="button" className="fd-menuitem" onClick={handleSignOut}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      <main className="fd-main">
        {/* GREETING + ALERT */}
        <div className="fd-flex fd-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="fd-lbl">{new Date().toLocaleDateString('en-JM', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h1 className="fd-h1">Welcome back, <span className="fd-ac">{name}</span></h1>
            <div style={{ color: 'var(--mu)', fontSize: 16 }}>Here is how your fields are doing today.</div>
          </div>
          {alertNeeded && (
            <div className="fd-alert">
              <div style={{ maxWidth: 380 }}>
                <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.08em', color: 'var(--wn)' }}>FIELD ALERT: ACTION REQUIRED</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>
                  {moisture < 35 && `Soil moisture low (${moisture}%). `}
                  {temp > 30 && `Soil temp high (${temp}°C).`}
                </div>
              </div>
              <button type="button" className="fd-btn fd-lime" onClick={d.hydrate}>Trigger Drip Valve</button>
            </div>
          )}
        </div>

        <div className="fd-row">
          <div className="fd-col">
            {/* ABOUT ME */}
            <section className="fd-glass">
              <div className="fd-flex fd-between">
                <div><div className="fd-lbl">About me</div><div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{about.farm}</div></div>
                <button type="button" className={'fd-btn' + (d.editingAbout ? ' fd-lime' : '')} onClick={() => d.setEditingAbout(!d.editingAbout)}>
                  {d.editingAbout ? 'Save profile' : 'Edit profile'}
                </button>
              </div>
              {!d.editingAbout ? (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: '70ch' }}>{about.bio}</p>
                  <div className="fd-flex" style={{ gap: 10 }}>
                    {[about.parish, about.crops, about.years].map((t) => <span key={t} className="fd-chip" style={{ fontSize: 14, fontWeight: 600 }}>{t}</span>)}
                  </div>
                </div>
              ) : (
                <div className="fd-grid2" style={{ marginTop: 16 }}>
                  {([['farm', 'Farm name'], ['parish', 'Parish'], ['crops', 'Main crops'], ['years', 'Experience']] as const).map(([k, label]) => (
                    <Field key={k} label={label}><input className="fd-inp" value={about[k]} onChange={(e) => d.setAbout({ ...about, [k]: e.target.value })} /></Field>
                  ))}
                  <Field label="A few words about you and your farm" style={{ gridColumn: '1 / -1' }}>
                    <textarea className="fd-inp" rows={3} value={about.bio} onChange={(e) => d.setAbout({ ...about, bio: e.target.value })} />
                  </Field>
                </div>
              )}
            </section>

            {/* SENSORS */}
            <section className="fd-glass">
              <div className="fd-flex fd-between">
                <div>
                  <span className="fd-chip fd-ac" style={{ background: 'var(--abg)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12 }}>{sensor.id}</span>
                  <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>{sensor.name}</div>
                </div>
                <div className="fd-flex" style={{ gap: 8 }}>
                  <span className="fd-chip" style={{ background: 'var(--okbg)', color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />Live probing
                  </span>
                  <button type="button" className="fd-btn fd-icon" aria-label="Previous sensor" onClick={() => d.go(d.idx - 1)}>‹</button>
                  <button type="button" className="fd-btn fd-icon" aria-label="Next sensor" onClick={() => d.go(d.idx + 1)}>›</button>
                </div>
              </div>
              <div className="fd-metrics" style={{ marginTop: 20 }}>
                {sensor.m.map(([value, note]: [string, string], i: number) => (
                  <div key={i} className="fd-metric"><div className="fd-lbl">{METRIC_LABELS[i]}</div><b className={'fd-mc' + i}>{value}</b><div style={{ fontSize: 13, fontWeight: 600 }}>{note}</div></div>
                ))}
              </div>
              <div className="fd-flex fd-between" style={{ marginTop: 24, fontSize: 14, fontWeight: 600 }}><span>Soil moisture, 6 AM to 2 PM</span><span className="fd-ac">Target: 50%</span></div>
              <div className="fd-inset fd-bars">
                {sensor.t.map((v: number | null, i: number) => (
                  <div key={i} className="fd-bar"><span>{v == null ? '—' : `${v}%`}</span><i style={{ height: v == null ? 4 : v * 1.6 }} /><small>{TREND_TIMES[i]}</small></div>
                ))}
              </div>
              <div className="fd-flex fd-between" style={{ marginTop: 22 }}>
                <div className="fd-flex" style={{ gap: 4 }}>
                  {d.sensors.map((s: Sensor, i: number) => (
                    <button key={s.id} type="button" className="fd-dot" aria-label={`Show ${s.id}`} aria-current={i === d.idx} onClick={() => d.go(i)}><span /></button>
                  ))}
                </div>
                <label className="fd-field" style={{ flex: '1 1 260px', maxWidth: 380 }}>
                  <span className="fd-lbl">All sensors ({d.sensors.length} online)</span>
                  <select className="fd-inp" value={d.idx} onChange={(e) => d.go(Number(e.target.value))}>
                  {d.sensors.map((s: Sensor, i: number) => (
                    <option key={s.id} value={i}>
                      {s.id} · {s.name}
                    </option>
                  ))}
                  </select>
                </label>
                <div className="fd-flex" style={{ gap: 10, alignSelf: 'flex-end' }}>
                  {d.sensors.length > 1 && <button type="button" className="fd-btn" style={{ color: 'var(--dg)' }} onClick={() => d.setPending({ kind: 'sensor', id: sensor.id })}>Delete sensor</button>}
                  <button type="button" className="fd-btn fd-lime" onClick={d.toggleAdd}>+ Add sensor</button>
                </div>
              </div>

              {d.addOpen && (
                <div className="fd-panel">
                  <div className="fd-flex fd-between">
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>Add and configure a sensor</div>
                      <div style={{ fontSize: 14, color: 'var(--mu)', marginTop: 2 }}>Power on the probe, then triangulate it against nearby gateways.</div>
                    </div>
                    <button type="button" className="fd-btn" onClick={d.toggleAdd}>Close</button>
                  </div>
                  <div className="fd-grid2">
                    <Field label="Sensor name"><input className="fd-inp" placeholder="e.g. Block D · Scotch Bonnet" value={d.form.name} onChange={(e) => d.setForm({ ...d.form, name: e.target.value })} /></Field>
                    <Field label="Reading interval">
                      <select className="fd-inp" value={d.form.interval} onChange={(e) => d.setForm({ ...d.form, interval: e.target.value })}>
                        <option value="5 min">Every 5 min</option><option value="15 min">Every 15 min</option><option value="1 hr">Every hour</option>
                      </select>
                    </Field>
                    <Field label="Low-moisture alert (%)"><input className="fd-inp" type="number" value={d.form.low} onChange={(e) => d.setForm({ ...d.form, low: e.target.value })} /></Field>
                    <Field label="Heat alert (°C)"><input className="fd-inp" type="number" value={d.form.heat} onChange={(e) => d.setForm({ ...d.form, heat: e.target.value })} /></Field>
                  </div>
                  <div className="fd-flex" role="status">
                    {d.step === 'idle' && <button type="button" className="fd-btn" onClick={d.scan}>Triangulate position</button>}
                    {d.step === 'scanning' && <span className="fd-ac" style={{ fontWeight: 600 }}>Listening for gateways…</span>}
                    {d.step === 'found' && <><span style={{ fontWeight: 700, color: 'var(--ok)' }}>Located: Block D, within about 4 m</span><button type="button" className="fd-btn" onClick={d.scan}>Re-scan</button></>}
                  </div>
                  {d.step === 'found' ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {GATEWAYS.map((g) => (
                          <div key={g.name} className="fd-gw"><span style={{ flex: '0 0 130px', fontWeight: 600 }}>{g.name}</span><div><i style={{ width: `${g.w}%` }} /></div><span style={{ flex: '0 0 74px', textAlign: 'right', color: 'var(--mu)' }}>{g.dbm} dBm</span></div>
                        ))}
                      </div>
                      <div><button type="button" className="fd-btn fd-lime" style={{ minHeight: 48 }} onClick={d.saveSensor}>Save sensor</button></div>
                    </>
                  ) : <div style={{ fontSize: 13, color: 'var(--mu)' }}>Saving unlocks once the sensor has been located.</div>}
                </div>
              )}
            </section>
          </div>

          {/* FORECAST + BEST CROP */}
          <aside className="fd-glass fd-side">
            <span className="fd-chip" style={{ background: '#D6FF3F', color: '#0B2316', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12 }}>St. Elizabeth forecast</span>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>29°C</div>
            <div className="fd-ac" style={{ fontSize: 18, fontWeight: 700 }}>Optimal spraying weather</div>
            <div className="fd-flex" style={{ gap: 28, paddingTop: 16, borderTop: '1px solid var(--bd)' }}>
              <div><div className="fd-lbl">Wind</div><div style={{ fontWeight: 700, marginTop: 4 }}>12 km/h SSW</div></div>
              <div><div className="fd-lbl">Rain chance</div><div style={{ fontWeight: 700, marginTop: 4 }}>15%</div></div>
            </div>
            <div className="fd-inset" style={{ padding: 16 }}>
              <div className="fd-lbl fd-ac">3-day parish outlook</div>
              <div className="fd-flex fd-between" style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}><span>Wed 30°C</span><span>Thu 28°C</span><span>Fri 29°C</span></div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: 'var(--abg)', border: '1px solid var(--bd)' }}>
              <div className="fd-lbl fd-ac">Best crop to plant now</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 8px' }}>Scotch Bonnet Pepper</div>
              <p style={{ fontSize: 14, lineHeight: 1.55 }}>Warm 28–30°C days and a low 15% rain chance suit heat-loving crops and keep fungal pressure down. Plant now and pair with drip irrigation.</p>
              <div className="fd-flex" style={{ gap: 8, marginTop: 12 }}><span className="fd-chip" style={{ fontSize: 13, fontWeight: 600 }}>Also good: Sweet potato</span><span className="fd-chip" style={{ fontSize: 13, fontWeight: 600 }}>Callaloo</span></div>
            </div>
          </aside>
        </div>

        {/* FIELD HUB: 3 TABS */}
        <section className="fd-glass" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="fd-flex" style={{ gap: 10 }}>
            {([['harvest', 'Log Harvest Calendar'], ['loss', 'Report Crop Loss'], ['marketplace', 'Produce Marketplace']] as const).map(([k, label]) => (
              <button key={k} type="button" className="fd-tab" aria-pressed={activeTab === k} onClick={() => setActiveTab(k)}>{label}</button>
            ))}
          </div>

          {/* TAB 1: HARVEST (editable, confirm delete) */}
          {activeTab === 'harvest' && (
            <div className="fd-row">
              <form className="fd-form" onSubmit={(e) => { e.preventDefault(); d.addRow(); }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Record new harvest</div>
                <Field label="Crop name"><input className="fd-inp" required placeholder="e.g. Sweet Pepper, Yellow Yam" value={d.nw.crop} onChange={(e) => d.setNw({ ...d.nw, crop: e.target.value })} /></Field>
                <div className="fd-grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Amount (lbs)"><input className="fd-inp" type="number" required placeholder="e.g. 500" value={d.nw.lbs} onChange={(e) => d.setNw({ ...d.nw, lbs: e.target.value })} /></Field>
                  <Field label="Grade">
                    <select className="fd-inp" value={d.nw.grade} onChange={(e) => d.setNw({ ...d.nw, grade: e.target.value as Grade })}>
                      <option value="A">Grade A (Premium)</option><option value="B">Grade B (Standard)</option><option value="C">Grade C (Processing)</option>
                    </select>
                  </Field>
                </div>
                <button type="submit" className="fd-btn fd-lime" style={{ minHeight: 48 }}>+ Save to harvest calendar</button>
              </form>
              <div className="fd-listing">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent harvest logs</div>
                <Table cols={['Crop', 'Harvested', 'Grade', 'Date', '']}>
                  {d.rows.map((r: HarvestRow) => d.editId === r.id ? (
                    <tr key={r.id}>
                      <td><input className="fd-inp" aria-label="Crop" value={d.draft.crop} onChange={(e) => d.setDraft({ ...d.draft, crop: e.target.value })} /></td>
                      <td><input className="fd-inp" type="number" aria-label="Pounds" value={d.draft.lbs} onChange={(e) => d.setDraft({ ...d.draft, lbs: e.target.value })} /></td>
                      <td>
                        <select className="fd-inp" aria-label="Grade" value={d.draft.grade} onChange={(e) => d.setDraft({ ...d.draft, grade: e.target.value as Grade })}>
                          <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                        </select>
                      </td>
                      <td>{r.date}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><button type="button" className="fd-link" onClick={d.saveEdit}>Save</button><button type="button" className="fd-link is-muted" onClick={() => d.setEditId(null)}>Cancel</button></td>
                    </tr>
                  ) : (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.crop}</td>
                      <td>{r.lbs.toLocaleString()} lbs</td>
                      <td><span className={`fd-chip fd-grade-${r.grade}`}>Grade {r.grade}</span></td>
                      <td>{r.date}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><button type="button" className="fd-link" onClick={() => d.startEdit(r)}>Edit</button><button type="button" className="fd-link is-danger" onClick={() => d.setPending({ kind: 'log', id: r.id })}>Delete</button></td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          )}

          {/* TAB 2: REPORT LOSS */}
          {activeTab === 'loss' && (
            <div className="fd-row">
              <form className="fd-form" onSubmit={handleLossSubmit}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Report crop loss event</div>
                <Field label="Crop affected"><input className="fd-inp" required placeholder="e.g. Scotch Bonnet" value={lossForm.crop} onChange={(e) => setLossForm({ ...lossForm, crop: e.target.value })} /></Field>
                <div className="fd-grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Primary cause">
                    <select className="fd-inp" value={lossForm.reason} onChange={(e) => setLossForm({ ...lossForm, reason: e.target.value })}>
                      <option value="Pest Infestation">Pest Infestation</option><option value="Flood & Heavy Rain">Flood &amp; Heavy Rain</option><option value="Drought & Heat">Drought &amp; Heat</option>
                      <option value="Crop Disease">Crop Disease</option><option value="Praedial Larceny (Theft)">Praedial Larceny (Theft)</option>
                    </select>
                  </Field>
                  <Field label="Loss weight (lbs)"><input className="fd-inp" type="number" required placeholder="e.g. 150" value={lossForm.lbsLost} onChange={(e) => setLossForm({ ...lossForm, lbsLost: e.target.value })} /></Field>
                </div>
                <Field label="Action taken">
                  <select className="fd-inp" value={lossForm.action} onChange={(e) => setLossForm({ ...lossForm, action: e.target.value })}>
                    <option value="Chemical Spraying">Chemical Spraying</option><option value="Crop Cleared">Crop Cleared &amp; Burned</option>
                    <option value="Re-fertilized Soil">Re-fertilized Soil</option><option value="Requested Gov/RADA Assistance">Requested Gov/RADA Assistance</option>
                  </select>
                </Field>
                <button type="submit" className="fd-btn fd-danger" style={{ minHeight: 48 }}>Submit loss report</button>
              </form>
              <div className="fd-listing">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent loss incident logs</div>
                <Table cols={['Crop', 'Cause', 'Weight lost', 'Action taken']}>
                  {lossLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 700 }}>{log.crop}</td>
                      <td style={{ color: 'var(--dg)' }}>{log.reason}</td>
                      <td style={{ fontWeight: 700 }}>{log.lbsLost}</td>
                      <td>{log.action}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          )}

          {/* TAB 3: MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="fd-row">
              <form className="fd-form" onSubmit={handleMarketSubmit}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>List crop for sale</div>
                <Field label="Crop name"><input className="fd-inp" required placeholder="e.g. Yellow Yam, Sweet Pepper" value={marketForm.crop} onChange={(e) => setMarketForm({ ...marketForm, crop: e.target.value })} /></Field>
                <div className="fd-grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Quantity (lbs)"><input className="fd-inp" type="number" required placeholder="e.g. 1000" value={marketForm.quantity} onChange={(e) => setMarketForm({ ...marketForm, quantity: e.target.value })} /></Field>
                  <Field label="Price (JMD / lb)"><input className="fd-inp" type="number" required placeholder="e.g. 195" value={marketForm.price} onChange={(e) => setMarketForm({ ...marketForm, price: e.target.value })} /></Field>
                </div>
                <Field label="Upload produce photo">
                  <input className="fd-file" type="file" accept="image/*" onChange={handlePhotoUpload} />
                </Field>
                {newPhotoUrl && <img src={newPhotoUrl} alt="Crop preview" className="fd-photo" />}
                <button type="submit" className="fd-btn fd-lime" style={{ minHeight: 48 }}>List produce on marketplace</button>
              </form>
              <div className="fd-listing">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Live marketplace activity log</div>
                <Table cols={['Crop', 'Quantity', 'Price', 'Status', 'Buyer']}>
                  {marketActivity.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>{item.crop}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 700, color: 'var(--ac)' }}>{item.price}</td>
                      <td><span className="fd-chip fd-grade-A" style={{ fontSize: 12 }}>{item.status}</span></td>
                      <td>{item.buyer}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          )}
        </section>

        <footer style={{ fontSize: 13, color: 'var(--mu)', textAlign: 'center' }}>© 2026 Agri-Connect JA. All Rights Reserved.</footer>
      </main>

      {/* DELETE CONFIRMATION POP-UP */}
      {pending && (
        <div className="fd-overlay">
          <div className="fd-dialog" role="dialog" aria-modal="true" aria-labelledby="fd-dlg">
            <div id="fd-dlg" style={{ fontSize: 22, fontWeight: 800 }}>{pending.kind === 'log' ? 'Delete harvest log?' : 'Delete sensor?'}</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mu)' }}>
              {pending.kind === 'log'
                ? `This removes the ${pendingLog?.crop ?? 'selected'} entry from your harvest calendar. This cannot be undone.`
                : `This removes ${sensor.id} (${sensor.name}) and stops its readings and alerts. This cannot be undone.`}
            </p>
            <div className="fd-flex" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="fd-btn" onClick={() => d.setPending(null)}>Cancel</button>
              <button type="button" className="fd-btn fd-danger" onClick={d.confirmPending}>{pending.kind === 'log' ? 'Delete log' : 'Delete sensor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}