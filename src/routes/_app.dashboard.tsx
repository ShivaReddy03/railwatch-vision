import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/cards/StatCard";
import { AlertTriangle, Network, Train, Activity, Eye } from "lucide-react";
import { useDashboard, useNodes } from "@/hooks";
import { RailwayNetwork } from "@/components/railway-network/RailwayNetwork";
import { StatusBadge } from "@/components/StatusBadge";
import { IncidentCarousel } from "@/components/dashboard/IncidentCarousel";
import { ImageCarousel } from "@/components/dashboard/ImageCarousel";
import { useState } from "react";
import { AlertDetailSheet } from "@/components/alerts/AlertDetailSheet";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data } = useDashboard();
  const { data: nodes = [] } = useNodes();
  const criticalAlerts = data?.critical || [];
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  return (
    <AppShell title="Operations Dashboard" subtitle="Live overview of the network">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Active Alerts" value={data?.activeAlerts ?? "—"} hint={`Critical ${data?.criticalCount ?? 0} • Warning ${data?.warningCount ?? 0}`} tone="critical" />
        <StatCard icon={Network} label="Total Nodes" value={data?.totalNodes ?? "—"} hint={`Online ${data?.onlineNodes ?? 0}`} tone="info" />
        <StatCard icon={Train} label="Active Trains" value={data?.activeTrains ?? "—"} hint="On Network" tone="default" />
        <StatCard icon={Activity} label="System Health" value={`${data?.systemHealth ?? 0}%`} hint="All Systems Normal" tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <IncidentCarousel alerts={criticalAlerts} />
        </div>

        <div className="lg:col-span-3 glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Track Monitoring Overview</div>
          <RailwayNetwork 
            nodes={nodes} 
            onNodeClick={(n) => {
              if (n.currentAlertId) setSelectedAlertId(n.currentAlertId);
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <ImageCarousel alerts={criticalAlerts} />
        </div>

        <div className="lg:col-span-3 glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Affected Trains</div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="text-left border-b border-border">
                <th className="py-2">Train No.</th><th>Distance</th><th>ETA</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.affectedTrains?.map((t: import("@/types").Train) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="py-2.5 font-medium">{t.number}</td>
                  <td>{t.distanceFromIncidentKm} km</td>
                  <td>{t.etaMin} min</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDetailSheet alertId={selectedAlertId} onClose={() => setSelectedAlertId(null)} />
    </AppShell>
  );
}
