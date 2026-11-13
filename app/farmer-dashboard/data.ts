// Starter data for the front-end-only dashboard. Swap for real data later.
export type Sensor = { id: string; name: string; m: [string, string][]; t: (number | null)[] };
export type Harvest = { id: number; crop: string; lbs: number; grade: "A" | "B" | "C"; date: string };
export type Pending = { kind: "log" | "sensor"; id: number | string } | null;

export const METRIC_LABELS = ["Moisture", "Temp", "Humidity", "Soil pH"];
export const TREND_TIMES = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM"];

export const INITIAL_SENSORS: Sensor[] = [
  { id: "SENSOR-001", name: "Block A · Sweet Pepper Field", m: [["32%", "Needs water"], ["31°C", "Warm"], ["64%", "Good"], ["6.5", "Balanced"]], t: [48, 42, 38, 35, 32] },
  { id: "SENSOR-002", name: "Block B · Yellow Yam Field", m: [["51%", "On target"], ["29°C", "Optimal"], ["70%", "Good"], ["6.2", "Balanced"]], t: [46, 48, 50, 51, 51] },
  { id: "SENSOR-003", name: "Greenhouse 1 · Callaloo", m: [["44%", "Fair"], ["33°C", "Hot"], ["58%", "Good"], ["6.8", "Balanced"]], t: [55, 52, 49, 46, 44] },
  { id: "SENSOR-004", name: "Block C · Scallion Beds", m: [["39%", "Low"], ["30°C", "Warm"], ["66%", "Good"], ["6.4", "Balanced"]], t: [40, 40, 39, 39, 39] },
];

export const INITIAL_HARVESTS: Harvest[] = [
  { id: 1, crop: "Sweet Pepper", lbs: 850, grade: "A", date: "2026-11-01" },
  { id: 2, crop: "Yellow Yam", lbs: 1200, grade: "B", date: "2026-10-28" },
];

export const INITIAL_ABOUT = {
  farm: "My Farm", parish: "St. Elizabeth", crops: "Sweet pepper, yellow yam", years: "12 years farming",
  bio: "Tell other farmers and buyers a little about you and your farm.",
};

// Sample triangulation result. Replace with your gateway/sensor API.
export const GATEWAYS = [
  { name: "Gateway North", dbm: -61, w: 88 },
  { name: "Gateway Ridge", dbm: -68, w: 70 },
  { name: "Gateway Mill", dbm: -74, w: 52 },
];