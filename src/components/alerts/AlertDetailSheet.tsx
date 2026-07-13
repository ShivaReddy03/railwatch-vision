import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useAcknowledgeAlert, useEscalateAlert, useExportAlert, useAlert } from "@/hooks";

interface AlertDetailSheetProps {
  alertId: string | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}

export function AlertDetailSheet({ alertId, onClose }: AlertDetailSheetProps) {
  const { data: selected, isLoading } = useAlert(alertId || undefined);
  const ack = useAcknowledgeAlert();
  const escalate = useEscalateAlert();
  const exportAlert = useExportAlert();

  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [escalateTeam, setEscalateTeam] = useState("");
  const [escalateNote, setEscalateNote] = useState("");

  return (
    <>
      <Sheet open={!!alertId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {isLoading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
        {selected && !isLoading && (
          <>
            <SheetHeader>
              <SheetTitle>{selected.title}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <img src={selected.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg border border-border" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Alert ID" value={selected.id} />
                <Field label="Severity" value={selected.severity} />
                <Field label="Confidence" value={`${selected.confidence}%`} />
                <Field label="Status" value={selected.status} />
                <Field label="Zone" value={selected.zone} />
                <Field label="Line" value={selected.line} />
                <Field label="Node" value={selected.node} />
                <Field label="Source" value={selected.source} />
                <Field label="Nearest Train" value={selected.nearestTrain || "—"} />
                <Field label="Distance" value={`${selected.distanceKm} km`} />
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  className="flex-1"
                  disabled={ack.isPending}
                  onClick={() => ack.mutate(selected.id, {
                    onSuccess: (r) => { toast.success(r.message); onClose(); },
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
                      onClose(); 
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
    </>
  );
}
