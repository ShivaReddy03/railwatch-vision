export type Role = "loco_driver" | "section_controller" | "maintenance" | "rpf" | "railway_board";

export const ROLES: { value: Role; label: string }[] = [
  { value: "loco_driver", label: "Loco Driver" },
  { value: "section_controller", label: "Section Controller" },
  { value: "maintenance", label: "Maintenance Team" },
  { value: "rpf", label: "RPF" },
  { value: "railway_board", label: "Railway Board" },
];

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  region?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export type Severity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  date: string;
  time: string;
  timestamp: string;
  zone: string;
  line: string;
  node: string;
  objectCategory: string;
  severity: Severity;
  confidence: number;
  status: AlertStatus;
  title: string;
  source: string;
  location: string;
  nearestTrain?: string;
  distanceKm?: number;
  etaSec?: number;
  imageUrl?: string;
  riskScore?: number;
}

export type TrainStatus = "safe" | "monitor" | "at_risk" | "delayed" | "on_time";

export interface Train {
  id: string;
  number: string;
  name: string;
  zone: string;
  line: string;
  from: string;
  to: string;
  alertId?: string | null;
  nodeId?: string | null;
  currentLocation: string;
  destination: string;
  speedKmh: number | null;
  etaMin: number | null;
  delayMin: number;
  status: TrainStatus;
  distanceFromIncidentKm?: number | null;
}

export type NodeStatus = "normal" | "warning" | "critical" | "offline";

export interface RailNode {
  id: string;
  zone: string;
  line: string;
  label: string;
  gps: { lat: number; lng: number };
  status: NodeStatus;
  cameraStatus: "online" | "offline" | "degraded";
  commStatus: "online" | "offline" | "degraded";
  powerStatus: "online" | "offline" | "degraded";
  health: number;
  lastSeen: string;
  currentAlertId?: string | null;
  activeAlert?: Alert;
}

export interface Device {
  id: string;
  name: string;
  nodeId: string;
  location: string;
  type: string;
  health: NodeStatus;
  status: "online" | "offline";
  lastSeen: string;
  sensors: { ok: number; warn: number; critical: number; offline: number };
  components: { name: string; status: NodeStatus; lastMaintenance: string }[];
}

export interface Report {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedOn: string;
  generatedBy: string;
  format: "PDF" | "Excel" | "CSV";
  sizeMb: number;
}

export interface Incident {
  id: string;
  type: string;
  date: string;
  zone: string;
  line: string;
  node: string;
  status: "open" | "resolved" | "investigating";
  resolutionMin?: number;
}

export interface AnalyticsSummary {
  totalDetections: number;
  criticalIncidents: number;
  detectionAccuracy: number;
  uptime: number;
  detectionsByType: { name: string; value: number; color: string }[];
  detectionsOverTime: { date: string; value: number }[];
  incidentsBySeverity: { name: string; value: number }[];
  uptimeTrend: { date: string; value: number }[];
  byZone: { zone: string; incidents: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
