import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices, useNodesSummary } from "@/hooks";
import { StatCard } from "@/components/cards/StatCard";
import { Server, HeartPulse, AlertTriangle, XCircle, Search, Download, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Device } from "@/types";

export const Route = createFileRoute("/_app/devices")({ component: DevicesPage });

function DevicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Device | null>(null);
  const { data: summary } = useNodesSummary();
  const { data } = useDevices({ page, pageSize: 10, search });

  return (
    <AppShell title="Devices" subtitle="Monitor all devices and their health status">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server} label="Total Devices" value={summary?.total ?? 0} hint="All Locations" tone="info" />
        <StatCard icon={HeartPulse} label="Healthy" value={summary?.healthy ?? 0} hint={`${summary ? Math.round((summary.healthy / summary.total) * 100) : 0}%`} tone="success" />
        <StatCard icon={AlertTriangle} label="Warning" value={summary?.warning ?? 0} hint={`${summary ? Math.round((summary.warning / summary.total) * 100) : 0}%`} tone="warning" />
        <StatCard icon={XCircle} label="Critical" value={summary?.critical ?? 0} hint={`${summary ? Math.round((summary.critical / summary.total) * 100) : 0}%`} tone="critical" />
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search devices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Button variant="outline" size="sm"><Download className="size-4 mr-1" />Export</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr className="text-left">
                <th className="py-3 px-2">Device ID</th><th>Device Name</th><th>Location</th><th>Type</th><th>Health</th><th>Last Seen</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer" onClick={() => setSelected(d)}>
                  <td className="py-3 px-2 font-mono text-xs">{d.id}</td>
                  <td className="font-medium">{d.name}</td>
                  <td className="text-muted-foreground">{d.location}</td>
                  <td className="text-muted-foreground">{d.type}</td>
                  <td><StatusBadge status={d.health} /></td>
                  <td className="text-muted-foreground text-xs">{new Date(d.lastSeen).toLocaleString()}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td><Eye className="size-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">Showing {data ? (page - 1) * 10 + 1 : 0} of {data?.total ?? 0}</div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, Math.ceil((data?.total ?? 0) / 10)) }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>{selected.name}</SheetTitle></SheetHeader>
              <div className="space-y-3 mt-4 text-sm">
                <div className="text-xs text-muted-foreground">Components</div>
                {selected.components.map((c) => (
                  <div key={c.name} className="flex items-center justify-between border border-border rounded-md p-3">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">Last maintenance: {c.lastMaintenance}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
