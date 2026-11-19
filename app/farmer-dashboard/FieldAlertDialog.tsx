'use client';

import React, { useEffect } from 'react';

// Alert thresholds, shared with page.tsx so the pop-up and the check can't drift apart.
export const MOISTURE_LOW = 35;
export const TEMP_HIGH = 30;

type Props = {
  sensorId: string;
  sensorName: string;
  moisture: number;
  temp: number;
  onTriggerValve: () => void;
  onDismiss: () => void;
};

export default function FieldAlertDialog({ sensorId, sensorName, moisture, temp, onTriggerValve, onDismiss }: Props) {
  // Escape closes the pop-up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const items: { issue: string; action: string }[] = [];
  if (moisture < MOISTURE_LOW) {
    items.push({
      issue: `Soil moisture is low (${moisture}%)`,
      action: 'Open the drip valve and irrigate this block now.',
    });
  }
  if (temp > TEMP_HIGH) {
    items.push({
      issue: `Soil temperature is high (${temp}°C)`,
      action: 'Irrigate in the cool of the day and add mulch or shade to cool the bed.',
    });
  }

  return (
    <div className="fd-overlay" onClick={onDismiss}>
      <div
        className="fd-dialog fd-alert-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fd-alert-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="fd-alert-title" className="fd-alert-eyebrow">FIELD ALERT: ACTION REQUIRED</div>

        <div>
          <span className="fd-chip fd-ac" style={{ background: 'var(--abg)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12 }}>
            {sensorId}
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>{sensorName}</div>
        </div>

        {items.map((it) => (
          <div key={it.issue} className="fd-alert-item">
            <div style={{ fontWeight: 700, fontSize: 15 }}>{it.issue}</div>
            <div style={{ fontSize: 14, color: 'var(--mu)' }}>Action: {it.action}</div>
          </div>
        ))}

        <div className="fd-flex" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="fd-btn" onClick={onDismiss}>Dismiss</button>
          <button type="button" className="fd-btn fd-lime" onClick={onTriggerValve}>Trigger Drip Valve</button>
        </div>
      </div>
    </div>
  );
}