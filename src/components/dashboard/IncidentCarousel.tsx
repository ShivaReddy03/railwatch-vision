import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcknowledgeAlert, useEscalateAlert, useExportAlert } from "@/hooks";
import { toast } from "sonner";
import type { Alert } from "@/types";

export function IncidentCarousel({ alerts, index, onIndexChange, isPaused }: { alerts: any[]; index?: number; onIndexChange?: (i: number) => void; isPaused?: boolean }) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = index ?? internalIndex;
  const setIndex = (updater: (prev: number) => number) => {
    if (onIndexChange) onIndexChange(updater(currentIndex));
    else setInternalIndex(updater);
  };
  const [key, setKey] = useState(0);
  const [selected, setSelected] = useState<Alert | null>(null);
  
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [escalateTeam, setEscalateTeam] = useState("");
  const [escalateNote, setEscalateNote] = useState("");

  const ack = useAcknowledgeAlert();
  const escalate = useEscalateAlert();
  const exportAlert = useExportAlert();

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % alerts.length);
    setKey((k) => k + 1);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
    setKey((k) => k + 1);
  };


  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 border-border flex flex-col items-center justify-center text-muted-foreground h-full min-h-[300px]">
        <AlertTriangle className="size-10 opacity-20 mb-3" />
        <p className="text-sm font-medium">No active critical incidents</p>
        <p className="text-xs opacity-70 mt-1">All systems are normal</p>
      </div>
    );
  }

  const alert = alerts[currentIndex];
  const hasMultiple = alerts.length > 1;

  const toneConfig = {
    critical: {
      border: "border-critical/40",
      svgStroke: "var(--color-critical)",
      bgSoft: "bg-critical/15",
      borderSoft: "border-critical/30",
      text: "text-critical",
      bgSolid: "bg-critical hover:bg-critical/90",
      textSolid: "text-critical-foreground",
      title: "Critical Incident"
    },
    warning: {
      border: "border-warning/40",
      svgStroke: "var(--color-warning)",
      bgSoft: "bg-warning/15",
      borderSoft: "border-warning/30",
      text: "text-warning",
      bgSolid: "bg-warning hover:bg-warning/90",
      textSolid: "text-warning-foreground",
      title: "Warning Incident"
    }
  };

  const style = toneConfig[alert.severity as keyof typeof toneConfig] || toneConfig.critical;

  return (
    <motion.div 
      className={`relative glass-card rounded-xl overflow-hidden h-full min-h-[360px] flex flex-col group ${style.border}`}
      animate={alert.severity === 'critical' ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    >
      {hasMultiple && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <rect
            x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
            rx="11" ry="11"
            fill="none"
            stroke={style.svgStroke}
            strokeWidth="2"
            opacity="0.15"
          />
          <rect
            key={key}
            x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
            rx="11" ry="11"
            fill="none"
            stroke={style.svgStroke}
            strokeWidth="2"
            pathLength="100"
            className="carousel-progress"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            onAnimationEnd={handleNext}
          />
        </svg>
      )}

      {hasMultiple && (
        <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
          <div className="text-xs text-muted-foreground mr-2 font-medium">
            {currentIndex + 1} / {alerts.length}
          </div>
          <button onClick={handlePrev} className="p-1 rounded-md bg-background/20 hover:bg-background/50 backdrop-blur-sm transition-colors text-foreground">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={handleNext} className="p-1 rounded-md bg-background/20 hover:bg-background/50 backdrop-blur-sm transition-colors text-foreground">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col relative z-10 h-full">
        <div className="flex items-center gap-3 h-6">
          <div className={`text-xs uppercase tracking-wider font-semibold ${style.text}`}>{style.title}</div>
          <StatusBadge status={alert.severity} />
        </div>

        <div className="flex-1 relative mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className={`size-14 rounded-full border grid place-items-center shrink-0 ${style.bgSoft} ${style.borderSoft}`}>
                  <AlertTriangle className={`size-7 ${style.text}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{alert.objectCategory}</div>
                  <div className="text-sm text-muted-foreground">{alert.line} • Node {alert.node}</div>
                  <div className="text-xs text-muted-foreground mt-1">{alert.time} • {alert.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <Metric label="Confidence" value={`${alert.confidence}%`} />
                <Metric label="Severity" value={alert.severity === 'critical' ? 'Critical' : 'Warning'} tone={alert.severity as any} />
                <Metric label="Risk Score" value={`${alert.riskScore}/100`} tone={alert.severity as any} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <Metric label="Nearest Train" value={alert.nearestTrain || "—"} />
                <Metric label="Distance" value={`${alert.distanceKm} km`} />
                <Metric label="ETA" value={`${Math.floor((alert.etaSec || 0) / 60)} min`} />
              </div>

              <div className="mt-auto pt-5">
                <Button 
                  className={`w-full ${style.bgSolid} ${style.textSolid}`}
                  onClick={() => setSelected(alert)}
                >
                  View Full Details
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title || `${selected.objectCategory} at Node ${selected.node}`}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <img src={selected.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg border border-border" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Alert ID" value={selected.id} />
                  <Field label="Severity" value={selected.severity} />
                  <Field label="Confidence" value={`${selected.confidence}%`} />
                  <Field label="Status" value={selected.status} />
                  <Field label="Zone" value={selected.zone || "—"} />
                  <Field label="Line" value={selected.line || "—"} />
                  <Field label="Node" value={selected.node || "—"} />
                  <Field label="Source" value={selected.source || "Camera System"} />
                  <Field label="Nearest Train" value={selected.nearestTrain || "—"} />
                  <Field label="Distance" value={selected.distanceKm ? `${selected.distanceKm} km` : "—"} />
                </div>
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    className="flex-1"
                    disabled={ack.isPending}
                    onClick={() => ack.mutate(selected.id, {
                      onSuccess: (r) => { toast.success(r.message); setSelected(null); },
                      onError: () => toast.error("Failed to acknowledge"),
                    })}
                  >
                    {ack.isPending ? "Acknowledging..." : "Acknowledge"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={escalate.isPending}
                    onClick={() => setIsEscalateOpen(true)}
                  >
                    Escalate
                  </Button>
                  <Button
                    variant="outline"
                    disabled={exportAlert.isPending}
                    onClick={() => exportAlert.mutate({ id: selected.id, format: "pdf" }, {
                      onSuccess: (r) => toast.success(r.message),
                      onError: () => toast.error("Failed to export"),
                    })}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isEscalateOpen} onOpenChange={setIsEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Alert</DialogTitle>
            <DialogDescription>
              Route this alert to a specialized team for immediate action.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Target Team</Label>
              <Select value={escalateTeam} onValueChange={setEscalateTeam}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rpf">Railway Protection Force (RPF)</SelectItem>
                  <SelectItem value="maintenance">Maintenance Team</SelectItem>
                  <SelectItem value="both">Both (RPF & Maintenance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Note (Optional)</Label>
              <Textarea 
                placeholder="Add context or instructions for the team..." 
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsEscalateOpen(false)}>Cancel</Button>
            <Button 
              disabled={!escalateTeam || escalate.isPending}
              onClick={() => {
                if (selected) {
                  escalate.mutate({ id: selected.id, targetTeam: escalateTeam, note: escalateNote }, {
                    onSuccess: (r) => { 
                      toast.success(r.message); 
                      setIsEscalateOpen(false);
                      setEscalateTeam("");
                      setEscalateNote("");
                      setSelected(null); 
                    },
                    onError: () => toast.error("Failed to escalate"),
                  });
                }
              }}
            >
              {escalate.isPending ? "Escalating..." : "Confirm Escalation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "critical" | "warning" }) {
  return (
    <div className="rounded-lg bg-card/50 border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-base font-bold ${tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="border border-border rounded-md p-2"><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className="font-medium capitalize">{value}</div></div>;
}
