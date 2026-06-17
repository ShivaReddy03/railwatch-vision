import type { Alert, Train, RailNode, Device, Report, Incident, AnalyticsSummary, Severity, TrainStatus, NodeStatus } from "@/types";
import detectionImg from "@/assets/detection-rock.jpg";

const ZONES = ["South Central", "South Western", "Northern", "Western", "Central", "Eastern", "North Eastern"];
const LINES = ["North Line", "South Line", "East Line", "West Line", "Central Line"];
const OBJECTS = ["Rock Detected", "Track Obstruction", "Low Visibility Detected", "Animal on Track", "Debris", "Person on Track", "Vegetation Overgrowth"];
const TRAIN_NAMES = ["Rajdhani Express", "Shatabdi Express", "Duronto", "Garib Rath", "Tejas Express", "Vande Bharat", "Jan Shatabdi", "Sampark Kranti", "Intercity", "Passenger", "Superfast", "Mail Express", "Freight"];
const STATIONS = ["Central", "Harbor", "Junction", "North Yard", "West Station", "East Yard", "South Cabin", "Terminal"];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function rng(seed: number) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

export function generateNodes(count = 500): RailNode[] {
  const r = rng(7);
  return Array.from({ length: count }, (_, i) => {
    const v = r();
    const status: NodeStatus = v > 0.95 ? "critical" : v > 0.88 ? "warning" : v > 0.84 ? "offline" : "normal";
    return {
      id: `N${(i + 1).toString().padStart(3, "0")}`,
      zone: pick(ZONES, i),
      line: pick(LINES, i),
      label: `Node ${i + 1}`,
      gps: { lat: 12 + r() * 20, lng: 72 + r() * 15 },
      status,
      cameraStatus: status === "offline" ? "offline" : status === "warning" ? "degraded" : "online",
      commStatus: status === "offline" ? "offline" : "online",
      powerStatus: "online",
      health: status === "critical" ? 35 : status === "warning" ? 72 : status === "offline" ? 0 : 92 + Math.floor(r() * 8),
      lastSeen: new Date(Date.now() - r() * 600000).toISOString(),
    };
  });
}

export function generateAlerts(count = 1000): Alert[] {
  const r = rng(13);
  return Array.from({ length: count }, (_, i) => {
    const v = r();
    const sev: Severity = v > 0.85 ? "critical" : v > 0.55 ? "warning" : "info";
    const d = new Date(Date.now() - i * 1800000);
    const obj = pick(OBJECTS, i);
    return {
      id: `ALT-2026-${(i + 1).toString().padStart(4, "0")}`,
      date: d.toISOString().slice(0, 10),
      time: d.toTimeString().slice(0, 8),
      timestamp: d.toISOString(),
      zone: pick(ZONES, i),
      line: pick(LINES, i),
      node: `N${((i % 156) + 1).toString().padStart(3, "0")}`,
      objectCategory: obj,
      title: `${obj} on ${pick(LINES, i)}`,
      source: pick(["AI Camera", "Track Sensor", "Operator", "Maintenance"], i),
      location: `${pick(LINES, i)} - Node ${(i % 50) + 10}`,
      severity: sev,
      confidence: 70 + Math.floor(r() * 30),
      status: i < 22 ? (v > 0.6 ? "active" : v > 0.3 ? "acknowledged" : "resolved") : "resolved",
      nearestTrain: `${12000 + i}`,
      distanceKm: +(r() * 30).toFixed(1),
      etaSec: Math.floor(r() * 900),
      imageUrl: detectionImg,
      riskScore: Math.floor(40 + r() * 60),
    };
  });
}

export function generateTrains(count = 500): Train[] {
  const r = rng(29);
  return Array.from({ length: count }, (_, i) => {
    const v = r();
    const status: TrainStatus = v > 0.92 ? "at_risk" : v > 0.7 ? "monitor" : v > 0.55 ? "delayed" : v > 0.3 ? "on_time" : "safe";
    const delay = status === "delayed" ? Math.floor(r() * 30) + 5 : status === "at_risk" ? Math.floor(r() * 15) + 6 : 0;
    return {
      id: `T-${i + 1}`,
      number: `${12000 + i * 7}`,
      name: `${pick(TRAIN_NAMES, i)} ${i + 100}`,
      zone: pick(ZONES, i),
      line: pick(LINES, i),
      from: pick(STATIONS, i),
      to: pick(STATIONS, i + 3),
      currentLocation: pick(STATIONS, i),
      destination: pick(STATIONS, i + 3),
      speedKmh: 30 + Math.floor(r() * 100),
      etaMin: Math.floor(r() * 60) + 5,
      delayMin: delay,
      status,
      distanceFromIncidentKm: +(r() * 60).toFixed(1),
    };
  });
}

