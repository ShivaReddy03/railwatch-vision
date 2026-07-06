import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

  return (
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
                  onClick={() => {
                    const note = window.prompt("Escalation note:") || "";
                    if (!note) return;
                    escalate.mutate({ id: selected.id, note }, {
                      onSuccess: (r) => { toast.success(r.message); onClose(); },
                      onError: () => toast.error("Failed to escalate"),
                    });
                  }}
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
  );
}
