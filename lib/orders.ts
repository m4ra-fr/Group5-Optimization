'use client';

import { useCallback, useEffect, useState } from 'react';

// Front-end-only orders store. Orders live in localStorage so the listings page,
// the farmer dashboard and the buyer dashboard all read and write the same list
// (same browser only). Swap readOrders/writeOrders for API calls later.

export type OrderStatus =
  | 'AWAITING FARMER'
  | 'APPROVED'
  | 'PREPARING'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'RECEIVED'
  | 'DECLINED';

export type Order = {
  id: number;
  buyerId: string;
  buyerName: string;
  farmer: string;
  crop: string;
  quantityLbs: number;
  total: number; // JMD
  paymentMethod: string;
  status: OrderStatus;
  placedOn: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD
  deliveryLocation: string;
};

// Statuses a farmer can move an approved order through, in order.
export const FARMER_STATUSES: OrderStatus[] = ['APPROVED', 'PREPARING', 'OUT FOR DELIVERY', 'DELIVERED'];

const STORAGE_KEY = 'agri-orders';
const CHANGE_EVENT = 'agri-orders-changed';

// Sample orders so both dashboards have something to show on first load.
// buyerId 'seed' means "show to every buyer".
const SEED_ORDERS: Order[] = [
  { id: 901, buyerId: 'seed', buyerName: 'Sandals Whitehouse', farmer: 'Keneisha Sterling', crop: 'Scotch Bonnet Pepper', quantityLbs: 500, total: 190000, paymentMethod: 'Card (Escrow Hold)', status: 'PREPARING', placedOn: '2026-11-02', deliveryDate: '2026-11-16', deliveryLocation: 'Whitehouse, Westmoreland' },
  { id: 902, buyerId: 'seed', buyerName: 'Hi-Lo Supermarket', farmer: 'Marcus Reid', crop: 'Sweet Pepper', quantityLbs: 300, total: 114000, paymentMethod: 'Cash on Delivery', status: 'OUT FOR DELIVERY', placedOn: '2026-11-05', deliveryDate: '2026-11-14', deliveryLocation: 'Constant Spring Road, St. Andrew' },
  { id: 903, buyerId: 'seed', buyerName: 'Sandals Whitehouse', farmer: 'Devon Campbell', crop: 'Irish Potato', quantityLbs: 800, total: 168000, paymentMethod: 'Card (Escrow Hold)', status: 'AWAITING FARMER', placedOn: '2026-11-10', deliveryDate: '2026-11-20', deliveryLocation: 'Whitehouse, Westmoreland' },
];

export const money = (amount: number) => `JMD $${amount.toLocaleString('en-JM')}`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-JM', { day: 'numeric', month: 'short', year: 'numeric' });

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    /* fall through to the seed data */
  }
  return SEED_ORDERS;
}

function writeOrders(next: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked or full: ignore */
  }
  
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load after mount so server and client markup match.
  useEffect(() => {
    const sync = () => setOrders(readOrders());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addOrder = useCallback((order: Order) => {
    writeOrders([order, ...readOrders()]);
  }, []);

  const updateOrder = useCallback((id: number, patch: Partial<Order>) => {
    writeOrders(readOrders().map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  return { orders, addOrder, updateOrder };
}