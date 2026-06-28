import { USE_MOCK, apiClient, TOKEN_KEY, REFRESH_KEY } from "./api/client";
import { getDataset, buildAnalytics } from "./mock/generators";
import type { AuthResponse, Role, User, Alert, Train, RailNode, Device, Report, Incident, AnalyticsSummary, PaginatedResponse } from "@/types";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

// ---------------- AUTH ----------------
export const authService = {
  async login(username: string, password: string, role: Role): Promise<AuthResponse> {
    if (0==0) {
      await delay(500);
      const user: User = {
        id: `u_${role}`,
        name: username || "Operator",
        username: username || "operator",
        role,
        region: role === "section_controller" || role === "maintenance" ? "South Central" : undefined,
      };
      const res: AuthResponse = { access_token: `mock.${role}.${Date.now()}`, refresh_token: `refresh.${Date.now()}`, user };
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(REFRESH_KEY, res.refresh_token);
      localStorage.setItem("railoptic_user", JSON.stringify(user));
      return res;
    }
    const { data } = await apiClient.post<AuthResponse>("/auth/login", { username, password, role });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem("railoptic_user", JSON.stringify(data.user));
    return data;
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("railoptic_user");
  },
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("railoptic_user");
    return raw ? (JSON.parse(raw) as User) : null;
  },
};

interface ListParams { page?: number; pageSize?: number; search?: string; status?: string; zone?: string; line?: string; severity?: string }

function filterByRegion<T extends { zone?: string }>(items: T[], user: User | null): T[] {
  if (!user) return items;
  if (user.role === "section_controller" || user.role === "maintenance") {
    return items.filter((i) => i.zone === user.region);
  }
  return items;
}

// ---------------- ALERTS ----------------
export const alertsService = {
  async list(params: ListParams = {}): Promise<PaginatedResponse<Alert>> {
    if (USE_MOCK) {
      await delay(200);
      let items = getDataset().alerts;
      items = filterByRegion(items, authService.getCurrentUser());
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter((a) => a.id.toLowerCase().includes(q) || a.objectCategory.toLowerCase().includes(q) || a.node.toLowerCase().includes(q));
      }
      if (params.status && params.status !== "all") items = items.filter((a) => a.status === params.status);
      if (params.severity && params.severity !== "all") items = items.filter((a) => a.severity === params.severity);
      if (params.zone && params.zone !== "all") items = items.filter((a) => a.zone === params.zone);
      return paginate(items, params.page || 1, params.pageSize || 10);
    }
    const { data } = await apiClient.get<PaginatedResponse<Alert>>("/alerts", { params });
    return data;
  },
  async getById(id: string): Promise<Alert | undefined> {
    if (USE_MOCK) { await delay(150); return getDataset().alerts.find((a) => a.id === id); }
    const { data } = await apiClient.get<Alert>(`/alerts/${id}`);
    return data;
  },
  async summary() {
    if (USE_MOCK) {
      await delay(100);
      const a = filterByRegion(getDataset().alerts, authService.getCurrentUser()).filter((x) => x.status === "active");
      return {
        active: a.length,
        critical: a.filter((x) => x.severity === "critical").length,
        warning: a.filter((x) => x.severity === "warning").length,
        info: a.filter((x) => x.severity === "info").length,
        total: getDataset().alerts.length,
      };
    }
    const { data } = await apiClient.get("/alerts/summary");
    return data as { active: number; critical: number; warning: number; info: number; total: number };
  },
  async acknowledge(id: string): Promise<{ message: string }> {
    if (USE_MOCK) { await delay(150); return { message: "Alert acknowledged" }; }
    const { data } = await apiClient.post<{ message: string }>(`/alerts/${id}/acknowledge`);
    return data;
  },
  async escalate(id: string, note: string): Promise<{ message: string; note: string }> {
    if (USE_MOCK) { await delay(150); return { message: "Alert escalated", note }; }
    const { data } = await apiClient.post<{ message: string; note: string }>(`/alerts/${id}/escalate`, { note });
    return data;
  },
  async exportAlert(id: string, format: "pdf" | "csv" = "pdf"): Promise<{ message: string }> {
    if (USE_MOCK) { await delay(150); return { message: `Export placeholder for ${id} as ${format}` }; }
    const { data } = await apiClient.get<{ message: string }>(`/alerts/${id}/export`, { params: { format } });
    return data;
  },
};


