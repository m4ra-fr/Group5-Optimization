'use client';

import React from 'react';
import { FARMER_STATUSES, formatDate, money, type Order, type OrderStatus } from '@/lib/orders';

type Props = {
  orders: Order[];
  onUpdate: (id: number, patch: Partial<Order>) => void;
};

const chipClass = (status: OrderStatus) =>
  status === 'AWAITING FARMER' ? 'fd-grade-B' : status === 'DECLINED' ? 'fd-chip-danger' : 'fd-grade-A';

export default function OrdersTab({ orders, onUpdate }: Props) {
  // Demo: the farmer sees every order. Once orders live in the database,
  // filter here by the logged-in farmer (e.g. o.farmerId === session.user.id).
  return (
    <div className="fd-listing" style={{ flex: '1 1 100%' }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Incoming orders</div>
      <div style={{ fontSize: 14, color: 'var(--mu)', marginBottom: 12 }}>
        Approve an order, then keep the delivery status up to date. Buyers see every change on their dashboard.
      </div>

      {orders.length === 0 ? (
        <div className="fd-inset fd-empty">No orders yet. New orders from buyers will show up here.</div>
      ) : (
        <div className="fd-table">
          <table>
            <thead>
              <tr>
                {['Buyer', 'Order', 'Total', 'Delivery', 'Status', 'Action'].map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>
                    {o.buyerName}
                    <div className="fd-sub">{o.paymentMethod}</div>
                  </td>
                  <td>
                    {o.crop}
                    <div className="fd-sub">{o.quantityLbs.toLocaleString()} lbs</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--ac)' }}>{money(o.total)}</td>
                  <td>
                    {formatDate(o.deliveryDate)}
                    <div className="fd-sub">{o.deliveryLocation}</div>
                  </td>
                  <td>
                    <span className={`fd-chip ${chipClass(o.status)}`} style={{ fontSize: 12 }}>{o.status}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {o.status === 'AWAITING FARMER' ? (
                      <>
                        <button type="button" className="fd-btn fd-lime" onClick={() => onUpdate(o.id, { status: 'APPROVED' })}>Approve</button>
                        <button type="button" className="fd-link is-danger" onClick={() => onUpdate(o.id, { status: 'DECLINED' })}>Decline</button>
                      </>
                    ) : o.status === 'DECLINED' ? (
                      <span className="fd-sub">Declined</span>
                    ) : o.status === 'RECEIVED' ? (
                      <span style={{ fontWeight: 700, color: 'var(--ok)' }}>Received ✓</span>
                    ) : (
                      <select
                        className="fd-inp"
                        style={{ minWidth: 190 }}
                        aria-label={`Delivery status for ${o.crop} order from ${o.buyerName}`}
                        value={o.status}
                        onChange={(e) => onUpdate(o.id, { status: e.target.value as OrderStatus })}
                      >
                        {FARMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}