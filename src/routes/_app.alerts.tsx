import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAlerts, useAlertsSummary } from "@/hooks";
import { StatCard } from "@/components/cards/StatCard";
import { AlertTriangle, AlertCircle, Info, Bell, Search, Filter, Download, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Alert } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDetailSheet } from "@/components/alerts/AlertDetailSheet";

export const Route = createFileRoute("/_app/alerts")({ component: AlertsPage });

function AlertsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Alert | null>(null);

  const { data: summary } = useAlertsSummary();
  const { data, isLoading } = useAlerts({ page, pageSize: 10, search, severity, status });

  return (
    <AppShell title="Alerts" subtitle="Monitor and manage all system alerts">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertCircle} label="Critical" value={summary?.critical ?? 0} hint="Needs Immediate Action" tone="critical" />
        <StatCard icon={AlertTriangle} label="Warning" value={summary?.warning ?? 0} hint="Requires Attention" tone="warning" />
        <StatCard icon={Info} label="Info" value={summary?.info ?? 0} hint="For Information Only" tone="info" />
        <StatCard icon={Bell} label="Total Alerts" value={summary?.total ?? 0} hint="All Time" tone="default" />
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search alerts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Filter className="size-4 mr-1" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="size-4 mr-1" />Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr className="text-left">
                <th className="py-3 px-2">Alert ID</th><th>Type</th><th>Severity</th><th>Title</th><th>Source</th><th>Location</th><th>Time</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Loading...</td></tr>}
              {data?.data.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer" onClick={() => setSelected(a)}>
                  <td className="py-3 px-2 font-mono text-xs">{a.id}</td>
                  <td>{a.objectCategory}</td>
                  <td><StatusBadge status={a.severity} /></td>
                  <td className="max-w-xs truncate">{a.title}</td>
                  <td className="text-muted-foreground">{a.source}</td>
                  <td className="text-muted-foreground">{a.location}</td>
                  <td className="text-muted-foreground"><div>{a.time}</div><div className="text-[10px]">{a.date}</div></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelected(a); }}><Eye className="size-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            Showing {data ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, data?.total ?? 0)} of {data?.total ?? 0}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, Math.ceil((data?.total ?? 0) / 10)) }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
          </div>
        </div>
      </div>

      <AlertDetailSheet alertId={selected?.id || null} onClose={() => setSelected(null)} />
    </AppShell>
  );
}
