import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useTrains, useTrainsSummary } from "@/hooks";
import { StatCard } from "@/components/cards/StatCard";
import { Train, Clock, AlertTriangle, Activity, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/trains")({ component: TrainsPage });

function TrainsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data: summary } = useTrainsSummary();
  const { data } = useTrains({ page, pageSize: 12, search, status });

  return (
    <AppShell title="Trains" subtitle="Track and monitor all active trains in real-time">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Train} label="Active Trains" value={summary?.active ?? 0} hint="On Network" tone="success" />
        <StatCard icon={Activity} label="Total Trains Today" value={summary?.total ?? 0} hint="All Trains" tone="info" />
        <StatCard icon={Clock} label="Delayed Trains" value={summary?.delayed ?? 0} hint="More than 10 min" tone="warning" />
        <StatCard icon={AlertTriangle} label="Trains At Risk" value={summary?.atRisk ?? 0} hint="Requires Attention" tone="critical" />
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search trains..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on_time">On Time</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="size-4 mr-1" />Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr className="text-left">
                <th className="py-3 px-2">Train No.</th><th>Train Name</th><th>Line</th><th>From</th><th>To</th><th>Speed</th><th>ETA</th><th>Delay</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-3 px-2 font-mono">{t.number}</td>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-muted-foreground">{t.line}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>{t.speedKmh} km/h</td>
                  <td>{t.etaMin} min</td>
                  <td className={t.delayMin > 0 ? "text-warning" : "text-success"}>{t.delayMin > 0 ? `+${t.delayMin} min` : "On Time"}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">Showing {data ? (page - 1) * 12 + 1 : 0} to {Math.min(page * 12, data?.total ?? 0)} of {data?.total ?? 0} trains</div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, Math.ceil((data?.total ?? 0) / 12)) }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
