"use client";
import { useEffect, useRef, useState } from "react";
import { INITIAL_ABOUT, INITIAL_HARVESTS, INITIAL_SENSORS, type Harvest, type Pending, type Sensor } from "./data";

export type Theme = "light" | "dark";
const emptyForm = { name: "", interval: "15 min", low: "35", heat: "33" };

export function useDashboard() {
  // theme (saved in localStorage, falls back to the device setting)
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("fd-theme") as Theme | null;
    setThemeState(saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  }, []);
  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem("fd-theme", t); };
  const [menuOpen, setMenuOpen] = useState(false);

  // profile
  const [about, setAbout] = useState(INITIAL_ABOUT);
  const [editingAbout, setEditingAbout] = useState(false);

  // sensors
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [idx, setIdx] = useState(0);
  const n = sensors.length;
  const go = (i: number) => setIdx(((i % n) + n) % n);
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "scanning" | "found">("idle");
  const [form, setForm] = useState(emptyForm);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const scan = () => { setStep("scanning"); timer.current = setTimeout(() => setStep("found"), 1500); };
  const toggleAdd = () => { setAddOpen((o) => !o); setStep("idle"); };
  const saveSensor = () => {
    const id = "SENSOR-" + String(n + 1).padStart(3, "0");
    const blank: [string, string] = ["—", "Calibrating"];
    setSensors([...sensors, { id, name: form.name || "Block D · New Sensor", m: [blank, blank, blank, blank], t: [null, null, null, null, null] }]);
    setIdx(n); setAddOpen(false); setStep("idle"); setForm(emptyForm);
  };

  // "Trigger Drip Valve": bumps the selected sensor's moisture reading
  const hydrate = () => setSensors(sensors.map((s, i) => i !== idx ? s : { ...s,
    m: [["55%", "Optimal"], ...s.m.slice(1)] as Sensor["m"], t: [...s.t.slice(0, -1), 55] }));

  // harvest log
  const [rows, setRows] = useState<Harvest[]>(INITIAL_HARVESTS);
  const [nw, setNw] = useState({ crop: "", lbs: "", grade: "A" as Harvest["grade"] });
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ crop: "", lbs: "", grade: "A" as Harvest["grade"] });
  const addRow = () => {
    if (!nw.crop || !nw.lbs) return;
    setRows([{ id: Date.now(), crop: nw.crop, lbs: Number(nw.lbs), grade: nw.grade, date: new Date().toISOString().slice(0, 10) }, ...rows]);
    setNw({ crop: "", lbs: "", grade: "A" });
  };
  const startEdit = (r: Harvest) => { setEditId(r.id); setDraft({ crop: r.crop, lbs: String(r.lbs), grade: r.grade }); };
  const saveEdit = () => { setRows(rows.map((r) => (r.id === editId ? { ...r, crop: draft.crop, lbs: Number(draft.lbs), grade: draft.grade } : r))); setEditId(null); };

  // confirm dialog for deleting logs and sensors
  const [pending, setPending] = useState<Pending>(null);
  const confirmPending = () => {
    if (!pending) return;
    if (pending.kind === "log") setRows(rows.filter((r) => r.id !== pending.id));
    else { const left = sensors.filter((s) => s.id !== pending.id); setSensors(left); setIdx(Math.min(idx, left.length - 1)); }
    setPending(null);
  };

  return {
    theme, setTheme, menuOpen, setMenuOpen, about, setAbout, editingAbout, setEditingAbout,
    sensors, sensor: sensors[idx], idx, go, hydrate, addOpen, toggleAdd, step, scan, form, setForm, saveSensor,
    rows, nw, setNw, addRow, editId, setEditId, draft, setDraft, startEdit, saveEdit,
    pending, setPending, confirmPending,
  };
}