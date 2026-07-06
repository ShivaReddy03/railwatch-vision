import { Link, useRouterState } from "@tanstack/react-router";
import { Home, AlertTriangle, BarChart3, HardDrive, Settings, Activity, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import type { Role } from "@/types";
import logo from "../../assets/railoptic-logo.png";

const ALL_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/devices", label: "Devices", icon: HardDrive },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const ROLE_MENU: Record<Role, string[]> = {
  loco_driver: ["/dashboard", "/alerts", "/settings"],
  section_controller: ["/dashboard", "/alerts", "/analytics", "/devices", "/settings"],
  maintenance: ["/dashboard", "/alerts", "/devices", "/settings"],
  rpf: ["/dashboard", "/alerts", "/analytics", "/settings"],
  railway_board: ["/dashboard", "/alerts", "/analytics", "/devices", "/settings"],
};

export function Sidebar() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const allowed = user ? ROLE_MENU[user.role] : [];
  const items = ALL_ITEMS.filter((i) => allowed.includes(i.to));

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary/15 grid place-items-center">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-bold tracking-wide text-warning text-lg leading-none">RAILOPTIC</div>
            <div className="text-[10px] text-muted-foreground mt-1">AI-Powered Way Object Detection</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active
                  ? "bg-primary/15 text-primary font-medium border border-primary/30"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
            >
              <Icon className="size-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-3 border-t border-sidebar-border">
        <div className="rounded-lg bg-card/60 p-3 border border-border">
          <div className="text-xs text-muted-foreground">System Time</div>
          <div className="text-xl font-mono font-semibold text-foreground tabular-nums">
            {now.toTimeString().slice(0, 8)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
    </aside>
  );
}
