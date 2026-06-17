import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "critical" | "info";
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-primary bg-primary/10 border-primary/20",
  success: "text-success bg-success/10 border-success/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  critical: "text-critical bg-critical/10 border-critical/20",
  info: "text-info bg-info/10 border-info/20",
};

export function StatCard({ icon: Icon, label, value, hint, tone = "default" }: Props) {
  return (
    <div className="glass-card rounded-xl p-5 flex items-center gap-4">
      <div className={cn("size-12 rounded-lg grid place-items-center border", TONE[tone])}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
