import type { RailNode } from "@/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const STATUS_DOT: Record<string, string> = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical animate-pulse",
  offline: "bg-muted-foreground/50",
};

interface Props { nodes: RailNode[]; onNodeClick?: (n: RailNode) => void }

export function RailwayNetwork({ nodes, onNodeClick }: Props) {
  const byLine = useMemo(() => {
    const m = new Map<string, RailNode[]>();
    nodes.forEach((n) => {
      const arr = m.get(n.line) || [];
      arr.push(n);
      m.set(n.line, arr);
    });
    return Array.from(m.entries()).slice(0, 4);
  }, [nodes]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <Legend color="bg-success" label="Normal" />
        <Legend color="bg-warning" label="Warning" />
        <Legend color="bg-critical" label="Critical" />
        <Legend color="bg-muted-foreground/50" label="Offline" />
      </div>
      {byLine.map(([line, ns]) => (
        <div key={line}>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{line}</div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
            <div className="relative flex justify-between items-center px-2">
              {ns.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => onNodeClick?.(n)}
                  className="group flex flex-col items-center gap-1"
                  title={`${n.id} - ${n.status}`}
                >
                  <span className={cn("size-4 rounded-full ring-4 ring-background transition-transform group-hover:scale-125", STATUS_DOT[n.status])} />
                  <span className="text-[10px] text-muted-foreground">{n.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", color)} />{label}</span>;
}
