import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/hooks";
import { StatCard } from "@/components/cards/StatCard";
import { Activity, AlertOctagon, Target, Cpu } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_app/analytics")({ component: AnalyticsPage });

const CHART_GRID = "oklch(0.32 0.04 260 / 0.4)";
const tooltipStyle = { background: "oklch(0.22 0.04 260)", border: "1px solid oklch(0.32 0.04 260)", borderRadius: 8, color: "white" } as const;

function AnalyticsPage() {
  const { data } = useAnalytics();

  return (
    <AppShell title="Analytics" subtitle="Insights and analytics from system data">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Detections" value={data?.totalDetections ?? 0} hint="+12.5% vs last 7 days" tone="success" />
        <StatCard icon={AlertOctagon} label="Critical Incidents" value={data?.criticalIncidents ?? 0} hint="-8.0% vs last 7 days" tone="critical" />
        <StatCard icon={Target} label="Detection Accuracy" value={`${data?.detectionAccuracy ?? 0}%`} hint="+2.3% vs last 7 days" tone="warning" />
        <StatCard icon={Cpu} label="System Uptime" value={`${data?.uptime ?? 0}%`} hint="+1.1% vs last 7 days" tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Detections Over Time</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.detectionsOverTime || []}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="oklch(0.72 0.18 150)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Detections by Type</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data?.detectionsByType || []} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {data?.detectionsByType.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Incidents by Severity</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.incidentsBySeverity || []}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data?.incidentsBySeverity.map((_, i) => <Cell key={i} fill={["#EF4444", "#F59E0B", "#3B82F6"][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">System Uptime (%)</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.uptimeTrend || []}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[90, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="oklch(0.65 0.18 230)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="text-sm font-semibold mb-3">Incidents by Zone</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data?.byZone || []}>
            <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
            <XAxis dataKey="zone" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="incidents" fill="oklch(0.55 0.16 245)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="text-sm font-semibold mb-3">AI Insights</div>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-2"><span className="text-warning">•</span> South Central Zone recorded the highest obstruction frequency during the last 90 days.</li>
          <li className="flex gap-2"><span className="text-critical">•</span> Node N-27 has experienced repeated incidents and requires additional monitoring.</li>
          <li className="flex gap-2"><span className="text-success">•</span> Detection accuracy improved 2.3% week-over-week across vision modules.</li>
        </ul>
      </div>
    </AppShell>
  );
}
