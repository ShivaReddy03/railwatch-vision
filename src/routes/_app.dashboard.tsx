import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/cards/StatCard";
import { AlertTriangle, Network, Train, Activity, Eye } from "lucide-react";
import { useDashboard, useNodes } from "@/hooks";
import { RailwayNetwork } from "@/components/railway-network/RailwayNetwork";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import detectionImg from "@/assets/detection-rock.jpg";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data } = useDashboard();
  const { data: nodes = [] } = useNodes();
  const critical = data?.critical;

  return (
    <AppShell title="Operations Dashboard" subtitle="Live overview of the network">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Active Alerts" value={data?.activeAlerts ?? "—"} hint={`Critical ${data?.criticalCount ?? 0} • Warning ${data?.warningCount ?? 0}`} tone="critical" />
        <StatCard icon={Network} label="Total Nodes" value={data?.totalNodes ?? "—"} hint={`Online ${data?.onlineNodes ?? 0}`} tone="info" />
        <StatCard icon={Train} label="Active Trains" value={data?.activeTrains ?? "—"} hint="On Network" tone="default" />
        <StatCard icon={Activity} label="System Health" value={`${data?.systemHealth ?? 0}%`} hint="All Systems Normal" tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card rounded-xl p-5 border-critical/40">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-critical font-semibold">Critical Incident</div>
            <StatusBadge status="critical" />
          </div>
          {critical && (
            <>
              <div className="flex items-start gap-4 mt-4">
                <div className="size-14 rounded-full bg-critical/15 border border-critical/30 grid place-items-center">
                  <AlertTriangle className="size-7 text-critical" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{critical.objectCategory}</div>
                  <div className="text-sm text-muted-foreground">{critical.line} • Node {critical.node}</div>
                  <div className="text-xs text-muted-foreground mt-1">{critical.time} • {critical.date}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                <Metric label="Confidence" value={`${critical.confidence}%`} />
                <Metric label="Severity" value="Critical" tone="critical" />
                <Metric label="Risk Score" value={`${critical.riskScore}/100`} tone="critical" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Metric label="Nearest Train" value={critical.nearestTrain || "—"} />
                <Metric label="Distance" value={`${critical.distanceKm} km`} />
                <Metric label="ETA" value={`${Math.floor((critical.etaSec || 0) / 60)} min`} />
              </div>
              <Button className="w-full mt-5 bg-critical hover:bg-critical/90 text-critical-foreground">
                View Full Details
              </Button>
            </>
          )}
        </motion.div>

        <div className="lg:col-span-3 glass-card rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Track Monitoring Overview</div>
          <RailwayNetwork nodes={nodes} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Detection Image</div>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="size-3" /> Live</span>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={detectionImg} alt="Detected rock on track" className="w-full h-56 object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-critical/90 text-critical-foreground text-xs font-bold">Rock 98%</div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
            <Detail label="Object" value="Rock" />
            <Detail label="Confidence" value="98%" />
            <Detail label="Node" value={critical?.node || "—"} />
            <Detail label="Track" value={critical?.line.split(" ")[0] || "—"} />
          </div>
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
    </AppShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "critical" }) {
  return (
    <div className="rounded-lg bg-card/50 border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-base font-bold ${tone === "critical" ? "text-critical" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div><div className="text-muted-foreground">{label}</div><div className="font-semibold text-foreground">{value}</div></div>;
}
