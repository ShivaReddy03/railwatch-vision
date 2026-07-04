import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { ROLES } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleLabel = ROLES.find((r) => r.value === user?.role)?.label || user?.role;


  return (
    <header className="h-16 border-b border-border bg-background/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <div className="text-sm text-muted-foreground">Welcome back</div>
        <div className="text-foreground font-semibold">{user?.name}</div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative size-9 grid place-items-center rounded-md hover:bg-accent transition-colors">
          <Bell className="size-5 text-muted-foreground" />
          {summary && summary.active > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-critical text-critical-foreground text-[10px] font-bold grid place-items-center">
              {summary.active}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
            <div className="size-9 rounded-full bg-primary/20 grid place-items-center border border-primary/30">
              <UserIcon className="size-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground leading-tight">{user?.name}</div>
              <div className="text-xs text-muted-foreground leading-tight">{roleLabel}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{roleLabel}</div>
              {user?.region && <div className="text-xs text-muted-foreground">{user.region}</div>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="text-critical"
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