export function generateDevices(nodes: RailNode[]): Device[] {
  return nodes.slice(0, 100).map((n, i) => ({
    id: `DEV-${(i + 1).toString().padStart(3, "0")}`,
    name: `${pick(["Rock Sensor", "Track Monitor", "Environment Sensor", "Comm Gateway", "AI Camera"], i)} ${i + 1}`,
    nodeId: n.id,
    location: `${n.line} - ${n.label}`,
    type: pick(["AI Camera Unit", "Track Monitor Unit", "Environment Unit", "Gateway"], i),
    health: n.status,
    status: n.status === "offline" ? "offline" : "online",
    lastSeen: n.lastSeen,
    sensors: { ok: n.status === "normal" ? 4 : 2, warn: n.status === "warning" ? 1 : 0, critical: n.status === "critical" ? 2 : 0, offline: n.status === "offline" ? 2 : 0 },
    components: [
      { name: "RGB Camera", status: n.cameraStatus === "online" ? "normal" : "warning", lastMaintenance: "2026-05-10" },
      { name: "Edge Processor", status: "normal", lastMaintenance: "2026-04-22" },
      { name: "Communication Module", status: n.commStatus === "online" ? "normal" : "critical", lastMaintenance: "2026-05-01" },
      { name: "Power System", status: "normal", lastMaintenance: "2026-03-15" },
    ],
  }));
}

export function generateReports(count = 128): Report[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `RPT-${(i + 1).toString().padStart(4, "0")}`,
    name: pick(["Daily Summary Report", "Weekly System Report", "Alerts Report", "Train Performance Report", "Device Health Report", "Monthly Analytics Report", "Incident Report"], i),
    type: pick(["Summary", "Alerts", "Trains", "Devices", "Analytics", "Incidents"], i),
    dateRange: "01 May 2026 - 24 May 2026",
    generatedOn: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    generatedBy: pick(["System", "Control Room Operator", "Maintenance Team"], i),
    format: pick(["PDF", "Excel", "CSV"] as const, i),
    sizeMb: +(1 + (i % 10) * 0.4).toFixed(1),
  }));
}

export function generateIncidents(count = 1000): Incident[] {
  const r = rng(91);
  return Array.from({ length: count }, (_, i) => ({
    id: `INC-${(i + 1).toString().padStart(5, "0")}`,
    type: pick(OBJECTS, i),
    date: new Date(Date.now() - i * 3600000).toISOString().slice(0, 10),
    zone: pick(ZONES, i),
    line: pick(LINES, i),
    node: `N${((i % 156) + 1).toString().padStart(3, "0")}`,
    status: r() > 0.85 ? "investigating" : r() > 0.2 ? "resolved" : "open",
    resolutionMin: Math.floor(r() * 240),
  }));
}

export function buildAnalytics(alerts: Alert[]): AnalyticsSummary {
  const byTypeMap = new Map<string, number>();
  alerts.forEach((a) => byTypeMap.set(a.objectCategory, (byTypeMap.get(a.objectCategory) || 0) + 1));
  const colors = ["#EF4444", "#F59E0B", "#22C55E", "#0F4C81", "#A855F7", "#06B6D4", "#EC4899"];
  return {
    totalDetections: alerts.length,
    criticalIncidents: alerts.filter((a) => a.severity === "critical").length,
    detectionAccuracy: 98.6,
    uptime: 98.2,
    detectionsByType: Array.from(byTypeMap.entries()).slice(0, 6).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })),
    detectionsOverTime: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(5, 10),
      value: 30 + Math.floor(Math.sin(i) * 20 + Math.random() * 30),
    })),
    incidentsBySeverity: [
      { name: "Critical", value: alerts.filter((a) => a.severity === "critical").length },
      { name: "Warning", value: alerts.filter((a) => a.severity === "warning").length },
      { name: "Info", value: alerts.filter((a) => a.severity === "info").length },
    ],
    uptimeTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(5, 10),
      value: 96 + Math.random() * 4,
    })),
    byZone: ZONES.map((zone) => ({ zone, incidents: alerts.filter((a) => a.zone === zone).length })),
  };
}

// Singleton dataset
let _nodes: RailNode[] | null = null;
let _alerts: Alert[] | null = null;
let _trains: Train[] | null = null;
let _devices: Device[] | null = null;
let _reports: Report[] | null = null;
let _incidents: Incident[] | null = null;

export function getDataset() {
  if (!_nodes) {
    _nodes = generateNodes(500);
    _alerts = generateAlerts(1000);
    _trains = generateTrains(500);
    _devices = generateDevices(_nodes);
    _reports = generateReports(128);
    _incidents = generateIncidents(1000);
  }
  return { nodes: _nodes!, alerts: _alerts!, trains: _trains!, devices: _devices!, reports: _reports!, incidents: _incidents! };
}