// ---------------- TRAINS ----------------
export const trainService = {
  async list(params: ListParams = {}): Promise<PaginatedResponse<Train>> {
    const { data } = await apiClient.get<PaginatedResponse<Train>>("/trains", { params });
    return data;
  },
  async summary() {
    const { data } = await apiClient.get("/trains/summary");
    return data as { active: number; delayed: number; atRisk: number; total: number };
  },
};

// ---------------- NODES ----------------
export const nodeService = {
  async list(): Promise<RailNode[]> {
    if (USE_MOCK) { await delay(150); return filterByRegion(getDataset().nodes, authService.getCurrentUser()); }
    const { data } = await apiClient.get<RailNode[]>("/nodes");
    return data;
  },
  async summary() {
    if (USE_MOCK) {
      await delay(100);
      const n = filterByRegion(getDataset().nodes, authService.getCurrentUser());
      return {
        total: n.length,
        online: n.filter((x) => x.status !== "offline").length,
        healthy: n.filter((x) => x.status === "normal").length,
        warning: n.filter((x) => x.status === "warning").length,
        critical: n.filter((x) => x.status === "critical").length,
        offline: n.filter((x) => x.status === "offline").length,
      };
    }
    const { data } = await apiClient.get("/nodes/summary");
    return data as { total: number; online: number; healthy: number; warning: number; critical: number; offline: number };
  },
};

// ---------------- DEVICES ----------------
export const deviceService = {
  async list(params: ListParams = {}): Promise<PaginatedResponse<Device>> {
    if (USE_MOCK) {
      await delay(200);
      let items = getDataset().devices;
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter((d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
      }
      return paginate(items, params.page || 1, params.pageSize || 10);
    }
    const { data } = await apiClient.get<PaginatedResponse<Device>>("/devices", { params });
    return data;
  },
};

// ---------------- REPORTS ----------------
export const reportsService = {
  async list(params: ListParams = {}): Promise<PaginatedResponse<Report>> {
    const { data } = await apiClient.get<PaginatedResponse<Report>>("/reports", { params });
    return data;
  },
  async summary() {
    const { data } = await apiClient.get("/reports/summary");
    return data as { total: number; scheduled: number; manual: number; exportedGb: number };
  },
};

// ---------------- INCIDENTS ----------------
export const incidentService = {
  async list(): Promise<Incident[]> {
    if (USE_MOCK) { await delay(150); return getDataset().incidents; }
    const { data } = await apiClient.get<Incident[]>("/incidents");
    return data;
  },
};

// ---------------- ANALYTICS ----------------
export const analyticsService = {
  async summary(): Promise<AnalyticsSummary> {
    if (USE_MOCK) {
      await delay(250);
      return buildAnalytics(filterByRegion(getDataset().alerts, authService.getCurrentUser()));
    }
    const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
    return data;
  },
};

// ---------------- DASHBOARD ----------------
export const dashboardService = {
  async overview() {
    if (USE_MOCK) {
      await delay(150);
      const ds = getDataset();
      const user = authService.getCurrentUser();
      const alerts = filterByRegion(ds.alerts, user).filter((a) => a.status === "active");
      const nodes = filterByRegion(ds.nodes, user);
      const trains = filterByRegion(ds.trains, user);
      const critical = alerts.filter((a) => a.severity === "critical" || a.severity === "warning");
      return {
        // keep typed
        activeAlerts: alerts.length,
        criticalCount: critical.length,
        warningCount: alerts.filter((a) => a.severity === "warning").length,
        totalNodes: nodes.length,
        onlineNodes: nodes.filter((n) => n.status !== "offline").length,
        activeTrains: trains.length,
        systemHealth: 98,
        critical,
        affectedTrains: trains.slice(0, 5),
      };
    }
    const { data } = await apiClient.get("/dashboard/overview");
    return data;
  },
};
