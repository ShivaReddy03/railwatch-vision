import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/app/auth/AuthContext";
import { useAlerts, useAcknowledgeAlert } from "@/hooks";
import { useState } from "react";
import type { Alert } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Clock, MapPin, AlertCircle, RefreshCw, Activity } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/action-desk")({
  component: ActionDeskPage,
});

function ActionDeskPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Alert | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading, refetch, isRefetching } = useAlerts({ 
    escalated_to: user?.role, 
    status: "active",
    pageSize: 50 // Fetch a good chunk for the inbox
  });

  const ack = useAcknowledgeAlert();

  const handleAction = () => {
    if (!selected) return;
    ack.mutate(selected.id, {
      onSuccess: () => {
        toast.success(`Action recorded for ${selected.id}`);
        setNote("");
        setSelected(null);
      },
      onError: () => toast.error("Failed to record action"),
    });
  };

  return (
    <AppShell 
      title={`${user?.role === 'rpf' ? 'RPF' : 'Maintenance'} Action Desk`} 
      subtitle="Your active escalated alerts queue"
    >
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`size-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Left Pane: Inbox List */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading && <div className="text-sm text-muted-foreground p-4">Loading queue...</div>}
          
          {!isLoading && data?.data.length === 0 && (
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center rounded-xl">
              <CheckCircle2 className="size-8 text-success mb-2" />
              <div className="font-medium">All Caught Up</div>
              <div className="text-xs text-muted-foreground mt-1">No active escalated alerts.</div>
            </div>
          )}

          {data?.data.map((alert) => (
            <div 
              key={alert.id}
              onClick={() => setSelected(alert)}
              className={`glass-card p-4 rounded-xl cursor-pointer transition-all border ${
                selected?.id === alert.id ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-transparent hover:border-border'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={alert.severity} />
                <span className="text-[10px] text-muted-foreground">{alert.time}</span>
              </div>
              <div className="font-medium text-sm leading-tight mb-2">{alert.title}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span className="truncate">{alert.location}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Pane: Detail View */}
        <div className="md:col-span-8 lg:col-span-9 h-full">
          {selected ? (
            <div className="glass-card rounded-2xl h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-border bg-card/40">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{selected.id}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {selected.date} {selected.time}</span>
                    </div>
                  </div>
                  <StatusBadge status={selected.severity} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selected.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img src={selected.imageUrl} alt="Incident" className="w-full max-h-[300px] object-cover" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailBlock label="Zone" value={selected.zone} />
                  <DetailBlock label="Line" value={selected.line} />
                  <DetailBlock label="Node" value={selected.node} />
                  <DetailBlock label="Category" value={selected.objectCategory} />
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                    <AlertCircle className="size-4" />
                    Escalation Details
                  </div>
                  <div className="text-sm">
                    This alert was escalated to your team at <span className="font-medium">{selected.escalatedAt ? new Date(selected.escalatedAt).toLocaleString() : "Unknown time"}</span>. Immediate action is required.
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Action Notes</label>
                  <Textarea 
                    placeholder="Enter details about your response, dispatch info, or resolution..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border bg-card/40 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelected(null)}>Deselect</Button>
                <Button 
                  onClick={handleAction} 
                  disabled={ack.isPending}
                >
                  {ack.isPending ? "Processing..." : "Acknowledge & Update"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <Activity className="size-12 mb-4 opacity-20" />
              <div className="text-lg font-medium">No Alert Selected</div>
              <p className="text-sm mt-1 max-w-sm text-center">
                Select an alert from your inbox queue on the left to view details and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-accent/30 rounded-lg p-3">
      <div className="text-[10px] uppercase text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
