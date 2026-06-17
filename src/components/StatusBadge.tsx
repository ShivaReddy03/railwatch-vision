import { cn } from "@/lib/utils";
import type { NodeStatus } from "@/types";

interface Props { status: NodeStatus | "active" | "acknowledged" | "resolved" | "safe" | "monitor" | "at_risk" | "delayed" | "on_time" | "online" | "offline"; label?: string }

const MAP: Record<string, string> = {
  normal: "bg-success-soft",
  online: "bg-success-soft",
  warning: "bg-warning-soft",
  critical: "bg-critical-soft",
  offline: "bg-muted text-muted-foreground",
  active: "bg-critical-soft",
  acknowledged: "bg-warning-soft",
  resolved: "bg-success-soft",
  safe: "bg-success-soft",
  monitor: "bg-warning-soft",
  at_risk: "bg-critical-soft",
  on_time: "bg-success-soft",
  delayed: "bg-warning-soft",
};

export function StatusBadge({ status, label }: Props) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", MAP[status] || "bg-muted")}>
      {label || status.replace(/_/g, " ")}
    </span>
  );
}
